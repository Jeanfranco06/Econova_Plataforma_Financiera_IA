#!/usr/bin/env python3
import sqlite3
import os

def check_db():
    db_paths = ['base_datos/econova.db', 'econova.db', 'app.db']
    db_path = None
    for path in db_paths:
        if os.path.exists(path):
            db_path = path
            break

    if not db_path:
        print('No se encontró base de datos SQLite')
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Ver qué tablas relacionadas con benchmarking existen
    cursor.execute('SELECT name FROM sqlite_master WHERE type="table" AND name LIKE "%enchmarking%"')
    tables = cursor.fetchall()

    print(f'Tablas relacionadas con benchmarking en {db_path}:')
    for table in tables:
        table_name = table[0]
        print(f'  - {table_name}')

        # Ver estructura de cada tabla
        cursor.execute(f'PRAGMA table_info({table_name})')
        columns = cursor.fetchall()
        print(f'    Columnas: {[col[1] for col in columns]}')

        # Ver algunos registros
        try:
            cursor.execute(f'SELECT * FROM {table_name} LIMIT 3')
            rows = cursor.fetchall()
            print(f'    Registros de ejemplo: {len(rows)} filas')
            if rows:
                print(f'      Primera fila: {rows[0]}')
        except Exception as e:
            print(f'    Error obteniendo registros: {e}')
        print()

    # Verificar específicamente la tabla Usuario_Benchmarking
    try:
        cursor.execute('SELECT * FROM Usuario_Benchmarking LIMIT 5')
        usuarios_grupos = cursor.fetchall()
        print(f'Registros en Usuario_Benchmarking: {len(usuarios_grupos)}')
        if usuarios_grupos:
            print('Primeros registros:')
            for registro in usuarios_grupos:
                print(f'  Usuario ID: {registro[0]}, Grupo ID: {registro[1]}')
    except Exception as e:
        print(f'Error consultando Usuario_Benchmarking: {e}')

    conn.close()

if __name__ == '__main__':
    check_db()
