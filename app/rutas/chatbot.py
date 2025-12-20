"""
Rutas de API para Chatbot
Autor: Ronaldo (Responsable de Chatbot)
Integración: Germaín (Backend) + Gianfranco (ML Integration)
"""

from flask import Blueprint, request, jsonify
from app.servicios.chatbot_servicio import obtener_chatbot

bp_chatbot = Blueprint("chatbot", __name__, url_prefix="/api/v1/chatbot")


@bp_chatbot.route("/mensaje", methods=["POST"])
def enviar_mensaje():
    """
    Endpoint para interactuar con el chatbot financiero.

    Request Body:
        {
            "mensaje": "string - Consulta del usuario",
            "historial": "array - Historial de conversación (opcional)"
        }

    Response:
        {
            "respuesta": "string - Respuesta del chatbot",
            "prediccion": "object - Datos de predicción ML (si aplica)",
            "status": "success"
        }
    """
    try:
        # Obtener datos del request
        data = request.get_json()

        if not data or "mensaje" not in data:
            return jsonify(
                {"error": 'El campo "mensaje" es requerido', "status": "error"}
            ), 400

        mensaje = data["mensaje"]
        historial = data.get("historial", [])

        # Validar mensaje no vacío
        if not mensaje.strip():
            return jsonify(
                {"error": "El mensaje no puede estar vacío", "status": "error"}
            ), 400

        # Obtener instancia del chatbot
        chatbot = obtener_chatbot()

        # Procesar mensaje
        resultado = chatbot.procesar_mensaje(mensaje, historial)

        return jsonify(
            {
                "respuesta": resultado["respuesta"],
                "prediccion": resultado["prediccion"],
                "status": "success",
            }
        ), 200

    except Exception as e:
        return jsonify(
            {"error": f"Error interno del servidor: {str(e)}", "status": "error"}
        ), 500


@bp_chatbot.route("/salud", methods=["GET"])
def verificar_salud():
    """Endpoint para verificar el estado del servicio de chatbot."""
    try:
        chatbot = obtener_chatbot()
        return jsonify(
            {
                "status": "healthy",
                "service": "Chatbot Financiero IA",
                "version": "1.0",
                "ml_enabled": True,
            }
        ), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500
