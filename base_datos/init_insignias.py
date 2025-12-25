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
            'nombre': 'Optimizador',
            'descripcion': 'Ve a "Portafolio" en Calculadoras y encuentra la mejor combinación de activos (10 optimizaciones)'
        },
        {
            'nombre': 'Líder de Sector',
            'descripcion': 'Únete a grupos de benchmarking y alcanza el top 3 en tu sector'
        },
        {
            'nombre': 'Inversor Estratégico',
            'descripcion': 'Ve a "Portafolio" en Calculadoras y optimiza 20 portafolios de inversión'
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
            'descripcion': 'Crea estrategias únicas combinando diferentes herramientas financieras (5 estrategias)'
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
                existing = Insignia.listar_insignias()
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

def actualizar_descripciones_insignias():
    """Actualizar descripciones de insignias existentes para que sean más claras"""

    actualizaciones = {
        'Optimizador': 'Ve a "Portafolio" en Calculadoras y encuentra la mejor combinación de activos (10 optimizaciones)',
        'Líder de Sector': 'Únete a grupos de benchmarking y alcanza el top 3 en tu sector',
        'Innovador': 'Crea estrategias únicas combinando diferentes herramientas financieras (5 estrategias)',
        'Inversor Estratégico': 'Ve a "Portafolio" en Calculadoras y optimiza 20 portafolios de inversión',
        'Benchmarking Experto': 'Realiza 15 análisis de benchmarking (sectorial o personalizado)',
        'Analista Avanzado': 'Ve a la sección "Simulaciones" y completa 25 análisis financieros diferentes',
        'Experto en VAN': 'Ve a "VAN" en Calculadoras y calcula el VAN en más de 10 proyectos',
        'Maestro TIR': 'Ve a "TIR" en Calculadoras y domina escenarios complejos de retorno'
    }

    print("🔄 Actualizando descripciones de insignias...")

    db = get_db_connection()
    try:
        db.connect()

        for nombre, nueva_descripcion in actualizaciones.items():
            try:
                # Buscar la insignia por nombre
                insignias = Insignia.listar_insignias()
                insignia = next((i for i in insignias if i.nombre_insig == nombre), None)

                if insignia:
                    # Actualizar descripción
                    query = "UPDATE Insignias SET descripcion_insig = %s WHERE insignia_id = %s"
                    success = db.execute_query(query, (nueva_descripcion, insignia.insignia_id))

                    if success:
                        print(f"✅ Actualizada descripción de: {nombre}")
                    else:
                        print(f"❌ Error actualizando: {nombre}")
                else:
                    print(f"⚠️ Insignia no encontrada: {nombre}")

            except Exception as e:
                print(f"❌ Error procesando {nombre}: {e}")

        print("\n✅ Proceso de actualización de descripciones completado!")

    except Exception as e:
        print(f"❌ Error general en actualización: {e}")
    finally:
        db.disconnect()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'update':
        actualizar_descripciones_insignias()
    else:
        inicializar_insignias()
