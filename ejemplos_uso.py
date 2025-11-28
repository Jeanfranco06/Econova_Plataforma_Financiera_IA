"""
Ejemplos de Uso - Econova API
Autor: Germaín
Módulo: Backend y Algoritmos Financieros

Este script contiene ejemplos prácticos de cómo usar los servicios financieros
y hacer peticiones a la API.
"""

# ================================================================
# PARTE 1: USO DIRECTO DE SERVICIOS (Sin API)
# ================================================================

print("="*70)
print("EJEMPLOS DE USO DIRECTO DE SERVICIOS FINANCIEROS")
print("="*70)

from app.servicios.financiero_servicio import ServicioFinanciero

# Ejemplo 1: Calcular VAN
print("\n1. CÁLCULO DE VAN (Valor Actual Neto)")
print("-" * 50)

resultado_van = ServicioFinanciero.calcular_van(
    inversion_inicial=100000,
    flujos_caja=[30000, 35000, 40000, 45000, 50000],
    tasa_descuento=0.10
)

print(f"Inversión Inicial: ${resultado_van['inversion_inicial']:,.2f}")
print(f"Tasa de Descuento: {resultado_van['tasa_descuento']*100:.2f}%")
print(f"VAN Calculado: ${resultado_van['van']:,.2f}")
print(f"Decisión: {resultado_van['decision']}")
print(f"Interpretación: {resultado_van['interpretacion']}")

# Ejemplo 2: Calcular TIR
print("\n2. CÁLCULO DE TIR (Tasa Interna de Retorno)")
print("-" * 50)

resultado_tir = ServicioFinanciero.calcular_tir(
    inversion_inicial=100000,
    flujos_caja=[30000, 35000, 40000, 45000, 50000],
    tasa_referencia=0.10
)

print(f"Inversión Inicial: ${resultado_tir['inversion_inicial']:,.2f}")
print(f"TIR Calculada: {resultado_tir['tir_porcentaje']:.2f}%")
print(f"Tasa de Referencia: {resultado_tir['tasa_referencia_porcentaje']:.2f}%")
print(f"Decisión: {resultado_tir['decision']}")
print(f"Interpretación: {resultado_tir['interpretacion']}")

# Ejemplo 3: Calcular WACC
print("\n3. CÁLCULO DE WACC (Costo Promedio Ponderado de Capital)")
print("-" * 50)

resultado_wacc = ServicioFinanciero.calcular_wacc(
    capital_propio=500000,
    deuda=300000,
    costo_capital=0.15,
    costo_deuda=0.08,
    tasa_impuesto=0.30
)

print(f"Capital Propio: ${resultado_wacc['capital_propio']:,.2f}")
print(f"Deuda: ${resultado_wacc['deuda']:,.2f}")
print(f"Valor Total: ${resultado_wacc['valor_total']:,.2f}")
print(f"Peso Capital: {resultado_wacc['peso_capital_porcentaje']:.2f}%")
print(f"Peso Deuda: {resultado_wacc['peso_deuda_porcentaje']:.2f}%")
print(f"WACC: {resultado_wacc['wacc_porcentaje']:.2f}%")
print(f"Interpretación: {resultado_wacc['interpretacion']}")

# Ejemplo 4: Análisis de Portafolio
print("\n4. ANÁLISIS DE PORTAFOLIO")
print("-" * 50)

matriz_correlacion = [
    [1.0, 0.5, 0.3],
    [0.5, 1.0, 0.4],
    [0.3, 0.4, 1.0]
]

resultado_portafolio = ServicioFinanciero.analizar_portafolio(
    retornos=[0.12, 0.15, 0.10],
    ponderaciones=[0.4, 0.35, 0.25],
    volatilidades=[0.20, 0.25, 0.15],
    matriz_correlacion=matriz_correlacion
)

print(f"Número de Activos: {resultado_portafolio['activos']}")
print(f"Retorno Esperado: {resultado_portafolio['retorno_esperado_porcentaje']:.2f}%")
print(f"Riesgo (Volatilidad): {resultado_portafolio['riesgo_porcentaje']:.2f}%")
print(f"Ratio de Sharpe: {resultado_portafolio['ratio_sharpe']:.4f}")
print(f"Interpretación: {resultado_portafolio['interpretacion']}")

# Ejemplo 5: Reemplazo de Activo
print("\n5. ANÁLISIS DE REEMPLAZO DE ACTIVO")
print("-" * 50)

resultado_reemplazo = ServicioFinanciero.analizar_reemplazo_activo(
    costo_actual_anual=50000,
    costo_nuevo_anual=30000,
    costo_nuevo_compra=150000,
    valor_salvamento_actual=20000,
    vida_util_nuevo=10,
    tasa_descuento=0.10
)

print(f"Costo Actual Anual: ${resultado_reemplazo['costo_actual_anual']:,.2f}")
print(f"Costo Nuevo Anual: ${resultado_reemplazo['costo_nuevo_anual']:,.2f}")
print(f"Ahorro Anual: ${resultado_reemplazo['ahorro_anual']:,.2f}")
print(f"Inversión Neta: ${resultado_reemplazo['inversion_neta']:,.2f}")
print(f"VAN del Reemplazo: ${resultado_reemplazo['van_reemplazo']:,.2f}")
print(f"Decisión: {resultado_reemplazo['decision']}")
print(f"Interpretación: {resultado_reemplazo['interpretacion']}")

# Ejemplo 6: Periodo de Recuperación
print("\n6. PERIODO DE RECUPERACIÓN (PAYBACK)")
print("-" * 50)

resultado_payback = ServicioFinanciero.calcular_periodo_recuperacion(
    inversion_inicial=100000,
    flujos_caja=[25000, 30000, 35000, 40000, 45000]
)

print(f"Inversión Inicial: ${resultado_payback['inversion_inicial']:,.2f}")
print(f"Se Recupera: {'Sí' if resultado_payback['se_recupera'] else 'No'}")
if resultado_payback['se_recupera']:
    print(f"Periodo de Recuperación: {resultado_payback['periodo_recuperacion']:.2f} años")
print(f"Interpretación: {resultado_payback['interpretacion']}")

# ================================================================
# PARTE 2: USO DE LA API (Peticiones HTTP)
# ================================================================

print("\n" + "="*70)
print("EJEMPLOS DE PETICIONES A LA API")
print("="*70)
print("\nNOTA: Estos ejemplos requieren que el servidor esté corriendo")
print("Ejecuta primero: python run.py")
print("-"*70)

import requests
import json

BASE_URL = "http://localhost:5000/api/v1"

# Función auxiliar para imprimir respuestas
def imprimir_respuesta(titulo, response):
    print(f"\n{titulo}")
    print("-" * 50)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Respuesta:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    else:
        print(f"Error: {response.text}")

try:
    # Verificar que el servidor esté corriendo
    health_check = requests.get("http://localhost:5000/health", timeout=2)
    
    if health_check.status_code == 200:
        print("\n✓ Servidor detectado. Ejecutando ejemplos de API...")
        
        # Ejemplo API 1: Crear Usuario
        print("\n1. CREAR USUARIO")
        response = requests.post(
            f"{BASE_URL}/usuarios",
            json={
                "email": "demo@econova.com",
                "nombre": "Usuario Demo",
                "nivel": "basico"
            }
        )
        imprimir_respuesta("Crear Usuario", response)
        
        # Guardar usuario_id para siguientes ejemplos
        if response.status_code == 201:
            usuario_id = response.json()['data']['usuario_id']
            
            # Ejemplo API 2: Calcular VAN
            print("\n2. CALCULAR VAN VIA API")
            response = requests.post(
                f"{BASE_URL}/financiero/van",
                json={
                    "inversion_inicial": 100000,
                    "flujos_caja": [30000, 35000, 40000, 45000, 50000],
                    "tasa_descuento": 0.10,
                    "usuario_id": usuario_id,
                    "nombre_simulacion": "Proyecto Demo VAN"
                }
            )
            imprimir_respuesta("Calcular VAN", response)
            
            # Ejemplo API 3: Calcular TIR
            print("\n3. CALCULAR TIR VIA API")
            response = requests.post(
                f"{BASE_URL}/financiero/tir",
                json={
                    "inversion_inicial": 100000,
                    "flujos_caja": [30000, 35000, 40000, 45000, 50000],
                    "tasa_referencia": 0.10,
                    "usuario_id": usuario_id,
                    "nombre_simulacion": "Proyecto Demo TIR"
                }
            )
            imprimir_respuesta("Calcular TIR", response)
            
            # Ejemplo API 4: Obtener Estadísticas del Usuario
            print("\n4. OBTENER ESTADÍSTICAS DEL USUARIO")
            response = requests.get(f"{BASE_URL}/usuarios/{usuario_id}/estadisticas")
            imprimir_respuesta("Estadísticas", response)
            
            # Ejemplo API 5: Listar Simulaciones del Usuario
            print("\n5. LISTAR SIMULACIONES DEL USUARIO")
            response = requests.get(f"{BASE_URL}/financiero/simulaciones/usuario/{usuario_id}")
            imprimir_respuesta("Simulaciones", response)
        
    else:
        print("\n⚠ No se pudo conectar al servidor")
        
except requests.exceptions.ConnectionError:
    print("\n⚠ Servidor no está corriendo")
    print("Para usar los ejemplos de API, ejecuta primero: python run.py")
except Exception as e:
    print(f"\n✗ Error: {e}")

# ================================================================
# PARTE 3: CASOS DE USO REALES
# ================================================================

print("\n" + "="*70)
print("CASOS DE USO REALES")
print("="*70)

print("""
CASO 1: Evaluación de Proyecto de Inversión
--------------------------------------------
Una empresa está considerando invertir $100,000 en paneles solares.
Se espera que genere ahorros anuales de: $30k, $35k, $40k, $45k, $50k
La tasa de descuento de la empresa es 10%.

Solución:
""")

van_caso1 = ServicioFinanciero.calcular_van(100000, [30000, 35000, 40000, 45000, 50000], 0.10)
tir_caso1 = ServicioFinanciero.calcular_tir(100000, [30000, 35000, 40000, 45000, 50000], 0.10)

print(f"VAN: ${van_caso1['van']:,.2f} → {van_caso1['decision']}")
print(f"TIR: {tir_caso1['tir_porcentaje']:.2f}% → {tir_caso1['decision']}")
print(f"Conclusión: El proyecto es {'VIABLE' if van_caso1['van'] > 0 else 'NO VIABLE'}")

print("""

CASO 2: Cálculo del Costo de Capital de una Empresa
----------------------------------------------------
Una empresa tiene:
- Capital Propio: $500,000 (costo 15%)
- Deuda: $300,000 (costo 8%)
- Tasa de Impuesto: 30%

¿Cuál es su WACC?

Solución:
""")

wacc_caso2 = ServicioFinanciero.calcular_wacc(500000, 300000, 0.15, 0.08, 0.30)
print(f"WACC: {wacc_caso2['wacc_porcentaje']:.2f}%")
print(f"Escudo Fiscal: {wacc_caso2['escudo_fiscal']*100:.2f}%")
print(f"Conclusión: La empresa debe exigir al menos {wacc_caso2['wacc_porcentaje']:.2f}% de retorno en sus proyectos")

print("""

CASO 3: ¿Reemplazar o Mantener Maquinaria?
-------------------------------------------
Maquinaria actual cuesta $50,000/año en mantenimiento.
Nueva maquinaria:
- Costo: $150,000
- Mantenimiento: $30,000/año
- Vida útil: 10 años
- Valor de venta actual: $20,000

¿Conviene reemplazar?

Solución:
""")

reemplazo_caso3 = ServicioFinanciero.analizar_reemplazo_activo(
    50000, 30000, 150000, 20000, 10, 0.10
)
print(f"VAN del Reemplazo: ${reemplazo_caso3['van_reemplazo']:,.2f}")
print(f"Ahorro Anual: ${reemplazo_caso3['ahorro_anual']:,.2f}")
print(f"Decisión: {reemplazo_caso3['decision']}")

print("\n" + "="*70)
print("FIN DE LOS EJEMPLOS")
print("="*70)
print("""
Para más información, consulta:
- README.md
- DOCUMENTACION_BACKEND.md

¡Éxito con Econova! 🚀
""")
