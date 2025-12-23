/**
 * Módulo de Voz para el Chatbot Econova
 * Reconocimiento de voz y síntesis de voz mejorados
 */

class ChatbotVoiceModule {
    constructor(chatbotCore) {
        this.core = chatbotCore;
        this.recognition = null;
        this.synthesis = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.currentUtterance = null;
        
        this.init();
    }
    
    init() {
        // Inicializar reconocimiento de voz
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        }
        
        if (this.recognition) {
            this.recognition.lang = 'es-PE';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.onListeningStart();
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const confidence = event.results[0][0].confidence;
                
                console.log('🎤 Voz reconocida:', transcript, 'Confianza:', confidence);
                
                if (confidence > 0.5) {
                    this.core.sendMessage(transcript);
                } else {
                    this.showError('No pude entender bien. ¿Puedes repetirlo?');
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Error en reconocimiento de voz:', event.error);
                this.handleRecognitionError(event.error);
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.onListeningEnd();
            };
        }
        
        // Inicializar síntesis de voz
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        }
    }
    
    startListening() {
        if (!this.recognition) {
            this.showError('El reconocimiento de voz no está disponible en tu navegador');
            return false;
        }
        
        if (this.isListening) {
            this.stopListening();
            return false;
        }
        
        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Error iniciando reconocimiento:', error);
            this.showError('No se pudo iniciar el reconocimiento de voz');
            return false;
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    speak(text, options = {}) {
        if (!this.synthesis) {
            console.warn('Síntesis de voz no disponible');
            return false;
        }
        
        // Detener cualquier síntesis anterior
        if (this.isSpeaking) {
            this.synthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-PE';
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 0.8;
        
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.onSpeakingStart();
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.onSpeakingEnd();
        };
        
        utterance.onerror = (event) => {
            console.error('Error en síntesis de voz:', event.error);
            this.isSpeaking = false;
        };
        
        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);
        
        return true;
    }
    
    stopSpeaking() {
        if (this.synthesis && this.isSpeaking) {
            this.synthesis.cancel();
            this.isSpeaking = false;
        }
    }
    
    onListeningStart() {
        // Actualizar UI para mostrar que está escuchando
        const voiceBtn = document.querySelector('.voice-input-btn');
        if (voiceBtn) {
            voiceBtn.classList.add('listening');
            voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        }
        
        // Mostrar indicador visual
        this.showListeningIndicator();
    }
    
    onListeningEnd() {
        // Restaurar UI
        const voiceBtn = document.querySelector('.voice-input-btn');
        if (voiceBtn) {
            voiceBtn.classList.remove('listening');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        }
        
        // Ocultar indicador
        this.hideListeningIndicator();
    }
    
    onSpeakingStart() {
        // Mostrar indicador de que está hablando
        const voiceBtn = document.querySelector('.voice-output-btn');
        if (voiceBtn) {
            voiceBtn.classList.add('speaking');
        }
    }
    
    onSpeakingEnd() {
        // Ocultar indicador
        const voiceBtn = document.querySelector('.voice-output-btn');
        if (voiceBtn) {
            voiceBtn.classList.remove('speaking');
        }
    }
    
    showListeningIndicator() {
        // Crear o mostrar indicador visual de escucha
        let indicator = document.getElementById('voice-listening-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'voice-listening-indicator';
            indicator.className = 'voice-listening-indicator';
            indicator.innerHTML = `
                <div class="listening-animation">
                    <div class="listening-dot"></div>
                    <div class="listening-dot"></div>
                    <div class="listening-dot"></div>
                </div>
                <span>Escuchando...</span>
            `;
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'flex';
    }
    
    hideListeningIndicator() {
        const indicator = document.getElementById('voice-listening-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    handleRecognitionError(error) {
        const errorMessages = {
            'no-speech': 'No se detectó voz. Intenta de nuevo.',
            'audio-capture': 'No se pudo acceder al micrófono.',
            'not-allowed': 'Permiso de micrófono denegado.',
            'network': 'Error de red. Verifica tu conexión.',
            'aborted': 'Reconocimiento cancelado.',
            'service-not-allowed': 'Servicio de reconocimiento no disponible.'
        };
        
        const message = errorMessages[error] || 'Error en reconocimiento de voz';
        this.showError(message);
    }
    
    showError(message) {
        // Mostrar error en la UI
        if (this.core.modules.ui) {
            this.core.modules.ui.showError(message);
        }
    }
    
    isAvailable() {
        return !!(this.recognition || this.synthesis);
    }
}

// Estilos para el indicador de voz
const voiceStyles = `
<style>
.voice-listening-indicator {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
    z-index: 10001;
    display: none;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    animation: slideInFromRight 0.3s ease-out;
}

.listening-animation {
    display: flex;
    gap: 4px;
    align-items: center;
}

.listening-dot {
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    animation: listeningPulse 1.4s infinite ease-in-out;
}

.listening-dot:nth-child(1) { animation-delay: 0s; }
.listening-dot:nth-child(2) { animation-delay: 0.2s; }
.listening-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes listeningPulse {
    0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
    }
    40% {
        transform: scale(1.2);
        opacity: 1;
    }
}

.voice-input-btn.listening {
    background: #ef4444 !important;
    animation: pulse 1s infinite;
}

.voice-output-btn.speaking {
    background: #10b981 !important;
    animation: pulse 1s infinite;
}
</style>
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
    document.head.insertAdjacentHTML('beforeend', voiceStyles);
}

// Exportar
if (typeof window !== 'undefined') {
    window.ChatbotVoiceModule = ChatbotVoiceModule;
}

