from flask import Flask, jsonify, render_template
from flask_cors import CORS
from flask_mail import Mail
from app.config import config
from app.utils.base_datos import get_db_connection, init_db
from app.servicios.email_servicio import email_service
import os

def crear_tablas_sqlite():
    """Crear tablas necesarias para SQLite"""
    try:
        db = get_db_connection()
        db.connect()

        # Crear tabla Usuarios
        db.cur.execute('''
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
        db.cur.execute('CREATE INDEX IF NOT EXISTS idx_email ON Usuarios(email)')
        db.cur.execute('CREATE INDEX IF NOT EXISTS idx_nombre_usuario ON Usuarios(nombre_usuario)')

        db.conn.commit()
        print("✅ Tablas SQLite creadas exitosamente")

    except Exception as e:
        print(f"❌ Error creando tablas SQLite: {e}")
    finally:
        db.disconnect()

def crear_app(config_name='development'):
    """
    Factory para crear la aplicación Flask
    
    Args:
        config_name: Nombre de la configuración ('development', 'production', 'testing')
        
    Returns:
        app: Aplicación Flask configurada
    """
    app = Flask(__name__, template_folder='plantillas')

    # Cargar configuración
    app.config.from_object(config[config_name])
    
    # Configurar CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])

    # Inicializar Flask-Mail
    mail = Mail(app)

    # Inicializar servicio de email
    email_service.init_app(app)

    # Inicializar conexión a BD
    with app.app_context():
        try:
            if init_db():
                print("✅ Base de datos conectada exitosamente")
                # Crear tablas si es SQLite
                from app.utils.base_datos import USE_POSTGRESQL
                if not USE_POSTGRESQL:
                    crear_tablas_sqlite()
            else:
                print("⚠️  No se pudo conectar a la base de datos")
                print("   La aplicación funcionará con limitaciones")
        except Exception as e:
            print(f"❌ Error inicializando base de datos: {e}")
            print("   La aplicación funcionará con limitaciones")
    
    # Registrar Blueprints (Rutas)
    registrar_blueprints(app)
    
    # Registrar manejadores de errores
    registrar_manejadores_errores(app)
    
    # Ruta de salud (health check)
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Econova API',
            'version': app.config['API_VERSION']
        }), 200
    
    @app.route('/')
    def index():
        return render_template('inicio.html')

    @app.route('/terminos')
    def terminos():
        return render_template('terminos.html')

    @app.route('/privacidad')
    def privacidad():
        return render_template('privacidad.html')

    @app.route('/simulacion')
    def simulacion():
        return render_template('simulacion.html')

    @app.route('/resultados')
    def resultados():
        return render_template('resultados.html')

    @app.route('/chatbot')
    def chatbot():
        return render_template('chatbot.html')

    @app.route('/benchmarking')
    def benchmarking():
        return render_template('benchmarking.html')

    @app.route('/demo')
    def demo():
        return render_template('demo.html')
    
    return app

def registrar_blueprints(app):
    """Registra todos los blueprints de la aplicación"""
    
    # Rutas financieras (Germaín) - commented out due to import issues
    # from app.rutas.financiero import bp_financiero
    # app.register_blueprint(bp_financiero)
    
    # Rutas de usuarios (Germaín)
    from app.rutas.usuarios import usuarios_bp
    app.register_blueprint(usuarios_bp, url_prefix='/api/v1')
    
    # Rutas de ML (Diego) - placeholder
    from app.rutas.ml import bp_ml
    app.register_blueprint(bp_ml)
    
    # Rutas de Chatbot (Ronaldo) - placeholder
    from app.rutas.chatbot import chatbot_bp
    app.register_blueprint(chatbot_bp)
    
    # Rutas de Benchmarking (Jeanfranco) - placeholder
    from app.rutas.benchmarking import benchmarking_bp
    app.register_blueprint(benchmarking_bp, url_prefix='/api/v1')

def registrar_manejadores_errores(app):
    """Registra manejadores de errores globales"""
    
    @app.errorhandler(404)
    def no_encontrado(error):
        return jsonify({
            'error': 'Recurso no encontrado',
            'status': 404
        }), 404
    
    @app.errorhandler(500)
    def error_interno(error):
        return jsonify({
            'error': 'Error interno del servidor',
            'status': 500
        }), 500
    
    @app.errorhandler(400)
    def peticion_invalida(error):
        return jsonify({
            'error': 'Petición inválida',
            'status': 400
        }), 400
