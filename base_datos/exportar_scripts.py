#!/usr/bin/env python3
"""
Scripts para exportar datos de la base de datos
"""

import os
import sys
from app import crear_app
from app.modelos.usuario import Usuario

def export_users_to_csv():
    """Exporta usuarios a CSV"""
    try:
        print("📊 Exportando usuarios a CSV...")

        app = crear_app('development')
        with app.app_context():
            usuarios = Usuario.listar_usuarios()

            if not usuarios:
                print("⚠️  No hay usuarios para exportar")
                return False

            # Crear archivo CSV
            import csv
            with open('usuarios_export.csv', 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['usuario_id', 'nombre_usuario', 'nombres', 'apellidos',
                            'email', 'telefono', 'empresa', 'sector', 'tamano_empresa',
                            'newsletter', 'nivel', 'fecha_creacion']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

                writer.writeheader()
                for usuario in usuarios:
                    writer.writerow({
                        'usuario_id': usuario.usuario_id,
                        'nombre_usuario': usuario.nombre_usuario,
                        'nombres': usuario.nombres,
                        'apellidos': usuario.apellidos,
                        'email': usuario.email,
                        'telefono': usuario.telefono,
                        'empresa': usuario.empresa,
                        'sector': usuario.sector,
                        'tamano_empresa': usuario.tamano_empresa,
                        'newsletter': usuario.newsletter,
                        'nivel': usuario.nivel,
                        'fecha_creacion': usuario.fecha_creacion
                    })

            print(f"✅ Exportados {len(usuarios)} usuarios a usuarios_export.csv")
            return True

    except Exception as e:
        print(f"❌ Error exportando usuarios: {e}")
        return False

def export_database_schema():
    """Exporta el esquema de la base de datos"""
    try:
        print("📋 Exportando esquema de base de datos...")

        app = crear_app('development')
        with app.app_context():
            from app.utils.base_datos import get_db_connection

            db = get_db_connection()
            db.connect()

            # Obtener tablas
            if hasattr(db, 'cur'):
                try:
                    db.cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
                    tables = db.cur.fetchall()

                    with open('esquema_export.sql', 'w', encoding='utf-8') as f:
                        f.write("-- Esquema exportado de la base de datos\n\n")

                        for table in tables:
                            table_name = table[0]
                            f.write(f"-- Tabla: {table_name}\n")

                            # Obtener CREATE statement
                            db.cur.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';")
                            create_stmt = db.cur.fetchone()
                            if create_stmt:
                                f.write(create_stmt[0] + ";\n\n")

                    print("✅ Esquema exportado a esquema_export.sql")
                    db.disconnect()
                    return True

                except Exception as e:
                    print(f"❌ Error obteniendo esquema: {e}")
                    db.disconnect()
                    return False
            else:
                print("⚠️  Exportación de esquema solo disponible para SQLite")
                db.disconnect()
                return False

    except Exception as e:
        print(f"❌ Error exportando esquema: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'users':
            success = export_users_to_csv()
        elif command == 'schema':
            success = export_database_schema()
        else:
            print("Uso: python exportar_scripts.py [users|schema]")
            sys.exit(1)
    else:
        print("Exportando todo...")
        export_users_to_csv()
        export_database_schema()

    print("\n✅ Exportación completada!")
