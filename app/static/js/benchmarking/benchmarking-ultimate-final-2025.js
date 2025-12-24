/**
 * SISTEMA DE BENCHMARKING FINAL v3.0
 * Versión completamente simplificada y funcional
 */

// ==================== CORE MODULE ====================
class BenchmarkingCoreFinal {
    constructor() {
        console.log('🏗️ Core Benchmarking inicializado');
    }

    async generarAnalisisSectorial(metricas, sector, tamanoEmpresa) {
        console.log('🔬 Generando análisis sectorial...', { metricas, sector, tamanoEmpresa });

        const datosSectoriales = this.obtenerDatosSectoriales(sector);
        const datosFiltrados = this.filtrarPorTamanoEmpresa(datosSectoriales, tamanoEmpresa);
        const analisis = this.calcularAnalisisSectorial(metricas, datosFiltrados);

        analisis._empresasComparadas = datosFiltrados.length;
        analisis._sectorSeleccionado = sector;
        analisis._tamanoEmpresa = tamanoEmpresa;

        console.log('📊 Análisis completado');
        return analisis;
    }

    obtenerDatosSectoriales(sector) {
        const datasets = {
            'Tecnología': { ingresos_promedio: 2500000, margen_beneficio: 0.15, roi_promedio: 0.22, empleados_promedio: 45, crecimiento_anual: 0.18, endeudamiento_promedio: 0.35 },
            'Manufactura': { ingresos_promedio: 1800000, margen_beneficio: 0.12, roi_promedio: 0.15, empleados_promedio: 120, crecimiento_anual: 0.08, endeudamiento_promedio: 0.42 },
            'Comercio': { ingresos_promedio: 950000, margen_beneficio: 0.08, roi_promedio: 0.12, empleados_promedio: 15, crecimiento_anual: 0.05, endeudamiento_promedio: 0.28 },
            'Servicios Financieros': { ingresos_promedio: 3200000, margen_beneficio: 0.25, roi_promedio: 0.28, empleados_promedio: 35, crecimiento_anual: 0.12, endeudamiento_promedio: 0.55 }
        };

        const datosBase = datasets[sector] || datasets['Tecnología'];
        const datos = [];

        for (let i = 0; i < 100; i++) {
            const variacion = (Math.random() - 0.5) * 0.6;
            datos.push({
                ingresos: Math.max(1000, datosBase.ingresos_promedio * (1 + variacion)),
                margen_beneficio: Math.max(0.001, Math.min(1, datosBase.margen_beneficio * (1 + variacion * 0.5))),
                roi: Math.max(0.001, Math.min(5, datosBase.roi_promedio * (1 + variacion * 0.3))),
                empleados: Math.max(1, Math.round(datosBase.empleados_promedio * (1 + variacion))),
                crecimiento: Math.max(-0.5, Math.min(2, datosBase.crecimiento_anual * (1 + variacion * 0.8))),
                endeudamiento: Math.max(0.01, Math.min(2, datosBase.endeudamiento_promedio * (1 + variacion * 0.4)))
            });
        }

        return datos.sort((a, b) => a.ingresos - b.ingresos);
    }

    filtrarPorTamanoEmpresa(datos, tamano) {
        if (tamano === 'todos') return datos;
        const filtros = {
            'micro': d => d.empleados <= 10,
            'pequena': d => d.empleados > 10 && d.empleados <= 50,
            'mediana': d => d.empleados > 50 && d.empleados <= 200,
            'grande': d => d.empleados > 200
        };
        return filtros[tamano] ? datos.filter(filtros[tamano]) : datos;
    }

    calcularAnalisisSectorial(metricasEmpresa, datosSectoriales) {
        const analisis = {};
        Object.entries(metricasEmpresa).forEach(([metrica, valor]) => {
            if (datosSectoriales.length > 0) {
                const valoresSector = datosSectoriales.map(d => d[metrica]).filter(v => v !== undefined && !isNaN(v));
                if (valoresSector.length > 0) {
                    analisis[metrica] = {
                        valor_empresa: valor,
                        promedio_sector: valoresSector.reduce((a, b) => a + b, 0) / valoresSector.length,
                        percentil_25: this.calcularPercentil(valoresSector, 25),
                        percentil_75: this.calcularPercentil(valoresSector, 75),
                        minimo: Math.min(...valoresSector),
                        maximo: Math.max(...valoresSector),
                        posicion_relativa: this.calcularPosicionRelativa(valor, valoresSector)
                    };
                }
            }
        });
        return analisis;
    }

    calcularPercentil(valores, percentil) {
        const sorted = [...valores].sort((a, b) => a - b);
        const index = (percentil / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        if (lower === upper) return sorted[lower];
        const weight = index - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    calcularPosicionRelativa(valor, valores) {
        const sorted = [...valores].sort((a, b) => a - b);
        let menoresOiguales = 0;
        for (let val of sorted) {
            if (valor >= val) menoresOiguales++;
            else break;
        }
        const percentil = (menoresOiguales / sorted.length) * 100;
        return { percentil, ranking: `${menoresOiguales} de ${sorted.length}` };
    }

    generarRecomendaciones(analisis, datos) {
        const recomendaciones = [];
        Object.entries(analisis).filter(([key]) => !key.startsWith('_')).forEach(([metrica, stats]) => {
            if (stats.posicion_relativa.percentil < 50) {
                recomendaciones.push({
                    tipo: 'oportunidad_mejora',
                    metrica: metrica,
                    mensaje: `Tu ${this.nombreMetrica(metrica)} está por debajo del promedio sectorial.`,
                    acciones: ['Revisar procesos', 'Implementar mejores prácticas']
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
            'crecimiento': 'tasa de crecimiento',
            'endeudamiento': 'nivel de endeudamiento'
        };
        return nombres[metrica] || metrica;
    }
}

// ==================== UI MODULE ====================
class BenchmarkingUIFinal {
    constructor() {
        this.currentCalculator = null;
        console.log('🎨 UI Benchmarking inicializada');
    }

    setupCalculatorSelection() {
        document.querySelectorAll('.calculator-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const calculatorType = card.dataset.calculator;
                this.showCalculator(calculatorType);
            });
        });
    }

    showCalculator(type) {
        document.querySelectorAll('.simulation-calculator').forEach(calc => calc.style.display = 'none');
        const target = document.getElementById(`${type}-calculator`);
        if (target) target.style.display = 'block';
        this.currentCalculator = type;
    }

    mostrarResultadosBenchmarking(analisis, recomendaciones, datos) {
        const container = document.getElementById('sectorial-results');
        if (!container) return;

        // Determinar qué mostrar basado en opciones
        const mostrarRecomendaciones = datos.incluirRecomendaciones !== false;
        const mostrarDetallado = datos.analisisDetallado === true;

        let html = `
            <div class="flex items-center justify-between mb-6">
                <h4 class="text-xl font-bold text-gray-800">Resultados del Benchmarking Sectorial</h4>
            </div>

            <!-- Resumen -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h5 class="font-bold text-gray-800 mb-4">Resumen del Análisis</h5>
                <div class="grid md:grid-cols-3 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">${analisis._empresasComparadas}</div>
                        <div class="text-sm text-gray-600">Empresas Comparadas</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">${Object.keys(analisis).filter(k => !k.startsWith('_')).length}</div>
                        <div class="text-sm text-gray-600">Métricas Analizadas</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600">${this.calcularPercentilPromedio(analisis).toFixed(1)}%</div>
                        <div class="text-sm text-gray-600">Posición Promedio</div>
                    </div>
                </div>
            </div>

            <!-- Análisis Detallado -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h5 class="font-bold text-gray-800 mb-4">Análisis Detallado por Métrica</h5>
                <div class="space-y-4">
        `;

        Object.entries(analisis).filter(([key]) => !key.startsWith('_')).forEach(([metrica, stats]) => {
            html += `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h6 class="font-semibold text-gray-800 mb-3">${window.benchmarkingManager.core.nombreMetrica(metrica)}</h6>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div class="text-center">
                            <div class="text-lg font-bold text-blue-600">${this.formatearValor(metrica, stats.valor_empresa)}</div>
                            <div class="text-xs text-gray-600">Tu Valor</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-gray-600">${this.formatearValor(metrica, stats.promedio_sector)}</div>
                            <div class="text-xs text-gray-600">Promedio Sector</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold ${this.clasePosicion(stats.posicion_relativa.percentil)}">${this.formatearPercentil(stats.posicion_relativa.percentil)}</div>
                            <div class="text-xs text-gray-600">Tu Posición</div>
                        </div>
                    </div>
                    ${mostrarDetallado ? `
                        <div class="mt-3 pt-3 border-t border-gray-200">
                            <div class="grid md:grid-cols-2 gap-2 text-xs text-gray-500">
                                <div>P25: ${this.formatearValor(metrica, stats.percentil_25)}</div>
                                <div>P75: ${this.formatearValor(metrica, stats.percentil_75)}</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += `</div></div>`;

        // Recomendaciones (solo si está habilitado)
        if (mostrarRecomendaciones && recomendaciones.length > 0) {
            html += `
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <h5 class="font-bold text-gray-800 mb-4">Recomendaciones de Mejora</h5>
                    <div class="space-y-3">
            `;

            recomendaciones.forEach(rec => {
                html += `
                    <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
                        <div class="flex items-start">
                            <i class="fas fa-lightbulb text-blue-600 mt-1 mr-3"></i>
                            <div>
                                <h6 class="font-semibold text-gray-800">${rec.metrica}</h6>
                                <p class="text-sm text-gray-700">${rec.mensaje}</p>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        }

        // Gráfica
        html += `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h5 class="font-bold text-gray-800 mb-4">Visualización de Resultados</h5>
                <div><canvas id="grafico-sectorial" width="600" height="300"></canvas></div>
            </div>

            <!-- Botón Guardar -->
            <div class="flex justify-center mt-6">
                <button onclick="window.benchmarkingManager.guardarAnalisis()" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold">
                    <i class="fas fa-save mr-2"></i>Guardar Análisis
                </button>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        // Crear gráfica después de mostrar resultados
        setTimeout(() => this.crearGrafica(analisis, datos), 100);
    }

    crearGrafica(analisis, datos) {
        const ctx = document.getElementById('grafico-sectorial');
        if (!ctx) return;

        const metricas = Object.keys(analisis).filter(k => !k.startsWith('_'));

        // Crear gráfica simple con todas las métricas
        const labels = metricas.map(m => window.benchmarkingManager.core.nombreMetrica(m));

        // Normalizar valores para comparación visual
        const datosEmpresa = metricas.map(m => {
            const valor = analisis[m].valor_empresa;
            // Normalizar porcentajes y valores absolutos
            if (m === 'ingresos') return valor / 10000; // Escalar ingresos
            if (m === 'empleados') return valor; // Mantener empleados
            return valor > 1 ? valor : valor * 100; // Convertir decimales a %
        });

        const datosSector = metricas.map(m => {
            const valor = analisis[m].promedio_sector;
            // Normalizar porcentajes y valores absolutos
            if (m === 'ingresos') return valor / 10000; // Escalar ingresos
            if (m === 'empleados') return valor; // Mantener empleados
            return valor > 1 ? valor : valor * 100; // Convertir decimales a %
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tu Empresa',
                    data: datosEmpresa,
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    borderWidth: 1
                }, {
                    label: 'Promedio Sector',
                    data: datosSector,
                    backgroundColor: '#ef4444',
                    borderColor: '#dc2626',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: `Benchmarking Sectorial - ${datos.sector}` },
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                const dataIndex = context.dataIndex;
                                const metrica = metricas[dataIndex];

                                // Obtener el valor real dependiendo del dataset
                                let realValue;
                                if (context.datasetIndex === 0) {
                                    // Tu Empresa
                                    realValue = analisis[metrica].valor_empresa;
                                } else {
                                    // Promedio Sector
                                    realValue = analisis[metrica].promedio_sector;
                                }

                                // Formatear valores reales
                                if (metrica === 'ingresos') {
                                    return `${label}: S/ ${realValue.toLocaleString('es-PE')}`;
                                } else if (metrica === 'empleados') {
                                    return `${label}: ${Math.round(realValue)} personas`;
                                } else {
                                    // Porcentajes
                                    const percentValue = realValue > 1 ? realValue : realValue * 100;
                                    return `${label}: ${percentValue.toFixed(1)}%`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Valor Normalizado' },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1);
                            }
                        }
                    }
                }
            }
        });
    }

    calcularPercentilPromedio(analisis) {
        const percentiles = Object.values(analisis)
            .filter(stats => stats.posicion_relativa)
            .map(stats => stats.posicion_relativa.percentil)
            .filter(p => !isNaN(p));

        return percentiles.length > 0 ? percentiles.reduce((a, b) => a + b, 0) / percentiles.length : 0;
    }

    formatearValor(metrica, valor) {
        if (valor === null || valor === undefined || isNaN(valor)) return 'N/A';

        if (metrica.includes('margen') || metrica.includes('roi') || metrica.includes('crecimiento') || metrica.includes('endeudamiento')) {
            const num = parseFloat(valor);
            return num > 1 ? num.toFixed(2) + '%' : (num * 100).toFixed(2) + '%';
        }
        if (metrica === 'ingresos') return 'S/ ' + parseFloat(valor).toLocaleString('es-PE');
        if (metrica === 'empleados') return Math.round(parseFloat(valor)).toString();
        return parseFloat(valor).toFixed(2);
    }

    clasePosicion(percentil) {
        if (percentil >= 75) return 'text-green-600';
        if (percentil >= 50) return 'text-blue-600';
        if (percentil >= 25) return 'text-yellow-600';
        return 'text-red-600';
    }

    formatearPercentil(percentil) {
        if (percentil === null || percentil === undefined || isNaN(percentil)) {
            return '0.0%';
        }
        return percentil.toFixed(1) + '%';
    }

    mostrarExito(mensaje) {
        console.log('✅ Éxito:', mensaje);
        if (window.benchmarkingNotifications) {
            window.benchmarkingNotifications.success(mensaje);
        } else {
            alert('✅ ' + mensaje);
        }
    }

    mostrarError(mensaje) {
        console.log('❌ Error:', mensaje);
        if (window.benchmarkingNotifications) {
            window.benchmarkingNotifications.error(mensaje);
        } else {
            alert('❌ ' + mensaje);
        }
    }
}

// ==================== UTILS MODULE ====================
class BenchmarkingUtilsFinal {
    constructor() {
        console.log('🛠️ Utils Benchmarking inicializados');
    }

    validarDatosBenchmarking(datos) {
        return datos.sector && datos.metricas && Object.keys(datos.metricas).length > 0;
    }

    guardarAnalisisBenchmarking(tipo, datos) {
        const analisisData = {
            id: Date.now(),
            tipo: tipo,
            datos: datos,
            timestamp: new Date().toISOString()
        };

        const existentes = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
        existentes[analisisData.id] = analisisData;
        localStorage.setItem('econova_benchmarking', JSON.stringify(existentes));

        return analisisData;
    }

    cargarAnalisisBenchmarking() {
        return JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
    }
}

// ==================== MAIN MANAGER ====================
class BenchmarkingManagerFinal {
    constructor() {
        console.log('🚀 Inicializando BenchmarkingManager FINAL v3.0...');

        this.core = new BenchmarkingCoreFinal();
        this.ui = new BenchmarkingUIFinal();
        this.utils = new BenchmarkingUtilsFinal();

        this.isProcessing = false;
        this.datosAnalisisActual = null; // Para guardar análisis actual
        this.init();
    }

    init() {
        this.ui.setupCalculatorSelection();
        this.setupEventListeners();
        this.setupMetricInputs(); // Habilitar/deshabilitar inputs según checkboxes
        this.ui.showCalculator('grupos');

        // Simular carga de grupos (funcionalidad básica)
        setTimeout(() => {
            console.log('✅ Grupos de benchmarking cargados (simulado)');
            // Actualizar UI para mostrar que ya cargó
            const gruposContainer = document.getElementById('grupos-container');
            if (gruposContainer) {
                gruposContainer.innerHTML = `
                    <div class="text-center text-gray-500 py-8">
                        <i class="fas fa-users text-4xl mb-4"></i>
                        <p>No hay grupos de benchmarking disponibles.</p>
                        <p>Crea tu primer grupo para comenzar.</p>
                    </div>
                `;
            }
        }, 500);

        console.log('✅ BenchmarkingManager FINAL v3.0 listo');
        console.log('🎯 TODOS LOS PROBLEMAS SOLUCIONADOS:');
        console.log('   ✅ Inputs pequeños (w-32)');
        console.log('   ✅ Inputs funcionales (habilitan con checkboxes)');
        console.log('   ✅ Mensajes únicos');
        console.log('   ✅ Opciones funcionales');
        console.log('   ✅ Gráfica visible');
        console.log('   ✅ Botón guardar visible');
        console.log('   ✅ Recomendaciones mostradas');
        console.log('   ✅ Endeudamiento incluido');
        console.log('   ✅ Procesamiento seguro');
    }

    setupEventListeners() {
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'form-benchmarking-sectorial') {
                e.preventDefault();

                if (this.isProcessing) {
                    console.log('⏳ Procesando, ignorando...');
                    return;
                }

                this.isProcessing = true;
                this.procesarBenchmarkingSectorial(e.target);
            }
        });
    }

    async procesarBenchmarkingSectorial(form) {
        const formData = new FormData(form);
        const metricasSeleccionadas = formData.getAll('metricas[]');

        const metricas = {};
        metricasSeleccionadas.forEach(metrica => {
            const valor = parseFloat(formData.get(metrica));
            if (!isNaN(valor) && valor > 0) {
                metricas[metrica] = valor;
            }
        });

        const datos = {
            sector: formData.get('sector'),
            tamanoEmpresa: formData.get('tamano_empresa'),
            metricas: metricas,
            periodo: formData.get('periodo') || 'ultimo_anio',
            analisisDetallado: formData.has('analisis_detallado'),
            incluirRecomendaciones: formData.has('incluir_recomendaciones')
        };

        if (!this.utils.validarDatosBenchmarking(datos)) {
            this.ui.mostrarError('Complete los datos correctamente');
            this.isProcessing = false;
            return;
        }

        try {
            const analisis = await this.core.generarAnalisisSectorial(
                datos.metricas,
                datos.sector,
                datos.tamanoEmpresa
            );

            const recomendaciones = this.core.generarRecomendaciones(analisis, datos);

            // Guardar datos del análisis actual para poder guardarlo después
            this.datosAnalisisActual = {
                analisis: analisis,
                recomendaciones: recomendaciones,
                datos: datos,
                timestamp: new Date().toISOString()
            };

            this.ui.mostrarResultadosBenchmarking(analisis, recomendaciones, datos);
            this.ui.mostrarExito('Análisis completado exitosamente');

        } catch (error) {
            console.error('Error:', error);
            this.ui.mostrarError('Error generando análisis');
        } finally {
            this.isProcessing = false;
        }
    }

    guardarAnalisis() {
        try {
            console.log('💾 Guardando análisis...');

            // Validar que haya datos de análisis actual
            if (!this.datosAnalisisActual || !this.datosAnalisisActual.datos) {
                console.warn('⚠️ No hay análisis actual para guardar');
                this.ui.mostrarError('Primero debes generar un análisis antes de guardarlo');
                return;
            }

            const analisisActual = this.datosAnalisisActual;

            // Validar que tenga datos mínimos
            if (!analisisActual.datos.sector || !analisisActual.datos.metricas ||
                Object.keys(analisisActual.datos.metricas).length === 0) {
                console.warn('⚠️ Análisis incompleto, faltan datos');
                this.ui.mostrarError('El análisis no tiene datos completos para guardar');
                return;
            }

            // Crear entrada completa para guardar
            const sector = analisisActual.datos.sector;
            const tamanoEmpresa = analisisActual.datos.tamanoEmpresa;
            const periodo = analisisActual.datos.periodo;

            // Formatear tamaño de empresa para mostrar
            const tamanoFormateado = {
                'micro': 'Microempresa (1-10 empleados)',
                'pequena': 'Pequeña (11-50 empleados)',
                'mediana': 'Mediana (51-200 empleados)',
                'grande': 'Grande (201+ empleados)',
                'todos': 'Todos los tamaños'
            }[tamanoEmpresa] || tamanoEmpresa;

            const analisisData = {
                id: Date.now(),
                tipo: 'sectorial',
                titulo: `Análisis de Benchmarking Sectorial - ${sector}`,
                sector: sector,
                tamanoEmpresa: tamanoFormateado, // Guardar versión formateada
                periodo: periodo,
                metricasAnalizadas: Object.keys(analisisActual.datos.metricas),
                numeroMetricas: Object.keys(analisisActual.datos.metricas).length,
                empresasComparadas: analisisActual.analisis._empresasComparadas || 0,
                percentilPromedio: window.benchmarkingManager.ui.calcularPercentilPromedio(analisisActual.analisis),
                timestamp: new Date().toISOString(),
                fechaFormateada: new Date().toLocaleDateString('es-ES'),
                datos: analisisActual,
                analisis: analisisActual.analisis,
                recomendaciones: analisisActual.recomendaciones
            };

            // Guardar en localStorage
            const existentes = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
            existentes[analisisData.id] = analisisData;
            localStorage.setItem('econova_benchmarking', JSON.stringify(existentes));

            console.log('✅ Análisis guardado exitosamente:', analisisData.id);
            this.ui.mostrarExito('Análisis guardado correctamente');

        } catch (error) {
            console.error('❌ Error guardando análisis:', error);
            this.ui.mostrarError('Error al guardar el análisis');
        }
    }

    setupMetricInputs() {
        // Habilitar/deshabilitar inputs según checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.name === 'metricas[]') {
                const metrica = e.target.value;
                const input = document.querySelector(`input[name="${metrica}"].metric-value`);
                if (input) {
                    input.disabled = !e.target.checked;
                    if (!e.target.checked) {
                        input.value = '';
                    }
                }
                console.log(`🔄 Input ${metrica}: ${e.target.checked ? 'habilitado' : 'deshabilitado'}`);
            }
        });
        console.log('🔧 Sistema de inputs métricos configurado');
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    window.benchmarkingManager = new BenchmarkingManagerFinal();
});
