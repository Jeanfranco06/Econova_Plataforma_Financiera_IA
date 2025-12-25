from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for, flash
from app.servicios.gamification_servicio import GamificationService
from app.modelos.logro import Insignia, Usuario_Insignia, Ranking
from app.modelos.usuario import Usuario
import json

gamification_bp = Blueprint('gamification', __name__)

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

    return render_template('gamification_nuevo.html',
                         estadisticas=estadisticas,
                         ranking_usuario=ranking_usuario,
                         ranking_general=ranking_general)

@gamification_bp.route('estadisticas/<int:usuario_id>')
def obtener_estadisticas(usuario_id):
    """API para obtener estadísticas de gamificación"""
    if 'usuario_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Usuario no autenticado'
        }), 401

    # Verificar que el usuario_id de la URL coincida con el de la sesión
    if usuario_id != session['usuario_id']:
        return jsonify({
            'success': False,
            'error': 'No autorizado'
        }), 403

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

@gamification_bp.route('ranking-global')
def obtener_ranking_global():
    """Obtener ranking global de usuarios"""
    limite = request.args.get('limite', 10, type=int)

    try:
        ranking_global = GamificationService.obtener_ranking_global(limite)

        # Verificar si el usuario actual está en el ranking
        usuario_actual = None
        if 'usuario_id' in session:
            usuario_id_actual = session.get('usuario_id')
            for item in ranking_global:
                if item['usuario_id'] == usuario_id_actual:
                    usuario_actual = item
                    break

        return jsonify({
            'success': True,
            'ranking': ranking_global,
            'usuario_actual': usuario_actual
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@gamification_bp.route('verificar-insignias', methods=['POST'])
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

@gamification_bp.route('ranking/<sector>')
def obtener_ranking_sector(sector):
    """Obtener ranking de un sector específico"""
    limite = request.args.get('limite', 20, type=int)

    try:
        # Para el sector 'General', usar ranking global basado en gamificación
        if sector == 'General':
            ranking_data = GamificationService.obtener_ranking_global(limite)

            # Convertir al formato esperado por el frontend
            ranking = []
            usuarios = []

            for item in ranking_data:
                try:
                    usuario_id = item.get('usuario_id', 0)
                    ranking_item = {
                        'usuario_id': usuario_id,
                        'puntaje': item.get('puntaje', 0),
                        'posicion': item.get('posicion', 0)
                    }

                    # Extraer nombres y apellidos del campo 'nombre'
                    nombre_completo = item.get('nombre', f'Usuario {usuario_id}')
                    if isinstance(nombre_completo, str):
                        partes_nombre = nombre_completo.split(' ')
                        nombres = partes_nombre[0] if len(partes_nombre) > 0 else 'Usuario'
                        apellidos = ' '.join(partes_nombre[1:]) if len(partes_nombre) > 1 else ''
                    else:
                        nombres = 'Usuario'
                        apellidos = str(usuario_id)

                    usuario_item = {
                        'usuario_id': usuario_id,
                        'nombres': nombres,
                        'apellidos': apellidos,
                        'nombre_usuario': f"user{usuario_id}",
                        'nivel': item.get('nivel', 1)
                    }

                    ranking.append(ranking_item)
                    usuarios.append(usuario_item)
                except Exception as e:
                    print(f"Error procesando item de ranking: {e}, item: {item}")
                    continue

            # Verificar si el usuario actual está en el ranking
            usuario_actual = None
            if 'usuario_id' in session:
                usuario_id_actual = session.get('usuario_id')
                for i, item in enumerate(ranking_data):
                    if item['usuario_id'] == usuario_id_actual:
                        usuario_actual = {
                            'ranking': ranking[i],
                            'usuario': usuarios[i]
                        }
                        break

            # Asegurar que ranking y usuarios tengan la misma longitud
            min_length = min(len(ranking), len(usuarios))
            ranking = ranking[:min_length]
            usuarios = usuarios[:min_length]

            response_data = {
                'success': True,
                'ranking': ranking,
                'usuarios': usuarios
            }

            if usuario_actual:
                response_data['usuario_actual'] = usuario_actual

            return jsonify(response_data)

        # Para otros sectores, usar el ranking tradicional
        ranking = Ranking.obtener_ranking_sector(sector, limite)

        # Verificar si el usuario actual está autenticado y en el ranking
        usuario_actual = None
        if 'usuario_id' in session:
            usuario_id_actual = session.get('usuario_id')
            for item in ranking:
                if item['ranking']['usuario_id'] == usuario_id_actual:
                    usuario_actual = {
                        'ranking': item['ranking'],
                        'usuario': item['usuario']
                    }
                    break

        return jsonify({
            'success': True,
            'ranking': [item['ranking'] for item in ranking],
            'usuarios': [item['usuario'] for item in ranking],
            'usuario_actual': usuario_actual
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@gamification_bp.route('ranking/usuario')
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

@gamification_bp.route('actualizar-puntaje', methods=['POST'])
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

@gamification_bp.route('insignias')
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

@gamification_bp.route('insignias/usuario')
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

@gamification_bp.route('logro/<tipo>', methods=['POST'])
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

@gamification_bp.route('logros-proximos')
def obtener_logros_proximos():
    """Obtener logros próximos (insignias que el usuario puede obtener próximamente)"""
    if 'usuario_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Usuario no autenticado'
        }), 401

    usuario_id = session.get('usuario_id')

    try:
        logros_proximos = GamificationService.obtener_logros_proximos(usuario_id)
        return jsonify({
            'success': True,
            'logros': logros_proximos
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@gamification_bp.route('actividad-reciente')
def obtener_actividad_reciente():
    """Obtener actividad reciente del usuario"""
    if 'usuario_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Usuario no autenticado'
        }), 401

    usuario_id = session.get('usuario_id')

    try:
        actividades = GamificationService.obtener_actividad_reciente(usuario_id)
        return jsonify({
            'success': True,
            'actividades': actividades
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@gamification_bp.route('puntaje-total')
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

@gamification_bp.route('notificaciones-pendientes')
def obtener_notificaciones_pendientes():
    """Obtener notificaciones pendientes del usuario"""
    if 'usuario_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Usuario no autenticado'
        }), 401

    usuario_id = session.get('usuario_id')

    try:
        from app.modelos.notificacion import Notificacion
        notificaciones = Notificacion.obtener_notificaciones_no_leidas(usuario_id)

        # Obtener las notificaciones pendientes
        notificaciones_pendientes = Notificacion.obtener_notificaciones_usuario(usuario_id, limite=10)
        notificaciones_pendientes = [n for n in notificaciones_pendientes if n.estado == 'Pendiente']

        return jsonify({
            'success': True,
            'notificaciones': [n.to_dict() for n in notificaciones_pendientes],
            'total_pendientes': len(notificaciones_pendientes)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@gamification_bp.route('marcar-leidas', methods=['POST'])
def marcar_notificaciones_leidas():
    """Marcar notificaciones como leídas"""
    if 'usuario_id' not in session:
        return jsonify({
            'success': False,
            'error': 'Usuario no autenticado'
        }), 401

    usuario_id = session.get('usuario_id')
    data = request.get_json()
    notificaciones_ids = data.get('notificaciones_ids', [])

    try:
        from app.modelos.notificacion import Notificacion

        marcadas = 0
        for notif_id in notificaciones_ids:
            if Notificacion.marcar_como_leida(notif_id):
                marcadas += 1

        return jsonify({
            'success': True,
            'marcadas': marcadas,
            'mensaje': f'Se marcaron {marcadas} notificaciones como leídas'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
