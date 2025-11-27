from flask import Blueprint, request, jsonify
from app.modelos.usuario import Usuario
from app.modelos.logro import Usuario_Insignia, Ranking
from app.modelos.notificacion import Notificacion
from app.utils.exportar import GoogleSheetsExporter, ExcelExporter

usuarios_bp = Blueprint('usuarios', __name__)

@usuarios_bp.route('/usuarios', methods=['GET'])
def listar_usuarios():
    """Listar todos los usuarios"""
    try:
        usuarios = Usuario.listar_usuarios()
        return jsonify({
            'success': True,
            'usuarios': [usuario.to_dict() for usuario in usuarios]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>', methods=['GET'])
def obtener_usuario(usuario_id):
    """Obtener información de un usuario específico"""
    try:
        usuario = Usuario.obtener_usuario_por_id(usuario_id)
        if usuario:
            return jsonify({
                'success': True,
                'usuario': usuario.to_dict()
            })
        return jsonify({
            'success': False,
            'error': 'Usuario no encontrado'
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/insignias', methods=['GET'])
def obtener_insignias_usuario(usuario_id):
    """Obtener todas las insignias de un usuario"""
    try:
        insignias = Usuario_Insignia.obtener_insignias_usuario(usuario_id)
        return jsonify({
            'success': True,
            'insignias': insignias
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/ranking', methods=['GET'])
def obtener_ranking_usuario(usuario_id):
    """Obtener rankings de un usuario"""
    try:
        rankings = Ranking.obtener_ranking_usuario(usuario_id)
        return jsonify({
            'success': True,
            'rankings': [ranking.to_dict() for ranking in rankings]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/notificaciones', methods=['GET'])
def obtener_notificaciones_usuario(usuario_id):
    """Obtener notificaciones de un usuario"""
    try:
        limite = request.args.get('limite', 20, type=int)
        notificaciones = Notificacion.obtener_notificaciones_usuario(usuario_id, limite)
        no_leidas = Notificacion.obtener_notificaciones_no_leidas(usuario_id)

        return jsonify({
            'success': True,
            'notificaciones': [notif.to_dict() for notif in notificaciones],
            'no_leidas': no_leidas
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/notificaciones/<int:notificacion_id>/leer', methods=['PUT'])
def marcar_notificacion_leida(usuario_id, notificacion_id):
    """Marcar una notificación como leída"""
    try:
        success = Notificacion.marcar_como_leida(notificacion_id)
        if success:
            return jsonify({
                'success': True,
                'message': 'Notificación marcada como leída'
            })
        return jsonify({
            'success': False,
            'error': 'Error al marcar notificación como leída'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/exportar/sheets', methods=['POST'])
def exportar_resultados_sheets(usuario_id):
    """Exportar resultados del usuario a Google Sheets"""
    try:
        exporter = GoogleSheetsExporter()
        spreadsheet_id = request.json.get('spreadsheet_id')

        success = exporter.exportar_resultados_usuario(usuario_id, spreadsheet_id)

        if success:
            return jsonify({
                'success': True,
                'message': 'Resultados exportados exitosamente a Google Sheets'
            })
        return jsonify({
            'success': False,
            'error': 'Error exportando a Google Sheets'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/exportar/excel', methods=['GET'])
def exportar_resultados_excel(usuario_id):
    """Exportar resultados del usuario a Excel"""
    try:
        success = ExcelExporter.exportar_resultados_usuario_excel(usuario_id)

        if success:
            return jsonify({
                'success': True,
                'message': 'Resultados exportados exitosamente a Excel'
            })
        return jsonify({
            'success': False,
            'error': 'Error exportando a Excel'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/nivel', methods=['PUT'])
def actualizar_nivel_usuario(usuario_id):
    """Actualizar nivel de un usuario"""
    try:
        data = request.get_json()
        nuevo_nivel = data.get('nivel')

        if not nuevo_nivel:
            return jsonify({
                'success': False,
                'error': 'Nivel requerido'
            }), 400

        success = Usuario.actualizar_nivel(usuario_id, nuevo_nivel)

        if success:
            return jsonify({
                'success': True,
                'message': 'Nivel actualizado exitosamente'
            })
        return jsonify({
            'success': False,
            'error': 'Error actualizando nivel'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
