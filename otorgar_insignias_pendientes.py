#!/usr/bin/env python3
"""
Script para otorgar insignias pendientes que deberían haber sido otorgadas automáticamente
"""

import sys
sys.path.append('.')

from app.servicios.gamification_servicio import GamificationService
from app.modelos.logro import Usuario_Insignia

def otorgar_insignias_pendientes(usuario_id):
    """Verificar y otorgar todas las insignias que el usuario debería tener"""

    print(f"🔍 Verificando insignias para usuario {usuario_id}...")

    # Obtener insignias actuales del usuario
    insignias_actuales = Usuario_Insignia.obtener_insignias_usuario(usuario_id)
    nombres_actuales = [item['insignia']['nombre_insig'] for item in insignias_actuales]

    print(f"📊 Insignias actuales: {nombres_actuales}")

    # Verificar todas las condiciones posibles
    verificaciones = {
        'Primeros Pasos': GamificationService._verificar_primera_simulacion,
        'Analista Novato': GamificationService._verificar_cinco_simulaciones,
        'Analista Avanzado': GamificationService._verificar_analista_avanzado,
        'Experto en VAN': GamificationService._verificar_experto_van_actualizado,
        'Maestro TIR': GamificationService._verificar_maestro_tir,
        'Inversor Estratégico': GamificationService._verificar_inversor_estrategico_actualizado,
        'Maestro de Finanzas': GamificationService._verificar_maestro_finanzas,
        'Benchmarking Explorer': GamificationService._verificar_benchmarking_explorer,
    }

    insignias_otorgadas = []

    for nombre_insignia, funcion_verificacion in verificaciones.items():
        try:
            if nombre_insignia not in nombres_actuales:
                cumple_condicion = funcion_verificacion(usuario_id)
                print(f"🔎 Verificando '{nombre_insignia}': {'✅ Cumple' if cumple_condicion else '❌ No cumple'}")

                if cumple_condicion:
                    insignia_id = GamificationService._obtener_insignia_por_nombre(nombre_insignia)
                    if insignia_id:
                        if GamificationService._otorgar_insignia_si_no_tiene(usuario_id, insignia_id):
                            insignias_otorgadas.append(nombre_insignia)
                            print(f"🎉 Otorgada insignia: {nombre_insignia}")
                        else:
                            print(f"⚠️ No se pudo otorgar: {nombre_insignia}")
                    else:
                        print(f"❌ Insignia '{nombre_insignia}' no encontrada en BD")
            else:
                print(f"ℹ️ Ya tiene: {nombre_insignia}")

        except Exception as e:
            print(f"💥 Error verificando {nombre_insignia}: {e}")

    print("\n📋 Resumen:")
    print(f"   Insignias otorgadas: {len(insignias_otorgadas)}")
    if insignias_otorgadas:
        print(f"   Nuevas insignias: {', '.join(insignias_otorgadas)}")

    # Verificar total final
    insignias_finales = Usuario_Insignia.obtener_insignias_usuario(usuario_id)
    print(f"   Total insignias ahora: {len(insignias_finales)}")

    return insignias_otorgadas

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python otorgar_insignias_pendientes.py <usuario_id>")
        sys.exit(1)

    usuario_id = int(sys.argv[1])
    otorgar_insignias_pendientes(usuario_id)
