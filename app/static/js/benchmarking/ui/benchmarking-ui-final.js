/**
 * Interfaz de Usuario del Sistema de Benchmarking
 * Gestión de formularios, navegación y gráficos
 */

class BenchmarkingUI {
    constructor() {
        this.currentCalculator = null;
    }

    setupCalculatorSelection() {
        const calculatorCards = document.querySelectorAll('.calculator-card');

        calculatorCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const calculatorType = card.dataset.calculator;
                this.showCalculator(calculatorType);

                // Update active state
                calculatorCards.forEach(c => c.classList.remove('border-blue-500', 'border-green-500', 'border-purple-500', 'border-orange-500'));
                calculatorCards.forEach(c => c.classList.add('border-gray-200'));

                card.classList.remove('border-gray-200');
                if (calculatorType === 'grupos') card.classList.add('border-blue-500');
                else if (calculatorType === 'sectorial') card.classList.add('border-green-500');
                else if (calculatorType === 'personalizado') card.classList.add('border-purple-500');
                else if (calculatorType === 'resultados') card.classList.add('border-orange-500');
            });
        });

        }

    showCalculator(type) {
        // Hide all calculators
        const calculators = document.querySelectorAll('.simulation-calculator');
        calculators.forEach(calc => calc.style.display = 'none');

        // Show selected calculator
        const targetCalculator = document.getElementById(`${type}-calculator`);
        if (targetCalculator) {
            targetCalculator.style.display = 'block';
        }

        this.currentCalculator = type;
        }

    setupEventListeners() {
        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'form-benchmarking-sectorial') {
                e.preventDefault();
                window.benchmarkingManager.generarBenchmarkingSectorial(e.target);
            }
        });
    }

    setupGroupManagement() {
        // Setup group management buttons
        }

    setupMetricInputs() {
        // Enable/disable metric inputs based on checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.name === 'metricas[]') {
                const metrica = e.target.value;
                const input = document.querySelector(`input[name="${metrica}"]`);
                if (input) {
                    input.disabled = !e.target.checked;
                    if (!e.target.checked) {
                        input.value = '';
                    }
                }
            }
        });
    }

    setupPersonalizedComparison() {
        // Setup personalized comparison
        }

    mostrarLoading(mensaje) {
        }

    ocultarLoading() {
        }

    mostrarError(mensaje) {
        if (window.benchmarkingNotifications) {
            window.benchmarkingNotifications.error(mensaje);
        } else {
            alert(`Error: ${mensaje}`);
        }
    }

    mostrarExito(mensaje, titulo = 'Éxito') {
        if (window.benchmarkingNotifications) {
            window.benchmarkingNotifications.success(mensaje, titulo);
        } else {
            alert(`${titulo}: ${mensaje}`);
        }
    }

    mostrarResultadosBenchmarking(analisis, recomendaciones, datos) {
        const resultadoDiv = document.getElementById('sectorial-results');
        if (!resultadoDiv) return;

        // Verificar opciones seleccionadas
        const mostrarRecomendaciones = datos.incluirRecomendaciones !== false; // Por defecto true
        const mostrarDetallado = datos.analisisDetallado === true;

        let html = `
            <div class="flex items-center justify-between mb-6">
                <h4 class="text-xl font-bold text-gray-800">Resultados del Benchmarking Sectorial</h4>
            </div>

            <!-- Analysis Summary -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h5 class="font-bold text-gray-800 mb-4">Resumen del Análisis</h5>

                <div class="grid md:grid-cols-3 gap-4 mb-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">${analisis._empresasComparadas || 100}</div>
                        <div class="text-sm text-gray-600">Empresas Comparadas</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">${Object.keys(analisis).filter(k => !k.startsWith('_')).length}</div>
                        <div class="text-sm text-gray-600">Métricas Analizadas</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600">${window.benchmarkingManager.core.calcularPercentilPromedio(analisis).toFixed(1)}%</div>
                        <div class="text-sm text-gray-600">Percentil Promedio</div>
                    </div>
                </div>
            </div>

            <!-- Detailed Metrics Analysis -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h5 class="font-bold text-gray-800 mb-4">Análisis Detallado por Métrica</h5>

                <div class="space-y-4">
        `;

        Object.entries(analisis).filter(([metrica, stats]) => !metrica.startsWith('_')).forEach(([metrica, stats]) => {
            const nombreMetrica = window.benchmarkingManager.core.nombreMetrica(metrica);
            const posicion = stats.posicion_relativa;

            html += `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h6 class="font-semibold text-gray-800 mb-3">${nombreMetrica.charAt(0).toUpperCase() + nombreMetrica.slice(1)}</h6>
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
                            <div class="text-lg font-bold ${this.clasePosicion(posicion.percentil)}">${posicion.percentil.toFixed(1)}%</div>
                            <div class="text-xs text-gray-600">Tu Posición</div>
                        </div>
                    </div>
            `;

            // Mostrar información adicional si se seleccionó análisis detallado
            if (mostrarDetallado && stats) {
                html += `
                    <div class="mt-3 pt-3 border-t border-gray-200">
                        <div class="grid md:grid-cols-4 gap-2 text-xs text-gray-500">
                            <div>P25: ${this.formatearValor(metrica, stats.percentil_25)}</div>
                            <div>P75: ${this.formatearValor(metrica, stats.percentil_75)}</div>
                            <div>P90: ${this.formatearValor(metrica, stats.percentil_90)}</div>
                            <div>Desv: ${stats.desviacion_estandar ? stats.desviacion_estandar.toFixed(2) : 'N/A'}</div>
                        </div>
                    </div>
                `;
            }

            html += `
                    <div class="mt-3 text-sm text-gray-600">
                        <strong>Posición:</strong> ${posicion.cuartil} (${posicion.ranking})
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        // Mostrar recomendaciones solo si está habilitado
        if (mostrarRecomendaciones) {
            html += `
                <!-- Recommendations -->
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-lightbulb mr-2 text-yellow-600"></i>
                        Recomendaciones de Mejora
                    </h5>

                    <div id="recomendaciones-sectoriales" class="space-y-3">
                        ${this.generarHTMLRecomendaciones(recomendaciones)}
                    </div>
                </div>
            `;
        }

        html += `
            <!-- Charts Container -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h5 class="font-bold text-gray-800 mb-4">Visualización de Resultados</h5>
                <div class="grid md:grid-cols-1 gap-6">
                    <div>
                        <canvas id="grafico-sectorial-percentiles" width="600" height="300"></canvas>
                    </div>
                </div>
            </div>
        `;

        resultadoDiv.innerHTML = html;
        resultadoDiv.style.display = 'block';

        this.showCalculator('sectorial');
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    }

    crearGraficoPercentiles(analisis, datos) {
        const ctx = document.getElementById('grafico-sectorial-percentiles');
        if (!ctx) return;

        // Filtrar solo métricas reales (excluir metadatos que empiezan con _)
        const metricas = Object.keys(analisis).filter(key => !key.startsWith('_'));

        if (this.graficoPercentiles) {
            this.graficoPercentiles.destroy();
        }

        // Crear gráfico separado para cada tipo de métrica
        this.crearGraficoComparativo(analisis, datos, metricas);
    }

    crearGraficoComparativo(analisis, datos, metricas) {
        const ctx = document.getElementById('grafico-sectorial-percentiles');
        if (!ctx) return;

        // Separar métricas por tipo para mejor visualización
        const metricasPorcentaje = metricas.filter(m => m.includes('margen') || m.includes('roi') || m.includes('crecimiento') || m.includes('endeudamiento'));
        const metricasAbsolutas = metricas.filter(m => !metricasPorcentaje.includes(m));

        // Crear datasets para métricas porcentuales
        const datasetsPorcentaje = [];
        if (metricasPorcentaje.length > 0) {
            datasetsPorcentaje.push({
                label: 'Tu Empresa (%)',
                data: metricasPorcentaje.map(metrica => {
                    const valor = analisis[metrica].valor_empresa;
                    return valor > 1 ? valor : valor * 100; // Convertir a porcentaje si es decimal
                }),
                backgroundColor: '#00ffff',
                borderColor: '#00ffff',
                borderWidth: 2,
                yAxisID: 'y-porcentaje'
            });

            datasetsPorcentaje.push({
                label: 'Promedio Sector (%)',
                data: metricasPorcentaje.map(metrica => {
                    const valor = analisis[metrica].promedio_sector;
                    return valor > 1 ? valor : valor * 100; // Convertir a porcentaje si es decimal
                }),
                backgroundColor: 'rgba(255, 107, 107, 0.7)',
                borderColor: '#ff6b6b',
                borderWidth: 2,
                type: 'line',
                yAxisID: 'y-porcentaje'
            });
        }

        // Crear datasets para métricas absolutas
        const datasetsAbsolutas = [];
        if (metricasAbsolutas.length > 0) {
            datasetsAbsolutas.push({
                label: 'Tu Empresa',
                data: metricasAbsolutas.map(metrica => analisis[metrica].valor_empresa),
                backgroundColor: '#00ff88',
                borderColor: '#00ff88',
                borderWidth: 2,
                yAxisID: 'y-absoluto'
            });

            datasetsAbsolutas.push({
                label: 'Promedio Sector',
                data: metricasAbsolutas.map(metrica => analisis[metrica].promedio_sector),
                backgroundColor: 'rgba(76, 205, 196, 0.7)',
                borderColor: '#4ecdc4',
                borderWidth: 2,
                type: 'line',
                yAxisID: 'y-absoluto'
            });
        }

        // Combinar todos los datasets
        const allDatasets = [...datasetsPorcentaje, ...datasetsAbsolutas];

        // Crear labels apropiadas
        const labels = [
            ...metricasPorcentaje.map(m => window.benchmarkingManager.core.nombreMetrica(m) + ' (%)'),
            ...metricasAbsolutas.map(m => window.benchmarkingManager.core.nombreMetrica(m))
        ];

        this.graficoPercentiles = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: allDatasets
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
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                if (context.dataset.yAxisID === 'y-porcentaje') {
                                    return `${label}: ${value.toFixed(2)}%`;
                                }
                                return `${label}: ${value.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: false,
                        position: 'left'
                    },
                    'y-porcentaje': {
                        type: 'linear',
                        display: metricasPorcentaje.length > 0,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Porcentaje (%)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    'y-absoluto': {
                        type: 'linear',
                        display: metricasAbsolutas.length > 0,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Valor Absoluto'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    clasePosicion(percentil) {
        if (percentil >= 75) return 'text-green-600';
        if (percentil >= 50) return 'text-blue-600';
        if (percentil >= 25) return 'text-yellow-600';
        return 'text-red-600';
    }

    formatearValor(metrica, valor) {
        // Asegurar que valor sea un número
        if (valor === null || valor === undefined || isNaN(valor)) {
            return 'N/A';
        }

        if (metrica.includes('margen') || metrica.includes('roi') || metrica.includes('crecimiento')) {
            // Si el valor ya está en porcentaje (> 1), mostrarlo directamente
            // Si está en decimal (< 1), multiplicar por 100
            const valorNumerico = parseFloat(valor);
            if (valorNumerico > 1) {
                return valorNumerico.toFixed(2) + '%';
            } else {
                return (valorNumerico * 100).toFixed(2) + '%';
            }
        }
        if (metrica === 'ingresos') {
            return 'S/ ' + parseFloat(valor).toLocaleString('es-PE');
        }
        if (metrica === 'empleados') {
            return Math.round(parseFloat(valor)).toString();
        }
        return parseFloat(valor).toFixed(2);
    }

    /**
     * Mostrar historial de resultados
     */
    mostrarHistorialResultados(analisisGuardados) {
        const container = document.getElementById('historial-resultados');
        if (!container) return;

        const analisis = Object.values(analisisGuardados);
        if (analisis.length === 0) return;

        let html = '';

        // Ordenar por fecha (más reciente primero)
        analisis.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Filtrar duplicados
        const uniqueAnalisis = [];
        const seenIds = new Set();

        analisis.forEach(item => {
            if (item.id && !seenIds.has(item.id)) {
                seenIds.add(item.id);
                uniqueAnalisis.push(item);
            }
        });

        uniqueAnalisis.forEach(analisisItem => {
            const fecha = new Date(analisisItem.timestamp).toLocaleDateString('es-ES');
            const tipo = analisisItem.datos ? 'Sectorial' : 'Personalizada';
            const hasCompleteData = analisisItem.analisis || analisisItem.comparacion;

            html += `
                <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-4">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800">Análisis ${tipo}</h3>
                            <p class="text-gray-600 text-sm">${fecha}</p>
                        </div>
                        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            ${tipo}
                        </span>
                    </div>

                    <div class="grid md:grid-cols-2 gap-4 mb-4">
                        ${analisisItem.datos ? `
                            <div>
                                <span class="text-sm font-medium text-gray-700">Sector:</span>
                                <span class="text-gray-600 ml-2">${analisisItem.datos.sector}</span>
                            </div>
                            <div>
                                <span class="text-sm font-medium text-gray-700">Tamaño:</span>
                                <span class="text-gray-600 ml-2">${analisisItem.datos.tamanoEmpresa}</span>
                            </div>
                        ` : `
                            <div>
                                <span class="text-sm font-medium text-gray-700">Empresa:</span>
                                <span class="text-gray-600 ml-2">${analisisItem.datos?.empresaBase?.nombre || 'N/A'}</span>
                            </div>
                            <div>
                                <span class="text-sm font-medium text-gray-700">Comparaciones:</span>
                                <span class="text-gray-600 ml-2">${analisisItem.datos?.empresasComparacion?.length || 0} empresas</span>
                            </div>
                        `}
                    </div>

                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-500">
                            ${Object.keys(analisisItem.analisis || analisisItem.comparacion?.resultados || {}).filter(k => !k.startsWith('_')).length} métricas analizadas
                        </div>
                        <button class="ver-resultado bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 text-sm"
                                data-analisis-id="${analisisItem.id}">
                            <i class="fas fa-eye mr-1"></i>Ver Resultado
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Configurar event listeners
        this.setupHistorialButtons();
    }

    /**
     * Configurar botones del historial
     */
    setupHistorialButtons() {
        document.querySelectorAll('.ver-resultado').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const analisisId = e.target.closest('.ver-resultado').dataset.analisisId;
                this.verResultadoHistorial(analisisId);
            });
        });
    }

    /**
     * Ver resultado específico del historial
     */
    async verResultadoHistorial(analisisId) {
        try {
            // Buscar en localStorage
            const analisisGuardados = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
            const analisis = Object.values(analisisGuardados).find(a => a.id == analisisId);

            if (analisis) {
                // Cambiar a la pestaña de resultados
                const resultadosTab = document.querySelector('[data-calculator="resultados"]');
                if (resultadosTab) {
                    resultadosTab.click();
                }

                // Mostrar el resultado
                if (analisis.analisis) {
                    this.mostrarResultadosBenchmarking(analisis.analisis, analisis.recomendaciones, analisis.datos);
                    setTimeout(() => {
                        this.crearGraficoPercentiles(analisis.analisis, analisis.datos);
                    }, 100);
                } else if (analisis.comparacion) {
                    // Para comparación personalizada (simplificado)
                    this.mostrarExito('Comparación personalizada cargada');
                }
            } else {
                this.mostrarError('Análisis no encontrado');
            }
        } catch (error) {
            this.mostrarError('Error al cargar el resultado del análisis');
        }
    }

    /**
     * Mostrar grupos disponibles
     */
    mostrarGruposBenchmarking(grupos) {
        const container = document.getElementById('grupos-container');
        if (!container) return;

        if (grupos.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-users text-4xl mb-4"></i>
                    <p>No hay grupos de benchmarking disponibles.</p>
                    <p>Crea tu primer grupo para comenzar.</p>
                </div>
            `;
            return;
        }

        let html = '';
        grupos.forEach(grupo => {
            html += `
                <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800">${grupo.nombre_grupo}</h3>
                            <p class="text-gray-600 mt-1">${grupo.descripcion || 'Sin descripción'}</p>
                        </div>
                        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Grupo ${grupo.benchmarking_id}
                        </span>
                    </div>

                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-500">
                            <i class="fas fa-calendar mr-1"></i>
                            ID: ${grupo.benchmarking_id}
                        </div>
                        <div class="space-x-2">
                            <button class="unirse-grupo bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300 text-sm"
                                    data-grupo-id="${grupo.benchmarking_id}">
                                <i class="fas fa-user-plus mr-1"></i>Unirse
                            </button>
                            <button class="ver-grupo bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 text-sm"
                                    data-grupo-id="${grupo.benchmarking_id}">
                                <i class="fas fa-eye mr-1"></i>Ver
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Configurar event listeners
        this.setupGrupoButtons();
    }

    /**
     * Mostrar grupos del usuario
     */
    mostrarGruposUsuario(gruposUsuario) {
        const container = document.getElementById('mis-grupos-container');
        if (!container) return;

        if (gruposUsuario.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    <i class="fas fa-users text-3xl mb-2"></i>
                    <p>No perteneces a ningún grupo aún</p>
                    <p class="text-sm">Únete a un grupo existente o crea uno nuevo</p>
                </div>
            `;
            return;
        }

        let html = '';
        gruposUsuario.forEach(grupo => {
            html += `
                <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-4">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h4 class="text-lg font-semibold text-gray-800">${grupo.nombre_grupo}</h4>
                            <p class="text-gray-600 mt-1">${grupo.descripcion || 'Sin descripción'}</p>
                        </div>
                        <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Miembro
                        </span>
                    </div>

                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-500">
                            <i class="fas fa-users mr-1"></i>
                            ${grupo.miembros || '2 miembros'}
                        </div>
                        <div class="space-x-2">
                            <button class="ver-miembro bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition duration-300 text-sm"
                                    data-grupo-id="${grupo.benchmarking_id}">
                                <i class="fas fa-eye mr-1"></i>Ver Grupo
                            </button>
                            <button class="abandonar-grupo bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition duration-300 text-sm"
                                    data-grupo-id="${grupo.benchmarking_id}">
                                <i class="fas fa-sign-out-alt mr-1"></i>Abandonar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Configurar event listeners
        this.setupMisGruposButtons();
    }

    /**
     * Configurar botones de grupos
     */
    setupGrupoButtons() {
        // Botones de unirse a grupo
        document.querySelectorAll('.unirse-grupo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const grupoId = e.target.closest('.unirse-grupo').dataset.grupoId;
                // Implementación básica
                this.mostrarExito('Funcionalidad de grupos próximamente');
            });
        });

        // Botones de ver grupo
        document.querySelectorAll('.ver-grupo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const grupoId = e.target.closest('.ver-grupo').dataset.grupoId;
                // Implementación básica
                this.mostrarExito('Funcionalidad de grupos próximamente');
            });
        });
    }

    /**
     * Configurar botones de "Mis Grupos"
     */
    setupMisGruposButtons() {
        // Botones de ver grupo (miembro)
        document.querySelectorAll('.ver-miembro').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const grupoId = e.target.closest('.ver-miembro').dataset.grupoId;
                // Implementación básica
                this.mostrarExito('Funcionalidad de grupos próximamente');
            });
        });

        // Botones de abandonar grupo
        document.querySelectorAll('.abandonar-grupo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const grupoId = e.target.closest('.abandonar-grupo').dataset.grupoId;
                // Implementación básica
                this.mostrarExito('Funcionalidad de grupos próximamente');
            });
        });
    }

    /**
     * Generar HTML para recomendaciones
     */
    generarHTMLRecomendaciones(recomendaciones) {
        if (!recomendaciones || recomendaciones.length === 0) {
            return `
                <div class="text-center text-gray-500 py-4">
                    <i class="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                    <p class="text-sm">¡Excelente rendimiento! No se encontraron áreas críticas de mejora.</p>
                    <p class="text-xs text-gray-400 mt-1">Continúa manteniendo tus buenas prácticas.</p>
                </div>
            `;
        }

        return recomendaciones.map(rec => {
            const iconClass = rec.tipo === 'oportunidad_mejora' ? 'fas fa-arrow-up text-blue-500' :
                            rec.tipo === 'ventaja_competitiva' ? 'fas fa-trophy text-yellow-500' :
                            'fas fa-balance-scale text-purple-500';

            const bgClass = rec.tipo === 'oportunidad_mejora' ? 'bg-blue-50 border-blue-200' :
                          rec.tipo === 'ventaja_competitiva' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-purple-50 border-purple-200';

            return `
                <div class="${bgClass} border-l-4 p-4 rounded-r-lg">
                    <div class="flex items-start">
                        <i class="${iconClass} mt-1 mr-3"></i>
                        <div class="flex-1">
                            <h6 class="font-semibold text-gray-800 text-sm mb-1">${rec.metrica.charAt(0).toUpperCase() + rec.metrica.slice(1)}</h6>
                            <p class="text-sm text-gray-700 mb-2">${rec.mensaje}</p>
                            ${rec.acciones && rec.acciones.length > 0 ? `
                                <div class="text-xs text-gray-600">
                                    <strong>Acciones recomendadas:</strong>
                                    <ul class="mt-1 ml-4 list-disc">
                                        ${rec.acciones.map(accion => `<li>${accion}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}
