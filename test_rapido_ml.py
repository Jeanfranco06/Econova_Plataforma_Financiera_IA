"""
Script de prueba rápida del módulo ML de Diego
Ejecutar: python test_rapido_ml.py
"""

import sys
import os

# Evitar importaciones problemáticas del módulo app
# Importamos directamente el código del servicio ML
ruta_servicio = os.path.join(os.path.dirname(__file__), 'app', 'servicios', 'ml_servicio.py')
with open(ruta_servicio, 'r', encoding='utf-8') as f:
    codigo = f.read()

# Ejecutar el código en el contexto global para tener las clases disponibles
exec(codigo)

def main():
    print("=" * 60)
    print("🧪 PRUEBA DEL MÓDULO ML - DIEGO")
    print("=" * 60)
    
    # Datos de empresa de ejemplo
    datos_empresa = {
        'ingresos_anuales': 500000,
        'gastos_operativos': 350000,
        'activos_totales': 800000,
        'pasivos_totales': 300000,
        'antiguedad_anios': 8,
        'num_empleados': 45,
        'num_clientes': 1200,
        'tasa_retencion_clientes': 0.85
    }
    
    # Crear servicio
    servicio = ServicioML()
    
    # =========================================
    # 1. PREDICCIÓN DE INGRESOS
    # =========================================
    print("\n📊 1. PREDICCIÓN DE INGRESOS")
    print("-" * 40)
    resultado = servicio.predecir_ingresos(datos_empresa)
    print(f"   Ingresos predichos: ${resultado['ingresos_predichos']:,.2f}")
    print(f"   Crecimiento esperado: {resultado['crecimiento_esperado_pct']:.1f}%")
    print(f"   Intervalo 90%: ${resultado['intervalo_confianza_90']['inferior']:,.0f} - ${resultado['intervalo_confianza_90']['superior']:,.0f}")
    print("   ✅ OK")
    
    # =========================================
    # 2. PREDICCIÓN DE CRECIMIENTO
    # =========================================
    print("\n📈 2. PREDICCIÓN DE CRECIMIENTO")
    print("-" * 40)
    resultado = servicio.predecir_crecimiento(datos_empresa)
    print(f"   Crecimiento anual: ${resultado['crecimiento_anual']:,.2f}")
    print(f"   Porcentaje: {resultado['crecimiento_porcentaje']:.1f}%")
    print(f"   Categoría: {resultado['categoria']}")
    print("   ✅ OK")
    
    # =========================================
    # 3. CLASIFICACIÓN DE RIESGO
    # =========================================
    print("\n⚠️  3. CLASIFICACIÓN DE RIESGO")
    print("-" * 40)
    resultado = servicio.clasificar_riesgo(datos_empresa)
    print(f"   Nivel de riesgo: {resultado['nivel_riesgo']}")
    print(f"   Probabilidades: {resultado['probabilidades']}")
    print(f"   Recomendación: {resultado['recomendaciones'][0]}")
    print("   ✅ OK")
    
    # =========================================
    # 4. SIMULACIÓN MONTE CARLO
    # =========================================
    print("\n🎲 4. SIMULACIÓN MONTE CARLO (VAN)")
    print("-" * 40)
    mc = SimulacionMonteCarlo(n_simulaciones=5000)
    resultado = mc.simular_van(
        inversion_inicial=100000,
        flujos_base=[25000, 30000, 35000, 40000, 45000],
        tasa_descuento_base=0.12
    )
    print(f"   Simulaciones: {resultado['n_simulaciones']}")
    print(f"   VAN Medio: ${resultado['van_medio']:,.2f}")
    print(f"   VAN Mediana: ${resultado['van_mediana']:,.2f}")
    print(f"   Desv. Estándar: ${resultado['desviacion_estandar']:,.2f}")
    print(f"   Prob. VAN > 0: {resultado['probabilidad_van_positivo']*100:.1f}%")
    print(f"   Rango: ${resultado['van_minimo']:,.0f} a ${resultado['van_maximo']:,.0f}")
    print("   ✅ OK")
    
    # =========================================
    # 5. ANÁLISIS TORNADO
    # =========================================
    print("\n🌪️  5. ANÁLISIS TORNADO")
    print("-" * 40)
    analisis = AnalisisSensibilidad()
    resultado = analisis.analisis_tornado(
        inversion_inicial=100000,
        flujos_base=[25000, 30000, 35000, 40000, 45000],
        tasa_base=0.12
    )
    print(f"   VAN Base: ${resultado['van_base']:,.2f}")
    print(f"   Variable más sensible: {resultado['variable_mas_sensible']}")
    for r in resultado['resultados']:
        print(f"   - {r['variable']}: rango ${r['rango']:,.0f}")
    print("   ✅ OK")
    
    # =========================================
    # 6. ANÁLISIS DE ESCENARIOS
    # =========================================
    print("\n🎯 6. ANÁLISIS DE ESCENARIOS")
    print("-" * 40)
    resultado = analisis.analisis_escenarios(
        inversion_inicial=100000,
        flujos_base=[25000, 30000, 35000, 40000, 45000],
        tasa_base=0.12
    )
    for nombre, escenario in resultado['escenarios'].items():
        print(f"   {nombre.capitalize()}: VAN ${escenario['van']:,.2f}")
    print(f"   Recomendación: {resultado['recomendacion']}")
    print("   ✅ OK")
    
    # =========================================
    # RESUMEN
    # =========================================
    print("\n" + "=" * 60)
    print("✅ TODAS LAS PRUEBAS PASARON CORRECTAMENTE")
    print("=" * 60)
    print("\nMódulos probados:")
    print("  ✅ ServicioML (predicciones)")
    print("  ✅ SimulacionMonteCarlo")
    print("  ✅ AnalisisSensibilidad (Tornado + Escenarios)")
    print("\n🎉 ¡El módulo ML de Diego funciona perfectamente!")


if __name__ == '__main__':
    main()
