#!/usr/bin/env python3
"""
Tests para las funciones de machine learning
"""

import pytest
import numpy as np
from app import crear_app
from app.servicios.ml_servicio import MLServicio

class TestMLServicio:
    """Tests para el servicio de ML"""

    def setup_method(self):
        """Configuración antes de cada test"""
        self.app = crear_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()

    def teardown_method(self):
        """Limpieza después de cada test"""
        self.app_context.pop()

    def test_predecir_ventas(self):
        """Test predicción de ventas"""
        datos_historicos = [100, 120, 110, 130, 125, 140, 135, 150]

        prediccion = MLServicio.predecir_ventas(datos_historicos, periodos=3)

        assert isinstance(prediccion, list)
        assert len(prediccion) == 3
        assert all(isinstance(x, (int, float)) for x in prediccion)

    def test_analizar_tendencias(self):
        """Test análisis de tendencias"""
        datos_ventas = [100, 105, 110, 108, 115, 120, 118, 125]
        datos_costos = [80, 82, 85, 87, 89, 91, 93, 95]

        resultado = MLServicio.analizar_tendencias(datos_ventas, datos_costos)

        assert "tendencia_ventas" in resultado
        assert "tendencia_costos" in resultado
        assert "correlacion" in resultado
        assert isinstance(resultado["correlacion"], (int, float))
        assert -1 <= resultado["correlacion"] <= 1

    def test_clasificar_riesgo(self):
        """Test clasificación de riesgo crediticio"""
        datos_empresa = {
            "ingresos": 500000,
            "deuda": 150000,
            "antiguedad": 5,
            "sector": "Tecnología",
            "tamano": "Mediana"
        }

        riesgo = MLServicio.clasificar_riesgo(datos_empresa)

        assert isinstance(riesgo, str)
        assert riesgo in ["Bajo", "Medio", "Alto", "Muy Alto"]

    def test_recomendar_inversiones(self):
        """Test recomendaciones de inversión"""
        perfil_inversor = {
            "capital": 10000,
            "tolerancia_riesgo": "Media",
            "plazo": 5,
            "objetivos": ["Crecimiento", "Preservación"]
        }

        recomendaciones = MLServicio.recomendar_inversiones(perfil_inversor)

        assert isinstance(recomendaciones, list)
        assert len(recomendaciones) > 0

        for rec in recomendaciones:
            assert "tipo" in rec
            assert "porcentaje" in rec
            assert "riesgo" in rec
            assert "retorno_esperado" in rec

    def test_analizar_mercado(self):
        """Test análisis de mercado"""
        datos_mercado = {
            "indice_bursatil": [100, 102, 105, 103, 108, 110, 107, 112],
            "tasa_interes": 0.045,
            "inflacion": 0.025,
            "sector": "Tecnología"
        }

        analisis = MLServicio.analizar_mercado(datos_mercado)

        assert "sentimiento" in analisis
        assert "volatilidad" in analisis
        assert "recomendacion" in analisis
        assert isinstance(analisis["volatilidad"], (int, float))

    def test_validar_datos_ml(self):
        """Test validación de datos para ML"""
        # Datos válidos
        datos_validos = {
            "ventas": [100, 120, 110, 130, 125],
            "costos": [80, 85, 82, 88, 90],
            "periodos": 5
        }

        assert MLServicio.validar_datos_ml(datos_validos)

        # Datos inválidos
        datos_invalidos = {
            "ventas": [],  # Lista vacía
            "costos": [80, 85],
            "periodos": 5
        }

        assert not MLServicio.validar_datos_ml(datos_invalidos)

if __name__ == "__main__":
    # Ejecutar tests manualmente
    test_instance = TestMLServicio()

    print("🧪 Ejecutando tests de machine learning...")

    try:
        test_instance.setup_method()

        test_instance.test_predecir_ventas()
        print("✅ Test Predicción de Ventas pasado")

        test_instance.test_analizar_tendencias()
        print("✅ Test Análisis de Tendencias pasado")

        test_instance.test_clasificar_riesgo()
        print("✅ Test Clasificación de Riesgo pasado")

        test_instance.test_recomendar_inversiones()
        print("✅ Test Recomendaciones pasado")

        test_instance.test_analizar_mercado()
        print("✅ Test Análisis de Mercado pasado")

        test_instance.test_validar_datos_ml()
        print("✅ Test Validación pasado")

        test_instance.teardown_method()

        print("\n🎉 Todos los tests de ML pasaron exitosamente!")

    except Exception as e:
        print(f"❌ Error en tests de ML: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
