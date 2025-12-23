/**
 * Módulo Principal de Simulación Financiera - Econova
 * Orquestador principal que coordina todos los módulos
 */

class SimulacionFinanciera {
    constructor() {
        this.simulaciones = {};this.calculadoras = {};this.init();}

    init() {
    // Módulo Principal de Simulación Financiera inicializado
        this.setupEventListeners();this.setupSimulationTypeButtons();this.inicializarCalculadoras();UIUtils.inicializarGraficos();}

    /**
     * Inicializa todas las calculadoras disponibles
     */
    inicializarCalculadoras() {
        // VAN Calculator
        if (typeof VANCalculator !== 'undefined') {
            this.calculadoras.van = new VANCalculator();window.vanCalculator = this.calculadoras.van;}

        // TIR Calculator
        if (typeof TIRCalculator !== 'undefined') {
            this.calculadoras.tir = new TIRCalculator();window.tirCalculator = this.calculadoras.tir;}

        // WACC Calculator
        if (typeof WACCCalculator !== 'undefined') {
            this.calculadoras.wacc = new WACCCalculator();window.waccCalculator = this.calculadoras.wacc;}

        // Portfolio Calculator
        if (typeof PortfolioCalculator !== 'undefined') {
            this.calculadoras.portafolio = new PortfolioCalculator();window.portfolioCalculator = this.calculadoras.portafolio;}

        // ML Calculator
        if (typeof MLCalculator !== 'undefined') {
            this.calculadoras.ml = new MLCalculator();window.mlCalculator = this.calculadoras.ml;}

    }

    setupEventListeners() {
        // Escuchar eventos de formularios de simulación
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'van-form') {
                e.preventDefault();if (this.calculadoras.van) {
                    this.calculadoras.van.simular(e.target);}
            }
            if (e.target.id === 'tir-form') {
                e.preventDefault();if (this.calculadoras.tir) {
                    this.calculadoras.tir.simular(e.target);}
            }
            if (e.target.id === 'wacc-form') {
                e.preventDefault();if (this.calculadoras.wacc) {
                    this.calculadoras.wacc.simular(e.target);}
            }
            if (e.target.id === 'portafolio-form') {
                e.preventDefault();if (this.calculadoras.portafolio) {
                    this.calculadoras.portafolio.simular(e.target);}
            }
            // ML Analysis forms
            if (e.target.id === 'prediccion-form') {
                e.preventDefault();if (this.calculadoras.ml) {
                    this.calculadoras.ml.analizarPredicciones(e.target);}
            }
            if (e.target.id === 'tornado-form') {
                e.preventDefault();if (this.calculadoras.ml) {
                    this.calculadoras.ml.analizarTornado(e.target);}
            }
            if (e.target.id === 'montecarlo-form') {
                e.preventDefault();if (this.calculadoras.ml) {
                    this.calculadoras.ml.simularMonteCarlo(e.target);}
            }
            if (e.target.id === 'sensibilidad-form') {
                e.preventDefault();if (this.calculadoras.ml) {
                    this.calculadoras.ml.analizarSensibilidad(e.target);}
            }
        });// Escuchar eventos de tabs ML
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ml-tab-btn') || e.target.closest('.ml-tab-btn')) {
                const tabBtn = e.target.classList.contains('ml-tab-btn') ? e.target : e.target.closest('.ml-tab-btn');UIUtils.cambiarTabML(tabBtn.id);}
        });// Escuchar eventos de cambio en inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('simulacion-input')) {
                this.actualizarSimulacionTiempoReal(e.target);}
        });// Escuchar eventos de botones de agregar año
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-flujo-van' || e.target.closest('#add-flujo-van')) {
                e.preventDefault();if (this.calculadoras.van) {
                    this.calculadoras.van.agregarAnio();}
            }
            if (e.target.id === 'add-flujo-tir' || e.target.closest('#add-flujo-tir')) {
                e.preventDefault();if (this.calculadoras.tir) {
                    this.calculadoras.tir.agregarAnio();}
            }
            if (e.target.id === 'add-activo-portafolio' || e.target.closest('#add-activo-portafolio')) {
                e.preventDefault();if (this.calculadoras.portafolio) {
                    this.calculadoras.portafolio.agregarActivo();}
            }
            // ML Calculator add period buttons - check for closest button with class
            const tornadoBtn = e.target.closest('#add-flujo-tornado') || e.target.closest('.add-period-btn[data-type="tornado"]');if (tornadoBtn) {
                e.preventDefault();e.stopPropagation();if (this.calculadoras.ml) {
                    this.calculadoras.ml.agregarAnioTornado();}
            }

            const montecarloBtn = e.target.closest('#add-flujo-montecarlo') || e.target.closest('.add-period-btn[data-type="montecarlo"]');if (montecarloBtn) {
                e.preventDefault();e.stopPropagation();if (this.calculadoras.ml) {
                    this.calculadoras.ml.agregarAnioMonteCarlo();}
            }

            const sensibilidadBtn = e.target.closest('#add-flujo-sensibilidad') || e.target.closest('.add-period-btn[data-type="sensibilidad"]');if (sensibilidadBtn) {
                e.preventDefault();e.stopPropagation();if (this.calculadoras.ml) {
                    this.calculadoras.ml.agregarAnioSensibilidad();}
            }
        });// Escuchar eventos de botones "Consultar con IA"
        document.addEventListener('click', (e) => {
            if (e.target.id === 'van-consultar-ia' || e.target.closest('#van-consultar-ia')) {
                e.preventDefault();this.consultarConIA('van');}
            if (e.target.id === 'tir-consultar-ia' || e.target.closest('#tir-consultar-ia')) {
                e.preventDefault();this.consultarConIA('tir');}
            if (e.target.id === 'wacc-consultar-ia' || e.target.closest('#wacc-consultar-ia')) {
                e.preventDefault();this.consultarConIA('wacc');}
            if (e.target.id === 'portafolio-consultar-ia' || e.target.closest('#portafolio-consultar-ia')) {
                e.preventDefault();this.consultarConIA('portafolio');}
            if (e.target.id === 'ml-consultar-ia' || e.target.closest('#ml-consultar-ia')) {
                e.preventDefault();this.consultarConIA('ml');}
        });// Escuchar eventos de actualización de gráficos
        document.addEventListener('actualizarGrafico', (event) => {
            UIUtils.actualizarGrafico(event.detail);});}

    /**
     * Configurar botones de tipo de simulación
     */
    setupSimulationTypeButtons() {
        UIUtils.setupSimulationTypeButtons();}

    /**
     * Actualiza simulación en tiempo real
     */
    actualizarSimulacionTiempoReal(input) {
        UIUtils.actualizarSimulacionTiempoReal(input);}

    /**
     * API pública para acceder a simulaciones guardadas
     */
    obtenerSimulacion(tipo) {
        return UIUtils.obtenerSimulacion(tipo);}

    listarSimulaciones() {
        return UIUtils.listarSimulaciones();}

    exportarResultados(tipo) {
        return UIUtils.exportarResultados(tipo);}

    /**
     * Método de compatibilidad para funciones legacy
     */
    simularVAN(form) {
        if (this.calculadoras.van) {
            this.calculadoras.van.simular(form);}
    }

    simularTIR(form) {
        if (this.calculadoras.tir) {
            this.calculadoras.tir.simular(form);}
    }

    simularWACC(form) {
        if (this.calculadoras.wacc) {
            this.calculadoras.wacc.simular(form);}
    }

    simularPortafolio(form) {
        if (this.calculadoras.portafolio) {
            this.calculadoras.portafolio.simular(form);}
    }

    analizarPredicciones(form) {
        if (this.calculadoras.ml) {
            this.calculadoras.ml.analizarPredicciones(form);}
    }

    analizarTornado(form) {
        if (this.calculadoras.ml) {
            this.calculadoras.ml.analizarTornado(form);}
    }

    simularMonteCarlo(form) {
        if (this.calculadoras.ml) {
            this.calculadoras.ml.simularMonteCarlo(form);}
    }

    analizarSensibilidad(form) {
        if (this.calculadoras.ml) {
            this.calculadoras.ml.analizarSensibilidad(form);}
    }

    cambiarTabML(tabId) {
        UIUtils.cambiarTabML(tabId);}

    agregarAnioVAN() {
        if (this.calculadoras.van) {
            this.calculadoras.van.agregarAnio();}
    }

    actualizarGrafico(detalles) {
        UIUtils.actualizarGrafico(detalles);}

    mostrarError(mensaje) {
        UIUtils.mostrarError(mensaje);}

    guardarSimulacion(tipo, datos) {
        UIUtils.guardarSimulacion(tipo, datos);}

    dispararEvento(evento, datos) {
        UIUtils.dispararEvento(evento, datos);}

    /**
     * Consultar con IA - Redirige al chatbot con datos contextuales de la simulación
     */
    consultarConIA(tipo) {
        // Obtener datos de la simulación actual
        const datosSimulacion = this.obtenerDatosSimulacionActual(tipo);if (!datosSimulacion) {
            UIUtils.mostrarError('No se encontraron datos de simulación para consultar con IA');return;}

        // Crear mensaje contextual para el chatbot
        const mensajeContextual = this.crearMensajeContextual(tipo, datosSimulacion);// Redirigir al chatbot con los datos contextuales
        this.redirigirAlChatbot(mensajeContextual, datosSimulacion);}

    /**
     * Obtiene los datos de la simulación actual según el tipo
     */
    obtenerDatosSimulacionActual(tipo) {
        switch (tipo) {
            case 'van':
                return this.calculadoras.van ? this.calculadoras.van.obtenerDatosActuales() : null;case 'tir':
                return this.calculadoras.tir ? this.calculadoras.tir.obtenerDatosActuales() : null;case 'wacc':
                return this.calculadoras.wacc ? this.calculadoras.wacc.obtenerDatosActuales() : null;case 'portafolio':
                return this.calculadoras.portafolio ? this.calculadoras.portafolio.obtenerDatosActuales() : null;case 'ml':
                return this.calculadoras.ml ? this.calculadoras.ml.obtenerDatosActuales() : null;default:
                return null;}
    }

    /**
     * Crea un mensaje contextual basado en el tipo de simulación y sus datos
     */
    crearMensajeContextual(tipo, datos) {
        let mensaje = '';switch (tipo) {
            case 'van':
                mensaje = `Hola, acabo de realizar un análisis de VAN (Valor Actual Neto) y me gustaría obtener más insights. Los resultados principales son: VAN = S/ ${datos.van?.toLocaleString() || 'N/A'}, TIR = ${datos.tir?.toFixed(1) || 'N/A'}%, Periodo de recuperación = ${datos.payback?.toFixed(1) || 'N/A'} años. `;mensaje += `Los parámetros utilizados fueron: Inversión inicial = S/ ${datos.inversion?.toLocaleString() || 'N/A'}, Tasa de descuento = ${datos.tasa || 'N/A'}%, `;mensaje += `Flujos de caja: ${datos.flujos ? datos.flujos.map((f, i) => `Año ${i+1}: S/ ${f.toLocaleString()}`).join(', ') : 'No disponibles'}. `;mensaje += '¿Podrías ayudarme a interpretar estos resultados y sugerir mejoras o análisis adicionales?';break;case 'tir':
                mensaje = `Hola, acabo de calcular la TIR (Tasa Interna de Retorno) y me gustaría analizar los resultados más profundamente. Los resultados son: TIR = ${datos.tir?.toFixed(1) || 'N/A'}%, VAN a la TIR = S/ ${datos.van_tir?.toLocaleString() || 'N/A'}. `;mensaje += `Los parámetros fueron: Inversión inicial = S/ ${datos.inversion?.toLocaleString() || 'N/A'}, `;mensaje += `Flujos de caja: ${datos.flujos ? datos.flujos.map((f, i) => `Año ${i+1}: S/ ${f.toLocaleString()}`).join(', ') : 'No disponibles'}. `;mensaje += `Método de cálculo utilizado: ${datos.metodo === 'newton' ? 'Newton-Raphson' : datos.metodo === 'biseccion' ? 'Bisección' : 'Aproximación'}. `;if (datos.evaluacion && datos.evaluacion !== 'no_calculable') {
                    mensaje += `La evaluación de la TIR es: ${datos.evaluacion === 'excelente' ? 'Excelente' : datos.evaluacion === 'muy_buena' ? 'Muy Buena' : datos.evaluacion === 'buena' ? 'Buena' : datos.evaluacion === 'aceptable' ? 'Aceptable' : 'Baja'}. `;}
                mensaje += '¿Qué opinas sobre la rentabilidad de este proyecto? ¿Debería compararlo con el WACC? ¿Qué factores podrían afectar la TIR calculada?';break;case 'wacc':
                mensaje = `Hola, acabo de calcular el WACC (Costo Promedio Ponderado del Capital) y necesito ayuda para interpretarlo. El resultado es: WACC = ${datos.wacc?.toFixed(1) || 'N/A'}%. `;mensaje += `Los componentes son: Costo de deuda = ${datos.costo_deuda?.toFixed(1) || 'N/A'}%, Peso de deuda = ${datos.peso_deuda?.toFixed(1) || 'N/A'}%, `;mensaje += `Costo de capital propio = ${datos.costo_capital?.toFixed(1) || 'N/A'}%, Peso de capital propio = ${datos.peso_capital?.toFixed(1) || 'N/A'}%, Tasa de impuestos = ${datos.tasa_impuestos?.toFixed(1) || 'N/A'}%. `;mensaje += '¿Cómo debería usar este WACC en mis análisis de VAN y TIR? ¿Está en línea con el sector?';break;case 'portafolio':
                mensaje = `Hola, acabo de optimizar un portafolio de inversiones y me gustaría obtener recomendaciones adicionales. Los resultados son: Retorno esperado = ${datos.retorno?.toFixed(1) || 'N/A'}%, Riesgo = ${datos.riesgo?.toFixed(1) || 'N/A'}%, Ratio Sharpe = ${datos.sharpe?.toFixed(2) || 'N/A'}. `;mensaje += `El portafolio actual tenía ${datos.activos_actual?.length || 0} activos, y el óptimo tiene ${datos.activos_optimo?.length || 0} activos. `;mensaje += '¿Qué opinas sobre esta distribución? ¿Debería considerar otros factores como diversificación geográfica o sectorial?';break;case 'ml':
                if (datos.tipo_analisis === 'predicciones') {
                    mensaje = `Hola, acabo de realizar predicciones financieras usando Machine Learning y me gustaría analizar los resultados obtenidos. `;mensaje += `Las predicciones muestran tendencias para ${datos.periodos_prediccion || 'N/A'} períodos futuros basadas en ${datos.variables_entrada?.length || 0} indicadores financieros. `;mensaje += `El modelo utilizado fue ${datos.modelo || 'N/A'} con una precisión del ${datos.precision?.toFixed(1) || 'N/A'}%. `;mensaje += `Las proyecciones indican ${datos.tendencia_principal || 'tendencias mixtas'} para los próximos meses. `;mensaje += '¿Podrías ayudarme a interpretar estas predicciones y sugerir estrategias basadas en ellas?';} else if (datos.tipo_analisis === 'tornado') {
                    mensaje = `Hola, acabo de completar un análisis tornado (análisis de sensibilidad) y me gustaría profundizar en los resultados. `;mensaje += `Se analizaron ${datos.variables?.length || 0} variables críticas que afectan el VAN del proyecto. `;mensaje += `La variable más sensible resultó ser "${datos.variable_mas_sensible || 'N/A'}" con un impacto del ${datos.impacto_maximo?.toFixed(1) || 'N/A'}% en el VAN. `;mensaje += `El rango de variación analizado fue de ${datos.rango_variacion || 'N/A'}% en cada variable. `;mensaje += '¿Cómo debería considerar estos factores de riesgo en mi toma de decisiones?';} else if (datos.tipo_analisis === 'montecarlo') {
                    mensaje = `Hola, acabo de ejecutar una simulación Monte Carlo y me gustaría analizar los resultados obtenidos. `;mensaje += `Se generaron ${datos.num_simulaciones?.toLocaleString() || 'N/A'} escenarios simulados. `;mensaje += `El VAN promedio resultó ser S/ ${datos.van_promedio?.toLocaleString() || 'N/A'}, con una desviación estándar de S/ ${datos.desviacion_van?.toLocaleString() || 'N/A'}. `;mensaje += `El intervalo de confianza del ${datos.nivel_confianza || 'N/A'}% va desde S/ ${datos.van_minimo?.toLocaleString() || 'N/A'} hasta S/ ${datos.van_maximo?.toLocaleString() || 'N/A'}. `;mensaje += `La probabilidad de VAN positivo es del ${datos.probabilidad_positivo?.toFixed(1) || 'N/A'}%. `;mensaje += '¿Qué implicaciones tiene esta distribución de probabilidades para la viabilidad del proyecto?';} else if (datos.tipo_analisis === 'sensibilidad') {
                    mensaje = `Hola, acabo de realizar un análisis de sensibilidad completo y me gustaría obtener insights adicionales. `;mensaje += `Se evaluaron ${datos.escenarios?.length || 0} escenarios diferentes variando ${datos.variables_analizadas?.length || 0} parámetros clave. `;mensaje += `El punto de equilibrio se encontró en ${datos.punto_equilibrio || 'N/A'} unidades con flujos de caja de S/ ${datos.flujo_equilibrio?.toLocaleString() || 'N/A'}. `;mensaje += `La variable con mayor impacto resultó ser "${datos.variable_critica || 'N/A'}" con una elasticidad del ${datos.elasticidad_critica?.toFixed(2) || 'N/A'}. `;mensaje += '¿Cómo debería usar esta información para gestionar riesgos y tomar decisiones más informadas?';} else {
                    mensaje = `Hola, acabo de realizar un análisis avanzado con Machine Learning y me gustaría profundizar en los resultados obtenidos. `;mensaje += `El análisis realizado fue de tipo ${datos.tipo_analisis || 'general'} y generó insights valiosos para la toma de decisiones. `;mensaje += '¿Podrías ayudarme a interpretar estos resultados avanzados y sugerir próximos pasos?';}
                break;default:
                mensaje = 'Hola, acabo de realizar un análisis financiero y me gustaría obtener más insights sobre los resultados obtenidos.';}

        return mensaje;}

    /**
     * Redirige al chatbot con los datos contextuales
     */
    redirigirAlChatbot(mensaje, datos) {
        // Crear contexto estructurado para el chatbot
        const contextoChatbot = {
            tipo_analisis: datos.tipo_analisis || datos.tipo || 'general',
            resultados: datos.resultado || datos,
            mensaje_contextual: mensaje,
            timestamp: new Date().toISOString()
        };// Guardar en sessionStorage para evitar problemas de codificación URL
        sessionStorage.setItem('currentAnalysisContext', JSON.stringify(contextoChatbot));// Codificar de manera segura para URL (evitando caracteres problemáticos)
        const datosSimplificados = {
            tipo_analisis: contextoChatbot.tipo_analisis,
            timestamp: contextoChatbot.timestamp
        };const datosCodificados = encodeURIComponent(JSON.stringify(datosSimplificados));// Redirigir al chatbot con datos contextuales
        window.location.href = `/chatbot?contexto=${datosCodificados}`;}
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que las dependencias estén cargadas
    const dependenciesLoaded = () => {
        return typeof FinancialUtils !== 'undefined' &&
               typeof ValidationUtils !== 'undefined' &&
               typeof UIUtils !== 'undefined' &&
               typeof VANCalculator !== 'undefined' &&
               typeof TIRCalculator !== 'undefined' &&
               typeof WACCCalculator !== 'undefined' &&
               typeof PortfolioCalculator !== 'undefined' &&
               typeof MLCalculator !== 'undefined';};// Si las dependencias están listas, inicializar
    if (dependenciesLoaded()) {
        window.simulacionFinanciera = new SimulacionFinanciera();// Sistema de Simulación Financiera modular inicializado
    } else {
        // Esperar a que se carguen las dependencias
        let attempts = 0;const maxAttempts = 50; // 5 segundos máximo

        const checkDependencies = () => {
            attempts++;if (dependenciesLoaded()) {
                window.simulacionFinanciera = new SimulacionFinanciera();} else if (attempts < maxAttempts) {
                setTimeout(checkDependencies, 100);} else {
                // Error: No se pudieron cargar las dependencias del sistema modular
            }
        };checkDependencies();}
});// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimulacionFinanciera;}
