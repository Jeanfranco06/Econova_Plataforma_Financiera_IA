/**
 * Mensajes Contextuales de Econova
 * Sistema de notificaciones y mensajes inteligentes
 */

class ContextualMessage {
    constructor(options = {}) {
        this.options = {
            position: options.position || 'top-right',
            duration: options.duration || 5000,
            maxMessages: options.maxMessages || 3,
            ...options
        };

        this.messages = [];
        this.container = null;

        this.init();
    }

    init() {
        // Crear contenedor si no existe
        if (!document.getElementById('contextual-messages-container')) {
            this.createContainer();
        }
        this.container = document.getElementById('contextual-messages-container');

        // Escuchar eventos personalizados
        this.setupEventListeners();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'contextual-messages-container';
        container.className = `contextual-messages-container ${this.options.position}`;

        // Estilos CSS
        const styles = `
            .contextual-messages-container {
                position: fixed;
                z-index: 10000;
                pointer-events: none;
            }

            .contextual-messages-container.top-right {
                top: 20px;
                right: 20px;
            }

            .contextual-messages-container.top-left {
                top: 20px;
                left: 20px;
            }

            .contextual-messages-container.bottom-right {
                bottom: 20px;
                right: 20px;
            }

            .contextual-messages-container.bottom-left {
                bottom: 20px;
                left: 20px;
            }

            .contextual-messages-container.center {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .contextual-message {
                background: rgba(0, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 12px;
                padding: 16px 20px;
                margin-bottom: 12px;
                box-shadow: 0 8px 32px rgba(0, 255, 255, 0.3);
                pointer-events: auto;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                max-width: 400px;
                animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .contextual-message.success {
                background: rgba(76, 205, 196, 0.95);
                border-color: rgba(76, 205, 196, 0.3);
                box-shadow: 0 8px 32px rgba(76, 205, 196, 0.3);
            }

            .contextual-message.error {
                background: rgba(255, 107, 107, 0.95);
                border-color: rgba(255, 107, 107, 0.3);
                box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
            }

            .contextual-message.warning {
                background: rgba(255, 193, 7, 0.95);
                border-color: rgba(255, 193, 7, 0.3);
                box-shadow: 0 8px 32px rgba(255, 193, 7, 0.3);
            }

            .contextual-message.info {
                background: rgba(33, 150, 243, 0.95);
                border-color: rgba(33, 150, 243, 0.3);
                box-shadow: 0 8px 32px rgba(33, 150, 243, 0.3);
            }

            .contextual-message:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 40px rgba(0, 255, 255, 0.4);
            }

            .contextual-message-content {
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }

            .contextual-message-icon {
                font-size: 20px;
                flex-shrink: 0;
                margin-top: 2px;
            }

            .contextual-message-text {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
                color: #000;
            }

            .contextual-message-title {
                font-weight: 600;
                margin-bottom: 4px;
                display: block;
            }

            .contextual-message-body {
                opacity: 0.9;
            }

            .contextual-message-close {
                background: none;
                border: none;
                font-size: 16px;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
                padding: 0;
                margin-left: 8px;
                flex-shrink: 0;
            }

            .contextual-message-close:hover {
                opacity: 1;
            }

            .contextual-message-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(0, 255, 255, 0.5);
                border-radius: 0 0 12px 12px;
                animation: progressBar linear;
            }

            @media (max-width: 480px) {
                .contextual-messages-container {
                    left: 10px;
                    right: 10px;
                    top: 10px;
                }

                .contextual-message {
                    max-width: none;
                    margin-bottom: 8px;
                }
            }
        `;

        // Agregar estilos al head
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        document.body.appendChild(container);
    }

    setupEventListeners() {
        // Escuchar eventos de simulación financiera
        document.addEventListener('financialCalculation', (event) => {
            this.onFinancialCalculation(event.detail);
        });

        // Escuchar eventos de registro
        document.addEventListener('userRegistered', (event) => {
            this.onUserRegistered(event.detail);
        });

        // Escuchar eventos de login
        document.addEventListener('userLoggedIn', (event) => {
            this.onUserLoggedIn(event.detail);
        });

        // Escuchar eventos de simulación completada
        document.addEventListener('simulationCompleted', (event) => {
            this.onSimulationCompleted(event.detail);
        });

        // Escuchar eventos de error
        document.addEventListener('applicationError', (event) => {
            this.onApplicationError(event.detail);
        });
    }

    show(message, options = {}) {
        const messageData = {
            id: Date.now() + Math.random(),
            type: options.type || 'default',
            title: message.title || '',
            body: message.body || message,
            icon: message.icon || this.getDefaultIcon(options.type),
            duration: options.duration || this.options.duration,
            actions: options.actions || [],
            persistent: options.persistent || false,
            timestamp: new Date()
        };

        // Agregar a la lista
        this.messages.push(messageData);

        // Limitar número de mensajes
        if (this.messages.length > this.options.maxMessages) {
            const oldestMessage = this.messages.shift();
            this.remove(oldestMessage.id);
        }

        // Renderizar
        this.renderMessage(messageData);

        // Auto-remover si no es persistente
        if (!messageData.persistent && messageData.duration > 0) {
            setTimeout(() => {
                this.remove(messageData.id);
            }, messageData.duration);
        }

        return messageData.id;
    }

    renderMessage(messageData) {
        const messageElement = document.createElement('div');
        messageElement.className = `contextual-message ${messageData.type}`;
        messageElement.setAttribute('data-message-id', messageData.id);

        messageElement.innerHTML = `
            <div class="contextual-message-content">
                <div class="contextual-message-icon">${messageData.icon}</div>
                <div class="contextual-message-text">
                    ${messageData.title ? `<span class="contextual-message-title">${messageData.title}</span>` : ''}
                    <span class="contextual-message-body">${messageData.body}</span>
                </div>
                <button class="contextual-message-close" onclick="window.contextualMessages.remove(${messageData.id})">&times;</button>
            </div>
            ${!messageData.persistent && messageData.duration > 0 ?
                `<div class="contextual-message-progress" style="animation-duration: ${messageData.duration}ms;"></div>` : ''}
        `;

        // Agregar acciones si existen
        if (messageData.actions && messageData.actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'contextual-message-actions';
            actionsContainer.style.cssText = `
                margin-top: 12px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            `;

            messageData.actions.forEach(action => {
                const actionButton = document.createElement('button');
                actionButton.textContent = action.label;
                actionButton.style.cssText = `
                    padding: 6px 12px;
                    border: none;
                    border-radius: 6px;
                    background: rgba(0, 0, 0, 0.1);
                    color: #000;
                    font-size: 12px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                `;
                actionButton.onclick = action.callback;
                actionsContainer.appendChild(actionButton);
            });

            messageElement.querySelector('.contextual-message-text').appendChild(actionsContainer);
        }

        this.container.appendChild(messageElement);
    }

    remove(messageId) {
        const messageElement = this.container.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.style.animation = 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }

        // Remover de la lista
        this.messages = this.messages.filter(msg => msg.id !== messageId);
    }

    clear() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        this.messages = [];
    }

    getDefaultIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            default: '💬'
        };
        return icons[type] || icons.default;
    }

    // Eventos específicos de la aplicación
    onFinancialCalculation(data) {
        let message = {};
        let type = 'success';

        switch (data.type) {
            case 'van':
                message = {
                    title: 'VAN Calculado',
                    body: `Resultado: ${window.formatCurrency ? window.formatCurrency(data.result) : data.result}`,
                    icon: '📊'
                };
                break;
            case 'tir':
                message = {
                    title: 'TIR Calculada',
                    body: `Tasa interna de retorno: ${(data.result * 100).toFixed(2)}%`,
                    icon: '📈'
                };
                break;
            case 'wacc':
                message = {
                    title: 'WACC Calculado',
                    body: `Costo promedio del capital: ${(data.result * 100).toFixed(2)}%`,
                    icon: '💰'
                };
                break;
            default:
                message = {
                    title: 'Cálculo Completado',
                    body: 'Tu simulación financiera está lista',
                    icon: '✅'
                };
        }

        this.show(message, { type, duration: 4000 });
    }

    onUserRegistered(data) {
        this.show({
            title: '¡Bienvenido a Econova!',
            body: 'Tu cuenta ha sido creada exitosamente. Explora todas las herramientas financieras disponibles.',
            icon: '🎉'
        }, {
            type: 'success',
            duration: 6000,
            actions: [
                {
                    label: 'Ir al Dashboard',
                    callback: () => window.location.href = '/dashboard'
                }
            ]
        });
    }

    onUserLoggedIn(data) {
        this.show({
            title: '¡Bienvenido de vuelta!',
            body: `Hola ${data.nombre || 'usuario'}, ¿listo para continuar con tus análisis financieros?`,
            icon: '👋'
        }, { type: 'info', duration: 3000 });
    }

    onSimulationCompleted(data) {
        this.show({
            title: 'Simulación Completada',
            body: 'Los resultados están disponibles en la sección de resultados.',
            icon: '🎯'
        }, {
            type: 'success',
            duration: 5000,
            actions: [
                {
                    label: 'Ver Resultados',
                    callback: () => window.location.href = '/resultados'
                }
            ]
        });
    }

    onApplicationError(data) {
        this.show({
            title: 'Error en la aplicación',
            body: data.message || 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.',
            icon: '⚠️'
        }, { type: 'error', duration: 7000 });
    }

    // API pública
    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error' });
    }

    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }

    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }
}

// Inicialización global
document.addEventListener('DOMContentLoaded', function() {
    window.contextualMessages = new ContextualMessage({
        position: 'top-right',
        duration: 5000,
        maxMessages: 3
    });
});

// Funciones de conveniencia globales
window.showSuccessMessage = (message, options) => window.contextualMessages.success(message, options);
window.showErrorMessage = (message, options) => window.contextualMessages.error(message, options);
window.showWarningMessage = (message, options) => window.contextualMessages.warning(message, options);
window.showInfoMessage = (message, options) => window.contextualMessages.info(message, options);

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextualMessage;
}
