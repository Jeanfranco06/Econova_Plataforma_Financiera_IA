from flask import Blueprint, request, jsonify, render_template, session, redirect
import os
import logging
import traceback
import json

# Import the ChatbotServicio
from ..servicios.chatbot_servicio import obtener_servicio_chatbot

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

chatbot_bp = Blueprint("chatbot", __name__)

# Get chatbot service instance
chatbot_service = obtener_servicio_chatbot()


@chatbot_bp.route("/chatbot", methods=["GET"])
def chatbot_page():
    """Render chatbot page with optional contextual data"""
    # Verificar que el usuario esté logueado
    if 'usuario_id' not in session:
        logger.warning("Intento de acceso al chatbot sin sesión activa")
        return redirect('/login')

    contexto = None
    mensaje_inicial = None

    # Check for contextual data in URL parameters
    contexto_param = request.args.get('contexto')
    if contexto_param:
        try:
            contexto = json.loads(contexto_param)
            mensaje_inicial = contexto.get('mensaje_contextual', '')
            logger.debug(f"Contexto recibido: {contexto.get('tipo_simulacion', 'N/A')}")
        except json.JSONDecodeError as e:
            logger.error(f"Error decodificando contexto: {e}")
            contexto = None

    # Get user info for avatar
    usuario_id = session.get('usuario_id')
    foto_perfil = None

    if usuario_id:
        # Import here to avoid circular imports
        from app.servicios.usuario_servicio import UsuarioServicio
        usuario = UsuarioServicio.obtener_usuario_por_id(usuario_id)
        if usuario and usuario.foto_perfil:
            foto_perfil = usuario.foto_perfil

    return render_template('chatbot.html',
                         contexto=contexto,
                         mensaje_inicial=mensaje_inicial,
                         foto_perfil=foto_perfil)


@chatbot_bp.route("/chatbot", methods=["POST"])
def chatbot():
    """Handle chatbot messages"""
    try:
        logger.debug("=== Inicio de solicitud chatbot ===")

        data = request.get_json()
        logger.debug(f"Datos recibidos: {data}")

        if not data or "message" not in data:
            logger.warning("❌ Datos inválidos o mensaje faltante")
            return jsonify({"success": False, "error": "Mensaje requerido"}), 400

        user_message = data["message"].strip()
        logger.debug(f"Mensaje del usuario: {user_message}")

        if not user_message:
            logger.warning("❌ Mensaje vacío después de strip()")
            return jsonify({"success": False, "error": "Mensaje vacío"}), 400

        # Get user ID from session for personalized responses
        usuario_id = session.get('usuario_id')

        # Get analysis context if available
        analysis_context = data.get('analysis_context')

        # Check if this is a calculator consultation (legacy format)
        if not analysis_context and 'tipo_simulacion' in data:
            # Convert legacy format to analysis_context
            tipo_simulacion = data.get('tipo_simulacion')
            datos_simulacion = data.get('datos_simulacion', {})

            analysis_context = {
                'tipo_analisis': tipo_simulacion,
                'resultados': datos_simulacion
            }
            logger.debug(f"Converted legacy format to analysis_context: {analysis_context}")

        # Get response from ChatbotServicio
        logger.debug("Llamando al servicio de chatbot...")
        result = chatbot_service.consultar_ia(
            mensaje=user_message,
            usuario_id=usuario_id,
            analysis_context=analysis_context
        )

        if result.get('success'):
            logger.debug(f"Respuesta obtenida: {result['respuesta'][:100]}...")
            return jsonify(
                {
                    "success": True,
                    "response": result['respuesta'],
                    "timestamp": result.get('timestamp'),
                }
            )
        else:
            logger.error(f"Error en chatbot service: {result.get('error')}")
            return jsonify(
                {
                    "success": False,
                    "error": result.get('error', 'Error interno'),
                    "response": "Lo siento, hubo un error al procesar tu mensaje.",
                }
            ), 500

    except ValueError as e:
        logger.error(f"❌ Error en JSON: {e}")
        return jsonify(
            {
                "success": False,
                "error": "JSON inválido",
                "response": "El formato de tu mensaje es inválido.",
            }
        ), 400

    except TypeError as e:
        logger.error(f"❌ Error de tipo en chatbot: {e}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        return jsonify(
            {
                "success": False,
                "error": "Error de tipo de datos",
                "response": "Hubo un error al procesar tu mensaje.",
            }
        ), 500

    except Exception as e:
        logger.error(f"❌ Error inesperado en chatbot: {type(e).__name__}: {e}")
        logger.debug(f"Traceback completo:\n{traceback.format_exc()}")

        return jsonify(
            {
                "success": False,
                "error": "Error interno del servidor",
                "response": "Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.",
                "debug_error": str(e) if os.getenv("DEBUG") else None,
            }
        ), 500


@chatbot_bp.route("/chatbot/analytics", methods=["POST"])
def chatbot_analytics():
    """Endpoint para recibir analytics del chatbot"""
    try:
        data = request.get_json()
        usuario_id = session.get('usuario_id')
        
        # Log analytics (puedes guardar en BD si es necesario)
        logger.info(f"📊 Analytics recibido - Usuario: {usuario_id}, Evento: {data.get('event')}")
        
        # Aquí puedes guardar en base de datos si lo necesitas
        # Por ahora solo logueamos
        
        return jsonify({"success": True}), 200
        
    except Exception as e:
        logger.error(f"Error en analytics: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@chatbot_bp.route("/chatbot/stats", methods=["GET"])
def chatbot_stats():
    """Endpoint para obtener estadísticas del chatbot"""
    try:
        usuario_id = session.get('usuario_id')
        
        stats = chatbot_service.obtener_estadisticas_conversaciones(usuario_id)
        
        return jsonify({
            "success": True,
            "stats": stats
        }), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo stats: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
