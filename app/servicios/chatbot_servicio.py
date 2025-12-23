"""
Servicio de Chatbot Inteligente - Versión Mejorada
Implementa Groq + OpenAI fallback, prompts multinivel, logs conversacionales, 
copiloto adaptativo, caché inteligente, memoria conversacional y validación avanzada
"""

import os
import json
import logging
import hashlib
import html
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from functools import lru_cache
import traceback

# AI Providers
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    Groq = None

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    openai = None

# Imports relativos - solo cuando se ejecuta como parte de un paquete
if __name__ != "__main__":
    from ..utils.base_datos import get_db_connection
    from .chatbot_prompts import ChatbotPrompts
    from .niveles import SistemaNiveles

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatbotServicio:
    """
    Servicio principal del chatbot con funcionalidades avanzadas:
    - Groq + OpenAI fallback con retry automático
    - Prompts multinivel (básico/intermedio/expert)
    - Logs conversacionales
    - Copiloto adaptativo
    - Sistema de caché inteligente
    - Memoria conversacional mejorada
    - Validación y sanitización de mensajes
    - Analytics y métricas
    """

    def __init__(self):
        self.groq_client = None
        self.openai_client = None
        self.response_cache = {}  # Cache de respuestas con TTL
        self.cache_ttl = timedelta(hours=1)  # Tiempo de vida del caché
        self._initialize_clients()

    def _initialize_clients(self):
        """Inicializar clientes de IA con fallback"""
        # Initialize Groq
        if GROQ_AVAILABLE:
            groq_key = os.getenv("GROQ_API_KEY", "")
            if groq_key:
                try:
                    self.groq_client = Groq(api_key=groq_key)
                    logger.info("✅ Groq client inicializado")
                except Exception as e:
                    logger.error(f"❌ Error inicializando Groq: {e}")
                    self.groq_client = None

        # Initialize OpenAI
        if OPENAI_AVAILABLE:
            openai_key = os.getenv("OPENAI_API_KEY", "")
            if openai_key:
                try:
                    self.openai_client = openai.OpenAI(api_key=openai_key)
                    logger.info("✅ OpenAI client inicializado")
                except Exception as e:
                    logger.error(f"❌ Error inicializando OpenAI: {e}")
                    self.openai_client = None

        if not self.groq_client and not self.openai_client:
            logger.warning("⚠️ Ningún cliente de IA disponible - usando modo fallback")
    
    def validar_mensaje(self, mensaje: str) -> Dict[str, Any]:
        """
        Valida y sanitiza el mensaje del usuario
        """
        if not mensaje or len(mensaje.strip()) == 0:
            return {"valid": False, "error": "El mensaje no puede estar vacío"}
        
        if len(mensaje) > 2000:
            return {"valid": False, "error": "El mensaje es demasiado largo (máximo 2000 caracteres)"}
        
        # Detectar contenido inapropiado básico
        palabras_prohibidas = ['spam', 'hack', 'exploit', 'virus', 'malware']
        mensaje_lower = mensaje.lower()
        if any(palabra in mensaje_lower for palabra in palabras_prohibidas):
            return {"valid": False, "error": "El mensaje contiene contenido no permitido"}
        
        # Sanitizar HTML
        mensaje_sanitizado = html.escape(mensaje)
        
        return {
            "valid": True,
            "sanitized": mensaje_sanitizado,
            "original_length": len(mensaje)
        }
    
    def _get_cache_key(self, mensaje: str, nivel: str, analysis_context: Dict = None) -> str:
        """Genera clave única para caché"""
        context_str = json.dumps(analysis_context, sort_keys=True) if analysis_context else ""
        key_string = f"{mensaje}_{nivel}_{context_str}"
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def _get_cached_response(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Obtiene respuesta del caché si existe y no ha expirado"""
        if cache_key in self.response_cache:
            cached_data = self.response_cache[cache_key]
            cache_time = datetime.fromisoformat(cached_data.get('cache_timestamp', ''))
            
            if datetime.now() - cache_time < self.cache_ttl:
                logger.info("✅ Respuesta obtenida de caché")
                return cached_data
            else:
                # Eliminar caché expirado
                del self.response_cache[cache_key]
        
        return None
    
    def _save_to_cache(self, cache_key: str, response_data: Dict[str, Any]):
        """Guarda respuesta en caché"""
        response_data['cache_timestamp'] = datetime.now().isoformat()
        self.response_cache[cache_key] = response_data
        
        # Limpiar caché antiguo periódicamente (mantener solo últimos 100)
        if len(self.response_cache) > 100:
            # Eliminar entradas más antiguas
            sorted_cache = sorted(
                self.response_cache.items(),
                key=lambda x: x[1].get('cache_timestamp', ''),
                reverse=True
            )
            self.response_cache = dict(sorted_cache[:100])
    
    def obtener_historial_conversacion(self, usuario_id: int, limit: int = 5) -> List[Dict]:
        """
        Obtiene historial reciente de conversación para contexto
        """
        if not usuario_id:
            return []
        
        try:
            db = get_db_connection()
            cursor = db.cur
            
            cursor.execute("""
                SELECT mensaje_usuario, respuesta_ia, fecha
                FROM Conversaciones_Chatbot
                WHERE usuario_id = ?
                ORDER BY fecha DESC
                LIMIT ?
            """, (usuario_id, limit))
            
            historial = []
            for row in cursor.fetchall():
                historial.append({
                    'usuario': row[0],
                    'bot': row[1][:300] if row[1] else '',  # Limitar longitud
                    'fecha': row[2]
                })
            
            return list(reversed(historial))  # Orden cronológico
        except Exception as e:
            logger.error(f"Error obteniendo historial: {e}")
            return []

    def determinar_nivel_usuario(self, usuario_id: Optional[int] = None,
                               historial_conversaciones: List[Dict] = None) -> str:
        """
        Determina el nivel de expertise del usuario basado en su historial
        Utiliza el sistema de niveles centralizado
        """
        return SistemaNiveles.determinar_nivel_usuario(usuario_id, historial_conversaciones)

    def obtener_prompt_por_nivel(self, nivel: str, contexto: Dict = None, analysis_context: Dict = None) -> str:
        """
        Retorna el prompt apropiado según el nivel del usuario usando el sistema de prompts mejorado
        """
        # Obtener prompt base del sistema mejorado
        prompt = ChatbotPrompts.BASE_PROMPTS.get(nivel, ChatbotPrompts.BASE_PROMPTS["basico"])

        # Agregar contexto de análisis específico usando el sistema mejorado
        if analysis_context and isinstance(analysis_context, dict):
            tipo_analisis = analysis_context.get('tipo_analisis')
            resultados = analysis_context.get('resultados', {})
            
            # Usar el sistema de prompts contextual mejorado
            if tipo_analisis and resultados:
                contextual_prompt = ChatbotPrompts.get_contextual_prompt(tipo_analisis, resultados)
                if contextual_prompt:
                    prompt += "\n\n" + contextual_prompt
                
                # Agregar información adicional de resultados para contexto
                prompt += f"\n\nRESULTADOS ESPECÍFICOS DEL ANÁLISIS:"
                for key, value in resultados.items():
                    if value is not None and key not in ['escenarios_originales']:
                        if isinstance(value, (int, float)):
                            if 'porcentaje' in key.lower() or 'tir' in key.lower() or 'wacc' in key.lower() or 'rendimiento' in key.lower() or 'riesgo' in key.lower():
                                prompt += f"\n- {key}: {value}%"
                            elif 'probabilidad' in key.lower():
                                prompt += f"\n- {key}: {(value * 100):.1f}%"
                            else:
                                prompt += f"\n- {key}: S/ {value:,.2f}" if value > 1000 else f"\n- {key}: {value}"
                        elif isinstance(value, str):
                            prompt += f"\n- {key}: {value}"

        # Agregar contexto específico legacy si está disponible
        elif contexto and isinstance(contexto, dict):
            sim_type = contexto.get('type')
            if sim_type:
                prompt += f"\n\nCONTEXTO ACTUAL: El usuario está trabajando en un análisis de {sim_type}."
                if contexto.get('van'):
                    prompt += f" VAN calculado: {contexto['van']}"
                if contexto.get('tir'):
                    prompt += f" TIR calculada: {contexto['tir']}"

        return prompt

    def consultar_ia(self, mensaje: str, usuario_id: Optional[int] = None,
                    contexto: Dict = None, analysis_context: Dict = None) -> Dict[str, Any]:
        """
        Método principal para consultar IA con fallback y funcionalidades avanzadas
        """
        try:
            start_time = datetime.now()
            
            # Validar mensaje
            validacion = self.validar_mensaje(mensaje)
            if not validacion["valid"]:
                return {
                    "success": False,
                    "error": validacion["error"],
                    "respuesta": f"Lo siento, {validacion['error'].lower()}"
                }
            
            mensaje = validacion["sanitized"]
            
            # Debug: Log analysis_context
            logger.info(f"🔍 Analysis context received: {analysis_context}")

            # Determinar nivel del usuario
            nivel_usuario = self.determinar_nivel_usuario(usuario_id)

            # Verificar caché
            cache_key = self._get_cache_key(mensaje, nivel_usuario, analysis_context)
            cached_response = self._get_cached_response(cache_key)
            if cached_response:
                return cached_response

            # Obtener historial de conversación para contexto
            historial_contexto = ""
            if usuario_id:
                historial = self.obtener_historial_conversacion(usuario_id, limit=3)
                if historial:
                    historial_contexto = "\n\nCONTEXTO DE CONVERSACIÓN RECIENTE:\n"
                    for i, conv in enumerate(historial, 1):
                        historial_contexto += f"{i}. Usuario: {conv['usuario'][:150]}...\n"
                        historial_contexto += f"   Bot: {conv['bot'][:150]}...\n\n"

            # Obtener prompt apropiado con contexto de análisis
            system_prompt = self.obtener_prompt_por_nivel(nivel_usuario, contexto, analysis_context)
            
            # Agregar historial al prompt
            if historial_contexto:
                system_prompt += historial_contexto

            # Intentar primero con Groq
            respuesta = None
            proveedor_usado = None

            if self.groq_client:
                try:
                    respuesta = self._consultar_groq(mensaje, system_prompt)
                    proveedor_usado = "groq"
                    logger.info("✅ Respuesta obtenida de Groq")
                except Exception as e:
                    logger.warning(f"❌ Error con Groq, intentando OpenAI: {e}")

            # Fallback a OpenAI si Groq falla
            if not respuesta and self.openai_client:
                try:
                    respuesta = self._consultar_openai(mensaje, system_prompt)
                    proveedor_usado = "openai"
                    logger.info("✅ Respuesta obtenida de OpenAI (fallback)")
                except Exception as e:
                    logger.error(f"❌ Error con OpenAI: {e}")

            # Último fallback a respuestas predefinidas
            if not respuesta:
                respuesta = self._respuesta_fallback(mensaje, contexto, analysis_context)
                proveedor_usado = "fallback"
                logger.info("⚠️ Usando respuesta fallback")

            # Agregar funcionalidades del copiloto adaptativo
            respuesta = self._aplicar_copiloto_adaptativo(respuesta, contexto, nivel_usuario, analysis_context)

            # Aplicar respuestas específicas para consultas sobre valores calculados
            respuesta = self._aplicar_respuestas_especificas(respuesta, analysis_context, mensaje)

            # Override completo para preguntas sobre TIR cuando hay contexto de análisis
            respuesta = self._override_respuestas_tir(respuesta, analysis_context, mensaje)

            # Overrides para otros tipos de análisis
            respuesta = self._override_respuestas_van(respuesta, analysis_context, mensaje)
            respuesta = self._override_respuestas_wacc(respuesta, analysis_context, mensaje)
            respuesta = self._override_respuestas_portafolio(respuesta, analysis_context, mensaje)
            respuesta = self._override_respuestas_ml(respuesta, analysis_context, mensaje)

            # Aplicar formato automático de colores y preguntas sugeridas
            respuesta = self._aplicar_formato_automatico(respuesta, contexto, analysis_context, nivel_usuario)

            # Calcular tiempo de respuesta
            response_time = (datetime.now() - start_time).total_seconds()
            
            # Preparar respuesta
            result = {
                "success": True,
                "respuesta": respuesta,
                "proveedor": proveedor_usado,
                "nivel_usuario": nivel_usuario,
                "timestamp": datetime.now().isoformat(),
                "response_time": response_time,
                "cached": False
            }
            
            # Guardar en caché
            self._save_to_cache(cache_key, result.copy())

            # Log de la conversación (asíncrono para no bloquear)
            try:
                self._log_conversacion(usuario_id, mensaje, respuesta, proveedor_usado, contexto, nivel_usuario, analysis_context)
            except Exception as e:
                logger.error(f"Error logging conversación (no crítico): {e}")

            return result

        except Exception as e:
            logger.error(f"❌ Error en consultar_ia: {e}")
            return {
                "success": False,
                "error": str(e),
                "respuesta": "Lo siento, hubo un error al procesar tu consulta. Por favor, inténtalo de nuevo."
            }

    def _consultar_groq(self, mensaje: str, system_prompt: str, max_retries: int = 3) -> str:
        """Consulta a Groq API con retry automático"""
        for attempt in range(max_retries):
            try:
                response = self.groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": mensaje}
                    ],
                    max_tokens=2000,
                    temperature=0.7,
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"Intento {attempt + 1} fallido con Groq, reintentando...: {e}")
                    import time
                    time.sleep(1 * (attempt + 1))  # Backoff exponencial
                else:
                    raise e

    def _consultar_openai(self, mensaje: str, system_prompt: str, max_retries: int = 3) -> str:
        """Consulta a OpenAI API con retry automático"""
        for attempt in range(max_retries):
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": mensaje}
                    ],
                    max_tokens=2000,
                    temperature=0.7,
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"Intento {attempt + 1} fallido con OpenAI, reintentando...: {e}")
                    import time
                    time.sleep(1 * (attempt + 1))  # Backoff exponencial
                else:
                    raise e

    def _respuesta_fallback(self, mensaje: str, contexto: Dict = None, analysis_context: Dict = None) -> str:
        """Respuestas predefinidas cuando IA no está disponible"""
        mensaje_lower = mensaje.lower()

        # Respuestas básicas
        if "van" in mensaje_lower and ("que es" in mensaje_lower or "qué es" in mensaje_lower):
            return "**¿Qué es el VAN?**\n\nEl VAN (Valor Actual Neto) mide la rentabilidad real de una inversión, considerando el tiempo y el riesgo del dinero.\n\n**Fórmula básica:** VAN = Flujos de caja descontados - Inversión inicial\n\n**Interpretación:**\n• VAN > 0: Inversión rentable\n• VAN < 0: Inversión no rentable\n• VAN = 0: Punto de equilibrio"

        if "tir" in mensaje_lower and ("que es" in mensaje_lower or "qué es" in mensaje_lower):
            return "**¿Qué es la TIR?**\n\nLa TIR (Tasa Interna de Retorno) es el porcentaje de ganancia real que genera tu inversión.\n\n**Interpretación:**\n• Compara la TIR con tu costo de capital\n• TIR > Costo de capital = Buena inversión\n• TIR < Costo de capital = Mala inversión"

        # Respuesta genérica
        return "**¡Hola! Soy Econova AI**\n\nTu asesor financiero inteligente. Actualmente estoy en modo básico porque los servicios de IA no están disponibles.\n\nPuedo ayudarte con conceptos básicos de finanzas. ¿Qué te gustaría saber sobre VAN, TIR o WACC?"

    def _aplicar_copiloto_adaptativo(self, respuesta: str, contexto: Dict, nivel: str, analysis_context: Dict = None) -> str:
        """
        Aplica funcionalidades del copiloto adaptativo:
        - Guía onboarding
        - Interpreta resultados
        - Sugiere acciones
        """
        if not contexto or not isinstance(contexto, dict):
            return respuesta

        sim_type = contexto.get('type')

        # Copiloto para onboarding
        if sim_type and "nuevo" in contexto.get('estado', '').lower():
            respuesta += "\n\n**🚀 Guía de Inicio Rápido:**\n"
            respuesta += "• Completa tu primera simulación financiera\n"
            respuesta += "• Explora los diferentes tipos de análisis\n"
            respuesta += "• Configura tu perfil de inversionista\n"
            respuesta += "• Únete a grupos de benchmarking"

        # Copiloto para interpretación de resultados
        elif sim_type == 'VAN' and contexto.get('van'):
            van_valor = contexto.get('van', '0')
            try:
                van_num = float(van_valor.replace('S/', '').replace(',', '').strip())
                if van_num > 0:
                    respuesta += "\n\n**💡 Recomendaciones para tu VAN positivo:**\n"
                    respuesta += "• Considera escalar la inversión si es posible\n"
                    respuesta += "• Evalúa riesgos que puedan afectar este resultado\n"
                    respuesta += "• Compara con alternativas de inversión"
                elif van_num < 0:
                    respuesta += "\n\n**⚠️ Tu VAN es negativo. Considera:**\n"
                    respuesta += "• Revisar los flujos de caja proyectados\n"
                    respuesta += "• Reducir la inversión inicial\n"
                    respuesta += "• Buscar financiamiento más eficiente"
            except:
                pass

        # Copiloto para sugerencias de acciones
        respuesta += "\n\n**🎯 Próximos pasos sugeridos:**\n"
        if nivel == "basico":
            respuesta += "• Realiza tu primera simulación financiera\n"
            respuesta += "• Aprende sobre VAN, TIR y WACC\n"
            respuesta += "• Explora casos de estudio sencillos"
        elif nivel == "intermedio":
            respuesta += "• Profundiza en análisis de sensibilidad\n"
            respuesta += "• Compara diferentes escenarios\n"
            respuesta += "• Evalúa riesgos de tu proyecto"
        else:  # experto
            respuesta += "• Realiza análisis avanzados con Monte Carlo\n"
            respuesta += "• Optimiza tu estructura de capital\n"
            respuesta += "• Evalúa opciones reales de inversión"

        return respuesta

    def _aplicar_respuestas_especificas(self, respuesta: str, analysis_context: Dict, mensaje_usuario: str) -> str:
        """
        Aplica respuestas específicas para consultas sobre valores calculados,
        reemplazando explicaciones genéricas con referencias específicas.
        """
        if not analysis_context or not isinstance(analysis_context, dict):
            return respuesta

        tipo_analisis = analysis_context.get('tipo_analisis')
        resultados = analysis_context.get('resultados', {})

        if tipo_analisis == 'tir' and resultados.get('tir'):
            tir_valor = resultados['tir']

            # Check if user is asking about TIR interpretation AND we have TIR analysis context
            user_asking_about_tir = any(word in mensaje_usuario.lower() for word in [
                'tir', 'tasa interna', 'interpretar', 'cómo interpretar', 'qué significa'
            ])

            # For TIR analysis context, ALWAYS replace generic TIR explanations with specific ones
            # Check if response contains any generic TIR explanation patterns
            generic_patterns = [
                'tasa interna de retorno',
                'tir es un concepto',
                'la tir es',
                'qué es la tir',
                'tir significa',
                'tir, o tasa interna'
            ]

            is_generic_tir_response = any(pattern in respuesta.lower() for pattern in generic_patterns)

            if is_generic_tir_response or user_asking_about_tir:
                logger.info(f"🔄 Replacing generic TIR response with specific one for TIR={tir_valor}%")

                # Crear respuesta específica basada en el valor calculado
                respuesta_especifica = f"**Interpretación de tu TIR del {tir_valor}%**\n\n"
                respuesta_especifica += f"Tu TIR calculada del [blue]{tir_valor}%[/blue] significa que tu inversión genera un retorno real del {tir_valor}% anual, después de considerar todos los flujos de caja y el tiempo.\n\n"

                # Evaluar si es buena o no
                if tir_valor >= 20:
                    respuesta_especifica += f"Una TIR del [green]{tir_valor}%[/green] se considera [green]excelente[/green] y supera ampliamente el costo de capital típico en Perú (alrededor del 12-15%).\n\n"
                elif tir_valor >= 15:
                    respuesta_especifica += f"Una TIR del [green]{tir_valor}%[/green] se considera [green]muy buena[/green] y está por encima del costo de capital promedio.\n\n"
                elif tir_valor >= 12:
                    respuesta_especifica += f"Una TIR del [blue]{tir_valor}%[/blue] se considera [blue]aceptable[/blue], comparable con el costo de capital en Perú.\n\n"
                elif tir_valor >= 8:
                    respuesta_especifica += f"Una TIR del [orange]{tir_valor}%[/orange] se considera [orange]baja[/orange] y está por debajo del costo de capital típico.\n\n"
                else:
                    respuesta_especifica += f"Una TIR del [red]{tir_valor}%[/red] se considera [red]muy baja[/red] y sugiere que el proyecto podría no ser rentable.\n\n"

                respuesta_especifica += "**¿Qué significa esto para tu proyecto?**\n\n"
                respuesta_especifica += f"• Si tu costo de capital es menor al {tir_valor}%, la inversión es rentable\n"
                respuesta_especifica += f"• El {tir_valor}% representa el rendimiento real de tu proyecto\n"
                respuesta_especifica += f"• Compara este {tir_valor}% con otras oportunidades de inversión"

                # Reemplazar la respuesta genérica con la específica
                return respuesta_especifica

        return respuesta

    def _override_respuestas_tir(self, respuesta: str, analysis_context: Dict, mensaje_usuario: str) -> str:
        """
        Override selectivo para preguntas sobre TIR - solo cuando la respuesta del AI es claramente genérica
        y necesitamos proporcionar contexto específico del cálculo realizado.
        """
        logger.info(f"🔍 SELECTIVE OVERRIDE CHECK: analysis_context exists, mensaje_usuario='{mensaje_usuario}'")

        if not analysis_context or not isinstance(analysis_context, dict):
            return respuesta

        tipo_analisis = analysis_context.get('tipo_analisis')
        resultados = analysis_context.get('resultados', {})

        if tipo_analisis == 'tir' and resultados.get('tir'):
            tir_valor = resultados['tir']

            # Solo override si la respuesta del AI es MUY corta (menos de 50 caracteres)
            # Esto indica que el AI dio una respuesta demasiado breve y necesitamos contextualizar
            is_too_short_response = len(respuesta.strip()) < 50

            # Y el usuario está preguntando específicamente sobre interpretación del resultado
            user_asking_interpretation = any(word in mensaje_usuario.lower() for word in [
                'qué significa', 'que significa', 'interpretar', 'como interpretar',
                'esta tir', 'la tir', 'mi tir', 'tir calculada', 'significa'
            ])

            if is_too_short_response and user_asking_interpretation:
                logger.info(f"🎯 SELECTIVE OVERRIDE: AI response too short ({len(respuesta)} chars), providing contextual interpretation for TIR={tir_valor}%")

                # Respuesta contextual completa en texto plano con marcadores simples
                respuesta_contextual = f"""**Interpretación de tu TIR del [blue]{tir_valor}%[/blue]**

Basándome en tu cálculo de **[blue]TIR[/blue]** del **[blue]{tir_valor}%[/blue]**, te explico qué significa este resultado.

Este **[blue]{tir_valor}%[/blue]** representa el rendimiento real anual que genera tu inversión, considerando todos los flujos de caja que proyectaste y el tiempo en que ocurren."""

                # Evaluación contextual detallada
                if tir_valor >= 20:
                    respuesta_contextual += f"""

Una **[blue]TIR[/blue]** del **[green]{tir_valor}%[/green]** se considera **[green]excelente[/green]** y supera ampliamente el costo de capital promedio en Perú (alrededor del 12-15%). Tu proyecto tiene un rendimiento excepcional."""
                elif tir_valor >= 15:
                    respuesta_contextual += f"""

Una **[blue]TIR[/blue]** del **[green]{tir_valor}%[/green]** se considera **[green]muy buena[/green]** y está por encima del costo de capital promedio. Es un resultado sólido."""
                elif tir_valor >= 12:
                    respuesta_contextual += f"""

Una **[blue]TIR[/blue]** del **[blue]{tir_valor}%[/blue]** se considera **[blue]aceptable[/blue]**, comparable con el costo de capital en Perú. Es un resultado razonable."""
                elif tir_valor >= 8:
                    respuesta_contextual += f"""

Una **[blue]TIR[/blue]** del **[orange]{tir_valor}%[/orange]** se considera **[orange]baja[/orange]** y está por debajo del costo de capital típico. Merece evaluación adicional."""
                else:
                    respuesta_contextual += f"""

Una **[blue]TIR[/blue]** del **[red]{tir_valor}%[/red]** se considera **[red]muy baja[/red]** y sugiere que el proyecto podría no ser rentable con los parámetros actuales."""

                respuesta_contextual += f"""

**💡 ¿Qué significa esto para tu proyecto?**
• Si tu costo de capital es menor al **[blue]{tir_valor}%[/blue]**, la inversión es **[green]rentable[/green]**
• El **[blue]{tir_valor}%[/blue]** representa el rendimiento real de tu proyecto
• Compara este **[blue]{tir_valor}%[/blue]** con otras oportunidades de inversión

¿Te gustaría que te ayude a identificar oportunidades para mejorar este resultado, o tienes alguna duda específica sobre cómo interpretar este **[blue]{tir_valor}%[/blue]** en el contexto de tu proyecto?

[¿Cómo mejorar esta TIR?|¿Es rentable mi proyecto?|¿Qué factores afectan la TIR?]"""

                return respuesta_contextual
            else:
                logger.info(f"✅ AI response is adequate ({len(respuesta)} chars) or user not asking for interpretation - no override needed")

        return respuesta

    def _override_respuestas_van(self, respuesta: str, analysis_context: Dict, mensaje_usuario: str) -> str:
        """
        Override selectivo para preguntas sobre VAN
        """
        if not analysis_context or not isinstance(analysis_context, dict):
            return respuesta

        tipo_analisis = analysis_context.get('tipo_analisis')
        resultados = analysis_context.get('resultados', {})

        if tipo_analisis == 'van' and resultados.get('van') is not None:
            van_valor = resultados['van']

            is_too_short_response = len(respuesta.strip()) < 50
            user_asking_about_van = any(word in mensaje_usuario.lower() for word in [
                'van', 'valor actual', 'qué significa', 'que significa', 'interpretar', 'como interpretar'
            ])

            if is_too_short_response and user_asking_about_van:
                logger.info(f"🎯 OVERRIDE VAN: Providing contextual interpretation for VAN={van_valor}")

                respuesta_contextual = f"""**Interpretación de tu VAN de S/ {van_valor:,.2f}**

Basándome en tu cálculo de **[blue]VAN[/blue]** de **S/ {van_valor:,.2f}**, te explico qué significa este resultado.

Este **[blue]VAN[/blue]** representa el beneficio neto actualizado de tu proyecto, considerando todos los flujos de caja descontados a valor presente."""

                if van_valor > 0:
                    respuesta_contextual += f"""

Un **[blue]VAN[/blue]** **[green]positivo[/green]** de **S/ {van_valor:,.2f}** indica que tu proyecto es **[green]rentable[/green]** y generará un beneficio neto superior a la inversión inicial."""
                elif van_valor < 0:
                    respuesta_contextual += f"""

Un **[blue]VAN[/blue]** **[red]negativo[/red]** de **S/ {van_valor:,.2f}** indica que tu proyecto **[red]no es rentable[/red]** y destruirá valor."""
                else:
                    respuesta_contextual += f"""

Un **[blue]VAN[/blue]** de **S/ {van_valor:,.2f}** indica el **[orange]punto de equilibrio[/orange]** donde el proyecto ni gana ni pierde valor."""

                respuesta_contextual += f"""

**💡 ¿Qué significa esto para tu proyecto?**
• **[blue]VAN > 0[/blue]**: Proyecto **[green]viable financieramente[/green]**
• **[blue]VAN < 0[/blue]**: Proyecto **[red]no viable[/red]**, requiere revisión
• **[blue]VAN = 0[/blue]**: Punto de equilibrio, decisión depende de otros factores

¿Te gustaría explorar escenarios alternativos para mejorar este VAN, o tienes alguna duda específica sobre su interpretación?

[¿Cómo mejorar el VAN?|¿Qué factores afectan el VAN?|¿Es rentable mi proyecto?]"""

                return respuesta_contextual

        return respuesta

    def _override_respuestas_wacc(self, respuesta: str, analysis_context: Dict, mensaje_usuario: str) -> str:
        """
        Override selectivo para preguntas sobre WACC
        """
        if not analysis_context or not isinstance(analysis_context, dict):
            return respuesta

        tipo_analisis = analysis_context.get('tipo_analisis')
        resultados = analysis_context.get('resultados', {})

        if tipo_analisis == 'wacc' and resultados.get('wacc') is not None:
            wacc_valor = resultados['wacc']

            is_too_short_response = len(respuesta.strip()) < 50
            user_asking_about_wacc = any(word in mensaje_usuario.lower() for word in [
                'wacc', 'costo capital', 'qué significa', 'que significa', 'interpretar', 'como interpretar'
            ])

            if is_too_short_response and user_asking_about_wacc:
                logger.info(f"🎯 OVERRIDE WACC: Providing contextual interpretation for WACC={wacc_valor}%")

                respuesta_contextual = f"""**Interpretación de tu WACC del [red]{wacc_valor}%[/red]**

Tu **[red]WACC[/red]** calculado es del **[red]{wacc_valor}%[/red]**, que representa el costo promedio ponderado de tu capital.

Este **[red]WACC[/red]** es la tasa mínima de retorno que deben generar tus proyectos para crear valor para los inversionistas."""

                if wacc_valor < 12:
                    respuesta_contextual += f"""

Un **[red]WACC[/red]** del **[green]{wacc_valor}%[/green]** se considera **[green]relativamente bajo[/green]**, lo que facilita la rentabilidad de proyectos."""
                elif wacc_valor < 15:
                    respuesta_contextual += f"""

Un **[red]WACC[/red]** del **[blue]{wacc_valor}%[/blue]** está en el **[blue]rango promedio[/blue]** del mercado peruano."""
                else:
                    respuesta_contextual += f"""

Un **[red]WACC[/red]** del **[orange]{wacc_valor}%[/orange]** se considera **[orange]elevado[/orange]**, lo que hace más difícil la rentabilidad de proyectos."""

                respuesta_contextual += f"""

**💡 ¿Qué significa esto para tu empresa?**
• Proyectos con **[blue]TIR > {wacc_valor}%[/blue]** son candidatos viables
• El **[red]WACC[/red]** es tu "tasa de descuento" para calcular VAN
• Un **[red]WACC[/red]** más bajo mejora las oportunidades de inversión

¿Te gustaría explorar estrategias para reducir tu WACC o analizar cómo usarlo en evaluaciones de proyectos?

[¿Cómo reducir el WACC?|¿Cómo usar este WACC?|¿Es alto o bajo este costo de capital?]"""

                return respuesta_contextual

        return respuesta

    def _override_respuestas_portafolio(self, respuesta: str, analysis_context: Dict, mensaje_usuario: str) -> str:
        """
        Override selectivo para preguntas sobre portafolio
        """
        if not analysis_context or not isinstance(analysis_context, dict):
            return respuesta

        tipo_analisis = analysis_context.get('tipo_analisis')
        resultados = analysis_context.get('resultados', {})

        if tipo_analisis == 'portafolio' and resultados.get('retorno') is not None:
            retorno = resultados.get('retorno', 0)
            riesgo = resultados.get('riesgo', 0)
            sharpe = resultados.get('sharpe', 0)

            is_too_short_response = len(respuesta.strip()) < 50
            user_asking_about_portafolio = any(word in mensaje_usuario.lower() for word in [
                'portafolio', 'riesgo', 'retorno', 'sharpe', 'qué significa', 'que significa', 'interpretar'
            ])

            if is_too_short_response and user_asking_about_portafolio:
                logger.info(f"🎯 OVERRIDE PORTAFOLIO: Providing contextual interpretation for Portfolio")

                respuesta_contextual = f"""**Interpretación de tu Portafolio Optimizado**

Tu portafolio tiene un retorno esperado del **[green]{retorno}%[/green]** con un riesgo del **[orange]{riesgo}%[/orange]** (desviación estándar).

El **[blue]Ratio Sharpe[/blue]** calculado es **[blue]{sharpe:.2f}[/blue]**, que mide la eficiencia riesgo-retorno de tu inversión."""

                if sharpe > 1:
                    respuesta_contextual += f"""

Tu portafolio tiene una **[green]excelente eficiencia[/green]** con un Ratio Sharpe superior a 1."""
                elif sharpe > 0.5:
                    respuesta_contextual += f"""

Tu portafolio tiene una **[blue]buena eficiencia[/blue]** riesgo-retorno."""
                else:
                    respuesta_contextual += f"""

Tu portafolio requiere **[orange]optimización[/orange]** para mejorar la relación riesgo-retorno."""

                respuesta_contextual += f"""

**💡 Análisis de tu portafolio:**
• **[green]Retorno esperado[/green]**: {retorno}% anual
• **[orange]Riesgo (volatilidad)[/orange]**: {riesgo}% anual  
• **[blue]Ratio Sharpe[/blue]**: {sharpe:.2f} (eficiencia)

¿Te gustaría explorar estrategias de diversificación adicionales o analizar escenarios de mercado alternativos?

[¿Cómo diversificar mejor?|¿Qué recomendaciones tienes?|¿Cuál es el riesgo óptimo?]"""

                return respuesta_contextual

        return respuesta

    def _override_respuestas_ml(self, respuesta: str, analysis_context: Dict, mensaje_usuario: str) -> str:
        """
        Override selectivo para preguntas sobre análisis ML
        """
        if not analysis_context or not isinstance(analysis_context, dict):
            return respuesta

        tipo_analisis = analysis_context.get('tipo_analisis')
        resultados = analysis_context.get('resultados', {})

        if tipo_analisis in ['prediccion', 'montecarlo', 'tornado', 'sensibilidad']:
            is_too_short_response = len(respuesta.strip()) < 50
            user_asking_about_ml = any(word in mensaje_usuario.lower() for word in [
                'predicciones', 'montecarlo', 'tornado', 'sensibilidad', 'análisis', 'resultados',
                'qué significa', 'que significa', 'interpretar', 'como interpretar'
            ])

            if is_too_short_response and user_asking_about_ml:
                logger.info(f"🎯 OVERRIDE ML: Providing contextual interpretation for {tipo_analisis}")

                if tipo_analisis == 'prediccion':
                    precision = resultados.get('precision', 0)
                    tendencia = resultados.get('tendencia_principal', 'tendencias mixtas')

                    respuesta_contextual = f"""**Interpretación de tus Predicciones ML**

El modelo de Machine Learning generó predicciones con una **[blue]precisión del {precision}%[/blue]**.

Las tendencias identificadas muestran **{tendencia}** para los próximos períodos."""

                    if precision > 85:
                        respuesta_contextual += f"""

La **[green]alta precisión[/green]** del modelo hace que estas predicciones sean **[green]muy confiables[/green]** para la toma de decisiones."""
                    elif precision > 70:
                        respuesta_contextual += f"""

La **[blue]buena precisión[/blue]** del modelo proporciona información **[blue]útil[/blue]** como referencia."""
                    else:
                        respuesta_contextual += f"""

La precisión limitada sugiere usar estas predicciones con **[orange]precaución[/orange]** y combinarlas con otros análisis."""

                    respuesta_contextual += f"""

¿Te gustaría explorar estrategias basadas en estas predicciones o profundizar en algún aspecto específico del análisis?

[¿Cómo usar estas predicciones?|¿Qué riesgos debo considerar?|¿Qué estrategias recomiendas?]"""

                elif tipo_analisis == 'montecarlo':
                    van_promedio = resultados.get('van_promedio', 0)
                    probabilidad_positivo = resultados.get('probabilidad_positivo', 0)

                    respuesta_contextual = f"""**Interpretación de tu Simulación Monte Carlo**

La simulación generó un **[blue]VAN promedio[/blue]** de **S/ {van_promedio:,.2f}** con una **[blue]probabilidad de VAN positivo[/blue]** del **[green]{probabilidad_positivo}%[/green]**."""

                    if probabilidad_positivo > 80:
                        respuesta_contextual += f"""

La **[green]alta probabilidad de éxito[/green]** indica un proyecto **[green]muy robusto[/green]** ante la incertidumbre."""
                    elif probabilidad_positivo > 60:
                        respuesta_contextual += f"""

La **[blue]probabilidad aceptable[/blue]** sugiere que el proyecto es **[blue]viable[/blue]** pero requiere gestión de riesgos."""
                    else:
                        respuesta_contextual += f"""

La **[red]baja probabilidad[/red]** indica necesidad de **[orange]revisar los parámetros[/orange]** del proyecto."""

                    respuesta_contextual += f"""

¿Te gustaría analizar escenarios específicos o explorar estrategias de mitigación de riesgos?

[¿Cómo interpretar estos resultados?|¿Qué riesgos debo considerar?|¿Qué estrategias recomiendas?]"""

                elif tipo_analisis == 'tornado':
                    variable_mas_sensible = resultados.get('variable_mas_sensible', 'N/A')
                    impacto_maximo = resultados.get('impacto_maximo', 0)

                    respuesta_contextual = f"""**Interpretación de tu Análisis Tornado**

La variable más sensible identificada es **"{variable_mas_sensible}"** con un **[red]impacto máximo[/red]** del **[red]{impacto_maximo}%[/red]** en el VAN."""

                    if impacto_maximo > 50:
                        respuesta_contextual += f"""

Este **[red]alto impacto[/red]** indica que **"{variable_mas_sensible}"** puede hacer **[red]inviable[/red]** el proyecto si cambia desfavorablemente."""
                    elif impacto_maximo > 25:
                        respuesta_contextual += f"""

El **[orange]impacto moderado[/orange]** sugiere monitorear de cerca **"{variable_mas_sensible}"**."""
                    else:
                        respuesta_contextual += f"""

El **[green]impacto limitado[/green]** de **"{variable_mas_sensible}"** indica **[green]baja sensibilidad[/green]** del proyecto."""

                    respuesta_contextual += f"""

¿Te gustaría explorar estrategias de mitigación para las variables críticas identificadas?

[¿Cómo reducir la sensibilidad?|¿Qué planes de contingencia recomiendas?|¿Cómo monitorear estas variables?]"""

                elif tipo_analisis == 'sensibilidad':
                    punto_equilibrio = resultados.get('punto_equilibrio', 0)
                    elasticidad_critica = resultados.get('elasticidad_critica', 0)

                    respuesta_contextual = f"""**Interpretación de tu Análisis de Sensibilidad**

El **[blue]punto de equilibrio[/blue]** identificado es de **[blue]{punto_equilibrio} unidades[/blue]**, y la **[red]elasticidad crítica[/red]** es **[red]{elasticidad_critica:.2f}[/red]**."""

                    if abs(elasticidad_critica) > 2:
                        respuesta_contextual += f"""

La **[red]alta elasticidad[/red]** indica que pequeños cambios tienen **[red]gran impacto[/red]** en los resultados."""
                    elif abs(elasticidad_critica) > 1:
                        respuesta_contextual += f"""

La **[orange]elasticidad moderada[/orange]** sugiere **[orange]sensibilidad media[/orange]** a cambios."""
                    else:
                        respuesta_contextual += f"""

La **[green]baja elasticidad[/green]** indica **[green]estabilidad[/green]** ante variaciones."""

                    respuesta_contextual += f"""

¿Te gustaría explorar escenarios "qué pasaría si" basados en este análisis?

[¿Cómo optimizar el punto de equilibrio?|¿Qué estrategias de mitigación?|¿Cómo mejorar la estabilidad?]"""

                return respuesta_contextual

        return respuesta

    def _aplicar_formato_automatico(self, respuesta: str, contexto: Dict, analysis_context: Dict, nivel: str) -> str:
        """
        Aplica formato automático de colores y preguntas sugeridas a las respuestas de IA
        """
        try:
            # Aplicar colores automáticos a palabras clave
            respuesta = self._aplicar_colores_automaticos(respuesta, contexto, analysis_context)

            # Agregar preguntas sugeridas automáticas
            respuesta = self._agregar_preguntas_sugeridas(respuesta, contexto, analysis_context, nivel)

            return respuesta
        except Exception as e:
            logger.error(f"Error aplicando formato automático: {e}")
            return respuesta

    def _aplicar_colores_automaticos(self, respuesta: str, contexto: Dict, analysis_context: Dict) -> str:
        """
        Aplica colores automáticos a palabras clave importantes en la respuesta
        """
        import re

        # Colores para resultados positivos
        respuesta = re.sub(r'\bpositivo\b', '<strong style="color: #059669;">positivo</strong>', respuesta, flags=re.IGNORECASE)
        respuesta = re.sub(r'\brentable\b', '<strong style="color: #059669;">rentable</strong>', respuesta, flags=re.IGNORECASE)
        respuesta = re.sub(r'\bbeneficio\b', '<strong style="color: #059669;">beneficio</strong>', respuesta, flags=re.IGNORECASE)
        respuesta = re.sub(r'\bganancia\b', '<strong style="color: #059669;">ganancia</strong>', respuesta, flags=re.IGNORECASE)

        # Colores para resultados negativos
        respuesta = re.sub(r'\bnegativo\b', '<strong style="color: #dc2626;">negativo</strong>', respuesta, flags=re.IGNORECASE)
        respuesta = re.sub(r'\bpérdida\b', '<strong style="color: #dc2626;">pérdida</strong>', respuesta, flags=re.IGNORECASE)
        respuesta = re.sub(r'\briesgo\b', '<strong style="color: #dc2626;">riesgo</strong>', respuesta, flags=re.IGNORECASE)
        respuesta = re.sub(r'\bpeligro\b', '<strong style="color: #dc2626;">peligro</strong>', respuesta, flags=re.IGNORECASE)

        # Colores para conceptos importantes
        respuesta = re.sub(r'\bVAN\b', '<strong style="color: #2563eb;">VAN</strong>', respuesta)
        respuesta = re.sub(r'\bTIR\b', '<strong style="color: #7c3aed;">TIR</strong>', respuesta)
        respuesta = re.sub(r'\bWACC\b', '<strong style="color: #dc2626;">WACC</strong>', respuesta)

        # Colores para advertencias
        respuesta = re.sub(r'\badvertencia\b', '<strong style="color: #ea580c;">advertencia</strong>', respuesta, flags=re.IGNORECASE)
        respuesta = re.sub(r'\bconsidera\b', '<strong style="color: #ea580c;">considera</strong>', respuesta, flags=re.IGNORECASE)
        respuesta = re.sub(r'\brecomienda\b', '<strong style="color: #ea580c;">recomienda</strong>', respuesta, flags=re.IGNORECASE)

        # Colores para valores monetarios
        respuesta = re.sub(r'(S/\s*\d{1,3}(?:\.\d{3})*(?:,\d{2})?)', r'<strong style="color: #059669;">\1</strong>', respuesta)

        return respuesta

    def _agregar_preguntas_sugeridas(self, respuesta: str, contexto: Dict, analysis_context: Dict, nivel: str) -> str:
        """
        Agrega preguntas sugeridas automáticas basadas en el contexto
        """
        preguntas_sugeridas = []

        # Determinar tipo de análisis o contexto
        tipo_analisis = None
        if analysis_context and isinstance(analysis_context, dict):
            tipo_analisis = analysis_context.get('tipo_analisis')
        elif contexto and isinstance(contexto, dict):
            tipo_analisis = contexto.get('type')

        # Preguntas basadas en el tipo de análisis
        if tipo_analisis == 'van':
            preguntas_sugeridas = [
                "¿Cómo mejorar el VAN de mi proyecto?",
                "¿Qué factores afectan más el VAN?",
                "¿Es rentable mi inversión?"
            ]
        elif tipo_analisis == 'tir':
            preguntas_sugeridas = [
                "¿Qué significa esta TIR?",
                "¿Cómo comparar con otras inversiones?",
                "¿Es buena esta tasa de retorno?"
            ]
        elif tipo_analisis == 'wacc':
            preguntas_sugeridas = [
                "¿Cómo usar este WACC en mis cálculos?",
                "¿Es alto o bajo este costo de capital?",
                "¿Cómo reducir mi WACC?"
            ]
        elif tipo_analisis == 'portafolio':
            preguntas_sugeridas = [
                "¿Cómo diversificar mejor mi portafolio?",
                "¿Cuál es el riesgo de mis inversiones?",
                "¿Qué recomendaciones tienes para optimizar?"
            ]
        elif tipo_analisis in ['prediccion', 'montecarlo', 'tornado', 'escenarios']:
            preguntas_sugeridas = [
                "¿Cómo interpretar estos resultados?",
                "¿Qué riesgos debo considerar?",
                "¿Qué estrategias recomiendas?"
            ]
        else:
            # Solo usar detección basada en contenido si no hay tipo_analisis específico
            # Priorizar el tipo de análisis sobre el contenido de la respuesta
            if 'van' in respuesta.lower() and not tipo_analisis:
                preguntas_sugeridas = [
                    "¿Qué es el VAN?",
                    "¿Cómo calcular el VAN?",
                    "¿Cómo interpretar el VAN?"
                ]
            elif 'tir' in respuesta.lower() and not tipo_analisis:
                preguntas_sugeridas = [
                    "¿Qué es la TIR?",
                    "¿Cómo calcular la TIR?",
                    "¿Cómo usar la TIR?"
                ]
            elif 'wacc' in respuesta.lower() and not tipo_analisis:
                preguntas_sugeridas = [
                    "¿Qué es el WACC?",
                    "¿Cómo calcular el WACC?",
                    "¿Para qué usar el WACC?"
                ]
            else:
                preguntas_sugeridas = [
                    "¿Puedes explicarme mejor?",
                    "¿Tienes un ejemplo práctico?",
                    "¿Cuáles son las limitaciones?"
                ]

        # Agregar preguntas sugeridas al final de la respuesta
        if preguntas_sugeridas:
            respuesta += f"\n\n[{'|'.join(preguntas_sugeridas)}]"

        return respuesta

    def _log_conversacion(self, usuario_id: Optional[int], mensaje_usuario: str,
                         respuesta_ia: str, proveedor: str, contexto: Dict, nivel: str, analysis_context: Dict = None):
        """
        Registra la conversación en la base de datos
        """
        try:
            db = get_db_connection()
            cursor = db.cur

            # Crear tabla si no existe
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Conversaciones_Chatbot (
                    conversacion_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER,
                    mensaje_usuario TEXT NOT NULL,
                    respuesta_ia TEXT NOT NULL,
                    proveedor_ia VARCHAR(20) DEFAULT 'groq',
                    nivel_usuario VARCHAR(20) DEFAULT 'basico',
                    contexto TEXT,
                    tipo_interaccion VARCHAR(50),
                    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id)
                )
            """)

            # Determinar tipo de interacción
            tipo_interaccion = "consulta_general"
            if contexto and isinstance(contexto, dict):
                sim_type = contexto.get('type')
                if sim_type:
                    tipo_interaccion = f"simulacion_{sim_type.lower()}"
                elif any(word in mensaje_usuario.lower() for word in ["van", "tir", "wacc", "valor", "tasa", "retorno"]):
                    tipo_interaccion = "consulta_tecnica"

            # Insertar conversación
            cursor.execute("""
                INSERT INTO Conversaciones_Chatbot
                (usuario_id, mensaje_usuario, respuesta_ia, proveedor_ia, nivel_usuario, contexto, tipo_interaccion)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                usuario_id,
                mensaje_usuario,
                respuesta_ia,
                proveedor,
                nivel,
                json.dumps(contexto) if contexto else None,
                tipo_interaccion
            ))

            db.commit()

            logger.info(f"✅ Conversación logged - Usuario: {usuario_id}, Proveedor: {proveedor}, Nivel: {nivel}")

        except Exception as e:
            logger.error(f"❌ Error logging conversación: {e}")

    def obtener_estadisticas_conversaciones(self, usuario_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Obtiene estadísticas de conversaciones para análisis
        """
        try:
            db = get_db_connection()
            cursor = db.cur

            if usuario_id:
                # Estadísticas por usuario
                cursor.execute("""
                    SELECT
                        COUNT(*) as total_conversaciones,
                        COUNT(DISTINCT DATE(fecha)) as dias_activos,
                        AVG(LENGTH(mensaje_usuario)) as longitud_promedio_mensajes,
                        proveedor_ia,
                        COUNT(*) as uso_por_proveedor
                    FROM Conversaciones_Chatbot
                    WHERE usuario_id = ?
                    GROUP BY proveedor_ia
                """, (usuario_id,))

                stats_proveedores = cursor.fetchall()

                cursor.execute("""
                    SELECT tipo_interaccion, COUNT(*) as cantidad
                    FROM Conversaciones_Chatbot
                    WHERE usuario_id = ?
                    GROUP BY tipo_interaccion
                    ORDER BY cantidad DESC
                """, (usuario_id,))

                tipos_interaccion = cursor.fetchall()

            else:
                # Estadísticas globales
                cursor.execute("""
                    SELECT COUNT(*) as total_conversaciones,
                           COUNT(DISTINCT usuario_id) as usuarios_unicos,
                           AVG(LENGTH(mensaje_usuario)) as longitud_promedio
                    FROM Conversaciones_Chatbot
                """)

                stats_globales = cursor.fetchone()
                stats_proveedores = []
                tipos_interaccion = []

            return {
                "estadisticas_proveedores": stats_proveedores,
                "tipos_interaccion": tipos_interaccion,
                "fecha_generacion": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Error obteniendo estadísticas: {e}")
            return {"error": str(e)}

# Instancia global del servicio
chatbot_servicio = ChatbotServicio()

def obtener_servicio_chatbot() -> ChatbotServicio:
    """Factory function para obtener instancia del servicio"""
    return chatbot_servicio
