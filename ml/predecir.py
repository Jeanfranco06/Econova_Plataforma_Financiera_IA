"""
Módulo de Predicción ML - Econova
Autor: Diego (Responsable de ML)

Este módulo proporciona funciones de predicción que pueden ser utilizadas
directamente desde scripts o importadas en otros módulos.

Uso:
    from ml.predecir import predecir_ingresos, predecir_crecimiento, clasificar_riesgo
    
    resultado = predecir_ingresos({
        'ingresos_anuales': 500000,
        'gastos_operativos': 350000,
        ...
    })
"""

import os
import sys
import numpy as np
from typing import Dict, Any, List, Optional

# Agregar el directorio raíz al path para importaciones
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importar servicios
try:
    from app.servicios.ml_servicio import (
        ServicioML, 
        SimulacionMonteCarlo, 
        AnalisisSensibilidad,
        obtener_servicio_ml
    )
    SERVICIOS_DISPONIBLES = True
except ImportError:
    SERVICIOS_DISPONIBLES = False


def predecir_ingresos(datos_empresa: Dict[str, float]) -> Dict[str, Any]:
    """
    Predice los ingresos del próximo año para una empresa.
    
    Args:
        datos_empresa: Diccionario con indicadores financieros:
            - ingresos_anuales (requerido): Ingresos actuales en soles
            - gastos_operativos (requerido): Gastos operativos anuales
            - activos_totales (requerido): Total de activos
            - pasivos_totales (requerido): Total de pasivos
            - antiguedad_anios (opcional): Años de operación, default=5
            - num_empleados (opcional): Número de empleados, default=50
            - num_clientes (opcional): Número de clientes, default=500
            - tasa_retencion_clientes (opcional): Tasa de retención 0-1, default=0.8
            - inflacion (opcional): Tasa de inflación esperada, default=0.04
            - tasa_interes_referencia (opcional): Tasa de interés, default=0.08
            - crecimiento_pib_sector (opcional): Crecimiento del sector, default=0.03
            
    Returns:
        Dict con predicción de ingresos e intervalos de confianza
        
    Example:
        >>> resultado = predecir_ingresos({
        ...     'ingresos_anuales': 500000,
        ...     'gastos_operativos': 350000,
        ...     'activos_totales': 800000,
        ...     'pasivos_totales': 300000
        ... })
        >>> print(resultado['ingresos_predichos'])
    """
    # Validar datos requeridos
    campos_requeridos = ['ingresos_anuales', 'gastos_operativos', 'activos_totales', 'pasivos_totales']
    for campo in campos_requeridos:
        if campo not in datos_empresa:
            raise ValueError(f"Campo requerido faltante: {campo}")
    
    if SERVICIOS_DISPONIBLES:
        servicio = obtener_servicio_ml()
        return servicio.predecir_ingresos(datos_empresa)
    else:
        # Predicción simplificada sin el servicio completo
        return _predecir_ingresos_simple(datos_empresa)


def predecir_crecimiento(datos_empresa: Dict[str, float]) -> Dict[str, Any]:
    """
    Predice la tasa de crecimiento anual de una empresa.
    
    Args:
        datos_empresa: Diccionario con indicadores financieros (ver predecir_ingresos)
        
    Returns:
        Dict con predicción de crecimiento y categorización
        
    Example:
        >>> resultado = predecir_crecimiento({
        ...     'ingresos_anuales': 500000,
        ...     'gastos_operativos': 350000,
        ...     'activos_totales': 800000,
        ...     'pasivos_totales': 300000
        ... })
        >>> print(f"Crecimiento esperado: {resultado['crecimiento_porcentaje']}%")
    """
    campos_requeridos = ['ingresos_anuales', 'gastos_operativos', 'activos_totales', 'pasivos_totales']
    for campo in campos_requeridos:
        if campo not in datos_empresa:
            raise ValueError(f"Campo requerido faltante: {campo}")
    
    if SERVICIOS_DISPONIBLES:
        servicio = obtener_servicio_ml()
        return servicio.predecir_crecimiento(datos_empresa)
    else:
        return _predecir_crecimiento_simple(datos_empresa)


def clasificar_riesgo(datos_empresa: Dict[str, float]) -> Dict[str, Any]:
    """
    Clasifica el nivel de riesgo financiero de una empresa.
    
    Args:
        datos_empresa: Diccionario con indicadores financieros (ver predecir_ingresos)
        
    Returns:
        Dict con clasificación de riesgo (Bajo, Medio, Alto) y recomendaciones
        
    Example:
        >>> resultado = clasificar_riesgo({
        ...     'ingresos_anuales': 500000,
        ...     'gastos_operativos': 350000,
        ...     'activos_totales': 800000,
        ...     'pasivos_totales': 300000
        ... })
        >>> print(f"Nivel de riesgo: {resultado['nivel_riesgo']}")
    """
    campos_requeridos = ['ingresos_anuales', 'gastos_operativos', 'activos_totales', 'pasivos_totales']
    for campo in campos_requeridos:
        if campo not in datos_empresa:
            raise ValueError(f"Campo requerido faltante: {campo}")
    
    if SERVICIOS_DISPONIBLES:
        servicio = obtener_servicio_ml()
        return servicio.clasificar_riesgo(datos_empresa)
    else:
        return _clasificar_riesgo_simple(datos_empresa)


def simular_monte_carlo_van(
    inversion_inicial: float,
    flujos_caja: List[float],
    tasa_descuento: float,
    variacion_flujos: float = 0.15,
    variacion_tasa: float = 0.02,
    n_simulaciones: int = 10000
) -> Dict[str, Any]:
    """
    Realiza una simulación Monte Carlo para el VAN de un proyecto.
    
    Args:
        inversion_inicial: Inversión inicial del proyecto
        flujos_caja: Lista de flujos de caja esperados por periodo
        tasa_descuento: Tasa de descuento base
        variacion_flujos: Coeficiente de variación de flujos (default 15%)
        variacion_tasa: Desviación estándar de la tasa (default 2%)
        n_simulaciones: Número de simulaciones (default 10000)
        
    Returns:
        Dict con estadísticas de la simulación
        
    Example:
        >>> resultado = simular_monte_carlo_van(
        ...     inversion_inicial=100000,
        ...     flujos_caja=[25000, 30000, 35000, 40000, 45000],
        ...     tasa_descuento=0.12
        ... )
        >>> print(f"VAN medio: S/ {resultado['van_medio']:,.2f}")
        >>> print(f"Probabilidad VAN > 0: {resultado['probabilidad_van_positivo']:.1%}")
    """
    if SERVICIOS_DISPONIBLES:
        mc = SimulacionMonteCarlo(n_simulaciones=n_simulaciones)
        return mc.simular_van(
            inversion_inicial=inversion_inicial,
            flujos_base=flujos_caja,
            tasa_descuento_base=tasa_descuento,
            variacion_flujos=variacion_flujos,
            variacion_tasa=variacion_tasa
        )
    else:
        return _simular_monte_carlo_simple(
            inversion_inicial, flujos_caja, tasa_descuento, 
            variacion_flujos, variacion_tasa, n_simulaciones
        )


def analisis_tornado(
    inversion_inicial: float,
    flujos_caja: List[float],
    tasa_descuento: float,
    variacion: float = 0.20
) -> Dict[str, Any]:
    """
    Realiza un análisis de tornado para identificar variables más sensibles.
    
    Args:
        inversion_inicial: Inversión inicial del proyecto
        flujos_caja: Lista de flujos de caja esperados
        tasa_descuento: Tasa de descuento base
        variacion: Variación porcentual a aplicar (default ±20%)
        
    Returns:
        Dict con resultados del análisis de tornado
        
    Example:
        >>> resultado = analisis_tornado(
        ...     inversion_inicial=100000,
        ...     flujos_caja=[25000, 30000, 35000, 40000, 45000],
        ...     tasa_descuento=0.12
        ... )
        >>> print(f"Variable más sensible: {resultado['variable_mas_sensible']}")
    """
    if SERVICIOS_DISPONIBLES:
        analisis = AnalisisSensibilidad()
        return analisis.analisis_tornado(
            inversion_inicial=inversion_inicial,
            flujos_base=flujos_caja,
            tasa_base=tasa_descuento,
            variacion=variacion
        )
    else:
        return _analisis_tornado_simple(inversion_inicial, flujos_caja, tasa_descuento, variacion)


def analisis_escenarios(
    inversion_inicial: float,
    flujos_caja: List[float],
    tasa_descuento: float,
    escenarios_config: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Realiza un análisis de escenarios (pesimista, base, optimista).
    
    Args:
        inversion_inicial: Inversión inicial del proyecto
        flujos_caja: Lista de flujos de caja base
        tasa_descuento: Tasa de descuento base
        escenarios_config: Configuración personalizada de escenarios (opcional)
        
    Returns:
        Dict con resultados de cada escenario y recomendación
        
    Example:
        >>> resultado = analisis_escenarios(
        ...     inversion_inicial=100000,
        ...     flujos_caja=[25000, 30000, 35000, 40000, 45000],
        ...     tasa_descuento=0.12
        ... )
        >>> print(resultado['recomendacion'])
    """
    if SERVICIOS_DISPONIBLES:
        analisis = AnalisisSensibilidad()
        return analisis.analisis_escenarios(
            inversion_inicial=inversion_inicial,
            flujos_base=flujos_caja,
            tasa_base=tasa_descuento,
            escenarios_config=escenarios_config
        )
    else:
        return _analisis_escenarios_simple(inversion_inicial, flujos_caja, tasa_descuento)


# ============================================================================
# Funciones simplificadas (fallback cuando no hay servicios disponibles)
# ============================================================================

def _predecir_ingresos_simple(datos: Dict[str, float]) -> Dict[str, Any]:
    """Predicción simplificada de ingresos."""
    margen = (datos['ingresos_anuales'] - datos['gastos_operativos']) / datos['ingresos_anuales']
    ratio_deuda = datos['pasivos_totales'] / datos['activos_totales']
    roi = (datos['ingresos_anuales'] - datos['gastos_operativos']) / datos['activos_totales']
    
    crecimiento = 0.02 + margen * 0.12 + roi * 0.08 - ratio_deuda * 0.04
    prediccion = datos['ingresos_anuales'] * (1 + crecimiento)
    
    return {
        'ingresos_predichos': round(prediccion, 2),
        'crecimiento_esperado_pct': round(crecimiento * 100, 2),
        'modelo_usado': 'Heurístico'
    }


def _predecir_crecimiento_simple(datos: Dict[str, float]) -> Dict[str, Any]:
    """Predicción simplificada de crecimiento."""
    margen = (datos['ingresos_anuales'] - datos['gastos_operativos']) / datos['ingresos_anuales']
    ratio_deuda = datos['pasivos_totales'] / datos['activos_totales']
    roi = (datos['ingresos_anuales'] - datos['gastos_operativos']) / datos['activos_totales']
    
    crecimiento = 0.02 + margen * 0.15 + roi * 0.10 - ratio_deuda * 0.05
    
    return {
        'crecimiento_anual': round(crecimiento, 4),
        'crecimiento_porcentaje': round(crecimiento * 100, 2),
        'categoria': 'Alto' if crecimiento > 0.15 else 'Moderado' if crecimiento > 0.05 else 'Bajo',
        'modelo_usado': 'Heurístico'
    }


def _clasificar_riesgo_simple(datos: Dict[str, float]) -> Dict[str, Any]:
    """Clasificación simplificada de riesgo."""
    margen = (datos['ingresos_anuales'] - datos['gastos_operativos']) / datos['ingresos_anuales']
    ratio_deuda = datos['pasivos_totales'] / datos['activos_totales']
    liquidez = datos['activos_totales'] / (datos['pasivos_totales'] + 1)
    
    score = 0
    if ratio_deuda > 0.7: score += 3
    elif ratio_deuda > 0.5: score += 1
    if margen < 0.1: score += 3
    elif margen < 0.2: score += 1
    if liquidez < 1.2: score += 2
    
    nivel = 'Alto' if score >= 5 else 'Medio' if score >= 2 else 'Bajo'
    
    return {
        'nivel_riesgo': nivel,
        'color': {'Bajo': 'green', 'Medio': 'yellow', 'Alto': 'red'}[nivel],
        'modelo_usado': 'Heurístico'
    }


def _simular_monte_carlo_simple(inv, flujos, tasa, var_flujos, var_tasa, n_sim) -> Dict[str, Any]:
    """Simulación Monte Carlo simplificada."""
    np.random.seed(42)
    resultados = []
    
    for _ in range(n_sim):
        flujos_sim = [max(0, np.random.normal(f, f * var_flujos)) for f in flujos]
        tasa_sim = max(0.01, np.random.normal(tasa, var_tasa))
        
        van = -inv
        for t, f in enumerate(flujos_sim, 1):
            van += f / ((1 + tasa_sim) ** t)
        resultados.append(van)
    
    resultados = np.array(resultados)
    
    return {
        'van_medio': round(float(np.mean(resultados)), 2),
        'van_mediana': round(float(np.median(resultados)), 2),
        'desviacion_estandar': round(float(np.std(resultados)), 2),
        'probabilidad_van_positivo': round(float(np.mean(resultados > 0)), 4),
        'percentil_5': round(float(np.percentile(resultados, 5)), 2),
        'percentil_95': round(float(np.percentile(resultados, 95)), 2),
        'n_simulaciones': n_sim
    }


def _analisis_tornado_simple(inv, flujos, tasa, variacion) -> Dict[str, Any]:
    """Análisis de tornado simplificado."""
    def calc_van(i, f, t):
        van = -i
        for periodo, flujo in enumerate(f, 1):
            van += flujo / ((1 + t) ** periodo)
        return van
    
    van_base = calc_van(inv, flujos, tasa)
    
    resultados = [
        {
            'variable': 'Flujos de Caja',
            'rango': abs(calc_van(inv, [f * (1 + variacion) for f in flujos], tasa) - 
                        calc_van(inv, [f * (1 - variacion) for f in flujos], tasa))
        },
        {
            'variable': 'Inversión Inicial',
            'rango': abs(calc_van(inv * (1 + variacion), flujos, tasa) - 
                        calc_van(inv * (1 - variacion), flujos, tasa))
        },
        {
            'variable': 'Tasa de Descuento',
            'rango': abs(calc_van(inv, flujos, tasa * (1 + variacion)) - 
                        calc_van(inv, flujos, tasa * (1 - variacion)))
        }
    ]
    
    resultados.sort(key=lambda x: x['rango'], reverse=True)
    
    return {
        'van_base': round(van_base, 2),
        'resultados': resultados,
        'variable_mas_sensible': resultados[0]['variable']
    }


def _analisis_escenarios_simple(inv, flujos, tasa) -> Dict[str, Any]:
    """Análisis de escenarios simplificado."""
    def calc_van(i, f, t):
        van = -i
        for periodo, flujo in enumerate(f, 1):
            van += flujo / ((1 + t) ** periodo)
        return van
    
    return {
        'escenarios': {
            'pesimista': {'van': round(calc_van(inv, [f * 0.75 for f in flujos], tasa * 1.25), 2)},
            'base': {'van': round(calc_van(inv, flujos, tasa), 2)},
            'optimista': {'van': round(calc_van(inv, [f * 1.25 for f in flujos], tasa * 0.85), 2)}
        }
    }


# ============================================================================
# Ejecución directa para pruebas
# ============================================================================

if __name__ == '__main__':
    # Datos de ejemplo
    empresa_ejemplo = {
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
    
    print("=" * 60)
    print("🔮 MÓDULO DE PREDICCIÓN ML - ECONOVA")
    print("=" * 60)
    
    print("\n📈 1. PREDICCIÓN DE INGRESOS")
    print("-" * 40)
    resultado_ingresos = predecir_ingresos(empresa_ejemplo)
    print(f"   Ingresos actuales: S/ {empresa_ejemplo['ingresos_anuales']:,.2f}")
    print(f"   Ingresos predichos: S/ {resultado_ingresos['ingresos_predichos']:,.2f}")
    print(f"   Crecimiento esperado: {resultado_ingresos['crecimiento_esperado_pct']:.2f}%")
    
    print("\n📊 2. PREDICCIÓN DE CRECIMIENTO")
    print("-" * 40)
    resultado_crecimiento = predecir_crecimiento(empresa_ejemplo)
    print(f"   Crecimiento anual: {resultado_crecimiento['crecimiento_porcentaje']:.2f}%")
    print(f"   Categoría: {resultado_crecimiento['categoria']}")
    
    print("\n⚠️ 3. CLASIFICACIÓN DE RIESGO")
    print("-" * 40)
    resultado_riesgo = clasificar_riesgo(empresa_ejemplo)
    print(f"   Nivel de riesgo: {resultado_riesgo['nivel_riesgo']}")
    
    print("\n🎲 4. SIMULACIÓN MONTE CARLO")
    print("-" * 40)
    resultado_mc = simular_monte_carlo_van(
        inversion_inicial=100000,
        flujos_caja=[25000, 30000, 35000, 40000, 45000],
        tasa_descuento=0.12,
        n_simulaciones=5000
    )
    print(f"   VAN medio: S/ {resultado_mc['van_medio']:,.2f}")
    print(f"   Probabilidad VAN > 0: {resultado_mc['probabilidad_van_positivo']:.1%}")
    
    print("\n🌪️ 5. ANÁLISIS DE TORNADO")
    print("-" * 40)
    resultado_tornado = analisis_tornado(
        inversion_inicial=100000,
        flujos_caja=[25000, 30000, 35000, 40000, 45000],
        tasa_descuento=0.12
    )
    print(f"   Variable más sensible: {resultado_tornado['variable_mas_sensible']}")
    
    print("\n" + "=" * 60)
    print("✅ Todas las predicciones completadas exitosamente")
