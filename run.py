#!/usr/bin/env python3
"""
Script para ejecutar la aplicación Econova
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

# Crear la aplicación
app = crear_app()

if __name__ == "__main__":
    # Ejecutar en modo desarrollo
    app.run(host="0.0.0.0", port=5000, debug=True)
