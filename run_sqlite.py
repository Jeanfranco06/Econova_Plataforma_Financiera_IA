#!/usr/bin/env python3
"""
Script para ejecutar la aplicación con SQLite en desarrollo
"""

import os
from app import crear_app

def run_sqlite():
    """Ejecuta la aplicación con SQLite"""
    try:
        print("🐘 Ejecutando Econova con SQLite...")

        # Forzar SQLite
        os.environ["DB_NAME"] = "econova.db"
        os.environ["DB_USER"] = ""
        os.environ["DB_PASSWORD"] = ""

        # Crear aplicación
        app = crear_app('development')

        print("✅ Aplicación configurada con SQLite")
        print("📍 URL: http://localhost:5000")
        print("🛑 Presiona Ctrl+C para detener")

        # Ejecutar servidor
        app.run(
            host="0.0.0.0",
            port=5000,
            debug=True
        )

    except KeyboardInterrupt:
        print("\n👋 Aplicación detenida por el usuario")
    except Exception as e:
        print(f"❌ Error ejecutando aplicación: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        exit(1)

if __name__ == "__main__":
    run_sqlite()
