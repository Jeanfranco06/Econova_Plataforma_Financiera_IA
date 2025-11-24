"""
Rutas de API para Chatbot
Autor: Ronaldo (Responsable de Chatbot)
Integración: Germaín (Backend)
"""
from flask import Blueprint, request, jsonify

bp_chatbot = Blueprint('chatbot', __name__, url_prefix='/api/v1/chatbot')

@bp_chatbot.route('/mensaje', methods=['POST'])
def enviar_mensaje():
    """
    Endpoint para interactuar con el chatbot
    (A ser implementado por Ronaldo)
    """
    return jsonify({
        'message': 'Chatbot - En desarrollo por Ronaldo',
        'status': 'placeholder'
    }), 200