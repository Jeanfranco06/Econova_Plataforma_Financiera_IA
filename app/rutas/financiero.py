"""
Endpoints REST para:
- VAN, TIR, WACC, Portafolio, Reemplazo de Activos
"""

from flask import Blueprint, request, jsonify
from app.servicios.financiero_servicio import ServicioFinanciero
from app.modelos.simulacion import Simulacion

bp_financiero = Blueprint("financiero", __name__, url_prefix="/api/v1/financiero")


@bp_financiero.route("/van", methods=["POST"])
def calcular_van():
    """
    Calcula el VAN (Valor Actual Neto)

    Body JSON:
    {
        "inversion_inicial": 100000,
        "flujos_caja": [30000, 35000, 40000, 45000],
        "tasa_descuento": 0.10,
        "usuario_id": 1,
        "nombre_simulacion": "Proyecto Solar"
    }

    Returns:
        JSON con resultado del VAN
    """
    try:
        datos = request.get_json()

        # Extraer parámetros
        inversion = datos.get("inversion_inicial")
        flujos = datos.get("flujos_caja")
        tasa = datos.get("tasa_descuento", 0.10)
        usuario_id = datos.get("usuario_id")
        nombre = datos.get("nombre_simulacion", "Simulación VAN")

        # Validar que existan los datos requeridos
        if inversion is None or flujos is None:
            return jsonify(
                {
                    "error": "Faltan parámetros requeridos: inversion_inicial, flujos_caja"
                }
            ), 400

        # Calcular VAN
        resultado = ServicioFinanciero.calcular_van(inversion, flujos, tasa)

        # Guardar simulación si hay usuario_id
        if usuario_id:
            simulacion_id = Simulacion.crear_simulacion(usuario_id, "VAN")
            if simulacion_id:
                resultado["simulacion_id"] = simulacion_id
            # TODO: Implementar sistema de logros cuando la clase Logro esté disponible

        return jsonify(
            {
                "success": True,
                "data": resultado,
            }
        ), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@bp_financiero.route("/tir", methods=["POST"])
def calcular_tir():
    """
    Calcula la TIR (Tasa Interna de Retorno)

    Body JSON:
    {
        "inversion_inicial": 100000,
        "flujos_caja": [30000, 35000, 40000, 45000],
        "tasa_referencia": 0.10,
        "usuario_id": 1,
        "nombre_simulacion": "Proyecto Industrial"
    }

    Returns:
        JSON con resultado de la TIR
    """
    try:
        datos = request.get_json()

        inversion = datos.get("inversion_inicial")
        flujos = datos.get("flujos_caja")
        tasa_ref = datos.get("tasa_referencia", 0.10)
        usuario_id = datos.get("usuario_id")
        nombre = datos.get("nombre_simulacion", "Simulación TIR")

        if inversion is None or flujos is None:
            return jsonify(
                {
                    "error": "Faltan parámetros requeridos: inversion_inicial, flujos_caja"
                }
            ), 400

        # Calcular TIR
        resultado = ServicioFinanciero.calcular_tir(inversion, flujos, tasa_ref)

        # Guardar simulación
        if usuario_id:
            simulacion_id = Simulacion.crear_simulacion(usuario_id, "TIR")
            if simulacion_id:
                resultado["simulacion_id"] = simulacion_id
            # TODO: Implementar sistema de logros cuando la clase Logro esté disponible

        return jsonify(
            {
                "success": True,
                "data": resultado,
            }
        ), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@bp_financiero.route("/wacc", methods=["POST"])
def calcular_wacc():
    """
    Calcula el WACC (Costo Promedio Ponderado de Capital)

    Body JSON:
    {
        "capital_propio": 500000,
        "deuda": 300000,
        "costo_capital": 0.15,
        "costo_deuda": 0.08,
        "tasa_impuesto": 0.30,
        "usuario_id": 1,
        "nombre_simulacion": "WACC Empresa XYZ"
    }

    Returns:
        JSON con resultado del WACC
    """
    try:
        datos = request.get_json()

        capital = datos.get("capital_propio")
        deuda = datos.get("deuda")
        costo_cap = datos.get("costo_capital")
        costo_deu = datos.get("costo_deuda")
        tasa_imp = datos.get("tasa_impuesto")
        usuario_id = datos.get("usuario_id")
        nombre = datos.get("nombre_simulacion", "Simulación WACC")

        if any(x is None for x in [capital, deuda, costo_cap, costo_deu, tasa_imp]):
            return jsonify(
                {
                    "error": "Faltan parámetros requeridos: capital_propio, deuda, costo_capital, costo_deuda, tasa_impuesto"
                }
            ), 400

        # Calcular WACC
        resultado = ServicioFinanciero.calcular_wacc(
            capital, deuda, costo_cap, costo_deu, tasa_imp
        )

        # Guardar simulación
        if usuario_id:
            simulacion_id = Simulacion.crear_simulacion(usuario_id, "WACC")
            if simulacion_id:
                resultado["simulacion_id"] = simulacion_id
            # TODO: Implementar sistema de logros cuando la clase Logro esté disponible

        return jsonify(
            {
                "success": True,
                "data": resultado,
            }
        ), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@bp_financiero.route("/portafolio", methods=["POST"])
def analizar_portafolio():
    """
    Analiza un portafolio de inversión

    Body JSON:
    {
        "retornos": [0.12, 0.15, 0.10],
        "ponderaciones": [0.4, 0.35, 0.25],
        "volatilidades": [0.20, 0.25, 0.15],
        "matriz_correlacion": [[1, 0.5, 0.3], [0.5, 1, 0.4], [0.3, 0.4, 1]],
        "usuario_id": 1,
        "nombre_simulacion": "Portafolio Diversificado"
    }

    Returns:
        JSON con análisis del portafolio
    """
    try:
        datos = request.get_json()

        retornos = datos.get("retornos")
        ponderaciones = datos.get("ponderaciones")
        volatilidades = datos.get("volatilidades")
        matriz_corr = datos.get("matriz_correlacion")
        usuario_id = datos.get("usuario_id")
        nombre = datos.get("nombre_simulacion", "Simulación Portafolio")

        if retornos is None or ponderaciones is None:
            return jsonify(
                {"error": "Faltan parámetros requeridos: retornos, ponderaciones"}
            ), 400

        # Analizar portafolio
        resultado = ServicioFinanciero.analizar_portafolio(
            retornos, ponderaciones, volatilidades, matriz_corr
        )

        # Guardar simulación
        if usuario_id:
            simulacion_id = Simulacion.crear_simulacion(usuario_id, "PORTAFOLIO")
            if simulacion_id:
                resultado["simulacion_id"] = simulacion_id
            # TODO: Implementar sistema de logros cuando la clase Logro esté disponible

        return jsonify(
            {
                "success": True,
                "data": resultado,
            }
        ), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@bp_financiero.route("/reemplazo-activo", methods=["POST"])
def analizar_reemplazo():
    """
    Analiza decisión de reemplazo de activo

    Body JSON:
    {
        "costo_actual_anual": 50000,
        "costo_nuevo_anual": 30000,
        "costo_nuevo_compra": 150000,
        "valor_salvamento_actual": 20000,
        "vida_util_nuevo": 10,
        "tasa_descuento": 0.10,
        "usuario_id": 1,
        "nombre_simulacion": "Reemplazo Maquinaria"
    }

    Returns:
        JSON con análisis de reemplazo
    """
    try:
        datos = request.get_json()

        costo_act = datos.get("costo_actual_anual")
        costo_nue = datos.get("costo_nuevo_anual")
        costo_comp = datos.get("costo_nuevo_compra")
        salvamento = datos.get("valor_salvamento_actual")
        vida_util = datos.get("vida_util_nuevo")
        tasa = datos.get("tasa_descuento", 0.10)
        usuario_id = datos.get("usuario_id")
        nombre = datos.get("nombre_simulacion", "Simulación Reemplazo")

        if any(
            x is None for x in [costo_act, costo_nue, costo_comp, salvamento, vida_util]
        ):
            return jsonify({"error": "Faltan parámetros requeridos"}), 400

        # Analizar reemplazo
        resultado = ServicioFinanciero.analizar_reemplazo_activo(
            costo_act, costo_nue, costo_comp, salvamento, vida_util, tasa
        )

        # Guardar simulación
        if usuario_id:
            simulacion_id = Simulacion.crear_simulacion(usuario_id, "REEMPLAZO_ACTIVOS")
            if simulacion_id:
                resultado["simulacion_id"] = simulacion_id

        return jsonify({"success": True, "data": resultado}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@bp_financiero.route("/periodo-recuperacion", methods=["POST"])
def calcular_periodo_recuperacion():
    """
    Calcula el periodo de recuperación (Payback Period)

    Body JSON:
    {
        "inversion_inicial": 100000,
        "flujos_caja": [25000, 30000, 35000, 40000],
        "usuario_id": 1
    }

    Returns:
        JSON con periodo de recuperación
    """
    try:
        datos = request.get_json()

        inversion = datos.get("inversion_inicial")
        flujos = datos.get("flujos_caja")

        if inversion is None or flujos is None:
            return jsonify(
                {
                    "error": "Faltan parámetros requeridos: inversion_inicial, flujos_caja"
                }
            ), 400

        resultado = ServicioFinanciero.calcular_periodo_recuperacion(inversion, flujos)

        return jsonify({"success": True, "data": resultado}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


# Endpoints para consultar simulaciones guardadas
@bp_financiero.route("/simulaciones/<int:simulacion_id>", methods=["GET"])
def obtener_simulacion(simulacion_id):
    """Obtiene una simulación por ID"""
    try:
        simulacion = Simulacion.obtener_simulacion_por_id(simulacion_id)

        if not simulacion:
            return jsonify({"error": "Simulación no encontrada"}), 404

        return jsonify({"success": True, "data": simulacion.to_dict()}), 200

    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@bp_financiero.route("/simulaciones/usuario/<int:usuario_id>", methods=["GET"])
def listar_simulaciones_usuario(usuario_id):
    """Lista simulaciones de un usuario"""
    try:
        limit = int(request.args.get("limit", 50))

        simulaciones = Simulacion.obtener_simulaciones_usuario(usuario_id, limit)

        return jsonify(
            {
                "success": True,
                "data": [s.to_dict() for s in simulaciones],
                "total": len(simulaciones),
            }
        ), 200

    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500
