"""
Sistema de Prompts y Respuestas Contextuales del Chatbot
Contiene respuestas predefinidas inteligentes para análisis financieros
"""

class ChatbotPrompts:
    """
    Sistema centralizado de prompts y respuestas contextuales
    """

    # Prompts base por nivel de usuario
    BASE_PROMPTS = {
        "basico": """
Eres Econova AI, un asistente financiero inteligente especializado en análisis de inversiones.
Explica conceptos de manera simple y clara, usando analogías cuando sea necesario.
Mantén un tono amigable y educativo.

IMPORTANTE: Si el usuario ha realizado un análisis específico (VAN, TIR, WACC, Portafolio),
proporciona respuestas contextuales específicas basadas en SUS RESULTADOS, no explicaciones genéricas.
""",

        "intermedio": """
Eres Econova AI, un asistente financiero avanzado con conocimientos técnicos.
Explica conceptos con cierto nivel de detalle técnico, pero mantén la claridad.
Usa terminología financiera apropiada pero explica términos complejos.

IMPORTANTE: Para análisis específicos, proporciona interpretaciones detalladas
y recomendaciones prácticas basadas en los resultados reales del usuario.
""",

        "experto": """
Eres Econova AI, un asistente financiero experto para profesionales.
Usa terminología técnica avanzada y proporciona análisis profundos.
Enfócate en implicaciones estratégicas y recomendaciones de alto nivel.

IMPORTANTE: Para análisis realizados, proporciona insights estratégicos
y recomendaciones basadas en mejores prácticas del sector.
"""
    }

    @staticmethod
    def get_contextual_prompt(analysis_type: str, results: dict) -> str:
        """
        Retorna prompt contextual específico basado en el tipo de análisis y resultados
        """
        if analysis_type == 'van':
            return ChatbotPrompts._get_van_context(results)
        elif analysis_type == 'tir':
            return ChatbotPrompts._get_tir_context(results)
        elif analysis_type == 'wacc':
            return ChatbotPrompts._get_wacc_context(results)
        elif analysis_type == 'portafolio':
            return ChatbotPrompts._get_portafolio_context(results)
        elif analysis_type in ['prediccion', 'montecarlo', 'tornado', 'sensibilidad']:
            return ChatbotPrompts._get_ml_context(analysis_type, results)

        return ""

    @staticmethod
    def _get_van_context(results: dict) -> str:
        """Prompt contextual para análisis VAN"""
        van_valor = results.get('van', 0)
        inversion = results.get('inversion', 0)
        tir = results.get('tir', 0)

        contexto = f"""
CONTEXTO DEL ANÁLISIS VAN REALIZADO POR EL USUARIO:
- VAN calculado: S/ {van_valor:,.2f}
- Inversión inicial: S/ {inversion:,.2f}
- TIR calculada: {tir:.2f}%
- Decisión: {'Viable' if van_valor > 0 else 'No viable'}

INSTRUCCIONES PARA RESPONDER:
1. Si pregunta "qué significa" o "cómo interpretar": Explica específicamente SU VAN
2. Si pregunta "mejorar" o "optimizar": Sugiere formas específicas de mejorar SU VAN
3. Si pregunta sobre viabilidad: Evalúa SU proyecto específico
4. Siempre incluye 2-3 preguntas sugeridas relevantes al final

IMPORTANTE: Usa SUS VALORES REALES en todas las explicaciones, no valores genéricos.
"""
        return contexto

    @staticmethod
    def _get_tir_context(results: dict) -> str:
        """Prompt contextual para análisis TIR"""
        tir_valor = results.get('tir', 0)
        van_tir = results.get('van_tir', 0)
        metodo = results.get('metodo', 'newton')

        contexto = f"""
CONTEXTO DEL ANÁLISIS TIR REALIZADO POR EL USUARIO:
- TIR calculada: {tir_valor:.2f}%
- VAN a la TIR: S/ {van_tir:,.2f}
- Método usado: {metodo}

INSTRUCCIONES PARA RESPONDER:
1. Si pregunta "qué significa": Explica específicamente SU TIR de {tir_valor:.2f}%
2. Si pregunta "buena o mala": Evalúa SU TIR comparándola con benchmarks
3. Si pregunta "comparar con WACC": Explica la relación TIR vs costo de capital
4. Si pregunta sobre método: Explica por qué se usó {metodo}

IMPORTANTE: Evalúa la TIR en contexto peruano (comparar con 12-15% típico).
"""
        return contexto

    @staticmethod
    def _get_wacc_context(results: dict) -> str:
        """Prompt contextual para análisis WACC"""
        wacc_valor = results.get('wacc', 0)
        costo_deuda = results.get('costo_deuda', 0)
        costo_capital = results.get('costo_capital', 0)
        peso_deuda = results.get('peso_deuda', 0)
        peso_capital = results.get('peso_capital', 0)

        contexto = f"""
CONTEXTO DEL ANÁLISIS WACC REALIZADO POR EL USUARIO:
- WACC calculado: {wacc_valor:.2f}%
- Costo de deuda: {costo_deuda:.2f}% (peso: {peso_deuda:.2f}%)
- Costo de capital propio: {costo_capital:.2f}% (peso: {peso_capital:.2f}%)

INSTRUCCIONES PARA RESPONDER:
1. Si pregunta "qué significa": Explica SU WACC específico
2. Si pregunta "alto o bajo": Compara con benchmarks del sector
3. Si pregunta "cómo usar": Explica aplicación en VAN y TIR
4. Si pregunta "reducir": Sugiere estrategias para optimizar SU WACC

IMPORTANTE: Compara con mercado peruano (12-15% típico para empresas saludables).
"""
        return contexto

    @staticmethod
    def _get_portafolio_context(results: dict) -> str:
        """Prompt contextual para análisis de portafolio"""
        retorno = results.get('retorno', 0)
        riesgo = results.get('riesgo', 0)
        sharpe = results.get('sharpe', 0)
        activos_optimo = results.get('activos_optimo', [])

        contexto = f"""
CONTEXTO DEL ANÁLISIS DE PORTAFOLIO REALIZADO POR EL USUARIO:
- Retorno esperado: {retorno:.2f}%
- Riesgo (volatilidad): {riesgo:.2f}%
- Ratio Sharpe: {sharpe:.2f}
- Número de activos en portafolio óptimo: {len(activos_optimo)}

INSTRUCCIONES PARA RESPONDER:
1. Si pregunta "qué significa": Explica específicamente SU portafolio
2. Si pregunta "bueno o malo": Evalúa eficiencia usando SU Sharpe
3. Si pregunta "diversificar": Sugiere mejoras para SU portafolio
4. Si pregunta "riesgo": Explica SU nivel de riesgo específico

IMPORTANTE: Sharpe > 1 es excelente, Sharpe > 0.5 es bueno, Sharpe < 0.5 necesita mejora.
"""
        return contexto

    @staticmethod
    def _get_ml_context(analysis_type: str, results: dict) -> str:
        """Prompt contextual para análisis ML"""
        contexto = f"""
CONTEXTO DEL ANÁLISIS {analysis_type.upper()} REALIZADO POR EL USUARIO:
"""

        if analysis_type == 'prediccion':
            precision = results.get('precision', 0)
            tendencias = results.get('tendencia_principal', 'tendencias mixtas')
            contexto += f"""
- Precisión del modelo: {precision:.1f}%
- Tendencia principal identificada: {tendencias}
- Períodos de predicción: {results.get('periodos_prediccion', 'N/A')}
"""
        elif analysis_type == 'montecarlo':
            sims = results.get('num_simulaciones', 0)
            van_prom = results.get('van_promedio', 0)
            prob_pos = results.get('probabilidad_positivo', 0)
            contexto += f"""
- Número de simulaciones: {sims:,}
- VAN promedio: S/ {van_prom:,.2f}
- Probabilidad VAN positivo: {prob_pos:.1f}%
"""
        elif analysis_type == 'tornado':
            var_sensible = results.get('variable_mas_sensible', 'N/A')
            impacto = results.get('impacto_maximo', 0)
            contexto += f"""
- Variable más sensible: {var_sensible}
- Impacto máximo en VAN: {impacto:.1f}%
"""
        elif analysis_type == 'sensibilidad':
            elasticidad = results.get('elasticidad_critica', 0)
            punto_eq = results.get('punto_equilibrio', 0)
            contexto += f"""
- Elasticidad crítica: {elasticidad:.2f}
- Punto de equilibrio: {punto_eq} unidades
"""

        contexto += """
INSTRUCCIONES PARA RESPONDER:
1. Explica los resultados específicos del análisis
2. Proporciona insights prácticos para toma de decisiones
3. Sugiere acciones basadas en los resultados
4. Incluye preguntas sugeridas para profundizar
"""
        return contexto


class RespuestasContextuales:
    """
    Respuestas predefinidas inteligentes para diferentes tipos de análisis
    """

    @staticmethod
    def get_respuesta_van(consulta: str, results: dict) -> str:
        """Respuestas específicas para consultas sobre VAN"""
        consulta_lower = consulta.lower()
        van_valor = results.get('van', 0)
        inversion = results.get('inversion', 0)

        # Interpretación general
        if any(word in consulta_lower for word in ['qué significa', 'que significa', 'cómo interpretar', 'como interpretar']):
            return RespuestasContextuales._interpretacion_van(results)

        # Preguntas sobre viabilidad
        if any(word in consulta_lower for word in ['rentable', 'viable', 'buena inversion', 'vale la pena']):
            return RespuestasContextuales._viabilidad_van(results)

        # Preguntas sobre mejora
        if any(word in consulta_lower for word in ['mejorar', 'optimizar', 'aumentar', 'incrementar']):
            return RespuestasContextuales._mejora_van(results)

        # Factores que afectan
        if any(word in consulta_lower for word in ['factores', 'afecta', 'influye', 'cambia']):
            return RespuestasContextuales._factores_van(results)

        # Respuesta general
        return RespuestasContextuales._respuesta_general_van(results)

    @staticmethod
    def _interpretacion_van(results: dict) -> str:
        """Interpretación específica del VAN calculado"""
        van_valor = results.get('van', 0)
        inversion = results.get('inversion', 0)
        tir = results.get('tir', 0)

        if van_valor > 0:
            return f"""**Interpretación de tu VAN de S/ {van_valor:,.2f}**

Excelente resultado en tu análisis! Un **[green]VAN positivo[/green]** de **S/ {van_valor:,.2f}** significa que:

🎯 **Tu proyecto GENERA VALOR**
• Recuperarás tu inversión inicial de S/ {inversion:,.2f}
• Obtendrás una **ganancia adicional** de S/ {van_valor:,.2f}
• El rendimiento supera el costo del capital

💡 **Contexto financiero:**
• Es como si tu proyecto te diera "regalo" de S/ {van_valor:,.2f}
• Cada sol invertido genera {tir:.1f}% de retorno real
• Comparado con dejar el dinero en un banco, estás creando riqueza

✅ **Recomendación:** Este proyecto es **[green]financieramente viable[/green]** y merece consideración seria.

[¿Cómo mejorar aún más este VAN?|¿Es este VAN suficiente para el riesgo?|¿Qué factores podrían cambiar este resultado?]"""

        elif van_valor < 0:
            return f"""**Interpretación de tu VAN de S/ {van_valor:,.2f}**

Tu análisis muestra un **[red]VAN negativo[/red]**, lo que significa que:

⚠️ **Tu proyecto DESTRUYE VALOR**
• Necesitas S/ {abs(van_valor):,.2f} adicionales para que el proyecto sea viable
• La inversión no genera suficientes retornos para cubrir el costo del capital
• Es como "perder" S/ {abs(van_valor):,.2f} en el proyecto

💡 **Contexto financiero:**
• El proyecto cuesta más de lo que genera
• Cada sol invertido pierde valor en lugar de ganarlo
• Mejor alternativa sería invertir en opciones menos riesgosas

🔍 **Necesitas revisar:**
• ¿Los flujos de caja proyectados son realistas?
• ¿La tasa de descuento refleja correctamente el riesgo?
• ¿Hay formas de reducir costos o aumentar ingresos?

[¿Cómo mejorar los flujos de caja?|¿Es realista la tasa de descuento?|¿Qué cambios harían viable el proyecto?]"""

        else:  # VAN = 0
            return f"""**Interpretación de tu VAN de S/ {van_valor:,.2f}**

Tu VAN es **[orange]cero[/orange]**, un punto de equilibrio interesante:

⚖️ **PUNTO DE EQUILIBRIO**
• El proyecto ni gana ni pierde valor
• Recuperas exactamente tu inversión inicial
• No hay ganancia adicional, pero tampoco pérdida

💡 **Contexto financiero:**
• Es el "break-even" del proyecto
• El rendimiento justo cubre el costo del capital
• Decisión depende de factores no financieros

🤔 **Consideraciones adicionales:**
• ¿Hay beneficios estratégicos o intangibles?
• ¿El proyecto abre puertas a otras oportunidades?
• ¿Hay preferencias personales por este tipo de inversión?

[¿Qué factores no financieros considerar?|¿Cómo hacer que el VAN sea positivo?|¿Vale la pena por otros beneficios?]"""

    @staticmethod
    def _viabilidad_van(results: dict) -> str:
        """Evaluación de viabilidad basada en VAN"""
        van_valor = results.get('van', 0)
        inversion = results.get('inversion', 0)

        if van_valor > inversion * 0.15:  # Más del 15% de ganancia relativa
            return f"""**✅ MUY VIABLE - Excelente oportunidad**

Tu VAN de S/ {van_valor:,.2f} representa una ganancia del **{((van_valor/inversion)*100):.1f}%** sobre la inversión inicial.

Esto significa que:
• **Retorno superior** al esperado
• **Bajo riesgo** relativo a la ganancia potencial
• **Alta probabilidad** de éxito financiero

En el contexto peruano, este nivel de retorno es **excepcional** y justifica la inversión.

[¿Cómo asegurar estos retornos?|¿Qué riesgos podrían afectar?|¿Cuándo comenzar la implementación?]"""

        elif van_valor > 0:
            return f"""**✅ VIABLE - Buena oportunidad**

Tu VAN positivo de S/ {van_valor:,.2f} indica que el proyecto **crea valor**, aunque moderadamente.

• **Retorno aceptable** en el mercado actual
• **Riesgo controlable** con buena gestión
• **Viable financieramente** con seguimiento adecuado

Recomiendo proceder con **análisis adicionales de sensibilidad** para confirmar la robustez.

[¿Cómo hacer más robusto el proyecto?|¿Qué análisis adicionales recomiendas?|¿Cuáles son los riesgos principales?]"""

        else:
            return f"""**❌ NO VIABLE - Requiere revisión**

Tu VAN negativo indica que el proyecto **destruye valor** actualmente.

Para hacerlo viable necesitas:
• **Aumentar ingresos** proyectados
• **Reducir costos** operativos
• **Optimizar inversión** inicial
• **Revisar supuestos** del proyecto

Te recomiendo **no proceder** sin cambios significativos que hagan positivo el VAN.

[¿Qué cambios harían viable el proyecto?|¿Cómo reducir la inversión inicial?|¿Cómo aumentar los flujos de caja?]"""

    @staticmethod
    def _mejora_van(results: dict) -> str:
        """Sugerencias específicas para mejorar el VAN"""
        van_actual = results.get('van', 0)
        inversion = results.get('inversion', 0)

        return f"""**🚀 Estrategias para mejorar tu VAN de S/ {van_actual:,.2f}**

Aquí tienes estrategias específicas ordenadas por impacto potencial:

**1. 📈 Aumentar Ingresos**
• **Extender el horizonte** de proyección (años adicionales)
• **Incrementar precios** de productos/servicios
• **Expandir mercado** o segmentos atendidos
• **Agregar productos** complementarios

**2. 💰 Reducir Costos**
• **Optimizar procesos** para reducir costos operativos
• **Negociar mejores términos** con proveedores
• **Automatizar tareas** repetitivas
• **Reducir waste** y ineficiencias

**3. ⏰ Acelerar Flujos de Caja**
• **Facturación más rápida** (menos días de crédito)
• **Cobranza eficiente** para reducir morosidad
• **Precios escalonados** para pago anticipado
• **Incentivos** por pago temprano

**4. 📊 Optimizar Financiamiento**
• **Mejorar estructura de capital** (más deuda si aplica)
• **Reducir inversión inicial** con financiamiento
• **Buscar subsidios** o incentivos fiscales
• **Alianzas estratégicas** para compartir costos

**💡 Recomendación inmediata:**
Empieza por **analizar sensibilidad** para identificar qué variables tienen mayor impacto.

[¿Qué variable tiene mayor impacto?|¿Cómo hacer análisis de sensibilidad?|¿Qué cambios implementar primero?]"""

    @staticmethod
    def _factores_van(results: dict) -> str:
        """Explicación de factores que afectan el VAN"""
        return f"""**🔍 Factores que afectan tu VAN**

Tu VAN está influenciado por múltiples variables. Los más importantes son:

**1. 💵 Flujos de Caja Operativos**
• **Volumen de ventas** - Más unidades = más ingresos
• **Precios de venta** - Incrementos directos en VAN
• **Costos variables** - Gastos que crecen con ventas
• **Costos fijos** - Gastos independientes del volumen

**2. ⏰ Timing de Flujos**
• **Momento de ingresos** - Más temprano = mejor VAN
• **Momento de costos** - Más tarde = mejor VAN
• **Período de recuperación** - Menos tiempo = mejor VAN

**3. 💰 Costo del Capital**
• **Tasa de descuento** - Más baja = VAN más alto
• **Riesgo percibido** - Menos riesgo = tasa más baja
• **Estructura de capital** - Mezcla deuda/capital propio

**4. 📈 Horizonte de Proyección**
• **Años de análisis** - Más tiempo = más oportunidades
• **Crecimiento futuro** - Tasas de crecimiento positivas
• **Terminal value** - Valor residual al final

**5. ⚠️ Factores Externos**
• **Inflación** - Afecta precios y costos
• **Tipo de cambio** - Importante para exportaciones
• **Condiciones económicas** - Ciclos económicos

**💡 Para tu proyecto específico:**
Te recomiendo hacer **análisis de sensibilidad** para ver cuál de estos factores impacta más tu VAN.

[¿Cómo hacer análisis de sensibilidad?|¿Qué factores son más importantes en mi caso?|¿Cómo mitigar riesgos externos?]"""

    @staticmethod
    def _respuesta_general_van(results: dict) -> str:
        """Respuesta general para consultas sobre VAN"""
        van_valor = results.get('van', 0)
        inversion = results.get('inversion', 0)

        return f"""**Análisis de tu VAN de S/ {van_valor:,.2f}**

Basándome en tu cálculo de VAN, aquí tienes información relevante:

📊 **Tu resultado:** VAN = S/ {van_valor:,.2f}
💰 **Inversión inicial:** S/ {inversion:,.2f}
📈 **Retorno relativo:** {((van_valor/inversion)*100):.1f}%

**Estado financiero:**
{'✅ **POSITIVO** - Tu proyecto crea valor y es financieramente viable' if van_valor > 0 else '❌ **NEGATIVO** - Tu proyecto destruye valor y requiere revisión' if van_valor < 0 else '⚖️ **EQUILIBRIO** - Punto de break-even, decisión depende de factores no financieros'}

¿Te gustaría que profundice en algún aspecto específico de tu VAN?

[¿Qué significa este VAN?|¿Cómo mejorarlo?|¿Es rentable mi proyecto?]"""


class PreguntasSugeridas:
    """
    Sistema de preguntas sugeridas contextuales
    """

    @staticmethod
    def get_preguntas_por_tipo(analysis_type: str, results: dict = None) -> list:
        """Retorna preguntas sugeridas basadas en el tipo de análisis"""

        if analysis_type == 'van':
            return PreguntasSugeridas._preguntas_van(results)
        elif analysis_type == 'tir':
            return PreguntasSugeridas._preguntas_tir(results)
        elif analysis_type == 'wacc':
            return PreguntasSugeridas._preguntas_wacc(results)
        elif analysis_type == 'portafolio':
            return PreguntasSugeridas._preguntas_portafolio(results)
        else:
            return [
                "¿Puedes explicarme mejor?",
                "¿Qué factores considerar?",
                "¿Cómo aplicar esto?"
            ]

    @staticmethod
    def _preguntas_van(results: dict = None) -> list:
        """Preguntas sugeridas para análisis VAN"""
        van_valor = results.get('van', 0) if results else 0

        if van_valor > 0:
            return [
                "¿Cómo mejorar aún más este VAN?",
                "¿Es este VAN suficiente para el riesgo?",
                "¿Qué factores podrían reducir este VAN?",
                "¿Cómo hacer más robusto el proyecto?",
                "¿Cuándo es el mejor momento para invertir?"
            ]
        elif van_valor < 0:
            return [
                "¿Cómo hacer positivo el VAN?",
                "¿Qué cambios en los flujos de caja?",
                "¿Cómo reducir la inversión inicial?",
                "¿Es posible renegociar términos?",
                "¿Qué alternativas de inversión considerar?"
            ]
        else:
            return [
                "¿Qué factores no financieros considerar?",
                "¿Cómo hacer que el VAN sea positivo?",
                "¿Vale la pena por otros beneficios?",
                "¿Cómo afecta el timing de flujos?",
                "¿Qué riesgos podrían inclinar la balanza?"
            ]

    @staticmethod
    def _preguntas_tir(results: dict = None) -> list:
        """Preguntas sugeridas para análisis TIR"""
        tir_valor = results.get('tir', 0) if results else 0

        return [
            "¿Qué significa esta TIR en mi contexto?",
            "¿Cómo comparar con otras inversiones?",
            "¿Es buena esta tasa de retorno?",
            f"¿Cómo se compara con el WACC típico?",
            "¿Qué factores afectan la TIR?",
            "¿Cómo mejorar la TIR del proyecto?"
        ]

    @staticmethod
    def _preguntas_wacc(results: dict = None) -> list:
        """Preguntas sugeridas para análisis WACC"""
        wacc_valor = results.get('wacc', 0) if results else 0

        return [
            "¿Cómo usar este WACC en mis cálculos?",
            "¿Es alto o bajo este costo de capital?",
            "¿Cómo reducir mi WACC?",
            "¿Cómo afecta a la evaluación de proyectos?",
            "¿Qué estrategias de financiamiento considerar?",
            "¿Cómo optimizar la estructura de capital?"
        ]

    @staticmethod
    def _preguntas_portafolio(results: dict = None) -> list:
        """Preguntas sugeridas para análisis de portafolio"""
        sharpe = results.get('sharpe', 0) if results else 0

        if sharpe > 1:
            return [
                "¿Cómo mantener esta eficiencia?",
                "¿Cómo escalar este portafolio?",
                "¿Qué riesgos podrían afectar?",
                "¿Cómo diversificar aún más?",
                "¿Qué horizonte de inversión recomiendas?"
            ]
        elif sharpe > 0.5:
            return [
                "¿Cómo mejorar el Ratio Sharpe?",
                "¿Qué activos agregar al portafolio?",
                "¿Cómo reducir el riesgo?",
                "¿Qué rebalanceo sugerirías?",
                "¿Cómo optimizar la asignación?"
            ]
        else:
            return [
                "¿Cómo mejorar significativamente el portafolio?",
                "¿Qué activos eliminar o cambiar?",
                "¿Cómo aumentar el retorno esperado?",
                "¿Qué estrategias alternativas considerar?",
                "¿Necesito asesoría especializada?"
            ]
