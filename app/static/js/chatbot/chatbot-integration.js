/**
 * Sistema de Integración del Chatbot con Calculadoras Financieras
 * Mejora la comunicación entre calculadoras y el chatbot
 */

class ChatbotIntegration {
    constructor() {
        this.analysisContext = null;
        this.contextHistory = [];
        this.init();
    }
    
    init() {
        // Escuchar eventos de calculadoras
        this.setupCalculatorListeners();
        
        // Exponer función global para obtener contexto
        window.getCurrentAnalysisContext = () => this.getAnalysisContext();
        window.setAnalysisContext = (context) => this.setAnalysisContext(context);
        window.clearAnalysisContext = () => this.clearAnalysisContext();
        
        // Cargar contexto desde localStorage
        this.loadStoredContext();
    }
    
    setupCalculatorListeners() {
        // Eventos de calculadoras financieras
        document.addEventListener('vanSimulado', (e) => {
            this.handleVANCalculation(e.detail);
        });
        
        document.addEventListener('tirCalculada', (e) => {
            this.handleTIRCalculation(e.detail);
        });
        
        document.addEventListener('waccCalculado', (e) => {
            this.handleWACCCalculation(e.detail);
        });
        
        document.addEventListener('portafolioOptimizado', (e) => {
            this.handlePortfolioCalculation(e.detail);
        });
        
        document.addEventListener('mlPrediccionCompletada', (e) => {
            this.handleMLPrediction(e.detail);
        });
        
        document.addEventListener('monteCarloCompletado', (e) => {
            this.handleMonteCarlo(e.detail);
        });
        
        document.addEventListener('tornadoCompletado', (e) => {
            this.handleTornado(e.detail);
        });
        
        document.addEventListener('escenariosCompletados', (e) => {
            this.handleEscenarios(e.detail);
        });
    }
    
    handleVANCalculation(detail) {
        const { datos, resultado } = detail;
        
        this.setAnalysisContext({
            tipo_analisis: 'van',
            resultados: {
                van: resultado.van,
                tir: resultado.tir,
                payback: resultado.payback,
                inversion: datos.inversion,
                flujos: datos.flujos,
                tasa_descuento: datos.tasaDescuento
            },
            metadata: {
                nombre_proyecto: datos.nombreProyecto,
                sector: datos.sector,
                timestamp: new Date().toISOString()
            }
        });
        
        this.suggestChatbotConsultation('van', resultado);
    }
    
    handleTIRCalculation(detail) {
        const { datos, resultado } = detail;
        
        this.setAnalysisContext({
            tipo_analisis: 'tir',
            resultados: {
                tir: resultado.tir,
                van: resultado.van,
                metodo: resultado.metodo,
                evaluacion: resultado.evaluacion,
                inversion: datos.inversion,
                flujos: datos.flujos
            },
            metadata: {
                nombre_proyecto: datos.nombreProyecto || 'Proyecto',
                timestamp: new Date().toISOString()
            }
        });
        
        this.suggestChatbotConsultation('tir', resultado);
    }
    
    handleWACCCalculation(detail) {
        const { datos, resultado } = detail;
        
        this.setAnalysisContext({
            tipo_analisis: 'wacc',
            resultados: {
                wacc: resultado.wacc,
                costo_equity: resultado.costo_equity,
                costo_deuda: resultado.costo_deuda,
                estructura_capital: resultado.estructura_capital
            },
            metadata: {
                timestamp: new Date().toISOString()
            }
        });
        
        this.suggestChatbotConsultation('wacc', resultado);
    }
    
    handlePortfolioCalculation(detail) {
        const { datos, resultado } = detail;
        
        this.setAnalysisContext({
            tipo_analisis: 'portafolio',
            resultados: {
                rendimiento: resultado.rendimiento_esperado,
                riesgo: resultado.volatilidad,
                sharpe: resultado.sharpe_ratio,
                composicion: resultado.composicion
            },
            metadata: {
                timestamp: new Date().toISOString()
            }
        });
        
        this.suggestChatbotConsultation('portafolio', resultado);
    }
    
    handleMLPrediction(detail) {
        const { datos, resultado } = detail;
        
        this.setAnalysisContext({
            tipo_analisis: 'prediccion',
            resultados: {
                ingresos_predichos: resultado.ingresos_predichos,
                crecimiento_porcentaje: resultado.crecimiento,
                nivel_riesgo: resultado.nivel_riesgo,
                confianza: resultado.confianza
            },
            metadata: {
                modelo_usado: resultado.modelo,
                timestamp: new Date().toISOString()
            }
        });
        
        this.suggestChatbotConsultation('prediccion', resultado);
    }
    
    handleMonteCarlo(detail) {
        const { datos, resultado } = detail;
        
        this.setAnalysisContext({
            tipo_analisis: 'montecarlo',
            resultados: {
                van_medio: resultado.van_medio,
                probabilidad_van_positivo: resultado.probabilidad_exito,
                desviacion: resultado.desviacion_estandar,
                variable_mas_sensible: resultado.variable_mas_sensible,
                percentiles: resultado.percentiles
            },
            metadata: {
                simulaciones: resultado.num_simulaciones,
                timestamp: new Date().toISOString()
            }
        });
        
        this.suggestChatbotConsultation('montecarlo', resultado);
    }
    
    handleTornado(detail) {
        const { datos, resultado } = detail;
        
        this.setAnalysisContext({
            tipo_analisis: 'tornado',
            resultados: {
                variable_mas_sensible: resultado.variable_mas_sensible,
                impacto_maximo: resultado.impacto_maximo,
                variables: resultado.variables_ordenadas
            },
            metadata: {
                timestamp: new Date().toISOString()
            }
        });
        
        this.suggestChatbotConsultation('tornado', resultado);
    }
    
    handleEscenarios(detail) {
        const { datos, resultado } = detail;
        
        this.setAnalysisContext({
            tipo_analisis: 'escenarios',
            resultados: {
                pesimista: resultado.escenario_pesimista,
                base: resultado.escenario_base,
                optimista: resultado.escenario_optimista,
                recomendacion: resultado.recomendacion
            },
            metadata: {
                timestamp: new Date().toISOString()
            }
        });
        
        this.suggestChatbotConsultation('escenarios', resultado);
    }
    
    setAnalysisContext(context) {
        this.analysisContext = context;
        this.contextHistory.push({
            ...context,
            timestamp: new Date().toISOString()
        });
        
        // Mantener solo últimos 10 contextos
        if (this.contextHistory.length > 10) {
            this.contextHistory = this.contextHistory.slice(-10);
        }
        
        // Guardar en window para compatibilidad
        window.currentAnalysisContext = context;
        window.storedAnalysisContext = context;
        
        // Guardar en localStorage
        try {
            localStorage.setItem('currentAnalysisContext', JSON.stringify(context));
        } catch (e) {
            console.warn('Error guardando contexto en localStorage:', e);
        }
        
        console.log('📊 Contexto de análisis actualizado:', context);
    }
    
    getAnalysisContext() {
        return this.analysisContext || window.currentAnalysisContext || null;
    }
    
    clearAnalysisContext() {
        this.analysisContext = null;
        window.currentAnalysisContext = null;
        window.storedAnalysisContext = null;
        localStorage.removeItem('currentAnalysisContext');
    }
    
    loadStoredContext() {
        try {
            const stored = localStorage.getItem('currentAnalysisContext');
            if (stored) {
                const context = JSON.parse(stored);
                // Verificar que no sea muy antiguo (máximo 1 hora)
                if (context.metadata && context.metadata.timestamp) {
                    const contextTime = new Date(context.metadata.timestamp);
                    const now = new Date();
                    const hoursDiff = (now - contextTime) / (1000 * 60 * 60);
                    
                    if (hoursDiff < 1) {
                        this.setAnalysisContext(context);
                        console.log('✅ Contexto cargado desde almacenamiento');
                    } else {
                        this.clearAnalysisContext();
                    }
                }
            }
        } catch (e) {
            console.warn('Error cargando contexto almacenado:', e);
        }
    }
    
    suggestChatbotConsultation(tipo, resultado) {
        // Mostrar sugerencia para consultar con el chatbot
        const suggestionMessages = {
            'van': `Tu VAN calculado es S/ ${resultado.van?.toLocaleString() || 'N/A'}. ¿Quieres que te ayude a interpretar este resultado?`,
            'tir': `Tu TIR calculada es ${resultado.tir?.toFixed(2) || 'N/A'}%. ¿Te gustaría analizar qué significa este valor?`,
            'wacc': `Tu WACC calculado es ${resultado.wacc?.toFixed(2) || 'N/A'}%. ¿Quieres saber cómo usar este valor?`,
            'portafolio': `Tu portafolio tiene un rendimiento esperado del ${resultado.rendimiento_esperado?.toFixed(2) || 'N/A'}%. ¿Te ayudo a optimizarlo?`,
            'prediccion': `Las predicciones muestran ingresos de S/ ${resultado.ingresos_predichos?.toLocaleString() || 'N/A'}. ¿Quieres analizar estos resultados?`,
            'montecarlo': `La simulación Monte Carlo muestra una probabilidad de éxito del ${(resultado.probabilidad_exito * 100)?.toFixed(1) || 'N/A'}%. ¿Te explico qué significa?`,
            'tornado': `El análisis de sensibilidad identifica "${resultado.variable_mas_sensible || 'N/A'}" como la variable más crítica. ¿Quieres estrategias para gestionarla?`,
            'escenarios': `Los escenarios muestran resultados desde S/ ${resultado.escenario_pesimista?.toLocaleString() || 'N/A'} hasta S/ ${resultado.escenario_optimista?.toLocaleString() || 'N/A'}. ¿Te ayudo a interpretarlos?`
        };
        
        const message = suggestionMessages[tipo];
        if (message) {
            // Mostrar notificación
            this.showChatbotSuggestion(message, tipo);
        }
    }
    
    showChatbotSuggestion(message, tipo) {
        // Crear notificación elegante
        const notification = document.createElement('div');
        notification.className = 'chatbot-suggestion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">💡</div>
                <div class="notification-text">
                    <strong>Consulta con Econova AI</strong>
                    <p>${message}</p>
                </div>
                <div class="notification-actions">
                    <button class="btn-suggest-yes" data-type="${tipo}">Sí, consultar</button>
                    <button class="btn-suggest-dismiss">Cerrar</button>
                </div>
            </div>
        `;
        
        // Estilos inline para la notificación
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
            z-index: 10000;
            max-width: 350px;
            animation: slideInFromRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Botón "Sí, consultar"
        const yesBtn = notification.querySelector('.btn-suggest-yes');
        yesBtn.addEventListener('click', () => {
            this.openChatbotWithContext(tipo);
            notification.remove();
        });
        
        // Botón cerrar
        const dismissBtn = notification.querySelector('.btn-suggest-dismiss');
        dismissBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-cerrar después de 10 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 10000);
    }
    
    openChatbotWithContext(tipo) {
        // Abrir chatbot y enviar mensaje contextual
        const contextualMessages = {
            'van': '¿Qué significa este VAN calculado? ¿Es bueno para mi proyecto?',
            'tir': '¿Qué significa esta TIR? ¿Cómo la interpreto?',
            'wacc': '¿Cómo uso este WACC en mis decisiones de inversión?',
            'portafolio': '¿Cómo puedo optimizar este portafolio?',
            'prediccion': '¿Cómo interpreto estas predicciones? ¿Son confiables?',
            'montecarlo': '¿Qué significa esta probabilidad de éxito? ¿Cómo gestiono los riesgos?',
            'tornado': '¿Cómo gestiono esta variable crítica?',
            'escenarios': '¿Cómo interpreto estos escenarios? ¿Qué debo hacer?'
        };
        
        const message = contextualMessages[tipo] || '¿Puedes ayudarme a interpretar estos resultados?';
        
        // Abrir chatbot
        if (window.ChatbotAPI) {
            window.ChatbotAPI.open();
            
            // Enviar mensaje después de un breve delay
            setTimeout(() => {
                window.ChatbotAPI.sendMessage(message);
            }, 500);
        } else if (window.econovaChatbotCore) {
            window.econovaChatbotCore.open();
            setTimeout(() => {
                window.econovaChatbotCore.sendMessage(message);
            }, 500);
        } else if (window.econovaChatbot) {
            window.econovaChatbot.openInterface();
            setTimeout(() => {
                window.econovaChatbot.sendMessageProgrammatically(message);
            }, 500);
        }
    }
}

// Inicializar integración
if (typeof window !== 'undefined') {
    window.chatbotIntegration = new ChatbotIntegration();
    console.log('✅ Sistema de integración del chatbot inicializado');
}

