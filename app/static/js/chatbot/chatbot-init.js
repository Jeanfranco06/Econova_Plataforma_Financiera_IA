/**
 * Sistema de Inicialización del Chatbot Econova
 * Integra el nuevo sistema core con el sistema existente
 */

(function() {
    'use strict';
    
    console.log('🚀 Inicializando Chatbot Econova Mejorado...');
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
    
    function initChatbot() {
        try {
            // Verificar si el nuevo sistema core está disponible
            if (typeof ChatbotCore !== 'undefined') {
                console.log('✅ Usando nuevo sistema ChatbotCore');
                initNewSystem();
            } else {
                console.log('⚠️ ChatbotCore no disponible, usando sistema legacy');
                initLegacySystem();
            }
        } catch (error) {
            console.error('❌ Error inicializando chatbot:', error);
            initFallbackSystem();
        }
    }
    
    function initNewSystem() {
        // Inicializar el nuevo sistema core
        window.econovaChatbotCore = new ChatbotCore({
            apiUrl: '/api/v1/chatbot',
            maxMessages: 100,
            enableCache: true,
            enableMemory: true,
            enableVoice: true,
            enableAnalytics: true
        });
        
        // Integrar con el sistema existente si está disponible
        if (window.econovaChatbot) {
            // Migrar estado del sistema antiguo
            migrateLegacyState();
        }
        
        // Configurar integración con la página
        setupPageIntegration();
        
        console.log('✅ ChatbotCore inicializado correctamente');
    }
    
    function initLegacySystem() {
        // Usar el sistema existente
        if (typeof ChatbotEconova !== 'undefined') {
            window.econovaChatbot = new ChatbotEconova({
                apiUrl: '/api/v1/chatbot',
                avatarContainer: 'chatbot-avatar',
                interfaceContainer: 'chatbot-interface',
                enableAnimations: true,
                enableWordHighlighting: true,
                enableExpandableMessages: true
            });
            console.log('✅ Sistema legacy inicializado');
        }
    }
    
    function initFallbackSystem() {
        // Sistema de respaldo básico
        console.log('🔧 Inicializando sistema de respaldo...');
        createBasicChatbot();
    }
    
    function migrateLegacyState() {
        // Migrar mensajes y estado del sistema antiguo al nuevo
        if (window.econovaChatbot && window.econovaChatbot.messages) {
            window.econovaChatbotCore.state.messages = window.econovaChatbot.messages.map(msg => ({
                type: msg.type,
                content: msg.content,
                timestamp: msg.timestamp || new Date(),
                id: msg.id || Date.now() + Math.random()
            }));
        }
    }
    
    function setupPageIntegration() {
        // Integrar con eventos de la página
        document.addEventListener('financialCalculationCompleted', (e) => {
            if (window.econovaChatbotCore) {
                window.econovaChatbotCore.handleFinancialEvent(e.detail);
            }
        });
        
        // Botón flotante del chatbot
        const chatbotButton = document.getElementById('chatbot-avatar');
        if (chatbotButton && window.econovaChatbotCore) {
            chatbotButton.addEventListener('click', () => {
                window.econovaChatbotCore.toggle();
            });
        }
        
        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K para abrir chatbot
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (window.econovaChatbotCore) {
                    window.econovaChatbotCore.open();
                }
            }
            
            // Escape para cerrar
            if (e.key === 'Escape' && window.econovaChatbotCore && window.econovaChatbotCore.state.isOpen) {
                window.econovaChatbotCore.close();
            }
        });
    }
    
    function createBasicChatbot() {
        // Crear un chatbot básico funcional
        const container = document.getElementById('chatbot-interface');
        if (!container) return;
        
        container.innerHTML = `
            <div class="chatbot-header">
                <h3>Econova AI</h3>
                <button class="chatbot-close">×</button>
            </div>
            <div class="chatbot-messages" id="chat-messages"></div>
            <div class="chatbot-input-area">
                <input type="text" id="chat-input" placeholder="Escribe tu mensaje...">
                <button id="send-button">Enviar</button>
            </div>
        `;
        
        // Funcionalidad básica
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-button');
        
        sendBtn.addEventListener('click', () => {
            const message = input.value.trim();
            if (message) {
                sendBasicMessage(message);
                input.value = '';
            }
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendBtn.click();
            }
        });
    }
    
    function sendBasicMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        // Agregar mensaje del usuario
        const userMsg = document.createElement('div');
        userMsg.className = 'message message-user';
        userMsg.textContent = message;
        messagesContainer.appendChild(userMsg);
        
        // Simular respuesta
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = 'message message-bot';
            botMsg.textContent = 'Lo siento, el sistema avanzado no está disponible. Por favor, recarga la página.';
            messagesContainer.appendChild(botMsg);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }
    
    // Exponer API global
    window.ChatbotAPI = {
        open: () => {
            if (window.econovaChatbotCore) {
                window.econovaChatbotCore.open();
            } else if (window.econovaChatbot) {
                window.econovaChatbot.openInterface();
            }
        },
        close: () => {
            if (window.econovaChatbotCore) {
                window.econovaChatbotCore.close();
            } else if (window.econovaChatbot) {
                window.econovaChatbot.closeInterface();
            }
        },
        sendMessage: (message) => {
            if (window.econovaChatbotCore) {
                return window.econovaChatbotCore.sendMessage(message);
            } else if (window.econovaChatbot) {
                return window.econovaChatbot.sendMessageProgrammatically(message);
            }
        },
        toggle: () => {
            if (window.econovaChatbotCore) {
                window.econovaChatbotCore.toggle();
            } else if (window.econovaChatbot) {
                window.econovaChatbot.toggleInterface();
            }
        }
    };
    
    console.log('✅ Sistema de inicialización del chatbot cargado');
})();

