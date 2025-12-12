"""
Rutas de API para Machine Learning
Autor: Diego (Responsable de ML)
Integración: Germaín (Backend)

Endpoints disponibles:
- POST /api/v1/ml/predecir/ingresos - Predicción de ingresos
- POST /api/v1/ml/predecir/crecimiento - Predicción de crecimiento
- POST /api/v1/ml/predecir/riesgo - Clasificación de riesgo
- POST /api/v1/ml/sensibilidad/montecarlo - Simulación Monte Carlo
- POST /api/v1/ml/sensibilidad/tornado - Análisis de tornado
- POST /api/v1/ml/sensibilidad/escenarios - Análisis de escenarios
- GET /api/v1/ml/estado - Estado del servicio ML
"""
from flask import Blueprint, request, jsonify
from app.servicios.ml_servicio import (
    obtener_servicio_ml,
    SimulacionMonteCarlo,
    AnalisisSensibilidad
)

bp_ml = Blueprint('ml', __name__, url_prefix='/api/v1/ml')


# ============================================================================
# Endpoints de Estado
# ============================================================================

@bp_ml.route('/estado', methods=['GET'])
def estado_servicio():
    """
    Verifica el estado del servicio de Machine Learning.
    
    Returns:
        JSON con estado del servicio y modelos disponibles
    """
    try:
        servicio = obtener_servicio_ml()
        return jsonify({
            'status': 'activo',
            'modelos_cargados': servicio.modelos_cargados,
            'servicios_disponibles': {
                'prediccion_ingresos': True,
                'prediccion_crecimiento': True,
                'clasificacion_riesgo': True,
                'simulacion_montecarlo': True,
                'analisis_sensibilidad': True
            },
            'mensaje': 'Servicio ML operativo'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'mensaje': str(e)
        }), 500


# ============================================================================
# Endpoints de Predicción
# ============================================================================

@bp_ml.route('/predecir/ingresos', methods=['POST'])
def predecir_ingresos():
    """
    Predice los ingresos del próximo año para una empresa.
    
    Request Body:
        {
            "ingresos_anuales": float (requerido),
            "gastos_operativos": float (requerido),
            "activos_totales": float (requerido),
            "pasivos_totales": float (requerido),
            "antiguedad_anios": float (opcional),
            "num_empleados": int (opcional),
            "num_clientes": int (opcional),
            "tasa_retencion_clientes": float (opcional, 0-1),
            "inflacion": float (opcional),
            "tasa_interes_referencia": float (opcional),
            "crecimiento_pib_sector": float (opcional)
        }
        
    Returns:
        JSON con predicción de ingresos e intervalos de confianza
    """
    try:
        datos = request.get_json()
        
        # Validar campos requeridos
        campos_requeridos = ['ingresos_anuales', 'gastos_operativos', 'activos_totales', 'pasivos_totales']
        for campo in campos_requeridos:
            if campo not in datos:
                return jsonify({
                    'error': f'Campo requerido faltante: {campo}',
                    'campos_requeridos': campos_requeridos
                }), 400
        
        # Obtener predicción
        servicio = obtener_servicio_ml()
        resultado = servicio.predecir_ingresos(datos)
        
        return jsonify({
            'status': 'success',
            'prediccion': resultado
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500


@bp_ml.route('/predecir/crecimiento', methods=['POST'])
def predecir_crecimiento():
    """
    Predice la tasa de crecimiento anual de una empresa.
    
    Request Body:
        Similar a /predecir/ingresos
        
    Returns:
        JSON con predicción de crecimiento y categorización
    """
    try:
        datos = request.get_json()
        
        campos_requeridos = ['ingresos_anuales', 'gastos_operativos', 'activos_totales', 'pasivos_totales']
        for campo in campos_requeridos:
            if campo not in datos:
                return jsonify({
                    'error': f'Campo requerido faltante: {campo}',
                    'campos_requeridos': campos_requeridos
                }), 400
        
        servicio = obtener_servicio_ml()
        resultado = servicio.predecir_crecimiento(datos)
        
        return jsonify({
            'status': 'success',
            'prediccion': resultado
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500


@bp_ml.route('/predecir/riesgo', methods=['POST'])
def clasificar_riesgo():
    """
    Clasifica el nivel de riesgo financiero de una empresa.
    
    Request Body:
        Similar a /predecir/ingresos
        
    Returns:
        JSON con clasificación de riesgo (Bajo, Medio, Alto),
        probabilidades y recomendaciones
    """
    try:
        datos = request.get_json()
        
        campos_requeridos = ['ingresos_anuales', 'gastos_operativos', 'activos_totales', 'pasivos_totales']
        for campo in campos_requeridos:
            if campo not in datos:
                return jsonify({
                    'error': f'Campo requerido faltante: {campo}',
                    'campos_requeridos': campos_requeridos
                }), 400
        
        servicio = obtener_servicio_ml()
        resultado = servicio.clasificar_riesgo(datos)
        
        return jsonify({
            'status': 'success',
            'clasificacion': resultado
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500


# ============================================================================
# Endpoints de Análisis de Sensibilidad
# ============================================================================

@bp_ml.route('/sensibilidad/montecarlo', methods=['POST'])
def simulacion_montecarlo():
    """
    Realiza una simulación Monte Carlo para análisis de VAN.
    
    Request Body:
        {
            "inversion_inicial": float (requerido),
            "flujos_caja": [float, ...] (requerido),
            "tasa_descuento": float (requerido),
            "variacion_flujos": float (opcional, default 0.15),
            "variacion_tasa": float (opcional, default 0.02),
            "n_simulaciones": int (opcional, default 10000)
        }
        
    Returns:
        JSON con estadísticas de la simulación Monte Carlo
    """
    try:
        datos = request.get_json()
        
        # Validar campos requeridos
        campos_requeridos = ['inversion_inicial', 'flujos_caja', 'tasa_descuento']
        for campo in campos_requeridos:
            if campo not in datos:
                return jsonify({
                    'error': f'Campo requerido faltante: {campo}',
                    'campos_requeridos': campos_requeridos
                }), 400
        
        # Obtener parámetros opcionales
        variacion_flujos = datos.get('variacion_flujos', 0.15)
        variacion_tasa = datos.get('variacion_tasa', 0.02)
        n_simulaciones = datos.get('n_simulaciones', 10000)
        
        # Limitar simulaciones para evitar timeout
        n_simulaciones = min(n_simulaciones, 50000)
        
        # Ejecutar simulación
        mc = SimulacionMonteCarlo(n_simulaciones=n_simulaciones)
        resultado = mc.simular_van(
            inversion_inicial=datos['inversion_inicial'],
            flujos_base=datos['flujos_caja'],
            tasa_descuento_base=datos['tasa_descuento'],
            variacion_flujos=variacion_flujos,
            variacion_tasa=variacion_tasa
        )
        
        return jsonify({
            'status': 'success',
            'simulacion': resultado,
            'parametros': {
                'inversion_inicial': datos['inversion_inicial'],
                'flujos_caja': datos['flujos_caja'],
                'tasa_descuento': datos['tasa_descuento'],
                'variacion_flujos': variacion_flujos,
                'variacion_tasa': variacion_tasa,
                'n_simulaciones': n_simulaciones
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500


@bp_ml.route('/sensibilidad/tornado', methods=['POST'])
def analisis_tornado():
    """
    Realiza un análisis de tornado para identificar variables sensibles.
    
    Request Body:
        {
            "inversion_inicial": float (requerido),
            "flujos_caja": [float, ...] (requerido),
            "tasa_descuento": float (requerido),
            "variacion": float (opcional, default 0.20)
        }
        
    Returns:
        JSON con resultados del análisis de tornado ordenados por impacto
    """
    try:
        datos = request.get_json()
        
        campos_requeridos = ['inversion_inicial', 'flujos_caja', 'tasa_descuento']
        for campo in campos_requeridos:
            if campo not in datos:
                return jsonify({
                    'error': f'Campo requerido faltante: {campo}',
                    'campos_requeridos': campos_requeridos
                }), 400
        
        variacion = datos.get('variacion', 0.20)
        
        analisis = AnalisisSensibilidad()
        resultado = analisis.analisis_tornado(
            inversion_inicial=datos['inversion_inicial'],
            flujos_base=datos['flujos_caja'],
            tasa_base=datos['tasa_descuento'],
            variacion=variacion
        )
        
        return jsonify({
            'status': 'success',
            'analisis_tornado': resultado
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500


@bp_ml.route('/sensibilidad/escenarios', methods=['POST'])
def analisis_escenarios():
    """
    Realiza un análisis de escenarios (pesimista, base, optimista).
    
    Request Body:
        {
            "inversion_inicial": float (requerido),
            "flujos_caja": [float, ...] (requerido),
            "tasa_descuento": float (requerido),
            "escenarios_config": {
                "pesimista": {"flujos_mult": 0.75, "tasa_mult": 1.25},
                "base": {"flujos_mult": 1.0, "tasa_mult": 1.0},
                "optimista": {"flujos_mult": 1.25, "tasa_mult": 0.85}
            } (opcional)
        }
        
    Returns:
        JSON con resultados de cada escenario y recomendación
    """
    try:
        datos = request.get_json()
        
        campos_requeridos = ['inversion_inicial', 'flujos_caja', 'tasa_descuento']
        for campo in campos_requeridos:
            if campo not in datos:
                return jsonify({
                    'error': f'Campo requerido faltante: {campo}',
                    'campos_requeridos': campos_requeridos
                }), 400
        
        escenarios_config = datos.get('escenarios_config', None)
        
        analisis = AnalisisSensibilidad()
        resultado = analisis.analisis_escenarios(
            inversion_inicial=datos['inversion_inicial'],
            flujos_base=datos['flujos_caja'],
            tasa_base=datos['tasa_descuento'],
            escenarios_config=escenarios_config
        )
        
        return jsonify({
            'status': 'success',
            'analisis_escenarios': resultado
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500


@bp_ml.route('/sensibilidad/punto-equilibrio', methods=['POST'])
def punto_equilibrio():
    """
    Calcula el punto de equilibrio (VAN = 0) para una variable.
    
    Request Body:
        {
            "inversion_inicial": float (requerido),
            "flujos_caja": [float, ...] (requerido),
            "tasa_descuento": float (requerido),
            "variable": str (opcional, 'flujos' o 'tasa', default 'flujos')
        }
        
    Returns:
        JSON con punto de equilibrio y margen de seguridad
    """
    try:
        datos = request.get_json()
        
        campos_requeridos = ['inversion_inicial', 'flujos_caja', 'tasa_descuento']
        for campo in campos_requeridos:
            if campo not in datos:
                return jsonify({
                    'error': f'Campo requerido faltante: {campo}',
                    'campos_requeridos': campos_requeridos
                }), 400
        
        variable = datos.get('variable', 'flujos')
        
        analisis = AnalisisSensibilidad()
        resultado = analisis.punto_equilibrio(
            inversion_inicial=datos['inversion_inicial'],
            flujos_base=datos['flujos_caja'],
            tasa_base=datos['tasa_descuento'],
            variable=variable
        )
        
        return jsonify({
            'status': 'success',
            'punto_equilibrio': resultado
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500


# ============================================================================
# Endpoint combinado para análisis completo
# ============================================================================

@bp_ml.route('/analisis-completo', methods=['POST'])
def analisis_completo():
    """
    Realiza un análisis financiero completo de una empresa.
    Incluye predicción de ingresos, crecimiento, riesgo y sensibilidad.
    
    Request Body:
        {
            "empresa": {
                "ingresos_anuales": float,
                "gastos_operativos": float,
                "activos_totales": float,
                "pasivos_totales": float,
                ... (otros campos opcionales)
            },
            "proyecto": {
                "inversion_inicial": float,
                "flujos_caja": [float, ...],
                "tasa_descuento": float
            } (opcional, para análisis de sensibilidad)
        }
        
    Returns:
        JSON con análisis completo
    """
    try:
        datos = request.get_json()
        
        if 'empresa' not in datos:
            return jsonify({
                'error': 'Se requiere el objeto "empresa" con datos financieros'
            }), 400
        
        servicio = obtener_servicio_ml()
        resultado = {
            'status': 'success',
            'predicciones': {}
        }
        
        # Predicciones de empresa
        empresa = datos['empresa']
        resultado['predicciones']['ingresos'] = servicio.predecir_ingresos(empresa)
        resultado['predicciones']['crecimiento'] = servicio.predecir_crecimiento(empresa)
        resultado['predicciones']['riesgo'] = servicio.clasificar_riesgo(empresa)
        
        # Análisis de sensibilidad si hay datos de proyecto
        if 'proyecto' in datos:
            proyecto = datos['proyecto']
            analisis = AnalisisSensibilidad()
            mc = SimulacionMonteCarlo(n_simulaciones=5000)
            
            resultado['sensibilidad'] = {
                'escenarios': analisis.analisis_escenarios(
                    inversion_inicial=proyecto['inversion_inicial'],
                    flujos_base=proyecto['flujos_caja'],
                    tasa_base=proyecto['tasa_descuento']
                ),
                'tornado': analisis.analisis_tornado(
                    inversion_inicial=proyecto['inversion_inicial'],
                    flujos_base=proyecto['flujos_caja'],
                    tasa_base=proyecto['tasa_descuento']
                ),
                'montecarlo': mc.simular_van(
                    inversion_inicial=proyecto['inversion_inicial'],
                    flujos_base=proyecto['flujos_caja'],
                    tasa_descuento_base=proyecto['tasa_descuento']
                )
            }
        
        return jsonify(resultado), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'})