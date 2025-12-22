/**
 * Módulo Principal de Simulación Financiera - Econova
 * Orquestador principal que coordina todos los módulos
 */

class SimulacionFinanciera {
    constructor() {
        this.simulaciones = {};
        this.calculadoras = {};
        this.init();
    }

    init() {
        console.log('📊 Módulo Principal de Simulación Financiera inicializado');
        this.setupEventListeners();
        this.setupSimulationTypeButtons();
        this.inicializarCalculadoras();
        UIUtils.inicializarGraficos();
    }

    /**
     * Inicializa todas las calculadoras disponibles
     */
    inicializarCalculadoras() {
        // VAN Calculator
        if (typeof VANCalculator !== 'undefined') {
            this.calculadoras.van = new VANCalculator();
            window.vanCalculator = this.calculadoras.van;
        }

        // TIR Calculator
        if (typeof TIRCalculator !== 'undefined') {
            this.calculadoras.tir = new TIRCalculator();
            window.tirCalculator = this.calculadoras.tir;
        }

        // WACC Calculator
        if (typeof WACCCalculator !== 'undefined') {
            this.calculadoras.wacc = new WACCCalculator();
            window.waccCalculator = this.calculadoras.wacc;
        }

        // Portfolio Calculator
        if (typeof PortfolioCalculator !== 'undefined') {
            this.calculadoras.portafolio = new PortfolioCalculator();
            window.portfolioCalculator = this.calculadoras.portafolio;
        }

        // ML Calculator
        if (typeof MLCalculator !== 'undefined') {
            this.calculadoras.ml = new MLCalculator();
            window.mlCalculator = this.calculadoras.ml;
        }

        console.log('📊 Calculadoras inicializadas:', Object.keys(this.calculadoras));
    }

    setupEventListeners() {
        // Escuchar eventos de formularios de simulación
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'van-form') {
                e.preventDefault();
                if (this.calculadoras.van) {
                    this.calculadoras.van.simular(e.target);
                }
            }
            if (e.target.id === 'tir-form') {
                e.preventDefault();
                if (this.calculadoras.tir) {
                    this.calculadoras.tir.simular(e.target);
                }
            }
            if (e.target.id === 'wacc-form') {
                e.preventDefault();
                if (this.calculadoras.wacc) {
                    this.calculadoras.wacc.simular(e.target);
                }
            }
            if (e.target.id === 'portafolio-form') {
                e.preventDefault();
                if (this.calculadoras.portafolio) {
                    this.calculadoras.portafolio.simular(e.target);
                }
            }
            // ML Analysis forms
            if (e.target.id === 'prediccion-form') {
                e.preventDefault();
                if (this.calculadoras.ml) {
                    this.calculadoras.ml.analizarPredicciones(e.target);
                }
            }
            if (e.target.id === 'tornado-form') {
                e.preventDefault();
                if (this.calculadoras.ml) {
                    this.calculadoras.ml.analizarTornado(e.target);
                }
            }
            if (e.target.id === 'montecarlo-form') {
                e.preventDefault();
                if (this.calculadoras.ml) {
                    this.calculadoras.ml.simularMonteCarlo(e.target);
                }
            }
            if (e.target.id === 'sensibilidad-form') {
                e.preventDefault();
                if (this.calculadoras.ml) {
                    this.calculadoras.ml.analizarSensibilidad(e.target);
                }
            }
        });

        // Escuchar eventos de tabs ML
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ml-tab-btn') || e.target.closest('.ml-tab-btn')) {
                const tabBtn = e.target.classList.contains('ml-tab-btn') ? e.target : e.target.closest('.ml-tab-btn');
                UIUtils.cambiarTabML(tabBtn.id);
            }
        });

        // Escuchar eventos de cambio en inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('simulacion-input')) {
                this.actualizarSimulacionTiempoReal(e.target);
            }
        });

        // Escuchar eventos de botones de agregar año
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-flujo-van' || e.target.closest('#add-flujo-van')) {
                e.preventDefault();
                if (this.calculadoras.van) {
                    this.calculadoras.van.agregarAnio();
                }
            }
            if (e.target.id === 'add-flujo-tir' || e.target.closest('#add-flujo-tir')) {
                e.preventDefault();
                if (this.calculadoras.tir) {
                    this.calculadoras.tir.agregarAnio();
                }
            }
            if (e.target.id === 'add-activo-portafolio' || e.target.closest('#add-activo-portafolio')) {
                e.preventDefault();
                if (this.calculadoras.portafolio) {
                    this.calculadoras.portafolio.agregarActivo();
                }
            }
            // ML Calculator add period buttons - check for closest button with class
            const tornadoBtn = e.target.closest('#add-flujo-tornado') || e.target.closest('.add-period-btn[data-type="tornado"]');
            if (tornadoBtn) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add tornado period button clicked', tornadoBtn);
                if (this.calculadoras.ml) {
                    this.calculadoras.ml.agregarAnioTornado();
                }
            }

            const montecarloBtn = e.target.closest('#add-flujo-montecarlo') || e.target.closest('.add-period-btn[data-type="montecarlo"]');
            if (montecarloBtn) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add montecarlo period button clicked', montecarloBtn);
                if (this.calculadoras.ml) {
                    this.calculadoras.ml.agregarAnioMonteCarlo();
                }
            }

            const sensibilidadBtn = e.target.closest('#add-flujo-sensibilidad') || e.target.closest('.add-period-btn[data-type="sensibilidad"]');
            if (sensibilidadBtn) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add sensibilidad period button clicked', sensibilidadBtn);
                if (this.calculadoras.ml) {
                    this.calculadoras.ml.agregarAnioSensibilidad();
                }
            }
        });

        // Escuchar eventos de actualización de gráficos
        document.addEventListener('actualizarGrafico', (event) => {
            UIUtils.actualizarGrafico(event.detail);
        });
    }

    /**
     * Configurar botones de tipo de simulación
     */
    setupSimulationTypeButtons() {
        UIUtils.setupSimulationTypeButtons();
    }

    /**
     * Actualiza simulación en tiempo real
     */
    actualizarSimulacionTiempoReal(input) {
        UIUtils.actualizarSimulacionTiempoReal(input);
    }

    /**
     * API pública para acceder a simulaciones guardadas
     */
    obtenerSimulacion(tipo) {
        return UIUtils.obtenerSimulacion(tipo);
    }

    listarSimulaciones() {
        return UIUtils.listarSimulaciones();
    }

    exportarResultados(tipo) {
        return UIUtils.exportarResultados(tipo);
    }

    /**
     * Método de compatibilidad para funciones legacy
     */
    simularVAN(form) {
        if (this.calculadoras.van) {
            this.calculadoras.van.simular(form);
        }
    }

    simularTIR(form) {
        if (this.calculadoras.tir) {
            this.calculadoras.tir.simular(form);
        }
    }

    simularWACC(form) {
        if (this.calculadoras.wacc) {
            this.calculadoras.wacc.simular(form);
        }
    }

    simularPortafolio(form) {
        if (this.calculadoras.portafolio) {
            this.calculadoras.portafolio.simular(form);
        }
    }

    analizarPredicciones(form) {
        if (this.calculadoras.ml) {
            this.calculadoras.ml.analizarPredicciones(form);
        }
    }

    analizarTornado(form) {
        if (this.calculadoras.ml) {
            this.calculadoras.ml.analizarTornado(form);
        }
    }

    simularMonteCarlo(form) {
        if (this.calculadoras.ml) {
            this.calculadoras.ml.simularMonteCarlo(form);
        }
    }

    analizarSensibilidad(form) {
        if (this.calculadoras.ml) {
            this.calculadoras.ml.analizarSensibilidad(form);
        }
    }

    cambiarTabML(tabId) {
        UIUtils.cambiarTabML(tabId);
    }

    agregarAnioVAN() {
        if (this.calculadoras.van) {
            this.calculadoras.van.agregarAnio();
        }
    }

    actualizarGrafico(detalles) {
        UIUtils.actualizarGrafico(detalles);
    }

    mostrarError(mensaje) {
        UIUtils.mostrarError(mensaje);
    }

    guardarSimulacion(tipo, datos) {
        UIUtils.guardarSimulacion(tipo, datos);
    }

    dispararEvento(evento, datos) {
        UIUtils.dispararEvento(evento, datos);
    }
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
               typeof MLCalculator !== 'undefined';
    };

    // Si las dependencias están listas, inicializar
    if (dependenciesLoaded()) {
        window.simulacionFinanciera = new SimulacionFinanciera();
        console.log('📊 Sistema de Simulación Financiera modular inicializado');
    } else {
        // Esperar a que se carguen las dependencias
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos máximo

        const checkDependencies = () => {
            attempts++;
            if (dependenciesLoaded()) {
                window.simulacionFinanciera = new SimulacionFinanciera();
                console.log('📊 Sistema de Simulación Financiera modular inicializado');
            } else if (attempts < maxAttempts) {
                setTimeout(checkDependencies, 100);
            } else {
                console.error('❌ Error: No se pudieron cargar las dependencias del sistema modular');
            }
        };

        checkDependencies();
    }
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimulacionFinanciera;
}
