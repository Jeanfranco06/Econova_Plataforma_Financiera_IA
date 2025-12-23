/**
 * Sistema Core del Chatbot Econova - Arquitectura Modular Mejorada
 * Versión 2.0 - Sistema completo y profesional
 */

class ChatbotCore {
    constructor(config = {}) {
        this.config = {
            apiUrl: config.apiUrl || '/api/v1/chatbot',
            maxMessages: config.maxMessages || 100,
            enableCache: config.enableCache !== false,
            enableMemory: config.enableMemory !== false,
            enableVoice: config.enableVoice !== false,
            enableAnalytics: config.enableAnalytics !== false,
            ...config
        };
        
        this.state = {
            isOpen: false,
            messages: [],
            currentConversationId: null,
            typing: false,
            error: null,
            connectionStatus: 'connected'
        };
        
        this.modules = {
            messaging: null,
            ui: null,
            memory: null,
            analytics: null,
            voice: null
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Inicializando ChatbotCore...');
        this.loadModules();
        this.setupEventListeners();
        this.loadConversationHistory();
        this.setupPeriodicSave();
    }
    
    loadModules() {
        // Cargar módulos de forma lazy
        this.modules.messaging = new MessagingModule(this);
        this.modules.ui = new UIModule(this);
        this.modules.memory = new MemoryModule(this);
        this.modules.analytics = new AnalyticsModule(this);
        
        if (this.config.enableVoice && this.isVoiceAvailable()) {
            this.modules.voice = new VoiceModule(this);
        }
    }
    
    isVoiceAvailable() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }
    
    setupEventListeners() {
        // Escuchar eventos globales
        document.addEventListener('financialCalculationCompleted', (e) => {
            this.handleFinancialEvent(e.detail);
        });
        
        // Escuchar cambios de tema
        document.addEventListener('themeChanged', (e) => {
            this.modules.ui?.updateTheme(e.detail.theme);
        });
    }
    
    setupPeriodicSave() {
        // Guardar conversación cada 30 segundos
        setInterval(() => {
            if (this.state.messages.length > 0) {
                this.modules.memory?.saveConversation(this.state);
            }
        }, 30000);
    }
    
    handleFinancialEvent(detail) {
        const { type, result } = detail;
        
        // Actualizar contexto de análisis
        if (window.currentAnalysisContext) {
            window.currentAnalysisContext.tipo_analisis = type;
            window.currentAnalysisContext.resultados = result;
        } else {
            window.currentAnalysisContext = {
                tipo_analisis: type,
                resultados: result
            };
        }
        
        // Mostrar notificación si el chatbot está abierto
        if (this.state.isOpen) {
            this.modules.ui?.showNotification({
                type: 'success',
                message: `Análisis de ${type.toUpperCase()} completado`,
                icon: '📊'
            });
        }
    }
    
    // API pública unificada
    async sendMessage(message) {
        try {
            this.setState({ typing: true, error: null });
            
            const response = await this.modules.messaging.send(message);
            
            this.addMessage('user', message);
            this.addMessage('bot', response.text, {
                metadata: response.metadata,
                suggestions: response.suggestions
            });
            
            // Guardar en memoria
            this.modules.memory?.save(message, response);
            
            // Analytics
            this.modules.analytics?.track('message_sent', {
                message_length: message.length,
                response_time: response.response_time
            });
            
            return response;
        } catch (error) {
            this.handleError(error);
            throw error;
        } finally {
            this.setState({ typing: false });
        }
    }
    
    addMessage(type, content, options = {}) {
        const messageData = {
            type: type,
            content: content,
            timestamp: new Date(),
            id: Date.now() + Math.random(),
            options: options
        };
        
        this.state.messages.push(messageData);
        
        // Limitar número de mensajes
        if (this.state.messages.length > this.config.maxMessages) {
            this.state.messages = this.state.messages.slice(-this.config.maxMessages);
        }
        
        this.modules.ui?.renderMessage(messageData);
        this.modules.ui?.scrollToBottom();
        
        // Evento personalizado
        this.dispatchEvent('messageAdded', messageData);
    }
    
    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.notifyStateChange();
    }
    
    notifyStateChange() {
        // Notificar a todos los módulos del cambio de estado
        Object.values(this.modules).forEach(module => {
            if (module && module.onStateChange) {
                module.onStateChange(this.state);
            }
        });
    }
    
    handleError(error) {
        console.error('ChatbotCore Error:', error);
        this.setState({ error: error.message });
        
        this.modules.ui?.showError(error.message);
        this.modules.analytics?.track('error', {
            error_type: error.constructor.name,
            error_message: error.message
        });
    }
    
    dispatchEvent(eventName, detail = null) {
        const event = new CustomEvent(`chatbot${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`, {
            detail: detail
        });
        document.dispatchEvent(event);
    }
    
    // Métodos de control
    open() {
        this.setState({ isOpen: true });
        this.modules.ui?.open();
        this.dispatchEvent('opened');
    }
    
    close() {
        this.setState({ isOpen: false });
        this.modules.ui?.close();
        this.modules.memory?.saveConversation(this.state);
        this.dispatchEvent('closed');
    }
    
    toggle() {
        if (this.state.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    clearConversation() {
        this.state.messages = [];
        this.state.currentConversationId = null;
        this.modules.ui?.clearMessages();
        this.modules.memory?.clearConversation();
        this.dispatchEvent('conversationCleared');
    }
    
    loadConversationHistory() {
        const history = this.modules.memory?.loadConversation();
        if (history && history.messages) {
            this.state.messages = history.messages;
            this.state.currentConversationId = history.conversationId;
            
            // Renderizar mensajes
            history.messages.forEach(msg => {
                this.modules.ui?.renderMessage(msg);
            });
        }
    }
}

// Módulo de Mensajería Mejorado
class MessagingModule {
    constructor(core) {
        this.core = core;
        this.requestQueue = [];
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000
        };
    }
    
    async send(message, options = {}) {
        const requestData = {
            message,
            conversation_id: this.core.state.currentConversationId,
            analysis_context: options.analysisContext || this.getAnalysisContext(),
            timestamp: new Date().toISOString()
        };
        
        // Verificar caché local
        if (this.core.config.enableCache) {
            const cached = this.getCachedResponse(message);
            if (cached) {
                return { ...cached, cached: true };
            }
        }
        
        // Enviar con retry
        return await this.sendWithRetry(requestData);
    }
    
    async sendWithRetry(requestData, retryCount = 0) {
        try {
            const startTime = Date.now();
            const response = await fetch(this.core.config.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            const responseTime = Date.now() - startTime;
            
            if (!data.success) {
                throw new Error(data.error || 'Error en la respuesta del servidor');
            }
            
            const result = {
                text: data.response,
                metadata: {
                    provider: data.proveedor,
                    level: data.nivel_usuario,
                    response_time: responseTime,
                    cached: data.cached || false
                },
                suggestions: this.extractSuggestions(data.response),
                response_time: responseTime
            };
            
            // Guardar en caché local
            if (this.core.config.enableCache && !data.cached) {
                this.saveToCache(requestData.message, result);
            }
            
            return result;
        } catch (error) {
            if (retryCount < this.retryConfig.maxRetries) {
                await this.delay(this.retryConfig.retryDelay * (retryCount + 1));
                return this.sendWithRetry(requestData, retryCount + 1);
            }
            throw error;
        }
    }
    
    getAnalysisContext() {
        // Obtener contexto de análisis desde window o localStorage
        return window.currentAnalysisContext || 
               JSON.parse(localStorage.getItem('currentAnalysisContext') || 'null');
    }
    
    extractSuggestions(response) {
        const match = response.match(/\[([^\]]+)\]/);
        if (match) {
            return match[1].split('|').map(q => q.trim());
        }
        return [];
    }
    
    getCachedResponse(message) {
        const cacheKey = this.generateCacheKey(message);
        const cached = localStorage.getItem(`chatbot_cache_${cacheKey}`);
        if (cached) {
            const data = JSON.parse(cached);
            // Verificar si el caché no ha expirado (1 hora)
            if (Date.now() - data.timestamp < 3600000) {
                return data.response;
            }
        }
        return null;
    }
    
    saveToCache(message, response) {
        const cacheKey = this.generateCacheKey(message);
        localStorage.setItem(`chatbot_cache_${cacheKey}`, JSON.stringify({
            response: response,
            timestamp: Date.now()
        }));
    }
    
    generateCacheKey(message) {
        return btoa(message).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Módulo de UI Mejorado
class UIModule {
    constructor(core) {
        this.core = core;
        this.container = null;
        this.messagesContainer = null;
        this.init();
    }
    
    init() {
        // Buscar o crear contenedor
        this.container = document.getElementById('chatbot-interface') || 
                        document.querySelector('.modern-chatbot');
        
        if (this.container) {
            this.messagesContainer = this.container.querySelector('.chatbot-messages') ||
                                    this.container.querySelector('.enhanced-messages');
        }
    }
    
    renderMessage(messageData) {
        if (!this.messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${messageData.type} fade-in`;
        messageElement.setAttribute('data-message-id', messageData.id);
        
        if (messageData.type === 'user') {
            messageElement.innerHTML = this.renderUserMessage(messageData);
        } else {
            messageElement.innerHTML = this.renderBotMessage(messageData);
        }
        
        this.messagesContainer.appendChild(messageElement);
        
        // Inicializar funcionalidades del mensaje
        this.initializeMessageFeatures(messageElement, messageData);
    }
    
    renderUserMessage(messageData) {
        const timestamp = this.formatTime(messageData.timestamp);
        let avatarHTML = '';
        
        if (window.currentUser && window.currentUser.foto_perfil) {
            avatarHTML = `
                <div class="user-avatar">
                    <img src="${window.currentUser.foto_perfil}" alt="Avatar" class="user-avatar-img">
                </div>
            `;
        } else {
            avatarHTML = `
                <div class="user-avatar default-avatar">
                    <i class="fas fa-user"></i>
                </div>
            `;
        }
        
        return `
            <div class="message-wrapper user-wrapper">
                ${avatarHTML}
                <div class="message-content user-content">
                    <div class="message-text">${this.escapeHtml(messageData.content)}</div>
                    <div class="message-time">${timestamp}</div>
                </div>
            </div>
        `;
    }
    
    renderBotMessage(messageData) {
        const timestamp = this.formatTime(messageData.timestamp);
        const uniqueId = 'botAvatar_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const content = this.formatBotContent(messageData.content, messageData.options);
        
        let suggestionsHTML = '';
        if (messageData.options.suggestions && messageData.options.suggestions.length > 0) {
            suggestionsHTML = `
                <div class="message-suggestions">
                    ${messageData.options.suggestions.map(suggestion => `
                        <button class="suggestion-btn" data-suggestion="${this.escapeHtml(suggestion)}">
                            <i class="fas fa-lightbulb"></i>
                            ${this.escapeHtml(suggestion)}
                        </button>
                    `).join('')}
                </div>
            `;
        }
        
        return `
            <div class="message-wrapper bot-wrapper">
                <div class="bot-avatar">
                    <div class="avatar-container">
                        <canvas id="${uniqueId}" width="48" height="48"></canvas>
                    </div>
                </div>
                <div class="message-content bot-content">
                    <div class="message-text">${content}</div>
                    ${suggestionsHTML}
                    <div class="message-time">${timestamp}</div>
                </div>
            </div>
        `;
    }
    
    formatBotContent(content, options) {
        // Aplicar formato markdown y colores
        if (window.chatbotUtils && window.chatbotUtils.renderMarkdown) {
            return window.chatbotUtils.renderMarkdown(content);
        }
        
        // Fallback básico
        return this.escapeHtml(content)
            .replace(/\n/g, '<br>')
            .replace(/\[red\](.*?)\[\/red\]/g, '<span class="highlight-red">$1</span>')
            .replace(/\[blue\](.*?)\[\/blue\]/g, '<span class="highlight-blue">$1</span>')
            .replace(/\[green\](.*?)\[\/green\]/g, '<span class="highlight-green">$1</span>')
            .replace(/\[orange\](.*?)\[\/orange\]/g, '<span class="highlight-orange">$1</span>');
    }
    
    initializeMessageFeatures(messageElement, messageData) {
        // Inicializar avatar animado
        const canvas = messageElement.querySelector('canvas');
        if (canvas && window.animateAvatarCanvas) {
            setTimeout(() => {
                window.animateAvatarCanvas(canvas);
            }, 50);
        }
        
        // Inicializar eventos de sugerencias
        const suggestionBtns = messageElement.querySelectorAll('.suggestion-btn');
        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const suggestion = btn.dataset.suggestion;
                if (suggestion) {
                    this.core.sendMessage(suggestion);
                }
            });
        });
    }
    
    scrollToBottom() {
        if (this.messagesContainer) {
            setTimeout(() => {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }, 100);
        }
    }
    
    showError(message) {
        // Mostrar error en la UI
        console.error('Chatbot Error:', message);
        // Puedes agregar un toast o notificación aquí
    }
    
    showNotification(notification) {
        // Mostrar notificación
        console.log('Chatbot Notification:', notification);
        // Implementar sistema de notificaciones
    }
    
    updateTheme(theme) {
        if (this.container) {
            this.container.classList.remove('theme-light', 'theme-dark');
            this.container.classList.add(`theme-${theme}`);
        }
    }
    
    open() {
        if (this.container) {
            this.container.style.display = 'flex';
            this.container.classList.add('entering');
        }
    }
    
    close() {
        if (this.container) {
            this.container.classList.remove('entering');
            setTimeout(() => {
                this.container.style.display = 'none';
            }, 300);
        }
    }
    
    clearMessages() {
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }
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
}

// Módulo de Memoria
class MemoryModule {
    constructor(core) {
        this.core = core;
        this.storageKey = 'econova_chat_history';
    }
    
    save(message, response) {
        // Guardar mensaje individual
        const history = this.loadConversation();
        if (!history.messages) {
            history.messages = [];
        }
        
        history.messages.push({
            type: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        
        history.messages.push({
            type: 'bot',
            content: response.text,
            timestamp: new Date().toISOString()
        });
        
        this.saveConversation(history);
    }
    
    saveConversation(state) {
        try {
            const history = {
                messages: state.messages || this.core.state.messages,
                conversationId: state.currentConversationId || this.core.state.currentConversationId,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(history));
        } catch (error) {
            console.warn('Error saving conversation:', error);
        }
    }
    
    loadConversation() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : { messages: [], conversationId: null };
        } catch (error) {
            console.warn('Error loading conversation:', error);
            return { messages: [], conversationId: null };
        }
    }
    
    clearConversation() {
        localStorage.removeItem(this.storageKey);
    }
}

// Módulo de Analytics
class AnalyticsModule {
    constructor(core) {
        this.core = core;
    }
    
    track(event, data = {}) {
        // Enviar analytics al backend
        try {
            fetch('/api/v1/chatbot/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event,
                    data,
                    timestamp: new Date().toISOString()
                })
            }).catch(err => console.warn('Analytics error:', err));
        } catch (error) {
            console.warn('Analytics tracking failed:', error);
        }
    }
}

// Módulo de Voz (opcional)
class VoiceModule {
    constructor(core) {
        this.core = core;
        this.recognition = null;
        this.isListening = false;
        this.init();
    }
    
    init() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        }
        
        if (this.recognition) {
            this.recognition.lang = 'es-PE';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.core.sendMessage(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };
        }
    }
    
    start() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
            this.isListening = true;
        }
    }
    
    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ChatbotCore = ChatbotCore;
    window.MessagingModule = MessagingModule;
    window.UIModule = UIModule;
    window.MemoryModule = MemoryModule;
    window.AnalyticsModule = AnalyticsModule;
    window.VoiceModule = VoiceModule;
}

