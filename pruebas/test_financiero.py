import pytest
from app.servicios.financiero_servicio import ServicioFinanciero

class TestVAN:
    """Pruebas para cálculo de VAN"""
    
    def test_van_positivo(self):
        """VAN debe ser positivo para proyecto rentable"""
        resultado = ServicioFinanciero.calcular_van(
            inversion_inicial=100000,
            flujos_caja=[30000, 35000, 40000, 45000, 50000],
            tasa_descuento=0.10
        )
        
        assert resultado['van'] > 0
        assert resultado['decision'] == 'ACEPTAR'
        assert resultado['inversion_inicial'] == 100000
        assert len(resultado['flujos_descontados']) == 5
    
    def test_van_negativo(self):
        """VAN debe ser negativo para proyecto no rentable"""
        resultado = ServicioFinanciero.calcular_van(
            inversion_inicial=100000,
            flujos_caja=[10000, 10000, 10000],
            tasa_descuento=0.10
        )
        
        assert resultado['van'] < 0
        assert resultado['decision'] == 'RECHAZAR'
    
    def test_van_validacion_inversion(self):
        """Debe validar inversión inicial"""
        with pytest.raises(ValueError):
            ServicioFinanciero.calcular_van(
                inversion_inicial=-1000,  # Negativa
                flujos_caja=[1000, 2000],
                tasa_descuento=0.10
            )
    
    def test_van_validacion_flujos(self):
        """Debe validar flujos de caja"""
        with pytest.raises(ValueError):
            ServicioFinanciero.calcular_van(
                inversion_inicial=1000,
                flujos_caja=[],  # Vacío
                tasa_descuento=0.10
            )

class TestTIR:
    """Pruebas para cálculo de TIR"""
    
    def test_tir_calculo_basico(self):
        """TIR debe calcularse correctamente"""
        resultado = ServicioFinanciero.calcular_tir(
            inversion_inicial=100000,
            flujos_caja=[30000, 35000, 40000, 45000, 50000],
            tasa_referencia=0.10
        )
        
        assert resultado['tir'] is not None
        assert resultado['tir'] > 0
        assert resultado['tir_porcentaje'] is not None
        assert resultado['decision'] in ['ACEPTAR', 'RECHAZAR', 'NO CALCULABLE']
    
    def test_tir_mayor_que_referencia(self):
        """TIR mayor a tasa de referencia debe aceptarse"""
        resultado = ServicioFinanciero.calcular_tir(
            inversion_inicial=10000,
            flujos_caja=[3000, 4000, 5000, 6000],
            tasa_referencia=0.10
        )
        
        assert resultado['tir'] > resultado['tasa_referencia']
        assert resultado['decision'] == 'ACEPTAR'

class TestWACC:
    """Pruebas para cálculo de WACC"""
    
    def test_wacc_calculo_basico(self):
        """WACC debe calcularse correctamente"""
        resultado = ServicioFinanciero.calcular_wacc(
            capital_propio=500000,
            deuda=300000,
            costo_capital=0.15,
            costo_deuda=0.08,
            tasa_impuesto=0.30
        )
        
        assert 'wacc' in resultado
        assert resultado['wacc'] > 0
        assert resultado['wacc'] < 1
        assert resultado['peso_capital'] + resultado['peso_deuda'] == pytest.approx(1.0, rel=0.01)
    
    def test_wacc_sin_deuda(self):
        """WACC con solo capital propio"""
        resultado = ServicioFinanciero.calcular_wacc(
            capital_propio=1000000,
            deuda=0,
            costo_capital=0.15,
            costo_deuda=0.08,
            tasa_impuesto=0.30
        )
        
        assert resultado['wacc'] == pytest.approx(0.15, rel=0.01)
        assert resultado['peso_capital'] == 1.0
        assert resultado['peso_deuda'] == 0.0
    
    def test_wacc_validacion_tasas(self):
        """Debe validar tasas"""
        with pytest.raises(ValueError):
            ServicioFinanciero.calcular_wacc(
                capital_propio=100000,
                deuda=50000,
                costo_capital=1.5,  # Mayor a 100%
                costo_deuda=0.08,
                tasa_impuesto=0.30
            )

class TestPortafolio:
    """Pruebas para análisis de portafolio"""
    
    def test_portafolio_retorno_simple(self):
        """Retorno de portafolio debe calcularse"""
        resultado = ServicioFinanciero.analizar_portafolio(
            retornos=[0.10, 0.15, 0.12],
            ponderaciones=[0.4, 0.35, 0.25]
        )
        
        assert 'retorno_esperado' in resultado
        assert resultado['retorno_esperado'] > 0
        assert resultado['activos'] == 3
    
    def test_portafolio_con_riesgo(self):
        """Portafolio con volatilidades y correlación"""
        matriz_corr = [
            [1.0, 0.5, 0.3],
            [0.5, 1.0, 0.4],
            [0.3, 0.4, 1.0]
        ]
        
        resultado = ServicioFinanciero.analizar_portafolio(
            retornos=[0.12, 0.15, 0.10],
            ponderaciones=[0.4, 0.35, 0.25],
            volatilidades=[0.20, 0.25, 0.15],
            matriz_correlacion=matriz_corr
        )
        
        assert 'riesgo' in resultado
        assert 'ratio_sharpe' in resultado
        assert resultado['riesgo'] > 0
    
    def test_portafolio_validacion_ponderaciones(self):
        """Ponderaciones deben sumar 100%"""
        with pytest.raises(ValueError):
            ServicioFinanciero.analizar_portafolio(
                retornos=[0.10, 0.15],
                ponderaciones=[0.4, 0.4]  # Suma 80%
            )

class TestReemplazoActivo:
    """Pruebas para análisis de reemplazo de activos"""
    
    def test_reemplazo_conviene(self):
        """Debe recomendar reemplazo cuando conviene"""
        resultado = ServicioFinanciero.analizar_reemplazo_activo(
            costo_actual_anual=50000,
            costo_nuevo_anual=30000,
            costo_nuevo_compra=150000,
            valor_salvamento_actual=20000,
            vida_util_nuevo=10,
            tasa_descuento=0.10
        )
        
        assert 'decision' in resultado
        assert resultado['decision'] in ['REEMPLAZAR', 'MANTENER ACTUAL']
        assert 'van_reemplazo' in resultado
    
    def test_reemplazo_no_conviene(self):
        """Debe rechazar reemplazo cuando no conviene"""
        resultado = ServicioFinanciero.analizar_reemplazo_activo(
            costo_actual_anual=20000,
            costo_nuevo_anual=18000,  # Poco ahorro
            costo_nuevo_compra=500000,  # Muy caro
            valor_salvamento_actual=10000,
            vida_util_nuevo=5,
            tasa_descuento=0.10
        )
        
        assert resultado['van_reemplazo'] < 0
        assert resultado['decision'] == 'MANTENER ACTUAL'

class TestPeriodoRecuperacion:
    """Pruebas para periodo de recuperación"""
    
    def test_periodo_recuperacion_simple(self):
        """Periodo de recuperación básico"""
        resultado = ServicioFinanciero.calcular_periodo_recuperacion(
            inversion_inicial=100000,
            flujos_caja=[30000, 40000, 50000, 60000]
        )
        
        assert resultado['se_recupera'] == True
        assert resultado['periodo_recuperacion'] > 0
        assert resultado['periodo_recuperacion'] < 4
    
    def test_periodo_no_recuperacion(self):
        """Inversión no se recupera"""
        resultado = ServicioFinanciero.calcular_periodo_recuperacion(
            inversion_inicial=100000,
            flujos_caja=[10000, 10000, 10000]
        )
        
        assert resultado['se_recupera'] == False
        assert resultado['periodo_recuperacion'] is None

# Ejecutar pruebas
if __name__ == '__main__':
    pytest.main([__file__, '-v'])