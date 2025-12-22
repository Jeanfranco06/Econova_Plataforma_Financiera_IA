/**
 * Módulo de Benchmarking - Econova
 * Comparación anónima y agregación de datos
 */

class BenchmarkingManager {
    constructor() {
        this.datosBenchmarking = {};
        this.estadisticasSectoriales = {};
        this.percentilesPrecomputados = {};
        this.init();
    }

    init() {
        console.log('🔍 Módulo de Benchmarking inicializado');
        this.setupEventListeners();
        this.cargarDatosPrecomputados();
    }

    setupEventListeners() {
        // Escuchar eventos de formularios de benchmarking
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'form-benchmarking-sectorial') {
                e.preventDefault();
                this.generarBenchmarkingSectorial(e.target);
            }
            if (e.target.id === 'form-comparacion-personalizada') {
                e.preventDefault();
                this.generarComparacionPersonalizada(e.target);
            }
        });

        // Escuchar eventos de actualización de datos
        document.addEventListener('datosActualizados', (event) => {
            this.actualizarDatosBenchmarking(event.detail);
        });
    }

    /**
     * Generar benchmarking sectorial
     */
    async generarBenchmarkingSectorial(form) {
        const formData = new FormData(form);
        const datos = {
            sector: formData.get('sector'),
            tamanoEmpresa: formData.get('tamano_empresa'),
            metricas: this.parsearMetricas(formData.get('metricas')),
            periodo: formData.get('periodo') || 'ultimo_anio'
        };

        // Validar datos
        if (!this.validarDatosBenchmarking(datos)) {
            this.mostrarError('Por favor, complete correctamente los datos.');
            return;
        }

        // Mostrar loading
        this.mostrarLoading('Generando análisis sectorial...');

        try {
            // Obtener datos agregados del sector
            const datosSectoriales = await this.obtenerDatosSectoriales(datos.sector, datos.periodo);

            // Calcular percentiles y estadísticas
            const analisis = this.calcularAnalisisSectorial(datos.metricas, datosSectoriales, datos.tamanoEmpresa);

            // Generar recomendaciones
            const recomendaciones = this.generarRecomendacionesBenchmarking(analisis, datos);

            // Mostrar resultados
            this.mostrarResultadosBenchmarking(analisis, recomendaciones, datos);

            // Crear gráficos comparativos
            this.crearGraficosBenchmarking(analisis, datos);

            // Guardar análisis
            this.guardarAnalisisBenchmarking('sectorial', { datos, analisis, recomendaciones });

            // Disparar evento
            this.dispararEvento('benchmarkingSectorialGenerado', analisis);

        } catch (error) {
            console.error('Error generando benchmarking sectorial:', error);
            this.mostrarError('Error al generar el análisis sectorial. Intente nuevamente.');
        } finally {
            this.ocultarLoading();
        }
    }

    /**
     * Generar comparación personalizada
     */
    async generarComparacionPersonalizada(form) {
        const formData = new FormData(form);
        const datos = {
            empresaBase: {
                nombre: formData.get('empresa_base_nombre'),
                metricas: this.parsearMetricas(formData.get('empresa_base_metricas'))
            },
            empresasComparacion: this.parsearEmpresasComparacion(formData.get('empresas_comparacion')),
            criteriosComparacion: formData.getAll('criterios_comparacion[]')
        };

        // Validar datos
        if (!this.validarDatosComparacionPersonalizada(datos)) {
            this.mostrarError('Por favor, complete correctamente los datos de comparación.');
            return;
        }

        // Mostrar loading
        this.mostrarLoading('Generando comparación personalizada...');

        try {
            // Realizar comparación
            const comparacion = await this.realizarComparacionPersonalizada(datos);

            // Generar insights
            const insights = this.generarInsightsComparacion(comparacion);

            // Mostrar resultados
            this.mostrarResultadosComparacion(comparacion, insights, datos);

            // Crear gráficos de comparación
            this.crearGraficosComparacion(comparacion);

            // Guardar comparación
            this.guardarAnalisisBenchmarking('personalizada', { datos, comparacion, insights });

            // Disparar evento
            this.dispararEvento('comparacionPersonalizadaGenerada', comparacion);

        } catch (error) {
            console.error('Error generando comparación personalizada:', error);
            this.mostrarError('Error al generar la comparación. Intente nuevamente.');
        } finally {
            this.ocultarLoading();
        }
    }

    /**
     * Obtener datos sectoriales agregados (simulado)
     */
    async obtenerDatosSectoriales(sector, periodo) {
        // En producción, esto vendría de una base de datos agregada
        // Para demo, generamos datos simulados pero realistas

        const datosBase = {
            'Tecnología': {
                empresas: 150,
                ingresos_promedio: 2500000,
                margen_beneficio: 0.15,
                roi_promedio: 0.22,
                empleados_promedio: 45,
                crecimiento_anual: 0.18
            },
            'Manufactura': {
                empresas: 200,
                ingresos_promedio: 1800000,
                margen_beneficio: 0.12,
                roi_promedio: 0.15,
                empleados_promedio: 120,
                crecimiento_anual: 0.08
            },
            'Comercio': {
                empresas: 300,
                ingresos_promedio: 950000,
                margen_beneficio: 0.08,
                roi_promedio: 0.12,
                empleados_promedio: 15,
                crecimiento_anual: 0.05
            },
            'Servicios Financieros': {
                empresas: 80,
                ingresos_promedio: 3200000,
                margen_beneficio: 0.25,
                roi_promedio: 0.28,
                empleados_promedio: 35,
                crecimiento_anual: 0.12
            }
        };

        const datosSector = datosBase[sector] || datosBase['Tecnología'];

        // Generar distribución de datos para percentiles
        return this.generarDistribucionDatos(datosSector, 100);
    }

    generarDistribucionDatos(datosBase, nEmpresas) {
        const datos = [];

        for (let i = 0; i < nEmpresas; i++) {
            // Generar variación alrededor de la media
            const variacion = (Math.random() - 0.5) * 0.4; // ±20%

            datos.push({
                ingresos: datosBase.ingresos_promedio * (1 + variacion),
                margen_beneficio: Math.max(0.01, datosBase.margen_beneficio * (1 + variacion * 0.5)),
                roi: Math.max(0.01, datosBase.roi_promedio * (1 + variacion * 0.3)),
                empleados: Math.max(1, Math.round(datosBase.empleados_promedio * (1 + variacion))),
                crecimiento: Math.max(-0.1, datosBase.crecimiento_anual * (1 + variacion * 0.8))
            });
        }

        return datos;
    }

    /**
     * Calcular análisis sectorial
     */
    calcularAnalisisSectorial(metricasEmpresa, datosSectoriales, tamanoEmpresa) {
        const analisis = {};

        // Filtrar por tamaño de empresa si es relevante
        let datosFiltrados = datosSectoriales;
        if (tamanoEmpresa !== 'todos') {
            datosFiltrados = this.filtrarPorTamanoEmpresa(datosSectoriales, tamanoEmpresa);
        }

        // Calcular estadísticas para cada métrica
        Object.entries(metricasEmpresa).forEach(([metrica, valor]) => {
            if (datosFiltrados.length > 0) {
                const valoresSector = datosFiltrados.map(d => d[metrica]).filter(v => v !== undefined);

                if (valoresSector.length > 0) {
                    analisis[metrica] = {
                        valor_empresa: valor,
                        promedio_sector: this.calcularPromedio(valoresSector),
                        mediana_sector: this.calcularMediana(valoresSector),
                        percentil_25: this.calcularPercentil(valoresSector, 25),
                        percentil_75: this.calcularPercentil(valoresSector, 75),
                        percentil_90: this.calcularPercentil(valoresSector, 90),
                        minimo: Math.min(...valoresSector),
                        maximo: Math.max(...valoresSector),
                        desviacion_estandar: this.calcularDesviacionEstandar(valoresSector),
                        posicion_relativa: this.calcularPosicionRelativa(valor, valoresSector)
                    };
                }
            }
        });

        return analisis;
    }

    filtrarPorTamanoEmpresa(datos, tamano) {
        // Lógica simplificada de filtrado por tamaño
        const rangos = {
            'micro': d => d.empleados <= 10,
            'pequena': d => d.empleados > 10 && d.empleados <= 50,
            'mediana': d => d.empleados > 50 && d.empleados <= 200,
            'grande': d => d.empleados > 200
        };

        const filtro = rangos[tamano];
        return filtro ? datos.filter(filtro) : datos;
    }

    calcularPromedio(valores) {
        return valores.reduce((sum, val) => sum + val, 0) / valores.length;
    }

    calcularMediana(valores) {
        const sorted = [...valores].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
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

    calcularDesviacionEstandar(valores) {
        const media = this.calcularPromedio(valores);
        const varianza = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / valores.length;
        return Math.sqrt(varianza);
    }

    calcularPosicionRelativa(valor, valores) {
        const sorted = [...valores].sort((a, b) => a - b);
        let posicion = 0;

        for (let i = 0; i < sorted.length; i++) {
            if (valor <= sorted[i]) {
                posicion = i;
                break;
            }
        }

        return {
            percentil: (posicion / sorted.length) * 100,
            ranking: `${posicion + 1} de ${sorted.length}`,
            cuartil: this.obtenerCuartil(posicion, sorted.length)
        };
    }

    obtenerCuartil(posicion, total) {
        const porcentaje = (posicion / total) * 100;
        if (porcentaje <= 25) return 'Q1 (Inferior)';
        if (porcentaje <= 50) return 'Q2 (Medio inferior)';
        if (porcentaje <= 75) return 'Q3 (Medio superior)';
        return 'Q4 (Superior)';
    }

    /**
     * Generar recomendaciones de benchmarking
     */
    generarRecomendacionesBenchmarking(analisis, datos) {
        const recomendaciones = [];

        Object.entries(analisis).forEach(([metrica, stats]) => {
            const { valor_empresa, promedio_sector, percentil_25, percentil_75, posicion_relativa } = stats;

            if (valor_empresa < percentil_25) {
                recomendaciones.push({
                    tipo: 'oportunidad_mejora',
                    metrica: metrica,
                    mensaje: `Tu ${this.nombreMetrica(metrica)} está por debajo del 25% inferior del sector. Considera estrategias para mejorar esta métrica.`,
                    acciones: this.obtenerAccionesMejora(metrica, 'bajo')
                });
            } else if (valor_empresa > percentil_75) {
                recomendaciones.push({
                    tipo: 'ventaja_competitiva',
                    metrica: metrica,
                    mensaje: `¡Excelente! Tu ${this.nombreMetrica(metrica)} está en el 25% superior del sector.`,
                    acciones: ['Mantener las buenas prácticas', 'Compartir conocimientos con el sector']
                });
            }

            // Recomendaciones específicas por percentil
            if (posicion_relativa.percentil < 50) {
                recomendaciones.push({
                    tipo: 'benchmarking',
                    metrica: metrica,
                    mensaje: `Benchmarking: Estudia las mejores prácticas de empresas en el percentil superior para ${this.nombreMetrica(metrica)}.`,
                    acciones: ['Analizar casos de éxito', 'Implementar mejores prácticas']
                });
            }
        });

        return recomendaciones;
    }

    nombreMetrica(metrica) {
        const nombres = {
            'ingresos': 'ingresos',
            'margen_beneficio': 'margen de beneficio',
            'roi': 'retorno sobre inversión',
            'empleados': 'número de empleados',
            'crecimiento': 'tasa de crecimiento'
        };
        return nombres[metrica] || metrica;
    }

    obtenerAccionesMejora(metrica, nivel) {
        const accionesPorMetrica = {
            'ingresos': [
                'Diversificar fuentes de ingresos',
                'Implementar estrategias de marketing digital',
                'Optimizar precios y productos',
                'Expandir mercados geográficos'
            ],
            'margen_beneficio': [
                'Optimizar costos operativos',
                'Negociar mejores condiciones con proveedores',
                'Implementar control de inventarios',
                'Revisar estructura de precios'
            ],
            'roi': [
                'Evaluar proyectos de inversión actuales',
                'Implementar análisis de sensibilidad',
                'Diversificar portafolio de inversiones',
                'Optimizar asignación de capital'
            ]
        };

        return accionesPorMetrica[metrica] || ['Revisar procesos operativos', 'Implementar mejores prácticas'];
    }

    /**
     * Realizar comparación personalizada
     */
    async realizarComparacionPersonalizada(datos) {
        const { empresaBase, empresasComparacion, criteriosComparacion } = datos;

        // Simular obtención de datos de empresas de comparación
        const datosComparacion = await this.obtenerDatosEmpresasComparacion(empresasComparacion);

        const comparacion = {
            empresa_base: empresaBase,
            empresas_comparacion: datosComparacion,
            criterios: criteriosComparacion,
            resultados: {}
        };

        // Calcular comparación para cada criterio
        criteriosComparacion.forEach(criterio => {
            comparacion.resultados[criterio] = this.compararCriterio(
                empresaBase.metricas[criterio],
                datosComparacion.map(emp => emp.metricas[criterio])
            );
        });

        return comparacion;
    }

    async obtenerDatosEmpresasComparacion(empresas) {
        // Simular datos de empresas de comparación
        return empresas.map((empresa, index) => ({
            nombre: empresa.nombre,
            metricas: {
                ingresos: empresa.metricas.ingresos * (0.8 + Math.random() * 0.4), // ±20%
                margen_beneficio: empresa.metricas.margen_beneficio * (0.9 + Math.random() * 0.2),
                roi: empresa.metricas.roi * (0.85 + Math.random() * 0.3),
                empleados: Math.round(empresa.metricas.empleados * (0.9 + Math.random() * 0.2))
            }
        }));
    }

    compararCriterio(valorBase, valoresComparacion) {
        const promedioComparacion = this.calcularPromedio(valoresComparacion);
        const mejorComparacion = Math.max(...valoresComparacion);
        const peorComparacion = Math.min(...valoresComparacion);

        return {
            valor_base: valorBase,
            promedio_comparacion: promedioComparacion,
            mejor_comparacion: mejorComparacion,
            peor_comparacion: peorComparacion,
            diferencia_promedio: ((valorBase - promedioComparacion) / promedioComparacion) * 100,
            posicion: this.determinarPosicion(valorBase, valoresComparacion)
        };
    }

    determinarPosicion(valor, valores) {
        const sorted = [...valores, valor].sort((a, b) => b - a); // Orden descendente
        const posicion = sorted.indexOf(valor) + 1;
        const total = sorted.length;

        if (posicion === 1) return 'Mejor';
        if (posicion <= total * 0.33) return 'Superior';
        if (posicion <= total * 0.67) return 'Promedio';
        return 'Por debajo del promedio';
    }

    /**
     * Funciones de UI
     */
    mostrarResultadosBenchmarking(analisis, recomendaciones, datos) {
        const resultadoDiv = document.getElementById('resultado-benchmarking');
        if (!resultadoDiv) return;

        let html = `
            <div class="resultado-card">
                <h3>Análisis de Benchmarking Sectorial</h3>
                <div class="benchmarking-info">
                    <p><strong>Sector:</strong> ${datos.sector}</p>
                    <p><strong>Tamaño de empresa:</strong> ${datos.tamanoEmpresa}</p>
                    <p><strong>Período:</strong> ${datos.periodo.replace('_', ' ')}</p>
                </div>

                <div class="metricas-benchmarking">
        `;

        Object.entries(analisis).forEach(([metrica, stats]) => {
            const nombreMetrica = this.nombreMetrica(metrica);
            const posicion = stats.posicion_relativa;

            html += `
                <div class="metrica-benchmarking">
                    <h4>${nombreMetrica.charAt(0).toUpperCase() + nombreMetrica.slice(1)}</h4>
                    <div class="metrica-valores">
                        <div class="valor-principal">
                            <span class="label">Tu valor:</span>
                            <span class="valor">${this.formatearValor(metrica, stats.valor_empresa)}</span>
                        </div>
                        <div class="valor-comparacion">
                            <span class="label">Promedio sector:</span>
                            <span class="valor">${this.formatearValor(metrica, stats.promedio_sector)}</span>
                        </div>
                        <div class="valor-percentil">
                            <span class="label">Percentil 75:</span>
                            <span class="valor">${this.formatearValor(metrica, stats.percentil_75)}</span>
                        </div>
                    </div>
                    <div class="posicion-relativa">
                        <span class="posicion-label">Tu posición:</span>
                        <span class="posicion-valor ${this.clasePosicion(posicion.percentil)}">
                            ${posicion.percentil.toFixed(1)}% percentil (${posicion.cuartil})
                        </span>
                    </div>
                </div>
            `;
        });

        if (recomendaciones.length > 0) {
            html += `
                <div class="recomendaciones-benchmarking">
                    <h4>Recomendaciones</h4>
                    <ul>
                        ${recomendaciones.map(rec => `<li class="${rec.tipo}">${rec.mensaje}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        resultadoDiv.innerHTML = html;
        resultadoDiv.style.display = 'block';
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    }

    mostrarResultadosComparacion(comparacion, insights, datos) {
        const resultadoDiv = document.getElementById('resultado-comparacion');
        if (!resultadoDiv) return;

        let html = `
            <div class="resultado-card">
                <h3>Comparación Personalizada</h3>
                <div class="comparacion-empresas">
                    <div class="empresa-base">
                        <h4>Empresa Base: ${datos.empresaBase.nombre}</h4>
                    </div>
                    <div class="empresas-comparacion">
                        <h4>Empresas de Comparación:</h4>
                        <ul>
                            ${comparacion.empresas_comparacion.map(emp => `<li>${emp.nombre}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="resultados-comparacion">
        `;

        Object.entries(comparacion.resultados).forEach(([criterio, resultado]) => {
            const nombreCriterio = this.nombreMetrica(criterio);

            html += `
                <div class="criterio-comparacion">
                    <h4>${nombreCriterio.charAt(0).toUpperCase() + nombreCriterio.slice(1)}</h4>
                    <div class="comparacion-valores">
                        <div class="valor-base">
                            <span>Tu empresa:</span>
                            <span class="valor">${this.formatearValor(criterio, resultado.valor_base)}</span>
                        </div>
                        <div class="valor-promedio">
                            <span>Promedio comparación:</span>
                            <span class="valor">${this.formatearValor(criterio, resultado.promedio_comparacion)}</span>
                        </div>
                        <div class="valor-posicion">
                            <span>Tu posición:</span>
                            <span class="posicion ${resultado.posicion.toLowerCase().replace(' ', '-')}">${resultado.posicion}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        if (insights.length > 0) {
            html += `
                <div class="insights-comparacion">
                    <h4>Insights y Conclusiones</h4>
                    <ul>
                        ${insights.map(insight => `<li>${insight}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        resultadoDiv.innerHTML = html;
        resultadoDiv.style.display = 'block';
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    }

    clasePosicion(percentil) {
        if (percentil >= 75) return 'excelente';
        if (percentil >= 50) return 'bueno';
        if (percentil >= 25) return 'regular';
        return 'necesita-mejora';
    }

    formatearValor(metrica, valor) {
        if (metrica.includes('margen') || metrica.includes('roi') || metrica.includes('crecimiento')) {
            return (valor * 100).toFixed(2) + '%';
        }
        if (metrica === 'ingresos') {
            return 'S/ ' + valor.toLocaleString('es-PE');
        }
        if (metrica === 'empleados') {
            return Math.round(valor).toString();
        }
        return valor.toFixed(2);
    }

    /**
     * Funciones de gráficos
     */
    crearGraficosBenchmarking(analisis, datos) {
        if (typeof Chart === 'undefined') return;

        // Gráfico de percentiles
        this.crearGraficoPercentiles(analisis, datos);
    }

    crearGraficoPercentiles(analisis, datos) {
        const ctx = document.getElementById('grafico-benchmarking-percentiles');
        if (!ctx) return;

        const metricas = Object.keys(analisis);
        const datasets = [];

        // Dataset para la empresa
        datasets.push({
            label: 'Tu Empresa',
            data: metricas.map(metrica => analisis[metrica].valor_empresa),
            backgroundColor: '#00ffff',
            borderColor: '#00ffff',
            borderWidth: 2
        });

        // Dataset para percentiles del sector
        datasets.push({
            label: 'Percentil 75 (Sector)',
            data: metricas.map(metrica => analisis[metrica].percentil_75),
            backgroundColor: 'rgba(76, 205, 196, 0.5)',
            borderColor: '#4ecdc4',
            borderWidth: 2,
            type: 'line'
        });

        datasets.push({
            label: 'Promedio Sector',
            data: metricas.map(metrica => analisis[metrica].promedio_sector),
            backgroundColor: 'rgba(255, 107, 107, 0.5)',
            borderColor: '#ff6b6b',
            borderWidth: 2,
            type: 'line'
        });

        if (this.graficoPercentiles) {
            this.graficoPercentiles.destroy();
        }

        this.graficoPercentiles = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: metricas.map(m => this.nombreMetrica(m)),
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Benchmarking Sectorial - ${datos.sector}`
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Valor'
                        }
                    }
                }
            }
        });
    }

    crearGraficosComparacion(comparacion) {
        if (typeof Chart === 'undefined') return;

        // Gráfico de radar para comparación múltiple
        this.crearGraficoRadarComparacion(comparacion);
    }

    crearGraficoRadarComparacion(comparacion) {
        const ctx = document.getElementById('grafico-comparacion-radar');
        if (!ctx) return;

        const criterios = Object.keys(comparacion.resultados);
        const datasets = [];

        // Dataset para empresa base
        datasets.push({
            label: comparacion.empresa_base.nombre,
            data: criterios.map(criterio => comparacion.resultados[criterio].valor_base),
            backgroundColor: 'rgba(0, 255, 255, 0.2)',
            borderColor: '#00ffff',
            borderWidth: 2,
            pointBackgroundColor: '#00ffff'
        });

        // Dataset para promedio de comparación
        datasets.push({
            label: 'Promedio Comparación',
            data: criterios.map(criterio => comparacion.resultados[criterio].promedio_comparacion),
            backgroundColor: 'rgba(255, 107, 107, 0.2)',
            borderColor: '#ff6b6b',
            borderWidth: 2,
            pointBackgroundColor: '#ff6b6b'
        });

        if (this.graficoRadarComparacion) {
            this.graficoRadarComparacion.destroy();
        }

        this.graficoRadarComparacion = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: criterios.map(c => this.nombreMetrica(c)),
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparación Personalizada - Análisis Radar'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Funciones auxiliares
     */
    parsearMetricas(metricasString) {
        if (!metricasString) return {};

        try {
            return JSON.parse(metricasString);
        } catch (error) {
            // Si no es JSON válido, intentar parsear formato simple
            const metricas = {};
            const pairs = metricasString.split(',');

            pairs.forEach(pair => {
                const [key, value] = pair.split(':');
                if (key && value) {
                    metricas[key.trim()] = parseFloat(value.trim());
                }
            });

            return metricas;
        }
    }

    parsearEmpresasComparacion(empresasString) {
        if (!empresasString) return [];

        try {
            return JSON.parse(empresasString);
        } catch (error) {
            return [];
        }
    }

    validarDatosBenchmarking(datos) {
        return datos.sector && datos.metricas && Object.keys(datos.metricas).length > 0;
    }

    validarDatosComparacionPersonalizada(datos) {
        return datos.empresaBase.nombre &&
               datos.empresaBase.metricas &&
               datos.empresasComparacion.length > 0;
    }

    mostrarLoading(mensaje) {
        // Implementar indicador de carga
        console.log('Loading:', mensaje);
    }

    ocultarLoading() {
        // Ocultar indicador de carga
        console.log('Loading finished');
    }

    mostrarError(mensaje) {
        // Usar sistema de mensajes contextuales si está disponible
        if (window.contextualMessages) {
            window.contextualMessages.error({
                title: 'Error en benchmarking',
                body: mensaje
            });
        } else {
            alert(`Error: ${mensaje}`);
        }
    }

    guardarAnalisisBenchmarking(tipo, datos) {
        this.datosBenchmarking[tipo] = {
            ...datos,
            timestamp: new Date(),
            id: Date.now()
        };

        // Guardar en localStorage
        try {
            const analisisGuardados = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
            analisisGuardados[tipo] = this.datosBenchmarking[tipo];
            localStorage.setItem('econova_benchmarking', JSON.stringify(analisisGuardados));
        } catch (error) {
            console.warn('No se pudo guardar el análisis de benchmarking:', error);
        }
    }

    cargarDatosPrecomputados() {
        // Cargar datos precomputados de percentiles
        try {
            const datosPrecomputados = localStorage.getItem('econova_percentiles_precomputados');
            if (datosPrecomputados) {
                this.percentilesPrecomputados = JSON.parse(datosPrecomputados);
            }
        } catch (error) {
            console.warn('Error cargando datos precomputados:', error);
        }
    }

    dispararEvento(evento, datos) {
        const customEvent = new CustomEvent(`benchmarking${evento.charAt(0).toUpperCase() + evento.slice(1)}`, {
            detail: datos
        });
        document.dispatchEvent(customEvent);
    }

    // API pública
    obtenerAnalisisBenchmarking(tipo) {
        return this.datosBenchmarking[tipo] || null;
    }

    exportarDatosBenchmarking(tipo) {
        const analisis = this.datosBenchmarking[tipo];
        if (!analisis) return null;

        return {
            tipo: tipo,
            datos: analisis.datos,
            resultados: analisis.analisis,
            recomendaciones: analisis.recomendaciones,
            timestamp: analisis.timestamp,
            exportado: new Date()
        };
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    window.benchmarkingManager = new BenchmarkingManager();
    console.log('🔍 Gestor de Benchmarking inicializado');
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BenchmarkingManager;
}
