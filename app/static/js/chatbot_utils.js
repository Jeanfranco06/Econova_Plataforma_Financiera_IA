/**
 * Utilidades del Chatbot Econova
 * Funciones auxiliares para el procesamiento de mensajes
 */

class ChatbotUtils {
    static formatCurrency(amount, currency = 'PEN') {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    }

    static formatPercentage(value, decimals = 2) {
        return `${(value * 100).toFixed(decimals)}%`;
    }

    static formatNumber(num, decimals = 2) {
        return new Intl.NumberFormat('es-PE', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    }

    static calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePhone(phone) {
        // Validar teléfono peruano (9 dígitos empezando con 9)
        const phoneRegex = /^9\d{8}$/;
        return phoneRegex.test(phone.replace(/\s+/g, ''));
    }

    static sanitizeInput(input) {
        // Remover caracteres peligrosos y normalizar
        return input
            .replace(/[<>]/g, '')
            .trim()
            .substring(0, 1000); // Limitar longitud
    }

    static extractNumbers(text) {
        // Extraer números del texto
        const numbers = text.match(/\d+(\.\d+)?/g);
        return numbers ? numbers.map(n => parseFloat(n)) : [];
    }

    static detectIntent(message) {
        const lowerMessage = message.toLowerCase();

        // Patrones de intención financiera
        const intents = {
            van: /\b(van|valor actual neto|valor actual)\b/i,
            tir: /\b(tir|tasa interna retorno|tasa interna)\b/i,
            wacc: /\b(wacc|costo capital|costo promedio)\b/i,
            prestamo: /\b(prestamo|credito|financiamiento)\b/i,
            ahorro: /\b(ahorro|inversion|invertir)\b/i,
            simulacion: /\b(simulacion|simular|calcular)\b/i,
            consulta: /\b(consulta|pregunta|duda)\b/i,
            registro: /\b(registro|registrar|crear cuenta)\b/i
        };

        for (const [intent, pattern] of Object.entries(intents)) {
            if (pattern.test(lowerMessage)) {
                return intent;
            }
        }

        return 'general';
    }

    static generateResponse(intent, params = {}) {
        const responses = {
            van: `El VAN (Valor Actual Neto) es una herramienta financiera que calcula el valor presente de los flujos de efectivo futuros. ¿Te gustaría que te ayude a calcular el VAN de un proyecto?`,

            tir: `La TIR (Tasa Interna de Retorno) es la tasa de descuento que hace que el VAN sea cero. Es útil para comparar la rentabilidad de diferentes inversiones. ¿Quieres calcular la TIR de algún proyecto?`,

            wacc: `El WACC (Costo Promedio Ponderado del Capital) representa el costo promedio del capital de una empresa. Se utiliza para evaluar la rentabilidad de proyectos de inversión. ¿Te gustaría calcular tu WACC?`,

            prestamo: `Para solicitar un préstamo, necesito conocer algunos datos como el monto deseado, plazo y tu capacidad de pago. ¿Quieres que te ayude a analizar las opciones disponibles?`,

            ahorro: `El ahorro inteligente es fundamental para construir patrimonio. Puedo ayudarte a crear un plan de ahorro personalizado basado en tus ingresos y objetivos. ¿Te gustaría empezar?`,

            simulacion: `Puedo ayudarte a simular diferentes escenarios financieros. ¿Qué tipo de simulación te interesa: VAN, TIR, préstamos, inversiones o portafolio?`,

            consulta: `Estoy aquí para ayudarte con tus consultas financieras. Puedes preguntarme sobre conceptos, cálculos, inversiones, préstamos o cualquier tema financiero.`,

            registro: `Para acceder a todas las funcionalidades, necesitas registrarte. El proceso es simple y seguro. ¿Quieres que te guíe paso a paso?`,

            general: `¡Hola! Soy Econova, tu asistente financiero inteligente. Puedo ayudarte con cálculos financieros, simulaciones, consejos de inversión y mucho más. ¿En qué puedo ayudarte hoy?`
        };

        return responses[intent] || responses.general;
    }

    static calculateRiskProfile(answers) {
        // Calcular perfil de riesgo basado en respuestas
        let score = 0;

        // Pregunta 1: Edad
        if (answers.age < 30) score += 3;
        else if (answers.age < 50) score += 2;
        else score += 1;

        // Pregunta 2: Experiencia en inversiones
        if (answers.experience === 'alta') score += 3;
        else if (answers.experience === 'media') score += 2;
        else score += 1;

        // Pregunta 3: Tolerancia a pérdidas
        if (answers.lossTolerance === 'alta') score += 3;
        else if (answers.lossTolerance === 'media') score += 2;
        else score += 1;

        // Pregunta 4: Horizonte temporal
        if (answers.timeHorizon > 10) score += 3;
        else if (answers.timeHorizon > 5) score += 2;
        else score += 1;

        // Determinar perfil
        if (score >= 10) return 'Agresivo';
        if (score >= 7) return 'Moderado';
        return 'Conservador';
    }

    static generateInvestmentRecommendations(riskProfile, capital, objectives) {
        const recommendations = {
            Conservador: [
                { tipo: 'Bonos del Tesoro', porcentaje: 40, riesgo: 'Bajo', retorno_esperado: 3.5 },
                { tipo: 'Fondos Mutuos Conservadores', porcentaje: 35, riesgo: 'Bajo', retorno_esperado: 4.2 },
                { tipo: 'Depósitos a Plazo', porcentaje: 25, riesgo: 'Muy Bajo', retorno_esperado: 2.8 }
            ],
            Moderado: [
                { tipo: 'Acciones Blue Chip', porcentaje: 30, riesgo: 'Medio', retorno_esperado: 7.2 },
                { tipo: 'Bonos Corporativos', porcentaje: 25, riesgo: 'Medio-Bajo', retorno_esperado: 4.8 },
                { tipo: 'Fondos Mutuos Balanceados', porcentaje: 30, riesgo: 'Medio', retorno_esperado: 6.1 },
                { tipo: 'Fondos de Inversión', porcentaje: 15, riesgo: 'Medio', retorno_esperado: 5.9 }
            ],
            Agresivo: [
                { tipo: 'Acciones de Crecimiento', porcentaje: 40, riesgo: 'Alto', retorno_esperado: 12.5 },
                { tipo: 'Criptomonedas', porcentaje: 20, riesgo: 'Muy Alto', retorno_esperado: 25.0 },
                { tipo: 'Fondos de Capital Riesgo', porcentaje: 25, riesgo: 'Alto', retorno_esperado: 15.3 },
                { tipo: 'Derivados', porcentaje: 15, riesgo: 'Muy Alto', retorno_esperado: 18.7 }
            ]
        };

        return recommendations[riskProfile] || recommendations.Moderado;
    }

    static formatFinancialAdvice(data) {
        let advice = "💡 **Recomendación Financiera Personalizada**\n\n";

        if (data.savings_rate < 20) {
            advice += "⚠️ Tu tasa de ahorro es baja. Considera aumentar tus ahorros al menos al 20% de tus ingresos.\n\n";
        }

        if (data.debt_ratio > 30) {
            advice += "⚠️ Tu nivel de endeudamiento es alto. Prioriza reducir tus deudas.\n\n";
        }

        if (data.emergency_fund < 3) {
            advice += "💰 Considera construir un fondo de emergencias equivalente a 3-6 meses de gastos.\n\n";
        }

        if (data.investment_diversification < 3) {
            advice += "📊 Tu portafolio está poco diversificado. Considera invertir en diferentes tipos de activos.\n\n";
        }

        advice += "✅ **Puntos Positivos:**\n";
        if (data.savings_rate >= 20) advice += "• Buena tasa de ahorro\n";
        if (data.debt_ratio <= 30) advice += "• Nivel de endeudamiento saludable\n";
        if (data.emergency_fund >= 3) advice += "• Fondo de emergencias adecuado\n";

        return advice;
    }

    static validateFinancialData(data) {
        const errors = [];

        // Validar montos
        if (data.amount && (data.amount <= 0 || data.amount > 10000000)) {
            errors.push("El monto debe estar entre 1 y 10,000,000");
        }

        // Validar tasas de interés
        if (data.rate && (data.rate < 0 || data.rate > 50)) {
            errors.push("La tasa debe estar entre 0% y 50%");
        }

        // Validar plazos
        if (data.periods && (data.periods < 1 || data.periods > 360)) {
            errors.push("El plazo debe estar entre 1 y 360 períodos");
        }

        // Validar flujos de efectivo
        if (data.cashflows && !Array.isArray(data.cashflows)) {
            errors.push("Los flujos deben ser una lista de números");
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    static saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Error saving to localStorage:', error);
            return false;
        }
    }

    static loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Error loading from localStorage:', error);
            return null;
        }
    }

    static clearLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Error clearing localStorage:', error);
            return false;
        }
    }
}

// Funciones de utilidad globales
window.ChatbotUtils = ChatbotUtils;

// Funciones de ayuda para el chatbot
window.formatCurrency = (amount, currency = 'PEN') => ChatbotUtils.formatCurrency(amount, currency);
window.formatPercentage = (value, decimals = 2) => ChatbotUtils.formatPercentage(value, decimals);
window.formatNumber = (num, decimals = 2) => ChatbotUtils.formatNumber(num, decimals);

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotUtils;
}
