#!/usr/bin/env python3
import sys
sys.path.append('.')
from app.utils.base_datos import get_db_connection

def check_users():
    db = get_db_connection()
    db.connect()
    result = db.execute_query('SELECT usuario_id, nombres, apellidos, email FROM Usuarios', fetch=True)
    print('Users in database:')
    for user in result:
        print(f'ID: {user["usuario_id"]}, Nombres: {user["nombres"]}, Apellidos: {user["apellidos"]}, Email: {user["email"]}')
    db.disconnect()

def check_specific_user():
    db = get_db_connection()
    db.connect()
    result = db.execute_query('SELECT usuario_id, nombres, apellidos, email FROM Usuarios WHERE email = ?', ('jean20francisco06@gmail.com',), fetch=True)
    print('User with email jean20francisco06@gmail.com:')
    if result:
        for user in result:
            print(f'ID: {user["usuario_id"]}, Nombres: {user["nombres"]}, Apellidos: {user["apellidos"]}, Email: {user["email"]}')
    else:
        print('No user found with that email')
    db.disconnect()

if __name__ == '__main__':
    check_users()
    print()
    check_specific_user()
