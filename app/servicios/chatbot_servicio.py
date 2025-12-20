"""
Servicio de Chatbot con IA - Econova
Integra modelos ML para responder consultas financieras
"""

import re
from typing import Dict, Any, List, Optional
from ml.predecir import predecir_ingresos, predecir_crecimiento, clasificar_riesgo


class ChatbotFinanciero:
    """
    Chatbot financiero que utiliza NLP básico y modelos ML
    para responder consultas sobre predicciones financieras.
    """

    def __init__(self):
        self.patrones_ingresos = [
            r"predic.*ingreso",
            r"estimar.*ingreso",
            r"cuanto.*ingreso",
            r"ingreso.*futuro",
            r"ingreso.*próximo",
            r"ingreso.*año",
        ]

        self.patrones_riesgo = [
            r"riesgo",
            r"evaluar.*riesgo",
            r"analizar.*riesgo",
            r"nivel.*riesgo",
            r"qué.*riesgo",
            r"clasificar.*riesgo",
        ]

        self.patrones_crecimiento = [
            r"crecimiento",
            r"tasa.*crecimiento",
            r"crecer",
            r"expansión",
            r"proyección.*crecimiento",
        ]

    def procesar_mensaje(
        self, mensaje: str, historial: List[Dict] = None
    ) -> Dict[str, Any]:
        """
        Procesa el mensaje del usuario y genera una respuesta.

        Args:
            mensaje: Consulta del usuario
            historial: Historial de conversación (opcional)

        Returns:
            Diccionario con respuesta y predicción (si aplica)
        """
        mensaje_lower = mensaje.lower()

        # Extraer datos financieros del mensaje
        datos_empresa = self._extraer_datos_financieros(mensaje)

        # Determinar intención
        if self._match_patron(mensaje_lower, self.patrones_ingresos):
            return self._responder_ingresos(datos_empresa)

        elif self._match_patron(mensaje_lower, self.patrones_riesgo):
            return self._responder_riesgo(datos_empresa)

        elif self._match_patron(mensaje_lower, self.patrones_crecimiento):
            return self._responder_crecimiento(datos_empresa)

        else:
            return self._respuesta_general(mensaje, datos_empresa)

    def _match_patron(self, texto: str, patrones: List[str]) -> bool:
        """Verifica si el texto coincide con algún patrón."""
        for patron in patrones:
            if re.search(patron, texto, re.IGNORECASE):
                return True
        return False

    def _extraer_datos_financieros(self, mensaje: str) -> Dict[str, float]:
        """
        Extrae datos financieros del mensaje usando expresiones regulares.
        Busca patrones como: "ingresos 500000", "S/500,000", etc.
        """
        datos = {}

        # Patrones para extraer valores
        patrones = {
            "ingresos_anuales": [
                r"ingreso[s]?\s*(?:anuale[s]?)?\s*[:\-]?\s*s?/?\s*([0-9,\.]+)",
                r"ventas?\s*[:\-]?\s*s?/?\s*([0-9,\.]+)",
            ],
            "gastos_operativos": [
                r"gasto[s]?\s*(?:operativo[s]?)?\s*[:\-]?\s*s?/?\s*([0-9,\.]+)",
                r"costos?\s*[:\-]?\s*s?/?\s*([0-9,\.]+)",
            ],
            "activos_totales": [
                r"activo[s]?\s*(?:totale[s]?)?\s*[:\-]?\s*s?/?\s*([0-9,\.]+)"
            ],
            "pasivos_totales": [
                r"pasivo[s]?\s*(?:totale[s]?)?\s*[:\-]?\s*s?/?\s*([0-9,\.]+)",
                r"deuda[s]?\s*[:\-]?\s*s?/?\s*([0-9,\.]+)",
            ],
        }

        for campo, lista_patrones in patrones.items():
            for patron in lista_patrones:
                match = re.search(patron, mensaje, re.IGNORECASE)
                if match:
                    valor_str = match.group(1).replace(",", "").replace(".", "")
                    try:
                        datos[campo] = float(valor_str)
                        break
                    except ValueError:
                        continue

        return datos

    def _responder_ingresos(self, datos_empresa: Dict[str, float]) -> Dict[str, Any]:
        """Genera respuesta para predicción de ingresos."""
        campos_requeridos = [
            "ingresos_anuales",
            "gastos_operativos",
            "activos_totales",
            "pasivos_totales",
        ]

        if not all(campo in datos_empresa for campo in campos_requeridos):
            return {
                "respuesta": self._solicitar_datos_faltantes(
                    "ingresos", datos_empresa, campos_requeridos
                ),
                "prediccion": None,
            }

        try:
            # Realizar predicción
            resultado = predecir_ingresos(datos_empresa)

            # Formatear respuesta
            prediccion_soles = resultado["ingresos_predichos"]
            limite_inferior = resultado["limite_inferior_95"]
            limite_superior = resultado["limite_superior_95"]

            respuesta = f"""Basándome en los datos proporcionados, he analizado la situación financiera de tu empresa:

**Predicción de Ingresos para el Próximo Año:**

Según nuestro modelo de Machine Learning, se estima que los ingresos alcanzarán **S/ {prediccion_soles:,.0f}**.

📊 **Análisis Detallado:**
- Ingresos actuales: S/ {datos_empresa["ingresos_anuales"]:,.0f}
- Crecimiento esperado: {((prediccion_soles / datos_empresa["ingresos_anuales"] - 1) * 100):.1f}%
- Rango de confianza (95%): S/ {limite_inferior:,.0f} - S/ {limite_superior:,.0f}

**Factores Considerados:**
- Margen operativo actual
- Estructura de activos y pasivos
- Tendencias del mercado

¿Te gustaría realizar un análisis de riesgo o simular diferentes escenarios?"""

            return {
                "respuesta": respuesta,
                "prediccion": {
                    "tipo": "ingresos",
                    "valor": prediccion_soles,
                    "rango_inferior": limite_inferior,
                    "rango_superior": limite_superior,
                    "confianza": 0.95,
                },
            }
        except Exception as e:
            return {
                "respuesta": f"Ocurrió un error al realizar la predicción: {str(e)}. Por favor, verifica los datos ingresados.",
                "prediccion": None,
            }

    def _responder_riesgo(self, datos_empresa: Dict[str, float]) -> Dict[str, Any]:
        """Genera respuesta para análisis de riesgo."""
        campos_requeridos = [
            "ingresos_anuales",
            "gastos_operativos",
            "activos_totales",
            "pasivos_totales",
        ]

        if not all(campo in datos_empresa for campo in campos_requeridos):
            return {
                "respuesta": self._solicitar_datos_faltantes(
                    "riesgo", datos_empresa, campos_requeridos
                ),
                "prediccion": None,
            }

        try:
            resultado = clasificar_riesgo(datos_empresa)

            nivel = resultado["nivel_riesgo"]
            probabilidad = resultado["probabilidad"]
            recomendacion = resultado["recomendacion"]

            # Calcular métricas adicionales
            ratio_endeudamiento = (
                datos_empresa["pasivos_totales"] / datos_empresa["activos_totales"]
            )
            margen_operativo = (
                datos_empresa["ingresos_anuales"] - datos_empresa["gastos_operativos"]
            ) / datos_empresa["ingresos_anuales"]

            emojis_riesgo = {"Bajo": "🟢", "Medio": "🟡", "Alto": "🔴"}
            emoji = emojis_riesgo.get(nivel, "⚪")

            respuesta = f"""He completado el análisis de riesgo financiero de tu empresa:

{emoji} **Nivel de Riesgo: {nivel}**

📊 **Indicadores Clave:**
- Ratio de endeudamiento: {ratio_endeudamiento:.1%}
- Margen operativo: {margen_operativo:.1%}
- Probabilidad del nivel: {probabilidad:.1%}

💡 **Recomendación:**
{recomendacion}

**Análisis Detallado:**
"""

            if nivel == "Bajo":
                respuesta += """
✅ Tu empresa muestra una sólida posición financiera
✅ El endeudamiento está en niveles manejables
✅ Los márgenes operativos son saludables

Sugerencias: Considera oportunidades de expansión o inversión en innovación."""

            elif nivel == "Medio":
                respuesta += """
⚠️ Hay algunas áreas que requieren atención
⚠️ El endeudamiento podría optimizarse
⚠️ Los márgenes operativos tienen espacio de mejora

Sugerencias: Enfócate en mejorar eficiencia operativa y controlar costos."""

            else:  # Alto
                respuesta += """
🚨 Se requiere atención inmediata en varios aspectos
🚨 El nivel de endeudamiento es preocupante
🚨 Los márgenes operativos son muy ajustados

Sugerencias: Considera reestructuración de deuda y reducción de costos urgente."""

            return {
                "respuesta": respuesta,
                "prediccion": {
                    "tipo": "riesgo",
                    "nivel": nivel,
                    "probabilidad": probabilidad,
                    "recomendacion": recomendacion,
                },
            }
        except Exception as e:
            return {
                "respuesta": f"Error al analizar el riesgo: {str(e)}",
                "prediccion": None,
            }

    def _responder_crecimiento(self, datos_empresa: Dict[str, float]) -> Dict[str, Any]:
        """Genera respuesta para predicción de crecimiento."""
        campos_requeridos = [
            "ingresos_anuales",
            "gastos_operativos",
            "activos_totales",
            "pasivos_totales",
        ]

        if not all(campo in datos_empresa for campo in campos_requeridos):
            return {
                "respuesta": self._solicitar_datos_faltantes(
                    "crecimiento", datos_empresa, campos_requeridos
                ),
                "prediccion": None,
            }

        try:
            resultado = predecir_crecimiento(datos_empresa)

            crecimiento = resultado["crecimiento_porcentaje"]
            categoria = resultado["categoria_crecimiento"]

            respuesta = f"""He analizado el potencial de crecimiento de tu empresa:

📈 **Tasa de Crecimiento Proyectada: {crecimiento:.2f}%**

**Categoría: {categoria}**

**Análisis del Crecimiento:**
"""

            if crecimiento > 20:
                respuesta += """
🚀 ¡Excelente! Tu empresa muestra un potencial de alto crecimiento
- Se proyecta una expansión significativa
- Las condiciones son favorables para inversión
- Considera escalar operaciones estratégicamente"""

            elif crecimiento > 10:
                respuesta += """
📊 Crecimiento moderado esperado
- Tasa saludable de expansión
- Mantén el enfoque en eficiencia
- Busca oportunidades de optimización"""

            elif crecimiento > 0:
                respuesta += """
📉 Crecimiento bajo pero positivo
- Se requiere impulsar la expansión
- Analiza nuevas oportunidades de mercado
- Considera estrategias de crecimiento"""

            else:
                respuesta += """
⚠️ Proyección de contracción
- Se requieren medidas correctivas urgentes
- Revisa tu modelo de negocio
- Implementa plan de recuperación"""

            respuesta += "\n\n¿Quieres que realice una simulación Monte Carlo para analizar diferentes escenarios?"

            return {
                "respuesta": respuesta,
                "prediccion": {
                    "tipo": "crecimiento",
                    "porcentaje": crecimiento,
                    "categoria": categoria,
                    "confianza": 0.85,
                },
            }
        except Exception as e:
            return {
                "respuesta": f"Error al calcular crecimiento: {str(e)}",
                "prediccion": None,
            }

    def _respuesta_general(
        self, mensaje: str, datos_empresa: Dict[str, float]
    ) -> Dict[str, Any]:
        """Genera respuesta para consultas generales."""

        # Si hay datos financieros, sugerir análisis
        if datos_empresa:
            respuesta = """He detectado datos financieros en tu mensaje. Puedo ayudarte con:

📊 **Análisis Disponibles:**
1. **Predicción de Ingresos** - Estima ingresos del próximo año
2. **Análisis de Riesgo** - Evalúa el riesgo financiero
3. **Proyección de Crecimiento** - Calcula tasa de crecimiento esperada
4. **Simulación Monte Carlo** - Analiza múltiples escenarios

¿Qué tipo de análisis te gustaría realizar?"""
        else:
            respuesta = """Soy tu asistente financiero con IA. Puedo ayudarte con:

🤖 **Capacidades:**
- 📊 Predicción de ingresos futuros
- 🛡️ Análisis de riesgo financiero
- 📈 Proyección de crecimiento empresarial
- 🎲 Simulaciones Monte Carlo
- 📉 Análisis de sensibilidad

Para realizar un análisis, necesito los siguientes datos de tu empresa:
- Ingresos anuales (S/)
- Gastos operativos (S/)
- Activos totales (S/)
- Pasivos totales (S/)

**Ejemplo:** "Quiero predecir ingresos. Tengo: ingresos anuales S/500,000, gastos operativos S/350,000, activos totales S/800,000, pasivos S/300,000"

¿Qué análisis te gustaría realizar?"""

        return {"respuesta": respuesta, "prediccion": None}

    def _solicitar_datos_faltantes(
        self, tipo_analisis: str, datos_actuales: Dict, campos_requeridos: List[str]
    ) -> str:
        """Genera mensaje solicitando datos faltantes."""
        faltantes = [
            campo for campo in campos_requeridos if campo not in datos_actuales
        ]

        nombres_amigables = {
            "ingresos_anuales": "Ingresos anuales",
            "gastos_operativos": "Gastos operativos",
            "activos_totales": "Activos totales",
            "pasivos_totales": "Pasivos totales",
        }

        respuesta = f"Para realizar el análisis de {tipo_analisis}, necesito información adicional:\n\n"

        if datos_actuales:
            respuesta += "**Datos recibidos:** ✅\n"
            for campo, valor in datos_actuales.items():
                nombre = nombres_amigables.get(campo, campo)
                respuesta += f"- {nombre}: S/ {valor:,.0f}\n"
            respuesta += "\n"

        respuesta += "**Datos faltantes:** ❌\n"
        for campo in faltantes:
            nombre = nombres_amigables.get(campo, campo)
            respuesta += f"- {nombre}\n"

        respuesta += (
            "\nPor favor, proporciona los datos faltantes en tu próximo mensaje."
        )

        return respuesta


# Instancia global del chatbot
_chatbot_instance = None


def obtener_chatbot() -> ChatbotFinanciero:
    """Obtiene o crea la instancia del chatbot."""
    global _chatbot_instance
    if _chatbot_instance is None:
        _chatbot_instance = ChatbotFinanciero()
    return _chatbot_instance
