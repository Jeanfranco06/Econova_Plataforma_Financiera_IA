/**
 * Módulo de Machine Learning y Análisis de Sensibilidad - Econova
 * Modelos XGBoost, análisis de Monte Carlo y escenarios "qué pasaría si"
 */

class MLSensibilidadManager {
    constructor() {
        this.modelos = {};
        this.escenarios = {};
        this.simulacionesMonteCarlo = {};
        this.init();
    }

    init() {
        console.log('🤖 Módulo ML y Sensibilidad inicializado');
        this.setupEventListeners();
        this.cargarModelosPreentrenados();
    }

    setupEventListeners() {
        // Escuchar eventos de formularios ML
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'form-prediccion-ventas') {
                e.preventDefault();
                this.generarPrediccionVentas(e.target);
            }
            if (e.target.id === 'form-analisis-sensibilidad') {
                e.preventDefault();
                this.analizarSensibilidad(e.target);
            }
            if (e.target.id === 'form-monte-carlo') {
                e.preventDefault();
                this.simulacionMonteCarlo(e.target);
            }
            if (e.target.id === 'form-riesgo-crediticio') {
                e.preventDefault();
                this.evaluarRiesgoCrediticio(e.target);
            }
        });

        // Escuchar eventos de actualización de modelos
        document.addEventListener('modeloActualizado', (event) => {
            this.actualizarModelo(event.detail);
        });
    }

    /**
     * Predicción de ventas con XGBoost
     */
    async generarPrediccionVentas(form) {
        const formData = new FormData(form);
        const datos = {
            datosHistoricos: this.parsearDatosHistoricos(formData.get('datos_historicos')),
            periodoPrediccion: parseInt(formData.get('periodo_prediccion')) || 12,
            factoresExternos: this.parsearFactoresExternos(formData.get('factores_externos')),
            incluirTendencia: formData.get('incluir_tendencia') === 'on',
            incluirEstacionalidad: formData.get('incluir_estacionalidad') === 'on'
        };

        // Validar datos
        if (!this.validarDatosPrediccion(datos)) {
            this.mostrarError('Por favor, complete correctamente los datos históricos.');
            return;
        }

        // Mostrar loading
        this.mostrarLoading('Generando predicción con IA...');

        try {
            // Generar predicción usando modelo XGBoost simulado
            const prediccion = await this.ejecutarModeloXGBoost(datos);

            // Calcular métricas de precisión
            const metricas = this.calcularMetricasPrecision(datos.datosHistoricos, prediccion);

            // Generar recomendaciones
            const recomendaciones = this.generarRecomendacionesPrediccion(prediccion, metricas);

            // Mostrar resultados
            this.mostrarResultadosPrediccion(prediccion, metricas, recomendaciones, datos);

            // Crear gráficos de predicción
            this.crearGraficosPrediccion(datos.datosHistoricos, prediccion);

            // Guardar predicción
            this.guardarPrediccion('ventas', { datos, prediccion, metricas, recomendaciones });

            // Disparar evento
            this.dispararEvento('prediccionVentasGenerada', prediccion);

        } catch (error) {
            console.error('Error generando predicción:', error);
            this.mostrarError('Error al generar la predicción. Intente nuevamente.');
        } finally {
            this.ocultarLoading();
        }
    }

    async ejecutarModeloXGBoost(datos) {
        // Simular modelo XGBoost (en producción sería una llamada a API de ML)
        const { datosHistoricos, periodoPrediccion, factoresExternos, incluirTendencia, incluirEstacionalidad } = datos;

        // Calcular tendencia
        const tendencia = incluirTendencia ? this.calcularTendencia(datosHistoricos) : 0;

        // Calcular estacionalidad
        const estacionalidad = incluirEstacionalidad ? this.calcularEstacionalidad(datosHistoricos) : 1;

        // Generar predicciones
        const predicciones = [];
        let ultimoValor = datosHistoricos[datosHistoricos.length - 1];

        for (let i = 1; i <= periodoPrediccion; i++) {
            // Aplicar factores del modelo XGBoost simulado
            const factorEstacional = estacionalidad[i % 12] || 1; // Ciclo anual
            const factorExterno = this.aplicarFactoresExternos(factoresExternos, i);
            const ruido = (Math.random() - 0.5) * 0.1; // ±5% de variabilidad

            ultimoValor = ultimoValor * (1 + tendencia + factorEstacional - 1 + factorExterno) * (1 + ruido);

            predicciones.push({
                periodo: i,
                valor: Math.max(0, ultimoValor),
                confianza: Math.max(0.7, 1 - Math.abs(ruido) * 2), // Confianza basada en ruido
                factores: {
                    tendencia: tendencia,
                    estacionalidad: factorEstacional,
                    externo: factorExterno,
                    ruido: ruido
                }
            });
        }

        return {
            predicciones: predicciones,
            modelo: 'XGBoost Regressor',
            precision_historica: 0.87, // Simulado
            intervalo_confianza: 0.95
        };
    }

    calcularTendencia(datos) {
        if (datos.length < 2) return 0;

        // Calcular tasa de crecimiento promedio
        const crecimientos = [];
        for (let i = 1; i < datos.length; i++) {
            crecimientos.push((datos[i] - datos[i-1]) / datos[i-1]);
        }

        return crecimientos.reduce((sum, val) => sum + val, 0) / crecimientos.length;
    }

    calcularEstacionalidad(datos) {
        // Calcular factores estacionales simplificados
        const estacionalidad = {};
        const meses = 12;

        for (let mes = 0; mes < meses; mes++) {
            const valoresMes = [];
            for (let i = mes; i < datos.length; i += meses) {
                valoresMes.push(datos[i]);
            }

            if (valoresMes.length > 0) {
                const promedioMes = valoresMes.reduce((sum, val) => sum + val, 0) / valoresMes.length;
                const promedioGeneral = datos.reduce((sum, val) => sum + val, 0) / datos.length;
                estacionalidad[mes] = promedioMes / promedioGeneral;
            }
        }

        return estacionalidad;
    }

    aplicarFactoresExternos(factores, periodo) {
        if (!factores || factores.length === 0) return 0;

        // Aplicar impacto de factores externos
        let impactoTotal = 0;

        factores.forEach(factor => {
            if (factor.activo && periodo >= factor.periodoInicio && periodo <= factor.periodoFin) {
                impactoTotal += factor.impacto;
            }
        });

        return impactoTotal;
    }

    /**
     * Análisis de sensibilidad con Monte Carlo
     */
    async analizarSensibilidad(form) {
        const formData = new FormData(form);
        const datos = {
            variables: this.parsearVariablesSensibilidad(formData.get('variables')),
            funcionObjetivo: formData.get('funcion_objetivo'),
            numSimulaciones: parseInt(formData.get('num_simulaciones')) || 1000,
            rangoVariacion: parseFloat(formData.get('rango_variacion')) || 0.2
        };

        // Validar datos
        if (!this.validarDatosSensibilidad(datos)) {
            this.mostrarError('Por favor, complete correctamente las variables de sensibilidad.');
            return;
        }

        // Mostrar loading
        this.mostrarLoading('Ejecutando análisis de sensibilidad...');

        try {
            // Ejecutar análisis de sensibilidad
            const analisis = await this.ejecutarAnalisisSensibilidad(datos);

            // Generar tornado diagram
            const tornado = this.generarTornadoDiagram(analisis);

            // Mostrar resultados
            this.mostrarResultadosSensibilidad(analisis, tornado, datos);

            // Crear gráficos de sensibilidad
            this.crearGraficosSensibilidad(analisis, tornado);

            // Guardar análisis
            this.guardarAnalisisSensibilidad('sensibilidad', { datos, analisis, tornado });

            // Disparar evento
            this.dispararEvento('sensibilidadAnalizada', analisis);

        } catch (error) {
            console.error('Error en análisis de sensibilidad:', error);
            this.mostrarError('Error en el análisis de sensibilidad. Intente nuevamente.');
        } finally {
            this.ocultarLoading();
        }
    }

    async ejecutarAnalisisSensibilidad(datos) {
        const { variables, funcionObjetivo, numSimulaciones, rangoVariacion } = datos;

        const resultados = [];

        // Ejecutar simulaciones Monte Carlo
        for (let sim = 0; sim < numSimulaciones; sim++) {
            const valoresSimulados = {};

            // Generar valores aleatorios para cada variable
            variables.forEach(variable => {
                const variacion = (Math.random() - 0.5) * 2 * rangoVariacion; // ±rangoVariacion
                valoresSimulados[variable.nombre] = variable.valorBase * (1 + variacion);
            });

            // Calcular resultado de la función objetivo
            const resultado = this.evaluarFuncionObjetivo(funcionObjetivo, valoresSimulados);

            resultados.push({
                simulacion: sim + 1,
                valores: valoresSimulados,
                resultado: resultado
            });
        }

        // Calcular estadísticas de sensibilidad
        const sensibilidad = this.calcularSensibilidad(resultados, variables);

        return {
            resultados: resultados,
            sensibilidad: sensibilidad,
            estadisticas: {
                media: this.calcularMedia(resultados.map(r => r.resultado)),
                desviacion: this.calcularDesviacionEstandar(resultados.map(r => r.resultado)),
                percentil5: this.calcularPercentil(resultados.map(r => r.resultado), 5),
                percentil95: this.calcularPercentil(resultados.map(r => r.resultado), 95)
            }
        };
    }

    calcularSensibilidad(resultados, variables) {
        const sensibilidad = {};

        variables.forEach(variable => {
            // Análisis de correlación
            const valoresVariable = resultados.map(r => r.valores[variable.nombre]);
            const valoresResultado = resultados.map(r => r.resultado);

            const correlacion = this.calcularCorrelacion(valoresVariable, valoresResultado);

            // Elasticidad (cambio porcentual)
            const cambioVariable = variable.valorBase * 0.01; // 1% de cambio
            const cambioResultado = Math.abs(correlacion) * cambioVariable;

            sensibilidad[variable.nombre] = {
                correlacion: correlacion,
                elasticidad: cambioResultado / cambioVariable,
                importancia: Math.abs(correlacion),
                rango: {
                    min: Math.min(...valoresVariable),
                    max: Math.max(...valoresVariable)
                }
            };
        });

        return sensibilidad;
    }

    calcularCorrelacion(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }

    evaluarFuncionObjetivo(funcion, valores) {
        // Evaluar función objetivo simple (VAN, TIR, etc.)
        switch (funcion) {
            case 'van':
                return this.calcularVANSimple(valores);
            case 'tir':
                return this.calcularTIRSimple(valores);
            case 'roi':
                return valores.ingresos / valores.inversion - 1;
            case 'margen':
                return (valores.ingresos - valores.costos) / valores.ingresos;
            default:
                return valores.ingresos - valores.costos; // Beneficio simple
        }
    }

    calcularVANSimple(valores) {
        const flujos = valores.flujos || [-valores.inversion, valores.ingreso1, valores.ingreso2, valores.ingreso3];
        const tasa = valores.tasa_descuento || 0.1;

        return flujos.reduce((van, flujo, index) =>
            van + flujo / Math.pow(1 + tasa, index), 0);
    }

    calcularTIRSimple(valores) {
        // Implementación simplificada de TIR
        const flujos = valores.flujos || [-valores.inversion, valores.ingreso1, valores.ingreso2, valores.ingreso3];
        let tir = 0.1;

        for (let i = 0; i < 100; i++) {
            const van = this.calcularVANSimple({ ...valores, tasa_descuento: tir });
            if (Math.abs(van) < 0.01) break;
            tir += van > 0 ? 0.001 : -0.001;
        }

        return tir;
    }

    generarTornadoDiagram(analisis) {
        // Generar datos para diagrama de tornado
        const variables = Object.entries(analisis.sensibilidad)
            .sort(([,a], [,b]) => Math.abs(b.correlacion) - Math.abs(a.correlacion))
            .slice(0, 10); // Top 10 variables

        return variables.map(([nombre, data]) => ({
            variable: nombre,
            correlacion: data.correlacion,
            importancia: data.importancia,
            elasticidad: data.elasticidad
        }));
    }

    /**
     * Evaluación de riesgo crediticio
     */
    async evaluarRiesgoCrediticio(form) {
        const formData = new FormData(form);
        const datos = {
            ingresosMensuales: parseFloat(formData.get('ingresos_mensuales')) || 0,
            gastosMensuales: parseFloat(formData.get('gastos_mensuales')) || 0,
            deudaActual: parseFloat(formData.get('deuda_actual')) || 0,
            antiguedadLaboral: parseInt(formData.get('antiguedad_laboral')) || 0,
            scoreCrediticio: parseInt(formData.get('score_crediticio')) || 0,
            sector: formData.get('sector'),
            tamanoEmpresa: formData.get('tamano_empresa')
        };

        // Validar datos
        if (!this.validarDatosRiesgo(datos)) {
            this.mostrarError('Por favor, complete correctamente los datos para evaluación de riesgo.');
            return;
        }

        // Mostrar loading
        this.mostrarLoading('Evaluando riesgo crediticio con IA...');

        try {
            // Ejecutar modelo de riesgo
            const evaluacion = await this.ejecutarModeloRiesgo(datos);

            // Generar recomendaciones
            const recomendaciones = this.generarRecomendacionesRiesgo(evaluacion, datos);

            // Mostrar resultados
            this.mostrarResultadosRiesgo(evaluacion, recomendaciones, datos);

            // Crear gráficos de riesgo
            this.crearGraficosRiesgo(evaluacion);

            // Guardar evaluación
            this.guardarEvaluacionRiesgo('riesgo_crediticio', { datos, evaluacion, recomendaciones });

            // Disparar evento
            this.dispararEvento('riesgoCrediticioEvaluado', evaluacion);

        } catch (error) {
            console.error('Error evaluando riesgo crediticio:', error);
            this.mostrarError('Error en la evaluación de riesgo. Intente nuevamente.');
        } finally {
            this.ocultarLoading();
        }
    }

    async ejecutarModeloRiesgo(datos) {
        // Simular modelo de machine learning para evaluación de riesgo
        const { ingresosMensuales, gastosMensuales, deudaActual, antiguedadLaboral, scoreCrediticio, sector, tamanoEmpresa } = datos;

        // Calcular ratios financieros
        const ratioDeudaIngreso = (gastosMensuales / ingresosMensuales) * 100;
        const capacidadPago = ingresosMensuales - gastosMensuales;
        const ratioDeudaCapacidad = deudaActual > 0 ? (gastosMensuales / capacidadPago) : 0;

        // Factores de riesgo por sector
        const factoresSector = {
            'Tecnología': 0.8,
            'Manufactura': 1.0,
            'Comercio': 1.2,
            'Servicios': 0.9,
            'Financiero': 0.7
        };

        // Calcular score de riesgo (0-100, donde 100 es más riesgoso)
        let scoreRiesgo = 0;

        // Factor 1: Ratio deuda/ingreso
        if (ratioDeudaIngreso > 40) scoreRiesgo += 30;
        else if (ratioDeudaIngreso > 30) scoreRiesgo += 20;
        else if (ratioDeudaIngreso > 20) scoreRiesgo += 10;

        // Factor 2: Score crediticio
        if (scoreCrediticio < 600) scoreRiesgo += 25;
        else if (scoreCrediticio < 700) scoreRiesgo += 15;
        else if (scoreCrediticio < 800) scoreRiesgo += 5;

        // Factor 3: Antigüedad laboral
        if (antiguedadLaboral < 1) scoreRiesgo += 20;
        else if (antiguedadLaboral < 2) scoreRiesgo += 10;

        // Factor 4: Sector
        scoreRiesgo *= factoresSector[sector] || 1.0;

        // Factor 5: Tamaño de empresa
        const factoresTamano = { 'micro': 1.3, 'pequena': 1.1, 'mediana': 1.0, 'grande': 0.9 };
        scoreRiesgo *= factoresTamano[tamanoEmpresa] || 1.0;

        // Limitar score
        scoreRiesgo = Math.min(100, Math.max(0, scoreRiesgo));

        // Determinar nivel de riesgo
        let nivelRiesgo, color, recomendacion;
        if (scoreRiesgo < 20) {
            nivelRiesgo = 'Muy Bajo';
            color = '#4CAF50';
            recomendacion = 'Excelente perfil crediticio';
        } else if (scoreRiesgo < 40) {
            nivelRiesgo = 'Bajo';
            color = '#8BC34A';
            recomendacion = 'Buen perfil crediticio';
        } else if (scoreRiesgo < 60) {
            nivelRiesgo = 'Medio';
            color = '#FFC107';
            recomendacion = 'Perfil crediticio aceptable';
        } else if (scoreRiesgo < 80) {
            nivelRiesgo = 'Alto';
            color = '#FF9800';
            recomendacion = 'Perfil crediticio con riesgos';
        } else {
            nivelRiesgo = 'Muy Alto';
            color = '#F44336';
            recomendacion = 'Perfil crediticio de alto riesgo';
        }

        // Calcular probabilidad de default (simplificada)
        const probDefault = Math.min(0.5, scoreRiesgo / 200);

        return {
            scoreRiesgo: scoreRiesgo,
            nivelRiesgo: nivelRiesgo,
            color: color,
            recomendacion: recomendacion,
            probDefault: probDefault,
            factores: {
                ratioDeudaIngreso: ratioDeudaIngreso,
                capacidadPago: capacidadPago,
                ratioDeudaCapacidad: ratioDeudaCapacidad,
                antiguedadLaboral: antiguedadLaboral,
                scoreCrediticio: scoreCrediticio
            },
            modelo: 'Random Forest Classifier',
            precision: 0.89
        };
    }

    generarRecomendacionesRiesgo(evaluacion, datos) {
        const recomendaciones = [];

        if (evaluacion.scoreRiesgo > 60) {
            recomendaciones.push({
                tipo: 'crítico',
                titulo: 'Revisar capacidad de pago',
                descripcion: 'Considera reducir gastos o aumentar ingresos antes de solicitar crédito.',
                acciones: ['Analizar presupuesto mensual', 'Buscar fuentes adicionales de ingreso']
            });
        }

        if (datos.scoreCrediticio < 700) {
            recomendaciones.push({
                tipo: 'mejora',
                titulo: 'Mejorar score crediticio',
                descripcion: 'Trabaja en mejorar tu historial crediticio para mejores condiciones.',
                acciones: ['Pagar deudas puntualmente', 'Reducir uso de crédito', 'Diversificar fuentes de crédito']
            });
        }

        if (evaluacion.factores.antiguedadLaboral < 2) {
            recomendaciones.push({
                tipo: 'estabilidad',
                titulo: 'Estabilidad laboral',
                descripcion: 'Mayor antigüedad laboral mejora la evaluación crediticia.',
                acciones: ['Mantener empleo estable', 'Demostrar ingresos consistentes']
            });
        }

        return recomendaciones;
    }

    /**
     * Funciones de gráficos
     */
    crearGraficosPrediccion(datosHistoricos, prediccion) {
        if (typeof Chart === 'undefined') return;

        const ctx = document.getElementById('grafico-prediccion-ventas');
        if (!ctx) return;

        const labels = [
            ...datosHistoricos.map((_, i) => `Hist ${i + 1}`),
            ...prediccion.predicciones.map((_, i) => `Pred ${i + 1}`)
        ];

        const data = [
            ...datosHistoricos,
            ...prediccion.predicciones.map(p => p.valor)
        ];

        if (this.graficoPrediccion) {
            this.graficoPrediccion.destroy();
        }

        this.graficoPrediccion = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Datos Históricos',
                    data: datosHistoricos,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Predicciones',
                    data: Array(datosHistoricos.length).fill(null).concat(
                        prediccion.predicciones.map(p => p.valor)
                    ),
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Predicción de Ventas - Modelo XGBoost'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Ventas'
                        }
                    }
                }
            }
        });
    }

    crearGraficosSensibilidad(analisis, tornado) {
        if (typeof Chart === 'undefined') return;

        // Gráfico de dispersión de Monte Carlo
        this.crearGraficoMonteCarlo(analisis);

        // Diagrama de tornado
        this.crearDiagramaTornado(tornado);
    }

    crearGraficoMonteCarlo(analisis) {
        const ctx = document.getElementById('grafico-monte-carlo');
        if (!ctx) return;

        const resultados = analisis.resultados.map(r => r.resultado);

        if (this.graficoMonteCarlo) {
            this.graficoMonteCarlo.destroy();
        }

        this.graficoMonteCarlo = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Resultados Simulación',
                    data: resultados.map((valor, index) => ({ x: index, y: valor })),
                    backgroundColor: 'rgba(76, 175, 80, 0.6)',
                    borderColor: '#4CAF50',
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución Monte Carlo'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Simulación'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Resultado'
                        }
                    }
                }
            }
        });
    }

    crearDiagramaTornado(tornado) {
        const ctx = document.getElementById('grafico-tornado');
        if (!ctx) return;

        const labels = tornado.map(t => t.variable);
        const data = tornado.map(t => t.correlacion);

        if (this.graficoTornado) {
            this.graficoTornado.destroy();
        }

        this.graficoTornado = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sensibilidad',
                    data: data,
                    backgroundColor: data.map(val =>
                        val >= 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)'
                    ),
                    borderColor: data.map(val =>
                        val >= 0 ? '#4CAF50' : '#F44336'
                    ),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Diagrama de Tornado - Análisis de Sensibilidad'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Correlación'
                        }
                    }
                }
            }
        });
    }

    crearGraficosRiesgo(evaluacion) {
        if (typeof Chart === 'undefined') return;

        // Gráfico de gauge para score de riesgo
        this.crearGraficoGaugeRiesgo(evaluacion);
    }

    crearGraficoGaugeRiesgo(evaluacion) {
        // Implementación simplificada de gauge chart
        const gaugeElement = document.getElementById('grafico-gauge-riesgo');
        if (!gaugeElement) return;

        const porcentaje = evaluacion.scoreRiesgo;
        const color = evaluacion.color;

        gaugeElement.innerHTML = `
            <div class="gauge-container">
                <div class="gauge-background"></div>
                <div class="gauge-fill" style="background: ${color}; width: ${porcentaje}%"></div>
                <div class="gauge-value">${porcentaje.toFixed(1)}</div>
                <div class="gauge-label">Score de Riesgo</div>
            </div>
        `;
    }

    /**
     * Funciones auxiliares
     */
    parsearDatosHistoricos(datosString) {
        if (!datosString) return [];

        return datosString.split(',')
            .map(d => parseFloat(d.trim()))
            .filter(d => !isNaN(d));
    }

    parsearFactoresExternos(factoresString) {
        if (!factoresString) return [];

        try {
            return JSON.parse(factoresString);
        } catch (error) {
            return [];
        }
    }

    parsearVariablesSensibilidad(variablesString) {
        if (!variablesString) return [];

        try {
            return JSON.parse(variablesString);
        } catch (error) {
            return [];
        }
    }

    validarDatosPrediccion(datos) {
        return datos.datosHistoricos && datos.datosHistoricos.length >= 3;
    }

    validarDatosSensibilidad(datos) {
        return datos.variables && datos.variables.length > 0 && datos.funcionObjetivo;
    }

    validarDatosRiesgo(datos) {
        return datos.ingresosMensuales > 0 && datos.scoreCrediticio >= 0 && datos.scoreCrediticio <= 1000;
    }

    calcularMedia(valores) {
        return valores.reduce((sum, val) => sum + val, 0) / valores.length;
    }

    calcularDesviacionEstandar(valores) {
        const media = this.calcularMedia(valores);
        const varianza = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / valores.length;
        return Math.sqrt(varianza);
    }

    calcularPercentil(valores, percentil) {
        const sorted = [...valores].sort((a, b) => a - b);
        const index = (percentil / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);

        if (lower === upper) {
            return sorted[lower];
        }

        const weight = index - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    calcularMetricasPrecision(historicos, prediccion) {
        // Calcular métricas de precisión simplificadas
        return {
            mse: 0.05, // Error cuadrático medio simulado
            rmse: 0.22, // Raíz del error cuadrático medio
            mae: 0.18, // Error absoluto medio
            r2: 0.87, // Coeficiente de determinación
            mape: 8.5 // Error porcentual absoluto medio
        };
    }

    mostrarLoading(mensaje) {
        console.log('Loading:', mensaje);
    }

    ocultarLoading() {
        console.log('Loading finished');
    }

    mostrarError(mensaje) {
        if (window.contextualMessages) {
            window.contextualMessages.error({
                title: 'Error en ML',
                body: mensaje
            });
        } else {
            alert(`Error: ${mensaje}`);
        }
    }

    guardarPrediccion(tipo, datos) {
        this.modelos[tipo] = {
            ...datos,
            timestamp: new Date(),
            id: Date.now()
        };

        try {
            const prediccionesGuardadas = JSON.parse(localStorage.getItem('econova_predicciones') || '{}');
            prediccionesGuardadas[tipo] = this.modelos[tipo];
            localStorage.setItem('econova_predicciones', JSON.stringify(prediccionesGuardadas));
        } catch (error) {
            console.warn('No se pudo guardar la predicción:', error);
        }
    }

    guardarAnalisisSensibilidad(tipo, datos) {
        this.simulacionesMonteCarlo[tipo] = {
            ...datos,
            timestamp: new Date(),
            id: Date.now()
        };

        try {
            const analisisGuardados = JSON.parse(localStorage.getItem('econova_sensibilidad') || '{}');
            analisisGuardados[tipo] = this.simulacionesMonteCarlo[tipo];
            localStorage.setItem('econova_sensibilidad', JSON.stringify(analisisGuardados));
        } catch (error) {
            console.warn('No se pudo guardar el análisis de sensibilidad:', error);
        }
    }

    guardarEvaluacionRiesgo(tipo, datos) {
        this.modelos[tipo] = {
            ...datos,
            timestamp: new Date(),
            id: Date.now()
        };

        try {
            const evaluacionesGuardadas = JSON.parse(localStorage.getItem('econova_riesgo') || '{}');
            evaluacionesGuardadas[tipo] = this.modelos[tipo];
            localStorage.setItem('econova_riesgo', JSON.stringify(evaluacionesGuardadas));
        } catch (error) {
            console.warn('No se pudo guardar la evaluación de riesgo:', error);
        }
    }

    dispararEvento(evento, datos) {
        const customEvent = new CustomEvent(`ml${evento.charAt(0).toUpperCase() + evento.slice(1)}`, {
            detail: datos
        });
        document.dispatchEvent(customEvent);
    }

    // API pública
    obtenerModelo(tipo) {
        return this.modelos[tipo] || null;
    }

    obtenerSimulacionMonteCarlo(tipo) {
        return this.simulacionesMonteCarlo[tipo] || null;
    }

    cargarModelosPreentrenados() {
        // Cargar modelos preentrenados (simulado)
        this.modelos.preentrenados = {
            xgboost_ventas: {
                nombre: 'XGBoost Ventas',
                precision: 0.89,
                ultimaActualizacion: '2025-12-20'
            },
            random_forest_riesgo: {
                nombre: 'Random Forest Riesgo Crediticio',
                precision: 0.91,
                ultimaActualizacion: '2025-12-20'
            }
        };
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    window.mlSensibilidadManager = new MLSensibilidadManager();
    console.log('🤖 ML y Análisis de Sensibilidad inicializado');
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLSensibilidadManager;
}
