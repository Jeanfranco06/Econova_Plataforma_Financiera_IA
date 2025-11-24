# Utilidades para conexión y operaciones con PostgreSQL
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from app.config import Config

class DatabaseManager:
    """Gestor de conexiones a PostgreSQL"""
    
    _connection_pool = None
    
    @classmethod
    def initialize_pool(cls, minconn=1, maxconn=10):
        """
        Inicializa el pool de conexiones a la base de datos
        
        Args:
            minconn: Número mínimo de conexiones
            maxconn: Número máximo de conexiones
        """
        if cls._connection_pool is None:
            try:
                cls._connection_pool = psycopg2.pool.SimpleConnectionPool(
                    minconn,
                    maxconn,
                    host=Config.DB_HOST,
                    port=Config.DB_PORT,
                    database=Config.DB_NAME,
                    user=Config.DB_USER,
                    password=Config.DB_PASSWORD
                )
                print(f"✓ Pool de conexiones inicializado: {Config.DB_NAME}")
            except Exception as e:
                print(f"✗ Error al inicializar pool de conexiones: {e}")
                raise
    
    @classmethod
    @contextmanager
    def get_connection(cls):
        """
        Context manager para obtener una conexión del pool
        
        Yields:
            connection: Conexión a PostgreSQL
        """
        if cls._connection_pool is None:
            cls.initialize_pool()
        
        connection = cls._connection_pool.getconn()
        try:
            yield connection
        finally:
            cls._connection_pool.putconn(connection)
    
    @classmethod
    @contextmanager
    def get_cursor(cls, cursor_factory=RealDictCursor):
        """
        Context manager para obtener un cursor
        
        Args:
            cursor_factory: Tipo de cursor (por defecto RealDictCursor)
            
        Yields:
            cursor: Cursor de PostgreSQL
        """
        with cls.get_connection() as connection:
            cursor = connection.cursor(cursor_factory=cursor_factory)
            try:
                yield cursor
                connection.commit()
            except Exception as e:
                connection.rollback()
                raise e
            finally:
                cursor.close()
    
    @classmethod
    def close_all_connections(cls):
        """Cierra todas las conexiones del pool"""
        if cls._connection_pool:
            cls._connection_pool.closeall()
            print("✓ Pool de conexiones cerrado")

def ejecutar_query(query, params=None, fetch=True):
    """
    Ejecuta una query SQL
    
    Args:
        query: String con la query SQL
        params: Tupla con parámetros para la query
        fetch: Si es True, retorna resultados (SELECT), si es False solo ejecuta (INSERT, UPDATE, DELETE)
        
    Returns:
        Lista de diccionarios con resultados (si fetch=True) o número de filas afectadas
    """
    try:
        with DatabaseManager.get_cursor() as cursor:
            cursor.execute(query, params)
            
            if fetch:
                return cursor.fetchall()
            else:
                return cursor.rowcount
    except Exception as e:
        print(f"Error ejecutando query: {e}")
        raise

def ejecutar_query_una_fila(query, params=None):
    """
    Ejecuta una query y retorna solo una fila
    
    Args:
        query: String con la query SQL
        params: Tupla con parámetros para la query
        
    Returns:
        Diccionario con la primera fila o None
    """
    try:
        with DatabaseManager.get_cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchone()
    except Exception as e:
        print(f"Error ejecutando query: {e}")
        raise

def insertar_con_retorno(query, params=None):
    """
    Ejecuta un INSERT y retorna el registro insertado (usando RETURNING *)
    
    Args:
        query: String con la query INSERT
        params: Tupla con parámetros
        
    Returns:
        Diccionario con el registro insertado
    """
    try:
        with DatabaseManager.get_cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchone()
    except Exception as e:
        print(f"Error en INSERT: {e}")
        raise

def verificar_conexion():
    """
    Verifica la conexión a la base de datos
    
    Returns:
        bool: True si la conexión es exitosa
    """
    try:
        with DatabaseManager.get_cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✓ Conectado a PostgreSQL: {version['version']}")
            return True
    except Exception as e:
        print(f"✗ Error de conexión: {e}")
        return False