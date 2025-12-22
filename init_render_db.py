#!/usr/bin/env python3
"""
Script para inicializar la base de datos en Render
Este script se ejecuta automáticamente durante el despliegue
"""

import os
import sys
from app import crear_app
from app.utils.base_datos import get_db_connection

def init_render_database():
    """Inicializar base de datos para Render"""
    try:
        print("🚀 Inicializando base de datos para Render...")

        # Crear aplicación en modo producción
        app = crear_app('production')

        with app.app_context():
            db = get_db_connection()

            # Verificar si estamos usando PostgreSQL
            from app.utils.base_datos import USE_POSTGRESQL

            if USE_POSTGRESQL:
                print("📊 Usando PostgreSQL para producción")

                # Crear tablas para PostgreSQL
                db.connect()

                # Leer esquema SQL
                schema_path = os.path.join(os.path.dirname(__file__), 'base_datos', 'esquema.sql')
                if os.path.exists(schema_path):
                    with open(schema_path, 'r', encoding='utf-8') as f:
                        schema_sql = f.read()

                    # Ejecutar esquema
                    db.cur.execute(schema_sql)
                    db.conn.commit()
                    print("✅ Esquema de base de datos creado exitosamente")

                # Leer datos semilla
                seed_path = os.path.join(os.path.dirname(__file__), 'base_datos', 'semilla.sql')
                if os.path.exists(seed_path):
                    with open(seed_path, 'r', encoding='utf-8') as f:
                        seed_sql = f.read()

                    # Ejecutar datos semilla
                    db.cur.execute(seed_sql)
                    db.conn.commit()
                    print("✅ Datos semilla insertados exitosamente")

                db.disconnect()
            else:
                print("⚠️  No se detectó PostgreSQL. Verifica la configuración DATABASE_URL")

        print("🎉 Base de datos inicializada correctamente")
        return True

    except Exception as e:
        print(f"❌ Error inicializando base de datos: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = init_render_database()
    sys.exit(0 if success else 1)
