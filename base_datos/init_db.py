#!/usr/bin/env python3
"""
Script para inicializar la base de datos de Econova
Crea las tablas, índices y carga datos iniciales
"""

import psycopg2
import sys
import os

# Configuración de la base de datos
DB_CONFIG = {
    'dbname': 'econova_db',
    'user': 'postgres',
    'password': 'admin123',
    'host': 'localhost',
    'port': '5432'
}

def connect_db():
    """Conectar a la base de datos"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("Conexión exitosa a la base de datos")
        return conn
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        return None

def execute_sql_file(conn, filename):
    """Ejecutar un archivo SQL"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            sql = f.read()

        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()
        cur.close()

        print(f"Ejecutado: {filename}")
        return True

    except Exception as e:
        print(f"Error ejecutando {filename}: {e}")
        conn.rollback()
        return False

def main():
    """Función principal"""
    print("Inicializando base de datos de Econova")
    print("=" * 50)

    # Verificar que los archivos existen
    schema_file = 'base_datos/esquema.sql'
    seed_file = 'base_datos/semilla.sql'

    if not os.path.exists(schema_file):
        print(f"❌ Archivo no encontrado: {schema_file}")
        return False

    if not os.path.exists(seed_file):
        print(f"❌ Archivo no encontrado: {seed_file}")
        return False

    # Conectar a la base de datos
    conn = connect_db()
    if not conn:
        return False

    try:
        # Ejecutar esquema
        print("\n Creando esquema de base de datos...")
        if not execute_sql_file(conn, schema_file):
            return False

        # Ejecutar datos iniciales
        print("\n Cargando datos iniciales...")
        if not execute_sql_file(conn, seed_file):
            return False

        print("\n" + "=" * 50)
        print("Base de datos inicializada exitosamente!")
        print("Tablas creadas y datos iniciales cargados")

        return True

    except Exception as e:
        print(f"Error durante la inicialización: {e}")
        return False

    finally:
        if conn:
            conn.close()
            print("🔌 Conexión cerrada")

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
