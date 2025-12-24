/**
 * Gestor Principal del Sistema de Benchmarking
 * Coordina todos los módulos y funcionalidades
 */

// Importar módulos (en entorno browser se cargan vía script tags)
/*
<script src="/static/js/benchmarking/core/benchmarking-core.js"></script>
<script src="/static/js/benchmarking/ui/benchmarking-ui.js"></script>
<script src="/static/js/benchmarking/utils/benchmarking-utils.js"></script>
<script src="/static/js/benchmarking/benchmarking-manager.js"></script>
*/

class BenchmarkingManager {
    constructor() {
        console.log('🔍 Inicializando BenchmarkingManager...');

        // Inicializar módulos
        this.core = new BenchmarkingCore();
        this.ui = new BenchmarkingUI();
        this.utils = new BenchmarkingUtils();

        // Estado del sistema
        this.datosBenchmarking = {};
        this.historialAnalisis = {};

        // Inicializar sistema
        this.init();
    }

    init() {
        console.log('🔍 Módulo de Benchmarking inicializado');

        // Configurar UI
        this.ui.setupCalculatorSelection();
        this.ui.setupEventListeners();
        this.ui.setupGroupManagement();
        this.ui.setupMetricInputs();
        this.ui.setupPersonalizedComparison();

        // Configurar event listeners del manager
        this.setupEventListeners();

        // Cargar datos iniciales
        this.cargarGruposBenchmarking();
        this.cargarHistorialResultados();

        // Mostrar calculadora por defecto
        this.ui.showCalculator('grupos');
    }

    setupEventListeners() {
        // Usar delegación de eventos para evitar múltiples listeners
        document.addEventListener('submit', this.handleFormSubmission.bind(this), { once: false });
    }

    handleFormSubmission(e) {
        // Solo procesar formularios de benchmarking
        if (!e.target.id.includes('benchmarking')) {
            return;
        }

        e.preventDefault();

        // Deshabilitar el botón inmediatamente para evitar múltiples clics
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...';
        }

        // Verificar si ya se está procesando
        if (this.isProcessing) {
            console.log('⏳ Ya se está procesando, ignorando envío duplicado...');
            return;
        }

        this.isProcessing = true;
        console.log('🚀 Procesando formulario:', e.target.id);

        try {
            if (e.target.id === 'form-benchmarking-sectorial') {
                this.generarBenchmarkingSectorial(e.target);
            }
        } catch (error) {
            console.error('❌ Error procesando formulario:', error);
            this.isProcessing = false;
            // Rehabilitar botón en caso de error
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-chart-bar mr-2"></i>Generar Análisis Sectorial';
            }
        }
    }

    /**
     * Generar análisis sectorial
     */
    async generarBenchmarkingSectorial(form) {
        const formData = new FormData(form);
        const metricasSeleccionadas = formData.getAll('metricas[]');

        // Parsear métricas
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

        // Validar
        if (!this.utils.validarDatosBenchmarking(datos)) {
            this.ui.mostrarError('Por favor, complete correctamente los datos.');
            return;
        }

        // Loading
        this.ui.mostrarLoading('Generando análisis sectorial...');

        try {
            // Generar análisis usando el core
            const analisis = await this.core.generarAnalisisSectorial(
                datos.metricas,
                datos.sector,
                datos.tamanoEmpresa
            );

            // Generar recomendaciones
            const recomendaciones = this.core.generarRecomendaciones(analisis, datos);

            // Mostrar resultados
            this.ui.mostrarResultadosBenchmarking(analisis, recomendaciones, datos);

            // Crear gráficos
            setTimeout(() => {
                this.ui.crearGraficoPercentiles(analisis, datos);
            }, 100);

            // NO guardar automáticamente - solo mostrar mensaje de éxito
            this.ui.mostrarExito('Análisis sectorial completado exitosamente');

        } catch (error) {
            console.error('Error generando benchmarking sectorial:', error);
            this.ui.mostrarError('Error al generar el análisis sectorial.');
        } finally {
            this.ui.ocultarLoading();
            this.isProcessing = false; // Reset flag

            // Re-habilitar el botón después del procesamiento
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-chart-bar mr-2"></i>Generar Análisis Sectorial';
            }
        }
    }

    /**
     * Generar comparación personalizada
     */
    async generarComparacionPersonalizada(form) {
        const formData = new FormData(form);

        // Parsear datos de empresa base
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

        // Validar
        if (!this.utils.validarDatosComparacionPersonalizada(datos)) {
            this.ui.mostrarError('Por favor, complete correctamente los datos de comparación.');
            return;
        }

        // Loading
        this.ui.mostrarLoading('Generando comparación personalizada...');

        try {
            // Realizar comparación
            const comparacion = await this.core.realizarComparacionPersonalizada(datos);

            // Generar insights
            const insights = this.core.generarInsightsComparacion(comparacion);

            // Mostrar resultados
            this.ui.mostrarResultadosComparacion(comparacion, insights, datos);

            // Crear gráficos
            setTimeout(() => {
                this.ui.crearGraficoRadarComparacion(comparacion);
            }, 100);

            // Guardar comparación
            this.guardarAnalisisBenchmarking('personalizada', { datos, comparacion, insights });

            // Actualizar historial
            this.cargarHistorialResultados();

            this.ui.mostrarExito('Comparación personalizada completada exitosamente');

        } catch (error) {
            console.error('Error generando comparación personalizada:', error);
            this.ui.mostrarError('Error al generar la comparación.');
        } finally {
            this.ui.ocultarLoading();
            this.isProcessing = false; // Reset flag
        }
    }

    /**
     * Guardar análisis
     */
    async guardarAnalisisBenchmarking(tipo, datos) {
        try {
            const resultado = await this.utils.guardarAnalisisBenchmarking(tipo, datos);
            this.datosBenchmarking[tipo] = resultado;
            console.log('💾 Análisis guardado:', resultado);
            // No mostrar mensaje de éxito aquí para evitar duplicados
            return resultado;
        } catch (error) {
            console.error('Error guardando análisis:', error);
            throw error;
        }
    }

    /**
     * Cargar historial
     */
    async cargarHistorialResultados() {
        try {
            const analisisGuardados = this.utils.cargarAnalisisBenchmarking();
            this.ui.mostrarHistorialResultados(analisisGuardados);
        } catch (error) {
            console.error('Error cargando historial:', error);
        }
    }

    /**
     * Cargar grupos de benchmarking
     */
    async cargarGruposBenchmarking() {
        try {
            console.log('🔍 Cargando grupos de benchmarking...');

            const gruposResponse = await fetch('/api/v1/benchmarking/grupos');
            const gruposData = await gruposResponse.json();

            if (!gruposData.success) {
                console.error('❌ Error cargando grupos:', gruposData.error);
                return;
            }

            const usuarioId = this.utils.obtenerUsuarioActual();
            let gruposDisponibles = gruposData.grupos;

            if (usuarioId) {
                const usuarioGruposResponse = await fetch(`/api/v1/usuarios/${usuarioId}/benchmarking/grupos`);
                const usuarioGruposData = await usuarioGruposResponse.json();

                if (usuarioGruposData.success) {
                    const gruposUsuarioIds = usuarioGruposData.grupos.map(g => g.benchmarking_id);
                    gruposDisponibles = gruposData.grupos.filter(grupo =>
                        !gruposUsuarioIds.includes(grupo.benchmarking_id)
                    );

                    this.ui.mostrarGruposUsuario(usuarioGruposData.grupos);
                }
            }

            this.ui.mostrarGruposBenchmarking(gruposDisponibles);

        } catch (error) {
            console.error('❌ Error cargando grupos:', error);
            this.ui.mostrarGruposBenchmarking([]);
        }
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

// Inicialización global
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando carga de módulos de benchmarking v3.0 FINAL...');

    // Verificar que todos los módulos estén cargados
    const checkModules = () => {
        if (typeof BenchmarkingCore !== 'undefined' &&
            typeof BenchmarkingUI !== 'undefined' &&
            typeof BenchmarkingUtils !== 'undefined') {

            window.benchmarkingManager = new BenchmarkingManager();
            console.log('🎉 Gestor de Benchmarking modular v3.0 FINAL inicializado correctamente');
            console.log('📊 Sistema listo para análisis sectorial');
            console.log('🔧 PROBLEMAS DEFINITIVAMENTE CORREGIDOS:');
            console.log('   ✅ Mensajes duplicados ELIMINADOS');
            console.log('   ✅ Inputs pequeños (w-32)');
            console.log('   ✅ Placeholders correctos (10000 ingresos)');
            console.log('   ✅ Opciones análisis FUNCIONALES');
            console.log('   ✅ Gráfica TODAS las métricas visibles');
            console.log('   ✅ Botón guardar SIEMPRE visible');
            console.log('   ✅ Endeudamiento incluido');
            console.log('   ✅ Recomendaciones visibles');
            console.log('   ✅ Caché FORZADO completamente');
            console.log('   ✅ Procesamiento seguro');
        } else {
            console.error('❌ Error: Módulos de benchmarking no están cargados correctamente');
            console.log('Módulos disponibles:', {
                BenchmarkingCore: typeof BenchmarkingCore,
                BenchmarkingUI: typeof BenchmarkingUI,
                BenchmarkingUtils: typeof BenchmarkingUtils
            });
        }
    };

    // Pequeño delay para asegurar carga completa
    setTimeout(checkModules, 100);
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BenchmarkingManager;
}
