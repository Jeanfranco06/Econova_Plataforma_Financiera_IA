#!/usr/bin/env python3
"""
Script para eliminar todos los usuarios existentes de la base de datos
"""

import os
from app import crear_app

def delete_all_users():
    """Elimina todos los usuarios de la base de datos"""
    try:
        print("🔄 Conectando a la base de datos...")

        # Crear aplicación
        app = crear_app('development')
        with app.app_context():
            from app.utils.base_datos import get_db_connection

            # Conectar a la base de datos
            db = get_db_connection()
            db.connect()

            # Contar usuarios antes de eliminar
            try:
                result = db.execute_query("SELECT COUNT(*) as total FROM Usuarios", fetch=True)
                usuarios_antes = result[0]['total'] if result else 0
                print(f"👥 Usuarios encontrados: {usuarios_antes}")
            except Exception as e:
                print(f"⚠️  Error contando usuarios: {e}")
                usuarios_antes = 0

            # Eliminar usuarios y datos relacionados
            print("🗑️  Eliminando usuarios y datos relacionados...")

            # Eliminar en orden por dependencias
            tablas_a_limpiar = [
                "Usuario_Insignia",
                "Ranking",
                "Notificaciones",
                "Usuario_Benchmarking",
                "Resultados",
                "Simulaciones",
                "Usuarios"
            ]

            for tabla in tablas_a_limpiar:
                try:
                    db.execute_query(f"DELETE FROM {tabla}", fetch=False)
                    print(f"✅ Datos eliminados de {tabla}")
                except Exception as e:
                    print(f"⚠️  Error eliminando de {tabla} (posiblemente tabla vacía): {e}")

            # Confirmar cambios
            db.commit()

            # Verificar eliminación
            try:
                result = db.execute_query("SELECT COUNT(*) as total FROM Usuarios", fetch=True)
                usuarios_despues = result[0]['total'] if result else 0
                print(f"👥 Usuarios restantes: {usuarios_despues}")
            except Exception as e:
                print(f"⚠️  Error verificando eliminación: {e}")
                usuarios_despues = 0

            db.disconnect()

            usuarios_eliminados = usuarios_antes - usuarios_despues
            print("\n🎉 Proceso completado!")
            print(f"📊 Usuarios eliminados: {usuarios_eliminados}")

            return True

    except Exception as e:
        print(f"❌ Error eliminando usuarios: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    print("🗑️  ELIMINANDO TODOS LOS USUARIOS EXISTENTES")
    print("=" * 50)

    # Confirmación
    confirmacion = input("⚠️  ¿Estás seguro de que quieres eliminar TODOS los usuarios? (escribe 'SI' para confirmar): ")
    if confirmacion.upper() != 'SI':
        print("❌ Operación cancelada.")
        exit(0)

    success = delete_all_users()
    if success:
        print("\n✅ Usuarios eliminados exitosamente!")
        print("🔄 La base de datos ahora está limpia de usuarios.")
    else:
        print("\n❌ Error en el proceso de eliminación.")
        exit(1)
