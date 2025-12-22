/**
 * Sistema Principal del Chatbot Econova
 * Gestión de conversaciones y estados
 */

class ChatbotEconova {
    constructor(options = {}) {
        this.options = {
            apiUrl: options.apiUrl || '/api/v1/chatbot',
            avatarContainer: options.avatarContainer || 'chatbot-avatar',
            interfaceContainer: options.interfaceContainer || 'chatbot-interface',
            maxMessages: options.maxMessages || 50,
            typingDelay: options.typingDelay || 1000,
            ...options
        };

        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        this.currentConversationId = null;

        this.init();
        this.setupEventListeners();
        this.loadConversationHistory();
    }

    init() {
        // Crear elementos si no existen
        this.createInterface();
        this.createAvatar();

        // Referencias a elementos
        this.interface = document.getElementById(this.options.interfaceContainer);
        this.messagesContainer = this.interface.querySelector('.chatbot-messages');
        this.inputElement = this.interface.querySelector('.chatbot-input');
        this.sendButton = this.interface.querySelector('.chatbot-send');
        this.closeButton = this.interface.querySelector('.chatbot-close');

        // Inicializar avatar si existe
        if (window.chatbotAvatar) {
            this.avatar = window.chatbotAvatar;
        }
    }

    createInterface() {
        if (document.getElementById(this.options.interfaceContainer)) {
            return; // Ya existe
        }

        const interfaceHTML = `
            <div id="${this.options.interfaceContainer}" class="chatbot-interface" style="display: none;">
                <div class="chatbot-header">
                    <div class="chatbot-header-info">
                        <div class="chatbot-avatar-small">🤖</div>
                        <div class="chatbot-header-text">
                            <h3>Econova AI</h3>
                            <p>Asistente Financiero</p>
                        </div>
                    </div>
                    <button class="chatbot-close">&times;</button>
                </div>

                <div class="chatbot-messages">
                    <div class="message message-bot">
                        <div class="message-avatar">🤖</div>
                        <div class="message-content">
                            ¡Hola! Soy Econova, tu asistente financiero inteligente.
                            ¿En qué puedo ayudarte hoy?
                        </div>
                    </div>
                </div>

                <div class="chatbot-input-area">
                    <div class="chatbot-input-container">
                        <textarea
                            class="chatbot-input"
                            placeholder="Escribe tu consulta financiera..."
                            rows="1"
                        ></textarea>
                        <button class="chatbot-send">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', interfaceHTML);
    }

    createAvatar() {
        if (document.getElementById(this.options.avatarContainer)) {
            return; // Ya existe
        }

        const avatarHTML = `
            <div id="${this.options.avatarContainer}" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 999;
                cursor: pointer;
            ">
                <!-- El avatar se crea con JavaScript -->
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', avatarHTML);

        // Inicializar avatar animado
        if (window.createChatbotAvatar) {
            this.avatar = window.createChatbotAvatar(this.options.avatarContainer, {
                size: 80,
                primaryColor: '#00ffff',
                secondaryColor: '#ff6b6b'
            });
        }
    }

    setupEventListeners() {
        // Avatar click
        if (this.avatar && this.avatar.avatarContainer) {
            this.avatar.avatarContainer.addEventListener('click', () => {
                this.toggleInterface();
            });
        }

        // Close button
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.closeInterface();
            });
        }

        // Send button
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // Input enter key
        if (this.inputElement) {
            this.inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Auto-resize textarea
            this.inputElement.addEventListener('input', () => {
                this.autoResizeTextarea();
            });
        }

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.isOpen &&
                !this.interface.contains(e.target) &&
                (!this.avatar || !this.avatar.avatarContainer.contains(e.target))) {
                this.closeInterface();
            }
        });
    }

    toggleInterface() {
        if (this.isOpen) {
            this.closeInterface();
        } else {
            this.openInterface();
        }
    }

    openInterface() {
        if (this.interface) {
            this.interface.style.display = 'flex';
            this.interface.classList.add('entering');
            this.isOpen = true;

            // Focus en input
            setTimeout(() => {
                if (this.inputElement) {
                    this.inputElement.focus();
                }
            }, 300);

            // Evento personalizado
            this.dispatchEvent('chatbotOpened');
        }
    }

    closeInterface() {
        if (this.interface) {
            this.interface.classList.remove('entering');
            setTimeout(() => {
                this.interface.style.display = 'none';
            }, 300);
            this.isOpen = false;

            // Evento personalizado
            this.dispatchEvent('chatbotClosed');
        }
    }

    async sendMessage() {
        if (!this.inputElement || this.isTyping) return;

        const message = this.inputElement.value.trim();
        if (!message) return;

        // Agregar mensaje del usuario
        this.addMessage('user', message);
        this.inputElement.value = '';

        // Mostrar estado de escritura
        this.showTypingIndicator();

        try {
            // Enviar a API
            const response = await this.sendToAPI(message);

            // Ocultar indicador de escritura
            this.hideTypingIndicator();

            // Agregar respuesta del bot
            if (response && response.message) {
                this.addMessage('bot', response.message);
            } else {
                this.addMessage('bot', 'Lo siento, no pude procesar tu consulta. ¿Puedes intentarlo de nuevo?');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessage('bot', 'Hubo un error al procesar tu mensaje. Por favor, inténtalo más tarde.');
        }
    }

    async sendToAPI(message) {
        try {
            const response = await fetch(this.options.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: this.currentConversationId,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    addMessage(type, content, timestamp = null) {
        const messageData = {
            type: type,
            content: content,
            timestamp: timestamp || new Date(),
            id: Date.now() + Math.random()
        };

        this.messages.push(messageData);

        // Limitar número de mensajes
        if (this.messages.length > this.options.maxMessages) {
            this.messages = this.messages.slice(-this.options.maxMessages);
        }

        this.renderMessage(messageData);
        this.scrollToBottom();

        // Evento personalizado
        this.dispatchEvent('messageAdded', messageData);
    }

    renderMessage(messageData) {
        if (!this.messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message message-${messageData.type}`;
        messageElement.setAttribute('data-message-id', messageData.id);

        const avatarEmoji = messageData.type === 'bot' ? '🤖' : '👤';

        messageElement.innerHTML = `
            <div class="message-avatar">${avatarEmoji}</div>
            <div class="message-content">${this.formatMessage(messageData.content)}</div>
            <div class="message-time">${this.formatTime(messageData.timestamp)}</div>
        `;

        this.messagesContainer.appendChild(messageElement);
    }

    formatMessage(content) {
        // Convertir saltos de línea
        return content.replace(/\n/g, '<br>');
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    showTypingIndicator() {
        if (this.isTyping) return;

        this.isTyping = true;
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-bot message-typing';
        typingElement.id = 'typing-indicator';

        typingElement.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <span>Econova está escribiendo</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
        this.isTyping = false;
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
            this.inputElement.style.height = Math.min(this.inputElement.scrollHeight, 80) + 'px';
        }
    }

    loadConversationHistory() {
        // Cargar historial desde localStorage
        try {
            const saved = localStorage.getItem('econova_chat_history');
            if (saved) {
                const history = JSON.parse(saved);
                this.messages = history.messages || [];
                this.currentConversationId = history.conversationId;

                // Renderizar mensajes guardados
                this.messages.forEach(msg => {
                    this.renderMessage(msg);
                });
            }
        } catch (error) {
            console.warn('Error loading conversation history:', error);
        }
    }

    saveConversationHistory() {
        try {
            const history = {
                messages: this.messages,
                conversationId: this.currentConversationId,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('econova_chat_history', JSON.stringify(history));
        } catch (error) {
            console.warn('Error saving conversation history:', error);
        }
    }

    clearConversation() {
        this.messages = [];
        this.currentConversationId = null;

        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }

        localStorage.removeItem('econova_chat_history');

        // Agregar mensaje de bienvenida
        this.addMessage('bot', '¡Hola! Soy Econova, tu asistente financiero inteligente. ¿En qué puedo ayudarte hoy?');
    }

    dispatchEvent(eventName, detail = null) {
        const event = new CustomEvent(`chatbot${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`, {
            detail: detail
        });
        document.dispatchEvent(event);
    }

    // API pública
    sendMessageProgrammatically(message) {
        if (this.inputElement) {
            this.inputElement.value = message;
            this.sendMessage();
        }
    }

    setEmotion(emotion) {
        if (this.avatar && this.avatar.setEmotion) {
            this.avatar.setEmotion(emotion);
        }
    }

    destroy() {
        this.closeInterface();
        this.saveConversationHistory();

        if (this.avatar && this.avatar.dispose) {
            this.avatar.dispose();
        }
    }
}

// Inicialización global
document.addEventListener('DOMContentLoaded', function() {
    // Crear instancia global del chatbot
    window.econovaChatbot = new ChatbotEconova({
        apiUrl: '/api/v1/chatbot',
        avatarContainer: 'chatbot-avatar',
        interfaceContainer: 'chatbot-interface'
    });
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotEconova;
}
