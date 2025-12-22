#!/usr/bin/env python3
"""
Tests rápidos para machine learning
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import crear_app
from app.servicios.ml_servicio import MLServicio

def test_rapido_prediccion():
    """Test rápido de predicción"""
    print("🔬 Test rápido - Predicción de ventas")

    app = crear_app('testing')
    with app.app_context():
        datos = [100, 120, 110, 130, 125, 140, 135, 150]
        resultado = MLServicio.predecir_ventas(datos, periodos=2)

        assert len(resultado) == 2
        print(f"✅ Predicción: {resultado}")
        return True

def test_rapido_riesgo():
    """Test rápido de clasificación de riesgo"""
    print("🔬 Test rápido - Clasificación de riesgo")

    app = crear_app('testing')
    with app.app_context():
        datos = {
            "ingresos": 500000,
            "deuda": 150000,
            "antiguedad": 5,
            "sector": "Tecnología"
        }
        riesgo = MLServicio.clasificar_riesgo(datos)

        assert riesgo in ["Bajo", "Medio", "Alto", "Muy Alto"]
        print(f"✅ Riesgo clasificado: {riesgo}")
        return True

def test_rapido_correlacion():
    """Test rápido de análisis de correlación"""
    print("🔬 Test rápido - Análisis de correlación")

    app = crear_app('testing')
    with app.app_context():
        ventas = [100, 105, 110, 108, 115]
        costos = [80, 82, 85, 87, 89]

        resultado = MLServicio.analizar_tendencias(ventas, costos)

        assert "correlacion" in resultado
        assert -1 <= resultado["correlacion"] <= 1
        print(f"✅ Correlación: {resultado['correlacion']:.3f}")
        return True

def test_rapido_recomendaciones():
    """Test rápido de recomendaciones"""
    print("🔬 Test rápido - Recomendaciones de inversión")

    app = crear_app('testing')
    with app.app_context():
        perfil = {
            "capital": 10000,
            "tolerancia_riesgo": "Media",
            "plazo": 3
        }

        recomendaciones = MLServicio.recomendar_inversiones(perfil)

        assert isinstance(recomendaciones, list)
        assert len(recomendaciones) > 0
        print(f"✅ Recomendaciones: {len(recomendaciones)} opciones")
        return True

def main():
    """Ejecutar todos los tests rápidos"""
    print("🚀 Ejecutando tests rápidos de ML\n")

    tests = [
        test_rapido_prediccion,
        test_rapido_riesgo,
        test_rapido_correlacion,
        test_rapido_recomendaciones
    ]

    resultados = []
    for test in tests:
        try:
            resultado = test()
            resultados.append(resultado)
            print()
        except Exception as e:
            print(f"❌ Error en {test.__name__}: {e}")
            resultados.append(False)
            print()

    exitos = sum(resultados)
    total = len(resultados)

    print(f"📊 Resultados: {exitos}/{total} tests pasaron")

    if exitos == total:
        print("🎉 Todos los tests rápidos pasaron!")
        return 0
    else:
        print("❌ Algunos tests fallaron")
        return 1

if __name__ == "__main__":
    sys.exit(main())
