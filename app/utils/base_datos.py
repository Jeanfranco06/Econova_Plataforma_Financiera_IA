import os
from app.config import Config

# Importar módulos de base de datos
try:
    import sqlite3
    SQLITE_AVAILABLE = True
except ImportError:
    SQLITE_AVAILABLE = False

try:
    import psycopg2
    import psycopg2.extras
    POSTGRESQL_AVAILABLE = True
except ImportError:
    POSTGRESQL_AVAILABLE = False

# Detectar entorno (desarrollo vs producción)
IS_PRODUCTION = os.getenv('RENDER', False) or os.getenv('PRODUCTION', False)

# Detectar si usar PostgreSQL (producción) o SQLite (desarrollo)
if Config.DATABASE_URL and POSTGRESQL_AVAILABLE:
    # Producción: PostgreSQL con DATABASE_URL
    USE_POSTGRESQL = True
    print("🐘 Usando PostgreSQL (producción con DATABASE_URL)")
elif IS_PRODUCTION and hasattr(Config, 'DB_USER') and getattr(Config, 'DB_USER', '') and POSTGRESQL_AVAILABLE:
    # Producción: PostgreSQL con configuración individual
    USE_POSTGRESQL = True
    print("🐘 Usando PostgreSQL (producción)")
else:
    # Desarrollo: SQLite por defecto
    USE_POSTGRESQL = False
    print("🐘 Usando SQLite (desarrollo)")

class DatabaseConnection:
    def __init__(self):
        self.conn = None
        self.cur = None
        self.use_postgresql = USE_POSTGRESQL

    def connect(self):
        try:
            if self.use_postgresql:
                # Conexión PostgreSQL usando DATABASE_URI completa
                if Config.DATABASE_URL:
                    # Usar DATABASE_URL completa (Render)
                    self.conn = psycopg2.connect(
                        Config.DATABASE_URI,
                        options="-c client_encoding=UTF8"
                    )
                else:
                    # Usar configuración individual (desarrollo/producción alternativa)
                    self.conn = psycopg2.connect(
                        dbname=getattr(Config, 'DB_NAME', 'econova_db'),
                        user=getattr(Config, 'DB_USER', 'postgres'),
                        password=getattr(Config, 'DB_PASSWORD', 'postgres'),
                        host=getattr(Config, 'DB_HOST', 'localhost'),
                        port=getattr(Config, 'DB_PORT', '5432'),
                        options="-c client_encoding=UTF8"
                    )
                self.cur = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                print("✅ Conexión PostgreSQL exitosa")
                return True
            else:
                # Conexión SQLite
                db_name = getattr(Config, 'DB_NAME', 'econova.db')
                db_path = db_name if db_name and db_name.endswith('.db') else 'econova.db'
                self.conn = sqlite3.connect(db_path)
                self.conn.row_factory = sqlite3.Row
                self.cur = self.conn.cursor()
                print("✅ Conexión SQLite exitosa")
                return True
        except Exception as e:
            print(f"❌ Error conectando a base de datos: {e}")
            return False

    def disconnect(self):
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()

    def execute_query(self, query, params=None, fetch=False):
        try:
            # Convert parameter placeholders for SQLite
            if not self.use_postgresql and params:
                # Replace %s with ? for SQLite
                query = query.replace('%s', '?')

            if params is None:
                self.cur.execute(query)
            else:
                self.cur.execute(query, params)

            if fetch:
                return self.cur.fetchall()
            return True
        except Exception as e:
            print(f"Error executing query: {e}")
            if self.conn:
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

    def rollback(self):
        """Hacer rollback de la transacción"""
        try:
            if self.conn:
                self.conn.rollback()
                return True
        except Exception as e:
            print(f"Error en rollback: {e}")
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
