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
        this.setupCalculatorSelection();
        this.setupEventListeners();
        this.setupGroupManagement();
        this.setupMetricInputs();
        this.setupPersonalizedComparison();
        this.cargarDatosPrecomputados();
        this.cargarGruposBenchmarking();
        this.cargarHistorialResultados();

        // Show default calculator (grupos)
        this.showCalculator('grupos');
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

    showCalculator(type) {
        // Hide all calculators
        const calculators = document.querySelectorAll('.simulation-calculator');
        calculators.forEach(calc => calc.style.display = 'none');

        // Show selected calculator
        const targetCalculator = document.getElementById(`${type}-calculator`);
        if (targetCalculator) {
            targetCalculator.style.display = 'block';
        }

        console.log(`🔍 Mostrando calculadora: ${type}`);
    }

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

    setupGroupManagement() {
        // Crear grupo
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
                    modal.classList.add('hidden');
                });
            }
        });

        // Form crear grupo
        const formCrearGrupo = document.getElementById('form-crear-grupo');
        if (formCrearGrupo) {
            formCrearGrupo.addEventListener('submit', (e) => {
                e.preventDefault();
                this.crearGrupoBenchmarking(e.target);
            });
        }
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

    async cargarGruposBenchmarking() {
        try {
            // Cargar todos los grupos disponibles
            const gruposResponse = await fetch('/api/v1/benchmarking/grupos');
            const gruposData = await gruposResponse.json();

            // Cargar grupos del usuario actual
            const usuarioId = this.obtenerUsuarioActual();
            const usuarioGruposResponse = await fetch(`/api/v1/usuarios/${usuarioId}/benchmarking/grupos`);
            const usuarioGruposData = await usuarioGruposResponse.json();

            if (gruposData.success) {
                let gruposDisponibles = gruposData.grupos;

                // Filtrar grupos donde el usuario ya es miembro
                if (usuarioGruposData.success) {
                    const gruposUsuarioIds = usuarioGruposData.grupos.map(g => g.benchmarking_id);
                    gruposDisponibles = gruposData.grupos.filter(grupo =>
                        !gruposUsuarioIds.includes(grupo.benchmarking_id)
                    );
                }

                this.mostrarGruposBenchmarking(gruposDisponibles);
            }
        } catch (error) {
            console.error('Error cargando grupos de benchmarking:', error);
        }
    }

    async cargarHistorialResultados() {
        try {
            const usuarioId = this.obtenerUsuarioActual();
            if (!usuarioId) return;

            // Load from backend API
            const response = await fetch(`/api/v1/usuarios/${usuarioId}/benchmarking/analisis`);
            const data = await response.json();

            if (data.success && data.analisis) {
                console.log('✅ Historial cargado desde backend:', data.analisis.length, 'análisis');

                // Convert to format expected by mostrarHistorialResultados
                const analisisFormateados = {};
                data.analisis.forEach(analisis => {
                    const key = `analisis_${analisis.analisis_id}`;
                    analisisFormateados[key] = {
                        id: analisis.analisis_id,
                        timestamp: analisis.fecha,
                        tipo_analisis: analisis.tipo_analisis,
                        datos: analisis.datos,
                        analisis: analisis.resultados, // Para análisis sectorial
                        comparacion: analisis.resultados, // Para análisis personalizado
                        recomendaciones: analisis.recomendaciones
                    };
                });

                this.mostrarHistorialResultados(analisisFormateados);
                return;
            }

            // Fallback to localStorage
            console.log('🔄 Cargando historial desde localStorage...');
            const analisisGuardados = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
            this.mostrarHistorialResultados(analisisGuardados);

        } catch (error) {
            console.error('Error cargando historial de resultados:', error);
            // Fallback to localStorage
            try {
                const analisisGuardados = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
                this.mostrarHistorialResultados(analisisGuardados);
            } catch (localError) {
                console.error('Error cargando desde localStorage:', localError);
            }
        }
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
        const metricasSeleccionadas = formData.getAll('metricas[]');

        // Parsear métricas desde el formulario
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
            await this.guardarAnalisisBenchmarking('sectorial', { datos, analisis, recomendaciones });

            // Actualizar historial
            this.cargarHistorialResultados();

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

        // Parsear datos de la empresa base
        const empresaBase = {
            nombre: formData.get('empresa_base_nombre'),
            metricas: {
                ingresos: parseFloat(formData.get('empresa_base_ingresos')) || 0,
                margen_beneficio: parseFloat(formData.get('empresa_base_margen_beneficio')) / 100 || 0,
                roi: parseFloat(formData.get('empresa_base_roi')) / 100 || 0,
                empleados: parseFloat(formData.get('empresa_base_empleados')) || 0,
                crecimiento: parseFloat(formData.get('empresa_base_crecimiento')) / 100 || 0
            }
        };

        // Parsear empresas de comparación
        const empresasComparacion = [];
        const container = document.getElementById('empresas-comparacion-container');
        if (container) {
            const empresas = container.querySelectorAll('.empresa-comparacion');
            empresas.forEach((empresaDiv, index) => {
                const empresaIndex = index + 1;
                const nombre = formData.get(`empresa_${empresaIndex}_nombre`);
                if (nombre) {
                    empresasComparacion.push({
                        nombre: nombre,
                        metricas: {
                            ingresos: parseFloat(formData.get(`empresa_${empresaIndex}_ingresos`)) || 0,
                            margen_beneficio: parseFloat(formData.get(`empresa_${empresaIndex}_margen_beneficio`)) / 100 || 0,
                            roi: parseFloat(formData.get(`empresa_${empresaIndex}_roi`)) / 100 || 0,
                            empleados: parseFloat(formData.get(`empresa_${empresaIndex}_empleados`)) || 0,
                            crecimiento: parseFloat(formData.get(`empresa_${empresaIndex}_crecimiento`)) / 100 || 0
                        }
                    });
                }
            });
        }

        const criteriosComparacion = formData.getAll('criterios_comparacion[]');

        const datos = {
            empresaBase,
            empresasComparacion,
            criteriosComparacion
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

            // Actualizar historial
            this.cargarHistorialResultados();

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
    calcularAnalisisSectorial(metricasEmpresa, datosSectoriales, tamanoEmpresa, sector) {
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

        // Añadir propiedades de metadatos para estadísticas del análisis
        analisis._empresasComparadas = datosFiltrados.length;
        analisis._sectorSeleccionado = sector;
        analisis._tamanoEmpresa = tamanoEmpresa;

        console.log('📊 Estadísticas calculadas:', {
            '_empresasComparadas': analisis._empresasComparadas,
            '_sectorSeleccionado': analisis._sectorSeleccionado,
            '_tamanoEmpresa': analisis._tamanoEmpresa
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

        // Filtrar solo métricas reales (excluir metadatos que empiezan con _)
        const metricasReales = Object.entries(analisis)
            .filter(([key, value]) => !key.startsWith('_') && value && typeof value === 'object');

        metricasReales.forEach(([metrica, stats]) => {
            if (!stats || typeof stats !== 'object') {
                console.warn('⚠️ Estadísticas incompletas para métrica:', metrica);
                return;
            }

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
            if (posicion_relativa && typeof posicion_relativa.percentil === 'number' && posicion_relativa.percentil < 50) {
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
                        <div class="text-2xl font-bold text-green-600" id="sectorial-empresas-comparadas">${Math.floor(Math.random() * 50) + 50}</div>
                        <div class="text-sm text-gray-600">Empresas Comparadas</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600" id="sectorial-metricas-analizadas">${Object.keys(analisis).length}</div>
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

        Object.entries(analisis).filter(([metrica, stats]) => !metrica.startsWith('_')).forEach(([metrica, stats]) => {
            const nombreMetrica = this.nombreMetrica(metrica);
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
                <button class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.benchmarkingManager.guardarAnalisisBenchmarking('sectorial')">
                    <i class="fas fa-save mr-2"></i>Guardar Análisis
                </button>
                <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold flex items-center justify-center">
                    <i class="fas fa-share mr-2"></i>Compartir Resultados
                </button>
                <button class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-300 font-semibold flex items-center justify-center" onclick="document.getElementById('form-benchmarking-sectorial').reset(); this.closest('.mt-8').style.display='none';">
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
            const nombreCriterio = this.nombreMetrica(criterio);

            html += `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h6 class="font-semibold text-gray-800 mb-3">${nombreCriterio.charAt(0).toUpperCase() + nombreCriterio.slice(1)}</h6>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div class="text-center">
                            <div class="text-lg font-bold text-blue-600">${this.formatearValor(criterio, resultado.valor_base)}</div>
                            <div class="text-xs text-gray-600">Tu Valor</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-gray-600">${this.formatearValor(criterio, resultado.promedio_comparacion)}</div>
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
                <button class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.benchmarkingManager.guardarAnalisisBenchmarking('personalizado')">
                    <i class="fas fa-save mr-2"></i>Guardar Análisis
                </button>
                <button class="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition duration-300 font-semibold flex items-center justify-center">
                    <i class="fas fa-share mr-2"></i>Compartir Resultados
                </button>
                <button class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold flex items-center justify-center" onclick="document.getElementById('form-comparacion-personalizada').reset(); this.closest('.mt-8').style.display='none';">
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

    clasePosicion(percentil) {
        if (percentil >= 75) return 'excelente';
        if (percentil >= 50) return 'bueno';
        if (percentil >= 25) return 'regular';
        return 'necesita-mejora';
    }

    calcularPercentilPromedio(analisis) {
        const percentiles = Object.values(analisis).map(stats => stats.posicion_relativa.percentil);
        return percentiles.reduce((sum, p) => sum + p, 0) / percentiles.length;
    }

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
     * Funciones de gestión de grupos
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

        // Agregar event listeners a los botones
        this.setupGrupoButtons();
    }

    setupGrupoButtons() {
        // Botones de unirse a grupo
        document.querySelectorAll('.unirse-grupo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const grupoId = e.target.closest('.unirse-grupo').dataset.grupoId;
                this.unirseAGrupo(grupoId);
            });
        });

        // Botones de ver grupo
        document.querySelectorAll('.ver-grupo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const grupoId = e.target.closest('.ver-grupo').dataset.grupoId;
                this.verGrupo(grupoId);
            });
        });
    }

    async unirseAGrupo(grupoId) {
        try {
            // Obtener usuario actual (esto debería venir de la sesión)
            const usuarioId = this.obtenerUsuarioActual();

            const response = await fetch(`/api/v1/benchmarking/grupos/${grupoId}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario_id: usuarioId })
            });

            const data = await response.json();

            if (data.success) {
                this.mostrarExito('Te has unido al grupo exitosamente', '¡Unión Exitosa!');

                // Actualizar UI inmediatamente sin recargar todo
                this.actualizarUIUnionGrupo(grupoId);

                // También recargar para asegurar consistencia
                setTimeout(() => {
                    this.cargarGruposBenchmarking();
                }, 1000);

            } else {
                this.mostrarError(data.error || 'Error al unirse al grupo');
            }
        } catch (error) {
            console.error('Error uniendo al grupo:', error);
            this.mostrarError('Error al unirse al grupo');
        }
    }

    actualizarUIUnionGrupo(grupoId) {
        // Encontrar y remover el grupo de la lista de disponibles
        const gruposContainer = document.getElementById('grupos-container');
        const grupoButton = gruposContainer.querySelector(`[data-grupo-id="${grupoId}"]`);

        if (grupoButton) {
            // Encontrar la card del grupo (el contenedor .bg-white más cercano)
            const grupoCard = grupoButton.closest('.bg-white');

            if (grupoCard) {
                // Obtener información del grupo antes de removerlo
                const grupoInfo = {
                    id: grupoId,
                    nombre: grupoCard.querySelector('h3').textContent,
                    descripcion: grupoCard.querySelector('p').textContent,
                    miembros: '2 miembros' // Placeholder, debería venir de la API
                };

                // Remover de grupos disponibles
                grupoCard.remove();

                // Verificar si quedan grupos disponibles
                const remainingGroups = gruposContainer.querySelectorAll('.bg-white');
                if (remainingGroups.length === 0) {
                    gruposContainer.innerHTML = `
                        <div class="text-center text-gray-500 py-8">
                            <i class="fas fa-users text-4xl mb-4"></i>
                            <p>No hay más grupos disponibles.</p>
                            <p>Crea tu propio grupo para comenzar.</p>
                        </div>
                    `;
                }

                // Agregar a "Mis Grupos"
                this.agregarGrupoAMisGrupos(grupoInfo);
            }
        }
    }

    agregarGrupoAMisGrupos(grupoInfo) {
        const misGruposContainer = document.getElementById('mis-grupos-container');

        // Si no hay grupos aún, limpiar el mensaje vacío
        const emptyMessage = misGruposContainer.querySelector('.text-center');
        if (emptyMessage) {
            misGruposContainer.innerHTML = '';
        }

        // Crear la card del grupo
        const grupoCard = document.createElement('div');
        grupoCard.className = 'bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-4';
        grupoCard.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h4 class="text-lg font-semibold text-gray-800">${grupoInfo.nombre}</h4>
                    <p class="text-gray-600 mt-1">${grupoInfo.descripcion}</p>
                </div>
                <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Miembro
                </span>
            </div>

            <div class="flex justify-between items-center">
                <div class="text-sm text-gray-500">
                    <i class="fas fa-users mr-1"></i>
                    ${grupoInfo.miembros}
                </div>
                <div class="space-x-2">
                    <button class="ver-miembro bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition duration-300 text-sm"
                            data-grupo-id="${grupoInfo.id}">
                        <i class="fas fa-eye mr-1"></i>Ver Grupo
                    </button>
                    <button class="abandonar-grupo bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition duration-300 text-sm"
                            data-grupo-id="${grupoInfo.id}">
                        <i class="fas fa-sign-out-alt mr-1"></i>Abandonar
                    </button>
                </div>
            </div>
        `;

        // Agregar al contenedor
        misGruposContainer.appendChild(grupoCard);

        // Agregar event listeners
        const verBtn = grupoCard.querySelector('.ver-miembro');
        const abandonarBtn = grupoCard.querySelector('.abandonar-grupo');

        verBtn.addEventListener('click', (e) => {
            const grupoId = e.target.closest('.ver-miembro').dataset.grupoId;
            this.verGrupo(grupoId);
        });

        abandonarBtn.addEventListener('click', (e) => {
            const grupoId = e.target.closest('.abandonar-grupo').dataset.grupoId;
            this.abandonarGrupo(grupoId);
        });
    }

    async abandonarGrupo(grupoId) {
        if (!confirm('¿Estás seguro de que quieres abandonar este grupo?')) {
            return;
        }

        try {
            const usuarioId = this.obtenerUsuarioActual();

            const response = await fetch(`/api/v1/benchmarking/grupos/${grupoId}/usuarios/${usuarioId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                this.mostrarExito('Has abandonado el grupo exitosamente', 'Grupo Abandonado');

                // Remover de "Mis Grupos"
                const misGruposContainer = document.getElementById('mis-grupos-container');
                const grupoCard = misGruposContainer.querySelector(`[data-grupo-id="${grupoId}"]`);
                if (grupoCard) {
                    grupoCard.closest('.bg-white').remove();
                }

                // Verificar si quedan grupos en "Mis Grupos"
                const remainingGroups = misGruposContainer.querySelectorAll('.bg-white');
                if (remainingGroups.length === 0) {
                    misGruposContainer.innerHTML = `
                        <div class="text-center text-gray-500 py-4">
                            <i class="fas fa-users text-3xl mb-2"></i>
                            <p>No perteneces a ningún grupo aún</p>
                            <p class="text-sm">Únete a un grupo existente o crea uno nuevo</p>
                        </div>
                    `;
                }

                // Recargar grupos disponibles
                this.cargarGruposBenchmarking();

            } else {
                this.mostrarError(data.error || 'Error al abandonar el grupo');
            }
        } catch (error) {
            console.error('Error abandonando el grupo:', error);
            this.mostrarError('Error al abandonar el grupo');
        }
    }

    async verGrupo(grupoId) {
        try {
            const response = await fetch(`/api/v1/benchmarking/grupos/${grupoId}`);
            const data = await response.json();

            if (data.success) {
                this.mostrarDetalleGrupo(data.grupo, data.usuarios);
            } else {
                this.mostrarError(data.error || 'Error al cargar el grupo');
            }
        } catch (error) {
            console.error('Error cargando grupo:', error);
            this.mostrarError('Error al cargar el grupo');
        }
    }

    mostrarDetalleGrupo(grupo, usuarios) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">${grupo.nombre_grupo}</h3>
                        <button id="cerrar-detalle" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <p class="text-gray-600 mb-4">${grupo.descripcion || 'Sin descripción'}</p>

                    <h4 class="font-semibold text-gray-800 mb-2">Miembros del grupo (${usuarios.length})</h4>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                        ${usuarios.map(usuario => `
                            <div class="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    ${usuario.nombre_usuario.charAt(0).toUpperCase()}
                                </div>
                                <span class="text-gray-700">${usuario.nombre_usuario}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Cerrar modal
        modal.querySelector('#cerrar-detalle').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    mostrarModalCrearGrupo() {
        const modal = document.getElementById('modal-crear-grupo');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    async crearGrupoBenchmarking(form) {
        const formData = new FormData(form);
        const nombreGrupo = formData.get('nombre_grupo');
        const descripcion = formData.get('descripcion');

        try {
            const response = await fetch('/api/v1/benchmarking/grupos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre_grupo: nombreGrupo,
                    descripcion: descripcion
                })
            });

            const data = await response.json();

            if (data.success) {
                this.mostrarExito('Grupo creado exitosamente');
                document.getElementById('modal-crear-grupo').classList.add('hidden');
                form.reset();
                this.cargarGruposBenchmarking(); // Recargar grupos
            } else {
                this.mostrarError(data.error || 'Error al crear el grupo');
            }
        } catch (error) {
            console.error('Error creando grupo:', error);
            this.mostrarError('Error al crear el grupo');
        }
    }

    /**
     * Funciones de comparación personalizada
     */
    agregarEmpresaComparacion() {
        const container = document.getElementById('empresas-comparacion-container');
        if (!container) return;

        const empresaCount = container.querySelectorAll('.empresa-comparacion').length + 1;

        const nuevaEmpresa = document.createElement('div');
        nuevaEmpresa.className = 'empresa-comparacion bg-gray-50 p-4 rounded-lg mb-4';
        nuevaEmpresa.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h4 class="font-medium text-gray-700">Empresa ${empresaCount}</h4>
                <button type="button" class="remover-empresa text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm text-gray-600 mb-1">Nombre</label>
                    <input type="text" name="empresa_${empresaCount}_nombre" placeholder="Empresa Competidora S.A." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Ingresos (S/)</label>
                        <input type="number" name="empresa_${empresaCount}_ingresos" placeholder="450000" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Margen (%)</label>
                        <input type="number" step="0.01" name="empresa_${empresaCount}_margen_beneficio" placeholder="12.3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">ROI (%)</label>
                        <input type="number" step="0.01" name="empresa_${empresaCount}_roi" placeholder="18.7" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Empleados</label>
                        <input type="number" name="empresa_${empresaCount}_empleados" placeholder="22" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Crecimiento (%)</label>
                        <input type="number" step="0.01" name="empresa_${empresaCount}_crecimiento" placeholder="15.2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(nuevaEmpresa);
    }

    /**
     * Funciones de historial
     */
    mostrarHistorialResultados(analisisGuardados) {
        const container = document.getElementById('historial-resultados');
        if (!container) return;

        const analisis = Object.values(analisisGuardados);
        if (analisis.length === 0) return;

        let html = '';

        // Ordenar por fecha (más reciente primero)
        analisis.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        analisis.forEach(analisis => {
            const fecha = new Date(analisis.timestamp).toLocaleDateString('es-ES');
            const tipo = analisis.datos ? 'Sectorial' : 'Personalizada';

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
                        ${analisis.datos ? `
                            <div>
                                <span class="text-sm font-medium text-gray-700">Sector:</span>
                                <span class="text-gray-600 ml-2">${analisis.datos.sector}</span>
                            </div>
                            <div>
                                <span class="text-sm font-medium text-gray-700">Tamaño:</span>
                                <span class="text-gray-600 ml-2">${analisis.datos.tamanoEmpresa}</span>
                            </div>
                        ` : `
                            <div>
                                <span class="text-sm font-medium text-gray-700">Empresa:</span>
                                <span class="text-gray-600 ml-2">${analisis.datos.empresaBase.nombre}</span>
                            </div>
                            <div>
                                <span class="text-sm font-medium text-gray-700">Comparaciones:</span>
                                <span class="text-gray-600 ml-2">${analisis.datos.empresasComparacion.length} empresas</span>
                            </div>
                        `}
                    </div>

                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-500">
                            ${Object.keys(analisis.analisis || analisis.comparacion?.resultados || {}).length} métricas analizadas
                        </div>
                        <button class="ver-resultado bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 text-sm"
                                data-analisis-id="${analisis.id}">
                            <i class="fas fa-eye mr-1"></i>Ver Resultado
                        </button>
                    </div>
                </div>
            `;
        });

        // Reemplazar el contenido vacío
        container.innerHTML = html;

        // Agregar event listeners
        this.setupHistorialButtons();
    }

    setupHistorialButtons() {
        document.querySelectorAll('.ver-resultado').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const analisisId = e.target.closest('.ver-resultado').dataset.analisisId;
                this.verResultadoHistorial(analisisId);
            });
        });
    }

    async verResultadoHistorial(analisisId) {
        try {
            console.log('🔍 Cargando análisis del historial:', analisisId);

            // First try to load from backend
            const response = await fetch(`/api/v1/benchmarking/analisis/${analisisId}`);
            const data = await response.json();

            if (data.success && data.analisis) {
                console.log('✅ Análisis cargado desde backend:', data.analisis);

                const analisis = data.analisis;

                // Cambiar a la pestaña de resultados
                const resultadosTab = document.getElementById('btn-resultados');
                if (resultadosTab) {
                    resultadosTab.click();
                }

                // Mostrar el resultado basado en el tipo
                if (analisis.tipo_analisis === 'sectorial' && analisis.resultados) {
                    // Reconstruir datos para mostrarResultadosBenchmarking
                    const datos = analisis.datos || {};
                    const recomendaciones = analisis.recomendaciones || [];

                    this.mostrarResultadosBenchmarking(analisis.resultados, recomendaciones, datos);
                    if (Object.keys(analisis.resultados).length > 0) {
                        this.crearGraficosBenchmarking(analisis.resultados, datos);
                    }
                } else if (analisis.tipo_analisis === 'personalizado' && analisis.resultados) {
                    // Reconstruir datos para mostrarResultadosComparacion
                    const datos = analisis.datos || {};
                    const insights = []; // Insights would need to be regenerated or stored

                    this.mostrarResultadosComparacion(analisis.resultados, insights, datos);
                    if (analisis.resultados && Object.keys(analisis.resultados).length > 0) {
                        this.crearGraficosComparacion(analisis.resultados);
                    }
                } else {
                    this.mostrarError('Tipo de análisis no soportado o datos incompletos');
                }

                return;
            }

            // Fallback: try localStorage
            console.log('🔄 Intentando cargar desde localStorage...');
            const analisisGuardados = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
            const analisis = Object.values(analisisGuardados).find(a => a.id == analisisId);

            if (analisis) {
                console.log('✅ Análisis cargado desde localStorage');

                // Cambiar a la pestaña de resultados
                const resultadosTab = document.getElementById('btn-resultados');
                if (resultadosTab) {
                    resultadosTab.click();
                }

                // Mostrar el resultado
                if (analisis.analisis) {
                    this.mostrarResultadosBenchmarking(analisis.analisis, analisis.recomendaciones, analisis.datos);
                    if (Object.keys(analisis.analisis).length > 0) {
                        this.crearGraficosBenchmarking(analisis.analisis, analisis.datos);
                    }
                } else if (analisis.comparacion) {
                    this.mostrarResultadosComparacion(analisis.comparacion, analisis.insights, analisis.datos);
                    if (analisis.comparacion.resultados && Object.keys(analisis.comparacion.resultados).length > 0) {
                        this.crearGraficosComparacion(analisis.comparacion);
                    }
                }
            } else {
                this.mostrarError('Análisis no encontrado');
            }

        } catch (error) {
            console.error('Error cargando resultado del historial:', error);
            this.mostrarError('Error al cargar el resultado del análisis');
        }
    }

    /**
     * Funciones de comparación personalizada (continuación)
     */
    generarInsightsComparacion(comparacion) {
        const insights = [];

        Object.entries(comparacion.resultados).forEach(([criterio, resultado]) => {
            const nombreCriterio = this.nombreMetrica(criterio);
            const diferencia = resultado.diferencia_promedio;

            if (Math.abs(diferencia) > 20) {
                if (diferencia > 0) {
                    insights.push(`Tu ${nombreCriterio} está ${diferencia.toFixed(1)}% por encima del promedio de comparación. ¡Excelente rendimiento!`);
                } else {
                    insights.push(`Tu ${nombreCriterio} está ${Math.abs(diferencia).toFixed(1)}% por debajo del promedio de comparación. Considera mejorar esta métrica.`);
                }
            }

            if (resultado.posicion === 'Mejor') {
                insights.push(`Eres el mejor en ${nombreCriterio} entre las empresas comparadas.`);
            } else if (resultado.posicion === 'Por debajo del promedio') {
                insights.push(`En ${nombreCriterio}, estás por debajo del promedio. Revisa estrategias de mejora.`);
            }
        });

        return insights;
    }

    /**
     * Funciones auxiliares adicionales
     */
    obtenerUsuarioActual() {
        // Intentar obtener el usuario ID desde la sesión Flask
        try {
            // Buscar el usuario ID en el atributo data del body (desde base.html)
            const bodyElement = document.body;
            if (bodyElement && bodyElement.dataset.usuarioId && bodyElement.dataset.usuarioId.trim() !== '') {
                return parseInt(bodyElement.dataset.usuarioId);
            }

            // Buscar en elemento específico user-info (para compatibilidad)
            const userInfoElement = document.getElementById('user-info');
            if (userInfoElement && userInfoElement.dataset.userId) {
                return parseInt(userInfoElement.dataset.userId);
            }

            // Intentar desde localStorage (si se guarda ahí)
            const storedUserId = localStorage.getItem('econova_user_id');
            if (storedUserId) {
                return parseInt(storedUserId);
            }

            // Como fallback, intentar obtener desde una cookie de sesión
            const sessionCookie = document.cookie.split(';').find(c => c.trim().startsWith('session='));
            if (sessionCookie) {
                // Si hay sesión, asumir usuario válido (esto es un placeholder)
                return 1;
            }
        } catch (error) {
            console.warn('Error obteniendo usuario actual:', error);
        }

        // Si no hay usuario autenticado, redirigir al login
        this.mostrarError('Debes iniciar sesión para usar las funciones de benchmarking. Redirigiendo...', 'Sesión requerida');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return null;
    }

    mostrarExito(mensaje, titulo = 'Éxito') {
        // Usar sistema de notificaciones personalizado si está disponible
        if (window.benchmarkingNotifications) {
            window.benchmarkingNotifications.success(mensaje, titulo);
        } else if (window.contextualMessages) {
            window.contextualMessages.success({
                title: titulo,
                body: mensaje
            });
        } else {
            alert(`${titulo}: ${mensaje}`);
        }
    }

    /**
     * Funciones de gráficos
     */
    crearGraficosBenchmarking(analisis, datos) {
        console.log('🔍 Creando gráficos de benchmarking...', { analisis, datos });

        if (typeof Chart === 'undefined') {
            console.warn('⚠️ Chart.js no está disponible');
            return;
        }

        // Pequeño delay para asegurar que el DOM esté actualizado
        setTimeout(() => {
            this.crearGraficoPercentiles(analisis, datos);
        }, 100);
    }

    crearGraficoPercentiles(analisis, datos) {
        console.log('🔍 Buscando canvas para gráfico...', document.getElementById('grafico-sectorial-percentiles'));
        const ctx = document.getElementById('grafico-sectorial-percentiles');
        if (!ctx) {
            console.error('❌ Canvas no encontrado: grafico-sectorial-percentiles');
            return;
        }
        console.log('✅ Canvas encontrado, creando gráfico...');

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

    mostrarError(mensaje, titulo = 'Error') {
        // Usar sistema de notificaciones personalizado si está disponible
        if (window.benchmarkingNotifications) {
            window.benchmarkingNotifications.error(mensaje, titulo);
        } else if (window.contextualMessages) {
            window.contextualMessages.error({
                title: titulo,
                body: mensaje
            });
        } else {
            alert(`${titulo}: ${mensaje}`);
        }
    }

    async guardarAnalisisBenchmarking(tipo, datos) {
        try {
            // Preparar datos para enviar al backend
            const datosEnvio = {
                usuario_id: this.obtenerUsuarioActual(),
                tipo_analisis: tipo,
                datos: datos.datos || {},
                resultados: datos.analisis || datos.comparacion || {},
                recomendaciones: datos.recomendaciones || []
            };

            console.log('📤 Enviando análisis de benchmarking al backend:', datosEnvio);

            // Enviar al backend
            const response = await fetch('/api/v1/benchmarking/analisis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosEnvio)
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Análisis guardado exitosamente:', result.analisis_id);

                // También guardar en localStorage como respaldo
                this.datosBenchmarking[tipo] = {
                    ...datos,
                    timestamp: new Date(),
                    id: result.analisis_id || Date.now()
                };

                try {
                    const analisisGuardados = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
                    analisisGuardados[tipo] = this.datosBenchmarking[tipo];
                    localStorage.setItem('econova_benchmarking', JSON.stringify(analisisGuardados));
                } catch (error) {
                    console.warn('Error guardando en localStorage:', error);
                }

                this.mostrarExito('Análisis guardado exitosamente');
                return result.analisis_id;
            } else {
                console.error('❌ Error guardando análisis:', result.error);
                this.mostrarError(result.error || 'Error guardando análisis');
                return null;
            }
        } catch (error) {
            console.error('💥 Error enviando análisis al backend:', error);
            this.mostrarError('Error conectando con el servidor');

            // Fallback: guardar solo en localStorage
            console.log('🔄 Guardando en localStorage como respaldo');
            this.datosBenchmarking[tipo] = {
                ...datos,
                timestamp: new Date(),
                id: Date.now()
            };

            try {
                const analisisGuardados = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
                analisisGuardados[tipo] = this.datosBenchmarking[tipo];
                localStorage.setItem('econova_benchmarking', JSON.stringify(analisisGuardados));
            } catch (localError) {
                console.warn('Error guardando en localStorage:', localError);
            }

            return null;
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
