#!/usr/bin/env python3
"""
Script para ejecutar la aplicación Econova en modo desarrollo
"""

import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Forzar SQLite en desarrollo si PostgreSQL no está disponible
if not os.getenv("RENDER") and not os.getenv("PRODUCTION"):
    # Configurar variables para usar SQLite
    os.environ["DB_NAME"] = "econova.db"
    os.environ["DB_USER"] = ""
    os.environ["DB_PASSWORD"] = ""
    print("🐘 Configurando SQLite para desarrollo...")

from app import crear_app

if __name__ == "__main__":
    # Crear aplicación en modo desarrollo
    app = crear_app('development')

    # Ejecutar servidor de desarrollo
    print("🚀 Iniciando servidor de desarrollo...")
    print("📍 URL: http://localhost:5000")
    print("🛑 Presiona Ctrl+C para detener")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
