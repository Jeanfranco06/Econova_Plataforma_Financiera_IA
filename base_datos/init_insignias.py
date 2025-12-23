#!/usr/bin/env python3
"""
Script para inicializar insignias predefinidas en la base de datos
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.modelos.logro import Insignia
from app.utils.base_datos import get_db_connection

def inicializar_insignias():
    """Crear insignias predefinidas en la base de datos"""

    insignias_predefinidas = [
        {
            'nombre': 'Primeros Pasos',
            'descripcion': 'Te has registrado en Econova y completado tu primera acción'
        },
        {
            'nombre': 'Analista Novato',
            'descripcion': 'Has realizado 5 simulaciones financieras'
        },
        {
            'nombre': 'Calculador Financiero',
            'descripcion': 'Has realizado 10 cálculos financieros básicos'
        },
        {
            'nombre': 'Analista Avanzado',
            'descripcion': 'Has completado 25 simulaciones financieras'
        },
        {
            'nombre': 'Experto en VAN',
            'descripcion': 'Has calculado VAN en más de 10 proyectos de inversión'
        },
        {
            'nombre': 'Experto en TIR',
            'descripcion': 'Has calculado TIR en más de 10 proyectos'
        },
        {
            'nombre': 'Maestro de WACC',
            'descripcion': 'Has calculado WACC en más de 10 ocasiones'
        },
        {
            'nombre': 'Benchmarking Explorer',
            'descripcion': 'Te has unido a tu primer grupo de benchmarking'
        },
        {
            'nombre': 'Benchmarking Experto',
            'descripcion': 'Has realizado 15 análisis de benchmarking'
        },
        {
            'nombre': 'Líder de Sector',
            'descripcion': 'Has alcanzado el primer lugar en el ranking de tu sector'
        },
        {
            'nombre': 'Inversor Estratégico',
            'descripcion': 'Has optimizado 20 portafolios de inversión'
        },
        {
            'nombre': 'Maestro de Finanzas',
            'descripcion': 'Has alcanzado el nivel máximo de conocimiento financiero'
        },
        {
            'nombre': 'Early Adopter',
            'descripcion': 'Has usado todas las funcionalidades nuevas de la plataforma'
        },
        {
            'nombre': 'Streak Master',
            'descripcion': 'Has usado la plataforma 30 días consecutivos'
        },
        {
            'nombre': 'Exportador',
            'descripcion': 'Has exportado resultados a Excel o PDF'
        },
        {
            'nombre': 'Colaborador',
            'descripcion': 'Has compartido análisis con otros usuarios'
        },
        {
            'nombre': 'Perfeccionista',
            'descripcion': 'Has obtenido resultados perfectos en simulaciones'
        },
        {
            'nombre': 'Aprendiz Rápido',
            'descripcion': 'Has completado todas las simulaciones en menos de una semana'
        },
        {
            'nombre': 'Mentor',
            'descripcion': 'Has ayudado a otros usuarios con sus análisis'
        },
        {
            'nombre': 'Innovador',
            'descripcion': 'Has usado funcionalidades experimentales de IA'
        },
        {
            'nombre': 'Financiero Profesional',
            'descripcion': 'Has completado 100 simulaciones financieras'
        }
    ]

    print("🏆 Inicializando insignias predefinidas...")

    db = get_db_connection()
    try:
        db.connect()

        for insignia_data in insignias_predefinidas:
            try:
                # Verificar si la insignia ya existe
                existing = Insignia().listar_insignias()
                exists = any(i.nombre_insig == insignia_data['nombre'] for i in existing)

                if not exists:
                    insignia_id = Insignia.crear_insignia(
                        insignia_data['nombre'],
                        insignia_data['descripcion']
                    )
                    if insignia_id:
                        print(f"✅ Creada insignia: {insignia_data['nombre']}")
                    else:
                        print(f"❌ Error creando insignia: {insignia_data['nombre']}")
                else:
                    print(f"ℹ️ Insignia ya existe: {insignia_data['nombre']}")

            except Exception as e:
                print(f"❌ Error procesando insignia {insignia_data['nombre']}: {e}")

        print("\n✅ Proceso de inicialización de insignias completado!")

    except Exception as e:
        print(f"❌ Error general en inicialización: {e}")
    finally:
        db.disconnect()

if __name__ == "__main__":
    inicializar_insignias()
