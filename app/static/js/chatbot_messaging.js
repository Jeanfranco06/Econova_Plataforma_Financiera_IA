/**
 * Sistema de Mensajería del Chatbot Econova
 * Gestión avanzada de mensajes y respuestas
 */

class ChatbotMessaging {
    constructor(chatbot) {
        this.chatbot = chatbot;
        this.messageQueue = [];
        this.isProcessing = false;
        this.typingDelay = 1500;
        this.responseDelay = 500;

        this.init();
    }

    init() {
        // Escuchar eventos del chatbot
        document.addEventListener('chatbotMessageAdded', (event) => {
            this.onMessageAdded(event.detail);
        });

        document.addEventListener('chatbotOpened', () => {
            this.onChatbotOpened();
        });

        document.addEventListener('chatbotClosed', () => {
            this.onChatbotClosed();
        });
    }

    async sendMessage(message, options = {}) {
        if (this.isProcessing) return;

        this.isProcessing = true;

        try {
            // Agregar mensaje del usuario
            this.chatbot.addMessage('user', message);

            // Mostrar indicador de escritura
            this.chatbot.showTypingIndicator();

            // Simular delay de procesamiento
            await this.delay(this.typingDelay);

            // Generar respuesta
            const response = await this.generateResponse(message, options);

            // Ocultar indicador
            this.chatbot.hideTypingIndicator();

            // Simular delay de respuesta
            await this.delay(this.responseDelay);

            // Agregar respuesta del bot
            this.chatbot.addMessage('bot', response.text, response.timestamp);

            // Ejecutar acciones adicionales si las hay
            if (response.actions) {
                this.executeActions(response.actions);
            }

            // Actualizar avatar según el tipo de respuesta
            this.updateAvatarEmotion(response.emotion);

        } catch (error) {
            console.error('Error sending message:', error);
            this.chatbot.hideTypingIndicator();
            this.chatbot.addMessage('bot', 'Lo siento, ocurrió un error. Por favor, inténtalo de nuevo.');
        } finally {
            this.isProcessing = false;
        }
    }

    async generateResponse(message, options) {
        // Detectar intención del mensaje
        const intent = this.detectIntent(message);

        // Generar respuesta basada en intención
        let response = {
            text: '',
            emotion: 'neutral',
            actions: [],
            timestamp: new Date()
        };

        switch (intent) {
            case 'saludo':
                response.text = this.getRandomResponse([
                    '¡Hola! ¿En qué puedo ayudarte hoy?',
                    '¡Hola! Soy Econova, tu asistente financiero.',
                    '¡Hola! ¿Listo para hablar de finanzas?'
                ]);
                response.emotion = 'happy';
                break;

            case 'despedida':
                response.text = this.getRandomResponse([
                    '¡Hasta luego! Que tengas un excelente día.',
                    '¡Adiós! No dudes en volver cuando necesites ayuda.',
                    '¡Hasta pronto! Recuerda que estoy aquí para ayudarte.'
                ]);
                response.emotion = 'happy';
                response.actions.push({ type: 'close_chat', delay: 2000 });
                break;

            case 'agradecimiento':
                response.text = this.getRandomResponse([
                    '¡De nada! Estoy aquí para ayudarte.',
                    '¡Es un placer ayudarte!',
                    '¡Me alegra haber podido ayudarte!'
                ]);
                response.emotion = 'happy';
                break;

            case 'van':
                response.text = `El VAN (Valor Actual Neto) es una herramienta fundamental en finanzas. Calcula el valor presente de los flujos de efectivo futuros descontados a una tasa determinada.

¿Te gustaría que te ayude a calcular el VAN de un proyecto? Solo necesito:
• Los flujos de efectivo (inversión inicial negativa, ingresos positivos)
• La tasa de descuento apropiada`;
                response.emotion = 'thinking';
                break;

            case 'tir':
                response.text = `La TIR (Tasa Interna de Retorno) es la tasa de descuento que hace que el VAN sea cero. Es excelente para comparar la rentabilidad de diferentes inversiones.

Para calcular la TIR necesito los flujos de efectivo del proyecto. ¿Los tienes disponibles?`;
                response.emotion = 'thinking';
                break;

            case 'prestamo':
                response.text = `¡Claro! Puedo ayudarte con análisis de préstamos. Para darte la mejor recomendación, necesito saber:

• Monto que necesitas
• Plazo deseado
• Tus ingresos mensuales
• Tus gastos mensuales
• Tu score crediticio (si lo sabes)

¿Empezamos con el análisis?`;
                response.emotion = 'excited';
                break;

            case 'ahorro':
                response.text = `¡Excelente tema! El ahorro inteligente es clave para construir patrimonio. Puedo ayudarte a:

• Crear un plan de ahorro personalizado
• Recomendar inversiones según tu perfil de riesgo
• Calcular el interés compuesto
• Analizar tu capacidad de ahorro

¿Cuál de estos temas te interesa más?`;
                response.emotion = 'happy';
                break;

            case 'simulacion':
                response.text = `¡Perfecto! Tengo varias simulaciones disponibles:

1. **VAN y TIR** - Evaluación de proyectos de inversión
2. **WACC** - Costo de capital de la empresa
3. **Préstamos** - Análisis de capacidad de pago
4. **Portafolio** - Optimización de inversiones
5. **Ahorro** - Proyección de crecimiento patrimonial

¿Cuál te gustaría simular?`;
                response.emotion = 'excited';
                break;

            case 'ayuda':
                response.text = `¡Estoy aquí para ayudarte! Puedo asistirte con:

**📊 Cálculos Financieros:**
• VAN (Valor Actual Neto)
• TIR (Tasa Interna de Retorno)
• WACC (Costo Promedio del Capital)
• Análisis de portafolio

**💰 Servicios Financieros:**
• Análisis de préstamos
• Planes de ahorro e inversión
• Recomendaciones personalizadas
• Simulaciones financieras

**🤖 Funcionalidades:**
• Registro y perfil de usuario
• Dashboard personalizado
• Historial de simulaciones
• Sistema de gamificación

¿En qué puedo ayudarte específicamente?`;
                response.emotion = 'happy';
                break;

            case 'error':
                response.text = `Disculpa, no entendí bien tu consulta. ¿Podrías reformularla o ser más específico?

Por ejemplo:
• "¿Cómo calcular el VAN?"
• "¿Qué es la TIR?"
• "Quiero simular un préstamo"
• "Ayuda con inversiones"`;
                response.emotion = 'thinking';
                break;

            default:
                // Respuesta general con detección de contexto
                response.text = this.generateContextualResponse(message);
                response.emotion = 'neutral';
        }

        return response;
    }

    detectIntent(message) {
        const text = message.toLowerCase().trim();

        // Patrones de intención
        const patterns = {
            saludo: /\b(hola|buenos|buenas|saludos|hey|hi|hello|qué tal|como estás)\b/,
            despedida: /\b(adios|adiós|chau|chao|hasta|bye|nos vemos|bye bye)\b/,
            agradecimiento: /\b(gracias|thank|thanks|agradecido|mil gracias)\b/,
            van: /\b(van|valor actual|valor actual neto|vpn|valor presente)\b/,
            tir: /\b(tir|tasa interna|tasa interna de retorno|tir financiera)\b/,
            prestamo: /\b(prestamo|préstamo|credito|crédito|financiamiento|prestamo)\b/,
            ahorro: /\b(ahorro|ahorrar|inversion|inversión|invertir|fondos)\b/,
            simulacion: /\b(simulacion|simulación|simular|calcular|calculo|cálculo)\b/,
            ayuda: /\b(ayuda|help|ayudame|ayúdame|como|cómo|que|qué)\b.*\?/
        };

        for (const [intent, pattern] of Object.entries(patterns)) {
            if (pattern.test(text)) {
                return intent;
            }
        }

        // Verificar si contiene números (posible cálculo)
        if (/\d/.test(text)) {
            return 'calculo';
        }

        // Verificar si es pregunta
        if (text.includes('?') || text.startsWith('como') || text.startsWith('qué') ||
            text.startsWith('cuando') || text.startsWith('donde') || text.startsWith('por qué')) {
            return 'pregunta';
        }

        return 'general';
    }

    generateContextualResponse(message) {
        const text = message.toLowerCase();

        // Respuestas contextuales
        if (text.includes('dinero') || text.includes('plata')) {
            return '¡El dinero es una herramienta poderosa! ¿Quieres aprender sobre inversiones, ahorro o análisis financiero? Puedo ayudarte con todo eso.';
        }

        if (text.includes('interes') || text.includes('interés')) {
            return 'Los intereses son fundamentales en finanzas. ¿Quieres calcular intereses simples, compuestos, o necesitas ayuda con algún cálculo específico?';
        }

        if (text.includes('riesgo')) {
            return 'El riesgo es parte fundamental de las inversiones. Puedo ayudarte a evaluar tu tolerancia al riesgo y recomendar inversiones apropiadas para tu perfil.';
        }

        if (text.includes('banco') || text.includes('financiero')) {
            return 'Los temas financieros son mi especialidad. ¿Necesitas ayuda con préstamos, inversiones, análisis de proyectos o algún otro tema financiero?';
        }

        // Respuesta por defecto
        const defaultResponses = [
            'Entiendo tu consulta. ¿Podrías darme más detalles sobre lo que necesitas?',
            '¡Claro! Puedo ayudarte con eso. ¿Quieres que te explique algún concepto financiero específico?',
            'Estoy aquí para ayudarte con temas financieros. ¿Qué aspecto te interesa más?',
            '¡Perfecto! Tengo herramientas para ayudarte con análisis financieros. ¿Qué te gustaría calcular o simular?'
        ];

        return this.getRandomResponse(defaultResponses);
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    executeActions(actions) {
        actions.forEach(action => {
            setTimeout(() => {
                switch (action.type) {
                    case 'close_chat':
                        this.chatbot.closeInterface();
                        break;
                    case 'show_suggestions':
                        this.showSuggestions(action.suggestions);
                        break;
                    case 'redirect':
                        if (action.url) {
                            window.location.href = action.url;
                        }
                        break;
                    case 'scroll_to':
                        if (action.element) {
                            document.querySelector(action.element)?.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                }
            }, action.delay || 0);
        });
    }

    updateAvatarEmotion(emotion) {
        if (this.chatbot.avatar && this.chatbot.avatar.setEmotion) {
            this.chatbot.avatar.setEmotion(emotion);
        }
    }

    showSuggestions(suggestions) {
        // Mostrar sugerencias rápidas
        const suggestionsHtml = suggestions.map(suggestion =>
            `<button class="suggestion-btn" onclick="window.econovaChatbot.sendMessageProgrammatically('${suggestion}')">${suggestion}</button>`
        ).join('');

        // Agregar al DOM (implementación simplificada)
        console.log('Sugerencias:', suggestions);
    }

    onMessageAdded(messageData) {
        // Procesar mensaje agregado
        if (messageData.type === 'user') {
            // El usuario envió un mensaje
            this.updateAvatarEmotion('thinking');
        } else if (messageData.type === 'bot') {
            // El bot respondió
            this.updateAvatarEmotion('happy');
        }
    }

    onChatbotOpened() {
        // Chatbot abierto
        this.updateAvatarEmotion('excited');

        // Mensaje de bienvenida si es primera vez
        if (!this.chatbot.messages || this.chatbot.messages.length === 0) {
            setTimeout(() => {
                this.chatbot.addMessage('bot', '¡Hola! Soy Econova, tu asistente financiero inteligente. ¿En qué puedo ayudarte hoy?');
            }, 500);
        }
    }

    onChatbotClosed() {
        // Chatbot cerrado
        this.updateAvatarEmotion('neutral');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // API pública
    sendQuickMessage(message) {
        this.sendMessage(message, { quick: true });
    }

    setTypingDelay(delay) {
        this.typingDelay = delay;
    }

    setResponseDelay(delay) {
        this.responseDelay = delay;
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    if (window.econovaChatbot) {
        window.chatbotMessaging = new ChatbotMessaging(window.econovaChatbot);
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotMessaging;
}
