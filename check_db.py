#!/usr/bin/env python3
from app.utils.base_datos import get_db_connection

def check_database():
    db = get_db_connection()
    db.connect()

    # Check tables
    tables = db.execute_query("SELECT name FROM sqlite_master WHERE type='table'", fetch=True)
    print('Tables in database:')
    for table in tables:
        print(f'  - {table["name"]}')

    # Check Usuarios table structure
    print('\nUsuarios table structure:')
    columns = db.execute_query("PRAGMA table_info(Usuarios)", fetch=True)
    for col in columns:
        print(f'  - {col["name"]}: {col["type"]}')

    db.disconnect()

if __name__ == "__main__":
    check_database()
