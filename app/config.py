import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Config:
    """Configuración base de la aplicación"""
    
    # Configuración de Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'econova-secret-key-2025-dev')
    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    # Configuración de base de datos PostgreSQL
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'econova_db')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')
    
    # String de conexión PostgreSQL
    DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    # Configuración CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
    
    # Configuración de simulaciones
    MAX_ITERATIONS_MONTE_CARLO = 10000
    DEFAULT_DISCOUNT_RATE = 0.10  # 10% tasa de descuento por defecto
    
    # Configuración de API
    API_VERSION = 'v1'
    API_PREFIX = f'/api/{API_VERSION}'
    
    # Configuración de paginación
    ITEMS_PER_PAGE = 50
    
    # Límites de cálculo
    MAX_YEARS_PROJECTION = 30
    MIN_INVESTMENT_AMOUNT = 0
    MAX_INVESTMENT_AMOUNT = 999999999999  # 1 billón

class DevelopmentConfig(Config):
    """Configuración para desarrollo"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Configuración para producción"""
    DEBUG = False
    TESTING = False
    # En producción, siempre usar variables de entorno
    SECRET_KEY = os.getenv('SECRET_KEY')

class TestingConfig(Config):
    """Configuración para testing"""
    TESTING = True
    DEBUG = True
    DB_NAME = 'econova_test_db'

# Diccionario de configuraciones
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}