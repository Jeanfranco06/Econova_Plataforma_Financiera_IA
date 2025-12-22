/**
 * Avatar Animado del Chatbot Econova
 * Sistema de animación para el avatar del chatbot
 */

class ChatbotAvatar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }

        this.options = {
            size: options.size || 120,
            primaryColor: options.primaryColor || '#00ffff',
            secondaryColor: options.secondaryColor || '#ff6b6b',
            animationSpeed: options.animationSpeed || 1,
            ...options
        };

        this.isAnimating = false;
        this.animationFrame = null;
        this.currentEmotion = 'neutral';
        this.speechBubble = null;

        this.init();
        this.createAvatar();
        this.setupEventListeners();
        this.startIdleAnimation();
    }

    init() {
        // Crear contenedor principal
        this.avatarContainer = document.createElement('div');
        this.avatarContainer.className = 'chatbot-avatar-container';
        this.avatarContainer.style.cssText = `
            position: relative;
            width: ${this.options.size}px;
            height: ${this.options.size}px;
            margin: 0 auto;
            cursor: pointer;
        `;

        this.container.appendChild(this.avatarContainer);

        // Crear canvas para dibujar
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.options.size;
        this.canvas.height = this.options.size;
        this.canvas.style.cssText = `
            width: 100%;
            height: 100%;
            border-radius: 50%;
            box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);
        `;

        this.avatarContainer.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Crear burbuja de diálogo
        this.createSpeechBubble();
    }

    createAvatar() {
        this.drawAvatar();
    }

    drawAvatar() {
        const ctx = this.ctx;
        const size = this.options.size;
        const centerX = size / 2;
        const centerY = size / 2;
        const time = Date.now() * 0.001 * this.options.animationSpeed;

        // Limpiar canvas
        ctx.clearRect(0, 0, size, size);

        // Dibujar fondo circular con gradiente
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size / 2);
        gradient.addColorStop(0, this.options.primaryColor);
        gradient.addColorStop(1, this.adjustColor(this.options.primaryColor, -30));

        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2 - 5, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Dibujar borde
        ctx.strokeStyle = this.options.primaryColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cabeza del robot (círculo interno)
        const headRadius = size * 0.25;
        ctx.beginPath();
        ctx.arc(centerX, centerY - size * 0.1, headRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = this.options.secondaryColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ojos
        const eyeOffsetX = headRadius * 0.4;
        const eyeOffsetY = centerY - size * 0.1;
        const eyeRadius = headRadius * 0.15;

        // Ojo izquierdo
        ctx.beginPath();
        ctx.arc(centerX - eyeOffsetX, eyeOffsetY - eyeRadius * 0.5, eyeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = this.options.secondaryColor;
        ctx.fill();

        // Ojo derecho
        ctx.beginPath();
        ctx.arc(centerX + eyeOffsetX, eyeOffsetY - eyeRadius * 0.5, eyeRadius, 0, 2 * Math.PI);
        ctx.fill();

        // Pupilas (con animación de parpadeo)
        const blinkFactor = Math.sin(time * 3) > 0.9 ? 0.2 : 1;
        ctx.fillStyle = '#000000';

        ctx.beginPath();
        ctx.arc(centerX - eyeOffsetX, eyeOffsetY - eyeRadius * 0.5, eyeRadius * 0.6 * blinkFactor, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX + eyeOffsetX, eyeOffsetY - eyeOffsetY * 0.5, eyeRadius * 0.6 * blinkFactor, 0, 2 * Math.PI);
        ctx.fill();

        // Boca (expresión basada en emoción)
        this.drawMouth(centerX, centerY + size * 0.05, headRadius * 0.8);

        // Antenas
        this.drawAntennas(centerX, centerY - size * 0.1 - headRadius, time);

        // Brazos (opcionales, solo en algunas poses)
        if (this.currentEmotion === 'excited' || this.isAnimating) {
            this.drawArms(centerX, centerY, size, time);
        }
    }

    drawMouth(centerX, centerY, width) {
        const ctx = this.ctx;
        const time = Date.now() * 0.001 * this.options.animationSpeed;

        ctx.strokeStyle = this.options.secondaryColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        switch (this.currentEmotion) {
            case 'happy':
                // Sonrisa
                ctx.beginPath();
                ctx.arc(centerX, centerY, width * 0.4, 0, Math.PI);
                ctx.stroke();
                break;

            case 'thinking':
                // Boca recta con puntos suspensivos
                ctx.beginPath();
                ctx.moveTo(centerX - width * 0.3, centerY);
                ctx.lineTo(centerX + width * 0.3, centerY);
                ctx.stroke();

                // Puntos suspensivos
                for (let i = 0; i < 3; i++) {
                    const x = centerX + width * 0.5 + i * 8;
                    ctx.beginPath();
                    ctx.arc(x, centerY - 5, 2, 0, 2 * Math.PI);
                    ctx.fillStyle = this.options.secondaryColor;
                    ctx.fill();
                }
                break;

            case 'excited':
                // Boca abierta con animación
                const mouthOpen = Math.sin(time * 4) * 0.5 + 0.5;
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, width * 0.3, width * 0.2 * mouthOpen, 0, 0, Math.PI);
                ctx.stroke();
                break;

            default: // neutral
                // Boca neutral
                ctx.beginPath();
                ctx.moveTo(centerX - width * 0.25, centerY);
                ctx.lineTo(centerX + width * 0.25, centerY);
                ctx.stroke();
        }
    }

    drawAntennas(centerX, startY, time) {
        const ctx = this.ctx;
        const antennaLength = this.options.size * 0.15;
        const antennaOffset = this.options.size * 0.12;

        ctx.strokeStyle = this.options.secondaryColor;
        ctx.lineWidth = 2;

        // Antena izquierda
        ctx.beginPath();
        ctx.moveTo(centerX - antennaOffset, startY);
        ctx.lineTo(centerX - antennaOffset + Math.sin(time * 2) * 3, startY - antennaLength);
        ctx.stroke();

        // Antena derecha
        ctx.beginPath();
        ctx.moveTo(centerX + antennaOffset, startY);
        ctx.lineTo(centerX + antennaOffset + Math.sin(time * 2 + Math.PI) * 3, startY - antennaLength);
        ctx.stroke();

        // Luces en las antenas
        ctx.fillStyle = this.options.secondaryColor;
        ctx.beginPath();
        ctx.arc(centerX - antennaOffset + Math.sin(time * 2) * 3, startY - antennaLength, 3, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX + antennaOffset + Math.sin(time * 2 + Math.PI) * 3, startY - antennaLength, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawArms(centerX, centerY, size, time) {
        const ctx = this.ctx;
        const armLength = size * 0.2;
        const armOffset = size * 0.15;

        ctx.strokeStyle = this.adjustColor(this.options.primaryColor, 50);
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        // Brazo izquierdo
        const leftArmAngle = Math.sin(time * 1.5) * 0.3;
        const leftArmEndX = centerX - armOffset + Math.cos(leftArmAngle) * armLength;
        const leftArmEndY = centerY + Math.sin(leftArmAngle) * armLength;

        ctx.beginPath();
        ctx.moveTo(centerX - armOffset, centerY);
        ctx.lineTo(leftArmEndX, leftArmEndY);
        ctx.stroke();

        // Brazo derecho
        const rightArmAngle = Math.sin(time * 1.5 + Math.PI) * 0.3;
        const rightArmEndX = centerX + armOffset + Math.cos(rightArmAngle) * armLength;
        const rightArmEndY = centerY + Math.sin(rightArmAngle) * armLength;

        ctx.beginPath();
        ctx.moveTo(centerX + armOffset, centerY);
        ctx.lineTo(rightArmEndX, rightArmEndY);
        ctx.stroke();
    }

    createSpeechBubble() {
        this.speechBubble = document.createElement('div');
        this.speechBubble.className = 'speech-bubble';
        this.speechBubble.style.cssText = `
            position: absolute;
            top: -80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 255, 255, 0.9);
            color: #000;
            padding: 10px 15px;
            border-radius: 15px;
            font-size: 14px;
            font-weight: bold;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            white-space: nowrap;
            box-shadow: 0 2px 10px rgba(0, 255, 255, 0.3);
        `;

        // Crear la flecha del globo
        this.speechBubble.innerHTML = `
            <div style="position: relative;">
                ¡Hola! Soy Econova
                <div style="
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-top: 10px solid rgba(0, 255, 255, 0.9);
                "></div>
            </div>
        `;

        this.avatarContainer.appendChild(this.speechBubble);
    }

    setupEventListeners() {
        // Hover para mostrar burbuja
        this.avatarContainer.addEventListener('mouseenter', () => {
            this.showSpeechBubble();
            this.setEmotion('happy');
        });

        this.avatarContainer.addEventListener('mouseleave', () => {
            this.hideSpeechBubble();
            this.setEmotion('neutral');
        });

        // Click para animación especial
        this.avatarContainer.addEventListener('click', () => {
            this.playClickAnimation();
        });

        // Escuchar mensajes del chatbot
        document.addEventListener('chatbotMessage', (event) => {
            this.onChatbotMessage(event.detail);
        });
    }

    showSpeechBubble(text = null) {
        if (text) {
            this.speechBubble.querySelector('div').firstChild.textContent = text;
        }
        this.speechBubble.style.opacity = '1';
    }

    hideSpeechBubble() {
        this.speechBubble.style.opacity = '0';
    }

    setEmotion(emotion) {
        this.currentEmotion = emotion;
        // La emoción se refleja en el próximo frame de dibujado
    }

    playClickAnimation() {
        this.setEmotion('excited');
        this.isAnimating = true;

        // Mostrar mensaje de saludo
        this.showSpeechBubble('¡Estoy aquí para ayudarte!');

        // Volver a estado normal después de 2 segundos
        setTimeout(() => {
            this.setEmotion('neutral');
            this.isAnimating = false;
            this.hideSpeechBubble();
        }, 2000);
    }

    onChatbotMessage(message) {
        // Reaccionar a mensajes del chatbot
        if (message.type === 'user') {
            this.setEmotion('thinking');
        } else if (message.type === 'bot') {
            this.setEmotion('happy');
            // Mostrar preview del mensaje
            if (message.text && message.text.length > 50) {
                this.showSpeechBubble(message.text.substring(0, 47) + '...');
                setTimeout(() => this.hideSpeechBubble(), 3000);
            }
        }
    }

    startIdleAnimation() {
        const animate = () => {
            this.drawAvatar();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }

    adjustColor(color, amount) {
        // Función auxiliar para ajustar brillo de colores
        const usePound = color[0] === '#';
        const col = usePound ? color.slice(1) : color;

        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = (num >> 8 & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;

        r = r > 255 ? 255 : r < 0 ? 0 : r;
        g = g > 255 ? 255 : g < 0 ? 0 : g;
        b = b > 255 ? 255 : b < 0 ? 0 : b;

        return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16);
    }

    dispose() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.speechBubble && this.avatarContainer.contains(this.speechBubble)) {
            this.avatarContainer.removeChild(this.speechBubble);
        }
    }
}

// Función global para crear avatares
window.createChatbotAvatar = function(containerId, options) {
    return new ChatbotAvatar(containerId, options);
};

// Inicialización automática si hay contenedor
document.addEventListener('DOMContentLoaded', function() {
    const avatarContainer = document.getElementById('chatbot-avatar');
    if (avatarContainer) {
        window.chatbotAvatar = new ChatbotAvatar('chatbot-avatar');
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotAvatar;
}
