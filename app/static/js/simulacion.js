/**
 * Módulo de Simulación Financiera - Econova
 * Funcionalidades para simulaciones financieras interactivas
 */

class SimulacionFinanciera {
    constructor() {
        this.simulaciones = {};
        this.graficos = {};
        this.init();
    }

    init() {
        console.log('📊 Módulo de Simulación Financiera inicializado');
        this.setupEventListeners();
        this.setupSimulationTypeButtons();
        this.inicializarGraficos();
    }

    setupEventListeners() {
        // Escuchar eventos de formularios de simulación
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'van-form') {
                e.preventDefault();
                this.simularVAN(e.target);
            }
            if (e.target.id === 'tir-form') {
                e.preventDefault();
                this.simularTIR(e.target);
            }
            if (e.target.id === 'wacc-form') {
                e.preventDefault();
                this.simularWACC(e.target);
            }
            if (e.target.id === 'portafolio-form') {
                e.preventDefault();
                this.simularPortafolio(e.target);
            }
            // ML Analysis forms
            if (e.target.id === 'prediccion-form') {
                e.preventDefault();
                this.analizarPredicciones(e.target);
            }
            if (e.target.id === 'tornado-form') {
                e.preventDefault();
                this.analizarTornado(e.target);
            }
            if (e.target.id === 'montecarlo-form') {
                e.preventDefault();
                this.simularMonteCarlo(e.target);
            }
            if (e.target.id === 'sensibilidad-form') {
                e.preventDefault();
                this.analizarSensibilidad(e.target);
            }
        });

        // Escuchar eventos de tabs ML
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ml-tab-btn') || e.target.closest('.ml-tab-btn')) {
                const tabBtn = e.target.classList.contains('ml-tab-btn') ? e.target : e.target.closest('.ml-tab-btn');
                this.cambiarTabML(tabBtn.id);
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
                e.stopImmediatePropagation(); // Detener todos los handlers
                this.agregarAnioVAN();
            }
        }, { capture: true }); // Usar capture para ejecutar primero

        // Escuchar eventos de actualización de gráficos
        document.addEventListener('actualizarGrafico', (event) => {
            this.actualizarGrafico(event.detail);
        });
    }

    /**
     * Configurar botones de tipo de simulación con manejo de estado adecuado
     */
    setupSimulationTypeButtons() {
        const buttons = document.querySelectorAll('.simulation-type-btn, .ml-analysis-btn');
        const calculators = document.querySelectorAll('.simulation-calculator');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // Remover clase active de todos los botones
                buttons.forEach(btn => {
                    btn.classList.remove('active', 'bg-blue-600', 'text-white', 'border-blue-600');
                    btn.classList.remove('bg-purple-600', 'text-purple-600', 'border-purple-600');
                    btn.classList.remove('bg-red-600', 'text-red-600', 'border-red-600');
                    btn.classList.remove('bg-green-600', 'text-green-600', 'border-green-600');
                    btn.classList.remove('bg-indigo-600', 'text-indigo-600', 'border-indigo-600');

                    // Reset to default styles
                    if (btn.classList.contains('simulation-type-btn')) {
                        btn.classList.add('bg-white', 'text-gray-700', 'border-gray-300');
                    } else if (btn.classList.contains('ml-analysis-btn')) {
                        btn.classList.add('bg-white', 'text-gray-700', 'border-purple-300');
                    }
                });

                // Ocultar todos los calculadores
                calculators.forEach(calc => {
                    calc.style.display = 'none';
                });

                // Agregar clase active al botón clickeado
                if (button.classList.contains('simulation-type-btn')) {
                    button.classList.add('active', 'bg-blue-600', 'text-white', 'border-blue-600');
                    button.classList.remove('bg-white', 'text-gray-700', 'border-gray-300');
                } else if (button.classList.contains('ml-analysis-btn')) {
                    // Handle ML analysis buttons
                    const mlType = button.id.replace('-btn', '');
                    if (mlType === 'prediccion') {
                        button.classList.add('bg-purple-600', 'text-white', 'border-purple-600');
                    } else if (mlType === 'tornado') {
                        button.classList.add('bg-red-600', 'text-white', 'border-red-600');
                    } else if (mlType === 'montecarlo') {
                        button.classList.add('bg-green-600', 'text-white', 'border-green-600');
                    } else if (mlType === 'sensibilidad') {
                        button.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
                    }
                    button.classList.remove('bg-white', 'text-gray-700', 'border-purple-300');
                }

                // Mostrar el calculador correspondiente
                const calculatorId = button.id.replace('-btn', '-calculator');
                const calculator = document.getElementById(calculatorId);
                if (calculator) {
                    calculator.style.display = 'block';
                }
            });
        });

        // Seleccionar VAN por defecto al cargar la página
        const vanButton = document.getElementById('van-btn');
        if (vanButton) {
            // Simular click en el botón VAN para activarlo por defecto
            setTimeout(() => {
                vanButton.click();
            }, 100);
        }
    }

    /**
     * Simular VAN con análisis completo de ingeniería económica
     */
    simularVAN(form) {
        const formData = new FormData(form);
        const datos = {
            nombreProyecto: formData.get('nombre_proyecto') || 'Proyecto sin nombre',
            sector: formData.get('sector') || 'general',
            inversion: parseFloat(formData.get('inversion')) || 0,
            flujos: this.parsearFlujosVAN(form),
            tasaDescuento: parseFloat(formData.get('tasa')) || 0,
            incluirSensibilidad: formData.get('sensibilidad') === 'on',
            incluirRiesgo: formData.get('riesgo') === 'on',
            rangoSensibilidad: 10 // ±10% por defecto para análisis de sensibilidad
        };

        // Validar datos con mensajes específicos
        const errores = this.validarDatosVANDetallado(datos);
        if (errores.length > 0) {
            this.mostrarErroresVAN(errores);
            return;
        }

        // Mostrar indicador de carga
        this.mostrarCargaVAN();

        // Calcular VAN con análisis completo
        const resultado = this.calcularVANCompleto(datos);

        // Mostrar resultados
        this.mostrarResultadosVANProfesional(resultado, datos);

        // Crear tabla de flujos de caja
        this.crearTablaFlujosVAN(resultado.detalleFlujos, datos.inversion);

        // Crear gráfico si está disponible y solicitado
        if (datos.incluirSensibilidad && typeof Chart !== 'undefined') {
            this.crearGraficoSensibilidadVAN(datos, resultado);
        }

        // Guardar simulación con metadatos adicionales
        this.guardarSimulacion('van', {
            datos,
            resultado,
            timestamp: new Date(),
            version: '2.0',
            tipo: 'ingenieria_economica',
            tipo_analisis: 'van'
        });

        // Disparar evento con datos completos
        this.dispararEvento('vanSimulado', { datos, resultado });

        // Ocultar carga
        this.ocultarCargaVAN();
    }

    calcularVAN(datos) {
        const { flujos, tasaDescuento, inversion } = datos;
        const tasaDecimal = tasaDescuento / 100;

        let van = 0;
        const detalleFlujos = [];

        for (let i = 0; i < flujos.length; i++) {
            const flujo = flujos[i];
            const factorDescuento = Math.pow(1 + tasaDecimal, i);
            const valorPresente = flujo / factorDescuento;

            van += valorPresente;

            detalleFlujos.push({
                periodo: i,
                flujo: flujo,
                factorDescuento: factorDescuento,
                valorPresente: valorPresente
            });
        }

        // Calcular TIR usando los flujos de caja
        const tir = this.calcularTIRSimple(flujos);

        // Calcular período de recuperación (payback)
        const payback = this.calcularPaybackPeriod(inversion, flujos);

        // Análisis de sensibilidad si está habilitado
        let sensibilidad = null;
        if (datos.incluirSensibilidad) {
            sensibilidad = this.analizarSensibilidadVAN(flujos, tasaDescuento, datos.rangoSensibilidad);
        }

        return {
            van: van,
            tir: tir,
            payback: payback,
            detalleFlujos: detalleFlujos,
            sensibilidad: sensibilidad,
            decision: van > 0 ? 'Viable' : van < 0 ? 'No Viable' : 'Indiferente',
            tasaDescuento: tasaDescuento
        };
    }

    analizarSensibilidadVAN(flujos, tasaBase, rango) {
        const sensibilidades = [];
        const pasos = 20;

        for (let i = -rango; i <= rango; i += (rango * 2) / pasos) {
            const tasaActual = tasaBase + i;
            if (tasaActual >= 0) {
                let vanSensibilidad = 0;
                const tasaDecimal = tasaActual / 100;

                for (let j = 0; j < flujos.length; j++) {
                    vanSensibilidad += flujos[j] / Math.pow(1 + tasaDecimal, j);
                }

                sensibilidades.push({
                    tasa: tasaActual,
                    van: vanSensibilidad
                });
            }
        }

        return sensibilidades;
    }

    /**
     * Simular TIR con análisis completo de ingeniería económica
     */
    simularTIR(form) {
        const formData = new FormData(form);
        const datos = {
            nombreProyecto: formData.get('nombre_proyecto') || 'Proyecto sin nombre',
            metodo: formData.get('metodo') || 'newton',
            inversion: parseFloat(formData.get('inversion')) || 0,
            flujos: this.parsearFlujosTIR(form),
            mostrarConvergencia: formData.get('mostrar_convergencia') === 'on',
            analisisSensibilidad: formData.get('analisis_sensibilidad') === 'on'
        };

        // Validar datos con mensajes específicos
        const errores = this.validarDatosTIRDetallado(datos);
        if (errores.length > 0) {
            this.mostrarErroresTIR(errores);
            return;
        }

        // Mostrar indicador de carga
        this.mostrarCargaTIR();

        // Calcular TIR con análisis completo
        const resultado = this.calcularTIRCompleto(datos);

        // Mostrar resultados
        this.mostrarResultadosTIRProfesional(resultado, datos);

        // Mostrar tabla de convergencia si está solicitada
        if (datos.mostrarConvergencia && resultado.convergencia) {
            this.crearTablaConvergenciaTIR(resultado.convergencia);
            document.getElementById('tir-convergence-section').style.display = 'block';
        }

        // Guardar simulación con metadatos adicionales
        this.guardarSimulacion('tir', {
            datos,
            resultado,
            timestamp: new Date(),
            version: '2.0',
            tipo: 'ingenieria_economica'
        });

        // Disparar evento con datos completos
        this.dispararEvento('tirSimulado', { datos, resultado });

        // Ocultar carga
        this.ocultarCargaTIR();
    }

    calcularTIR(datos) {
        const { flujos, metodo, maxIteraciones, tolerancia } = datos;

        // Verificar que hay al menos un flujo negativo y uno positivo
        const tieneNegativo = flujos.some(f => f < 0);
        const tienePositivo = flujos.some(f => f > 0);

        if (!tieneNegativo || !tienePositivo) {
            return {
                tir: null,
                error: 'Se requiere al menos un flujo negativo (inversión) y uno positivo (ingreso)',
                iteraciones: 0,
                convergencia: []
            };
        }

        let tir = 0;
        const convergencia = [];

        if (metodo === 'newton') {
            // Método de Newton-Raphson
            tir = 0.1; // Estimación inicial
            let iteracion = 0;

            while (iteracion < maxIteraciones) {
                let van = 0;
                let derivada = 0;

                for (let i = 0; i < flujos.length; i++) {
                    van += flujos[i] / Math.pow(1 + tir, i);
                    if (i > 0) {
                        derivada -= i * flujos[i] / Math.pow(1 + tir, i + 1);
                    }
                }

                convergencia.push({
                    iteracion: iteracion + 1,
                    tir: tir * 100,
                    van: van,
                    derivada: derivada
                });

                if (Math.abs(van) < tolerancia) {
                    break;
                }

                if (Math.abs(derivada) < 1e-10) {
                    tir += 0.01; // Pequeño ajuste si derivada es muy pequeña
                } else {
                    tir = tir - van / derivada;
                }

                // Limitar TIR a rango razonable
                if (tir < -0.5 || tir > 1) {
                    return {
                        tir: null,
                        error: 'No se pudo encontrar TIR en el rango válido',
                        iteraciones: iteracion + 1,
                        convergencia: convergencia
                    };
                }

                iteracion++;
            }

            if (iteracion >= maxIteraciones) {
                return {
                    tir: null,
                    error: 'No convergió en el número máximo de iteraciones',
                    iteraciones: iteracion,
                    convergencia: convergencia
                };
            }

        } else {
            // Método de aproximaciones sucesivas
            let tirInferior = 0;
            let tirSuperior = 1;
            let iteracion = 0;

            while (iteracion < maxIteraciones) {
                const tirMedio = (tirInferior + tirSuperior) / 2;

                let vanInferior = 0;
                let vanSuperior = 0;
                let vanMedio = 0;

                for (let i = 0; i < flujos.length; i++) {
                    vanInferior += flujos[i] / Math.pow(1 + tirInferior, i);
                    vanSuperior += flujos[i] / Math.pow(1 + tirSuperior, i);
                    vanMedio += flujos[i] / Math.pow(1 + tirMedio, i);
                }

                convergencia.push({
                    iteracion: iteracion + 1,
                    tir: tirMedio * 100,
                    van: vanMedio
                });

                if (Math.abs(vanMedio) < tolerancia) {
                    tir = tirMedio;
                    break;
                }

                if (vanMedio > 0) {
                    tirInferior = tirMedio;
                } else {
                    tirSuperior = tirMedio;
                }

                iteracion++;
            }

            if (iteracion >= maxIteraciones) {
                return {
                    tir: null,
                    error: 'No convergió en el número máximo de iteraciones',
                    iteraciones: iteracion,
                    convergencia: convergencia
                };
            }
        }

        return {
            tir: tir * 100, // Convertir a porcentaje
            iteraciones: convergencia.length,
            convergencia: convergencia,
            metodo: metodo
        };
    }

    /**
     * Simular WACC con análisis completo de estructura de capital
     */
    simularWACC(form) {
        const formData = new FormData(form);
        const datos = {
            empresa: formData.get('empresa') || 'Empresa sin nombre',
            sector: formData.get('sector') || 'general',
            costoDeuda: parseFloat(formData.get('costo_deuda')) || 0,
            proporcionDeuda: parseFloat(formData.get('proporcion_deuda')) || 0,
            costoCapitalPropio: parseFloat(formData.get('costo_capital')) || 0,
            proporcionCapital: parseFloat(formData.get('proporcion_capital')) || 0,
            tasaImpuestos: parseFloat(formData.get('tasa_impuestos')) || 0,
            escudoFiscal: formData.get('escudo_fiscal') === 'on',
            analisisSensibilidad: formData.get('analisis_sensibilidad') === 'on',
            comparacionSector: formData.get('comparacion_sector') === 'on'
        };

        // Validar datos con mensajes específicos
        const errores = this.validarDatosWACCDetallado(datos);
        if (errores.length > 0) {
            this.mostrarErroresWACC(errores);
            return;
        }

        // Mostrar indicador de carga
        this.mostrarCargaWACC();

        // Calcular WACC con análisis completo
        const resultado = this.calcularWACCCompleto(datos);

        // Mostrar resultados
        this.mostrarResultadosWACCProfesional(resultado, datos);

        // Guardar simulación con metadatos adicionales
        this.guardarSimulacion('wacc', {
            datos,
            resultado,
            timestamp: new Date(),
            version: '2.0',
            tipo: 'ingenieria_economica'
        });

        // Disparar evento con datos completos
        this.dispararEvento('waccSimulado', { datos, resultado });

        // Ocultar carga
        this.ocultarCargaWACC();
    }

    calcularWACC(datos) {
        const { costoDeuda, tasaImpuestos, costoCapitalPropio, proporcionDeuda } = datos;

        // WACC = (E/V * Re) + (D/V * Rd * (1-Tc))
        // donde:
        // E/V = proporción de capital propio
        // D/V = proporción de deuda
        // Re = costo de capital propio
        // Rd = costo de deuda
        // Tc = tasa de impuestos

        const proporcionCapitalPropio = 1 - (proporcionDeuda / 100);
        const proporcionDeudaDecimal = proporcionDeuda / 100;

        const costoCapitalPropioDecimal = costoCapitalPropio / 100;
        const costoDeudaDecimal = costoDeuda / 100;
        const tasaImpuestosDecimal = tasaImpuestos / 100;

        const wacc = (proporcionCapitalPropio * costoCapitalPropioDecimal) +
                    (proporcionDeudaDecimal * costoDeudaDecimal * (1 - tasaImpuestosDecimal));

        const waccPorcentaje = wacc * 100;

        return {
            wacc: waccPorcentaje,
            componentes: {
                costoCapitalPropio: costoCapitalPropio,
                costoDeuda: costoDeuda,
                tasaImpuestos: tasaImpuestos,
                proporcionDeuda: proporcionDeuda,
                proporcionCapitalPropio: proporcionCapitalPropio * 100
            },
            formula: 'WACC = (E/V × Re) + (D/V × Rd × (1-Tc))'
        };
    }

    /**
     * Simular portafolio de inversión
     */
    simularPortafolio(form) {
        const formData = new FormData(form);
        const datos = {
            activos: [
                {
                    nombre: formData.get('activo1_nombre') || 'Activo 1',
                    peso: parseFloat(formData.get('activo1_peso')) || 0,
                    retorno: parseFloat(formData.get('activo1_retorno')) || 0,
                    riesgo: parseFloat(formData.get('activo1_riesgo')) || 0
                },
                {
                    nombre: formData.get('activo2_nombre') || 'Activo 2',
                    peso: parseFloat(formData.get('activo2_peso')) || 0,
                    retorno: parseFloat(formData.get('activo2_retorno')) || 0,
                    riesgo: parseFloat(formData.get('activo2_riesgo')) || 0
                },
                {
                    nombre: formData.get('activo3_nombre') || 'Activo 3',
                    peso: parseFloat(formData.get('activo3_peso')) || 0,
                    retorno: parseFloat(formData.get('activo3_retorno')) || 0,
                    riesgo: parseFloat(formData.get('activo3_riesgo')) || 0
                }
            ].filter(activo => activo.peso > 0)
        };

        // Validar datos
        if (!this.validarDatosPortafolio(datos)) {
            this.mostrarError('Por favor, complete correctamente los datos del portafolio.');
            return;
        }

        // Calcular portafolio
        const resultado = this.calcularPortafolio(datos);

        // Mostrar resultados
        this.mostrarResultadosPortafolio(resultado, datos);

        // Crear gráfico de eficiencia
        this.crearGraficoPortafolio(resultado);

        // Guardar simulación
        this.guardarSimulacion('portafolio', { datos, resultado });

        // Disparar evento
        this.dispararEvento('portafolioSimulado', resultado);
    }

    calcularPortafolio(datos) {
        const { activos } = datos;

        // Calcular retorno esperado del portafolio
        const retornoPortafolio = activos.reduce((sum, activo) =>
            sum + (activo.peso * activo.retorno), 0) / 100; // Convertir a decimal

        // Calcular riesgo del portafolio (varianza)
        let varianzaPortafolio = 0;

        // Para simplificar, asumimos correlación = 0.5 entre activos
        const correlacion = 0.5;

        for (let i = 0; i < activos.length; i++) {
            for (let j = 0; j < activos.length; j++) {
                const peso_i = activos[i].peso;
                const peso_j = activos[j].peso;
                const riesgo_i = activos[i].riesgo / 100; // Convertir a decimal
                const riesgo_j = activos[j].riesgo / 100;

                if (i === j) {
                    varianzaPortafolio += peso_i * peso_j * riesgo_i * riesgo_j;
                } else {
                    varianzaPortafolio += peso_i * peso_j * riesgo_i * riesgo_j * correlacion;
                }
            }
        }

        const riesgoPortafolio = Math.sqrt(varianzaPortafolio) * 100; // Convertir a porcentaje

        // Calcular ratio de Sharpe (aproximado)
        const tasaLibreRiesgo = 0.03; // 3% aproximado
        const sharpeRatio = (retornoPortafolio - tasaLibreRiesgo) / (riesgoPortafolio / 100);

        // Diversificación
        const diversificacion = activos.length > 1 ? 'Bien diversificado' : 'Poco diversificado';

        return {
            retornoPortafolio: retornoPortafolio * 100, // Convertir a porcentaje
            riesgoPortafolio: riesgoPortafolio,
            sharpeRatio: sharpeRatio,
            diversificacion: diversificacion,
            activos: activos,
            fronteraEficiente: this.calcularFronteraEficiente(activos)
        };
    }

    calcularFronteraEficiente(activos) {
        // Simplificación: calcular algunos puntos de la frontera eficiente
        const puntos = [];
        for (let peso1 = 0; peso1 <= 1; peso1 += 0.1) {
            if (activos.length >= 2) {
                const peso2 = 1 - peso1;
                const retorno = peso1 * activos[0].retorno + peso2 * activos[1].retorno;
                const riesgo = Math.sqrt(
                    peso1 * peso1 * activos[0].riesgo * activos[0].riesgo +
                    peso2 * peso2 * activos[1].riesgo * activos[1].riesgo +
                    2 * peso1 * peso2 * activos[0].riesgo * activos[1].riesgo * 0.5
                );

                puntos.push({ retorno: retorno, riesgo: riesgo });
            }
        }

        return puntos;
    }

    /**
     * Funciones de gráficos
     */
    inicializarGraficos() {
        // Verificar si Chart.js está disponible
        if (typeof Chart !== 'undefined') {
            console.log('📊 Chart.js disponible para gráficos');
        } else {
            console.warn('⚠️ Chart.js no está cargado - gráficos no disponibles');
        }
    }

    crearGraficoSensibilidadVAN(datos, resultado) {
        if (!resultado.sensibilidad || typeof Chart === 'undefined') return;

        const ctx = document.getElementById('grafico-van-sensibilidad');
        if (!ctx) return;

        const labels = resultado.sensibilidad.map(s => s.tasa.toFixed(1) + '%');
        const data = resultado.sensibilidad.map(s => s.van);

        if (this.graficos.vanSensibilidad) {
            this.graficos.vanSensibilidad.destroy();
        }

        this.graficos.vanSensibilidad = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'VAN',
                    data: data,
                    borderColor: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Análisis de Sensibilidad - VAN vs Tasa de Descuento'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'VAN (S/)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tasa de Descuento (%)'
                        }
                    }
                }
            }
        });
    }

    crearGraficoConvergenciaTIR(resultado) {
        if (!resultado.convergencia || typeof Chart === 'undefined') return;

        const ctx = document.getElementById('grafico-tir-convergencia');
        if (!ctx) return;

        const labels = resultado.convergencia.map(c => 'Iter ' + c.iteracion);
        const data = resultado.convergencia.map(c => c.tir);

        if (this.graficos.tirConvergencia) {
            this.graficos.tirConvergencia.destroy();
        }

        this.graficos.tirConvergencia = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'TIR (%)',
                    data: data,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Convergencia del Método Numérico - TIR'
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'TIR (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Iteración'
                        }
                    }
                }
            }
        });
    }

    crearGraficoPortafolio(resultado) {
        if (!resultado.activos || typeof Chart === 'undefined') return;

        const ctx = document.getElementById('grafico-portafolio');
        if (!ctx) return;

        const labels = resultado.activos.map(a => a.nombre);
        const pesos = resultado.activos.map(a => a.peso * 100);

        if (this.graficos.portafolio) {
            this.graficos.portafolio.destroy();
        }

        this.graficos.portafolio = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: pesos,
                    backgroundColor: [
                        '#00ffff',
                        '#ff6b6b',
                        '#4ecdc4',
                        '#45b7d1',
                        '#96ceb4'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución del Portafolio'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Funciones de validación
     */
    validarDatosVAN(datos) {
        return datos.flujos && datos.flujos.length > 0 &&
               datos.tasaDescuento >= 0 && datos.tasaDescuento <= 50 &&
               datos.inversion >= 0;
    }

    /**
     * Validación detallada para VAN con mensajes específicos de error
     */
    validarDatosVANDetallado(datos) {
        const errores = [];

        // Validar inversión inicial
        if (!datos.inversion || datos.inversion <= 0) {
            errores.push({
                campo: 'inversion',
                mensaje: 'La inversión inicial debe ser mayor a cero.',
                tipo: 'error'
            });
        } else if (datos.inversion > 100000000) { // 100 millones
            errores.push({
                campo: 'inversion',
                mensaje: 'La inversión inicial parece demasiado alta. Verifique las unidades.',
                tipo: 'advertencia'
            });
        }

        // Validar tasa de descuento
        if (datos.tasaDescuento < 0 || datos.tasaDescuento > 50) {
            errores.push({
                campo: 'tasa',
                mensaje: 'La tasa de descuento debe estar entre 0% y 50%.',
                tipo: 'error'
            });
        } else if (datos.tasaDescuento === 0) {
            errores.push({
                campo: 'tasa',
                mensaje: 'Una tasa de descuento del 0% no es realista para análisis financiero.',
                tipo: 'advertencia'
            });
        }

        // Validar flujos de caja
        if (!datos.flujos || datos.flujos.length === 0) {
            errores.push({
                campo: 'flujos',
                mensaje: 'Debe ingresar al menos un flujo de caja.',
                tipo: 'error'
            });
        } else if (datos.flujos.length > 20) {
            errores.push({
                campo: 'flujos',
                mensaje: 'El análisis está limitado a 20 períodos. Considere agrupar flujos.',
                tipo: 'advertencia'
            });
        }

        // Validar que haya al menos un flujo positivo
        const tieneFlujoPositivo = datos.flujos.some(f => f > 0);
        if (!tieneFlujoPositivo) {
            errores.push({
                campo: 'flujos',
                mensaje: 'Debe haber al menos un flujo de caja positivo para que el proyecto sea viable.',
                tipo: 'error'
            });
        }

        // Validar valores extremos en flujos
        datos.flujos.forEach((flujo, index) => {
            if (Math.abs(flujo) > 10000000) { // 10 millones
                errores.push({
                    campo: `flujo${index + 1}`,
                    mensaje: `El flujo del año ${index + 1} parece demasiado alto. Verifique las unidades.`,
                    tipo: 'advertencia'
                });
            }
        });

        return errores;
    }

    /**
     * Mostrar errores de validación para VAN
     */
    mostrarErroresVAN(errores) {
        // Crear contenedor de errores si no existe
        let errorContainer = document.getElementById('van-errores');
        if (!errorContainer) {
            const form = document.getElementById('van-form');
            if (form) {
                errorContainer = document.createElement('div');
                errorContainer.id = 'van-errores';
                errorContainer.className = 'mb-6';
                form.insertBefore(errorContainer, form.firstChild);
            }
        }

        if (errorContainer) {
            const erroresErrores = errores.filter(e => e.tipo === 'error');
            const erroresAdvertencias = errores.filter(e => e.tipo === 'advertencia');

            let html = '';

            if (erroresErrores.length > 0) {
                html += `
                    <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-circle text-red-400"></i>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-red-800">Errores encontrados:</h3>
                                <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                                    ${erroresErrores.map(e => `<li>${e.mensaje}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }

            if (erroresAdvertencias.length > 0) {
                html += `
                    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-yellow-800">Advertencias:</h3>
                                <ul class="mt-2 text-sm text-yellow-700 list-disc list-inside">
                                    ${erroresAdvertencias.map(e => `<li>${e.mensaje}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }

            errorContainer.innerHTML = html;

            // Scroll to errors
            errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Mostrar indicador de carga para VAN
     */
    mostrarCargaVAN() {
        const resultsDiv = document.getElementById('van-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div class="text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p class="mt-4 text-lg text-gray-600">Calculando análisis económico...</p>
                    <p class="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
                </div>
            `;
            resultsDiv.style.display = 'block';
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Ocultar indicador de carga para VAN
     */
    ocultarCargaVAN() {
        // El contenido se reemplaza cuando se muestran los resultados
    }

    /**
     * Calcular VAN completo con métricas adicionales de ingeniería económica
     */
    calcularVANCompleto(datos) {
        const { flujos, tasaDescuento, inversion } = datos;
        const tasaDecimal = tasaDescuento / 100;

        let van = -inversion; // Iniciar con la inversión negativa
        let vanAcumulado = -inversion;
        const detalleFlujos = [];

        // Calcular VAN y detalles de flujos
        for (let i = 0; i < flujos.length; i++) {
            const flujo = flujos[i];
            const factorDescuento = Math.pow(1 + tasaDecimal, i + 1); // +1 porque el flujo 0 es la inversión
            const valorPresente = flujo / factorDescuento;

            van += valorPresente;
            vanAcumulado += valorPresente;

            detalleFlujos.push({
                periodo: i + 1,
                flujo: flujo,
                factorDescuento: factorDescuento,
                valorPresente: valorPresente,
                vanAcumulado: vanAcumulado
            });
        }

        // Calcular TIR usando método mejorado
        const tir = this.calcularTIRMejorado([-inversion, ...flujos]);

        // Calcular período de recuperación (payback)
        const payback = this.calcularPaybackMejorado(inversion, flujos);

        // Calcular VAN/Inversión (rentabilidad relativa) - en formato DECIMAL
        const vanSobreInversion = van / inversion;

        // Determinar decisión económica
        let decision = 'indiferente';
        let decisionTexto = 'El proyecto es económicamente indiferente';
        let decisionColor = 'yellow';

        if (van > 0) {
            decision = 'viable';
            decisionTexto = 'Proyecto económicamente viable - genera valor';
            decisionColor = 'green';
        } else if (van < 0) {
            decision = 'no_viable';
            decisionTexto = 'Proyecto económicamente no viable - destruye valor';
            decisionColor = 'red';
        }

        // Calcular métricas adicionales - en formato DECIMAL
        const roi = van / inversion; // Retorno sobre inversión en decimal
        const bcr = van > 0 ? (van + inversion) / inversion : 0; // Beneficio-Costo Ratio

        // Log para depuración
        console.log('=== Debug VAN Completo ===');
        console.log('TIR desde calcularTIRMejorado:', tir);
        console.log('ROI calculado:', roi);
        console.log('VAN/Inversión:', vanSobreInversion);

        return {
            van: van,
            tir: tir,
            payback: payback,
            vanSobreInversion: vanSobreInversion,
            roi: roi,
            bcr: bcr,
            detalleFlujos: detalleFlujos,
            decision: decision,
            decisionTexto: decisionTexto,
            decisionColor: decisionColor,
            tasaDescuento: tasaDescuento,
            inversion: inversion,
            horizonte: flujos.length,
            // Análisis de sensibilidad si solicitado
            sensibilidad: datos.incluirSensibilidad ? this.analizarSensibilidadVAN(flujos, tasaDescuento, 10) : null
        };
    }

    /**
     * Calcular TIR usando método mejorado con Newton-Raphson
     */
    calcularTIRMejorado(flujos) {
        if (!flujos || flujos.length < 2) return null;

        // Verificar que hay al menos un flujo negativo y uno positivo
        const tieneNegativo = flujos.some(f => f < 0);
        const tienePositivo = flujos.some(f => f > 0);

        if (!tieneNegativo || !tienePositivo) return null;

        // Método de Newton-Raphson mejorado
        let tir = 0.1; // Estimación inicial del 10% (en decimal: 0.10)
        const maxIteraciones = 100;
        const tolerancia = 0.00001;

        for (let iteracion = 0; iteracion < maxIteraciones; iteracion++) {
            let van = 0;
            let derivada = 0;

            // Calcular VAN y su derivada en el punto actual
            for (let t = 0; t < flujos.length; t++) {
                const denominador = Math.pow(1 + tir, t);
                van += flujos[t] / denominador;
                
                // Derivada: dVAN/dr = -Σ(t * FCt / (1+r)^(t+1))
                if (t > 0) {
                    derivada -= t * flujos[t] / Math.pow(1 + tir, t + 1);
                }
            }

            // Si VAN es suficientemente cercano a cero, hemos encontrado la TIR
            if (Math.abs(van) < tolerancia) {
                return tir; // Retornar en formato DECIMAL (ej: 0.2586)
            }

            // Aplicar Newton-Raphson: r_nuevo = r_actual - f(r)/f'(r)
            if (Math.abs(derivada) > 1e-10) {
                const tirAnterior = tir;
                tir = tir - van / derivada;
                
                // Verificar si la convergencia es suficientemente pequeña
                if (Math.abs(tir - tirAnterior) < tolerancia) {
                    return tir; // Retornar en formato DECIMAL
                }
            } else {
                // Si la derivada es muy pequeña, intentar ajuste manual
                break;
            }

            // Limitar TIR a rango razonable (-90% a 500%)
            if (tir < -0.9 || tir > 5.0) {
                return null; // No convergió a un valor razonable
            }
        }

        // Si no convergió, intentar método de bisección como fallback
        return this.calcularTIRBiseccionFallback(flujos);
    }

    /**
     * Método de bisección como fallback para TIR
     */
    calcularTIRBiseccionFallback(flujos) {
        let tirMin = -0.5; // -50%
        let tirMax = 2.0;  // 200%
        const tolerancia = 0.0001;
        const maxIteraciones = 100;

        // Calcular VAN en un punto
        const calcularVAN = (tasa) => {
            let van = 0;
            for (let t = 0; t < flujos.length; t++) {
                van += flujos[t] / Math.pow(1 + tasa, t);
            }
            return van;
        };

        for (let iter = 0; iter < maxIteraciones; iter++) {
            const tirMedio = (tirMin + tirMax) / 2;
            const vanMedio = calcularVAN(tirMedio);

            if (Math.abs(vanMedio) < tolerancia) {
                return tirMedio; // Retornar en formato DECIMAL
            }

            const vanMin = calcularVAN(tirMin);
            
            // Ajustar el intervalo
            if ((vanMin < 0 && vanMedio < 0) || (vanMin > 0 && vanMedio > 0)) {
                tirMin = tirMedio;
            } else {
                tirMax = tirMedio;
            }

            // Verificar convergencia del intervalo
            if (Math.abs(tirMax - tirMin) < tolerancia) {
                return tirMedio; // Retornar en formato DECIMAL
            }
        }

        return null; // No convergió
    }

    /**
     * Calcular payback mejorado con recuperación fraccionaria
     */
    calcularPaybackMejorado(inversion, flujos) {
        if (!flujos || flujos.length === 0 || inversion <= 0) return null;

        let acumulado = -inversion;
        let periodoCompleto = 0;

        for (let i = 0; i < flujos.length; i++) {
            acumulado += flujos[i];
            periodoCompleto = i + 1;

            if (acumulado >= 0) {
                // Si recuperamos exactamente en este período
                if (acumulado === 0) {
                    return periodoCompleto;
                }

                // Calcular recuperación fraccionaria
                const exceso = acumulado;
                const flujoActual = flujos[i];
                const fraccion = (flujoActual - exceso) / flujoActual;

                return periodoCompleto - fraccion;
            }
        }

        return null; // No se recupera en el horizonte analizado
    }

    /**
     * Validación detallada para TIR con mensajes específicos de error
     */
    validarDatosTIRDetallado(datos) {
        const errores = [];

        // Validar inversión inicial
        if (!datos.inversion || datos.inversion <= 0) {
            errores.push({
                campo: 'inversion',
                mensaje: 'La inversión inicial debe ser mayor a cero.',
                tipo: 'error'
            });
        }

        // Validar flujos de caja
        if (!datos.flujos || datos.flujos.length === 0) {
            errores.push({
                campo: 'flujos',
                mensaje: 'Debe ingresar al menos un flujo de caja.',
                tipo: 'error'
            });
        } else if (datos.flujos.length > 20) {
            errores.push({
                campo: 'flujos',
                mensaje: 'El análisis está limitado a 20 períodos. Considere agrupar flujos.',
                tipo: 'advertencia'
            });
        }

        // Validar que haya al menos un flujo positivo
        const tieneFlujoPositivo = datos.flujos.some(f => f > 0);
        if (!tieneFlujoPositivo) {
            errores.push({
                campo: 'flujos',
                mensaje: 'Debe haber al menos un flujo de caja positivo para calcular la TIR.',
                tipo: 'error'
            });
        }

        // Validar que haya al menos un flujo negativo (inversión)
        const tieneFlujoNegativo = datos.flujos.some(f => f < 0) || datos.inversion > 0;
        if (!tieneFlujoNegativo) {
            errores.push({
                campo: 'inversion',
                mensaje: 'Debe haber al menos un flujo negativo (inversión) para calcular la TIR.',
                tipo: 'error'
            });
        }

        // Validar valores extremos en flujos
        datos.flujos.forEach((flujo, index) => {
            if (Math.abs(flujo) > 10000000) { // 10 millones
                errores.push({
                    campo: `flujo${index + 1}`,
                    mensaje: `El flujo del año ${index + 1} parece demasiado alto. Verifique las unidades.`,
                    tipo: 'advertencia'
                });
            }
        });

        return errores;
    }

    /**
     * Mostrar errores de validación para TIR
     */
    mostrarErroresTIR(errores) {
        // Crear contenedor de errores si no existe
        let errorContainer = document.getElementById('tir-errores');
        if (!errorContainer) {
            const form = document.getElementById('tir-form');
            if (form) {
                errorContainer = document.createElement('div');
                errorContainer.id = 'tir-errores';
                errorContainer.className = 'mb-6';
                form.insertBefore(errorContainer, form.firstChild);
            }
        }

        if (errorContainer) {
            const erroresErrores = errores.filter(e => e.tipo === 'error');
            const erroresAdvertencias = errores.filter(e => e.tipo === 'advertencia');

            let html = '';

            if (erroresErrores.length > 0) {
                html += `
                    <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-circle text-red-400"></i>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-red-800">Errores encontrados:</h3>
                                <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                                    ${erroresErrores.map(e => `<li>${e.mensaje}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }

            if (erroresAdvertencias.length > 0) {
                html += `
                    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-yellow-800">Advertencias:</h3>
                                <ul class="mt-2 text-sm text-yellow-700 list-disc list-inside">
                                    ${erroresAdvertencias.map(e => `<li>${e.mensaje}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }

            errorContainer.innerHTML = html;

            // Scroll to errors
            errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Mostrar indicador de carga para TIR
     */
    mostrarCargaTIR() {
        const resultsDiv = document.getElementById('tir-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div class="text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p class="mt-4 text-lg text-gray-600">Calculando Tasa Interna de Retorno...</p>
                    <p class="text-sm text-gray-500 mt-2">Aplicando método numérico de Newton-Raphson</p>
                </div>
            `;
            resultsDiv.style.display = 'block';
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Ocultar indicador de carga para TIR
     */
    ocultarCargaTIR() {
        // El contenido se reemplaza cuando se muestran los resultados
    }

    /**
     * Calcular TIR completo con análisis detallado
     */
    calcularTIRCompleto(datos) {
        const { flujos, inversion, metodo } = datos;

        // Preparar flujos incluyendo inversión inicial
        const flujosCompletos = [-inversion, ...flujos];

        // Calcular TIR usando el método seleccionado
        let tir = null;
        let iteraciones = 0;
        let convergencia = [];

        if (metodo === 'biseccion') {
            const resultado = this.calcularTIRBiseccion(flujosCompletos);
            tir = resultado.tir;
            iteraciones = resultado.iteraciones;
            convergencia = resultado.convergencia;
        } else {
            // Newton-Raphson por defecto
            const resultado = this.calcularTIRNewton(flujosCompletos);
            tir = resultado.tir;
            iteraciones = resultado.iteraciones;
            convergencia = resultado.convergencia;
        }

        // Verificar TIR calculada
        let vanVerificacion = null;
        if (tir !== null) {
            vanVerificacion = this.calcularVANDeFlujos(flujosCompletos, tir / 100);
        }

        // Determinar evaluación de la TIR
        let evaluacion = 'no_calculable';
        let evaluacionTexto = 'No se pudo calcular la TIR';
        let evaluacionColor = 'gray';

        if (tir !== null) {
            if (tir > 20) {
                evaluacion = 'excelente';
                evaluacionTexto = 'TIR Excelente - Proyecto altamente rentable';
                evaluacionColor = 'green';
            } else if (tir > 15) {
                evaluacion = 'muy_buena';
                evaluacionTexto = 'TIR Muy Buena - Proyecto muy rentable';
                evaluacionColor = 'green';
            } else if (tir > 12) {
                evaluacion = 'buena';
                evaluacionTexto = 'TIR Buena - Proyecto rentable';
                evaluacionColor = 'blue';
            } else if (tir > 8) {
                evaluacion = 'aceptable';
                evaluacionTexto = 'TIR Aceptable - Proyecto marginalmente viable';
                evaluacionColor = 'yellow';
            } else if (tir > 0) {
                evaluacion = 'baja';
                evaluacionTexto = 'TIR Baja - Revisar viabilidad del proyecto';
                evaluacionColor = 'orange';
            } else {
                evaluacion = 'negativa';
                evaluacionTexto = 'TIR Negativa - Proyecto no viable';
                evaluacionColor = 'red';
            }
        }

        return {
            tir: tir,
            vanVerificacion: vanVerificacion,
            iteraciones: iteraciones,
            convergencia: convergencia,
            metodo: metodo,
            evaluacion: evaluacion,
            evaluacionTexto: evaluacionTexto,
            evaluacionColor: evaluacionColor,
            flujosCompletos: flujosCompletos,
            inversion: inversion,
            flujoTotal: flujos.reduce((sum, f) => sum + f, 0)
        };
    }

    /**
     * Calcular TIR usando método de bisección
     */
    calcularTIRBiseccion(flujos) {
        let tirInferior = -0.5; // -50%
        let tirSuperior = 5.0;  // 500%
        const maxIteraciones = 100;
        const tolerancia = 0.000001;
        const convergencia = [];

        for (let iteracion = 0; iteracion < maxIteraciones; iteracion++) {
            const tirMedio = (tirInferior + tirSuperior) / 2;
            const vanMedio = this.calcularVANDeFlujos(flujos, tirMedio);

            convergencia.push({
                iteracion: iteracion + 1,
                tir: tirMedio * 100,
                van: vanMedio
            });

            if (Math.abs(vanMedio) < tolerancia) {
                return {
                    tir: tirMedio * 100,
                    iteraciones: iteracion + 1,
                    convergencia: convergencia
                };
            }

            if (vanMedio > 0) {
                tirInferior = tirMedio;
            } else {
                tirSuperior = tirMedio;
            }
        }

        return {
            tir: null,
            iteraciones: maxIteraciones,
            convergencia: convergencia
        };
    }

    /**
     * Calcular TIR usando método de Newton-Raphson
     */
    calcularTIRNewton(flujos) {
        let tir = 0.1; // Estimación inicial del 10%
        const maxIteraciones = 100;
        const tolerancia = 0.000001;
        const convergencia = [];

        for (let iteracion = 0; iteracion < maxIteraciones; iteracion++) {
            let van = 0;
            let derivada = 0;

            for (let i = 0; i < flujos.length; i++) {
                if (Math.abs(tir) > 1e-10) {
                    van += flujos[i] / Math.pow(1 + tir, i);
                    if (i > 0) {
                        derivada -= i * flujos[i] / Math.pow(1 + tir, i + 1);
                    }
                }
            }

            convergencia.push({
                iteracion: iteracion + 1,
                tir: tir * 100,
                van: van,
                derivada: derivada
            });

            if (Math.abs(van) < tolerancia) {
                return {
                    tir: tir * 100,
                    iteraciones: iteracion + 1,
                    convergencia: convergencia
                };
            }

            if (Math.abs(derivada) > 1e-10) {
                const nuevaTir = tir - van / derivada;
                if (Math.abs(nuevaTir - tir) < tolerancia) {
                    return {
                        tir: nuevaTir * 100,
                        iteraciones: iteracion + 1,
                        convergencia: convergencia
                    };
                }
                tir = nuevaTir;
            } else {
                tir += 0.001;
            }

            if (tir < -0.9 || tir > 5) {
                return {
                    tir: null,
                    iteraciones: iteracion + 1,
                    convergencia: convergencia
                };
            }
        }

        return {
            tir: null,
            iteraciones: maxIteraciones,
            convergencia: convergencia
        };
    }

    /**
     * Calcular VAN de una serie de flujos a una tasa dada
     */
    calcularVANDeFlujos(flujos, tasaDecimal) {
        return flujos.reduce((van, flujo, i) => {
            return van + flujo / Math.pow(1 + tasaDecimal, i);
        }, 0);
    }

    validarDatosTIR(datos) {
        return datos.flujos && datos.flujos.length >= 1;
    }

    /**
     * Validación detallada para WACC con mensajes específicos de error
     */
    validarDatosWACCDetallado(datos) {
        const errores = [];

        // Validar empresa
        if (!datos.empresa || datos.empresa.trim() === '') {
            errores.push({
                campo: 'empresa',
                mensaje: 'El nombre de la empresa es requerido.',
                tipo: 'error'
            });
        }

        // Validar costo de deuda
        if (datos.costoDeuda < 0 || datos.costoDeuda > 50) {
            errores.push({
                campo: 'costo_deuda',
                mensaje: 'El costo de deuda debe estar entre 0% y 50%.',
                tipo: 'error'
            });
        } else if (datos.costoDeuda === 0) {
            errores.push({
                campo: 'costo_deuda',
                mensaje: 'Un costo de deuda del 0% no es realista. Considere el costo de mercado.',
                tipo: 'advertencia'
            });
        }

        // Validar costo de capital propio
        if (datos.costoCapitalPropio < 0 || datos.costoCapitalPropio > 50) {
            errores.push({
                campo: 'costo_capital',
                mensaje: 'El costo de capital propio debe estar entre 0% y 50%.',
                tipo: 'error'
            });
        } else if (datos.costoCapitalPropio < 5) {
            errores.push({
                campo: 'costo_capital',
                mensaje: 'El costo de capital propio parece bajo. Verifique el cálculo del CAPM.',
                tipo: 'advertencia'
            });
        }

        // Validar proporciones
        if (datos.proporcionDeuda < 0 || datos.proporcionDeuda > 100) {
            errores.push({
                campo: 'proporcion_deuda',
                mensaje: 'La proporción de deuda debe estar entre 0% y 100%.',
                tipo: 'error'
            });
        }

        if (datos.proporcionCapital < 0 || datos.proporcionCapital > 100) {
            errores.push({
                campo: 'proporcion_capital',
                mensaje: 'La proporción de capital propio debe estar entre 0% y 100%.',
                tipo: 'error'
            });
        }

        // Validar que las proporciones sumen 100%
        const sumaProporciones = datos.proporcionDeuda + datos.proporcionCapital;
        if (Math.abs(sumaProporciones - 100) > 0.01) {
            errores.push({
                campo: 'proporciones',
                mensaje: 'La suma de las proporciones de deuda y capital propio debe ser 100%.',
                tipo: 'error'
            });
        }

        // Validar tasa de impuestos
        if (datos.tasaImpuestos < 0 || datos.tasaImpuestos > 50) {
            errores.push({
                campo: 'tasa_impuestos',
                mensaje: 'La tasa de impuestos debe estar entre 0% y 50%.',
                tipo: 'error'
            });
        }

        return errores;
    }

    /**
     * Mostrar errores de validación para WACC
     */
    mostrarErroresWACC(errores) {
        // Crear contenedor de errores si no existe
        let errorContainer = document.getElementById('wacc-errores');
        if (!errorContainer) {
            const form = document.getElementById('wacc-form');
            if (form) {
                errorContainer = document.createElement('div');
                errorContainer.id = 'wacc-errores';
                errorContainer.className = 'mb-6';
                form.insertBefore(errorContainer, form.firstChild);
            }
        }

        if (errorContainer) {
            const erroresErrores = errores.filter(e => e.tipo === 'error');
            const erroresAdvertencias = errores.filter(e => e.tipo === 'advertencia');

            let html = '';

            if (erroresErrores.length > 0) {
                html += `
                    <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-circle text-red-400"></i>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-red-800">Errores encontrados:</h3>
                                <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                                    ${erroresErrores.map(e => `<li>${e.mensaje}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }

            if (erroresAdvertencias.length > 0) {
                html += `
                    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-yellow-800">Advertencias:</h3>
                                <ul class="mt-2 text-sm text-yellow-700 list-disc list-inside">
                                    ${erroresAdvertencias.map(e => `<li>${e.mensaje}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }

            errorContainer.innerHTML = html;

            // Scroll to errors
            errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Mostrar indicador de carga para WACC
     */
    mostrarCargaWACC() {
        const resultsDiv = document.getElementById('wacc-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div class="text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p class="mt-4 text-lg text-gray-600">Calculando Costo Promedio Ponderado del Capital...</p>
                    <p class="text-sm text-gray-500 mt-2">Aplicando fórmula WACC con escudo fiscal</p>
                </div>
            `;
            resultsDiv.style.display = 'block';
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Ocultar indicador de carga para WACC
     */
    ocultarCargaWACC() {
        // El contenido se reemplaza cuando se muestran los resultados
    }

    /**
     * Calcular WACC completo con análisis detallado de estructura de capital
     */
    calcularWACCCompleto(datos) {
        const { costoDeuda, proporcionDeuda, costoCapitalPropio, proporcionCapital, tasaImpuestos, escudoFiscal } = datos;

        // Convertir porcentajes a decimales
        const costoDeudaDecimal = costoDeuda / 100;
        const costoCapitalPropioDecimal = costoCapitalPropio / 100;
        const tasaImpuestosDecimal = tasaImpuestos / 100;
        const proporcionDeudaDecimal = proporcionDeuda / 100;
        const proporcionCapitalDecimal = proporcionCapital / 100;

        // Calcular costo de deuda después de impuestos
        const costoDeudaAfterTax = escudoFiscal ?
            costoDeudaDecimal * (1 - tasaImpuestosDecimal) :
            costoDeudaDecimal;

        // Calcular WACC
        const wacc = (proporcionCapitalDecimal * costoCapitalPropioDecimal) +
                    (proporcionDeudaDecimal * costoDeudaAfterTax);

        const waccPorcentaje = wacc * 100;

        // Calcular contribuciones individuales
        const contribucionCapital = proporcionCapitalDecimal * costoCapitalPropioDecimal * 100;
        const contribucionDeuda = proporcionDeudaDecimal * costoDeudaAfterTax * 100;

        // Determinar evaluación del WACC
        let evaluacion = 'bajo';
        let evaluacionTexto = 'WACC Bajo - Costo de capital favorable';
        let evaluacionColor = 'green';

        if (waccPorcentaje > 20) {
            evaluacion = 'muy_alto';
            evaluacionTexto = 'WACC Muy Alto - Costo de capital prohibitivo';
            evaluacionColor = 'red';
        } else if (waccPorcentaje > 15) {
            evaluacion = 'alto';
            evaluacionTexto = 'WACC Alto - Costo de capital elevado';
            evaluacionColor = 'orange';
        } else if (waccPorcentaje > 10) {
            evaluacion = 'moderado';
            evaluacionTexto = 'WACC Moderado - Costo de capital razonable';
            evaluacionColor = 'yellow';
        }

        // Calcular métricas adicionales
        const leverageRatio = proporcionDeuda / proporcionCapital;
        const taxShield = proporcionDeudaDecimal * costoDeudaDecimal * tasaImpuestosDecimal * 100;

        return {
            wacc: waccPorcentaje,
            componentes: {
                costoDeuda: costoDeuda,
                costoDeudaAfterTax: costoDeudaAfterTax * 100,
                costoCapitalPropio: costoCapitalPropio,
                proporcionDeuda: proporcionDeuda,
                proporcionCapital: proporcionCapital,
                tasaImpuestos: tasaImpuestos
            },
            contribuciones: {
                capital: contribucionCapital,
                deuda: contribucionDeuda
            },
            metricasAdicionales: {
                leverageRatio: leverageRatio,
                taxShield: taxShield,
                waccSinEscudo: ((proporcionCapitalDecimal * costoCapitalPropioDecimal) +
                               (proporcionDeudaDecimal * costoDeudaDecimal)) * 100
            },
            evaluacion: evaluacion,
            evaluacionTexto: evaluacionTexto,
            evaluacionColor: evaluacionColor,
            formula: 'WACC = (E/V × Re) + (D/V × Rd × (1-Tc))',
            empresa: datos.empresa,
            sector: datos.sector
        };
    }

    validarDatosWACC(datos) {
        return datos.costoDeuda >= 0 && datos.costoDeuda <= 50 &&
               datos.tasaImpuestos >= 0 && datos.tasaImpuestos <= 50 &&
               datos.costoCapitalPropio >= 0 && datos.costoCapitalPropio <= 50 &&
               datos.proporcionDeuda >= 0 && datos.proporcionDeuda <= 100;
    }

    validarDatosPortafolio(datos) {
        const sumaPesos = datos.activos.reduce((sum, activo) => sum + activo.peso, 0);
        return datos.activos.length > 0 &&
               Math.abs(sumaPesos - 1) < 0.01 && // Suma de pesos ≈ 1
               datos.activos.every(activo => activo.peso > 0 && activo.retorno >= 0 && activo.riesgo >= 0);
    }

    /**
     * Calcular TIR simple usando aproximación
     */
    calcularTIRSimple(flujos) {
        if (!flujos || flujos.length < 2) return null;

        // Verificar que hay al menos un flujo negativo y uno positivo
        const tieneNegativo = flujos.some(f => f < 0);
        const tienePositivo = flujos.some(f => f > 0);

        if (!tieneNegativo || !tienePositivo) return null;

        // Método de aproximación simple: buscar TIR entre 0% y 50%
        let tir = 0;
        let mejorVAN = -Infinity;
        let mejorTIR = 0;

        for (let tasa = 0; tasa <= 50; tasa += 0.1) {
            let van = 0;
            const tasaDecimal = tasa / 100;

            for (let i = 0; i < flujos.length; i++) {
                van += flujos[i] / Math.pow(1 + tasaDecimal, i);
            }

            if (van > mejorVAN) {
                mejorVAN = van;
                mejorTIR = tasa;
            }

            // Si encontramos VAN cercano a cero, retornamos esa tasa
            if (Math.abs(van) < 100) {
                return tasa;
            }
        }

        return mejorTIR;
    }

    /**
     * Calcular período de recuperación (payback period)
     */
    calcularPaybackPeriod(inversion, flujos) {
        if (!flujos || flujos.length === 0 || inversion <= 0) return null;

        let acumulado = -inversion;
        let periodo = 0;

        for (let i = 0; i < flujos.length; i++) {
            acumulado += flujos[i];
            periodo = i + 1;

            if (acumulado >= 0) {
                // Si recuperamos la inversión exactamente en este período
                if (acumulado === 0) {
                    return periodo;
                }
                // Si ya recuperamos la inversión, calcular fracción del período
                const exceso = acumulado;
                const flujoActual = flujos[i];
                const fraccion = exceso / flujoActual;

                return periodo - fraccion;
            }
        }

        // Si no se recupera la inversión en el período analizado
        return null;
    }

    /**
     * Funciones auxiliares
     */
    parsearFlujos(flujosString) {
        if (!flujosString) return [];

        return flujosString.split(',')
            .map(f => parseFloat(f.trim()))
            .filter(f => !isNaN(f));
    }

    parsearFlujosVAN(form) {
        const flujos = [];
        let index = 1;
        while (true) {
            const input = form.querySelector(`input[name="flujo${index}"]`);
            if (!input) break;

            const valor = parseFloat(input.value);
            if (!isNaN(valor)) {
                flujos.push(valor);
            }
            index++;
        }
        return flujos;
    }

    parsearFlujosTIR(form) {
        const flujos = [];
        let index = 1;
        while (true) {
            const input = form.querySelector(`input[name="flujo${index}"]`);
            if (!input) break;

            const valor = parseFloat(input.value);
            if (!isNaN(valor)) {
                flujos.push(valor);
            }
            index++;
        }
        return flujos;
    }

    agregarAnioVAN() {
        const container = document.getElementById('van-flujos');
        if (!container) return;

        const existingInputs = container.querySelectorAll('input[name^="flujo"]');
        const nextIndex = existingInputs.length + 1;

        const newInputDiv = document.createElement('div');
        newInputDiv.className = 'flex items-center space-x-3';
        newInputDiv.innerHTML = `
            <span class="text-sm text-gray-600 w-16">Año ${nextIndex}:</span>
            <input
                type="number"
                name="flujo${nextIndex}"
                step="0.01"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
            >
            <button type="button" class="remover-anio text-red-500 hover:text-red-700 px-2">
                <i class="fas fa-trash"></i>
            </button>
        `;

        container.appendChild(newInputDiv);

        // Add event listener to remove button
        const removeBtn = newInputDiv.querySelector('.remover-anio');
        removeBtn.addEventListener('click', () => {
            newInputDiv.remove();
            this.reenumerarAniosVAN();
        });
    }

    reenumerarAniosVAN() {
        const container = document.getElementById('van-flujos');
        if (!container) return;

        const inputDivs = container.querySelectorAll('.flex.items-center.space-x-3');
        inputDivs.forEach((div, index) => {
            const span = div.querySelector('span');
            const input = div.querySelector('input');
            if (span && input) {
                span.textContent = `Año ${index + 1}:`;
                input.name = `flujo${index + 1}`;
            }
        });
    }

    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(valor);
    }

    formatearPorcentaje(valor) {
        // Siempre multiplicar por 100 para convertir de decimal a porcentaje
        // Entrada: 0.2586 (decimal) -> Salida: "25.86%"
        const porcentaje = valor * 100;
        return porcentaje.toFixed(2) + '%';
    }

    actualizarSimulacionTiempoReal(input) {
        // Implementar actualizaciones en tiempo real si es necesario
        const form = input.closest('form');
        if (form) {
            clearTimeout(this.simulacionTimeout);
            this.simulacionTimeout = setTimeout(() => {
                // Trigger simulation update
                const event = new CustomEvent('actualizarGrafico', {
                    detail: { formId: form.id, inputId: input.id }
                });
                document.dispatchEvent(event);
            }, 300);
        }
    }

    actualizarGrafico(detalles) {
        // Implementar actualizaciones de gráficos en tiempo real
        console.log('Actualizando gráfico:', detalles);
    }

    /**
     * Mostrar resultados VAN profesionales con métricas completas
     */
    mostrarResultadosVANProfesional(resultado, datos) {
        const resultsDiv = document.getElementById('van-results');
        if (!resultsDiv) return;

        // Construir HTML completo para resultados profesionales
        const html = `
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-xl font-bold text-gray-800">Resultados del Análisis Económico</h4>
              <div class="flex gap-2">
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar PDF" onclick="window.simulacionFinanciera.exportarPDF('van')">
                  <i class="fas fa-file-pdf"></i>
                </button>
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar Excel" onclick="window.simulacionFinanciera.exportarExcel('van')">
                  <i class="fas fa-file-excel"></i>
                </button>
              </div>
            </div>

            <!-- Main Metrics -->
            <div class="grid md:grid-cols-4 gap-6 mb-8">
              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold ${resultado.van >= 0 ? 'text-green-600' : 'text-red-600'} mb-1" id="van-result">${this.formatearMoneda(resultado.van)}</div>
                <div class="text-sm text-gray-600 font-medium">Valor Actual Neto</div>
                <div class="text-xs text-gray-500 mt-1">VAN</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-green-600 mb-1" id="van-tir">${resultado.tir !== null ? this.formatearPorcentaje(resultado.tir) : 'N/A'}</div>
                <div class="text-sm text-gray-600 font-medium">Tasa Interna de Retorno</div>
                <div class="text-xs text-gray-500 mt-1">TIR</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-purple-600 mb-1" id="van-payback">${resultado.payback !== null ? resultado.payback.toFixed(1) + ' años' : 'No recuperable'}</div>
                <div class="text-sm text-gray-600 font-medium">Periodo de Recuperación</div>
                <div class="text-xs text-gray-500 mt-1">Payback</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-orange-600 mb-1" id="van-vpn-inversion">${this.formatearPorcentaje(resultado.vanSobreInversion)}</div>
                <div class="text-sm text-gray-600 font-medium">VAN/Inversión</div>
                <div class="text-xs text-gray-500 mt-1">Rentabilidad Relativa</div>
              </div>
            </div>

            <!-- Decision Framework -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-gavel mr-2 text-gray-600"></i>
                Marco de Decisión Económica
              </h5>

              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-800">Evaluación:</span>
                    <span id="van-evaluation" class="px-3 py-1 rounded-full text-sm font-semibold ${
                        resultado.decision === 'viable' ? 'bg-green-100 text-green-800' :
                        resultado.decision === 'no_viable' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }">${
                        resultado.decision === 'viable' ? 'Proyecto Viable' :
                        resultado.decision === 'no_viable' ? 'Proyecto No Viable' :
                        'Proyecto Indiferente'
                    }</span>
                  </div>
                  <div class="text-sm text-gray-600" id="van-evaluation-text">
                    ${resultado.decisionTexto}
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-800">Confianza:</span>
                    <span class="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      Alta
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    Basado en datos completos y consistentes
                  </div>
                </div>
              </div>
            </div>

            <!-- Cash Flow Table -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-table mr-2 text-gray-600"></i>
                Desglose de Flujos de Caja
              </h5>

              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left font-medium text-gray-700">Período</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">Flujo de Caja</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">Factor Descuento</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">Valor Presente</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">VAN Acumulado</th>
                    </tr>
                  </thead>
                  <tbody id="van-cashflow-table" class="divide-y divide-gray-200">
                    <!-- Table rows will be populated by JavaScript -->
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Additional Metrics -->
            <div class="grid md:grid-cols-3 gap-6 mb-6">
              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-lg font-bold text-blue-600 mb-1">${this.formatearPorcentaje(resultado.roi)}</div>
                <div class="text-sm text-gray-600">Retorno sobre Inversión</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-lg font-bold text-indigo-600 mb-1">${resultado.bcr.toFixed(2)}</div>
                <div class="text-sm text-gray-600">Beneficio-Costo Ratio</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-lg font-bold text-teal-600 mb-1">${resultado.horizonte} años</div>
                <div class="text-sm text-gray-600">Horizonte de Análisis</div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.simulacionFinanciera.guardarAnalisis('van')">
                <i class="fas fa-save mr-2"></i>Guardar Análisis
              </button>
              <button id="van-consultar-ia" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300 font-semibold flex items-center justify-center">
                <i class="fas fa-robot mr-2"></i>Consultar con IA
              </button>
            </div>
        `;

        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';

        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Crear tabla de flujos de caja para VAN
     */
    crearTablaFlujosVAN(detalleFlujos, inversion) {
        const tableBody = document.getElementById('van-cashflow-table');
        if (!tableBody) return;

        let html = '';

        // Fila de inversión inicial
        html += `
            <tr class="bg-red-50">
                <td class="px-4 py-2 text-left font-medium text-gray-700">Inversión Inicial</td>
                <td class="px-4 py-2 text-right text-red-600 font-medium">${this.formatearMoneda(-inversion)}</td>
                <td class="px-4 py-2 text-right text-gray-500">-</td>
                <td class="px-4 py-2 text-right text-red-600 font-medium">${this.formatearMoneda(-inversion)}</td>
                <td class="px-4 py-2 text-right text-red-600 font-bold">${this.formatearMoneda(-inversion)}</td>
            </tr>
        `;

        // Filas de flujos de caja
        detalleFlujos.forEach((flujo, index) => {
            const vanAcumuladoTotal = -inversion + flujo.vanAcumulado;
            const claseVAN = vanAcumuladoTotal >= 0 ? 'text-green-600' : 'text-red-600';

            html += `
                <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
                    <td class="px-4 py-2 text-left font-medium text-gray-700">Año ${flujo.periodo}</td>
                    <td class="px-4 py-2 text-right text-gray-700">${this.formatearMoneda(flujo.flujo)}</td>
                    <td class="px-4 py-2 text-right text-gray-600">${flujo.factorDescuento.toFixed(4)}</td>
                    <td class="px-4 py-2 text-right text-gray-700">${this.formatearMoneda(flujo.valorPresente)}</td>
                    <td class="px-4 py-2 text-right font-bold ${claseVAN}">${this.formatearMoneda(vanAcumuladoTotal)}</td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    }

    /**
     * Funciones de acción para VAN
     */
    guardarAnalisis(tipo) {
        const simulacion = this.simulaciones[tipo];
        if (!simulacion) {
            this.mostrarError('No hay análisis para guardar');
            return;
        }

        // Usar la función de UIUtils para guardar en base de datos
        if (window.UIUtils && UIUtils.guardarAnalisis) {
            UIUtils.guardarAnalisis(tipo);
        } else {
            // Fallback: guardar solo en localStorage
            this.guardarSimulacion(tipo, simulacion);
            this.mostrarExito('Análisis guardado exitosamente');
        }
    }

    /**
     * Mostrar modal de guardado (deshabilitado)
     */
    mostrarModalGuardado() {
        // No mostrar modal - funcionalidad deshabilitada
        console.log('Modal de guardado deshabilitado');
    }

    /**
     * Ocultar modal de guardado (deshabilitado)
     */
    ocultarModalGuardado() {
        // No hacer nada - funcionalidad deshabilitada
        console.log('Ocultar modal de guardado deshabilitado');
    }

    /**
     * Mostrar mensaje de éxito
     */
    mostrarExito(mensaje) {
        // Usar sistema de notificaciones si está disponible
        if (window.benchmarkingNotifications) {
            window.benchmarkingNotifications.success(mensaje, '¡Guardado!');
        } else if (window.contextualMessages) {
            window.contextualMessages.success({
                title: '¡Guardado!',
                body: mensaje
            });
        } else {
            alert(`¡Guardado! ${mensaje}`);
        }
    }

    compartirAnalisis(tipo) {
        const simulacion = this.simulaciones[tipo];
        if (!simulacion) {
            this.mostrarError('No hay análisis para compartir');
            return;
        }

        // Crear URL para compartir
        const url = window.location.href;
        const texto = `Análisis ${tipo.toUpperCase()} - ${simulacion.datos.nombreProyecto || 'Proyecto'}\nVAN: ${this.formatearMoneda(simulacion.resultado.van)}`;

        if (navigator.share) {
            navigator.share({
                title: 'Análisis Económico - Econova',
                text: texto,
                url: url
            });
        } else {
            // Fallback: copiar al portapapeles
            navigator.clipboard.writeText(`${texto}\n${url}`).then(() => {
                alert('Enlace copiado al portapapeles');
            });
        }
    }

    imprimirAnalisis(tipo) {
        const simulacion = this.simulaciones[tipo];
        if (!simulacion) {
            this.mostrarError('No hay análisis para imprimir');
            return;
        }

        window.print();
    }

    exportarPDF(tipo) {
        alert('Exportación a PDF próximamente disponible');
    }

    exportarExcel(tipo) {
        alert('Exportación a Excel próximamente disponible');
    }

    /**
     * Mostrar resultados TIR profesionales con análisis completo
     */
    mostrarResultadosTIRProfesional(resultado, datos) {
        const resultsDiv = document.getElementById('tir-results');
        if (!resultsDiv) return;

        // Construir HTML completo para resultados profesionales
        const html = `
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-xl font-bold text-gray-800">Resultados del Análisis TIR</h4>
              <div class="flex gap-2">
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar PDF">
                  <i class="fas fa-file-pdf"></i>
                </button>
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar Excel">
                  <i class="fas fa-file-excel"></i>
                </button>
              </div>
            </div>

            <!-- Main Metrics -->
            <div class="grid md:grid-cols-3 gap-6 mb-8">
              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-green-600 mb-1" id="tir-result">${resultado.tir !== null ? this.formatearPorcentaje(resultado.tir) : 'N/A'}</div>
                <div class="text-sm text-gray-600 font-medium">Tasa Interna de Retorno</div>
                <div class="text-xs text-gray-500 mt-1">TIR</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-blue-600 mb-1" id="tir-vpn-tir">${resultado.vanVerificacion !== null ? this.formatearMoneda(resultado.vanVerificacion) : 'N/A'}</div>
                <div class="text-sm text-gray-600 font-medium">VAN a la TIR</div>
                <div class="text-xs text-gray-500 mt-1">Verificación</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-purple-600 mb-1" id="tir-iteraciones">${resultado.iteraciones}</div>
                <div class="text-sm text-gray-600 font-medium">Iteraciones</div>
                <div class="text-xs text-gray-500 mt-1">Convergencia</div>
              </div>
            </div>

            <!-- Decision Framework -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-gavel mr-2 text-gray-600"></i>
                Marco de Decisión Económica
              </h5>

              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-800">Evaluación:</span>
                    <span id="tir-evaluation" class="px-3 py-1 rounded-full text-sm font-semibold ${
                        resultado.evaluacionColor === 'green' ? 'bg-green-100 text-green-800' :
                        resultado.evaluacionColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                        resultado.evaluacionColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        resultado.evaluacionColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                    }">${
                        resultado.tir !== null ? resultado.evaluacionTexto : 'No se pudo calcular TIR'
                    }</span>
                  </div>
                  <div class="text-sm text-gray-600">
                    ${resultado.tir !== null ?
                        `La TIR de ${this.formatearPorcentaje(resultado.tir)} ${resultado.tir > 12 ? 'supera' : 'está por debajo del'} costo de capital típico.` :
                        'Verifique que existan flujos positivos y negativos.'
                    }
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-800">Comparación con WACC:</span>
                    <span id="tir-vs-wacc" class="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      Calcular WACC primero
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    TIR > WACC indica valor creado
                  </div>
                </div>
              </div>
            </div>

            <!-- Convergence Analysis -->
            <div id="tir-convergence-section" class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6" style="display: none;">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-chart-line mr-2 text-gray-600"></i>
                Análisis de Convergencia - Método ${resultado.metodo === 'newton' ? 'Newton-Raphson' : 'Bisección'}
              </h5>

              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left font-medium text-gray-700">Iteración</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">TIR (%)</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">VAN</th>
                      ${resultado.metodo === 'newton' ? '<th class="px-4 py-2 text-right font-medium text-gray-700">Derivada</th>' : ''}
                    </tr>
                  </thead>
                  <tbody id="tir-convergence-table" class="divide-y divide-gray-200">
                    <!-- Convergence data will be populated by JavaScript -->
                  </tbody>
                </table>
              </div>

              <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                <p class="text-sm text-blue-800">
                  <strong>Método utilizado:</strong> ${resultado.metodo === 'newton' ? 'Newton-Raphson (más eficiente)' : 'Bisección (más robusto)'}.
                  Convergencia lograda en ${resultado.iteraciones} iteraciones.
                </p>
              </div>
            </div>

            <!-- Cash Flow Summary -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-table mr-2 text-gray-600"></i>
                Resumen de Flujos de Caja
              </h5>

              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h6 class="font-semibold text-gray-700 mb-3">Inversión Inicial</h6>
                  <div class="text-2xl font-bold text-red-600" id="tir-inversion-summary">${this.formatearMoneda(resultado.inversion)}</div>
                </div>
                <div>
                  <h6 class="font-semibold text-gray-700 mb-3">Flujo Total de Caja</h6>
                  <div class="text-2xl font-bold text-green-600" id="tir-flujo-total">${this.formatearMoneda(resultado.flujoTotal)}</div>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-lg font-bold text-gray-700">${resultado.flujosCompletos.filter(f => f > 0).length}</div>
                  <div class="text-sm text-gray-600">Flujos Positivos</div>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-lg font-bold text-gray-700">${resultado.flujosCompletos.filter(f => f < 0).length}</div>
                  <div class="text-sm text-gray-600">Flujos Negativos</div>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-lg font-bold text-gray-700">${resultado.flujosCompletos.length}</div>
                  <div class="text-sm text-gray-600">Total Períodos</div>
                </div>
              </div>
            </div>

            <!-- TIR Interpretation -->
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-lightbulb mr-2 text-green-600"></i>
                Interpretación de la TIR
              </h5>

              <div class="text-sm text-gray-700 space-y-2">
                <p><strong>TIR calculada:</strong> ${resultado.tir !== null ? this.formatearPorcentaje(resultado.tir) : 'No calculable'}</p>
                <p><strong>Significado:</strong> La TIR representa la tasa de rendimiento real del proyecto, es decir, la tasa de descuento que hace que el VAN sea exactamente cero.</p>
                <p><strong>Verificación:</strong> El VAN calculado a la TIR debe ser aproximadamente cero: ${resultado.vanVerificacion !== null ? this.formatearMoneda(resultado.vanVerificacion) : 'N/A'}</p>
                <p><strong>Comparación:</strong> Para tomar decisiones, compare la TIR con el costo de capital (WACC). Si TIR > WACC, el proyecto crea valor.</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.simulacionFinanciera.guardarAnalisis('tir')">
                <i class="fas fa-save mr-2"></i>Guardar Análisis
              </button>
              <button class="border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-700 hover:text-white transition duration-300 font-semibold flex items-center justify-center" onclick="window.simulacionFinanciera.compartirAnalisis('tir')">
                <i class="fas fa-share mr-2"></i>Compartir Resultados
              </button>
              <button class="border-2 border-gray-600 text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-700 hover:text-white transition duration-300 font-semibold flex items-center justify-center" onclick="window.simulacionFinanciera.imprimirAnalisis('tir')">
                <i class="fas fa-print mr-2"></i>Imprimir Reporte
              </button>
            </div>
        `;

        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';

        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Crear tabla de convergencia para TIR
     */
    crearTablaConvergenciaTIR(convergencia) {
        const tableBody = document.getElementById('tir-convergence-table');
        if (!tableBody || !convergencia) return;

        let html = '';

        convergencia.slice(0, 10).forEach((iter, index) => { // Mostrar máximo 10 iteraciones
            html += `
                <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
                    <td class="px-4 py-2 text-left font-medium text-gray-700">${iter.iteracion}</td>
                    <td class="px-4 py-2 text-right text-gray-700">${this.formatearPorcentaje(iter.tir)}</td>
                    <td class="px-4 py-2 text-right text-gray-700">${this.formatearMoneda(iter.van)}</td>
                    ${iter.derivada !== undefined ? `<td class="px-4 py-2 text-right text-gray-700">${iter.derivada.toFixed(6)}</td>` : ''}
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    }

    /**
     * Mostrar resultados WACC profesionales con análisis completo de estructura de capital
     */
    mostrarResultadosWACCProfesional(resultado, datos) {
        const resultsDiv = document.getElementById('wacc-results');
        if (!resultsDiv) return;

        // Construir HTML completo para resultados profesionales
        const html = `
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-xl font-bold text-gray-800">Resultados del Análisis WACC</h4>
              <div class="flex gap-2">
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar PDF">
                  <i class="fas fa-file-pdf"></i>
                </button>
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar Excel">
                  <i class="fas fa-file-excel"></i>
                </button>
              </div>
            </div>

            <!-- Main WACC Result -->
            <div class="text-center mb-8">
              <div class="inline-block bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div class="text-4xl font-bold text-purple-600 mb-2" id="wacc-result">${this.formatearPorcentaje(resultado.wacc)}</div>
                <div class="text-lg text-gray-600 font-medium">Costo Promedio Ponderado del Capital</div>
                <div class="text-sm text-gray-500 mt-1">Tasa de descuento apropiada</div>
              </div>
            </div>

            <!-- Component Breakdown -->
            <div class="grid md:grid-cols-2 gap-6 mb-8">
              <!-- Debt Component -->
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h5 class="font-bold text-red-800 mb-4 flex items-center">
                  <i class="fas fa-credit-card mr-2"></i>
                  Componente de Deuda
                </h5>

                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Costo de deuda (antes de impuestos):</span>
                    <span class="font-semibold text-red-600" id="wacc-deuda-display">${this.formatearPorcentaje(datos.costoDeuda)}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Costo de deuda (después de impuestos):</span>
                    <span class="font-semibold text-red-600" id="wacc-deuda-after-tax">${this.formatearPorcentaje(resultado.componentes.costoDeudaAfterTax)}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Peso de la deuda:</span>
                    <span class="font-semibold text-gray-800" id="wacc-peso-deuda">${this.formatearPorcentaje(datos.proporcionDeuda)}</span>
                  </div>
                  <div class="flex justify-between items-center border-t pt-2">
                    <span class="text-sm font-medium text-gray-700">Contribución al WACC:</span>
                    <span class="font-bold text-red-600" id="wacc-contribucion-deuda">${this.formatearPorcentaje(resultado.contribuciones.deuda)}</span>
                  </div>
                </div>
              </div>

              <!-- Equity Component -->
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h5 class="font-bold text-green-800 mb-4 flex items-center">
                  <i class="fas fa-chart-line mr-2"></i>
                  Componente de Capital Propio
                </h5>

                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Costo de capital propio:</span>
                    <span class="font-semibold text-green-600" id="wacc-capital-display">${this.formatearPorcentaje(datos.costoCapitalPropio)}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Peso del capital propio:</span>
                    <span class="font-semibold text-gray-800" id="wacc-peso-capital">${this.formatearPorcentaje(datos.proporcionCapital)}</span>
                  </div>
                  <div class="flex justify-between items-center border-t pt-2">
                    <span class="text-sm font-medium text-gray-700">Contribución al WACC:</span>
                    <span class="font-bold text-green-600" id="wacc-contribucion-capital">${this.formatearPorcentaje(resultado.contribuciones.capital)}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Decision Framework -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-gavel mr-2 text-gray-600"></i>
                Marco de Decisión Económica
              </h5>

              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-800">Evaluación WACC:</span>
                    <span id="wacc-evaluation" class="px-3 py-1 rounded-full text-sm font-semibold ${
                        resultado.evaluacionColor === 'green' ? 'bg-green-100 text-green-800' :
                        resultado.evaluacionColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }">${resultado.evaluacionTexto}</span>
                  </div>
                  <div class="text-sm text-gray-600">
                    ${resultado.wacc < 12 ? 'Costo de capital favorable para inversiones' : 'Costo de capital elevado - revisar oportunidades'}
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-800">Comparación con TIR:</span>
                    <span id="wacc-vs-tir" class="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      Calcular TIR primero
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    WACC vs TIR determina viabilidad
                  </div>
                </div>
              </div>
            </div>

            <!-- WACC Formula Explanation -->
            <div class="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-lightbulb mr-2 text-purple-600"></i>
                Fórmula del WACC
              </h5>

              <div class="bg-white p-4 rounded-lg mb-4">
                <div class="text-center">
                  <div class="text-lg font-mono text-purple-800 mb-2">
                    WACC = (E/V × Re) + (D/V × Rd × (1-Tc))
                  </div>
                  <div class="text-sm text-gray-600">
                    Donde: E/V = Proporción de capital propio | D/V = Proporción de deuda |<br>
                    Re = Costo de capital propio | Rd = Costo de deuda | Tc = Tasa de impuestos
                  </div>
                </div>
              </div>

              <div class="text-sm text-gray-700 space-y-2">
                <p><strong>WACC calculado:</strong> <span id="wacc-formula-result" class="font-semibold text-purple-600">${this.formatearPorcentaje(resultado.wacc)}</span></p>
                <p><strong>Interpretación:</strong> Este es el costo mínimo de rendimiento que debe generar un proyecto para crear valor para los accionistas.</p>
                <p><strong>Aplicación:</strong> Use este WACC como tasa de descuento en análisis VAN y TIR de proyectos con riesgo similar al de la empresa.</p>
                ${datos.escudoFiscal ? '<p><strong>Escudo fiscal aplicado:</strong> Se ha considerado el beneficio fiscal de la deuda en el cálculo.</p>' : '<p><strong>Sin escudo fiscal:</strong> No se aplicó el beneficio fiscal de la deuda.</p>'}
              </div>
            </div>

            <!-- Additional Metrics -->
            <div class="grid md:grid-cols-3 gap-6 mb-6">
              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-lg font-bold text-blue-600 mb-1">${resultado.metricasAdicionales.leverageRatio.toFixed(2)}</div>
                <div class="text-sm text-gray-600">Ratio Endeudamiento</div>
                <div class="text-xs text-gray-500 mt-1">D/E</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-lg font-bold text-indigo-600 mb-1">${this.formatearPorcentaje(resultado.metricasAdicionales.taxShield)}</div>
                <div class="text-sm text-gray-600">Escudo Fiscal</div>
                <div class="text-xs text-gray-500 mt-1">Beneficio Tributario</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-lg font-bold text-teal-600 mb-1">${this.formatearPorcentaje(resultado.metricasAdicionales.waccSinEscudo)}</div>
                <div class="text-sm text-gray-600">WACC sin Escudo</div>
                <div class="text-xs text-gray-500 mt-1">Comparación</div>
              </div>
            </div>

            <!-- Industry Benchmarks -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-industry mr-2 text-gray-600"></i>
                Referencias Sectoriales
              </h5>

              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left font-medium text-gray-700">Sector</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">WACC Promedio</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">Rango Típico</th>
                      <th class="px-4 py-2 text-center font-medium text-gray-700">Su WACC</th>
                    </tr>
                  </thead>
                  <tbody id="wacc-sector-table" class="divide-y divide-gray-200">
                    <tr>
                      <td class="px-4 py-2 text-left font-medium text-gray-700">Energía y Recursos</td>
                      <td class="px-4 py-2 text-right text-gray-700">8.5%</td>
                      <td class="px-4 py-2 text-right text-gray-700">7.0% - 10.0%</td>
                      <td class="px-4 py-2 text-center ${resultado.wacc >= 7.0 && resultado.wacc <= 10.0 ? 'text-green-600 font-semibold' : 'text-gray-500'}">${resultado.wacc >= 7.0 && resultado.wacc <= 10.0 ? '✓ En rango' : 'Fuera de rango'}</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="px-4 py-2 text-left font-medium text-gray-700">Manufactura</td>
                      <td class="px-4 py-2 text-right text-gray-700">9.2%</td>
                      <td class="px-4 py-2 text-right text-gray-700">8.0% - 11.0%</td>
                      <td class="px-4 py-2 text-center ${resultado.wacc >= 8.0 && resultado.wacc <= 11.0 ? 'text-green-600 font-semibold' : 'text-gray-500'}">${resultado.wacc >= 8.0 && resultado.wacc <= 11.0 ? '✓ En rango' : 'Fuera de rango'}</td>
                    </tr>
                    <tr>
                      <td class="px-4 py-2 text-left font-medium text-gray-700">Tecnología</td>
                      <td class="px-4 py-2 text-right text-gray-700">10.8%</td>
                      <td class="px-4 py-2 text-right text-gray-700">9.0% - 13.0%</td>
                      <td class="px-4 py-2 text-center ${resultado.wacc >= 9.0 && resultado.wacc <= 13.0 ? 'text-green-600 font-semibold' : 'text-gray-500'}">${resultado.wacc >= 9.0 && resultado.wacc <= 13.0 ? '✓ En rango' : 'Fuera de rango'}</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="px-4 py-2 text-left font-medium text-gray-700">Construcción</td>
                      <td class="px-4 py-2 text-right text-gray-700">9.8%</td>
                      <td class="px-4 py-2 text-right text-gray-700">8.5% - 11.5%</td>
                      <td class="px-4 py-2 text-center ${resultado.wacc >= 8.5 && resultado.wacc <= 11.5 ? 'text-green-600 font-semibold' : 'text-gray-500'}">${resultado.wacc >= 8.5 && resultado.wacc <= 11.5 ? '✓ En rango' : 'Fuera de rango'}</td>
                    </tr>
                    <tr>
                      <td class="px-4 py-2 text-left font-medium text-gray-700">Servicios Financieros</td>
                      <td class="px-4 py-2 text-right text-gray-700">8.9%</td>
                      <td class="px-4 py-2 text-right text-gray-700">7.5% - 10.5%</td>
                      <td class="px-4 py-2 text-center ${resultado.wacc >= 7.5 && resultado.wacc <= 10.5 ? 'text-green-600 font-semibold' : 'text-gray-500'}">${resultado.wacc >= 7.5 && resultado.wacc <= 10.5 ? '✓ En rango' : 'Fuera de rango'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                <p class="text-sm text-blue-800">
                  <strong>Comparación sectorial:</strong> ${resultado.sector === 'energia' ? 'Sector Energía' :
                    resultado.sector === 'manufactura' ? 'Sector Manufactura' :
                    resultado.sector === 'tecnologia' ? 'Sector Tecnología' :
                    resultado.sector === 'construccion' ? 'Sector Construcción' :
                    resultado.sector === 'financiero' ? 'Sector Servicios Financieros' :
                    'Sector General'}.
                  Su WACC de ${this.formatearPorcentaje(resultado.wacc)} está ${resultado.wacc < 12 ? 'dentro' : 'por encima'} del rango típico del sector.
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.simulacionFinanciera.guardarAnalisis('wacc')">
                <i class="fas fa-save mr-2"></i>Guardar Análisis
              </button>
              <button class="border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-700 hover:text-white transition duration-300 font-semibold flex items-center justify-center" onclick="window.simulacionFinanciera.compartirAnalisis('wacc')">
                <i class="fas fa-share mr-2"></i>Compartir Resultados
              </button>
              <button class="border-2 border-gray-600 text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-700 hover:text-white transition duration-300 font-semibold flex items-center justify-center" onclick="window.simulacionFinanciera.imprimirAnalisis('wacc')">
                <i class="fas fa-print mr-2"></i>Imprimir Reporte
              </button>
            </div>
        `;

        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';

        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Mostrar resultados WACC (función simplificada para compatibilidad)
     */
    mostrarResultadosWACC(resultado, datos) {
        // Usar la función profesional por defecto
        this.mostrarResultadosWACCProfesional(resultado, datos);
    }

    mostrarError(mensaje) {
        // Usar sistema de mensajes contextuales si está disponible
        if (window.contextualMessages) {
            window.contextualMessages.error({
                title: 'Error en simulación',
                body: mensaje
            });
        } else {
            alert(`Error: ${mensaje}`);
        }
    }

    guardarSimulacion(tipo, datos) {
        this.simulaciones[tipo] = {
            ...datos,
            timestamp: new Date(),
            id: Date.now()
        };

        // Guardar en localStorage
        try {
            const simulacionesGuardadas = JSON.parse(localStorage.getItem('econova_simulaciones') || '{}');
            simulacionesGuardadas[tipo] = this.simulaciones[tipo];
            localStorage.setItem('econova_simulaciones', JSON.stringify(simulacionesGuardadas));
        } catch (error) {
            console.warn('No se pudo guardar la simulación:', error);
        }
    }

    dispararEvento(evento, datos) {
        const customEvent = new CustomEvent(`simulacion${evento.charAt(0).toUpperCase() + evento.slice(1)}`, {
            detail: datos
        });
        document.dispatchEvent(customEvent);
    }

    /**
     * ML Analysis Functions
     */

    /**
     * Analizar predicciones con IA
     */
    async analizarPredicciones(form) {
        const formData = new FormData(form);
        const datos = {
            ingresos_anuales: parseFloat(formData.get('ingresos_anuales')) || 0,
            gastos_operativos: parseFloat(formData.get('gastos_operativos')) || 0,
            activos_totales: parseFloat(formData.get('activos_totales')) || 0,
            pasivos_totales: parseFloat(formData.get('pasivos_totales')) || 0
        };

        // Validar datos
        if (!this.validarDatosPrediccion(datos)) {
            this.mostrarError('Por favor, complete todos los campos correctamente.');
            return;
        }

        try {
            // Mostrar loading
            this.mostrarLoading('prediccion-results', 'Generando predicciones con IA...');

            // Llamar a la API de ML
            const response = await fetch('/api/v1/ml/predecir/ingresos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.status === 'success') {
                // Obtener predicciones adicionales
                const crecimientoResponse = await fetch('/api/v1/ml/predecir/crecimiento', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                const riesgoResponse = await fetch('/api/v1/ml/predecir/riesgo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                const [crecimientoData, riesgoData] = await Promise.all([
                    crecimientoResponse.json(),
                    riesgoResponse.json()
                ]);

                // Combinar resultados
                const resultadoCompleto = {
                    ingresos_predichos: resultado.prediccion.ingresos_predichos || 0,
                    crecimiento_esperado: crecimientoData.prediccion?.crecimiento_esperado || 0,
                    nivel_riesgo: riesgoData.clasificacion?.nivel_riesgo || 'Medio',
                    recomendaciones: resultado.prediccion.recomendaciones || []
                };

                // Mostrar resultados
                this.mostrarResultadosPrediccion(resultadoCompleto, datos);

                // Guardar análisis
                this.guardarSimulacion('prediccion', { datos, resultado: resultadoCompleto });

                // Disparar evento
                this.dispararEvento('prediccionAnalizada', resultadoCompleto);
            } else {
                throw new Error(resultado.error || 'Error en la predicción');
            }

        } catch (error) {
            console.error('Error en análisis de predicciones:', error);
            this.mostrarError('Error al generar predicciones. Intente nuevamente.');
        } finally {
            this.ocultarLoading('prediccion-results');
        }
    }

    /**
     * Analizar tornado (sensibilidad de variables)
     */
    async analizarTornado(form) {
        const formData = new FormData(form);
        const datos = {
            inversion_inicial: parseFloat(formData.get('inversion_inicial')) || 0,
            tasa_descuento: parseFloat(formData.get('tasa_descuento')) || 0,
            flujos_caja: this.parsearFlujos(formData.get('flujo1') + ',' +
                                           formData.get('flujo2') + ',' +
                                           formData.get('flujo3'))
        };

        // Validar datos
        if (!this.validarDatosTornado(datos)) {
            this.mostrarError('Por favor, complete todos los campos correctamente.');
            return;
        }

        try {
            this.mostrarLoading('tornado-results', 'Analizando variables sensibles...');

            const response = await fetch('/api/v1/ml/sensibilidad/tornado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.status === 'success') {
                this.mostrarResultadosTornado(resultado.analisis_tornado, datos);
                this.guardarSimulacion('tornado', { datos, resultado: resultado.analisis_tornado });
                this.dispararEvento('tornadoAnalizado', resultado.analisis_tornado);
            } else {
                throw new Error(resultado.error || 'Error en análisis tornado');
            }

        } catch (error) {
            console.error('Error en análisis tornado:', error);
            this.mostrarError('Error en análisis de sensibilidad. Intente nuevamente.');
        } finally {
            this.ocultarLoading('tornado-results');
        }
    }

    /**
     * Simular Monte Carlo
     */
    async simularMonteCarlo(form) {
        const formData = new FormData(form);
        const datos = {
            inversion_inicial: parseFloat(formData.get('inversion_inicial')) || 0,
            tasa_descuento: parseFloat(formData.get('tasa_descuento')) || 0,
            flujos_caja: this.parsearFlujos(formData.get('flujo1') + ',' +
                                           formData.get('flujo2') + ',' +
                                           formData.get('flujo3')),
            n_simulaciones: parseInt(formData.get('n_simulaciones')) || 5000,
            nivel_confianza: parseInt(formData.get('nivel_confianza')) || 95
        };

        // Validar datos
        if (!this.validarDatosMonteCarlo(datos)) {
            this.mostrarError('Por favor, complete todos los campos correctamente.');
            return;
        }

        try {
            this.mostrarLoading('montecarlo-results', 'Ejecutando simulación Monte Carlo...');

            const response = await fetch('/api/v1/ml/sensibilidad/montecarlo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.status === 'success') {
                this.mostrarResultadosMonteCarlo(resultado.simulacion, datos);
                this.guardarSimulacion('montecarlo', { datos, resultado: resultado.simulacion });
                this.dispararEvento('montecarloSimulado', resultado.simulacion);
            } else {
                throw new Error(resultado.error || 'Error en simulación Monte Carlo');
            }

        } catch (error) {
            console.error('Error en simulación Monte Carlo:', error);
            this.mostrarError('Error en simulación probabilística. Intente nuevamente.');
        } finally {
            this.ocultarLoading('montecarlo-results');
        }
    }

    /**
     * Analizar sensibilidad (escenarios)
     */
    async analizarSensibilidad(form) {
        const formData = new FormData(form);
        const datos = {
            inversion_inicial: parseFloat(formData.get('inversion_inicial')) || 0,
            tasa_descuento: parseFloat(formData.get('tasa_descuento')) || 0,
            flujos_caja: this.parsearFlujos(formData.get('flujo1') + ',' +
                                           formData.get('flujo2') + ',' +
                                           formData.get('flujo3'))
        };

        // Validar datos
        if (!this.validarDatosSensibilidad(datos)) {
            this.mostrarError('Por favor, complete todos los campos correctamente.');
            return;
        }

        try {
            this.mostrarLoading('sensibilidad-results', 'Analizando escenarios...');

            const response = await fetch('/api/v1/ml/sensibilidad/escenarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.status === 'success') {
                this.mostrarResultadosSensibilidad(resultado.analisis_escenarios, datos);
                this.guardarSimulacion('sensibilidad', { datos, resultado: resultado.analisis_escenarios });
                this.dispararEvento('sensibilidadAnalizada', resultado.analisis_escenarios);
            } else {
                throw new Error(resultado.error || 'Error en análisis de escenarios');
            }

        } catch (error) {
            console.error('Error en análisis de sensibilidad:', error);
            this.mostrarError('Error en análisis de escenarios. Intente nuevamente.');
        } finally {
            this.ocultarLoading('sensibilidad-results');
        }
    }

    /**
     * Funciones de resultados para ML
     */
    mostrarResultadosPrediccion(resultado, datos) {
        const resultsDiv = document.getElementById('prediccion-results');
        if (!resultsDiv) return;

        // Actualizar elementos
        const ingresosElement = document.getElementById('prediccion-ingresos');
        const crecimientoElement = document.getElementById('prediccion-crecimiento');
        const riesgoElement = document.getElementById('prediccion-riesgo');
        const recomendacionesElement = document.getElementById('prediccion-recomendaciones');

        if (ingresosElement) ingresosElement.textContent = this.formatearMoneda(resultado.ingresos_predichos);
        if (crecimientoElement) crecimientoElement.textContent = this.formatearPorcentaje(resultado.crecimiento_esperado);
        if (riesgoElement) {
            riesgoElement.textContent = resultado.nivel_riesgo;
            // Cambiar color según riesgo
            riesgoElement.className = `font-semibold ${
                resultado.nivel_riesgo === 'Bajo' ? 'text-green-600' :
                resultado.nivel_riesgo === 'Medio' ? 'text-yellow-600' : 'text-red-600'
            }`;
        }
        if (recomendacionesElement) {
            recomendacionesElement.textContent = Array.isArray(resultado.recomendaciones)
                ? resultado.recomendaciones.join('. ')
                : resultado.recomendaciones || 'Sin recomendaciones específicas.';
        }

        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    mostrarResultadosTornado(resultado, datos) {
        const resultsDiv = document.getElementById('tornado-results');
        if (!resultsDiv) return;

        const rankingDiv = document.getElementById('tornado-ranking');
        const variableElement = document.getElementById('tornado-variable-principal');

        if (rankingDiv && resultado.variables_impacto) {
            rankingDiv.innerHTML = resultado.variables_impacto.map((variable, index) =>
                `<div class="flex justify-between items-center p-2 ${index === 0 ? 'bg-red-50 border-l-4 border-red-500' : 'bg-gray-50'} rounded">
                    <span class="font-medium">${variable.nombre}</span>
                    <span class="text-sm ${variable.impacto > 0 ? 'text-red-600' : 'text-green-600'}">
                        ${variable.impacto > 0 ? '+' : ''}${this.formatearMoneda(variable.impacto)}
                    </span>
                </div>`
            ).join('');
        }

        if (variableElement && resultado.variables_impacto && resultado.variables_impacto[0]) {
            variableElement.textContent = resultado.variables_impacto[0].nombre;
        }

        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    mostrarResultadosMonteCarlo(resultado, datos) {
        const resultsDiv = document.getElementById('montecarlo-results');
        if (!resultsDiv) return;

        // Actualizar elementos
        const mediaElement = document.getElementById('montecarlo-media');
        const medianaElement = document.getElementById('montecarlo-mediana');
        const desviacionElement = document.getElementById('montecarlo-desviacion');
        const probabilidadElement = document.getElementById('montecarlo-probabilidad');
        const intervaloMinElement = document.getElementById('montecarlo-intervalo-min');
        const intervaloMaxElement = document.getElementById('montecarlo-intervalo-max');
        const recomendacionElement = document.getElementById('montecarlo-recomendacion');

        if (mediaElement) mediaElement.textContent = this.formatearMoneda(resultado.van_promedio || 0);
        if (medianaElement) medianaElement.textContent = this.formatearMoneda(resultado.van_mediana || 0);
        if (desviacionElement) desviacionElement.textContent = this.formatearMoneda(resultado.desviacion_estandar || 0);
        if (probabilidadElement) probabilidadElement.textContent = this.formatearPorcentaje((resultado.probabilidad_van_positivo || 0) * 100);

        if (resultado.intervalo_confianza) {
            if (intervaloMinElement) intervaloMinElement.textContent = this.formatearMoneda(resultado.intervalo_confianza.min || 0);
            if (intervaloMaxElement) intervaloMaxElement.textContent = this.formatearMoneda(resultado.intervalo_confianza.max || 0);
        }

        if (recomendacionElement) {
            const prob = resultado.probabilidad_van_positivo || 0;
            recomendacionElement.textContent = prob > 0.7 ? 'Proyecto recomendado' :
                                                prob > 0.5 ? 'Proyecto moderado' : 'Proyecto riesgoso';
            recomendacionElement.className = `font-semibold ${
                prob > 0.7 ? 'text-green-600' :
                prob > 0.5 ? 'text-yellow-600' : 'text-red-600'
            }`;
        }

        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    mostrarResultadosSensibilidad(resultado, datos) {
        const resultsDiv = document.getElementById('sensibilidad-results');
        if (!resultsDiv) return;

        // Actualizar elementos
        const pesimistaElement = document.getElementById('sensibilidad-pesimista');
        const baseElement = document.getElementById('sensibilidad-base');
        const optimistaElement = document.getElementById('sensibilidad-optimista');
        const rangoMinElement = document.getElementById('sensibilidad-rango-min');
        const rangoMaxElement = document.getElementById('sensibilidad-rango-max');
        const riesgoElement = document.getElementById('sensibilidad-riesgo');

        if (resultado.escenarios) {
            if (pesimistaElement) pesimistaElement.textContent = this.formatearMoneda(resultado.escenarios.pesimista?.van || 0);
            if (baseElement) baseElement.textContent = this.formatearMoneda(resultado.escenarios.base?.van || 0);
            if (optimistaElement) optimistaElement.textContent = this.formatearMoneda(resultado.escenarios.optimista?.van || 0);
        }

        if (resultado.rango_van) {
            if (rangoMinElement) rangoMinElement.textContent = this.formatearMoneda(resultado.rango_van.min || 0);
            if (rangoMaxElement) rangoMaxElement.textContent = this.formatearMoneda(resultado.rango_van.max || 0);
        }

        if (riesgoElement) {
            const rango = (resultado.rango_van?.max || 0) - (resultado.rango_van?.min || 0);
            const riesgo = rango > 100000 ? 'Alto' : rango > 50000 ? 'Medio' : 'Bajo';
            riesgoElement.textContent = riesgo;
            riesgoElement.className = `font-semibold ${
                riesgo === 'Bajo' ? 'text-green-600' :
                riesgo === 'Medio' ? 'text-yellow-600' : 'text-red-600'
            }`;
        }

        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Funciones de validación para ML
     */
    validarDatosPrediccion(datos) {
        return datos.ingresos_anuales > 0 &&
               datos.gastos_operativos >= 0 &&
               datos.activos_totales > 0 &&
               datos.pasivos_totales >= 0;
    }

    validarDatosTornado(datos) {
        return datos.inversion_inicial >= 0 &&
               datos.tasa_descuento >= 0 && datos.tasa_descuento <= 100 &&
               datos.flujos_caja && datos.flujos_caja.length > 0;
    }

    validarDatosMonteCarlo(datos) {
        return datos.inversion_inicial >= 0 &&
               datos.tasa_descuento >= 0 && datos.tasa_descuento <= 100 &&
               datos.flujos_caja && datos.flujos_caja.length > 0 &&
               datos.n_simulaciones > 0 && datos.n_simulaciones <= 25000;
    }

    validarDatosSensibilidad(datos) {
        return datos.inversion_inicial >= 0 &&
               datos.tasa_descuento >= 0 && datos.tasa_descuento <= 100 &&
               datos.flujos_caja && datos.flujos_caja.length > 0;
    }

    /**
     * Cambiar tab de análisis ML
     */
    cambiarTabML(tabId) {
        // Remover clase active de todos los tabs
        const tabs = document.querySelectorAll('.ml-tab-btn');
        tabs.forEach(tab => {
            tab.classList.remove('active', 'bg-purple-600', 'text-white');
            tab.classList.add('bg-white', 'text-purple-700', 'border', 'border-purple-300');
        });

        // Ocultar todos los contenidos de tab
        const contents = document.querySelectorAll('.ml-tab-content');
        contents.forEach(content => {
            content.style.display = 'none';
        });

        // Ocultar resultados
        const resultsDiv = document.getElementById('ml-results');
        if (resultsDiv) {
            resultsDiv.style.display = 'none';
        }

        // Activar tab seleccionado
        const activeTab = document.getElementById(tabId);
        if (activeTab) {
            activeTab.classList.add('active', 'bg-purple-600', 'text-white');
            activeTab.classList.remove('bg-white', 'text-purple-700', 'border', 'border-purple-300');
        }

        // Mostrar contenido correspondiente
        const contentId = tabId.replace('-tab', '-content');
        const activeContent = document.getElementById(contentId);
        if (activeContent) {
            activeContent.style.display = 'block';
        }
    }

    /**
     * Funciones auxiliares para ML
     */
    mostrarLoading(elementId, mensaje) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center py-8">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p class="mt-2 text-gray-600">${mensaje}</p>
                </div>
            `;
            element.style.display = 'block';
        }
    }

    ocultarLoading(elementId) {
        // El contenido se reemplaza cuando se muestran los resultados
    }

    // API pública
    obtenerSimulacion(tipo) {
        return this.simulaciones[tipo] || null;
    }

    listarSimulaciones() {
        return Object.keys(this.simulaciones);
    }

    exportarResultados(tipo) {
        const simulacion = this.simulaciones[tipo];
        if (!simulacion) return null;

        return {
            tipo: tipo,
            datos: simulacion.datos,
            resultados: simulacion.resultado,
            timestamp: simulacion.timestamp,
            exportado: new Date()
        };
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    window.simulacionFinanciera = new SimulacionFinanciera();
    console.log('📊 Simulación Financiera inicializada');
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimulacionFinanciera;
}
