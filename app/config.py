import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Config:
    """Configuración base de la aplicación"""

    # Configuración de Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'econova-secret-key-2025-dev')
    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'

    # Configuración de base de datos - Priorizar desarrollo local
    DATABASE_URL = os.getenv('DATABASE_URL', '')

    # Detectar si estamos en desarrollo local (no Render, no producción)
    IS_LOCAL_DEV = not os.getenv('RENDER') and not os.getenv('PRODUCTION') and DEBUG

    if IS_LOCAL_DEV:
        # Desarrollo local: Siempre usar SQLite
        DATABASE_URI = ''  # Se usará SQLite por defecto
    elif DATABASE_URL:
        # Producción con DATABASE_URL (Render)
        DATABASE_URI = DATABASE_URL
    else:
        # Configuración tradicional para desarrollo/producción alternativa
        DB_HOST = os.getenv('DB_HOST', 'localhost')
        DB_PORT = os.getenv('DB_PORT', '5432')
        DB_NAME = os.getenv('DB_NAME', 'econova_db')
        DB_USER = os.getenv('DB_USER', 'postgres')
        DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')
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

    # OpenAI configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

    # Google Sheets API configuration
    GOOGLE_SHEETS_CREDENTIALS_PATH = os.getenv('GOOGLE_SHEETS_CREDENTIALS_PATH', '')
    GOOGLE_SHEETS_SPREADSHEET_ID = os.getenv('GOOGLE_SHEETS_SPREADSHEET_ID', '')

    # Email configuration
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', '587'))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', os.getenv('SMTP_USERNAME', ''))
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', os.getenv('SMTP_PASSWORD', ''))
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', MAIL_USERNAME)

    # WhatsApp configuration (using Twilio)
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')
    TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER', '')

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
