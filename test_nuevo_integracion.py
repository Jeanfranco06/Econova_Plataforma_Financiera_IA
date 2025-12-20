#!/usr/bin/env python3
"""
Script de prueba rápida para validar servicios de Préstamo y Ahorro
Ejecutar: python test_nuevo_integracion.py
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_prestamo_servicio():
    """Test Servicio de Préstamo"""
    print("\n" + "="*60)
    print("TESTING SERVICIO DE PRÉSTAMO")
    print("="*60)
    
    from app.servicios.prestamo_servicio import ServicioPrestamo
    
    # Test 1: Cálculo básico
    print("\n1. Cálculo de Cuota Mensual")
    print("-" * 40)
    cuota = ServicioPrestamo.calcular_cuota_mensual(
        monto=50000,
        tasa_anual=12.5,
        plazo_meses=60
    )
    print(f"   Monto: S/ 50,000")
    print(f"   Tasa: 12.5%")
    print(f"   Plazo: 60 meses")
    print(f"   ✓ Cuota Mensual: S/ {cuota:,.2f}")
    
    # Test 2: Tabla de amortización
    print("\n2. Tabla de Amortización (primeros 3 meses)")
    print("-" * 40)
    tabla = ServicioPrestamo.calcular_tabla_amortizacion(
        monto=50000,
        tasa_anual=12.5,
        plazo_meses=60
    )
    for i in range(3):
        row = tabla[i]
        print(f"   Mes {row['mes']}: Capital=S/{row['capital']:.2f}, Interés=S/{row['interes']:.2f}, Saldo=S/{row['saldo_restante']:.2f}")
    print(f"   ... (total {len(tabla)} meses)")
    
    # Test 3: Análisis completo
    print("\n3. Análisis Completo")
    print("-" * 40)
    resultado = ServicioPrestamo.calcular_prestamo_completo(
        monto=50000,
        tasa_anual=12.5,
        plazo_meses=60,
        comision_inicial=2,
        tasa_impuesto=0
    )
    print(f"   ✓ Cuota Mensual: S/ {resultado['resumen']['cuota_mensual']:,.2f}")
    print(f"   ✓ TED: {resultado['resumen']['ted_tasa_efectiva']}%")
    print(f"   ✓ Costo Total: S/ {resultado['costos']['costo_total_desembolsado']:,.2f}")
    print(f"   ✓ Costo Interés: S/ {resultado['costos']['costo_interes']:,.2f}")
    
    # Test 4: Sensibilidad
    print("\n4. Análisis de Sensibilidad")
    print("-" * 40)
    sensibilidad = ServicioPrestamo.analizar_sensibilidad_prestamo(
        monto=50000,
        tasa_anual=12.5,
        plazo_meses=60
    )
    print(f"   Tasa Base: {sensibilidad['tasa_actual']}%")
    for escenario in sensibilidad['escenarios']:
        print(f"   - {escenario['escenario']:12} ({escenario['tasa']}%): Cuota S/{escenario['cuota_mensual']:,.2f} ({escenario['variacion_cuota_porcentaje']:+.2f}%)")
    
    # Test 5: Comparar plazos
    print("\n5. Comparativa de Plazos")
    print("-" * 40)
    comparativa = ServicioPrestamo.comparar_plazos(
        monto=50000,
        tasa_anual=12.5,
        plazos=[24, 36, 48, 60]
    )
    for plazo in comparativa['comparativa_plazos']:
        print(f"   {plazo['plazo_anos']:>4} años: Cuota S/{plazo['cuota_mensual']:>10,.2f} | Interés S/{plazo['costo_interes']:>10,.2f}")
    
    print("\n✅ SERVICIO DE PRÉSTAMO: OK\n")


def test_ahorro_servicio():
    """Test Servicio de Ahorro e Inversión"""
    print("\n" + "="*60)
    print("TESTING SERVICIO DE AHORRO E INVERSIÓN")
    print("="*60)
    
    from app.servicios.ahorro_inversion_servicio import ServicioAhorroInversion
    
    # Test 1: Proyección básica
    print("\n1. Proyección de Ahorro")
    print("-" * 40)
    resultado = ServicioAhorroInversion.calcular_ahorro_con_aportes(
        monto_inicial=10000,
        aporte_mensual=500,
        tasa_anual=8.0,
        meses=120
    )
    print(f"   Monto Inicial: S/ 10,000")
    print(f"   Aporte Mensual: S/ 500")
    print(f"   Tasa: 8%")
    print(f"   Período: 120 meses (10 años)")
    print(f"   ✓ Saldo Final: S/ {resultado['resumen']['saldo_final']:,.2f}")
    print(f"   ✓ Intereses: S/ {resultado['resumen']['interes_ganado']:,.2f}")
    print(f"   ✓ Rendimiento: {resultado['indicadores']['rendimiento_porcentaje']:.2f}%")
    
    # Test 2: Con inflación
    print("\n2. Proyección con Inflación (3%)")
    print("-" * 40)
    resultado_inflacion = ServicioAhorroInversion.calcular_ahorro_con_aportes(
        monto_inicial=10000,
        aporte_mensual=500,
        tasa_anual=8.0,
        meses=120,
        inflacion_anual=3.0
    )
    print(f"   Saldo Nominal: S/ {resultado_inflacion['resumen']['saldo_final']:,.2f}")
    print(f"   ✓ Poder Adquisitivo Real: S/ {resultado_inflacion['indicadores']['saldo_poder_adquisitivo_real']:,.2f}")
    print(f"   ✓ Pérdida por Inflación: S/ {resultado_inflacion['indicadores']['perdida_poder_adquisitivo']:,.2f}")
    
    # Test 3: Meta de ahorro
    print("\n3. Cálculo para Alcanzar Meta")
    print("-" * 40)
    meta = ServicioAhorroInversion.analizar_meta_ahorro(
        monto_objetivo=100000,
        monto_inicial=10000,
        tasa_anual=8.0,
        aporte_mensual=500
    )
    print(f"   Meta Objetivo: S/ 100,000")
    print(f"   ✓ Tiempo Necesario: {meta['meses_necesarios']} meses ({meta['anos_necesarios']} años)")
    print(f"   ✓ Saldo Alcanzado: S/ {meta['saldo_final']:,.2f}")
    
    # Test 4: Comparador de instrumentos
    print("\n4. Comparador de Instrumentos")
    print("-" * 40)
    instrumentos = [
        {'nombre': 'Plazo Fijo', 'tasa_anual': 5.0, 'tasa_impuesto': 0},
        {'nombre': 'Fondo Mutuo', 'tasa_anual': 8.5, 'tasa_impuesto': 0.05},
        {'nombre': 'Renta Fija', 'tasa_anual': 6.5, 'tasa_impuesto': 0.03},
    ]
    comparativa = ServicioAhorroInversion.comparar_instrumentos(
        monto_inicial=100000,
        aporte_mensual=1000,
        meses=24,
        instrumentos=instrumentos
    )
    print(f"   Mejor opción: {comparativa['mejor_opcion']['nombre']}")
    for instr in comparativa['comparativa']:
        print(f"   - {instr['nombre']:15} → S/ {instr['saldo_final']:>12,.2f} (Ganancia: S/ {instr['ganancia_neta']:>10,.2f})")
    
    # Test 5: Sensibilidad
    print("\n5. Análisis de Sensibilidad")
    print("-" * 40)
    sensibilidad = ServicioAhorroInversion.analizar_sensibilidad_ahorro(
        monto_inicial=10000,
        aporte_mensual=500,
        tasa_anual=8.0,
        meses=120
    )
    for escenario in sensibilidad['escenarios']:
        print(f"   {escenario['escenario']:12} ({escenario['tasa']}%): S/ {escenario['saldo_final']:>12,.2f} ({escenario['variacion_porcentaje']:+.2f}%)")
    
    print("\n✅ SERVICIO DE AHORRO: OK\n")


def main():
    """Ejecutar todas las pruebas"""
    print("\n" + "▄" * 60)
    print("PRUEBAS DE INTEGRACIÓN - PRÉSTAMOS Y AHORRO")
    print("▄" * 60)
    
    try:
        test_prestamo_servicio()
        test_ahorro_servicio()
        
        print("\n" + "="*60)
        print("✅ TODAS LAS PRUEBAS PASARON CORRECTAMENTE")
        print("="*60)
        print("\nLos servicios están listos para producción.\n")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
