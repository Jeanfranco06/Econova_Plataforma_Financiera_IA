#!/usr/bin/env python3
"""
Script para resetear la base de datos y crear usuarios de prueba
"""

import os
from app import crear_app
from app.modelos.usuario import Usuario

def reset_database():
    """Resetea la base de datos y crea usuarios de prueba"""
    try:
        print("🔄 Reseteando base de datos...")

        # Crear aplicación
        app = crear_app('development')
        with app.app_context():
            from app.utils.base_datos import get_db_connection

            # Conectar a la base de datos
            db = get_db_connection()
            db.connect()

            # Limpiar tablas (en orden inverso por dependencias)
            print("🗑️  Eliminando datos existentes...")
            try:
                db.execute_query("DELETE FROM Usuario_Insignia", fetch=False)
                db.execute_query("DELETE FROM Ranking", fetch=False)
                db.execute_query("DELETE FROM Notificaciones", fetch=False)
                db.execute_query("DELETE FROM Usuario_Benchmarking", fetch=False)
                db.execute_query("DELETE FROM Resultados", fetch=False)
                db.execute_query("DELETE FROM Simulaciones", fetch=False)
                db.execute_query("DELETE FROM Usuarios", fetch=False)
                db.commit()
                print("✅ Datos eliminados exitosamente")
            except Exception as e:
                print(f"⚠️  Error eliminando datos (posiblemente tablas vacías): {e}")
                db.rollback()

            # Crear usuarios de prueba
            print("👥 Creando usuarios de prueba...")

            usuarios_prueba = [
                {
                    'nombres': 'María',
                    'apellidos': 'González',
                    'email': 'maria@techstartup.com',
                    'telefono': '+51987654321',
                    'nombre_usuario': 'empresa_tech',
                    'password': 'password123',
                    'empresa': 'Tech Startup S.A.',
                    'sector': 'Tecnología',
                    'tamano_empresa': 'Pequeña',
                    'newsletter': True
                },
                {
                    'nombres': 'Carlos',
                    'apellidos': 'Rodríguez',
                    'email': 'carlos@industria.com',
                    'telefono': '+51987654322',
                    'nombre_usuario': 'industrial_pequena',
                    'password': 'password123',
                    'empresa': 'Industria XYZ',
                    'sector': 'Manufactura',
                    'tamano_empresa': 'Pequeña',
                    'newsletter': False
                },
                {
                    'nombres': 'Ana',
                    'apellidos': 'Martínez',
                    'email': 'ana@comercio.com',
                    'telefono': '+51987654323',
                    'nombre_usuario': 'comercio_local',
                    'password': 'password123',
                    'empresa': 'Comercio Local',
                    'sector': 'Comercio',
                    'tamano_empresa': 'Pequeña',
                    'newsletter': True
                },
                {
                    'nombres': 'Luis',
                    'apellidos': 'Sánchez',
                    'email': 'luis@financiero.com',
                    'telefono': '+51987654324',
                    'nombre_usuario': 'financiero_consultor',
                    'password': 'password123',
                    'empresa': 'Consultora Financiera',
                    'sector': 'Servicios Financieros',
                    'tamano_empresa': 'Mediana',
                    'newsletter': True
                },
                {
                    'nombres': 'Patricia',
                    'apellidos': 'López',
                    'email': 'patricia@agricultura.com',
                    'telefono': '+51987654325',
                    'nombre_usuario': 'agricultura_moderna',
                    'password': 'password123',
                    'empresa': 'Agro Moderna',
                    'sector': 'Agricultura',
                    'tamano_empresa': 'Mediana',
                    'newsletter': False
                }
            ]

            usuarios_creados = []
            for i, datos_usuario in enumerate(usuarios_prueba, 1):
                try:
                    usuario = Usuario.crear(**datos_usuario)
                    if usuario:
                        # Actualizar nivel
                        Usuario.actualizar_nivel(usuario.usuario_id, 'basico')
                        usuarios_creados.append({
                            'id': usuario.usuario_id,
                            'usuario': datos_usuario['nombre_usuario'],
                            'email': datos_usuario['email']
                        })
                        print(f"✅ Usuario {i}/5 creado: {datos_usuario['nombre_usuario']}")
                    else:
                        print(f"❌ Error creando usuario {datos_usuario['nombre_usuario']}")
                except Exception as e:
                    print(f"❌ Error creando usuario {datos_usuario['nombre_usuario']}: {e}")

            db.disconnect()

            print("\n🎉 Base de datos reseteada exitosamente!")
            print(f"📊 Usuarios creados: {len(usuarios_creados)}")
            print("\n👤 Usuarios disponibles:")
            for usuario in usuarios_creados:
                print(f"  ID: {usuario['id']} | Usuario: {usuario['usuario']} | Email: {usuario['email']}")

            print("\n🔑 Credenciales de acceso:")
            print("  Usuario: cualquiera de los arriba")
            print("  Password: password123")

            return True

    except Exception as e:
        print(f"❌ Error reseteando base de datos: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = reset_database()
    if success:
        print("\n✅ Proceso completado exitosamente!")
        print("🔄 Puedes reiniciar la aplicación ahora.")
    else:
        print("\n❌ Error en el proceso de reseteo.")
        exit(1)
