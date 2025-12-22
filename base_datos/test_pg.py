#!/usr/bin/env python3
"""
Script para probar conexión a PostgreSQL
"""

import os
import sys
from app import crear_app

def test_postgresql_connection():
    """Prueba la conexión a PostgreSQL"""
    try:
        print("🔍 Probando conexión a PostgreSQL...")

        # Forzar PostgreSQL
        os.environ["DB_NAME"] = "econova_db"
        os.environ["DB_USER"] = "test_user"
        os.environ["DB_PASSWORD"] = "test_password"
        os.environ["DB_HOST"] = "localhost"
        os.environ["DB_PORT"] = "5432"

        # Crear aplicación
        app = crear_app('development')

        with app.app_context():
            from app.utils.base_datos import get_db_connection, USE_POSTGRESQL

            if USE_POSTGRESQL:
                print("✅ Detectado PostgreSQL")

                db = get_db_connection()
                db.connect()

                # Probar consulta simple
                try:
                    result = db.execute_query("SELECT version();", fetch=True)
                    if result:
                        print("✅ Conexión exitosa a PostgreSQL")
                        print(f"📊 Versión: {result[0][0][:50]}...")
                    else:
                        print("⚠️  Conexión establecida pero sin resultados")
                except Exception as e:
                    print(f"❌ Error ejecutando consulta: {e}")
                    return False

                db.disconnect()
                print("✅ Conexión cerrada correctamente")
                return True
            else:
                print("❌ No se detectó PostgreSQL")
                return False

    except Exception as e:
        print(f"❌ Error probando PostgreSQL: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

def test_database_operations():
    """Prueba operaciones básicas de base de datos"""
    try:
        print("\n🔧 Probando operaciones de base de datos...")

        app = crear_app('development')
        with app.app_context():
            from app.modelos.usuario import Usuario

            # Intentar listar usuarios
            usuarios = Usuario.listar_usuarios()
            print(f"📊 Usuarios encontrados: {len(usuarios)}")

            # Intentar crear usuario de prueba (si no existe)
            if not any(u.email == "test@example.com" for u in usuarios):
                print("👤 Creando usuario de prueba...")
                usuario = Usuario.crear(
                    nombres="Test",
                    apellidos="User",
                    email="test@example.com",
                    nombre_usuario="testuser",
                    password="test123",
                    empresa="Test Company"
                )
                if usuario:
                    print("✅ Usuario de prueba creado")
                else:
                    print("❌ Error creando usuario de prueba")

            return True

    except Exception as e:
        print(f"❌ Error en operaciones de BD: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Probando configuración de PostgreSQL\n")

    success1 = test_postgresql_connection()
    success2 = test_database_operations()

    if success1 and success2:
        print("\n🎉 Todas las pruebas pasaron exitosamente!")
        print("✅ PostgreSQL configurado correctamente")
    else:
        print("\n❌ Algunas pruebas fallaron")
        print("🔧 Revisa la configuración de PostgreSQL")
        exit(1)
