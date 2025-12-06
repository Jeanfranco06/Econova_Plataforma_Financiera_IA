#!/usr/bin/env python3
"""
Script para ejecutar Econova - Plataforma de Simulación Financiera
Uso: python run.py
"""

import os
import sys
from app import crear_app
from app.config import config

if __name__ == "__main__":
    # Determinar ambiente
    ambiente = os.getenv("FLASK_ENV", "development")

    # Crear app
    app = crear_app(ambiente)

    # Configuración para desarrollo
    if ambiente == "development":
        # Puerto y host
        puerto = int(os.getenv("PORT", 5000))
        host = os.getenv("HOST", "127.0.0.1")

        print("=" * 70)
        print("🚀 ECONOVA - PLATAFORMA DE SIMULACIÓN FINANCIERA")
        print("=" * 70)
        print(f"\n📱 Servidor iniciado en: http://{host}:{puerto}")
        print(f"🌍 Ambiente: {ambiente}")
        print(f"🔧 Debug: {app.debug}")
        print("\n📌 Rutas disponibles:")
        print("   └─ http://localhost:5000/                    (Dashboard)")
        print("   └─ http://localhost:5000/simulacion?tipo=van (Simulación)")
        print("   └─ http://localhost:5000/resultados          (Resultados)")
        print("   └─ http://localhost:5000/health              (Estado)")
        print("\n💡 Presiona CTRL+C para detener el servidor")
        print("=" * 70 + "\n")

        # Iniciar servidor
        app.run(host=host, port=puerto, debug=True, use_reloader=True)
    else:
        # Producción
        print(f"Iniciando en modo producción...")
        app.run()
