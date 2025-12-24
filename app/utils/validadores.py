# Validadores de datos para simulaciones financieras

from typing import List, Dict, Any, Union
from decimal import Decimal, InvalidOperation

def validar_numero_positivo(valor: Any, nombre_campo: str = "valor") -> float:
    """
    Valida que un valor sea un número positivo
    
    Args:
        valor: Valor a validar
        nombre_campo: Nombre del campo para mensajes de error
        
    Returns:
        float: Valor validado
        
    Raises:
        ValueError: Si el valor no es válido
    """
    try:
        numero = float(valor)
        if numero < 0:
            raise ValueError(f"{nombre_campo} debe ser positivo")
        return numero
    except (TypeError, ValueError) as e:
        raise ValueError(f"{nombre_campo} debe ser un número positivo válido: {e}")

def validar_tasa(tasa: Any, nombre_campo: str = "tasa") -> float:
    """
    Valida una tasa de interés o descuento
    
    Args:
        tasa: Tasa a validar (puede estar en porcentaje o decimal)
        nombre_campo: Nombre del campo
        
    Returns:
        float: Tasa en formato decimal
    """
    try:
        tasa_num = float(tasa)
        
        # Si está en porcentaje (>1), convertir a decimal
        if tasa_num > 1:
            tasa_num = tasa_num / 100
        
        if tasa_num < 0 or tasa_num > 1:
            raise ValueError(f"{nombre_campo} debe estar entre 0% y 100%")
        
        return tasa_num
    except (TypeError, ValueError) as e:
        raise ValueError(f"{nombre_campo} inválida: {e}")

def validar_flujos_caja(flujos: List[float], nombre_campo: str = "flujos de caja") -> List[float]:
    """
    Valida una lista de flujos de caja
    
    Args:
        flujos: Lista de flujos de caja
        nombre_campo: Nombre del campo
        
    Returns:
        List[float]: Lista de flujos validados
    """
    if not isinstance(flujos, list):
        raise ValueError(f"{nombre_campo} debe ser una lista")
    
    if len(flujos) == 0:
        raise ValueError(f"{nombre_campo} no puede estar vacía")
    
    try:
        flujos_validados = [float(f) for f in flujos]
        return flujos_validados
    except (TypeError, ValueError) as e:
        raise ValueError(f"{nombre_campo} contiene valores inválidos: {e}")

def validar_inversion_inicial(inversion: Any) -> float:
    """
    Valida inversión inicial (debe ser positiva)
    
    Args:
        inversion: Inversión a validar
        
    Returns:
        float: Inversión validada
    """
    inv = validar_numero_positivo(inversion, "Inversión inicial")
    if inv == 0:
        raise ValueError("Inversión inicial no puede ser cero")
    return inv

def validar_periodo(periodo: Any) -> int:
    """
    Valida un periodo de tiempo (años, meses, etc.)
    
    Args:
        periodo: Periodo a validar
        
    Returns:
        int: Periodo validado
    """
    try:
        periodo_int = int(periodo)
        if periodo_int <= 0:
            raise ValueError("Periodo debe ser mayor a 0")
        if periodo_int > 100:
            raise ValueError("Periodo no puede exceder 100 años")
        return periodo_int
    except (TypeError, ValueError) as e:
        raise ValueError(f"Periodo inválido: {e}")

def validar_ponderaciones(ponderaciones: List[float]) -> List[float]:
    """
    Valida ponderaciones de un portafolio (deben sumar 1 o 100%)
    
    Args:
        ponderaciones: Lista de ponderaciones
        
    Returns:
        List[float]: Ponderaciones validadas (en decimal)
    """
    if not isinstance(ponderaciones, list):
        raise ValueError("Ponderaciones debe ser una lista")
    
    if len(ponderaciones) == 0:
        raise ValueError("Debe haber al menos una ponderación")
    
    try:
        ponds = [float(p) for p in ponderaciones]
        
        # Verificar que todas sean positivas
        if any(p < 0 for p in ponds):
            raise ValueError("Las ponderaciones deben ser positivas")
        
        suma = sum(ponds)
        
        # Si está en porcentaje (suma cercana a 100), convertir
        if 99 <= suma <= 101:
            ponds = [p / 100 for p in ponds]
            suma = sum(ponds)
        
        # Verificar que sumen 1 (con tolerancia)
        if not (0.99 <= suma <= 1.01):
            raise ValueError(f"Las ponderaciones deben sumar 100% (suman {suma*100:.2f}%)")
        
        return ponds
    except ValueError as e:
        raise e
    except Exception as e:
        raise ValueError(f"Error validando ponderaciones: {e}")

def validar_wacc_params(params: Dict[str, Any]) -> Dict[str, float]:
    """
    Valida parámetros para cálculo de WACC
    
    Args:
        params: Diccionario con parámetros
        
    Returns:
        Dict: Parámetros validados
    """
    requeridos = ['capital_propio', 'deuda', 'costo_capital', 'costo_deuda', 'tasa_impuesto']
    
    for campo in requeridos:
        if campo not in params:
            raise ValueError(f"Falta el parámetro requerido: {campo}")
    
    validados = {
        'capital_propio': validar_numero_positivo(params['capital_propio'], 'Capital propio'),
        'deuda': validar_numero_positivo(params['deuda'], 'Deuda'),
        'costo_capital': validar_tasa(params['costo_capital'], 'Costo de capital'),
        'costo_deuda': validar_tasa(params['costo_deuda'], 'Costo de deuda'),
        'tasa_impuesto': validar_tasa(params['tasa_impuesto'], 'Tasa de impuesto')
    }
    
    # Permitir valores por defecto si ambos son cero (para guardar análisis sin calcular)
    if validados['capital_propio'] + validados['deuda'] == 0:
        validados['capital_propio'] = 100000  # Valor por defecto razonable
        validados['deuda'] = 50000  # Valor por defecto razonable
    
    return validados

def validar_datos_simulacion(datos: Dict[str, Any]) -> Dict[str, Any]:
    """
    Valida datos generales de una simulación
    
    Args:
        datos: Diccionario con datos de simulación
        
    Returns:
        Dict: Datos validados
    """
    if not isinstance(datos, dict):
        raise ValueError("Los datos deben ser un diccionario")
    
    # Validar campos comunes
    validados = {}
    
    if 'usuario_id' in datos:
        validados['usuario_id'] = int(datos['usuario_id'])
    
    if 'nombre' in datos:
        if not datos['nombre'] or len(datos['nombre'].strip()) == 0:
            raise ValueError("Nombre de simulación no puede estar vacío")
        validados['nombre'] = datos['nombre'].strip()
    
    if 'tipo_simulacion' in datos:
        tipos_validos = ['VAN', 'TIR', 'WACC', 'PORTAFOLIO', 'REEMPLAZO_ACTIVOS']
        if datos['tipo_simulacion'] not in tipos_validos:
            raise ValueError(f"Tipo de simulación debe ser uno de: {tipos_validos}")
        validados['tipo_simulacion'] = datos['tipo_simulacion']
    
    return validados
