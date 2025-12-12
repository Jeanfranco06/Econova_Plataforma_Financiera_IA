"""
Pruebas Unitarias para el Módulo de Machine Learning
Autor: Diego (Responsable de ML)

Ejecutar con: pytest pruebas/test_ml.py -v
"""

import pytest
import sys
import os
import numpy as np

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.servicios.ml_servicio import (
    ServicioML,
    SimulacionMonteCarlo,
    AnalisisSensibilidad,
    obtener_servicio_ml
)


# ============================================================================
# Fixtures
# ============================================================================

@pytest.fixture
def servicio_ml():
    """Fixture que proporciona una instancia del servicio ML."""
    return ServicioML()


@pytest.fixture
def datos_empresa_ejemplo():
    """Fixture con datos de empresa de ejemplo."""
    return {
        'ingresos_anuales': 500000,
        'gastos_operativos': 350000,
        'activos_totales': 800000,
        'pasivos_totales': 300000,
        'antiguedad_anios': 8,
        'num_empleados': 45,
        'num_clientes': 1200,
        'tasa_retencion_clientes': 0.85,
        'inflacion': 0.04,
        'tasa_interes_referencia': 0.08,
        'crecimiento_pib_sector': 0.035
    }


@pytest.fixture
def datos_proyecto_ejemplo():
    """Fixture con datos de proyecto de inversión de ejemplo."""
    return {
        'inversion_inicial': 100000,
        'flujos_caja': [25000, 30000, 35000, 40000, 45000],
        'tasa_descuento': 0.12
    }


# ============================================================================
# Tests de ServicioML
# ============================================================================

class TestServicioML:
    """Tests para la clase ServicioML."""
    
    def test_instancia_servicio(self, servicio_ml):
        """Test que el servicio se instancia correctamente."""
        assert servicio_ml is not None
        assert isinstance(servicio_ml, ServicioML)
    
    def test_singleton_servicio(self):
        """Test que obtener_servicio_ml retorna siempre la misma instancia."""
        servicio1 = obtener_servicio_ml()
        servicio2 = obtener_servicio_ml()
        assert servicio1 is servicio2


class TestPrediccionIngresos:
    """Tests para predicción de ingresos."""
    
    def test_prediccion_ingresos_basica(self, servicio_ml, datos_empresa_ejemplo):
        """Test de predicción de ingresos con datos completos."""
        resultado = servicio_ml.predecir_ingresos(datos_empresa_ejemplo)
        
        assert 'ingresos_predichos' in resultado
        assert 'crecimiento_esperado_pct' in resultado
        assert 'intervalo_confianza_90' in resultado
        assert resultado['ingresos_predichos'] > 0
    
    def test_prediccion_ingresos_datos_minimos(self, servicio_ml):
        """Test de predicción con datos mínimos requeridos."""
        datos_minimos = {
            'ingresos_anuales': 100000,
            'gastos_operativos': 70000,
            'activos_totales': 200000,
            'pasivos_totales': 80000
        }
        resultado = servicio_ml.predecir_ingresos(datos_minimos)
        
        assert 'ingresos_predichos' in resultado
        assert resultado['ingresos_predichos'] > 0
    
    def test_prediccion_ingresos_intervalo_confianza(self, servicio_ml, datos_empresa_ejemplo):
        """Test que el intervalo de confianza es válido."""
        resultado = servicio_ml.predecir_ingresos(datos_empresa_ejemplo)
        
        ic = resultado['intervalo_confianza_90']
        assert ic['inferior'] < resultado['ingresos_predichos']
        assert ic['superior'] > resultado['ingresos_predichos']


class TestPrediccionCrecimiento:
    """Tests para predicción de crecimiento."""
    
    def test_prediccion_crecimiento_basica(self, servicio_ml, datos_empresa_ejemplo):
        """Test de predicción de crecimiento."""
        resultado = servicio_ml.predecir_crecimiento(datos_empresa_ejemplo)
        
        assert 'crecimiento_anual' in resultado
        assert 'crecimiento_porcentaje' in resultado
        assert 'categoria' in resultado
        assert resultado['categoria'] in ['Alto', 'Moderado', 'Bajo', 'Negativo']
    
    def test_categorias_crecimiento(self, servicio_ml):
        """Test que las categorías de crecimiento son correctas."""
        # Empresa con alto crecimiento esperado
        datos_alto = {
            'ingresos_anuales': 500000,
            'gastos_operativos': 200000,  # Alto margen
            'activos_totales': 300000,
            'pasivos_totales': 50000,  # Bajo endeudamiento
            'crecimiento_pib_sector': 0.10  # Alto crecimiento sector
        }
        resultado = servicio_ml.predecir_crecimiento(datos_alto)
        assert resultado['crecimiento_anual'] > 0


class TestClasificacionRiesgo:
    """Tests para clasificación de riesgo."""
    
    def test_clasificacion_riesgo_basica(self, servicio_ml, datos_empresa_ejemplo):
        """Test de clasificación de riesgo."""
        resultado = servicio_ml.clasificar_riesgo(datos_empresa_ejemplo)
        
        assert 'nivel_riesgo' in resultado
        assert 'probabilidades' in resultado
        assert 'recomendaciones' in resultado
        assert resultado['nivel_riesgo'] in ['Bajo', 'Medio', 'Alto']
    
    def test_riesgo_alto_endeudamiento(self, servicio_ml):
        """Test que alto endeudamiento genera riesgo alto."""
        datos_riesgoso = {
            'ingresos_anuales': 100000,
            'gastos_operativos': 95000,  # Bajo margen
            'activos_totales': 200000,
            'pasivos_totales': 180000  # Alto endeudamiento (90%)
        }
        resultado = servicio_ml.clasificar_riesgo(datos_riesgoso)
        
        # Debería ser riesgo medio o alto
        assert resultado['nivel_riesgo'] in ['Medio', 'Alto']
    
    def test_riesgo_bajo_empresa_saludable(self, servicio_ml):
        """Test que empresa saludable tiene riesgo bajo."""
        datos_saludable = {
            'ingresos_anuales': 500000,
            'gastos_operativos': 300000,  # Buen margen (40%)
            'activos_totales': 800000,
            'pasivos_totales': 200000  # Bajo endeudamiento (25%)
        }
        resultado = servicio_ml.clasificar_riesgo(datos_saludable)
        
        assert resultado['nivel_riesgo'] == 'Bajo'
    
    def test_recomendaciones_presentes(self, servicio_ml, datos_empresa_ejemplo):
        """Test que siempre hay recomendaciones."""
        resultado = servicio_ml.clasificar_riesgo(datos_empresa_ejemplo)
        
        assert len(resultado['recomendaciones']) > 0


# ============================================================================
# Tests de Simulación Monte Carlo
# ============================================================================

class TestSimulacionMonteCarlo:
    """Tests para la simulación Monte Carlo."""
    
    def test_simulacion_van_basica(self, datos_proyecto_ejemplo):
        """Test básico de simulación Monte Carlo."""
        mc = SimulacionMonteCarlo(n_simulaciones=1000)
        resultado = mc.simular_van(
            inversion_inicial=datos_proyecto_ejemplo['inversion_inicial'],
            flujos_base=datos_proyecto_ejemplo['flujos_caja'],
            tasa_descuento_base=datos_proyecto_ejemplo['tasa_descuento']
        )
        
        assert 'van_medio' in resultado
        assert 'van_mediana' in resultado
        assert 'desviacion_estandar' in resultado
        assert 'probabilidad_van_positivo' in resultado
        assert 'n_simulaciones' in resultado
    
    def test_simulacion_n_simulaciones(self):
        """Test que se realizan el número correcto de simulaciones."""
        n = 500
        mc = SimulacionMonteCarlo(n_simulaciones=n)
        resultado = mc.simular_van(
            inversion_inicial=100000,
            flujos_base=[30000, 30000, 30000, 30000],
            tasa_descuento_base=0.10
        )
        
        assert resultado['n_simulaciones'] == n
    
    def test_simulacion_probabilidades_validas(self, datos_proyecto_ejemplo):
        """Test que las probabilidades están en rango [0, 1]."""
        mc = SimulacionMonteCarlo(n_simulaciones=1000)
        resultado = mc.simular_van(
            inversion_inicial=datos_proyecto_ejemplo['inversion_inicial'],
            flujos_base=datos_proyecto_ejemplo['flujos_caja'],
            tasa_descuento_base=datos_proyecto_ejemplo['tasa_descuento']
        )
        
        assert 0 <= resultado['probabilidad_van_positivo'] <= 1
        assert 0 <= resultado['probabilidad_van_negativo'] <= 1
    
    def test_simulacion_percentiles(self, datos_proyecto_ejemplo):
        """Test que los percentiles son coherentes."""
        mc = SimulacionMonteCarlo(n_simulaciones=1000)
        resultado = mc.simular_van(
            inversion_inicial=datos_proyecto_ejemplo['inversion_inicial'],
            flujos_base=datos_proyecto_ejemplo['flujos_caja'],
            tasa_descuento_base=datos_proyecto_ejemplo['tasa_descuento']
        )
        
        # El percentil 5 debe ser menor que el 95
        assert resultado['percentil_5'] < resultado['percentil_95']
        # El mínimo debe ser <= percentil 5
        assert resultado['van_minimo'] <= resultado['percentil_5']
        # El máximo debe ser >= percentil 95
        assert resultado['van_maximo'] >= resultado['percentil_95']


# ============================================================================
# Tests de Análisis de Sensibilidad
# ============================================================================

class TestAnalisisSensibilidad:
    """Tests para análisis de sensibilidad."""
    
    def test_calcular_van(self):
        """Test del cálculo básico de VAN."""
        analisis = AnalisisSensibilidad()
        van = analisis.calcular_van(
            inversion=100000,
            flujos=[30000, 30000, 30000, 30000, 30000],
            tasa=0.10
        )
        
        # VAN esperado aproximado: -100000 + 30000/1.1 + 30000/1.21 + ...
        assert van > 0  # Con estos flujos debería ser positivo
        assert isinstance(van, float)
    
    def test_analisis_tornado(self, datos_proyecto_ejemplo):
        """Test del análisis de tornado."""
        analisis = AnalisisSensibilidad()
        resultado = analisis.analisis_tornado(
            inversion_inicial=datos_proyecto_ejemplo['inversion_inicial'],
            flujos_base=datos_proyecto_ejemplo['flujos_caja'],
            tasa_base=datos_proyecto_ejemplo['tasa_descuento']
        )
        
        assert 'van_base' in resultado
        assert 'resultados' in resultado
        assert 'variable_mas_sensible' in resultado
        assert len(resultado['resultados']) == 3  # 3 variables analizadas
    
    def test_tornado_ordenado_por_impacto(self, datos_proyecto_ejemplo):
        """Test que los resultados del tornado están ordenados por impacto."""
        analisis = AnalisisSensibilidad()
        resultado = analisis.analisis_tornado(
            inversion_inicial=datos_proyecto_ejemplo['inversion_inicial'],
            flujos_base=datos_proyecto_ejemplo['flujos_caja'],
            tasa_base=datos_proyecto_ejemplo['tasa_descuento']
        )
        
        rangos = [r['rango'] for r in resultado['resultados']]
        assert rangos == sorted(rangos, reverse=True)
    
    def test_analisis_escenarios(self, datos_proyecto_ejemplo):
        """Test del análisis de escenarios."""
        analisis = AnalisisSensibilidad()
        resultado = analisis.analisis_escenarios(
            inversion_inicial=datos_proyecto_ejemplo['inversion_inicial'],
            flujos_base=datos_proyecto_ejemplo['flujos_caja'],
            tasa_base=datos_proyecto_ejemplo['tasa_descuento']
        )
        
        assert 'escenarios' in resultado
        assert 'pesimista' in resultado['escenarios']
        assert 'base' in resultado['escenarios']
        assert 'optimista' in resultado['escenarios']
        assert 'recomendacion' in resultado
    
    def test_escenarios_orden_van(self, datos_proyecto_ejemplo):
        """Test que VAN pesimista < base < optimista."""
        analisis = AnalisisSensibilidad()
        resultado = analisis.analisis_escenarios(
            inversion_inicial=datos_proyecto_ejemplo['inversion_inicial'],
            flujos_base=datos_proyecto_ejemplo['flujos_caja'],
            tasa_base=datos_proyecto_ejemplo['tasa_descuento']
        )
        
        van_pesimista = resultado['escenarios']['pesimista']['van']
        van_base = resultado['escenarios']['base']['van']
        van_optimista = resultado['escenarios']['optimista']['van']
        
        assert van_pesimista < van_base < van_optimista
    
    def test_punto_equilibrio_flujos(self, datos_proyecto_ejemplo):
        """Test del cálculo de punto de equilibrio para flujos."""
        analisis = AnalisisSensibilidad()
        resultado = analisis.punto_equilibrio(
            inversion_inicial=datos_proyecto_ejemplo['inversion_inicial'],
            flujos_base=datos_proyecto_ejemplo['flujos_caja'],
            tasa_base=datos_proyecto_ejemplo['tasa_descuento'],
            variable='flujos'
        )
        
        if 'error' not in resultado:
            assert 'multiplicador_equilibrio' in resultado
            assert 'variacion_necesaria_pct' in resultado
    
    def test_punto_equilibrio_tasa(self, datos_proyecto_ejemplo):
        """Test del cálculo de punto de equilibrio para tasa (TIR)."""
        analisis = AnalisisSensibilidad()
        resultado = analisis.punto_equilibrio(
            inversion_inicial=datos_proyecto_ejemplo['inversion_inicial'],
            flujos_base=datos_proyecto_ejemplo['flujos_caja'],
            tasa_base=datos_proyecto_ejemplo['tasa_descuento'],
            variable='tasa'
        )
        
        if 'error' not in resultado:
            assert 'tasa_equilibrio' in resultado
            # La TIR debe ser mayor que la tasa de descuento si VAN > 0
            assert resultado['tasa_equilibrio'] > datos_proyecto_ejemplo['tasa_descuento']


# ============================================================================
# Tests de Integración
# ============================================================================

class TestIntegracion:
    """Tests de integración del módulo ML."""
    
    def test_flujo_completo_prediccion(self, servicio_ml, datos_empresa_ejemplo):
        """Test del flujo completo de predicciones."""
        # Predecir ingresos
        pred_ingresos = servicio_ml.predecir_ingresos(datos_empresa_ejemplo)
        assert pred_ingresos['ingresos_predichos'] > 0
        
        # Predecir crecimiento
        pred_crecimiento = servicio_ml.predecir_crecimiento(datos_empresa_ejemplo)
        assert pred_crecimiento['categoria'] in ['Alto', 'Moderado', 'Bajo', 'Negativo']
        
        # Clasificar riesgo
        clasificacion = servicio_ml.clasificar_riesgo(datos_empresa_ejemplo)
        assert clasificacion['nivel_riesgo'] in ['Bajo', 'Medio', 'Alto']
    
    def test_flujo_completo_sensibilidad(self, datos_proyecto_ejemplo):
        """Test del flujo completo de análisis de sensibilidad."""
        mc = SimulacionMonteCarlo(n_simulaciones=500)
        analisis = AnalisisSensibilidad()
        
        # Monte Carlo
        resultado_mc = mc.simular_van(
            inversion_inicial=datos_proyecto_ejemplo['inversion_inicial'],
            flujos_base=datos_proyecto_ejemplo['flujos_caja'],
            tasa_descuento_base=datos_proyecto_ejemplo['tasa_descuento']
        )
        assert resultado_mc['n_simulaciones'] == 500
        
        # Tornado
        resultado_tornado = analisis.analisis_tornado(
            inversion_inicial=datos_proyecto_ejemplo['inversion_inicial'],
            flujos_base=datos_proyecto_ejemplo['flujos_caja'],
            tasa_base=datos_proyecto_ejemplo['tasa_descuento']
        )
        assert len(resultado_tornado['resultados']) == 3
        
        # Escenarios
        resultado_escenarios = analisis.analisis_escenarios(
            inversion_inicial=datos_proyecto_ejemplo['inversion_inicial'],
            flujos_base=datos_proyecto_ejemplo['flujos_caja'],
            tasa_base=datos_proyecto_ejemplo['tasa_descuento']
        )
        assert 'recomendacion' in resultado_escenarios


# ============================================================================
# Tests de Validación de Datos
# ============================================================================

class TestValidacionDatos:
    """Tests para validación de datos de entrada."""
    
    def test_valores_negativos_ingresos(self, servicio_ml):
        """Test con valores potencialmente problemáticos."""
        datos = {
            'ingresos_anuales': 100000,
            'gastos_operativos': 120000,  # Mayor que ingresos (pérdida)
            'activos_totales': 200000,
            'pasivos_totales': 100000
        }
        # No debe fallar, solo dar predicciones ajustadas
        resultado = servicio_ml.predecir_ingresos(datos)
        assert 'ingresos_predichos' in resultado
    
    def test_empresa_con_perdidas(self, servicio_ml):
        """Test con empresa que tiene pérdidas."""
        datos = {
            'ingresos_anuales': 100000,
            'gastos_operativos': 110000,  # Pérdida de 10000
            'activos_totales': 200000,
            'pasivos_totales': 150000
        }
        resultado = servicio_ml.clasificar_riesgo(datos)
        # Debe clasificar como riesgo alto o medio
        assert resultado['nivel_riesgo'] in ['Medio', 'Alto']


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
