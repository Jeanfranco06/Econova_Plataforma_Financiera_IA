"""
Servicio de Simulación de Ahorro e Inversión
Autor: Sistema Econova

Funcionalidades:
- Proyección de ahorro con aportes periódicos
- Cálculo de valor futuro
- Comparación de instrumentos de inversión
- Análisis de inflación
- Proyecciones con impuestos
"""

import numpy as np
from typing import Dict, List, Any, Optional


class ServicioAhorroInversion:
    """Servicio para cálculos de ahorro e inversiones"""
    
    @staticmethod
    def validar_parametros_ahorro(monto_inicial: float, aporte_mensual: float,
                                  tasa_anual: float, meses: int):
        """Valida parámetros del ahorro"""
        if monto_inicial < 0:
            raise ValueError("El monto inicial no puede ser negativo")
        if aporte_mensual < 0:
            raise ValueError("El aporte mensual no puede ser negativo")
        if tasa_anual < -100:
            raise ValueError("La tasa anual inválida")
        if meses <= 0:
            raise ValueError("El período debe ser mayor a 0")
        if meses > 1200:
            raise ValueError("El período no puede exceder 100 años")
    
    @staticmethod
    def calcular_valor_futuro_simple(monto_inicial: float, tasa_anual: float, 
                                    meses: int) -> float:
        """
        Calcula valor futuro con interés simple
        Fórmula: VF = VP × (1 + r × t)
        """
        tasa_mensual = (tasa_anual / 100) / 12
        vf = monto_inicial * (1 + tasa_mensual * meses)
        return vf
    
    @staticmethod
    def calcular_valor_futuro_compuesto(monto_inicial: float, tasa_anual: float,
                                       meses: int) -> float:
        """
        Calcula valor futuro con interés compuesto
        Fórmula: VF = VP × (1 + r)^t
        """
        tasa_mensual = (tasa_anual / 100) / 12
        vf = monto_inicial * ((1 + tasa_mensual) ** meses)
        return vf
    
    @staticmethod
    def calcular_ahorro_con_aportes(monto_inicial: float, aporte_mensual: float,
                                   tasa_anual: float, meses: int,
                                   tasa_impuesto: float = 0,
                                   inflacion_anual: float = 0) -> Dict[str, Any]:
        """
        Simula crecimiento de ahorro con aportes periódicos y capitalización compuesta
        
        Args:
            monto_inicial: Monto inicial de ahorro
            aporte_mensual: Aporte mensual
            tasa_anual: Tasa de rendimiento anual (%)
            meses: Número de meses
            tasa_impuesto: Tasa de impuesto sobre intereses (%)
            inflacion_anual: Inflación anual (%) - Para poder adquisitivo
            
        Returns:
            Dict con proyección detallada
        """
        ServicioAhorroInversion.validar_parametros_ahorro(
            monto_inicial, aporte_mensual, tasa_anual, meses
        )
        
        if tasa_impuesto < 0 or tasa_impuesto > 100:
            raise ValueError("La tasa de impuesto debe estar entre 0 y 100%")
        
        tasa_mensual = (tasa_anual / 100) / 12
        inflacion_mensual = (inflacion_anual / 100) / 12
        
        proyeccion = []
        saldo = monto_inicial
        interes_total_bruto = 0
        impuestos_total = 0
        aporte_total = 0
        
        for mes in range(1, meses + 1):
            # Agregar aporte al inicio del mes
            saldo += aporte_mensual
            aporte_total += aporte_mensual
            
            # Calcular interés sobre saldo
            interes_mes = saldo * tasa_mensual
            interes_total_bruto += interes_mes
            
            # Calcular impuesto sobre interés
            impuesto_mes = interes_mes * (tasa_impuesto / 100)
            impuestos_total += impuesto_mes
            
            # Aplicar interés neto (después de impuesto)
            saldo = saldo + interes_mes - impuesto_mes
            
            # Calcular poder adquisitivo considerando inflación
            poder_adquisitivo = saldo / ((1 + inflacion_mensual) ** mes)
            
            # Datos para el mes
            if mes % 12 == 0 or mes == 1 or mes == meses:  # Mostrar cada año + primero y último
                proyeccion.append({
                    'mes': mes,
                    'ano': round(mes / 12, 1),
                    'aporte_mes': round(aporte_mensual, 2),
                    'aporte_acumulado': round(aporte_total, 2),
                    'interes_mes': round(interes_mes, 2),
                    'impuesto_mes': round(impuesto_mes, 2),
                    'saldo': round(saldo, 2),
                    'saldo_poder_adquisitivo': round(poder_adquisitivo, 2)
                })
        
        ganancia_neta = interes_total_bruto - impuestos_total
        
        return {
            'resumen': {
                'monto_inicial': round(monto_inicial, 2),
                'aporte_total': round(aporte_total, 2),
                'saldo_final': round(saldo, 2),
                'interes_ganado': round(interes_total_bruto, 2),
                'impuestos_pagados': round(impuestos_total, 2),
                'ganancia_neta': round(ganancia_neta, 2),
                'tasa_anual': round(tasa_anual, 2),
                'periodo_meses': meses,
                'periodo_anos': round(meses / 12, 1)
            },
            'indicadores': {
                'rendimiento_porcentaje': round((ganancia_neta / (aporte_total + monto_inicial)) * 100, 2),
                'saldo_poder_adquisitivo_real': round(saldo / ((1 + inflacion_mensual) ** meses), 2),
                'perdida_poder_adquisitivo': round(saldo - (saldo / ((1 + inflacion_mensual) ** meses)), 2),
                'tasa_efectiva_anual': round((((1 + tasa_mensual) ** 12) - 1) * 100, 2),
                'saldo_inicial_total': round(monto_inicial + aporte_total, 2)
            },
            'proyeccion': proyeccion
        }
    
    @staticmethod
    def calcular_valor_futuro_con_aportes(monto_inicial: float, aporte_mensual: float,
                                         tasa_anual: float, meses: int) -> float:
        """
        Calcula valor futuro con aportes periódicos (Anualidad ordinaria)
        VF = VP(1+r)^n + A × [((1+r)^n - 1) / r]
        """
        tasa_mensual = (tasa_anual / 100) / 12
        
        if tasa_mensual == 0:
            return monto_inicial + (aporte_mensual * meses)
        
        vf_inicial = monto_inicial * ((1 + tasa_mensual) ** meses)
        vf_aportes = aporte_mensual * (((1 + tasa_mensual) ** meses - 1) / tasa_mensual)
        
        return vf_inicial + vf_aportes
    
    @staticmethod
    def comparar_instrumentos(monto_inicial: float, aporte_mensual: float,
                             meses: int, instrumentos: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compara diferentes opciones de inversión
        
        Args:
            monto_inicial: Monto inicial
            aporte_mensual: Aporte mensual
            meses: Período en meses
            instrumentos: Lista de dicts con:
                - nombre: str
                - tasa_anual: float
                - tasa_impuesto: float (opcional)
                - descripcion: str (opcional)
                
        Returns:
            Dict con comparativa de instrumentos
        """
        comparativa = []
        
        for instrumento in instrumentos:
            nombre = instrumento.get('nombre', 'Instrumento')
            tasa = instrumento.get('tasa_anual', 0)
            tasa_impuesto = instrumento.get('tasa_impuesto', 0)
            descripcion = instrumento.get('descripcion', '')
            
            resultado = ServicioAhorroInversion.calcular_ahorro_con_aportes(
                monto_inicial, aporte_mensual, tasa, meses, tasa_impuesto
            )
            
            comparativa.append({
                'nombre': nombre,
                'descripcion': descripcion,
                'tasa_anual': round(tasa, 2),
                'tasa_impuesto': round(tasa_impuesto, 2),
                'saldo_final': resultado['resumen']['saldo_final'],
                'interes_ganado': resultado['resumen']['interes_ganado'],
                'ganancia_neta': resultado['resumen']['ganancia_neta'],
                'rendimiento_porcentaje': resultado['indicadores']['rendimiento_porcentaje']
            })
        
        # Ordenar por saldo final descendente
        comparativa.sort(key=lambda x: x['saldo_final'], reverse=True)
        
        # Calcular mejores opciones
        mejor_opcion = comparativa[0] if comparativa else None
        peor_opcion = comparativa[-1] if comparativa else None
        
        return {
            'comparativa': comparativa,
            'mejor_opcion': mejor_opcion,
            'peor_opcion': peor_opcion,
            'diferencia_mejor_peor': round((mejor_opcion['saldo_final'] - peor_opcion['saldo_final']), 2) 
                                    if mejor_opcion and peor_opcion else 0,
            'resumen': {
                'monto_inicial': monto_inicial,
                'aporte_total': aporte_mensual * meses,
                'periodo_meses': meses
            }
        }
    
    @staticmethod
    def analizar_meta_ahorro(monto_objetivo: float, monto_inicial: float,
                            tasa_anual: float, aporte_mensual: float) -> Dict[str, Any]:
        """
        Calcula cuánto tiempo se necesita para alcanzar una meta de ahorro
        
        Args:
            monto_objetivo: Monto que se desea alcanzar
            monto_inicial: Monto inicial de ahorro
            tasa_anual: Tasa de rendimiento anual
            aporte_mensual: Aporte mensual
            
        Returns:
            Dict con análisis de tiempo necesario
        """
        if monto_inicial > monto_objetivo:
            return {
                'meta_alcanzada': True,
                'meses_necesarios': 0,
                'anos_necesarios': 0,
                'mensaje': 'Ya tienes el monto objetivo'
            }
        
        tasa_mensual = (tasa_anual / 100) / 12
        saldo = monto_inicial
        meses = 0
        max_meses = 1200  # 100 años
        
        while saldo < monto_objetivo and meses < max_meses:
            meses += 1
            saldo += aporte_mensual
            saldo = saldo * (1 + tasa_mensual)
        
        if meses >= max_meses:
            return {
                'meta_alcanzable': False,
                'mensaje': 'La meta no es alcanzable con los parámetros especificados en 100 años'
            }
        
        return {
            'meta_alcanzada': True,
            'meses_necesarios': meses,
            'anos_necesarios': round(meses / 12, 1),
            'saldo_final': round(saldo, 2),
            'saldo_objetivo': round(monto_objetivo, 2),
            'diferencia': round(saldo - monto_objetivo, 2),
            'aporte_total': round(aporte_mensual * meses, 2),
            'interes_ganado': round(saldo - monto_inicial - (aporte_mensual * meses), 2)
        }
    
    @staticmethod
    def analizar_sensibilidad_ahorro(monto_inicial: float, aporte_mensual: float,
                                    tasa_anual: float, meses: int,
                                    variacion_tasa: float = 1.0) -> Dict[str, Any]:
        """
        Analiza sensibilidad del ahorro ante cambios en la tasa
        
        Args:
            monto_inicial: Monto inicial
            aporte_mensual: Aporte mensual
            tasa_anual: Tasa anual base
            meses: Período
            variacion_tasa: Variación en puntos porcentuales
            
        Returns:
            Dict con escenarios de sensibilidad
        """
        resultado_base = ServicioAhorroInversion.calcular_ahorro_con_aportes(
            monto_inicial, aporte_mensual, tasa_anual, meses
        )
        saldo_base = resultado_base['resumen']['saldo_final']
        
        escenarios = []
        tasas_analiticas = [
            tasa_anual - variacion_tasa * 2,
            tasa_anual - variacion_tasa,
            tasa_anual,
            tasa_anual + variacion_tasa,
            tasa_anual + variacion_tasa * 2
        ]
        
        for tasa in tasas_analiticas:
            if tasa < -100:
                continue
            
            try:
                resultado = ServicioAhorroInversion.calcular_ahorro_con_aportes(
                    monto_inicial, aporte_mensual, tasa, meses
                )
                saldo = resultado['resumen']['saldo_final']
                variacion = ((saldo - saldo_base) / saldo_base) * 100
                
                escenarios.append({
                    'tasa': round(tasa, 2),
                    'saldo_final': round(saldo, 2),
                    'variacion_porcentaje': round(variacion, 2),
                    'escenario': 'Base' if tasa == tasa_anual else
                               ('Pesimista' if tasa < tasa_anual else 'Optimista')
                })
            except:
                continue
        
        return {
            'tasa_actual': round(tasa_anual, 2),
            'saldo_actual': round(saldo_base, 2),
            'escenarios': escenarios,
            'impacto_maximo_alza': round(max([e['variacion_porcentaje'] for e in escenarios 
                                             if e['tasa'] > tasa_anual], default=0), 2),
            'impacto_maximo_baja': round(min([e['variacion_porcentaje'] for e in escenarios
                                             if e['tasa'] < tasa_anual], default=0), 2)
        }
