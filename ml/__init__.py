"""
Módulo de Machine Learning - Econova
Autor: Diego (Responsable de ML)

Este módulo contiene:
- predecir.py: Funciones de predicción para uso directo
- entrenamiento_modelos.ipynb: Notebook para entrenar modelos
- analisis_sensibilidad.ipynb: Notebook para análisis de sensibilidad
- modelos/: Directorio con modelos entrenados exportados

Uso:
    from ml.predecir import (
        predecir_ingresos,
        predecir_crecimiento,
        clasificar_riesgo,
        simular_monte_carlo_van,
        analisis_tornado,
        analisis_escenarios
    )
"""

from ml.predecir import (
    predecir_ingresos,
    predecir_crecimiento,
    clasificar_riesgo,
    simular_monte_carlo_van,
    analisis_tornado,
    analisis_escenarios
)

__all__ = [
    'predecir_ingresos',
    'predecir_crecimiento',
    'clasificar_riesgo',
    'simular_monte_carlo_van',
    'analisis_tornado',
    'analisis_escenarios'
]

__version__ = '1.0.0'
__author__ = 'Diego'
