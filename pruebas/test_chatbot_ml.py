"""
Pruebas del Chatbot Financiero con IA
"""

import sys
import os

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.servicios.chatbot_servicio import obtener_chatbot


def test_chatbot():
    """Prueba el chatbot con diferentes consultas."""

    chatbot = obtener_chatbot()

    print("=" * 80)
    print("PRUEBAS DEL CHATBOT FINANCIERO CON IA")
    print("=" * 80)
    print()

    # Prueba 1: Predicción de ingresos
    print("🧪 Prueba 1: Predicción de Ingresos")
    print("-" * 80)
    mensaje1 = """Quiero predecir los ingresos de mi empresa. 
    Tengo: ingresos anuales S/500000, gastos operativos S/350000, 
    activos totales S/800000, pasivos S/300000"""

    resultado1 = chatbot.procesar_mensaje(mensaje1)
    print(f"Usuario: {mensaje1}")
    print(f"\nAsistente: {resultado1['respuesta']}")
    if resultado1["prediccion"]:
        print(f"\nPredicción ML: {resultado1['prediccion']}")
    print("\n")

    # Prueba 2: Análisis de riesgo
    print("🧪 Prueba 2: Análisis de Riesgo")
    print("-" * 80)
    mensaje2 = """Analiza el riesgo financiero. 
    Datos: ingresos S/500000, gastos S/400000, 
    activos S/600000, pasivos S/450000"""

    resultado2 = chatbot.procesar_mensaje(mensaje2)
    print(f"Usuario: {mensaje2}")
    print(f"\nAsistente: {resultado2['respuesta']}")
    if resultado2["prediccion"]:
        print(f"\nPredicción ML: {resultado2['prediccion']}")
    print("\n")

    # Prueba 3: Crecimiento
    print("🧪 Prueba 3: Proyección de Crecimiento")
    print("-" * 80)
    mensaje3 = """Calcula la tasa de crecimiento. 
    Tengo ingresos S/1000000, gastos S/700000, 
    activos S/1500000, pasivos S/500000"""

    resultado3 = chatbot.procesar_mensaje(mensaje3)
    print(f"Usuario: {mensaje3}")
    print(f"\nAsistente: {resultado3['respuesta']}")
    if resultado3["prediccion"]:
        print(f"\nPredicción ML: {resultado3['prediccion']}")
    print("\n")

    # Prueba 4: Consulta general
    print("🧪 Prueba 4: Consulta General")
    print("-" * 80)
    mensaje4 = "Hola, ¿qué puedes hacer?"

    resultado4 = chatbot.procesar_mensaje(mensaje4)
    print(f"Usuario: {mensaje4}")
    print(f"\nAsistente: {resultado4['respuesta']}")
    print("\n")

    # Prueba 5: Datos incompletos
    print("🧪 Prueba 5: Datos Incompletos")
    print("-" * 80)
    mensaje5 = "Predice ingresos. Tengo ingresos S/500000 y gastos S/350000"

    resultado5 = chatbot.procesar_mensaje(mensaje5)
    print(f"Usuario: {mensaje5}")
    print(f"\nAsistente: {resultado5['respuesta']}")
    print("\n")

    print("=" * 80)
    print("✅ TODAS LAS PRUEBAS COMPLETADAS")
    print("=" * 80)


def test_extraccion_datos():
    """Prueba la extracción de datos financieros."""

    chatbot = obtener_chatbot()

    print("\n" + "=" * 80)
    print("PRUEBA DE EXTRACCIÓN DE DATOS")
    print("=" * 80)
    print()

    casos = [
        "ingresos anuales S/500,000",
        "gastos operativos: 350000",
        "activos totales s/ 800.000",
        "pasivos 300000",
        "ingresos: 1000000, gastos: 700000, activos: 1500000, pasivos: 500000",
    ]

    for caso in casos:
        datos = chatbot._extraer_datos_financieros(caso)
        print(f"Texto: {caso}")
        print(f"Datos extraídos: {datos}")
        print()


if __name__ == "__main__":
    print("Iniciando pruebas del chatbot...\n")

    try:
        test_chatbot()
        test_extraccion_datos()

        print("\n✅ Todas las pruebas completadas exitosamente")

    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {e}")
        import traceback

        traceback.print_exc()
