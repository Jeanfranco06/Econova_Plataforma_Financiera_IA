/**
 * Financial Robot Avatar for Econova Chatbot
 * Animated financial robot with coins, graphs, and money symbols
 */

class FinancialRobotAvatar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }

        this.options = {
            size: options.size || 120,
            primaryColor: options.primaryColor || '#00d4aa', // Financial green
            secondaryColor: options.secondaryColor || '#ff6b6b',
            accentColor: options.accentColor || '#ffd700', // Gold
            animationSpeed: options.animationSpeed || 1,
            ...options
        };

        this.isAnimating = false;
        this.animationFrame = null;
        this.currentEmotion = 'neutral';
        this.speechBubble = null;
        this.coins = [];
        this.graphPoints = [];

        this.init();
        this.createAvatar();
        this.setupEventListeners();
        this.startIdleAnimation();
    }

    init() {
        // Crear contenedor principal
        this.avatarContainer = document.createElement('div');
        this.avatarContainer.className = 'financial-robot-avatar-container';
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
            box-shadow: 0 4px 20px rgba(0, 212, 170, 0.3);
        `;

        this.avatarContainer.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Crear burbuja de diálogo
        this.createSpeechBubble();

        // Inicializar elementos financieros
        this.initFinancialElements();
    }

    initFinancialElements() {
        // Crear monedas flotantes
        for (let i = 0; i < 3; i++) {
            this.coins.push({
                x: Math.random() * this.options.size,
                y: Math.random() * this.options.size,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                rotation: 0,
                value: Math.floor(Math.random() * 100) + 10
            });
        }

        // Crear puntos del gráfico
        for (let i = 0; i < 8; i++) {
            this.graphPoints.push({
                x: (i / 7) * (this.options.size * 0.6),
                y: Math.random() * (this.options.size * 0.4) + this.options.size * 0.2,
                targetY: Math.random() * (this.options.size * 0.4) + this.options.size * 0.2
            });
        }
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

        // Dibujar elementos financieros de fondo
        this.drawFinancialBackground(time);

        // Dibujar robot financiero
        this.drawFinancialRobot(centerX, centerY, time);

        // Dibujar elementos flotantes
        this.drawFloatingElements(time);
    }

    drawFinancialBackground(time) {
        const ctx = this.ctx;
        const size = this.options.size;

        // Gradiente de fondo financiero
        const gradient = ctx.createRadialGradient(
            size / 2, size / 2, 0,
            size / 2, size / 2, size / 2
        );
        gradient.addColorStop(0, this.options.primaryColor);
        gradient.addColorStop(1, this.adjustColor(this.options.primaryColor, -40));

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 5, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Patrón de dinero sutil
        ctx.strokeStyle = this.options.accentColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.1;

        for (let i = 0; i < 5; i++) {
            const radius = (size / 2 - 10) * (i + 1) / 5;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    }

    drawFinancialRobot(centerX, centerY, time) {
        const ctx = this.ctx;
        const size = this.options.size;

        // Cabeza del robot financiero (forma más moderna)
        const headRadius = size * 0.25;
        ctx.beginPath();
        ctx.arc(centerX, centerY - size * 0.1, headRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = this.options.primaryColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Ojos con efecto de datos
        this.drawDataEyes(centerX, centerY - size * 0.1, headRadius, time);

        // Boca financiera (sonrisa con símbolo de dólar)
        this.drawFinancialMouth(centerX, centerY + size * 0.05, headRadius * 0.8, time);

        // Cuerpo con elementos financieros
        this.drawFinancialBody(centerX, centerY, size, time);

        // Brazos con calculadoras
        this.drawCalculatorArms(centerX, centerY, size, time);

        // Base con gráfico
        this.drawGraphBase(centerX, centerY + size * 0.3, size, time);
    }

    drawDataEyes(centerX, centerY, headRadius, time) {
        const ctx = this.ctx;
        const eyeOffsetX = headRadius * 0.4;
        const eyeOffsetY = centerY;
        const eyeRadius = headRadius * 0.15;

        // Ojo izquierdo - datos binarios
        ctx.fillStyle = this.options.secondaryColor;
        ctx.beginPath();
        ctx.arc(centerX - eyeOffsetX, eyeOffsetY, eyeRadius, 0, 2 * Math.PI);
        ctx.fill();

        // Patrón binario en el ojo izquierdo
        ctx.fillStyle = '#ffffff';
        ctx.font = `${eyeRadius * 0.6}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('01', centerX - eyeOffsetX, eyeOffsetY + eyeRadius * 0.2);

        // Ojo derecho - gráfico de barras
        ctx.fillStyle = this.options.accentColor;
        ctx.beginPath();
        ctx.arc(centerX + eyeOffsetX, eyeOffsetY, eyeRadius, 0, 2 * Math.PI);
        ctx.fill();

        // Barras en el ojo derecho
        ctx.fillStyle = '#000000';
        const barWidth = eyeRadius * 0.15;
        const barHeights = [0.3, 0.7, 0.5, 0.9];
        barHeights.forEach((height, i) => {
            const barX = centerX + eyeOffsetX - eyeRadius * 0.4 + i * barWidth * 1.5;
            const barY = eyeOffsetY + eyeRadius * (1 - height);
            const barH = eyeRadius * height;
            ctx.fillRect(barX, barY, barWidth, barH);
        });
    }

    drawFinancialMouth(centerX, centerY, width, time) {
        const ctx = this.ctx;

        // Boca con símbolo de dólar animado
        ctx.strokeStyle = this.options.accentColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        // Sonrisa base
        ctx.beginPath();
        ctx.arc(centerX, centerY, width * 0.4, 0, Math.PI);
        ctx.stroke();

        // Símbolo de dólar en el centro
        ctx.fillStyle = this.options.accentColor;
        ctx.font = `${width * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('$', centerX, centerY + width * 0.15);
    }

    drawFinancialBody(centerX, centerY, size, time) {
        const ctx = this.ctx;

        // Cuerpo rectangular con esquinas redondeadas
        const bodyWidth = size * 0.4;
        const bodyHeight = size * 0.3;
        const bodyX = centerX - bodyWidth / 2;
        const bodyY = centerY - size * 0.05;

        ctx.fillStyle = this.adjustColor(this.options.primaryColor, 20);
        this.roundedRect(ctx, bodyX, bodyY, bodyWidth, bodyHeight, 8);
        ctx.fill();

        // Pantalla LED con datos financieros
        const screenWidth = bodyWidth * 0.8;
        const screenHeight = bodyHeight * 0.6;
        const screenX = centerX - screenWidth / 2;
        const screenY = bodyY + bodyHeight * 0.15;

        ctx.fillStyle = '#000000';
        this.roundedRect(ctx, screenX, screenY, screenWidth, screenHeight, 4);
        ctx.fill();

        // Texto en la pantalla
        ctx.fillStyle = this.options.accentColor;
        ctx.font = `${screenHeight * 0.25}px monospace`;
        ctx.textAlign = 'center';
        const texts = ['VAN', 'TIR', 'ROI'];
        const currentText = texts[Math.floor(time * 0.5) % texts.length];
        ctx.fillText(currentText, centerX, screenY + screenHeight * 0.6);
    }

    drawCalculatorArms(centerX, centerY, size, time) {
        const ctx = this.ctx;
        const armLength = size * 0.2;
        const armOffset = size * 0.15;

        ctx.strokeStyle = this.adjustColor(this.options.primaryColor, 50);
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        // Brazo izquierdo con calculadora
        const leftArmAngle = Math.sin(time * 1.5) * 0.3;
        const leftArmEndX = centerX - armOffset + Math.cos(leftArmAngle) * armLength;
        const leftArmEndY = centerY + Math.sin(leftArmAngle) * armLength;

        ctx.beginPath();
        ctx.moveTo(centerX - armOffset, centerY);
        ctx.lineTo(leftArmEndX, leftArmEndY);
        ctx.stroke();

        // Calculadora en la mano izquierda
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(leftArmEndX - 8, leftArmEndY - 6, 16, 12);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(leftArmEndX - 8, leftArmEndY - 6, 16, 12);

        // Botones de calculadora
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(leftArmEndX - 6 + i * 3, leftArmEndY - 4, 2, 2);
        }

        // Brazo derecho con lápiz
        const rightArmAngle = Math.sin(time * 1.5 + Math.PI) * 0.3;
        const rightArmEndX = centerX + armOffset + Math.cos(rightArmAngle) * armLength;
        const rightArmEndY = centerY + Math.sin(rightArmAngle) * armLength;

        ctx.strokeStyle = this.adjustColor(this.options.primaryColor, 50);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX + armOffset, centerY);
        ctx.lineTo(rightArmEndX, rightArmEndY);
        ctx.stroke();

        // Lápiz en la mano derecha
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rightArmEndX - 6, rightArmEndY);
        ctx.lineTo(rightArmEndX + 6, rightArmEndY);
        ctx.stroke();

        // Punta del lápiz
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(rightArmEndX + 6, rightArmEndY - 1);
        ctx.lineTo(rightArmEndX + 8, rightArmEndY);
        ctx.lineTo(rightArmEndX + 6, rightArmEndY + 1);
        ctx.closePath();
        ctx.fill();
    }

    drawGraphBase(centerX, centerY, size, time) {
        const ctx = this.ctx;
        const baseWidth = size * 0.6;
        const baseHeight = size * 0.15;
        const baseX = centerX - baseWidth / 2;
        const baseY = centerY;

        // Base
        ctx.fillStyle = '#2c3e50';
        this.roundedRect(ctx, baseX, baseY, baseWidth, baseHeight, 4);
        ctx.fill();

        // Gráfico en la base
        ctx.strokeStyle = this.options.accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Actualizar puntos del gráfico
        this.graphPoints.forEach((point, i) => {
            point.y += (point.targetY - point.y) * 0.02;
            if (Math.random() < 0.01) {
                point.targetY = Math.random() * (size * 0.1) + centerY - size * 0.05;
            }

            const graphX = baseX + (i / (this.graphPoints.length - 1)) * baseWidth;
            const graphY = point.y;

            if (i === 0) {
                ctx.moveTo(graphX, graphY);
            } else {
                ctx.lineTo(graphX, graphY);
            }
        });

        ctx.stroke();

        // Puntos del gráfico
        ctx.fillStyle = this.options.primaryColor;
        this.graphPoints.forEach((point, i) => {
            const graphX = baseX + (i / (this.graphPoints.length - 1)) * baseWidth;
            ctx.beginPath();
            ctx.arc(graphX, point.y, 2, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    drawFloatingElements(time) {
        const ctx = this.ctx;
        const size = this.options.size;

        // Dibujar monedas flotantes
        this.coins.forEach((coin, i) => {
            coin.x += coin.vx;
            coin.y += coin.vy;
            coin.rotation += 0.02;

            // Rebote en bordes
            if (coin.x < 0 || coin.x > size) coin.vx *= -1;
            if (coin.y < 0 || coin.y > size) coin.vy *= -1;

            ctx.save();
            ctx.translate(coin.x, coin.y);
            ctx.rotate(coin.rotation);

            // Moneda
            ctx.fillStyle = this.options.accentColor;
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, 2 * Math.PI);
            ctx.fill();

            // Borde de la moneda
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Símbolo de dólar en la moneda
            ctx.fillStyle = '#000000';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('$', 0, 3);

            ctx.restore();
        });

        // Dibujar símbolos de dinero flotantes
        ctx.fillStyle = this.options.accentColor;
        ctx.globalAlpha = 0.6;
        const symbols = ['$', '€', '£', '¥'];
        symbols.forEach((symbol, i) => {
            const x = size / 2 + Math.cos(time * 0.5 + i * Math.PI / 2) * (size * 0.3);
            const y = size / 2 + Math.sin(time * 0.5 + i * Math.PI / 2) * (size * 0.3);

            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(symbol, x, y);
        });
        ctx.globalAlpha = 1;
    }

    roundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    createSpeechBubble() {
        this.speechBubble = document.createElement('div');
        this.speechBubble.className = 'speech-bubble';
        this.speechBubble.style.cssText = `
            position: absolute;
            top: -80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 212, 170, 0.95);
            color: #000;
            padding: 10px 15px;
            border-radius: 15px;
            font-size: 14px;
            font-weight: bold;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            white-space: nowrap;
            box-shadow: 0 2px 10px rgba(0, 212, 170, 0.3);
        `;

        // Crear la flecha del globo
        this.speechBubble.innerHTML = `
            <div style="position: relative;">
                ¡Hola! Soy tu asesor financiero
                <div style="
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-top: 10px solid rgba(0, 212, 170, 0.95);
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
        this.showSpeechBubble('¡Estoy listo para analizar tus finanzas!');

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

// Función global para crear avatares financieros
window.createFinancialRobotAvatar = function(containerId, options) {
    return new FinancialRobotAvatar(containerId, options);
};

// Función para animar canvas (compatibilidad con sistema existente)
window.animateAvatarCanvas = function(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    let animationFrame;

    // Crear una instancia simplificada del robot financiero
    const robot = {
        ctx: ctx,
        canvas: canvas,
        options: {
            size: size,
            primaryColor: '#00d4aa',
            secondaryColor: '#ff6b6b',
            accentColor: '#ffd700',
            animationSpeed: 1
        },
        coins: [],
        graphPoints: [],

        initFinancialElements: function() {
            // Crear monedas flotantes
            for (let i = 0; i < 3; i++) {
                this.coins.push({
                    x: Math.random() * this.options.size,
                    y: Math.random() * this.options.size,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    rotation: 0,
                    value: Math.floor(Math.random() * 100) + 10
                });
            }

            // Crear puntos del gráfico
            for (let i = 0; i < 8; i++) {
                this.graphPoints.push({
                    x: (i / 7) * (this.options.size * 0.6),
                    y: Math.random() * (this.options.size * 0.4) + this.options.size * 0.2,
                    targetY: Math.random() * (this.options.size * 0.4) + this.options.size * 0.2
                });
            }
        },

        drawAvatar: function() {
            const ctx = this.ctx;
            const size = this.options.size;
            const centerX = size / 2;
            const centerY = size / 2;
            const time = Date.now() * 0.001 * this.options.animationSpeed;

            // Limpiar canvas
            ctx.clearRect(0, 0, size, size);

            // Dibujar elementos financieros de fondo
            this.drawFinancialBackground(time);

            // Dibujar robot financiero
            this.drawFinancialRobot(centerX, centerY, time);

            // Dibujar elementos flotantes
            this.drawFloatingElements(time);
        },

        drawFinancialBackground: function(time) {
            const ctx = this.ctx;
            const size = this.options.size;

            // Gradiente de fondo financiero
            const gradient = ctx.createRadialGradient(
                size / 2, size / 2, 0,
                size / 2, size / 2, size / 2
            );
            gradient.addColorStop(0, this.options.primaryColor);
            gradient.addColorStop(1, this.adjustColor(this.options.primaryColor, -40));

            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - 5, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Patrón de dinero sutil
            ctx.strokeStyle = this.options.accentColor;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.1;

            for (let i = 0; i < 5; i++) {
                const radius = (size / 2 - 10) * (i + 1) / 5;
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, radius, 0, 2 * Math.PI);
                ctx.stroke();
            }

            ctx.globalAlpha = 1;
        },

        drawFinancialRobot: function(centerX, centerY, time) {
            const ctx = this.ctx;
            const size = this.options.size;

            // Cabeza del robot financiero
            const headRadius = size * 0.25;
            ctx.beginPath();
            ctx.arc(centerX, centerY - size * 0.1, headRadius, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = this.options.primaryColor;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Ojos con efecto de datos
            this.drawDataEyes(centerX, centerY - size * 0.1, headRadius, time);

            // Boca financiera
            this.drawFinancialMouth(centerX, centerY + size * 0.05, headRadius * 0.8, time);

            // Cuerpo con elementos financieros
            this.drawFinancialBody(centerX, centerY, size, time);

            // Brazos con calculadoras
            this.drawCalculatorArms(centerX, centerY, size, time);

            // Base con gráfico
            this.drawGraphBase(centerX, centerY + size * 0.3, size, time);
        },

        drawDataEyes: function(centerX, centerY, headRadius, time) {
            const ctx = this.ctx;
            const eyeOffsetX = headRadius * 0.4;
            const eyeOffsetY = centerY;
            const eyeRadius = headRadius * 0.15;

            // Ojo izquierdo - datos binarios
            ctx.fillStyle = this.options.secondaryColor;
            ctx.beginPath();
            ctx.arc(centerX - eyeOffsetX, eyeOffsetY, eyeRadius, 0, 2 * Math.PI);
            ctx.fill();

            // Patrón binario en el ojo izquierdo
            ctx.fillStyle = '#ffffff';
            ctx.font = `${eyeRadius * 0.6}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('01', centerX - eyeOffsetX, eyeOffsetY + eyeRadius * 0.2);

            // Ojo derecho - gráfico de barras
            ctx.fillStyle = this.options.accentColor;
            ctx.beginPath();
            ctx.arc(centerX + eyeOffsetX, eyeOffsetY, eyeRadius, 0, 2 * Math.PI);
            ctx.fill();

            // Barras en el ojo derecho
            ctx.fillStyle = '#000000';
            const barWidth = eyeRadius * 0.15;
            const barHeights = [0.3, 0.7, 0.5, 0.9];
            barHeights.forEach((height, i) => {
                const barX = centerX + eyeOffsetX - eyeRadius * 0.4 + i * barWidth * 1.5;
                const barY = eyeOffsetY + eyeRadius * (1 - height);
                const barH = eyeRadius * height;
                ctx.fillRect(barX, barY, barWidth, barH);
            });
        },

        drawFinancialMouth: function(centerX, centerY, width, time) {
            const ctx = this.ctx;

            // Boca con símbolo de dólar animado
            ctx.strokeStyle = this.options.accentColor;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';

            // Sonrisa base
            ctx.beginPath();
            ctx.arc(centerX, centerY, width * 0.4, 0, Math.PI);
            ctx.stroke();

            // Símbolo de dólar en el centro
            ctx.fillStyle = this.options.accentColor;
            ctx.font = `${width * 0.4}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('$', centerX, centerY + width * 0.15);
        },

        drawFinancialBody: function(centerX, centerY, size, time) {
            const ctx = this.ctx;

            // Cuerpo rectangular con esquinas redondeadas
            const bodyWidth = size * 0.4;
            const bodyHeight = size * 0.3;
            const bodyX = centerX - bodyWidth / 2;
            const bodyY = centerY - size * 0.05;

            ctx.fillStyle = this.adjustColor(this.options.primaryColor, 20);
            this.roundedRect(ctx, bodyX, bodyY, bodyWidth, bodyHeight, 8);
            ctx.fill();

            // Pantalla LED con datos financieros
            const screenWidth = bodyWidth * 0.8;
            const screenHeight = bodyHeight * 0.6;
            const screenX = centerX - screenWidth / 2;
            const screenY = bodyY + bodyHeight * 0.15;

            ctx.fillStyle = '#000000';
            this.roundedRect(ctx, screenX, screenY, screenWidth, screenHeight, 4);
            ctx.fill();

            // Texto en la pantalla
            ctx.fillStyle = this.options.accentColor;
            ctx.font = `${screenHeight * 0.25}px monospace`;
            ctx.textAlign = 'center';
            const texts = ['VAN', 'TIR', 'ROI'];
            const currentText = texts[Math.floor(time * 0.5) % texts.length];
            ctx.fillText(currentText, centerX, screenY + screenHeight * 0.6);
        },

        drawCalculatorArms: function(centerX, centerY, size, time) {
            const ctx = this.ctx;
            const armLength = size * 0.2;
            const armOffset = size * 0.15;

            ctx.strokeStyle = this.adjustColor(this.options.primaryColor, 50);
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';

            // Brazo izquierdo con calculadora
            const leftArmAngle = Math.sin(time * 1.5) * 0.3;
            const leftArmEndX = centerX - armOffset + Math.cos(leftArmAngle) * armLength;
            const leftArmEndY = centerY + Math.sin(leftArmAngle) * armLength;

            ctx.beginPath();
            ctx.moveTo(centerX - armOffset, centerY);
            ctx.lineTo(leftArmEndX, leftArmEndY);
            ctx.stroke();

            // Calculadora en la mano izquierda
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(leftArmEndX - 8, leftArmEndY - 6, 16, 12);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(leftArmEndX - 8, leftArmEndY - 6, 16, 12);

            // Botones de calculadora
            ctx.fillStyle = '#000000';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(leftArmEndX - 6 + i * 3, leftArmEndY - 4, 2, 2);
            }

            // Brazo derecho con lápiz
            const rightArmAngle = Math.sin(time * 1.5 + Math.PI) * 0.3;
            const rightArmEndX = centerX + armOffset + Math.cos(rightArmAngle) * armLength;
            const rightArmEndY = centerY + Math.sin(rightArmAngle) * armLength;

            ctx.strokeStyle = this.adjustColor(this.options.primaryColor, 50);
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(centerX + armOffset, centerY);
            ctx.lineTo(rightArmEndX, rightArmEndY);
            ctx.stroke();

            // Lápiz en la mano derecha
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(rightArmEndX - 6, rightArmEndY);
            ctx.lineTo(rightArmEndX + 6, rightArmEndY);
            ctx.stroke();

            // Punta del lápiz
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.moveTo(rightArmEndX + 6, rightArmEndY - 1);
            ctx.lineTo(rightArmEndX + 8, rightArmEndY);
            ctx.lineTo(rightArmEndX + 6, rightArmEndY + 1);
            ctx.closePath();
            ctx.fill();
        },

        drawGraphBase: function(centerX, centerY, size, time) {
            const ctx = this.ctx;
            const baseWidth = size * 0.6;
            const baseHeight = size * 0.15;
            const baseX = centerX - baseWidth / 2;
            const baseY = centerY;

            // Base
            ctx.fillStyle = '#2c3e50';
            this.roundedRect(ctx, baseX, baseY, baseWidth, baseHeight, 4);
            ctx.fill();

            // Gráfico en la base
            ctx.strokeStyle = this.options.accentColor;
            ctx.lineWidth = 2;
            ctx.beginPath();

            // Actualizar puntos del gráfico
            this.graphPoints.forEach((point, i) => {
                point.y += (point.targetY - point.y) * 0.02;
                if (Math.random() < 0.01) {
                    point.targetY = Math.random() * (size * 0.1) + centerY - size * 0.05;
                }

                const graphX = baseX + (i / (this.graphPoints.length - 1)) * baseWidth;
                const graphY = point.y;

                if (i === 0) {
                    ctx.moveTo(graphX, graphY);
                } else {
                    ctx.lineTo(graphX, graphY);
                }
            });

            ctx.stroke();

            // Puntos del gráfico
            ctx.fillStyle = this.options.primaryColor;
            this.graphPoints.forEach((point, i) => {
                const graphX = baseX + (i / (this.graphPoints.length - 1)) * baseWidth;
                ctx.beginPath();
                ctx.arc(graphX, point.y, 2, 0, 2 * Math.PI);
                ctx.fill();
            });
        },

        drawFloatingElements: function(time) {
            const ctx = this.ctx;
            const size = this.options.size;

            // Dibujar monedas flotantes
            this.coins.forEach((coin, i) => {
                coin.x += coin.vx;
                coin.y += coin.vy;
                coin.rotation += 0.02;

                // Rebote en bordes
                if (coin.x < 0 || coin.x > size) coin.vx *= -1;
                if (coin.y < 0 || coin.y > size) coin.vy *= -1;

                ctx.save();
                ctx.translate(coin.x, coin.y);
                ctx.rotate(coin.rotation);

                // Moneda
                ctx.fillStyle = this.options.accentColor;
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, 2 * Math.PI);
                ctx.fill();

                // Borde de la moneda
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Símbolo de dólar en la moneda
                ctx.fillStyle = '#000000';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('$', 0, 3);

                ctx.restore();
            });

            // Dibujar símbolos de dinero flotantes
            ctx.fillStyle = this.options.accentColor;
            ctx.globalAlpha = 0.6;
            const symbols = ['$', '€', '£', '¥'];
            symbols.forEach((symbol, i) => {
                const x = size / 2 + Math.cos(time * 0.5 + i * Math.PI / 2) * (size * 0.3);
                const y = size / 2 + Math.sin(time * 0.5 + i * Math.PI / 2) * (size * 0.3);

                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(symbol, x, y);
            });
            ctx.globalAlpha = 1;
        },

        roundedRect: function(ctx, x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        },

        adjustColor: function(color, amount) {
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
    };

    // Inicializar elementos financieros
    robot.initFinancialElements();

    const animate = () => {
        robot.drawAvatar();
        animationFrame = requestAnimationFrame(animate);
    };

    animate();

    // Retornar función para detener la animación
    return () => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    };
};

// Inicialización automática si hay contenedor
document.addEventListener('DOMContentLoaded', function() {
    const avatarContainer = document.getElementById('chatbot-avatar');
    if (avatarContainer) {
        window.chatbotAvatar = new FinancialRobotAvatar('chatbot-avatar');
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialRobotAvatar;
}
