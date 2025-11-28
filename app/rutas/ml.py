"""
Rutas de API para Machine Learning
Autor: Diego (Responsable de ML)
Integración: Germaín (Backend)
"""
from flask import Blueprint, request, jsonify

bp_ml = Blueprint('ml', __name__, url_prefix='/api/v1/ml')

@bp_ml.route('/predecir', methods=['POST'])
def predecir():
    """
    Endpoint para predicciones ML
    (A ser implementado por Diego)
    """
    return jsonify({
        'message': 'Endpoint de ML - En desarrollo por Diego',
        'status': 'placeholder'
    }), 200

@bp_ml.route('/sensibilidad', methods=['POST'])
def analisis_sensibilidad():
    """
    Endpoint para análisis de sensibilidad
    (A ser implementado por Diego)
    """
    return jsonify({
        'message': 'Análisis de sensibilidad - En desarrollo por Diego',
        'status': 'placeholder'
    }), 200