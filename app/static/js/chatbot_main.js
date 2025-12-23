/**
 * Sistema Principal del Chatbot Econova - Versión Corregida
 * Gestión de conversaciones avanzadas con UX mejorada
 */

class ChatbotEconova {
    constructor(options = {}) {
        this.options = {
            apiUrl: options.apiUrl || '/api/v1/chatbot',
            avatarContainer: options.avatarContainer || 'chatbot-avatar',
            interfaceContainer: options.interfaceContainer || 'chatbot-page-container',
            messagesContainer: options.messagesContainer || 'chatbot-messages',
            inputElement: options.inputElement || 'chatbot-input',
            sendButton: options.sendButton || 'chatbot-send',
            maxMessages: options.maxMessages || 50,
            typingDelay: options.typingDelay || 800,
            enableAnimations: options.enableAnimations !== false,
            enableWordHighlighting: options.enableWordHighlighting !== false,
            enableExpandableMessages: options.enableExpandableMessages !== false,
            ...options
        };

        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        this.currentConversationId = null;
        this.messageHistory = [];
        this.contextAwareness = {
            lastTopic: null,
            conversationFlow: [],
            userPreferences: {}
        };

        // Referencias a elementos del DOM
        this.interface = null;
        this.messagesContainer = null;
        this.inputElement = null;
        this.sendButton = null;
        this.closeButton = null;
        this.suggestionsContainer = null;
        this.avatar = null;

        this.init();
    }

    init() {
        // Crear elementos si no existen
        this.createInterface();
        this.createAvatar();

        // Referencias a elementos
        this.interface = document.getElementById(this.options.interfaceContainer);
        if (this.interface) {
            this.messagesContainer = this.interface.querySelector('.chatbot-messages');
            this.inputElement = this.interface.querySelector('.chatbot-input');
            this.sendButton = this.interface.querySelector('.chatbot-send');
            this.closeButton = this.interface.querySelector('.chatbot-close');
            this.suggestionsContainer = this.interface.querySelector('.quick-suggestions');
        }

        // Configurar event listeners después de tener las referencias
        this.setupEventListeners();

        // Inicializar avatar si existe
        if (window.chatbotAvatar) {
            this.avatar = window.chatbotAvatar;
        }

        // Cargar historial y características avanzadas
        this.loadConversationHistory();
        this.initializeAdvancedFeatures();
        this.initializeWelcomeMessage();
    }

    createInterface() {
        console.log('🏗️ Verificando interface del chatbot...');

        const existingContainer = document.getElementById(this.options.interfaceContainer) ||
            document.querySelector('.chatbot-page-container');

        if (existingContainer) {
            console.log('✅ Interface ya existe en el DOM');
            return;
        }

        console.log('📦 Creando interface del chatbot...');

        const interfaceHTML = `
            <div id="${this.options.interfaceContainer}" class="chatbot-interface modern-chatbot" style="display: none;">
                <div class="chatbot-header enhanced-header">
                    <div class="chatbot-header-info">
                        <div class="chatbot-avatar-small">
                            <i class="fas fa-robot" style="color: white; font-size: 20px;"></i>
                        </div>
                        <div class="chatbot-header-text">
                            <h3>Asistente de Ingeniería Económica</h3>
                            <p>Análisis financiero y evaluación de proyectos</p>
                        </div>
                    </div>
                </div>

                <div class="chatbot-messages enhanced-messages">
                    <div class="message message-bot welcome-message">
                        <div class="message-avatar bot-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <div class="message-bubble bot-bubble">
                                <p>¡Hola! Soy tu asistente de Ingeniería Económica. Puedo ayudarte con cálculos de VAN, TIR, análisis de proyectos y conceptos financieros. ¿En qué puedo asistirte hoy?</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="chatbot-input-area enhanced-input-area">
                    <div class="input-container">
                        <div class="input-wrapper">
                            <textarea
                                class="chatbot-input modern-input"
                                placeholder="Escribe tu pregunta sobre ingeniería económica..."
                                rows="1"
                                maxlength="1000"
                            ></textarea>
                            <button class="chatbot-send modern-send" disabled>
                                <i class="fas fa-paper-plane"></i>
                                <span class="send-text">Enviar</span>
                            </button>
                        </div>
                        <div class="input-features">
                            <p class="input-hint">Presiona Enter para enviar • Shift + Enter para nueva línea</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', interfaceHTML);
        console.log('✅ Interface creada exitosamente');
    }

    createAvatar() {
        if (document.getElementById(this.options.avatarContainer)) {
            console.log('✅ Avatar ya existe');
            return;
        }

        console.log('📦 Creando avatar flotante...');

        const avatarHTML = `
            <div id="${this.options.avatarContainer}" class="floating-avatar enhanced-avatar" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                z-index: 999;
                transition: transform 0.3s ease;
            ">
                <i class="fas fa-robot" style="color: white; font-size: 24px;"></i>
                <div class="avatar-tooltip" style="
                    position: absolute;
                    bottom: 70px;
                    right: 0;
                    background: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                ">
                    <span>¿Necesitas ayuda financiera?</span>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', avatarHTML);
        console.log('✅ Avatar creado exitosamente');
    }

    initializeAdvancedFeatures() {
        if (this.options.enableAnimations) {
            this.initializeAnimations();
        }

        if (this.options.enableWordHighlighting) {
            this.initializeWordHighlighting();
        }

        if (this.options.enableExpandableMessages) {
            this.initializeExpandableMessages();
        }

        this.initializeThemeSystem();
    }

    initializeAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .fade-in {
                animation: fadeInUp 0.4s ease-out;
            }

            .typing-dot {
                width: 8px;
                height: 8px;
                background: #667eea;
                border-radius: 50%;
                display: inline-block;
                margin: 0 2px;
                animation: typing 1.4s infinite;
            }

            .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.5;
                }
                30% {
                    transform: translateY(-10px);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    initializeWordHighlighting() {
        this.financialTerms = {
            'VAN': 'highlight-van',
            'TIR': 'highlight-tir',
            'WACC': 'highlight-wacc',
            'ROI': 'highlight-roi',
            'NPV': 'highlight-npv',
            'IRR': 'highlight-irr',
            'flujo de caja': 'highlight-cashflow',
            'inversión inicial': 'highlight-investment',
            'tasa de descuento': 'highlight-discount'
        };
    }

    initializeExpandableMessages() {
        this.expandableThreshold = 300;
        this.expandedMessages = new Set();
    }

    initializeThemeSystem() {
        this.currentTheme = localStorage.getItem('chatbot-theme') || 'light';
        this.applyTheme(this.currentTheme);
    }

    initializeWelcomeMessage() {
        // Manejar mensaje contextual inicial si existe
        if (window.initialChatbotMessage) {
            const message = window.initialChatbotMessage;
            console.log('📤 Enviando mensaje contextual inicial');

            setTimeout(() => {
                this.addMessage('user', message);
                setTimeout(() => {
                    this.sendMessage();
                }, 500);
            }, 1000);

            delete window.initialChatbotMessage;
        }
    }

    setupEventListeners() {
        // Avatar click
        const avatarContainer = document.getElementById(this.options.avatarContainer);
        if (avatarContainer) {
            avatarContainer.addEventListener('click', () => {
                this.toggleInterface();
            });

            avatarContainer.addEventListener('mouseenter', () => {
                const tooltip = avatarContainer.querySelector('.avatar-tooltip');
                if (tooltip) {
                    tooltip.style.opacity = '1';
                    tooltip.style.visibility = 'visible';
                }
            });

            avatarContainer.addEventListener('mouseleave', () => {
                const tooltip = avatarContainer.querySelector('.avatar-tooltip');
                if (tooltip) {
                    tooltip.style.opacity = '0';
                    tooltip.style.visibility = 'hidden';
                }
            });
        }

        // Send button
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // Input events
        if (this.inputElement) {
            this.inputElement.addEventListener('input', () => {
                this.autoResizeTextarea();
                if (this.sendButton) {
                    this.sendButton.disabled = !this.inputElement.value.trim();
                }
            });

            this.inputElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (this.inputElement.value.trim() && this.sendButton && !this.sendButton.disabled) {
                        this.sendMessage();
                    }
                }
            });
        }

        // Sugerencias
        if (this.interface) {
            this.interface.addEventListener('click', (e) => {
                if (e.target.classList.contains('suggestion-btn')) {
                    const suggestion = e.target.dataset.suggestion;
                    if (suggestion && this.inputElement) {
                        this.inputElement.value = suggestion;
                        this.sendMessage();
                    }
                }
            });
        }
    }

    toggleInterface() {
        if (!this.isOpen) {
            this.openInterface();
        }
    }

    openInterface() {
        if (!this.interface) return;

        this.interface.style.display = 'flex';
        this.isOpen = true;

        setTimeout(() => {
            if (this.inputElement) {
                this.inputElement.focus();
            }
        }, 300);
    }

    async sendMessage() {
        if (!this.inputElement || this.isTyping) return;

        const message = this.inputElement.value.trim();
        if (!message) return;

        // Agregar mensaje del usuario
        this.addMessage('user', message);
        this.inputElement.value = '';

        if (this.sendButton) {
            this.sendButton.disabled = true;
        }

        // Actualizar contexto
        this.updateConversationContext(message);

        // Mostrar indicador de escritura
        this.showTypingIndicator();

        try {
            const response = await this.sendToAPI(message);

            this.hideTypingIndicator();

            if (response && response.response) {
                this.addMessage('bot', response.response, {
                    suggestions: this.extractSuggestions(response.response)
                });
            } else {
                this.addMessage('bot', 'Lo siento, no pude procesar tu consulta. ¿Puedes intentarlo de nuevo?');
            }

        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            this.hideTypingIndicator();
            this.addMessage('bot', 'Hubo un error al procesar tu mensaje. Por favor, inténtalo más tarde.');
        }
    }

    updateConversationContext(message) {
        this.contextAwareness.conversationFlow.push({
            type: 'user',
            content: message,
            timestamp: new Date()
        });

        const financialTerms = ['VAN', 'TIR', 'WACC', 'inversión', 'finanzas', 'análisis'];
        for (const term of financialTerms) {
            if (message.toLowerCase().includes(term.toLowerCase())) {
                this.contextAwareness.lastTopic = term;
                break;
            }
        }

        if (this.contextAwareness.conversationFlow.length > 10) {
            this.contextAwareness.conversationFlow = this.contextAwareness.conversationFlow.slice(-10);
        }
    }

    extractSuggestions(response) {
        const match = response.match(/\[([^\]]+)\]$/);
        if (match) {
            return match[1].split('|').map(q => q.trim());
        }
        return null;
    }

    async sendToAPI(message) {
        const requestData = {
            message: message,
            conversation_id: this.currentConversationId,
            timestamp: new Date().toISOString(),
            context_awareness: this.contextAwareness
        };

        if (window.currentAnalysisContext) {
            requestData.analysis_context = window.currentAnalysisContext;
        }

        const response = await fetch(this.options.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    addMessage(type, content, options = {}) {
        const messageData = {
            type: type,
            content: content,
            timestamp: new Date(),
            id: Date.now() + Math.random(),
            options: options
        };

        this.messages.push(messageData);

        if (this.messages.length > this.options.maxMessages) {
            this.messages = this.messages.slice(-this.options.maxMessages);
        }

        this.renderMessage(messageData);
        this.scrollToBottom();
    }

    renderMessage(messageData) {
        if (!this.messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message message-${messageData.type} fade-in`;
        messageElement.setAttribute('data-message-id', messageData.id);

        const timestamp = this.formatTime(messageData.timestamp);

        if (messageData.type === 'user') {
            messageElement.innerHTML = this.renderUserMessage(messageData, timestamp);
        } else {
            messageElement.innerHTML = this.renderBotMessage(messageData, timestamp);
        }

        this.messagesContainer.appendChild(messageElement);

        if (messageData.type === 'bot') {
            this.initializeMessageFeatures(messageElement);
        }
    }

    renderUserMessage(messageData, timestamp) {
        return `
            <div class="message-avatar user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble user-bubble">${this.formatMessage(messageData.content)}</div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;
    }

    renderBotMessage(messageData, timestamp) {
        const content = this.applyWordHighlighting(messageData.content);

        let suggestionsHTML = '';
        if (messageData.options && messageData.options.suggestions && messageData.options.suggestions.length > 0) {
            suggestionsHTML = `
                <div class="message-suggestions">
                    ${messageData.options.suggestions.map(suggestion => `
                        <button class="suggestion-btn" data-suggestion="${this.escapeHtml(suggestion)}">
                            ${this.escapeHtml(suggestion)}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        return `
            <div class="message-avatar bot-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble bot-bubble">${content}</div>
                ${suggestionsHTML}
                <div class="message-time">${timestamp}</div>
            </div>
        `;
    }

    initializeMessageFeatures(messageElement) {
        const suggestionBtns = messageElement.querySelectorAll('.suggestion-btn');
        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const suggestion = btn.dataset.suggestion;
                if (suggestion && this.inputElement) {
                    this.inputElement.value = suggestion;
                    this.sendMessage();
                }
            });
        });
    }

    showTypingIndicator() {
        if (!this.messagesContainer || this.isTyping) return;

        this.isTyping = true;

        const typingHTML = `
            <div class="typing-indicator" id="typing-indicator">
                <div class="message-avatar bot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        this.messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }

    applyWordHighlighting(content) {
        if (!this.options.enableWordHighlighting) return content;

        let highlightedContent = content;

        Object.entries(this.financialTerms).forEach(([term, className]) => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            highlightedContent = highlightedContent.replace(regex, `<span class="${className}">$&</span>`);
        });

        return highlightedContent;
    }

    formatMessage(content) {
        return content.replace(/\n/g, '<br>');
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        if (this.messagesContainer) {
            setTimeout(() => {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }, 100);
        }
    }

    autoResizeTextarea() {
        if (this.inputElement) {
            this.inputElement.style.height = 'auto';
            this.inputElement.style.height = Math.min(this.inputElement.scrollHeight, 120) + 'px';
        }
    }

    applyTheme(theme) {
        if (!this.interface) return;

        if (theme === 'dark') {
            this.interface.classList.add('theme-dark');
        } else {
            this.interface.classList.remove('theme-dark');
        }
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('econova_chat_history');
            if (saved) {
                const history = JSON.parse(saved);
                this.messages = history.messages || [];
                this.currentConversationId = history.conversationId;
                this.contextAwareness = history.contextAwareness || this.contextAwareness;

                this.messages.forEach(msg => {
                    this.renderMessage(msg);
                });
            }
        } catch (error) {
            console.warn('Error al cargar historial:', error);
        }
    }

    saveConversationHistory() {
        try {
            const history = {
                messages: this.messages,
                conversationId: this.currentConversationId,
                contextAwareness: this.contextAwareness,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('econova_chat_history', JSON.stringify(history));
        } catch (error) {
            console.warn('Error al guardar historial:', error);
        }
    }

    sendMessageProgrammatically(message) {
        if (this.inputElement) {
            this.inputElement.value = message;
            this.sendMessage();
        }
    }

    destroy() {
        this.saveConversationHistory();
    }
}

// Inicialización global
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎯 Iniciando chatbot Econova...');

    try {
        window.econovaChatbot = new ChatbotEconova({
            apiUrl: '/api/v1/chatbot',
            avatarContainer: 'chatbot-avatar',
            interfaceContainer: 'chatbot-page-container',
            enableAnimations: true,
            enableWordHighlighting: true,
            enableExpandableMessages: true
        });
        console.log('✅ Chatbot inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar chatbot:', error);
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotEconova;
}