"""
Implementa cálculos de:
- VAN (Valor Actual Neto)
- TIR (Tasa Interna de Retorno)
- WACC (Costo Promedio Ponderado de Capital)
- Análisis de Portafolio
- Reemplazo de Activos
"""
import numpy as np
from scipy.optimize import newton
from typing import List, Dict, Any, Tuple
from app.utils.validadores import (
    validar_flujos_caja, validar_tasa, validar_inversion_inicial,
    validar_numero_positivo, validar_ponderaciones, validar_wacc_params
)

class ServicioFinanciero:
    """Servicio para cálculos financieros avanzados"""
    
    @staticmethod
    def calcular_van(inversion_inicial: float, flujos_caja: List[float], 
                     tasa_descuento: float) -> Dict[str, Any]:
        """
        Calcula el Valor Actual Neto (VAN)
        
        Fórmula: VAN = -I₀ + Σ(FCₜ / (1 + r)ᵗ)
        
        Args:
            inversion_inicial: Inversión inicial (valor positivo)
            flujos_caja: Lista de flujos de caja por periodo
            tasa_descuento: Tasa de descuento (en decimal, ej: 0.10 = 10%)
            
        Returns:
            Dict con VAN y análisis detallado
        """
        # Validar inputs
        inv = validar_inversion_inicial(inversion_inicial)
        flujos = validar_flujos_caja(flujos_caja)
        tasa = validar_tasa(tasa_descuento)
        
        # Calcular flujos descontados
        flujos_descontados = []
        van = -inv  # Inversión inicial como salida de efectivo
        
        for t, flujo in enumerate(flujos, start=1):
            flujo_descontado = flujo / ((1 + tasa) ** t)
            flujos_descontados.append(flujo_descontado)
            van += flujo_descontado
        
        # Determinar decisión
        decision = "ACEPTAR" if van > 0 else "RECHAZAR" if van < 0 else "INDIFERENTE"
        
        return {
            'van': round(van, 2),
            'inversion_inicial': inv,
            'tasa_descuento': tasa,
            'flujos_caja': flujos,
            'flujos_descontados': [round(f, 2) for f in flujos_descontados],
            'periodos': len(flujos),
            'decision': decision,
            'interpretacion': f"El proyecto {'genera' if van > 0 else 'pierde'} ${abs(van):,.2f} en valor presente"
        }
    
    @staticmethod
    def calcular_tir(inversion_inicial: float, flujos_caja: List[float], 
                     tasa_referencia: float = 0.10) -> Dict[str, Any]:
        """
        Calcula la Tasa Interna de Retorno (TIR)
        
        La TIR es la tasa que hace el VAN = 0
        Fórmula: 0 = -I₀ + Σ(FCₜ / (1 + TIR)ᵗ)
        
        Args:
            inversion_inicial: Inversión inicial
            flujos_caja: Lista de flujos de caja
            tasa_referencia: Tasa de referencia para comparación
            
        Returns:
            Dict con TIR y análisis
        """
        # Validar inputs
        inv = validar_inversion_inicial(inversion_inicial)
        flujos = validar_flujos_caja(flujos_caja)
        tasa_ref = validar_tasa(tasa_referencia)
        
        # Función VAN para optimización
        def van_funcion(tasa):
            van = -inv
            for t, flujo in enumerate(flujos, start=1):
                van += flujo / ((1 + tasa) ** t)
            return van
        
        try:
            # Calcular TIR usando método de Newton-Raphson
            tir = newton(van_funcion, x0=0.1, maxiter=100)
            
            # Si la TIR es muy alta o muy baja, puede ser irreal
            if tir < -0.99 or tir > 10:
                tir = None
                decision = "NO CALCULABLE"
                interpretacion = "No se pudo calcular una TIR razonable para este proyecto"
            else:
                decision = "ACEPTAR" if tir > tasa_ref else "RECHAZAR"
                interpretacion = f"El proyecto rinde {tir*100:.2f}% anual, " + \
                               f"{'superior' if tir > tasa_ref else 'inferior'} a la tasa de referencia ({tasa_ref*100:.2f}%)"
        except:
            tir = None
            decision = "NO CALCULABLE"
            interpretacion = "No existe TIR o los flujos no permiten calcularla"
        
        return {
            'tir': round(tir, 4) if tir else None,
            'tir_porcentaje': round(tir * 100, 2) if tir else None,
            'inversion_inicial': inv,
            'flujos_caja': flujos,
            'tasa_referencia': tasa_ref,
            'tasa_referencia_porcentaje': round(tasa_ref * 100, 2),
            'decision': decision,
            'interpretacion': interpretacion
        }
    
    @staticmethod
    def calcular_wacc(capital_propio: float, deuda: float, costo_capital: float,
                      costo_deuda: float, tasa_impuesto: float) -> Dict[str, Any]:
        """
        Calcula el Costo Promedio Ponderado de Capital (WACC)
        
        Fórmula: WACC = (E/V) × Re + (D/V) × Rd × (1 - T)
        Donde:
        - E = Capital propio (Equity)
        - D = Deuda (Debt)
        - V = E + D (Valor total)
        - Re = Costo del capital propio
        - Rd = Costo de la deuda
        - T = Tasa de impuesto
        
        Args:
            capital_propio: Monto de capital propio
            deuda: Monto de deuda
            costo_capital: Costo del capital propio (tasa)
            costo_deuda: Costo de la deuda (tasa)
            tasa_impuesto: Tasa de impuesto sobre utilidades
            
        Returns:
            Dict con WACC y desglose
        """
        # Validar parámetros
        params = validar_wacc_params({
            'capital_propio': capital_propio,
            'deuda': deuda,
            'costo_capital': costo_capital,
            'costo_deuda': costo_deuda,
            'tasa_impuesto': tasa_impuesto
        })
        
        E = params['capital_propio']
        D = params['deuda']
        Re = params['costo_capital']
        Rd = params['costo_deuda']
        T = params['tasa_impuesto']
        
        # Valor total
        V = E + D
        
        # Proporciones
        peso_capital = E / V
        peso_deuda = D / V
        
        # WACC
        wacc = (peso_capital * Re) + (peso_deuda * Rd * (1 - T))
        
        return {
            'wacc': round(wacc, 4),
            'wacc_porcentaje': round(wacc * 100, 2),
            'capital_propio': E,
            'deuda': D,
            'valor_total': V,
            'peso_capital': round(peso_capital, 4),
            'peso_capital_porcentaje': round(peso_capital * 100, 2),
            'peso_deuda': round(peso_deuda, 4),
            'peso_deuda_porcentaje': round(peso_deuda * 100, 2),
            'costo_capital': Re,
            'costo_capital_porcentaje': round(Re * 100, 2),
            'costo_deuda': Rd,
            'costo_deuda_porcentaje': round(Rd * 100, 2),
            'tasa_impuesto': T,
            'tasa_impuesto_porcentaje': round(T * 100, 2),
            'escudo_fiscal': round(peso_deuda * Rd * T, 4),
            'interpretacion': f"El costo de capital de la empresa es {wacc*100:.2f}%. " + \
                            f"Todo proyecto debe rendir al menos esta tasa para crear valor."
        }
    
    @staticmethod
    def analizar_portafolio(retornos: List[float], ponderaciones: List[float],
                           volatilidades: List[float] = None,
                           matriz_correlacion: List[List[float]] = None) -> Dict[str, Any]:
        """
        Analiza un portafolio de inversión
        
        Calcula:
        - Retorno esperado del portafolio
        - Riesgo (volatilidad) del portafolio
        - Ratio de Sharpe (si se proporciona tasa libre de riesgo)
        
        Args:
            retornos: Lista de retornos esperados de cada activo
            ponderaciones: Lista de ponderaciones (deben sumar 1)
            volatilidades: Lista de volatilidades de cada activo (opcional)
            matriz_correlacion: Matriz de correlación entre activos (opcional)
            
        Returns:
            Dict con análisis del portafolio
        """
        # Validar inputs
        rets = validar_flujos_caja(retornos, "retornos")
        ponds = validar_ponderaciones(ponderaciones)
        
        if len(rets) != len(ponds):
            raise ValueError("El número de retornos debe coincidir con el número de ponderaciones")
        
        # Convertir a numpy arrays
        retornos_arr = np.array(rets)
        ponderaciones_arr = np.array(ponds)
        
        # Retorno esperado del portafolio
        retorno_portafolio = np.dot(ponderaciones_arr, retornos_arr)
        
        resultado = {
            'retorno_esperado': round(retorno_portafolio, 4),
            'retorno_esperado_porcentaje': round(retorno_portafolio * 100, 2),
            'activos': len(retornos),
            'ponderaciones': [round(p, 4) for p in ponds],
            'retornos_individuales': rets
        }
        
        # Calcular riesgo si se proporcionan volatilidades
        if volatilidades:
            vols = validar_flujos_caja(volatilidades, "volatilidades")
            
            if len(vols) != len(retornos):
                raise ValueError("El número de volatilidades debe coincidir con el número de activos")
            
            # Si hay matriz de correlación, calcular riesgo del portafolio
            if matriz_correlacion:
                vols_arr = np.array(vols)
                corr_matrix = np.array(matriz_correlacion)
                
                # Matriz de covarianza
                cov_matrix = np.outer(vols_arr, vols_arr) * corr_matrix
                
                # Varianza del portafolio
                varianza_portafolio = np.dot(ponderaciones_arr, np.dot(cov_matrix, ponderaciones_arr))
                riesgo_portafolio = np.sqrt(varianza_portafolio)
                
                resultado['riesgo'] = round(riesgo_portafolio, 4)
                resultado['riesgo_porcentaje'] = round(riesgo_portafolio * 100, 2)
                resultado['volatilidades_individuales'] = vols
                
                # Ratio de Sharpe (asumiendo tasa libre de riesgo = 0)
                ratio_sharpe = retorno_portafolio / riesgo_portafolio if riesgo_portafolio > 0 else 0
                resultado['ratio_sharpe'] = round(ratio_sharpe, 4)
                resultado['interpretacion'] = f"Portafolio con retorno esperado de {retorno_portafolio*100:.2f}% " + \
                                             f"y riesgo de {riesgo_portafolio*100:.2f}%. Sharpe: {ratio_sharpe:.2f}"
            else:
                # Riesgo simple (promedio ponderado de volatilidades)
                riesgo_simple = np.dot(ponderaciones_arr, np.array(vols))
                resultado['riesgo_simple'] = round(riesgo_simple, 4)
                resultado['interpretacion'] = f"Portafolio con retorno esperado de {retorno_portafolio*100:.2f}%"
        else:
            resultado['interpretacion'] = f"Portafolio con retorno esperado de {retorno_portafolio*100:.2f}%"
        
        return resultado
    
    @staticmethod
    def analizar_reemplazo_activo(costo_actual_anual: float, costo_nuevo_anual: float,
                                   costo_nuevo_compra: float, valor_salvamento_actual: float,
                                   vida_util_nuevo: int, tasa_descuento: float) -> Dict[str, Any]:
        """
        Analiza si conviene reemplazar un activo
        
        Compara:
        - Costo de mantener el activo actual
        - Costo de reemplazarlo con uno nuevo
        
        Args:
            costo_actual_anual: Costo anual de operación del activo actual
            costo_nuevo_anual: Costo anual de operación del nuevo activo
            costo_nuevo_compra: Costo de compra del nuevo activo
            valor_salvamento_actual: Valor de venta del activo actual
            vida_util_nuevo: Vida útil del nuevo activo (años)
            tasa_descuento: Tasa de descuento
            
        Returns:
            Dict con análisis de reemplazo
        """
        # Validar inputs
        costo_actual = validar_numero_positivo(costo_actual_anual, "Costo actual anual")
        costo_nuevo = validar_numero_positivo(costo_nuevo_anual, "Costo nuevo anual")
        costo_compra = validar_numero_positivo(costo_nuevo_compra, "Costo de compra")
        salvamento = validar_numero_positivo(valor_salvamento_actual, "Valor de salvamento")
        vida = int(vida_util_nuevo)
        tasa = validar_tasa(tasa_descuento)
        
        # Inversión neta al reemplazar
        inversion_neta = costo_compra - salvamento
        
        # Ahorro anual
        ahorro_anual = costo_actual - costo_nuevo
        
        # Flujos de caja del reemplazo
        flujos = [ahorro_anual] * vida
        
        # VAN del reemplazo
        van_reemplazo = ServicioFinanciero.calcular_van(inversion_neta, flujos, tasa)
        
        decision = "REEMPLAZAR" if van_reemplazo['van'] > 0 else "MANTENER ACTUAL"
        
        return {
            'decision': decision,
            'van_reemplazo': van_reemplazo['van'],
            'inversion_neta': inversion_neta,
            'costo_actual_anual': costo_actual,
            'costo_nuevo_anual': costo_nuevo,
            'ahorro_anual': ahorro_anual,
            'costo_nuevo_compra': costo_compra,
            'valor_salvamento_actual': salvamento,
            'vida_util_nuevo': vida,
            'tasa_descuento': tasa,
            'interpretacion': f"{'Conviene reemplazar' if van_reemplazo['van'] > 0 else 'Conviene mantener el activo actual'}. " + \
                            f"VAN del reemplazo: ${van_reemplazo['van']:,.2f}"
        }
    
    @staticmethod
    def calcular_periodo_recuperacion(inversion_inicial: float, 
                                       flujos_caja: List[float]) -> Dict[str, Any]:
        """
        Calcula el periodo de recuperación (Payback Period)
        
        Args:
            inversion_inicial: Inversión inicial
            flujos_caja: Lista de flujos de caja
            
        Returns:
            Dict con periodo de recuperación
        """
        inv = validar_inversion_inicial(inversion_inicial)
        flujos = validar_flujos_caja(flujos_caja)
        
        acumulado = 0
        periodo = 0
        
        for i, flujo in enumerate(flujos, start=1):
            acumulado += flujo
            if acumulado >= inv:
                # Calcular fracción del periodo
                exceso = acumulado - inv
                fraccion = 1 - (exceso / flujo)
                periodo = i - 1 + fraccion
                break
        else:
            periodo = None  # No se recupera en el horizonte dado
        
        return {
            'periodo_recuperacion': round(periodo, 2) if periodo else None,
            'inversion_inicial': inv,
            'flujos_caja': flujos,
            'se_recupera': periodo is not None,
            'interpretacion': f"La inversión se recupera en {periodo:.2f} periodos" if periodo \
                            else "La inversión no se recupera en el horizonte analizado"
        }