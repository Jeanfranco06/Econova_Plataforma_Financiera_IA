/**
 * Chatbot Principal de Econova
 * Integración completa de todos los módulos del chatbot
 */

// Cargar dependencias necesarias
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que Three.js esté disponible para el robot 3D
    if (typeof THREE === 'undefined') {
        console.warn('Three.js no está cargado. El robot 3D no estará disponible.');
    }

    // Inicializar sistema de temas
    if (window.themeManager) {
        console.log('🎨 Sistema de temas inicializado');
    }

    // Inicializar mensajes contextuales
    if (window.contextualMessages) {
        console.log('💬 Sistema de mensajes contextuales inicializado');
    }

    // Inicializar chatbot principal
    if (window.econovaChatbot) {
        console.log('🤖 Chatbot principal inicializado');

        // Configurar chatbot con opciones avanzadas
        window.econovaChatbot.options = {
            ...window.econovaChatbot.options,
            enableWelcome: true,
            enableAvatar: true,
            enableThemes: true,
            enableContextualMessages: true,
            maxMessages: 100,
            autoSave: true,
            enableSound: false
        };

        // Configurar avatar si existe
        if (window.chatbotAvatar) {
            window.chatbotAvatar.options = {
                ...window.chatbotAvatar.options,
                size: 100,
                primaryColor: '#00ffff',
                secondaryColor: '#ff6b6b',
                animationSpeed: 1.2
            };
        }

        // Configurar sistema de bienvenida
        if (window.chatbotWelcome) {
            window.chatbotWelcome.typingSpeed = 40;
            window.chatbotWelcome.messageDelay = 800;
        }

    // Configurar mensajería
    if (window.chatbotMessaging) {
        window.chatbotMessaging.typingDelay = 1200;
        window.chatbotMessaging.responseDelay = 300;
    }

    // Check for analysis context and send contextual message
    console.log('⏰ Setting timeout for contextual message check...');
    setTimeout(() => {
        console.log('⏰ Timeout fired, calling checkAndSendContextualMessage...');
        checkAndSendContextualMessage();
    }, 1000);
    }

    // Configurar atajos de teclado
    setupKeyboardShortcuts();

    // Configurar integración con la aplicación principal
    setupAppIntegration();

    console.log('🚀 Econova Chatbot completamente inicializado');
});

/**
 * Configurar atajos de teclado para el chatbot
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + Enter para enviar mensaje
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            const sendButton = document.querySelector('.chatbot-send');
            if (sendButton) {
                sendButton.click();
            }
        }

        // Escape para cerrar chatbot
        if (event.key === 'Escape') {
            if (window.econovaChatbot && window.econovaChatbot.isOpen) {
                window.econovaChatbot.closeInterface();
            }
        }

        // Ctrl/Cmd + / para mostrar/ocultar chatbot
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            if (window.econovaChatbot) {
                window.econovaChatbot.toggleInterface();
            }
        }
    });
}

/**
 * Configurar integración con la aplicación principal
 */
function setupAppIntegration() {
    // Escuchar eventos de la aplicación
    document.addEventListener('financialCalculationCompleted', function(event) {
        const { type, result } = event.detail;

        // Mostrar mensaje contextual
        if (window.contextualMessages) {
            let message = {};
            switch (type) {
                case 'van':
                    message = {
                        title: 'VAN Calculado',
                        body: `Resultado: ${window.formatCurrency ? window.formatCurrency(result) : result}`,
                        icon: '📊'
                    };
                    break;
                case 'tir':
                    message = {
                        title: 'TIR Calculada',
                        body: `Tasa interna de retorno: ${(result * 100).toFixed(2)}%`,
                        icon: '📈'
                    };
                    break;
                case 'wacc':
                    message = {
                        title: 'WACC Calculado',
                        body: `Costo promedio del capital: ${(result * 100).toFixed(2)}%`,
                        icon: '💰'
                    };
                    break;
            }

            if (message.title) {
                window.contextualMessages.success(message);
            }
        }

        // Notificar al chatbot si está disponible
        if (window.econovaChatbot && window.econovaChatbot.isOpen) {
            const notification = `¡Cálculo completado! ${type.toUpperCase()}: ${result}`;
            // Aquí se podría enviar una notificación al chatbot
        }
    });

    // Escuchar eventos de registro de usuario
    document.addEventListener('userRegistered', function(event) {
        if (window.contextualMessages) {
            window.contextualMessages.success({
                title: '¡Bienvenido a Econova!',
                body: 'Tu cuenta ha sido creada exitosamente. Explora todas las herramientas financieras disponibles.',
                icon: '🎉'
            });
        }
    });

    // Escuchar eventos de login
    document.addEventListener('userLoggedIn', function(event) {
        const user = event.detail;
        if (window.contextualMessages) {
            window.contextualMessages.info({
                title: '¡Bienvenido de vuelta!',
                body: `Hola ${user.nombre || 'usuario'}, ¿listo para continuar con tus análisis financieros?`,
                icon: '👋'
            });
        }
    });

    // Escuchar eventos de simulación completada
    document.addEventListener('simulationCompleted', function(event) {
        if (window.contextualMessages) {
            window.contextualMessages.success({
                title: 'Simulación Completada',
                body: 'Los resultados están disponibles en la sección de resultados.',
                icon: '🎯'
            });
        }
    });

    // Escuchar cambios de tema
    document.addEventListener('themeChanged', function(event) {
        const { theme } = event.detail;

        if (window.contextualMessages) {
            window.contextualMessages.info({
                title: 'Tema Cambiado',
                body: `Tema "${theme}" aplicado exitosamente.`,
                icon: '🎨'
            });
        }

        // Actualizar colores del chatbot si está abierto
        if (window.econovaChatbot && window.econovaChatbot.isOpen) {
            updateChatbotTheme(theme);
        }
    });
}

/**
 * Actualizar tema del chatbot
 */
function updateChatbotTheme(themeName) {
    const chatbotInterface = document.querySelector('.chatbot-interface');
    if (!chatbotInterface) return;

    // Remover clases de tema anteriores
    chatbotInterface.classList.forEach(className => {
        if (className.startsWith('theme-')) {
            chatbotInterface.classList.remove(className);
        }
    });

    // Agregar nuevo tema
    chatbotInterface.classList.add(`theme-${themeName}`);
}

/**
 * Funciones de utilidad globales para el chatbot
 */
window.ChatbotAPI = {
    // Enviar mensaje programáticamente
    sendMessage: function(message) {
        if (window.econovaChatbot) {
            window.econovaChatbot.sendMessageProgrammatically(message);
        }
    },

    // Abrir/cerrar chatbot
    toggle: function() {
        if (window.econovaChatbot) {
            window.econovaChatbot.toggleInterface();
        }
    },

    open: function() {
        if (window.econovaChatbot) {
            window.econovaChatbot.openInterface();
        }
    },

    close: function() {
        if (window.econovaChatbot) {
            window.econovaChatbot.closeInterface();
        }
    },

    // Cambiar configuración
    setTypingSpeed: function(speed) {
        if (window.chatbotMessaging) {
            window.chatbotMessaging.setTypingDelay(speed);
        }
        if (window.chatbotWelcome) {
            window.chatbotWelcome.setTypingSpeed(speed / 20); // Ajustar escala
        }
    },

    // Obtener estado
    getState: function() {
        return {
            isOpen: window.econovaChatbot ? window.econovaChatbot.isOpen : false,
            messageCount: window.econovaChatbot ? window.econovaChatbot.messages.length : 0,
            currentTheme: window.themeManager ? window.themeManager.getCurrentTheme() : 'light',
            avatarEmotion: window.chatbotAvatar ? window.chatbotAvatar.currentEmotion : 'neutral'
        };
    },

    // Limpiar conversación
    clearConversation: function() {
        if (window.econovaChatbot) {
            window.econovaChatbot.clearConversation();
        }
        if (window.chatbotWelcome) {
            window.chatbotWelcome.reset();
        }
    },

    // Forzar mostrar bienvenida
    showWelcome: function() {
        if (window.chatbotWelcome) {
            window.chatbotWelcome.forceShowWelcome();
        }
    }
};

/**
 * Inicialización de funcionalidades avanzadas
 */
function initializeAdvancedFeatures() {
    // Detección de capacidades del navegador
    const capabilities = {
        webgl: (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(window.WebGLRenderingContext &&
                    canvas.getContext('webgl'));
            } catch (e) {
                return false;
            }
        })(),
        localStorage: (() => {
            try {
                const test = '__localStorage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        })(),
        notifications: 'Notification' in window,
        speechSynthesis: 'speechSynthesis' in window,
        speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    };

    // Configurar funcionalidades basadas en capacidades
    if (capabilities.webgl) {
        console.log('✅ WebGL disponible - Robot 3D activado');
    } else {
        console.warn('⚠️ WebGL no disponible - Robot 3D deshabilitado');
    }

    if (capabilities.localStorage) {
        console.log('✅ LocalStorage disponible - Historial de chat guardado');
    } else {
        console.warn('⚠️ LocalStorage no disponible - Historial de chat no persistente');
    }

    if (capabilities.notifications) {
        console.log('✅ Notificaciones disponibles');
    }

    if (capabilities.speechSynthesis) {
        console.log('✅ Síntesis de voz disponible');
        // Aquí se podría inicializar text-to-speech
    }

    if (capabilities.speechRecognition) {
        console.log('✅ Reconocimiento de voz disponible');
        // Aquí se podría inicializar speech-to-text
    }

    // Guardar capacidades globalmente
    window.chatbotCapabilities = capabilities;
}

/**
 * Sistema de debugging para desarrollo
 */
window.ChatbotDebug = {
    log: function(message, data = null) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log(`🤖 Chatbot: ${message}`, data || '');
        }
    },

    error: function(message, error = null) {
        console.error(`❌ Chatbot Error: ${message}`, error || '');
    },

    info: function(message, data = null) {
        console.info(`ℹ️ Chatbot Info: ${message}`, data || '');
    },

    performance: function(label, startTime) {
        const duration = Date.now() - startTime;
        console.log(`⚡ Chatbot Performance [${label}]: ${duration}ms`);
    }
};

/**
 * Check for analysis context and send contextual message automatically
 */
function checkAndSendContextualMessage() {
    console.log('🔍 Checking for analysis context on chatbot load...');

    // Check if we have analysis context from calculator
    if (window.currentAnalysisContext) {
        console.log('✅ Found analysis context:', window.currentAnalysisContext);

        const context = window.currentAnalysisContext;
        let contextualMessage = '';

        // Create contextual message based on analysis type
        if (context.tipo_analisis === 'tir') {
            const tir = context.resultados?.tir;
            const van = context.resultados?.van;
            const metodo = context.resultados?.metodo;
            const evaluacion = context.resultados?.evaluacion;

            contextualMessage = `Hola, acabo de calcular la TIR (Tasa Interna de Retorno) y me gustaría analizar los resultados más profundamente. `;

            if (tir !== null && tir !== undefined) {
                contextualMessage += `Los resultados son: TIR = ${tir.toFixed(1)}%, VAN a la TIR = S/ ${van?.toLocaleString() || 'N/A'}. `;
            } else {
                contextualMessage += `No se pudo calcular la TIR con los datos proporcionados. `;
            }

            contextualMessage += `Los parámetros fueron: Inversión inicial = S/ ${context.resultados?.inversion?.toLocaleString() || 'N/A'}, `;
            contextualMessage += `Flujos de caja: ${context.resultados?.flujos ? context.resultados.flujos.map((f, i) => `Año ${i+1}: S/ ${f.toLocaleString()}`).join(', ') : 'No disponibles'}. `;
            contextualMessage += `Método de cálculo utilizado: ${metodo === 'newton' ? 'Newton-Raphson' : metodo === 'biseccion' ? 'Bisección' : 'Aproximación'}. `;

            if (evaluacion && evaluacion !== 'no_calculable') {
                contextualMessage += `La evaluación de la TIR es: ${evaluacion === 'excelente' ? 'Excelente' : evaluacion === 'muy_buena' ? 'Muy Buena' : evaluacion === 'buena' ? 'Buena' : evaluacion === 'aceptable' ? 'Aceptable' : 'Baja'}. `;
            }

            contextualMessage += '¿Qué opinas sobre la rentabilidad de este proyecto? ¿Debería compararlo con el WACC? ¿Qué factores podrían afectar la TIR calculada?';
        }

        if (contextualMessage) {
            console.log('📤 Sending contextual message:', contextualMessage.substring(0, 100) + '...');

            // Send the contextual message using the messaging module
            if (window.chatbotMessaging && window.chatbotMessaging.sendMessage) {
                // Create mock elements for sendMessage function
                const mockElements = {
                    chatInput: { value: contextualMessage },
                    sendButton: { disabled: false },
                    chatMessages: document.getElementById('chat-messages'),
                    typingIndicator: document.getElementById('typing-indicator')
                };

                // Clear the input after "sending"
                setTimeout(() => {
                    if (mockElements.chatInput) {
                        mockElements.chatInput.value = '';
                    }
                }, 100);

                window.chatbotMessaging.sendMessage(mockElements);
                console.log('✅ Contextual message sent automatically via messaging module');
            } else {
                console.error('❌ window.chatbotMessaging.sendMessage not available');
            }
        } else {
            console.log('❌ No contextual message to send');
        }
    } else {
        console.log('❌ No analysis context found');
    }
}

/**
 * Inicializar funcionalidades avanzadas al cargar
 */
initializeAdvancedFeatures();

// Log de inicialización completa
console.log('🎉 Econova Chatbot - Sistema completo inicializado');
console.log('📋 Funcionalidades activas:', window.chatbotCapabilities);
console.log('🎮 API disponible en: window.ChatbotAPI');
console.log('🐛 Debug disponible en: window.ChatbotDebug');
