"""
Servicio de Chatbot Inteligente - Phase 7
Implementa Groq + OpenAI fallback, prompts multinivel, logs conversacionales y copiloto adaptativo
"""

import os
import json
import logging
from datetime import datetime
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

from ..utils.base_datos import get_db_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatbotServicio:
    """
    Servicio principal del chatbot con funcionalidades avanzadas:
    - Groq + OpenAI fallback
    - Prompts multinivel (básico/intermedio/expert)
    - Logs conversacionales
    - Copiloto adaptativo
    """

    def __init__(self):
        self.groq_client = None
        self.openai_client = None
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

    def determinar_nivel_usuario(self, usuario_id: Optional[int] = None,
                               historial_conversaciones: List[Dict] = None) -> str:
        """
        Determina el nivel de expertise del usuario basado en su historial
        """
        if not usuario_id:
            return "basico"

        try:
            conn = get_db_connection().conn
            cursor = conn.cursor()

            # Analizar historial de conversaciones
            cursor.execute("""
                SELECT COUNT(*) as total_conversaciones,
                       AVG(LENGTH(mensaje_usuario)) as longitud_promedio,
                       COUNT(CASE WHEN tipo_interaccion = 'simulacion_financiera' THEN 1 END) as simulaciones,
                       COUNT(CASE WHEN tipo_interaccion = 'consulta_tecnica' THEN 1 END) as consultas_tecnicas
                FROM Conversaciones_Chatbot
                WHERE usuario_id = ? AND fecha > datetime('now', '-30 days')
            """, (usuario_id,))

            stats = cursor.fetchone()

            if stats:
                total_conv, long_promedio, simulaciones, consultas_tecnicas = stats

                # Lógica de clasificación
                if total_conv >= 20 and (simulaciones >= 5 or consultas_tecnicas >= 10):
                    return "experto"
                elif total_conv >= 10 and (simulaciones >= 2 or consultas_tecnicas >= 3):
                    return "intermedio"
                else:
                    return "basico"

            conn.close()

        except Exception as e:
            logger.error(f"Error determinando nivel usuario: {e}")

        return "basico"

    def obtener_prompt_por_nivel(self, nivel: str, contexto: Dict = None, analysis_context: Dict = None) -> str:
        """
        Retorna el prompt apropiado según el nivel del usuario
        """
        base_prompts = {
            "basico": """
            Eres Econova AI, un asistente financiero amigable y paciente.
            Tu público son emprendedores y empresarios peruanos que están aprendiendo sobre finanzas.

            INSTRUCCIONES IMPORTANTES:
            - Explica conceptos de manera simple y con ejemplos cotidianos
            - Evita jerga técnica o explícala cuando la uses
            - Sé paciente y anima al aprendizaje
            - Usa analogías del mundo real (restaurantes, agricultura, comercio)
            - Pregunta si algo no quedó claro
            - Mantén respuestas concisas pero completas

            CONOCIMIENTOS FINANCIEROS BÁSICOS:
            - VAN (Valor Actual Neto): "Es como saber cuánto dinero 'real' ganarás después de considerar el tiempo y el riesgo"
            - TIR (Tasa Interna de Retorno): "Es el porcentaje de ganancia real de tu inversión"
            - WACC (Costo del Capital): "Es lo que te cuesta conseguir dinero para invertir"

            Si no sabes algo específico, admítelo y sugiere consultar con un asesor financiero.
            """,

            "intermedio": """
            Eres Econova AI, un asesor financiero profesional con experiencia intermedia.
            Tu público son empresarios peruanos que ya tienen conocimientos básicos y quieren profundizar.

            INSTRUCCIONES IMPORTANTES:
            - Usa terminología técnica apropiada pero explica conceptos complejos
            - Proporciona análisis más detallados y recomendaciones específicas
            - Incluye consideraciones prácticas del mercado peruano
            - Sugiere próximos pasos en el análisis financiero
            - Mantén un equilibrio entre teoría y aplicación práctica

            CONOCIMIENTOS FINANCIEROS INTERMEDIOS:
            - VAN = Σ(Flujo de Cajaₜ / (1 + r)ᵜ) - Inversión Inicial
            - TIR: Tasa que hace VAN = 0
            - WACC = (E/V × Re) + (D/V × Rd × (1-Tc))
            - Análisis de sensibilidad y escenarios
            - Optimización de portafolios

            Enfócate en ayudar a tomar decisiones informadas con datos específicos.
            """,

            "experto": """
            Eres Econova AI, un asesor financiero senior especializado en análisis empresarial avanzado.
            Tu público son empresarios experimentados que requieren análisis técnicos profundos.

            INSTRUCCIONES IMPORTANTES:
            - Utiliza terminología técnica avanzada sin explicaciones básicas
            - Proporciona análisis cuantitativos detallados
            - Incluye consideraciones regulatorias y de mercado peruano
            - Sugiere estrategias de optimización avanzadas
            - Recomienda herramientas y métricas específicas

            CONOCIMIENTOS FINANCIEROS AVANZADOS:
            - Modelos de valoración DCF con flujos no convencionales
            - Análisis de riesgo usando simulación Monte Carlo
            - Optimización de estructura de capital
            - Valoración de opciones reales
            - Análisis de covenants y restricciones financieras

            Enfócate en insights estratégicos y recomendaciones accionables de alto nivel.
            """
        }

        prompt = base_prompts.get(nivel, base_prompts["basico"])

        # Agregar contexto de análisis específico si está disponible
        if analysis_context and isinstance(analysis_context, dict):
            tipo_analisis = analysis_context.get('tipo_analisis')
            resultados = analysis_context.get('resultados', {})

            if tipo_analisis and resultados:
                prompt += f"\n\nCONTEXTO DE ANÁLISIS ACTUAL: El usuario acaba de completar un análisis de {tipo_analisis.upper()}."

                if tipo_analisis == 'van' and resultados.get('van') is not None:
                    prompt += f"\n- VAN calculado: S/ {resultados['van']:,}"
                    if resultados.get('tir'):
                        prompt += f"\n- TIR correspondiente: {resultados['tir']}%"
                    if resultados.get('payback'):
                        prompt += f"\n- Payback: {resultados['payback']}"
                    prompt += "\n\nINSTRUCCIONES ESPECÍFICAS PARA VAN: Cuando respondas preguntas sobre 'este VAN', 'qué significa este VAN' o 'cómo interpretar este VAN', debes referirte específicamente al valor calculado de S/ {resultados['van']:,}. No des explicaciones genéricas."

                elif tipo_analisis == 'wacc' and resultados.get('wacc'):
                    prompt += f"\n- WACC calculado: {resultados['wacc']}%"
                    if resultados.get('costo_equity'):
                        prompt += f"\n- Costo de equity: {resultados['costo_equity']}%"
                    if resultados.get('costo_deuda'):
                        prompt += f"\n- Costo de deuda: {resultados['costo_deuda']}%"
                    prompt += "\n\nINSTRUCCIONES ESPECÍFICAS PARA WACC: Cuando respondas preguntas sobre 'este WACC' o 'qué significa este WACC', debes referirte específicamente al valor calculado del {resultados['wacc']}% (o el valor que corresponda). No des explicaciones genéricas."

                elif tipo_analisis == 'tir' and resultados.get('tir'):
                    prompt += f"\n- TIR calculada: {resultados['tir']}%"
                    if resultados.get('van'):
                        prompt += f"\n- VAN correspondiente: {resultados['van']}"
                    prompt += "\n\nINSTRUCCIONES ESPECÍFICAS PARA TIR: Cuando respondas preguntas sobre 'esta TIR' o 'qué significa esta TIR', debes referirte específicamente al valor calculado del {resultados['tir']}%. No des explicaciones genéricas."

                elif tipo_analisis == 'portafolio':
                    if resultados.get('rendimiento'):
                        prompt += f"\n- Rendimiento esperado: {resultados['rendimiento']}%"
                    if resultados.get('riesgo'):
                        prompt += f"\n- Volatilidad: {resultados['riesgo']}%"
                    if resultados.get('sharpe'):
                        prompt += f"\n- Ratio Sharpe: {resultados['sharpe']}"
                    prompt += "\n\nINSTRUCCIONES ESPECÍFICAS PARA PORTAFOLIO: Cuando respondas preguntas sobre 'este portafolio' o 'mis resultados', debes referirte específicamente a los valores calculados."

                elif tipo_analisis == 'prediccion':
                    prompt += f"\n- Tipo de análisis: Predicciones con Machine Learning"
                    if resultados.get('ingresos_predichos'):
                        prompt += f"\n- Ingresos predichos: S/ {resultados['ingresos_predichos']:,}"
                    if resultados.get('crecimiento_porcentaje'):
                        prompt += f"\n- Crecimiento esperado: {resultados['crecimiento_porcentaje']}%"
                    if resultados.get('nivel_riesgo'):
                        prompt += f"\n- Nivel de riesgo: {resultados['nivel_riesgo']}"
                    prompt += "\n\nINSTRUCCIONES ESPECÍFICAS PARA PREDICCIONES: Cuando respondas preguntas sobre 'estas predicciones', 'los ingresos predichos' o 'el crecimiento esperado', debes referirte específicamente a los valores calculados arriba. No des explicaciones genéricas."

                elif tipo_analisis == 'montecarlo':
                    prompt += f"\n- Tipo de análisis: Simulación Monte Carlo"
                    if resultados.get('van_medio') is not None:
                        prompt += f"\n- VAN medio: S/ {resultados['van_medio']:,}"
                    if resultados.get('probabilidad_van_positivo') is not None:
                        prompt += f"\n- Probabilidad de éxito: {(resultados['probabilidad_van_positivo'] * 100):.1f}%"
                    if resultados.get('desviacion') is not None:
                        prompt += f"\n- Desviación estándar: S/ {resultados['desviacion']:,}"
                    if resultados.get('variable_mas_sensible'):
                        prompt += f"\n- Variable más sensible: {resultados['variable_mas_sensible']}"
                    prompt += "\n\nINSTRUCCIONES ESPECÍFICAS PARA MONTE CARLO: Cuando respondas preguntas sobre 'este VAN medio', 'la probabilidad', 'la volatilidad' o 'los resultados de Monte Carlo', debes referirte específicamente a los valores calculados arriba."

                elif tipo_analisis == 'tornado':
                    prompt += f"\n- Tipo de análisis: Análisis de sensibilidad tornado"
                    if resultados.get('variable_mas_sensible'):
                        prompt += f"\n- Variable más crítica: {resultados['variable_mas_sensible']}"
                    if resultados.get('impacto_maximo') is not None:
                        prompt += f"\n- Impacto máximo: S/ {resultados['impacto_maximo']:,}"
                    if resultados.get('variables') and isinstance(resultados['variables'], list):
                        prompt += f"\n- Número de variables analizadas: {len(resultados['variables'])}"
                    prompt += "\n\nINSTRUCCIONES ESPECÍFICAS PARA TORNADO: Cuando respondas preguntas sobre 'la variable crítica', 'el impacto' o 'el análisis de sensibilidad', debes referirte específicamente a los valores calculados arriba."

                elif tipo_analisis == 'escenarios':
                    prompt += f"\n- Tipo de análisis: Análisis de escenarios"
                    if resultados.get('escenarios_originales'):
                        escenarios = resultados['escenarios_originales']
                        if escenarios.pesimista:
                            prompt += f"\n- Escenario pesimista: S/ {escenarios.pesimista}"
                        if escenarios.base:
                            prompt += f"\n- Escenario base: S/ {escenarios.base}"
                        if escenarios.optimista:
                            prompt += f"\n- Escenario optimista: S/ {escenarios.optimista}"
                    if resultados.get('recomendacion'):
                        prompt += f"\n- Recomendación: {resultados['recomendacion']}"
                    prompt += "\n\nINSTRUCCIONES ESPECÍFICAS PARA ESCENARIOS: Cuando respondas preguntas sobre 'los escenarios', 'el peor caso', 'el mejor caso' o 'la recomendación', debes referirte específicamente a los valores calculados arriba."

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
            # Determinar nivel del usuario
            nivel_usuario = self.determinar_nivel_usuario(usuario_id)

            # Obtener prompt apropiado con contexto de análisis
            system_prompt = self.obtener_prompt_por_nivel(nivel_usuario, contexto, analysis_context)

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

            # Log de la conversación
            self._log_conversacion(usuario_id, mensaje, respuesta, proveedor_usado, contexto, nivel_usuario, analysis_context)

            return {
                "success": True,
                "respuesta": respuesta,
                "proveedor": proveedor_usado,
                "nivel_usuario": nivel_usuario,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"❌ Error en consultar_ia: {e}")
            return {
                "success": False,
                "error": str(e),
                "respuesta": "Lo siento, hubo un error al procesar tu consulta. Por favor, inténtalo de nuevo."
            }

    def _consultar_groq(self, mensaje: str, system_prompt: str) -> str:
        """Consulta a Groq API"""
        response = self.groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": mensaje}
            ],
            max_tokens=1000,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()

    def _consultar_openai(self, mensaje: str, system_prompt: str) -> str:
        """Consulta a OpenAI API"""
        response = self.openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": mensaje}
            ],
            max_tokens=1000,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()

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
