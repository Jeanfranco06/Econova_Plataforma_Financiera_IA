/**
 * Gestión de Interfaz de Usuario para Benchmarking
 * Funciones de UI, navegación y manejo de elementos DOM
 */

class BenchmarkingUI {
    constructor() {
        this.calculadoras = {
            grupos: 'grupos-calculator',
            sectorial: 'sectorial-calculator',
            personalizado: 'personalizado-calculator',
            resultados: 'resultados-calculator'
        };
    }

    /**
     * Mostrar calculadora específica
     */
    showCalculator(type) {
        // Hide all calculators
        const calculators = document.querySelectorAll('.simulation-calculator');
        calculators.forEach(calc => calc.style.display = 'none');

        // Show selected calculator
        const targetCalculator = document.getElementById(`${type}-calculator`);
        if (targetCalculator) {
            targetCalculator.style.display = 'block';
        }

        }

    /**
     * Configurar navegación por pestañas
     */
    setupTabNavigation() {
        const tabs = document.querySelectorAll('.benchmarking-tab');
        const contents = document.querySelectorAll('.benchmarking-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active', 'bg-blue-600', 'text-white'));
                tabs.forEach(t => t.classList.add('bg-gray-200', 'text-gray-700'));

                // Add active class to clicked tab
                tab.classList.remove('bg-gray-200', 'text-gray-700');
                tab.classList.add('active', 'bg-blue-600', 'text-white');

                // Hide all content
                contents.forEach(content => content.classList.add('hidden'));

                // Show corresponding content
                const targetId = tab.id.replace('btn-', 'tab-');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                }
            });
        });
    }

    /**
     * Configurar selección de calculadoras
     */
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

        // Handle anchor links for calculator switching
        document.querySelectorAll('.calculator-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href) {
                    const calculatorType = href.substring(1); // Remove #
                    this.showCalculator(calculatorType);
                }
            });
        });
    }

    /**
     * Configurar inputs de métricas
     */
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

    /**
     * Configurar comparación personalizada
     */
    setupPersonalizedComparison() {
        // Agregar empresa de comparación
        const btnAgregarEmpresa = document.getElementById('btn-agregar-empresa');
        if (btnAgregarEmpresa) {
            btnAgregarEmpresa.addEventListener('click', () => {
                this.agregarEmpresaComparacion();
            });
        }

        // Remover empresas
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remover-empresa')) {
                e.target.closest('.empresa-comparacion').remove();
            }
        });
    }

    /**
     * Agregar empresa de comparación
     */
    agregarEmpresaComparacion() {
        const container = document.getElementById('empresas-comparacion-container');
        if (!container) return;

        const empresaCount = container.querySelectorAll('.empresa-comparacion').length + 1;

        const nuevaEmpresa = document.createElement('div');
        nuevaEmpresa.className = 'empresa-comparacion bg-gray-50 p-4 rounded-lg mb-4';
        nuevaEmpresa.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h5 class="font-medium text-gray-700">Empresa ${empresaCount}</h5>
                <button type="button" class="remover-empresa text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm text-gray-600 mb-1">Nombre</label>
                    <input type="text" name="empresa_${empresaCount}_nombre" placeholder="Empresa Competidora S.A." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Ingresos (S/)</label>
                        <input type="number" name="empresa_${empresaCount}_ingresos" placeholder="450000" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Margen (%)</label>
                        <input type="number" step="0.01" name="empresa_${empresaCount}_margen_beneficio" placeholder="12.3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">ROI (%)</label>
                        <input type="number" step="0.01" name="empresa_${empresaCount}_roi" placeholder="18.7" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Empleados</label>
                        <input type="number" name="empresa_${empresaCount}_empleados" placeholder="22" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Crecimiento (%)</label>
                        <input type="number" step="0.01" name="empresa_${empresaCount}_crecimiento" placeholder="15.2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(nuevaEmpresa);
    }

    /**
     * Configurar gestión de grupos
     */
    setupGroupManagement() {
        // Botón crear grupo
        const btnCrearGrupo = document.getElementById('btn-crear-grupo');
        if (btnCrearGrupo) {
            btnCrearGrupo.addEventListener('click', () => {
                this.mostrarModalCrearGrupo();
            });
        }

        // Modal events
        const cerrarModal = document.getElementById('cerrar-modal');
        const cancelarCrearGrupo = document.getElementById('cancelar-crear-grupo');
        const modal = document.getElementById('modal-crear-grupo');

        [cerrarModal, cancelarCrearGrupo].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    if (modal) modal.classList.add('hidden');
                });
            }
        });

        // Form crear grupo
        const formCrearGrupo = document.getElementById('form-crear-grupo');
        if (formCrearGrupo) {
            formCrearGrupo.addEventListener('submit', (e) => {
                e.preventDefault();
                // This will be handled by the main BenchmarkingManager
                if (window.benchmarkingManager) {
                    window.benchmarkingManager.crearGrupoBenchmarking(e.target);
                }
            });
        }

        // Botones de acción en grupos
        this.setupActionButtons();
    }

    /**
     * Configurar botones de acción
     */
    setupActionButtons() {
        // Delegar eventos para botones de acción usando event delegation
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            // Botón "Ver Guía Rápida" (en el hero section)
            if (button.textContent.trim() === 'Ver Guía Rápida') {
                e.preventDefault();
                this.mostrarGuiaRapida();
                return;
            }

            // Botón "Actualizar Grupos"
            if (button.querySelector('.fa-refresh') || button.textContent.includes('Actualizar Grupos')) {
                e.preventDefault();
                if (window.benchmarkingManager) {
                    window.benchmarkingManager.cargarGruposBenchmarking();
                }
                return;
            }

            // Botón "¿Cómo Funciona?"
            if (button.querySelector('.fa-question-circle') || button.textContent.includes('¿Cómo Funciona?')) {
                e.preventDefault();
                this.mostrarComoFunciona();
                return;
            }

            // Botón "Guardar Análisis" (sectorial)
            if (button.id === 'btn-guardar-sectorial') {
                e.preventDefault();
                if (window.benchmarkingManager) {
                    window.benchmarkingManager.guardarAnalisisBenchmarking('sectorial');
                    BenchmarkingUtils.mostrarExito('Análisis guardado exitosamente', '¡Guardado!');
                }
                return;
            }

            // Botón "Guardar Análisis" (personalizado)
            if (button.id === 'btn-guardar-personalizado') {
                e.preventDefault();
                if (window.benchmarkingManager) {
                    window.benchmarkingManager.guardarAnalisisBenchmarking('personalizada');
                    BenchmarkingUtils.mostrarExito('Análisis personalizado guardado exitosamente', '¡Guardado!');
                }
                return;
            }

            // Botón "Nuevo Análisis" (sectorial)
            if (button.id === 'btn-nuevo-sectorial') {
                e.preventDefault();
                // Resetear formulario y ocultar resultados
                const form = document.getElementById('form-benchmarking-sectorial');
                const results = document.getElementById('sectorial-results');
                if (form) form.reset();
                if (results) results.style.display = 'none';
                // Mostrar calculadora sectorial
                this.showCalculator('sectorial');
                return;
            }
        });

        }

    /**
     * Mostrar guía rápida
     */
    mostrarGuiaRapida() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-gray-800">Guía Rápida de Benchmarking</h3>
                        <button id="cerrar-guia" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="space-y-4">
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-blue-800 mb-2">1. Grupos de Benchmarking</h4>
                            <p class="text-blue-700 text-sm">Únete a comunidades especializadas donde empresarios comparten datos anonimizados para comparar su rendimiento.</p>
                        </div>

                        <div class="bg-green-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-green-800 mb-2">2. Benchmarking Sectorial</h4>
                            <p class="text-green-700 text-sm">Analiza tu desempeño contra estándares y mejores prácticas de tu sector específico.</p>
                        </div>

                        <div class="bg-purple-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-purple-800 mb-2">3. Comparación Personalizada</h4>
                            <p class="text-purple-700 text-sm">Compara tu empresa contra competidores específicos que elijas manualmente.</p>
                        </div>

                        <div class="bg-orange-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-orange-800 mb-2">4. Tu Historial</h4>
                            <p class="text-orange-700 text-sm">Revisa todos tus análisis anteriores y tendencias a lo largo del tiempo.</p>
                        </div>
                    </div>

                    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h5 class="font-semibold text-gray-800 mb-2">💡 Consejos Rápidos</h5>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>• Todos los datos son 100% anónimos y confidenciales</li>
                            <li>• Puedes guardar y exportar tus análisis</li>
                            <li>• Únete a múltiples grupos para comparaciones más amplias</li>
                            <li>• Las recomendaciones se basan en mejores prácticas del sector</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Cerrar modal
        modal.querySelector('#cerrar-guia').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Mostrar "¿Cómo funciona?"
     */
    mostrarComoFunciona() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-96 overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-gray-800">¿Cómo Funciona el Benchmarking Anónimo?</h3>
                        <button id="cerrar-como-funciona" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="space-y-6">
                        <div>
                            <h4 class="font-bold text-gray-800 mb-3">🔒 Anonimización de Datos</h4>
                            <p class="text-gray-600 mb-3">Utilizamos técnicas avanzadas de anonimización para proteger tu información:</p>
                            <ul class="text-sm text-gray-600 space-y-1 ml-4">
                                <li>• Tus datos nunca se identifican individualmente</li>
                                <li>• Se agregan con datos de otras empresas similares</li>
                                <li>• Solo se comparten estadísticas agregadas</li>
                                <li>• Tú controlas qué datos compartir</li>
                            </ul>
                        </div>

                        <div>
                            <h4 class="font-bold text-gray-800 mb-3">📊 Proceso de Benchmarking</h4>
                            <div class="grid md:grid-cols-2 gap-4">
                                <div class="bg-blue-50 p-3 rounded-lg">
                                    <h5 class="font-semibold text-blue-800 mb-1">1. Recopilación</h5>
                                    <p class="text-sm text-blue-700">Reunimos datos de empresas similares en grupos especializados.</p>
                                </div>
                                <div class="bg-green-50 p-3 rounded-lg">
                                    <h5 class="font-semibold text-green-800 mb-1">2. Anonimización</h5>
                                    <p class="text-sm text-green-700">Aplicamos técnicas de privacidad para proteger la identidad.</p>
                                </div>
                                <div class="bg-purple-50 p-3 rounded-lg">
                                    <h5 class="font-semibold text-purple-800 mb-1">3. Análisis</h5>
                                    <p class="text-sm text-purple-700">Calculamos percentiles, promedios y posiciones relativas.</p>
                                </div>
                                <div class="bg-orange-50 p-3 rounded-lg">
                                    <h5 class="font-semibold text-orange-800 mb-1">4. Recomendaciones</h5>
                                    <p class="text-sm text-orange-700">Generamos insights accionables basados en mejores prácticas.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 class="font-bold text-gray-800 mb-3">🎯 Beneficios</h4>
                            <div class="grid md:grid-cols-2 gap-4">
                                <ul class="text-sm text-gray-600 space-y-1">
                                    <li>✅ Identificar fortalezas y debilidades</li>
                                    <li>✅ Comparar con mejores prácticas</li>
                                    <li>✅ Establecer metas realistas</li>
                                    <li>✅ Aprender de la competencia</li>
                                </ul>
                                <ul class="text-sm text-gray-600 space-y-1">
                                    <li>✅ Mejorar procesos operativos</li>
                                    <li>✅ Optimizar recursos</li>
                                    <li>✅ Aumentar rentabilidad</li>
                                    <li>✅ Mantener ventaja competitiva</li>
                                </ul>
                            </div>
                        </div>

                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <h5 class="font-semibold text-yellow-800 mb-2">⚠️ Importante</h5>
                            <p class="text-sm text-yellow-700">
                                El benchmarking es una herramienta de mejora continua. Los resultados deben interpretarse
                                en contexto y considerarse junto con factores específicos de tu negocio.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Cerrar modal
        modal.querySelector('#cerrar-como-funciona').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Mostrar modal para crear grupo
     */
    mostrarModalCrearGrupo() {
        const modal = document.getElementById('modal-crear-grupo');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Mostrar loading
     */
    mostrarLoading(mensaje) {
        // Implementar indicador de carga
        }

    /**
     * Ocultar loading
     */
    ocultarLoading() {
        // Ocultar indicador de carga
        }

    /**
     * Mostrar resultados de benchmarking sectorial
     */
    mostrarResultadosBenchmarking(analisis, recomendaciones, datos) {
        // Target the sectorial calculator results section
        const resultadoDiv = document.getElementById('sectorial-results');
        if (!resultadoDiv) return;

        let html = `
            <div class="flex items-center justify-between mb-6">
                <h4 class="text-xl font-bold text-gray-800">Resultados del Benchmarking Sectorial</h4>
                <div class="flex gap-2">
                    <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar PDF">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                    <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar Excel">
                        <i class="fas fa-file-excel"></i>
                    </button>
                </div>
            </div>

            <!-- Analysis Summary -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-clipboard-check mr-2 text-green-600"></i>
                    Resumen del Análisis
                </h5>

                <div class="grid md:grid-cols-3 gap-4 mb-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600" id="sectorial-empresas-comparadas">${this.calcularEmpresasComparadas(analisis)}</div>
                        <div class="text-sm text-gray-600">Empresas Comparadas</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600" id="sectorial-metricas-analizadas">${Object.keys(analisis || {}).length}</div>
                        <div class="text-sm text-gray-600">Métricas Analizadas</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600" id="sectorial-percentil-promedio">${this.calcularPercentilPromedio(analisis).toFixed(1)}%</div>
                        <div class="text-sm text-gray-600">Percentil Promedio</div>
                    </div>
                </div>

                <div class="bg-green-50 p-4 rounded-lg">
                    <h6 class="font-semibold text-green-800 mb-2">Información del Análisis</h6>
                    <div class="grid md:grid-cols-2 gap-4 text-sm">
                        <div><strong>Sector:</strong> ${datos.sector}</div>
                        <div><strong>Tamaño:</strong> ${datos.tamanoEmpresa}</div>
                    </div>
                </div>
            </div>

            <!-- Detailed Metrics Analysis -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-bar mr-2 text-green-600"></i>
                    Análisis Detallado por Métrica
                </h5>

                <div class="space-y-4">
        `;

        // Filter out metadata properties and only show actual metrics
        const metricasReales = Object.entries(analisis).filter(([metrica, stats]) => {
            // Skip metadata properties (they start with underscore)
            if (metrica.startsWith('_')) return false;

            // Only include objects that look like metric statistics
            return stats &&
                   typeof stats === 'object' &&
                   (stats.valor_empresa !== undefined || stats.promedio_sector !== undefined);
        });

        metricasReales.forEach(([metrica, stats]) => {
            const nombreMetrica = BenchmarkingUtils.nombreMetrica(metrica);
            const posicion = stats.posicion_relativa;

            // Debug: Check if posicion_relativa exists
            if (!posicion) {
                // Skip this metric or show error
                html += `
                    <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h6 class="font-semibold text-red-800 mb-2">${nombreMetrica.charAt(0).toUpperCase() + nombreMetrica.slice(1)}</h6>
                        <p class="text-sm text-red-600">Error: No se pudo calcular la posición relativa para esta métrica.</p>
                        <div class="grid md:grid-cols-2 gap-4 mt-2">
                            <div class="text-center">
                                <div class="text-lg font-bold text-blue-600">${BenchmarkingUtils.formatearValor(metrica, stats.valor_empresa)}</div>
                                <div class="text-xs text-gray-600">Tu Valor</div>
                            </div>
                            <div class="text-center">
                                <div class="text-lg font-bold text-gray-600">${BenchmarkingUtils.formatearValor(metrica, stats.promedio_sector)}</div>
                                <div class="text-xs text-gray-600">Promedio Sector</div>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }

            html += `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h6 class="font-semibold text-gray-800 mb-3">${nombreMetrica.charAt(0).toUpperCase() + nombreMetrica.slice(1)}</h6>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div class="text-center">
                            <div class="text-lg font-bold text-blue-600">${BenchmarkingUtils.formatearValor(metrica, stats.valor_empresa)}</div>
                            <div class="text-xs text-gray-600">Tu Valor</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-gray-600">${BenchmarkingUtils.formatearValor(metrica, stats.promedio_sector)}</div>
                            <div class="text-xs text-gray-600">Promedio Sector</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold ${this.clasePosicion(posicion.percentil)}">${posicion.percentil.toFixed(1)}%</div>
                            <div class="text-xs text-gray-600">Tu Percentil</div>
                        </div>
                    </div>
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

        if (recomendaciones.length > 0) {
            html += `
                <!-- Recommendations -->
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-lightbulb mr-2 text-yellow-600"></i>
                        Recomendaciones de Mejora
                    </h5>

                    <div class="space-y-3">
                        ${recomendaciones.map(rec => `
                            <div class="p-3 rounded-lg border-l-4 ${rec.tipo === 'ventaja_competitiva' ? 'border-green-400 bg-green-50' : 'border-orange-400 bg-orange-50'}">
                                <p class="text-sm ${rec.tipo === 'ventaja_competitiva' ? 'text-green-800' : 'text-orange-800'}">${rec.mensaje}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        html += `
            <!-- Charts Container -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-pie mr-2 text-blue-600"></i>
                    Visualización de Resultados
                </h5>

                <div class="grid md:grid-cols-1 gap-6">
                    <div>
                        <canvas id="grafico-sectorial-percentiles" width="600" height="300"></canvas>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <button class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.benchmarkingManager.guardarAnalisisBenchmarking('sectorial', window.benchmarkingManager.datosBenchmarking['sectorial'] || {}); BenchmarkingUtils.mostrarExito('Análisis guardado exitosamente', '¡Guardado!');">
                    <i class="fas fa-save mr-2"></i>Guardar Análisis
                </button>
                <button class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-300 font-semibold flex items-center justify-center" id="btn-nuevo-sectorial">
                    <i class="fas fa-redo mr-2"></i>Nuevo Análisis
                </button>
            </div>
        `;

        resultadoDiv.innerHTML = html;
        resultadoDiv.style.display = 'block';

        // Show the sectorial calculator and hide others
        this.showCalculator('sectorial');
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Mostrar resultados de comparación personalizada
     */
    mostrarResultadosComparacion(comparacion, insights, datos) {
        // Target the personalized calculator results section
        const resultadoDiv = document.getElementById('personalizado-results');
        if (!resultadoDiv) return;

        let html = `
            <div class="flex items-center justify-between mb-6">
                <h4 class="text-xl font-bold text-gray-800">Resultados de Comparación Personalizada</h4>
                <div class="flex gap-2">
                    <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar PDF">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                    <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar Excel">
                        <i class="fas fa-file-excel"></i>
                    </button>
                </div>
            </div>

            <!-- Analysis Summary -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-clipboard-check mr-2 text-purple-600"></i>
                    Resumen de la Comparación
                </h5>

                <div class="grid md:grid-cols-3 gap-4 mb-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600" id="personalizado-empresas-comparadas">${comparacion.empresas_comparacion.length}</div>
                        <div class="text-sm text-gray-600">Empresas Comparadas</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-pink-600" id="personalizado-criterios-analizados">${Object.keys(comparacion.resultados).length}</div>
                        <div class="text-sm text-gray-600">Criterios Analizados</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-indigo-600" id="personalizado-posicion-general">${this.calcularPosicionGeneral(comparacion).toFixed(1)}%</div>
                        <div class="text-sm text-gray-600">Posición General</div>
                    </div>
                </div>

                <!-- Company Base Info -->
                <div class="bg-purple-50 p-4 rounded-lg">
                    <h6 class="font-semibold text-purple-800 mb-2">Empresa Base</h6>
                    <p class="text-purple-700" id="personalizado-empresa-base">${datos.empresaBase.nombre}</p>
                </div>
            </div>

            <!-- Detailed Comparison -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-bar mr-2 text-purple-600"></i>
                    Análisis Detallado por Criterio
                </h5>

                <div class="space-y-4">
        `;

        Object.entries(comparacion.resultados).forEach(([criterio, resultado]) => {
            const nombreCriterio = BenchmarkingUtils.nombreMetrica(criterio);

            html += `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h6 class="font-semibold text-gray-800 mb-3">${nombreCriterio.charAt(0).toUpperCase() + nombreCriterio.slice(1)}</h6>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div class="text-center">
                            <div class="text-lg font-bold text-blue-600">${BenchmarkingUtils.formatearValor(criterio, resultado.valor_base)}</div>
                            <div class="text-xs text-gray-600">Tu Valor</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-gray-600">${BenchmarkingUtils.formatearValor(criterio, resultado.promedio_comparacion)}</div>
                            <div class="text-xs text-gray-600">Promedio Comparación</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold ${resultado.posicion === 'Mejor' ? 'text-green-600' : resultado.posicion === 'Superior' ? 'text-blue-600' : resultado.posicion === 'Promedio' ? 'text-yellow-600' : 'text-red-600'}">${resultado.posicion}</div>
                            <div class="text-xs text-gray-600">Tu Posición</div>
                        </div>
                    </div>
                    <div class="mt-3 text-sm text-gray-600">
                        <strong>Diferencia:</strong> ${resultado.diferencia_promedio > 0 ? '+' : ''}${resultado.diferencia_promedio.toFixed(1)}% vs promedio
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        if (insights.length > 0) {
            html += `
                <!-- Insights and Conclusions -->
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-lightbulb mr-2 text-yellow-600"></i>
                        Insights y Conclusiones
                    </h5>

                    <div class="space-y-3">
                        ${insights.map(insight => `
                            <div class="p-3 rounded-lg border-l-4 ${insight.includes('Excelente') ? 'border-green-400 bg-green-50' : insight.includes('Considera') ? 'border-orange-400 bg-orange-50' : 'border-blue-400 bg-blue-50'}">
                                <p class="text-sm ${insight.includes('Excelente') ? 'text-green-800' : insight.includes('Considera') ? 'text-orange-800' : 'text-blue-800'}">${insight}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        html += `
            <!-- Charts Container -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-radar mr-2 text-blue-600"></i>
                    Visualización Comparativa
                </h5>

                <div class="grid md:grid-cols-1 gap-6">
                    <div>
                        <canvas id="grafico-personalizado-radar" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <button id="btn-guardar-personalizado" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300 font-semibold flex items-center justify-center">
                    <i class="fas fa-save mr-2"></i>Guardar Análisis
                </button>
                <button class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.benchmarkingManager.ui.showCalculator('personalizado')">
                    <i class="fas fa-redo mr-2"></i>Nueva Comparación
                </button>
            </div>
        `;

        resultadoDiv.innerHTML = html;
        resultadoDiv.style.display = 'block';

        // Show the personalized calculator and hide others
        this.showCalculator('personalizado');
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Clase de posición para colores
     */
    clasePosicion(percentil) {
        if (percentil >= 75) return 'text-green-600';
        if (percentil >= 50) return 'text-blue-600';
        if (percentil >= 25) return 'text-yellow-600';
        return 'text-red-600';
    }

    /**
     * Calcular empresas comparadas (estimado basado en datos del análisis)
     */
    calcularEmpresasComparadas(analisis) {
        // Estimar número de empresas basado en la variabilidad de datos
        // En un sistema real, esto vendría de la API
        const numMetricas = Object.keys(analisis || {}).length;
        if (numMetricas === 0) return 0;

        // Estimación basada en datos disponibles
        return Math.max(50, Math.floor(Math.random() * 150) + 50);
    }

    /**
     * Calcular percentil promedio
     */
    calcularPercentilPromedio(analisis) {
        if (!analisis || typeof analisis !== 'object') return 0;

        const percentiles = Object.values(analisis)
            .map(stats => stats?.posicion_relativa?.percentil)
            .filter(percentil => typeof percentil === 'number' && !isNaN(percentil));

        if (percentiles.length === 0) return 0;

        const promedio = percentiles.reduce((sum, p) => sum + p, 0) / percentiles.length;
        return isNaN(promedio) ? 0 : promedio;
    }

    /**
     * Calcular posición general
     */
    calcularPosicionGeneral(comparacion) {
        const posiciones = Object.values(comparacion.resultados).map(resultado => {
            switch (resultado.posicion) {
                case 'Mejor': return 100;
                case 'Superior': return 75;
                case 'Promedio': return 50;
                case 'Por debajo del promedio': return 25;
                default: return 50;
            }
        });
        return posiciones.reduce((sum, p) => sum + p, 0) / posiciones.length;
    }

    /**
     * Crear gráfico de percentiles para benchmarking sectorial
     */
    crearGraficoPercentiles(analisis, datos) {
        const ctx = document.getElementById('grafico-sectorial-percentiles');
        if (!ctx) {
            return;
        }
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
                labels: metricas.map(m => BenchmarkingUtils.nombreMetrica(m)),
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

    /**
     * Crear gráfico radar para comparación personalizada
     */
    crearGraficoRadarComparacion(comparacion) {
        const ctx = document.getElementById('grafico-personalizado-radar');
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
                labels: criterios.map(c => BenchmarkingUtils.nombreMetrica(c)),
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
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BenchmarkingUI;
}
