#!/usr/bin/env python3
"""
Script para configurar la base de datos inicial
"""

import os
import sys
from app import crear_app

def setup_database():
    """Configura la base de datos inicial"""
    try:
        print("🔧 Configurando base de datos...")

        # Crear aplicación
        app = crear_app('development')

        with app.app_context():
            from app.utils.base_datos import init_db

            # Inicializar base de datos
            if init_db():
                print("✅ Base de datos inicializada correctamente")

                # Crear tablas si es SQLite
                from app.utils.base_datos import USE_POSTGRESQL
                if not USE_POSTGRESQL:
                    from app import crear_tablas_sqlite
                    crear_tablas_sqlite()
                    print("✅ Tablas SQLite creadas")
                else:
                    print("✅ Usando PostgreSQL - tablas deben crearse manualmente")
            else:
                print("❌ Error inicializando base de datos")
                return False

        print("🎉 Configuración completada!")
        return True

    except Exception as e:
        print(f"❌ Error configurando base de datos: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = setup_database()
    if success:
        print("\n✅ Base de datos configurada exitosamente!")
        print("🔄 Puedes ejecutar reset_database.py para crear usuarios de prueba")
    else:
        print("\n❌ Error en la configuración.")
        exit(1)
