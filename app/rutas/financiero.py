"""
Endpoints REST para:
- VAN, TIR, WACC, Portafolio, Reemplazo de Activos
- Préstamos y Simulación de Cuotas
- Ahorro e Inversión con Proyecciones
"""

from flask import Blueprint, request, jsonify, session
from app.servicios.financiero_servicio import FinancieroServicio
from app.servicios.prestamo_servicio import ServicioPrestamo
from app.servicios.ahorro_inversion_servicio import ServicioAhorroInversion
from app.servicios.gamification_servicio import GamificationService
from app.modelos.simulacion import Simulacion
from app.modelos.logro import Usuario_Insignia

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
        resultado = FinancieroServicio.calcular_van(inversion, flujos, tasa)

        # Guardar simulación si hay usuario_id
        if usuario_id:
            simulacion = Simulacion.crear(
                usuario_id=usuario_id,
                nombre=nombre,
                tipo_simulacion="VAN",
                parametros={
                    "inversion_inicial": inversion,
                    "flujos_caja": flujos,
                    "tasa_descuento": tasa,
                },
                resultados=resultado,
            )
            if simulacion:
                resultado["simulacion_id"] = simulacion.simulacion_id

            # Verificar y otorgar insignias automáticamente (solo si usuario_id es válido)
            if usuario_id and isinstance(usuario_id, int):
                try:
                    GamificationService.verificar_y_otorgar_insignias(usuario_id)
                except Exception as e:
                    print(f"Error verificando insignias para usuario {usuario_id}: {e}")
                    # No fallar la simulación por error en gamificación

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
        resultado = FinancieroServicio.calcular_tir(inversion, flujos, tasa_ref)

        # Guardar simulación
        if usuario_id:
            simulacion = Simulacion.crear(
                usuario_id=usuario_id,
                nombre=nombre,
                tipo_simulacion="TIR",
                parametros={
                    "inversion_inicial": inversion,
                    "flujos_caja": flujos,
                    "tasa_referencia": tasa_ref,
                },
                resultados=resultado,
            )
            if simulacion:
                resultado["simulacion_id"] = simulacion.simulacion_id

            # Verificar y otorgar insignias automáticamente (solo si usuario_id es válido)
            if usuario_id and isinstance(usuario_id, int):
                try:
                    GamificationService.verificar_y_otorgar_insignias(usuario_id)
                except Exception as e:
                    print(f"Error verificando insignias para usuario {usuario_id}: {e}")
                    # No fallar la simulación por error en gamificación

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
        resultado = FinancieroServicio.calcular_wacc(
            capital, deuda, costo_cap, costo_deu, tasa_imp
        )

        # Guardar simulación
        if usuario_id:
            simulacion = Simulacion.crear(
                usuario_id=usuario_id,
                nombre=nombre,
                tipo_simulacion="WACC",
                parametros={
                    "capital_propio": capital,
                    "deuda": deuda,
                    "costo_capital": costo_cap,
                    "costo_deuda": costo_deu,
                    "tasa_impuesto": tasa_imp,
                },
                resultados=resultado,
            )
            if simulacion:
                resultado["simulacion_id"] = simulacion.simulacion_id

            # Verificar y otorgar insignias automáticamente (solo si usuario_id es válido)
            if usuario_id and isinstance(usuario_id, int):
                try:
                    GamificationService.verificar_y_otorgar_insignias(usuario_id)
                except Exception as e:
                    print(f"Error verificando insignias para usuario {usuario_id}: {e}")
                    # No fallar la simulación por error en gamificación

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
        print(f"📊 Datos recibidos en portafolio: {datos}")  # Debug log

        retornos = datos.get("retornos")
        ponderaciones = datos.get("ponderaciones")
        volatilidades = datos.get("volatilidades")
        matriz_corr = datos.get("matriz_correlacion")
        usuario_id = datos.get("usuario_id")
        nombre = datos.get("nombre_simulacion", "Simulación Portafolio")

        # Manejar conversión de datos de activos a retornos/ponderaciones si es necesario
        if (ponderaciones is None or len(ponderaciones) == 0) and (retornos is None or len(retornos) == 0):
            # Verificar si hay datos de activos en el request
            activos = datos.get("activos")
            print(f"🔍 Activos encontrados: {activos}")  # Debug adicional
            if activos and isinstance(activos, list) and len(activos) > 0:
                # Los datos ya llegan como decimales desde el frontend
                retornos = [float(activo.get('rendimientoEsperado', 0)) for activo in activos]
                ponderaciones = [float(activo.get('peso', 0)) for activo in activos]
                print(f"✅ Conversión exitosa - retornos: {retornos}, ponderaciones: {ponderaciones}")  # Debug
            else:
                # Si no hay activos válidos, crear datos de ejemplo para testing
                print(f"⚠️ No hay activos válidos, creando datos de ejemplo")
                retornos = [0.08, 0.12, 0.06]  # 8%, 12%, 6%
                ponderaciones = [0.4, 0.4, 0.2]  # 40%, 40%, 20%

        # Asegurar que ponderaciones no sea None
        if ponderaciones is None:
            ponderaciones = []
            print(f"⚠️ Ponderaciones era None, establecido como array vacío")

        # retornos puede ser vacío, se manejará en el servicio

        # Analizar portafolio
        resultado = FinancieroServicio.analizar_portafolio(
            retornos, ponderaciones, volatilidades, matriz_corr
        )

        # Guardar simulación
        if usuario_id:
            # Usar todos los datos enviados, no solo los básicos
            parametros_guardar = datos.copy()
            # Remover campos que no van en parámetros
            parametros_guardar.pop('usuario_id', None)
            parametros_guardar.pop('nombre_simulacion', None)

            print(f"💾 Guardando simulación con parámetros completos: {parametros_guardar}")
            print(f"💾 Resultados a guardar: {resultado}")

            simulacion = Simulacion.crear(
                usuario_id=usuario_id,
                nombre=nombre,
                tipo_simulacion="PORTAFOLIO",
                parametros=parametros_guardar,
                resultados=resultado,
            )
            if simulacion:
                resultado["simulacion_id"] = simulacion.simulacion_id
                print(f"✅ Simulación guardada con ID: {simulacion.simulacion_id}")
            else:
                print(f"❌ Error al guardar simulación")

            # Verificar y otorgar insignias automáticamente (solo si usuario_id es válido)
            if usuario_id and isinstance(usuario_id, int):
                try:
                    GamificationService.verificar_y_otorgar_insignias(usuario_id)
                except Exception as e:
                    print(f"Error verificando insignias para usuario {usuario_id}: {e}")
                    # No fallar la simulación por error en gamificación

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
        resultado = FinancieroServicio.analizar_reemplazo_activo(
            costo_act, costo_nue, costo_comp, salvamento, vida_util, tasa
        )

        # Guardar simulación
        if usuario_id:
            simulacion = Simulacion.crear(
                usuario_id=usuario_id,
                nombre=nombre,
                tipo_simulacion="REEMPLAZO_ACTIVOS",
                parametros=datos,
                resultados=resultado,
            )
            if simulacion:
                resultado["simulacion_id"] = simulacion.simulacion_id

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

        resultado = FinancieroServicio.calcular_periodo_recuperacion(inversion, flujos)

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
        print(f"🔍 Recuperando simulación ID: {simulacion_id}")
        simulacion = Simulacion.obtener_simulacion_por_id(simulacion_id)

        if not simulacion:
            print(f"❌ Simulación {simulacion_id} no encontrada")
            return jsonify({"error": "Simulación no encontrada"}), 404

        data_dict = simulacion.to_dict()
        # Agregar parámetros y resultados completos
        data_dict['parametros'] = simulacion.parametros
        data_dict['resultados'] = simulacion.resultados
        data_dict['nombre'] = simulacion.nombre
        data_dict['tipo_simulacion'] = simulacion.tipo_simulacion

        print(f"📋 Datos recuperados: parámetros={simulacion.parametros}, resultados={simulacion.resultados}")
        print(f"📤 Enviando respuesta: {data_dict}")

        return jsonify({"success": True, "data": data_dict}), 200

    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@bp_financiero.route("/simulaciones/usuario/<int:usuario_id>", methods=["GET"])
def listar_simulaciones_usuario(usuario_id):
    """Lista simulaciones de un usuario"""
    try:
        tipo = request.args.get("tipo")  # Filtro opcional por tipo
        limit = int(request.args.get("limit", 50))

        simulaciones = Simulacion.obtener_simulaciones_usuario(usuario_id, limit, tipo)

        return jsonify(
            {
                "success": True,
                "data": [s.to_dict() for s in simulaciones],
                "total": len(simulaciones),
            }
        ), 200

    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


# ============================================================================
# ENDPOINTS PARA SIMULACIÓN DE PRÉSTAMOS
# ============================================================================


@bp_financiero.route("/prestamo", methods=["POST"])
def calcular_prestamo():
    """
    Calcula tabla de amortización y análisis de préstamo

    Body JSON:
    {
        "monto": 50000,
        "tasa_anual": 12.5,
        "plazo_meses": 60,
        "tasa_impuesto": 0,
        "comision_inicial": 2,
        "usuario_id": 1,
        "nombre_simulacion": "Préstamo Auto"
    }

    Returns:
        JSON con tabla de amortización y análisis
    """
    try:
        datos = request.get_json()

        # Extraer parámetros requeridos
        monto = datos.get("monto")
        tasa_anual = datos.get("tasa_anual")
        plazo_meses = datos.get("plazo_meses")

        if any(x is None for x in [monto, tasa_anual, plazo_meses]):
            return jsonify(
                {
                    "error": "Faltan parámetros requeridos: monto, tasa_anual, plazo_meses"
                }
            ), 400

        # Parámetros opcionales
        tasa_impuesto = datos.get("tasa_impuesto", 0)
        comision_inicial = datos.get("comision_inicial", 0)
        usuario_id = datos.get("usuario_id")
        nombre = datos.get("nombre_simulacion", "Simulación Préstamo")

        # Calcular préstamo
        resultado = ServicioPrestamo.calcular_prestamo_completo(
            monto=monto,
            tasa_anual=tasa_anual,
            plazo_meses=plazo_meses,
            tasa_impuesto=tasa_impuesto,
            comision_inicial=comision_inicial,
        )

        # Guardar simulación si hay usuario_id
        if usuario_id:
            simulacion = Simulacion.crear(
                usuario_id=usuario_id,
                nombre=nombre,
                tipo_simulacion="PRESTAMO",
                parametros={
                    "monto": monto,
                    "tasa_anual": tasa_anual,
                    "plazo_meses": plazo_meses,
                    "tasa_impuesto": tasa_impuesto,
                    "comision_inicial": comision_inicial,
                },
                resultados=resultado,
            )
            if simulacion:
                resultado["simulacion_id"] = simulacion.simulacion_id

            # Verificar y otorgar insignias automáticamente (solo si usuario_id es válido)
            if usuario_id and isinstance(usuario_id, int):
                try:
                    GamificationService.verificar_y_otorgar_insignias(usuario_id)
                except Exception as e:
                    print(f"Error verificando insignias para usuario {usuario_id}: {e}")
                    # No fallar la simulación por error en gamificación

        return jsonify({"success": True, "data": resultado}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@bp_financiero.route("/prestamo/sensibilidad", methods=["POST"])
def sensibilidad_prestamo():
    """
    Analiza sensibilidad del préstamo ante cambios en tasa

    Body JSON:
    {
        "monto": 50000,
        "tasa_anual": 12.5,
        "plazo_meses": 60,
        "variacion_tasa": 0.5
    }

    Returns:
        JSON con escenarios de sensibilidad
    """
    try:
        datos = request.get_json()

        monto = datos.get("monto")
        tasa_anual = datos.get("tasa_anual")
        plazo_meses = datos.get("plazo_meses")
        variacion_tasa = datos.get("variacion_tasa", 0.5)

        if any(x is None for x in [monto, tasa_anual, plazo_meses]):
            return jsonify({"error": "Faltan parámetros requeridos"}), 400

        resultado = ServicioPrestamo.analizar_sensibilidad_prestamo(
            monto, tasa_anual, plazo_meses, variacion_tasa
        )

        return jsonify({"success": True, "data": resultado}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@bp_financiero.route("/prestamo/comparar-plazos", methods=["POST"])
def comparar_plazos_prestamo():
    """
    Compara cuota y costo total para diferentes plazos

    Body JSON:
    {
        "monto": 50000,
        "tasa_anual": 12.5,
        "plazos": [24, 36, 48, 60]
    }

    Returns:
        JSON con comparativa de plazos
    """
    try:
        datos = request.get_json()

        monto = datos.get("monto")
        tasa_anual = datos.get("tasa_anual")
        plazos = datos.get("plazos", [24, 36, 48, 60])

        if any(x is None for x in [monto, tasa_anual]):
            return jsonify(
                {"error": "Faltan parámetros requeridos: monto, tasa_anual"}
            ), 400

        resultado = ServicioPrestamo.comparar_plazos(monto, tasa_anual, plazos)

        return jsonify({"success": True, "data": resultado}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


# ============================================================================
# ENDPOINTS PARA SIMULACIÓN DE AHORRO E INVERSIÓN
# ============================================================================


@bp_financiero.route("/ahorro", methods=["POST"])
def calcular_ahorro():
    """
    Simula crecimiento de ahorro con aportes periódicos

    Body JSON:
    {
        "monto_inicial": 10000,
        "aporte_mensual": 500,
        "tasa_anual": 8.0,
        "meses": 120,
        "tasa_impuesto": 0.05,
        "inflacion_anual": 3.0,
        "usuario_id": 1,
        "nombre_simulacion": "Ahorro Jubilación"
    }

    Returns:
        JSON con proyección de ahorro
    """
    try:
        datos = request.get_json()

        # Parámetros requeridos
        monto_inicial = datos.get("monto_inicial")
        aporte_mensual = datos.get("aporte_mensual")
        tasa_anual = datos.get("tasa_anual")
        meses = datos.get("meses")

        if any(x is None for x in [monto_inicial, aporte_mensual, tasa_anual, meses]):
            return jsonify(
                {
                    "error": "Faltan parámetros requeridos: monto_inicial, aporte_mensual, tasa_anual, meses"
                }
            ), 400

        # Parámetros opcionales
        tasa_impuesto = datos.get("tasa_impuesto", 0)
        inflacion_anual = datos.get("inflacion_anual", 0)
        usuario_id = datos.get("usuario_id")
        nombre = datos.get("nombre_simulacion", "Simulación Ahorro")

        # Calcular ahorro
        resultado = ServicioAhorroInversion.calcular_ahorro_con_aportes(
            monto_inicial=monto_inicial,
            aporte_mensual=aporte_mensual,
            tasa_anual=tasa_anual,
            meses=meses,
            tasa_impuesto=tasa_impuesto,
            inflacion_anual=inflacion_anual,
        )

        # Guardar simulación
        if usuario_id:
            simulacion = Simulacion.crear(
                usuario_id=usuario_id,
                nombre=nombre,
                tipo_simulacion="AHORRO",
                parametros={
                    "monto_inicial": monto_inicial,
                    "aporte_mensual": aporte_mensual,
                    "tasa_anual": tasa_anual,
                    "meses": meses,
                    "tasa_impuesto": tasa_impuesto,
                    "inflacion_anual": inflacion_anual,
                },
                resultados=resultado,
            )
            if simulacion:
                resultado["simulacion_id"] = simulacion.simulacion_id

            # Verificar y otorgar insignias automáticamente (solo si usuario_id es válido)
            if usuario_id and isinstance(usuario_id, int):
                try:
                    GamificationService.verificar_y_otorgar_insignias(usuario_id)
                except Exception as e:
                    print(f"Error verificando insignias para usuario {usuario_id}: {e}")
                    # No fallar la simulación por error en gamificación

        return jsonify({"success": True, "data": resultado}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@bp_financiero.route("/ahorro/meta", methods=["POST"])
def calcular_meta_ahorro():
    """
    Calcula tiempo necesario para alcanzar una meta de ahorro

    Body JSON:
    {
        "monto_objetivo": 100000,
        "monto_inicial": 10000,
        "tasa_anual": 8.0,
        "aporte_mensual": 500
    }

    Returns:
        JSON con tiempo necesario y proyección
    """
    try:
        datos = request.get_json()

        monto_objetivo = datos.get("monto_objetivo")
        monto_inicial = datos.get("monto_inicial")
        tasa_anual = datos.get("tasa_anual")
        aporte_mensual = datos.get("aporte_mensual")

        if any(
            x is None
            for x in [monto_objetivo, monto_inicial, tasa_anual, aporte_mensual]
        ):
            return jsonify({"error": "Faltan parámetros requeridos"}), 400

        resultado = ServicioAhorroInversion.analizar_meta_ahorro(
            monto_objetivo, monto_inicial, tasa_anual, aporte_mensual
        )

        return jsonify({"success": True, "data": resultado}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@bp_financiero.route("/ahorro/comparar-instrumentos", methods=["POST"])
def comparar_instrumentos():
    """
    Compara diferentes opciones de inversión

    Body JSON:
    {
        "monto_inicial": 100000,
        "aporte_mensual": 1000,
        "meses": 24,
        "instrumentos": [
            {
                "nombre": "Plazo Fijo",
                "tasa_anual": 5.0,
                "tasa_impuesto": 0,
                "descripcion": "Depósito a plazo fijo"
            },
            {
                "nombre": "Fondo Mutuo",
                "tasa_anual": 8.5,
                "tasa_impuesto": 0.05,
                "descripcion": "Fondo de inversión diversificado"
            }
        ],
        "usuario_id": 1,
        "nombre_simulacion": "Comparador Instrumentos"
    }

    Returns:
        JSON con comparativa de instrumentos
    """
    try:
        datos = request.get_json()

        monto_inicial = datos.get("monto_inicial")
        aporte_mensual = datos.get("aporte_mensual")
        meses = datos.get("meses")
        instrumentos = datos.get("instrumentos")
        usuario_id = datos.get("usuario_id")
        nombre = datos.get("nombre_simulacion", "Comparador Instrumentos")

        if any(x is None for x in [monto_inicial, aporte_mensual, meses, instrumentos]):
            return jsonify({"error": "Faltan parámetros requeridos"}), 400

        resultado = ServicioAhorroInversion.comparar_instrumentos(
            monto_inicial, aporte_mensual, meses, instrumentos
        )

        # Guardar simulación
        if usuario_id:
            simulacion = Simulacion.crear(
                usuario_id=usuario_id,
                nombre=nombre,
                tipo_simulacion="COMPARADOR",
                parametros=datos,
                resultados=resultado,
            )
            if simulacion:
                resultado["simulacion_id"] = simulacion.simulacion_id

            # Verificar y otorgar insignias automáticamente (solo si usuario_id es válido)
            if usuario_id and isinstance(usuario_id, int):
                try:
                    GamificationService.verificar_y_otorgar_insignias(usuario_id)
                except Exception as e:
                    print(f"Error verificando insignias para usuario {usuario_id}: {e}")
                    # No fallar la simulación por error en gamificación

        return jsonify({"success": True, "data": resultado}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@bp_financiero.route("/ahorro/sensibilidad", methods=["POST"])
def sensibilidad_ahorro():
    """
    Analiza sensibilidad del ahorro ante cambios en tasa

    Body JSON:
    {
        "monto_inicial": 10000,
        "aporte_mensual": 500,
        "tasa_anual": 8.0,
        "meses": 120,
        "variacion_tasa": 1.0
    }

    Returns:
        JSON con escenarios de sensibilidad
    """
    try:
        datos = request.get_json()

        monto_inicial = datos.get("monto_inicial")
        aporte_mensual = datos.get("aporte_mensual")
        tasa_anual = datos.get("tasa_anual")
        meses = datos.get("meses")
        variacion_tasa = datos.get("variacion_tasa", 1.0)

        if any(x is None for x in [monto_inicial, aporte_mensual, tasa_anual, meses]):
            return jsonify({"error": "Faltan parámetros requeridos"}), 400

        resultado = ServicioAhorroInversion.analizar_sensibilidad_ahorro(
            monto_inicial, aporte_mensual, tasa_anual, meses, variacion_tasa
        )

        return jsonify({"success": True, "data": resultado}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500
