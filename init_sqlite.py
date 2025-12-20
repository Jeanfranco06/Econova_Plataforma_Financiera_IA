#!/usr/bin/env python3
"""
Script para inicializar SQLite con las tablas necesarias para Econova
"""
import sqlite3
import os

def init_sqlite():
    """Inicializar base de datos SQLite con esquema básico"""
    db_name = 'econova.db'

    print(f"🐘 Inicializando SQLite: {db_name}")

    # Conectar a SQLite
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Crear tabla Usuarios simplificada
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Usuarios (
            usuario_id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombres TEXT NOT NULL,
            apellidos TEXT,
            email TEXT UNIQUE NOT NULL,
            telefono TEXT,
            nombre_usuario TEXT UNIQUE,
            password_hash TEXT,
            empresa TEXT,
            sector TEXT,
            tamano_empresa TEXT,
            newsletter BOOLEAN DEFAULT 0,
            nivel TEXT DEFAULT 'basico',
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Crear índices
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_email ON Usuarios(email)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_nombre_usuario ON Usuarios(nombre_usuario)')

    # Confirmar cambios
    conn.commit()
    conn.close()

    print("✅ Base de datos SQLite inicializada correctamente")
    print(f"   Archivo: {db_name}")
    print("   Tabla: Usuarios")

if __name__ == "__main__":
    init_sqlite()
