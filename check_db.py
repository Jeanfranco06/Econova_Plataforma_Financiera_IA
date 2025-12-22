#!/usr/bin/env python3
"""
Script para verificar el estado de la base de datos
"""

from app import crear_app
from app.modelos.usuario import Usuario

def check_database():
    """Verifica el estado de la base de datos"""
    try:
        print("🔍 Verificando base de datos...")

        # Crear aplicación
        app = crear_app('development')
        with app.app_context():
            # Verificar usuarios
            usuarios = Usuario.listar_usuarios()
            print(f"📊 Total de usuarios: {len(usuarios)}")

            if usuarios:
                print("\n👥 Usuarios registrados:")
                for usuario in usuarios:
                    print(f"  ID: {usuario.usuario_id}")
                    print(f"  Nombre: {usuario.nombres} {usuario.apellidos}")
                    print(f"  Email: {usuario.email}")
                    print(f"  Usuario: {usuario.nombre_usuario}")
                    print(f"  Empresa: {usuario.empresa}")
                    print(f"  Nivel: {usuario.nivel}")
                    print("  ---")
            else:
                print("⚠️  No hay usuarios registrados")

            # Verificar conexión a BD
            from app.utils.base_datos import get_db_connection
            db = get_db_connection()
            db.connect()
            print("✅ Conexión a base de datos exitosa")
            db.disconnect()

        return True

    except Exception as e:
        print(f"❌ Error verificando base de datos: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = check_database()
    if success:
        print("\n✅ Verificación completada exitosamente!")
    else:
        print("\n❌ Error en la verificación.")
        exit(1)
