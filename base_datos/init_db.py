#!/usr/bin/env python3
"""
Script para inicializar la base de datos
"""

import os
import sys
from app import crear_app

def init_database():
    """Inicializa la base de datos"""
    try:
        print("🚀 Inicializando base de datos...")

        # Crear aplicación
        app = crear_app('development')

        with app.app_context():
            from app.utils.base_datos import init_db

            # Inicializar conexión
            if init_db():
                print("✅ Conexión a base de datos establecida")

                # Crear tablas si es SQLite
                from app.utils.base_datos import USE_POSTGRESQL
                if not USE_POSTGRESQL:
                    from app import crear_tablas_sqlite
                    crear_tablas_sqlite()
                    print("✅ Tablas creadas exitosamente")
                else:
                    print("ℹ️  Usando PostgreSQL - ejecutar esquemas manualmente")
            else:
                print("❌ Error conectando a base de datos")
                return False

        print("🎉 Base de datos inicializada!")
        return True

    except Exception as e:
        print(f"❌ Error inicializando base de datos: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = init_database()
    if success:
        print("\n✅ Inicialización completada!")
    else:
        print("\n❌ Error en inicialización.")
        exit(1)
