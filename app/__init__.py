from flask import Flask, jsonify
from flask_cors import CORS
from app.config import config
from app.utils.base_datos import init_db, close_db
import os


def crear_app(config_name="development"):
    """
    Factory para crear la aplicación Flask

    Args:
        config_name: Nombre de la configuración ('development', 'production', 'testing')

    Returns:
        app: Aplicación Flask configurada
    """
    app = Flask(__name__, template_folder="plantillas", static_folder="static")

    # Cargar configuración
    app.config.from_object(config[config_name])

    # Configurar CORS
    CORS(app, origins=app.config["CORS_ORIGINS"])

    # Inicializar conexión a BD
    with app.app_context():
        init_db()

    # Registrar Blueprints (Rutas)
    registrar_blueprints(app)

    # Registrar manejadores de errores
    registrar_manejadores_errores(app)

    # Ruta de salud (health check)
    @app.route("/health")
    def health_check():
        return jsonify(
            {
                "status": "healthy",
                "service": "Econova API",
                "version": app.config["API_VERSION"],
            }
        ), 200

    return app


def registrar_blueprints(app):
    """Registra todos los blueprints de la aplicación"""

    # Rutas del Frontend (Gianfranco)
    from app.rutas.frontend import bp_frontend

    app.register_blueprint(bp_frontend)

    # Rutas financieras (Germaín)
    from app.rutas.financiero import bp_financiero

    app.register_blueprint(bp_financiero)

    # Rutas de usuarios (Germaín)
    from app.rutas.usuarios import bp_usuarios

    app.register_blueprint(bp_usuarios)

    # Rutas de ML (Diego) - placeholder
    from app.rutas.ml import bp_ml

    app.register_blueprint(bp_ml)

    # Rutas de Chatbot (Ronaldo) - placeholder
    from app.rutas.chatbot import bp_chatbot

    app.register_blueprint(bp_chatbot)

    # Rutas de Benchmarking (Jeanfranco) - placeholder
    from app.rutas.benchmarking import bp_benchmarking

    app.register_blueprint(bp_benchmarking)


def registrar_manejadores_errores(app):
    """Registra manejadores de errores globales"""

    @app.errorhandler(404)
    def no_encontrado(error):
        return jsonify({"error": "Recurso no encontrado", "status": 404}), 404

    @app.errorhandler(500)
    def error_interno(error):
        return jsonify({"error": "Error interno del servidor", "status": 500}), 500

    @app.errorhandler(400)
    def peticion_invalida(error):
        return jsonify({"error": "Petición inválida", "status": 400}), 400
