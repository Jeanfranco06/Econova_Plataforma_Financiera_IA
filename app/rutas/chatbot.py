from flask import Blueprint, request, jsonify
import openai
import os
from functools import lru_cache
import logging
import traceback

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

chatbot_bp = Blueprint("chatbot", __name__)

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY", "")

# Validar que la API key esté configurada
if not openai.api_key or openai.api_key == "":
    logger.warning("⚠️ OPENAI_API_KEY no está configurada")

# Financial knowledge base for fallback responses
FINANCIAL_KNOWLEDGE = {
    "van": {
        "definition": "El VAN (Valor Actual Neto) es una herramienta financiera que mide la rentabilidad de una inversión calculando la diferencia entre los ingresos futuros descontados y la inversión inicial.",
        "formula": "VAN = Σ(Flujo de Cajaₜ / (1 + r)ᵗ) - Inversión Inicial",
        "interpretation": "Si VAN > 0: La inversión es rentable. Si VAN < 0: La inversión no es rentable. Si VAN = 0: La inversión se recupera pero no genera ganancia.",
    },
    "tir": {
        "definition": "La TIR (Tasa Interna de Retorno) es la tasa de descuento que hace que el VAN sea igual a cero.",
        "interpretation": "Si TIR > Costo de capital: La inversión es atractiva. Si TIR < Costo de capital: La inversión no es atractiva.",
    },
    "wacc": {
        "definition": "El WACC (Costo Promedio Ponderado del Capital) representa el costo promedio del capital de una empresa.",
        "formula": "WACC = (E/V × Re) + (D/V × Rd × (1-Tc))",
        "interpretation": "Es la tasa mínima de retorno que debe generar un proyecto para crear valor.",
    },
}


@lru_cache(maxsize=100)
def get_financial_response(query):
    """Get response from OpenAI with financial context"""
    try:
        logger.debug(f"Procesando query: {query[:50]}...")

        # Verificar que la API key está disponible
        if not openai.api_key or openai.api_key == "":
            logger.error("❌ OPENAI_API_KEY no configurada")
            return get_fallback_response(query)

        system_prompt = """
        Eres Econova AI, un asesor financiero inteligente especializado en análisis empresarial.
        Tu objetivo es ayudar a emprendedores y empresarios peruanos a tomar mejores decisiones financieras.

        Conocimientos clave:
        - VAN (Valor Actual Neto): Mide rentabilidad descontando flujos futuros
        - TIR (Tasa Interna de Retorno): Tasa que hace VAN = 0
        - WACC (Costo Promedio Ponderado): Costo del capital de la empresa
        - Análisis de riesgo y sensibilidad
        - Decisiones de inversión y financiamiento

        Responde de manera:
        - Profesional pero accesible
        - Concisa pero completa
        - En español
        - Con ejemplos cuando sea útil
        - Adaptada al contexto peruano cuando aplique

        Si no sabes algo específico, admítelo y sugiere consultar con un asesor financiero calificado.
        """

        logger.debug("Llamando a OpenAI API...")
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query},
            ],
            max_tokens=500,
            temperature=0.7,
        )

        result = response.choices[0].message.content.strip()
        logger.debug(f"✅ Respuesta OpenAI exitosa: {result[:50]}...")
        return result

    except openai.error.AuthenticationError as e:
        logger.error(f"❌ Error de autenticación OpenAI: {e}")
        return get_fallback_response(query)

    except openai.error.RateLimitError as e:
        logger.error(f"❌ Rate limit excedido en OpenAI: {e}")
        return get_fallback_response(query)

    except openai.error.APIError as e:
        logger.error(f"❌ Error general OpenAI API: {e}")
        return get_fallback_response(query)

    except openai.error.APIConnectionError as e:
        logger.error(f"❌ Error de conexión a OpenAI: {e}")
        return get_fallback_response(query)

    except TypeError as e:
        logger.error(f"❌ Error de tipo (posiblemente query no hashable): {e}")
        logger.debug(f"Traceback completo: {traceback.format_exc()}")
        return get_fallback_response(query)

    except Exception as e:
        logger.error(f"❌ Error inesperado con OpenAI: {type(e).__name__}: {e}")
        logger.debug(f"Traceback completo: {traceback.format_exc()}")
        return get_fallback_response(query)


def get_fallback_response(query):
    """Provide fallback responses when OpenAI is not available"""
    query_lower = query.lower()

    # Check for specific financial terms
    if "van" in query_lower and (
        "que es" in query_lower or "qué es" in query_lower or "significa" in query_lower
    ):
        return f"**¿Qué es el VAN?**\n\n{FINANCIAL_KNOWLEDGE['van']['definition']}\n\n**Fórmula básica:**\n{FINANCIAL_KNOWLEDGE['van']['formula']}\n\n**Interpretación:**\n{FINANCIAL_KNOWLEDGE['van']['interpretation']}"

    if "tir" in query_lower and (
        "que es" in query_lower or "qué es" in query_lower or "significa" in query_lower
    ):
        return f"**¿Qué es la TIR?**\n\n{FINANCIAL_KNOWLEDGE['tir']['definition']}\n\n**Interpretación:**\n{FINANCIAL_KNOWLEDGE['tir']['interpretation']}"

    if "wacc" in query_lower and (
        "que es" in query_lower or "qué es" in query_lower or "significa" in query_lower
    ):
        return f"**¿Qué es el WACC?**\n\n{FINANCIAL_KNOWLEDGE['wacc']['definition']}\n\n**Fórmula:**\n{FINANCIAL_KNOWLEDGE['wacc']['formula']}\n\n**Interpretación:**\n{FINANCIAL_KNOWLEDGE['wacc']['interpretation']}"

    if "tasa" in query_lower and "descuento" in query_lower:
        return "**Tasa de Descuento**\n\nEs el costo de oportunidad del capital. En Perú, para proyectos empresariales, suele estar entre 12-18% anual dependiendo del sector y riesgo.\n\nFactores que influyen:\n• Riesgo del proyecto\n• Costo de capital de la empresa\n• Inflación esperada\n• Tasas de interés bancarias"

    if "riesgo" in query_lower:
        return "**Análisis de Riesgo Financiero**\n\nPrincipales tipos de riesgo:\n\n1. **Riesgo de Mercado:** Cambios en tasas de interés, inflación, tipo de cambio\n2. **Riesgo Operativo:** Problemas en la ejecución del proyecto\n3. **Riesgo Financiero:** Endeudamiento excesivo, problemas de liquidez\n\n**Recomendaciones:**\n• Realizar análisis de sensibilidad\n• Mantener reservas de efectivo\n• Diversificar fuentes de financiamiento"

    # Generic financial advice
    if any(
        word in query_lower for word in ["invertir", "inversión", "proyecto", "negocio"]
    ):
        return "**Consejo General para Inversiones**\n\nAntes de invertir:\n\n1. **Evalúa el VAN** - Debe ser positivo\n2. **Calcula la TIR** - Debe superar tu costo de capital\n3. **Analiza riesgos** - Considera escenarios pesimistas\n4. **Revisa flujo de caja** - Asegúrate de poder pagar deudas\n\nRecuerda: Toda inversión tiene riesgos. Considera consultar con un asesor financiero calificado."

    # Default response
    return "**¡Hola! Soy Econova AI**\n\nTu asesor financiero inteligente. Puedo ayudarte con:\n\n• Explicación de conceptos financieros (VAN, TIR, WACC)\n• Interpretación de resultados de simulaciones\n• Recomendaciones para decisiones de inversión\n• Análisis de riesgo y sensibilidad\n\n¿En qué tema específico te gustaría que te ayude?"


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

        # Get response from AI
        logger.debug("Llamando a get_financial_response...")
        response = get_financial_response(user_message)
        logger.debug(f"Respuesta obtenida: {response[:100]}...")

        return jsonify(
            {
                "success": True,
                "response": response,
                "timestamp": str(request.timestamp)
                if hasattr(request, "timestamp")
                else None,
            }
        )

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
