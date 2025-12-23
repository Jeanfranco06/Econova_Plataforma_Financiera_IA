from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for, flash
from app.servicios.gamification_servicio import GamificationService
from app.modelos.logro import Insignia, Usuario_Insignia, Ranking
from app.modelos.usuario import Usuario
import json

gamification_bp = Blueprint('gamification', __name__, url_prefix='/gamification')

@gamification_bp.route('/')
def gamification_dashboard():
    """Mostrar dashboard de gamificación"""
    if 'usuario_id' not in session:
        flash('Debes iniciar sesión para acceder al sistema de gamificación', 'error')
        return redirect(url_for('login'))

    usuario_id = session.get('usuario_id')

    # Obtener estadísticas del usuario
    estadisticas = GamificationService.obtener_estadisticas_gamification(usuario_id)

    # Obtener ranking del usuario
    ranking_usuario = Ranking.obtener_ranking_usuario(usuario_id)

    # Obtener top 10 del ranking general
    ranking_general = Ranking.obtener_ranking_sector('General', 10)

    return render_template('gamification.html',
                         estadisticas=estadisticas,
                         ranking_usuario=ranking_usuario,
                         ranking_general=ranking_general)

@gamification_bp.route('/api/estadisticas')
def obtener_estadisticas():
    """API para obtener estadísticas de gamificación"""
    if 'usuario_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Usuario no autenticado'
        }), 401

    usuario_id = session.get('usuario_id')

    try:
        estadisticas = GamificationService.obtener_estadisticas_gamification(usuario_id)
        return jsonify({
            'success': True,
            'estadisticas': estadisticas
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@gamification_bp.route('/api/verificar-insignias', methods=['POST'])
def verificar_insignias():
    """Verificar y otorgar insignias automáticamente"""
    if 'usuario_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Usuario no autenticado'
        }), 401

    usuario_id = session.get('usuario_id')

    try:
        insignias_otorgadas = GamificationService.verificar_y_otorgar_insignias(usuario_id)

        return jsonify({
            'success': True,
            'insignias_otorgadas': insignias_otorgadas,
            'mensaje': f'Se otorgaron {len(insignias_otorgadas)} nuevas insignias'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@gamification_bp.route('/api/ranking/<sector>')
def obtener_ranking_sector(sector):
    """Obtener ranking de un sector específico"""
    if 'usuario_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Usuario no autenticado'
        }), 401

    limite = request.args.get('limite', 20, type=int)

    try:
        ranking = Ranking.obtener_ranking_sector(sector, limite)
        return jsonify({
            'success': True,
            'ranking': [item['ranking'].to_dict() for item in ranking],
            'usuarios': [item['usuario'] for item in ranking]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@gamification_bp.route('/api/ranking/usuario')
def obtener_ranking_usuario():
    """Obtener rankings del usuario actual"""
    if 'usuario_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Usuario no autenticado'
        }), 401

    usuario_id = session.get('usuario_id')

    try:
        rankings = Ranking.obtener_ranking_usuario(usuario_id)
        return jsonify({
            'success': True,
            'rankings': [ranking.to_dict() for ranking in rankings]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@gamification_bp.route('/api/actualizar-puntaje', methods=['POST'])
def actualizar_puntaje():
    """Actualizar puntaje del usuario en un sector"""
    if 'usuario_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Usuario no autenticado'
        }), 401

    usuario_id = session.get('usuario_id')
    data = request.get_json()

    sector = data.get('sector', 'General')
    nuevo_puntaje = data.get('puntaje', 0)

    try:
        success = Ranking.actualizar_puntaje_usuario(usuario_id, sector, nuevo_puntaje)

        if success:
            # Verificar insignias relacionadas con ranking
            GamificationService.verificar_y_otorgar_insignias(usuario_id)

        return jsonify({
            'success': success,
            'mensaje': 'Puntaje actualizado correctamente' if success else 'Error al actualizar puntaje'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@gamification_bp.route('/api/insignias')
def obtener_insignias():
    """Obtener todas las insignias disponibles"""
    try:
        insignias = Insignia.listar_insignias()
        return jsonify({
            'success': True,
            'insignias': [insignia.to_dict() for insignia in insignias]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@gamification_bp.route('/api/insignias/usuario')
def obtener_insignias_usuario():
    """Obtener insignias del usuario actual"""
    if 'usuario_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Usuario no autenticado'
        }), 401

    usuario_id = session.get('usuario_id')

    try:
        insignias_usuario = Usuario_Insignia.obtener_insignias_usuario(usuario_id)
        return jsonify({
            'success': True,
            'insignias': insignias_usuario
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@gamification_bp.route('/api/logro/<tipo>', methods=['POST'])
def registrar_logro(tipo):
    """Registrar un logro específico del usuario"""
    if 'usuario_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Usuario no autenticado'
        }), 401

    usuario_id = session.get('usuario_id')
    data = request.get_json()

    try:
        # Según el tipo de logro, actualizar diferentes aspectos
        if tipo == 'simulacion_completada':
            # Ya se maneja en el servicio de simulación
            pass
        elif tipo == 'calculo_realizado':
            # Ya se maneja en el servicio financiero
            pass
        elif tipo == 'benchmarking_realizado':
            # Ya se maneja en el servicio de benchmarking
            pass

        # Verificar insignias después del logro
        insignias_otorgadas = GamificationService.verificar_y_otorgar_insignias(usuario_id)

        return jsonify({
            'success': True,
            'insignias_otorgadas': insignias_otorgadas
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@gamification_bp.route('/api/puntaje-total')
def obtener_puntaje_total():
    """Obtener puntaje total de gamificación del usuario"""
    if 'usuario_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Usuario no autenticado'
        }), 401

    usuario_id = session.get('usuario_id')

    try:
        puntaje = GamificationService.calcular_puntaje_gamification(usuario_id)
        return jsonify({
            'success': True,
            'puntaje': puntaje
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
