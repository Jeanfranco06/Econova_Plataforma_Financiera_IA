#!/usr/bin/env python3
"""
Tests para las funciones financieras
"""

import pytest
from app import crear_app
from app.servicios.financiero_servicio import FinancieroServicio

class TestFinancieroServicio:
    """Tests para el servicio financiero"""

    def setup_method(self):
        """Configuración antes de cada test"""
        self.app = crear_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()

    def teardown_method(self):
        """Limpieza después de cada test"""
        self.app_context.pop()

    def test_calcular_van(self):
        """Test cálculo de VAN"""
        flujos = [-1000, 200, 300, 400, 500]
        tasa = 0.1

        van = FinancieroServicio.calcular_van(flujos, tasa)
        assert isinstance(van, (int, float))
        # VAN debería ser positivo para flujos favorables
        assert van > 0

    def test_calcular_tir(self):
        """Test cálculo de TIR"""
        flujos = [-1000, 200, 300, 400, 500]

        tir = FinancieroServicio.calcular_tir(flujos)
        assert isinstance(tir, (int, float))
        assert 0 < tir < 1  # TIR como decimal

    def test_calcular_wacc(self):
        """Test cálculo de WACC"""
        costo_equity = 0.12
        costo_deuda = 0.06
        tasa_impuestos = 0.25
        peso_equity = 0.6
        peso_deuda = 0.4

        wacc = FinancieroServicio.calcular_wacc(
            costo_equity, costo_deuda, tasa_impuestos,
            peso_equity, peso_deuda
        )

        assert isinstance(wacc, (int, float))
        assert 0 < wacc < 1

    def test_analizar_portafolio(self):
        """Test análisis de portafolio"""
        activos = [
            {"nombre": "Acción A", "peso": 0.4, "retorno": 0.12, "riesgo": 0.2},
            {"nombre": "Acción B", "peso": 0.6, "retorno": 0.08, "riesgo": 0.15}
        ]

        resultado = FinancieroServicio.analizar_portafolio(activos)

        assert "retorno_portafolio" in resultado
        assert "riesgo_portafolio" in resultado
        assert "sharpe_ratio" in resultado
        assert isinstance(resultado["retorno_portafolio"], (int, float))
        assert isinstance(resultado["riesgo_portafolio"], (int, float))

    def test_validar_datos_financieros(self):
        """Test validación de datos financieros"""
        # Datos válidos
        datos_validos = {
            "flujos": [-1000, 200, 300, 400],
            "tasa": 0.1,
            "periodos": 4
        }

        assert FinancieroServicio.validar_datos_financieros(datos_validos)

        # Datos inválidos
        datos_invalidos = {
            "flujos": [],  # Flujos vacíos
            "tasa": -0.1,  # Tasa negativa
            "periodos": 0
        }

        assert not FinancieroServicio.validar_datos_financieros(datos_invalidos)

if __name__ == "__main__":
    # Ejecutar tests manualmente
    test_instance = TestFinancieroServicio()

    print("🧪 Ejecutando tests de servicios financieros...")

    try:
        test_instance.setup_method()

        test_instance.test_calcular_van()
        print("✅ Test VAN pasado")

        test_instance.test_calcular_tir()
        print("✅ Test TIR pasado")

        test_instance.test_calcular_wacc()
        print("✅ Test WACC pasado")

        test_instance.test_analizar_portafolio()
        print("✅ Test Portafolio pasado")

        test_instance.test_validar_datos_financieros()
        print("✅ Test Validación pasado")

        test_instance.teardown_method()

        print("\n🎉 Todos los tests pasaron exitosamente!")

    except Exception as e:
        print(f"❌ Error en tests: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
