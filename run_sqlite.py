#!/usr/bin/env python3
"""
Versión de Econova que usa SQLite en lugar de PostgreSQL
Para testing rápido sin configuración de base de datos
"""
import os
import sys

# Cambiar configuración a SQLite temporalmente
os.environ['DB_NAME'] = 'econova_test.db'
os.environ['DB_USER'] = ''
os.environ['DB_PASSWORD'] = ''

print("🐘 Usando SQLite en lugar de PostgreSQL")
print("   Base de datos: econova_test.db")
print("   Esto es solo para testing - no uses en producción")
print()

# Importar y ejecutar la aplicación
from app import crear_app

if __name__ == "__main__":
    app = crear_app()

    # Crear tablas si no existen (SQLite)
    with app.app_context():
        from app.utils.base_datos import init_db
        try:
            init_db()
            print("✅ Base de datos SQLite inicializada")
        except Exception as e:
            print(f"⚠️  Error inicializando BD: {e}")

    # Ejecutar aplicación
    app.run(
        host=os.getenv('HOST', '0.0.0.0'),
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_DEBUG', 'True') == 'True'
    )
