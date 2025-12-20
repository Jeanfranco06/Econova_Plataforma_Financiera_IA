#!/usr/bin/env python3
"""
Script para configurar la base de datos PostgreSQL para Econova
"""
import os
import subprocess
import sys
from dotenv import load_dotenv

def check_postgresql():
    """Verificar si PostgreSQL está instalado y corriendo"""
    print("🔍 Verificando PostgreSQL...")

    try:
        # Verificar si pg_isready está disponible
        result = subprocess.run(['pg_isready'], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✅ PostgreSQL está corriendo")
            return True
        else:
            print("❌ PostgreSQL no responde")
            return False
    except FileNotFoundError:
        print("❌ PostgreSQL no está instalado")
        return False
    except subprocess.TimeoutExpired:
        print("⚠️  PostgreSQL responde lentamente")
        return False

def start_postgresql_service():
    """Intentar iniciar el servicio PostgreSQL"""
    print("\n🔄 Intentando iniciar PostgreSQL...")

    try:
        if os.name == 'nt':  # Windows
            # Usar net start
            result = subprocess.run(['net', 'start', 'postgresql'], capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Servicio PostgreSQL iniciado")
                return True
            else:
                print("❌ Error al iniciar servicio PostgreSQL")
                print(f"Detalles: {result.stderr}")
                return False
        else:  # Linux/Mac
            result = subprocess.run(['sudo', 'systemctl', 'start', 'postgresql'], capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Servicio PostgreSQL iniciado")
                return True
            else:
                print("❌ Error al iniciar servicio PostgreSQL")
                return False
    except Exception as e:
        print(f"❌ Error iniciando servicio: {e}")
        return False

def create_database():
    """Crear la base de datos econova_db"""
    print("\n🗄️  Creando base de datos econova_db...")

    load_dotenv()

    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'postgres')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')

    try:
        # Conectar sin especificar base de datos
        conn_params = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/postgres"

        # Usar psql para crear la base de datos
        cmd = f'psql "{conn_params}" -c "CREATE DATABASE econova_db;"'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

        if result.returncode == 0:
            print("✅ Base de datos econova_db creada exitosamente")
            return True
        else:
            if "already exists" in result.stderr:
                print("⚠️  La base de datos econova_db ya existe")
                return True
            else:
                print(f"❌ Error creando base de datos: {result.stderr}")
                return False

    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def setup_database_schema():
    """Configurar el esquema de la base de datos"""
    print("\n📋 Configurando esquema de base de datos...")

    load_dotenv()

    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'postgres')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'econova_db')

    try:
        # Ejecutar el script de esquema
        conn_params = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

        with open('base_datos/esquema.sql', 'r', encoding='utf-8') as f:
            schema_sql = f.read()

        # Usar psql para ejecutar el esquema
        cmd = f'psql "{conn_params}" -c "{schema_sql}"'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

        if result.returncode == 0:
            print("✅ Esquema de base de datos configurado")
            return True
        else:
            print(f"❌ Error configurando esquema: {result.stderr}")
            return False

    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def setup_database_seed():
    """Cargar datos iniciales"""
    print("\n🌱 Cargando datos iniciales...")

    load_dotenv()

    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', 'postgres')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'econova_db')

    try:
        # Ejecutar el script de datos iniciales
        conn_params = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

        with open('base_datos/semilla.sql', 'r', encoding='utf-8') as f:
            seed_sql = f.read()

        # Usar psql para ejecutar los datos iniciales
        cmd = f'psql "{conn_params}" -c "{seed_sql}"'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

        if result.returncode == 0:
            print("✅ Datos iniciales cargados")
            return True
        else:
            print(f"⚠️  Error cargando datos iniciales: {result.stderr}")
            print("   Continuando de todas formas...")
            return True  # No es crítico

    except Exception as e:
        print(f"⚠️  Error cargando datos iniciales: {e}")
        print("   Continuando de todas formas...")
        return True

def offer_sqlite_fallback():
    """Ofrecer SQLite como alternativa"""
    print("\n💡 Si PostgreSQL no funciona, podemos usar SQLite temporalmente")
    print("   SQLite no requiere instalación y funciona inmediatamente.")

    use_sqlite = input("¿Quieres usar SQLite en lugar de PostgreSQL? (s/n): ").lower().strip()

    if use_sqlite == 's':
        print("\n🔄 Configurando SQLite...")

        # Cambiar configuración a SQLite
        with open('.env', 'r') as f:
            env_content = f.read()

        # Reemplazar configuración de PostgreSQL por SQLite
        env_content = env_content.replace('DB_NAME=econova_db', 'DB_NAME=econova.db')
        env_content = env_content.replace('DB_USER=postgres', 'DB_USER=')
        env_content = env_content.replace('DB_PASSWORD=postgres', 'DB_PASSWORD=')

        with open('.env', 'w') as f:
            f.write(env_content)

        print("✅ Configuración cambiada a SQLite")
        print("   Reinicia la aplicación para usar SQLite")
        return True

    return False

def main():
    """Función principal"""
    print("🚀 Configurador de Base de Datos - Econova")
    print("=" * 60)
    print("Este script te ayudará a configurar PostgreSQL para Econova")
    print()

    # Verificar PostgreSQL
    if not check_postgresql():
        print("\n❌ PostgreSQL no está disponible")

        # Intentar iniciar servicio
        if not start_postgresql_service():
            # Ofrecer SQLite como alternativa
            if offer_sqlite_fallback():
                return
            else:
                print("\n❌ No se pudo configurar PostgreSQL ni SQLite")
                print("Por favor, instala PostgreSQL manualmente")
                sys.exit(1)

    # Crear base de datos
    if not create_database():
        print("❌ No se pudo crear la base de datos")
        sys.exit(1)

    # Configurar esquema
    if not setup_database_schema():
        print("❌ No se pudo configurar el esquema")
        sys.exit(1)

    # Cargar datos iniciales
    setup_database_seed()

    print("\n🎉 ¡Base de datos configurada exitosamente!")
    print("Ahora puedes ejecutar: python run.py")

if __name__ == "__main__":
    main()
