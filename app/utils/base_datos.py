import psycopg2
import psycopg2.extras
import os
from app.config import Config

class DatabaseConnection:
    def __init__(self):
        self.conn = None
        self.cur = None

    def connect(self):
        try:
            self.conn = psycopg2.connect(
                dbname=Config.DB_NAME,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                host=Config.DB_HOST,
                port=Config.DB_PORT
            )
            self.cur = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            return True
        except Exception as e:
            print(f"Error connecting to database: {e}")
            return False

    def disconnect(self):
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()

    def execute_query(self, query, params=None, fetch=False):
        try:
            self.cur.execute(query, params)
            if fetch:
                return self.cur.fetchall()
            return True
        except Exception as e:
            print(f"Error executing query: {e}")
            self.conn.rollback()
            return False

    def commit(self):
        try:
            self.conn.commit()
            return True
        except Exception as e:
            print(f"Error committing transaction: {e}")
            self.conn.rollback()
            return False

# Singleton instance
db = DatabaseConnection()

def get_db_connection():
    """Obtener instancia de conexión de base de datos"""
    return db

def init_db():
    """Inicializar conexión de base de datos"""
    return db.connect()

def close_db():
    """Cerrar conexión de base de datos"""
    db.disconnect()
