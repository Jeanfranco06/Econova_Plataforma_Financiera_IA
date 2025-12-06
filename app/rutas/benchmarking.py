from flask import Blueprint, request, jsonify
from app.modelos.benchmarking import (
    Benchmarking_Grupo,
    Usuario_Benchmarking,
    BenchmarkingService,
)
from app.modelos.logro import Ranking
from app.utils.exportar import GoogleSheetsExporter, ExcelExporter

bp_benchmarking = Blueprint("benchmarking", __name__, url_prefix="/api/v1/benchmarking")


@bp_benchmarking.route("/benchmarking/grupos", methods=["GET"])
def listar_grupos_benchmarking():
    """Listar todos los grupos de benchmarking"""
    try:
        grupos = Benchmarking_Grupo.listar_grupos()
        return jsonify(
            {"success": True, "grupos": [grupo.to_dict() for grupo in grupos]}
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp_benchmarking.route("/benchmarking/grupos", methods=["POST"])
def crear_grupo_benchmarking():
    """Crear un nuevo grupo de benchmarking"""
    try:
        data = request.get_json()
        nombre_grupo = data.get("nombre_grupo")
        descripcion = data.get("descripcion", "")

        if not nombre_grupo:
            return jsonify(
                {"success": False, "error": "Nombre del grupo requerido"}
            ), 400

        grupo_id = Benchmarking_Grupo.crear_grupo(nombre_grupo, descripcion)

        if grupo_id:
            return jsonify(
                {
                    "success": True,
                    "message": "Grupo creado exitosamente",
                    "grupo_id": grupo_id,
                }
            ), 201
        return jsonify({"success": False, "error": "Error creando grupo"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp_benchmarking.route("/benchmarking/grupos/<int:benchmarking_id>", methods=["GET"])
def obtener_grupo_benchmarking(benchmarking_id):
    """Obtener información de un grupo específico"""
    try:
        grupo = Benchmarking_Grupo.obtener_grupo_por_id(benchmarking_id)
        if grupo:
            # Obtener usuarios del grupo
            usuarios = Usuario_Benchmarking.obtener_usuarios_en_grupo(benchmarking_id)
            return jsonify(
                {
                    "success": True,
                    "grupo": grupo.to_dict(),
                    "usuarios": [usuario.to_dict() for usuario in usuarios],
                }
            )
        return jsonify({"success": False, "error": "Grupo no encontrado"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp_benchmarking.route(
    "/benchmarking/grupos/<int:benchmarking_id>/usuarios", methods=["POST"]
)
def agregar_usuario_a_grupo(benchmarking_id):
    """Agregar un usuario a un grupo de benchmarking"""
    try:
        data = request.get_json()
        usuario_id = data.get("usuario_id")

        if not usuario_id:
            return jsonify({"success": False, "error": "ID de usuario requerido"}), 400

        success = Usuario_Benchmarking.agregar_usuario_a_grupo(
            usuario_id, benchmarking_id
        )

        if success:
            return jsonify(
                {"success": True, "message": "Usuario agregado al grupo exitosamente"}
            )
        return jsonify(
            {"success": False, "error": "Error agregando usuario al grupo"}
        ), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp_benchmarking.route(
    "/benchmarking/grupos/<int:benchmarking_id>/usuarios/<int:usuario_id>",
    methods=["DELETE"],
)
def remover_usuario_de_grupo(benchmarking_id, usuario_id):
    """Remover un usuario de un grupo de benchmarking"""
    try:
        success = Usuario_Benchmarking.remover_usuario_de_grupo(
            usuario_id, benchmarking_id
        )

        if success:
            return jsonify(
                {"success": True, "message": "Usuario removido del grupo exitosamente"}
            )
        return jsonify(
            {"success": False, "error": "Error removiendo usuario del grupo"}
        ), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp_benchmarking.route(
    "/usuarios/<int:usuario_id>/benchmarking/grupos", methods=["GET"]
)
def obtener_grupos_usuario(usuario_id):
    """Obtener grupos de benchmarking de un usuario"""
    try:
        grupos = Usuario_Benchmarking.obtener_grupos_usuario(usuario_id)
        return jsonify(
            {"success": True, "grupos": [grupo.to_dict() for grupo in grupos]}
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp_benchmarking.route("/benchmarking/comparar", methods=["GET"])
def comparar_con_grupo():
    """Comparar rendimiento de un usuario con su grupo"""
    try:
        usuario_id = request.args.get("usuario_id", type=int)
        indicador = request.args.get("indicador")
        benchmarking_id = request.args.get("benchmarking_id", type=int)

        if not usuario_id or not indicador:
            return jsonify(
                {"success": False, "error": "Usuario ID e indicador requeridos"}
            ), 400

        comparacion = BenchmarkingService.comparar_con_grupo(
            usuario_id, indicador, benchmarking_id
        )

        if comparacion:
            return jsonify({"success": True, "comparacion": comparacion})
        return jsonify({"success": False, "error": "Error obteniendo comparación"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp_benchmarking.route(
    "/benchmarking/grupos/<int:benchmarking_id>/estadisticas", methods=["GET"]
)
def obtener_estadisticas_grupo(benchmarking_id):
    """Obtener estadísticas de un grupo para un indicador"""
    try:
        indicador = request.args.get("indicador")

        if not indicador:
            return jsonify({"success": False, "error": "Indicador requerido"}), 400

        stats = BenchmarkingService.obtener_estadisticas_grupo(
            benchmarking_id, indicador
        )

        if stats:
            return jsonify({"success": True, "estadisticas": stats})
        return jsonify(
            {"success": False, "error": "No se encontraron estadísticas"}
        ), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp_benchmarking.route("/ranking/<sector>", methods=["GET"])
def obtener_ranking_sector(sector):
    """Obtener ranking de un sector específico"""
    try:
        limite = request.args.get("limite", 10, type=int)
        rankings = Ranking.obtener_ranking_sector(sector, limite)

        return jsonify({"success": True, "sector": sector, "rankings": rankings})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp_benchmarking.route("/ranking/<sector>/exportar/sheets", methods=["POST"])
def exportar_ranking_sheets(sector):
    """Exportar ranking de sector a Google Sheets"""
    try:
        exporter = GoogleSheetsExporter()
        spreadsheet_id = request.json.get("spreadsheet_id")
        limite = request.json.get("limite", 50)

        success = exporter.exportar_ranking_sector(sector, spreadsheet_id, limite)

        if success:
            return jsonify(
                {
                    "success": True,
                    "message": f"Ranking del sector {sector} exportado exitosamente a Google Sheets",
                }
            )
        return jsonify(
            {"success": False, "error": "Error exportando ranking a Google Sheets"}
        ), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp_benchmarking.route("/ranking/<sector>/exportar/excel", methods=["GET"])
def exportar_ranking_excel(sector):
    """Exportar ranking de sector a Excel"""
    try:
        limite = request.args.get("limite", 50, type=int)
        success = ExcelExporter.exportar_ranking_excel(sector, limite=limite)

        if success:
            return jsonify(
                {
                    "success": True,
                    "message": f"Ranking del sector {sector} exportado exitosamente a Excel",
                }
            )
        return jsonify(
            {"success": False, "error": "Error exportando ranking a Excel"}
        ), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp_benchmarking.route(
    "/benchmarking/grupos/<int:benchmarking_id>/exportar/sheets", methods=["POST"]
)
def exportar_benchmarking_sheets(benchmarking_id):
    """Exportar análisis de benchmarking a Google Sheets"""
    try:
        indicador = request.json.get("indicador")
        spreadsheet_id = request.json.get("spreadsheet_id")

        if not indicador:
            return jsonify({"success": False, "error": "Indicador requerido"}), 400

        exporter = GoogleSheetsExporter()
        success = exporter.exportar_benchmarking_grupo(
            benchmarking_id, indicador, spreadsheet_id
        )

        if success:
            return jsonify(
                {
                    "success": True,
                    "message": f"Análisis de benchmarking para {indicador} exportado exitosamente",
                }
            )
        return jsonify(
            {"success": False, "error": "Error exportando benchmarking a Google Sheets"}
        ), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
