# Utilidades para exportar resultados a diferentes formatos

import json
from typing import Dict, Any, List
from datetime import datetime
import pandas as pd

def exportar_a_json(datos: Dict[str, Any], archivo: str = None) -> str:
    """
    Exporta datos a formato JSON
    
    Args:
        datos: Diccionario con datos a exportar
        archivo: Ruta del archivo (opcional)
        
    Returns:
        str: String JSON
    """
    json_str = json.dumps(datos, indent=2, ensure_ascii=False, default=str)
    
    if archivo:
        with open(archivo, 'w', encoding='utf-8') as f:
            f.write(json_str)
    
    return json_str

def exportar_a_csv(datos: List[Dict[str, Any]], archivo: str) -> str:
    """
    Exporta datos a formato CSV
    
    Args:
        datos: Lista de diccionarios
        archivo: Ruta del archivo
        
    Returns:
        str: Ruta del archivo creado
    """
    df = pd.DataFrame(datos)
    df.to_csv(archivo, index=False, encoding='utf-8')
    return archivo

def formatear_resultado_van(resultado: Dict[str, Any]) -> Dict[str, Any]:
    """
    Formatea resultado de VAN para exportación
    
    Args:
        resultado: Diccionario con resultado de VAN
        
    Returns:
        Dict: Resultado formateado
    """
    return {
        'tipo_calculo': 'Valor Actual Neto (VAN)',
        'fecha_calculo': datetime.now().isoformat(),
        'inversion_inicial': f"${resultado.get('inversion_inicial', 0):,.2f}",
        'tasa_descuento': f"{resultado.get('tasa_descuento', 0)*100:.2f}%",
        'van': f"${resultado.get('van', 0):,.2f}",
        'decision': 'ACEPTAR PROYECTO' if resultado.get('van', 0) > 0 else 'RECHAZAR PROYECTO',
        'flujos_caja': resultado.get('flujos_caja', []),
        'flujos_descontados': resultado.get('flujos_descontados', [])
    }

def formatear_resultado_tir(resultado: Dict[str, Any]) -> Dict[str, Any]:
    """
    Formatea resultado de TIR para exportación
    
    Args:
        resultado: Diccionario con resultado de TIR
        
    Returns:
        Dict: Resultado formateado
    """
    return {
        'tipo_calculo': 'Tasa Interna de Retorno (TIR)',
        'fecha_calculo': datetime.now().isoformat(),
        'inversion_inicial': f"${resultado.get('inversion_inicial', 0):,.2f}",
        'tir': f"{resultado.get('tir', 0)*100:.2f}%",
        'tasa_referencia': f"{resultado.get('tasa_descuento', 0)*100:.2f}%",
        'decision': 'ACEPTAR PROYECTO' if resultado.get('tir', 0) > resultado.get('tasa_descuento', 0) else 'RECHAZAR PROYECTO',
        'flujos_caja': resultado.get('flujos_caja', [])
    }

def formatear_resultado_wacc(resultado: Dict[str, Any]) -> Dict[str, Any]:
    """
    Formatea resultado de WACC para exportación
    
    Args:
        resultado: Diccionario con resultado de WACC
        
    Returns:
        Dict: Resultado formateado
    """
    return {
        'tipo_calculo': 'Costo Promedio Ponderado de Capital (WACC)',
        'fecha_calculo': datetime.now().isoformat(),
        'capital_propio': f"${resultado.get('capital_propio', 0):,.2f}",
        'deuda': f"${resultado.get('deuda', 0):,.2f}",
        'valor_total': f"${resultado.get('valor_total', 0):,.2f}",
        'costo_capital': f"{resultado.get('costo_capital', 0)*100:.2f}%",
        'costo_deuda': f"{resultado.get('costo_deuda', 0)*100:.2f}%",
        'tasa_impuesto': f"{resultado.get('tasa_impuesto', 0)*100:.2f}%",
        'wacc': f"{resultado.get('wacc', 0)*100:.2f}%",
        'interpretacion': f"El costo de capital de la empresa es {resultado.get('wacc', 0)*100:.2f}%"
    }

def formatear_resultado_portafolio(resultado: Dict[str, Any]) -> Dict[str, Any]:
    """
    Formatea resultado de portafolio para exportación
    
    Args:
        resultado: Diccionario con resultado de portafolio
        
    Returns:
        Dict: Resultado formateado
    """
    return {
        'tipo_calculo': 'Análisis de Portafolio',
        'fecha_calculo': datetime.now().isoformat(),
        'retorno_esperado': f"{resultado.get('retorno_esperado', 0)*100:.2f}%",
        'riesgo': f"{resultado.get('riesgo', 0)*100:.2f}%",
        'ratio_sharpe': f"{resultado.get('ratio_sharpe', 0):.4f}",
        'activos': resultado.get('activos', []),
        'ponderaciones': resultado.get('ponderaciones', [])
    }

def generar_resumen_simulacion(simulacion: Dict[str, Any]) -> str:
    """
    Genera un resumen textual de una simulación
    
    Args:
        simulacion: Diccionario con datos de simulación
        
    Returns:
        str: Resumen en texto
    """
    tipo = simulacion.get('tipo_simulacion', 'DESCONOCIDO')
    nombre = simulacion.get('nombre', 'Sin nombre')
    fecha = simulacion.get('fecha_creacion', datetime.now())
    
    resumen = f"""
╔══════════════════════════════════════════════════════════════╗
║            RESUMEN DE SIMULACIÓN FINANCIERA                  ║
╚══════════════════════════════════════════════════════════════╝

Nombre: {nombre}
Tipo: {tipo}
Fecha: {fecha}

"""
    
    if tipo == 'VAN':
        res = simulacion.get('resultados', {})
        resumen += f"""
Inversión Inicial: ${res.get('inversion_inicial', 0):,.2f}
Tasa de Descuento: {res.get('tasa_descuento', 0)*100:.2f}%
VAN Calculado: ${res.get('van', 0):,.2f}

DECISIÓN: {'✓ ACEPTAR PROYECTO' if res.get('van', 0) > 0 else '✗ RECHAZAR PROYECTO'}
"""
    
    elif tipo == 'TIR':
        res = simulacion.get('resultados', {})
        resumen += f"""
Inversión Inicial: ${res.get('inversion_inicial', 0):,.2f}
TIR Calculada: {res.get('tir', 0)*100:.2f}%
Tasa de Referencia: {res.get('tasa_descuento', 0)*100:.2f}%

DECISIÓN: {'✓ ACEPTAR PROYECTO' if res.get('tir', 0) > res.get('tasa_descuento', 0) else '✗ RECHAZAR PROYECTO'}
"""
    
    elif tipo == 'WACC':
        res = simulacion.get('resultados', {})
        resumen += f"""
Capital Propio: ${res.get('capital_propio', 0):,.2f}
Deuda: ${res.get('deuda', 0):,.2f}
WACC: {res.get('wacc', 0)*100:.2f}%

Este es el costo de capital que la empresa debe superar en sus proyectos.
"""
    
    resumen += "\n" + "="*64 + "\n"
    
    return resumen