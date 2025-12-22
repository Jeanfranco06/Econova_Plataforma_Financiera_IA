/**
 * Sistema de Bienvenida del Chatbot Econova
 * Animaciones y mensajes de bienvenida interactivos
 */

class ChatbotWelcome {
    constructor(chatbot) {
        this.chatbot = chatbot;
        this.welcomeShown = false;
        this.typingSpeed = 50;
        this.messageDelay = 1000;

        this.welcomeMessages = [
            {
                text: "¡Hola! Soy Econova 🤖",
                delay: 500,
                emotion: 'happy'
            },
            {
                text: "Tu asistente financiero inteligente especializado en análisis y simulaciones económicas.",
                delay: 800,
                emotion: 'neutral'
            },
            {
                text: "Puedo ayudarte con:",
                delay: 600,
                emotion: 'excited',
                actions: [
                    { text: "📊 Cálculos Financieros (VAN, TIR, WACC)", action: 'show_financial' },
                    { text: "💰 Planes de Ahorro e Inversión", action: 'show_savings' },
                    { text: "🏦 Análisis de Préstamos", action: 'show_loans' },
                    { text: "📈 Machine Learning Financiero", action: 'show_ml' }
                ]
            },
            {
                text: "¿Qué te gustaría explorar hoy?",
                delay: 500,
                emotion: 'thinking'
            }
        ];

        this.init();
    }

    init() {
        // Escuchar cuando el chatbot se abre
        document.addEventListener('chatbotOpened', () => {
            this.showWelcomeSequence();
        });

        // Escuchar clics en acciones
        document.addEventListener('welcomeActionClicked', (event) => {
            this.handleWelcomeAction(event.detail);
        });
    }

    async showWelcomeSequence() {
        if (this.welcomeShown) return;

        this.welcomeShown = true;

        for (let i = 0; i < this.welcomeMessages.length; i++) {
            const message = this.welcomeMessages[i];
            await this.delay(message.delay);
            await this.showWelcomeMessage(message, i);
        }

        // Mostrar opciones rápidas después de la bienvenida
        await this.delay(1000);
        this.showQuickOptions();
    }

    async showWelcomeMessage(message, index) {
        return new Promise((resolve) => {
            // Crear mensaje con animación de escritura
            const messageData = {
                type: 'bot',
                content: '',
                timestamp: new Date(),
                id: `welcome-${index}`
            };

            // Agregar mensaje vacío primero
            this.chatbot.addMessage(messageData.type, messageData.content, messageData.timestamp);

            // Animar texto
            let charIndex = 0;
            const typeInterval = setInterval(() => {
                if (charIndex < message.text.length) {
                    messageData.content += message.text[charIndex];
                    this.updateMessageContent(messageData.id, messageData.content);
                    charIndex++;
                } else {
                    clearInterval(typeInterval);

                    // Mostrar acciones si existen
                    if (message.actions) {
                        this.showMessageActions(messageData.id, message.actions);
                    }

                    // Cambiar emoción del avatar
                    if (this.chatbot.avatar && message.emotion) {
                        this.chatbot.avatar.setEmotion(message.emotion);
                    }

                    resolve();
                }
            }, this.typingSpeed);
        });
    }

    updateMessageContent(messageId, content) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const contentElement = messageElement.querySelector('.message-content');
            if (contentElement) {
                contentElement.innerHTML = this.formatMessageContent(content);
            }
        }
    }

    formatMessageContent(content) {
        // Convertir URLs en enlaces
        content = content.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // Convertir emojis y símbolos
        content = content.replace(/🤖/g, '<span class="emoji">🤖</span>');
        content = content.replace(/📊/g, '<span class="emoji">📊</span>');
        content = content.replace(/💰/g, '<span class="emoji">💰</span>');
        content = content.replace(/🏦/g, '<span class="emoji">🏦</span>');
        content = content.replace(/📈/g, '<span class="emoji">📈</span>');

        return content;
    }

    showMessageActions(messageId, actions) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;

        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'welcome-actions';
        actionsContainer.style.cssText = `
            margin-top: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;

        actions.forEach(action => {
            const actionButton = document.createElement('button');
            actionButton.className = 'welcome-action-btn';
            actionButton.innerHTML = action.text;
            actionButton.style.cssText = `
                padding: 8px 12px;
                border: 1px solid var(--color-primary, #00ffff);
                border-radius: 20px;
                background: transparent;
                color: var(--color-primary, #00ffff);
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
                text-align: left;
            `;

            actionButton.addEventListener('mouseenter', () => {
                actionButton.style.background = 'var(--color-primary, #00ffff)';
                actionButton.style.color = '#000';
            });

            actionButton.addEventListener('mouseleave', () => {
                actionButton.style.background = 'transparent';
                actionButton.style.color = 'var(--color-primary, #00ffff)';
            });

            actionButton.addEventListener('click', () => {
                this.handleActionClick(action.action, actionButton);
            });

            actionsContainer.appendChild(actionButton);
        });

        const contentElement = messageElement.querySelector('.message-content');
        contentElement.appendChild(actionsContainer);
    }

    handleActionClick(action, button) {
        // Deshabilitar botón
        button.disabled = true;
        button.style.opacity = '0.6';

        // Disparar evento
        const event = new CustomEvent('welcomeActionClicked', {
            detail: { action: action, button: button }
        });
        document.dispatchEvent(event);

        // Animación de selección
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
    }

    handleWelcomeAction(detail) {
        const { action } = detail;

        switch (action) {
            case 'show_financial':
                this.showFinancialOptions();
                break;
            case 'show_savings':
                this.showSavingsOptions();
                break;
            case 'show_loans':
                this.showLoansOptions();
                break;
            case 'show_ml':
                this.showMLOptions();
                break;
            default:
                this.showDefaultResponse();
        }
    }

    showFinancialOptions() {
        const options = [
            { text: "📊 Calcular VAN (Valor Actual Neto)", command: "van" },
            { text: "📈 Calcular TIR (Tasa Interna de Retorno)", command: "tir" },
            { text: "💼 Calcular WACC (Costo del Capital)", command: "wacc" },
            { text: "📊 Analizar Portafolio de Inversión", command: "portafolio" }
        ];

        this.showOptionsResponse("Herramientas Financieras Disponibles:", options);
    }

    showSavingsOptions() {
        const options = [
            { text: "💰 Calcular Interés Compuesto", command: "interes_compuesto" },
            { text: "📅 Plan de Ahorro Personalizado", command: "plan_ahorro" },
            { text: "🎯 Metas de Ahorro", command: "metas_ahorro" },
            { text: "📈 Proyección de Patrimonio", command: "proyeccion_patrimonio" }
        ];

        this.showOptionsResponse("Opciones de Ahorro e Inversión:", options);
    }

    showLoansOptions() {
        const options = [
            { text: "🏦 Calcular Cuota de Préstamo", command: "cuota_prestamo" },
            { text: "📊 Análisis de Capacidad de Pago", command: "capacidad_pago" },
            { text: "💡 Recomendaciones de Préstamos", command: "recomendaciones_prestamo" },
            { text: "📉 Comparador de Préstamos", command: "comparador_prestamos" }
        ];

        this.showOptionsResponse("Herramientas de Préstamos:", options);
    }

    showMLOptions() {
        const options = [
            { text: "🔮 Predicción de Ventas", command: "prediccion_ventas" },
            { text: "📊 Análisis de Tendencias", command: "analisis_tendencias" },
            { text: "🎯 Clasificación de Riesgo Crediticio", command: "riesgo_crediticio" },
            { text: "💡 Recomendaciones de Inversión", command: "recomendaciones_inversion" }
        ];

        this.showOptionsResponse("Inteligencia Artificial Financiera:", options);
    }

    showOptionsResponse(title, options) {
        let response = `¡Excelente elección! ${title}\n\n`;

        options.forEach((option, index) => {
            response += `${index + 1}. ${option.text}\n`;
        });

        response += `\n¿Cuál te gustaría usar? Solo dime el número o el nombre de la opción.`;

        this.chatbot.addMessage('bot', response);

        // Guardar opciones para referencia futura
        this.lastOptions = options;
    }

    showDefaultResponse() {
        const responses = [
            "¡Perfecto! Estoy aquí para ayudarte con cualquier consulta financiera.",
            "¡Genial! ¿Qué aspecto financiero te gustaría explorar?",
            "¡Excelente! Tengo muchas herramientas para ayudarte con tus finanzas.",
            "¡Fantástico! ¿En qué puedo asistirte hoy?"
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.chatbot.addMessage('bot', randomResponse);
    }

    showQuickOptions() {
        // Mostrar botones de acceso rápido
        const quickOptions = document.createElement('div');
        quickOptions.className = 'quick-options';
        quickOptions.style.cssText = `
            margin-top: 16px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        `;

        const options = [
            { text: '📊 VAN/TIR', action: 'show_financial' },
            { text: '💰 Ahorro', action: 'show_savings' },
            { text: '🏦 Préstamos', action: 'show_loans' },
            { text: '🤖 IA', action: 'show_ml' }
        ];

        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'quick-option-btn';
            button.textContent = option.text;
            button.style.cssText = `
                padding: 6px 12px;
                border: 1px solid var(--color-primary, #00ffff);
                border-radius: 15px;
                background: transparent;
                color: var(--color-primary, #00ffff);
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            `;

            button.addEventListener('click', () => {
                this.handleActionClick(option.action, button);
            });

            quickOptions.appendChild(button);
        });

        // Agregar al último mensaje del bot
        const lastBotMessage = document.querySelector('.message-bot:last-child .message-content');
        if (lastBotMessage) {
            lastBotMessage.appendChild(quickOptions);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reset() {
        this.welcomeShown = false;
    }

    // API pública
    forceShowWelcome() {
        this.welcomeShown = false;
        this.showWelcomeSequence();
    }

    setTypingSpeed(speed) {
        this.typingSpeed = speed;
    }

    setMessageDelay(delay) {
        this.messageDelay = delay;
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    if (window.econovaChatbot) {
        window.chatbotWelcome = new ChatbotWelcome(window.econovaChatbot);
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotWelcome;
}
