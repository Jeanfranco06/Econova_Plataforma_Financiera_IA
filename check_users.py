#!/usr/bin/env python3
from app.utils.base_datos import get_db_connection

def check_users():
    db = get_db_connection()
    try:
        db.connect()
        result = db.execute_query('SELECT usuario_id, nombre_usuario, nombres, apellidos FROM Usuarios', fetch=True)
        print('Usuarios en BD:')
        if result:
            for u in result:
                print(f'{u["usuario_id"]}: {u["nombre_usuario"]} - {u["nombres"]} {u["apellidos"]}')
        else:
            print('No hay usuarios')
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.disconnect()

if __name__ == "__main__":
    check_users()
