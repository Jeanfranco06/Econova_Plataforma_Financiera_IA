#!/usr/bin/env python3
"""
Script para verificar el despliegue en Render
Ejecuta verificaciones importantes antes del despliegue completo
"""

import os
import sys
import subprocess
from app import crear_app

def check_environment():
    """Verificar variables de entorno críticas"""
    print("🔍 Verificando variables de entorno...")

    required_vars = [
        'DATABASE_URL',
        'SECRET_KEY',
        'GROQ_API_KEY',
        'MAIL_USERNAME',
        'MAIL_PASSWORD'
    ]

    optional_vars = [
        'OPENAI_API_KEY',
        'GOOGLE_SHEETS_CREDENTIALS_PATH',
        'TWILIO_ACCOUNT_SID',
        'CORS_ORIGINS'
    ]

    missing_required = []
    missing_optional = []

    for var in required_vars:
        if not os.getenv(var):
            missing_required.append(var)

    for var in optional_vars:
        if not os.getenv(var):
            missing_optional.append(var)

    if missing_required:
        print(f"❌ Variables requeridas faltantes: {', '.join(missing_required)}")
        return False

    if missing_optional:
        print(f"⚠️  Variables opcionales faltantes: {', '.join(missing_optional)}")

    print("✅ Variables de entorno verificadas")
    return True

def check_database_connection():
    """Verificar conexión a base de datos"""
    print("🔍 Verificando conexión a base de datos...")

    try:
        app = crear_app('production')
        with app.app_context():
            from app.utils.base_datos import get_db_connection, USE_POSTGRESQL

            if not USE_POSTGRESQL:
                print("⚠️  Advertencia: No se detectó PostgreSQL. Usando SQLite para desarrollo.")
                return True

            db = get_db_connection()
            db.connect()

            # Probar una consulta simple
            db.cur.execute("SELECT 1")
            result = db.cur.fetchone()

            db.disconnect()

            if result:
                print("✅ Conexión a PostgreSQL exitosa")
                return True
            else:
                print("❌ Error en consulta de prueba a PostgreSQL")
                return False

    except Exception as e:
        print(f"❌ Error conectando a base de datos: {e}")
        return False

def check_dependencies():
    """Verificar que las dependencias críticas estén instaladas"""
    print("🔍 Verificando dependencias críticas...")

    critical_imports = [
        ('flask', 'Flask'),
        ('flask_cors', 'Flask-CORS'),
        ('psycopg', 'psycopg (PostgreSQL)'),
        ('groq', 'Groq API'),
        ('pandas', 'pandas'),
        ('numpy', 'numpy'),
        ('scipy', 'scipy'),
        ('scikit-learn', 'scikit-learn')
    ]

    failed_imports = []

    for module, name in critical_imports:
        try:
            __import__(module)
            print(f"✅ {name} disponible")
        except ImportError:
            failed_imports.append(name)
            print(f"❌ {name} no disponible")

    if failed_imports:
        print(f"❌ Dependencias faltantes: {', '.join(failed_imports)}")
        return False

    print("✅ Todas las dependencias críticas verificadas")
    return True

def check_static_files():
    """Verificar que los archivos estáticos existan"""
    print("🔍 Verificando archivos estáticos...")

    static_dirs = [
        'app/static/css',
        'app/static/js',
        'app/static/img',
        'app/static/uploads'
    ]

    missing_dirs = []

    for static_dir in static_dirs:
        if not os.path.exists(static_dir):
            missing_dirs.append(static_dir)
        else:
            # Verificar que no esté vacío
            files = os.listdir(static_dir)
            if not files:
                print(f"⚠️  Directorio {static_dir} está vacío")

    if missing_dirs:
        print(f"❌ Directorios estáticos faltantes: {', '.join(missing_dirs)}")
        return False

    print("✅ Archivos estáticos verificados")
    return True

def check_app_startup():
    """Verificar que la aplicación pueda iniciarse"""
    print("🔍 Verificando inicio de aplicación...")

    try:
        app = crear_app('production')

        with app.test_client() as client:
            # Probar endpoint de health check
            response = client.get('/health')
            if response.status_code == 200:
                print("✅ Endpoint /health responde correctamente")
                return True
            else:
                print(f"❌ Endpoint /health falló con código: {response.status_code}")
                return False

    except Exception as e:
        print(f"❌ Error iniciando aplicación: {e}")
        return False

def run_all_checks():
    """Ejecutar todas las verificaciones"""
    print("🚀 Iniciando verificación completa del despliegue en Render")
    print("=" * 60)

    checks = [
        check_environment,
        check_dependencies,
        check_static_files,
        check_database_connection,
        check_app_startup
    ]

    results = []

    for check in checks:
        try:
            result = check()
            results.append(result)
            print()  # Línea en blanco entre checks
        except Exception as e:
            print(f"❌ Error ejecutando {check.__name__}: {e}")
            results.append(False)
            print()

    print("=" * 60)

    passed = sum(results)
    total = len(results)

    if passed == total:
        print(f"🎉 Todas las verificaciones pasaron ({passed}/{total})")
        print("✅ El despliegue debería funcionar correctamente")
        return True
    else:
        print(f"❌ Algunas verificaciones fallaron ({passed}/{total})")
        print("⚠️  Revisa los errores arriba antes del despliegue")
        return False

if __name__ == "__main__":
    success = run_all_checks()
    sys.exit(0 if success else 1)
