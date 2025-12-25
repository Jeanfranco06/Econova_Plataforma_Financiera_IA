#!/usr/bin/env python3
"""
Script to initialize benchmarking groups in the deployed database.
This runs the seed data for Benchmarking_Grupo table.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.utils.base_datos import get_db_connection

def init_benchmarking_groups():
    """Initialize default benchmarking groups"""
    db = get_db_connection()

    # Default groups to insert
    groups = [
        ('Emprendedores Tecnológicos', 'Grupo para startups y empresas de tecnología'),
        ('PYMEs Industriales', 'Pequeñas y medianas empresas del sector industrial'),
        ('Comercio Minorista', 'Empresas dedicadas al comercio minorista'),
        ('Servicios Financieros', 'Instituciones y consultores financieros'),
        ('Agricultura Moderna', 'Empresas del sector agrícola con enfoque innovador'),
        ('Turismo y Hospitalidad', 'Empresas del sector turístico'),
        ('Construcción', 'Empresas constructoras y del sector inmobiliario'),
        ('Educación', 'Instituciones educativas y edtech'),
        ('Salud', 'Empresas del sector salud y biotecnología'),
        ('Energías Renovables', 'Empresas de energías limpias y sostenibles')
    ]

    try:
        db.connect()

        # Check if groups already exist
        check_query = "SELECT COUNT(*) as count FROM Benchmarking_Grupo"
        result = db.execute_query(check_query, fetch=True)
        if result and result[0]['count'] > 0:
            print(f"Ya existen {result[0]['count']} grupos de benchmarking. No se insertarán nuevos.")
            return True

        # Insert groups
        insert_query = """
        INSERT INTO Benchmarking_Grupo (nombre_grupo, descripcion)
        VALUES (%s, %s)
        """

        for nombre, descripcion in groups:
            db.execute_query(insert_query, (nombre, descripcion))

        db.commit()
        print(f"Insertados {len(groups)} grupos de benchmarking exitosamente.")
        return True

    except Exception as e:
        print(f"Error inicializando grupos de benchmarking: {e}")
        return False
    finally:
        db.disconnect()

if __name__ == "__main__":
    print("Inicializando grupos de benchmarking...")
    success = init_benchmarking_groups()
    if success:
        print("Grupos inicializados correctamente.")
    else:
        print("Error al inicializar grupos.")
        sys.exit(1)
