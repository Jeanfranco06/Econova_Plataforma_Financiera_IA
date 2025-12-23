/**
 * Punto de entrada principal para Benchmarking
 * Módulo principal que coordina todos los componentes
 */

// Importar módulos
// Nota: En un entorno de navegador, usaremos script tags para cargar los módulos
// En un bundler como webpack, usaríamos import statements

/**
 * Clase principal de Benchmarking
 * Coordina todas las funcionalidades del sistema
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

        // Inicializar UI
        this.ui = new BenchmarkingUI();

        // Configurar UI (event listeners y navegación)
        this.ui.setupCalculatorSelection();
        this.ui.setupMetricInputs();
        this.ui.setupGroupManagement();
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
        if (!BenchmarkingUtils.validarDatosBenchmarking(datos)) {
            BenchmarkingUtils.mostrarError('Por favor, complete correctamente los datos.');
            return;
        }

        // Mostrar loading
        this.ui.mostrarLoading('Generando análisis sectorial...');

        try {
            // Obtener datos agregados del sector
            const datosSectoriales = await this.obtenerDatosSectoriales(datos.sector, datos.periodo);

            // Calcular percentiles y estadísticas
            const analisis = this.calcularAnalisisSectorial(datos.metricas, datosSectoriales, datos.tamanoEmpresa);

            // Agregar metadatos del análisis
            analisis._empresasComparadas = datosSectoriales.length;
            analisis._sectorSeleccionado = datos.sector;
            analisis._tamanoEmpresa = datos.tamanoEmpresa;

            // Generar recomendaciones
            const recomendaciones = this.generarRecomendacionesBenchmarking(analisis, datos);

            // Mostrar resultados
            this.ui.mostrarResultadosBenchmarking(analisis, recomendaciones, datos);

            // Crear gráficos comparativos
            setTimeout(() => {
                this.ui.crearGraficoPercentiles(analisis, datos);
            }, 100);

            // Guardar análisis
            this.guardarAnalisisBenchmarking('sectorial', { datos, analisis, recomendaciones });

            // Actualizar historial
            this.cargarHistorialResultados();

            // Disparar evento
            BenchmarkingUtils.dispararEvento('benchmarkingSectorialGenerado', analisis);

        } catch (error) {
            console.error('Error generando benchmarking sectorial:', error);
            BenchmarkingUtils.mostrarError('Error al generar el análisis sectorial. Intente nuevamente.');
        } finally {
            this.ui.ocultarLoading();
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
        if (!BenchmarkingUtils.validarDatosComparacionPersonalizada(datos)) {
            BenchmarkingUtils.mostrarError('Por favor, complete correctamente los datos de comparación.');
            return;
        }

        // Mostrar loading
        this.ui.mostrarLoading('Generando comparación personalizada...');

        try {
            // Realizar comparación
            const comparacion = await this.realizarComparacionPersonalizada(datos);

            // Generar insights
            const insights = this.generarInsightsComparacion(comparacion);

            // Mostrar resultados
            this.ui.mostrarResultadosComparacion(comparacion, insights, datos);

            // Crear gráficos de comparación
            setTimeout(() => {
                this.ui.crearGraficoRadarComparacion(comparacion);
            }, 100);

            // Guardar comparación
            this.guardarAnalisisBenchmarking('personalizada', { datos, comparacion, insights });

            // Actualizar historial
            this.cargarHistorialResultados();

            // Disparar evento
            BenchmarkingUtils.dispararEvento('comparacionPersonalizadaGenerada', comparacion);

        } catch (error) {
            console.error('Error generando comparación personalizada:', error);
            BenchmarkingUtils.mostrarError('Error al generar la comparación. Intente nuevamente.');
        } finally {
            this.ui.ocultarLoading();
        }
    }

    // Resto de métodos delegados a los módulos apropiados...
    // (Implementar todos los métodos necesarios)

    /**
     * Cargar historial de resultados desde localStorage
     */
    cargarHistorialResultados() {
        try {
            const analisisGuardados = BenchmarkingUtils.cargarAnalisisBenchmarking();
            this.mostrarHistorialResultados(analisisGuardados);
        } catch (error) {
            console.error('Error cargando historial de resultados:', error);
        }
    }

    /**
     * Mostrar historial de resultados en la interfaz
     */
    mostrarHistorialResultados(analisisGuardados) {
        const container = document.getElementById('historial-resultados');
        if (!container) return;

        const analisis = Object.values(analisisGuardados);
        if (analisis.length === 0) return;

        let html = '';

        // Ordenar por fecha (más reciente primero)
        analisis.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        analisis.forEach(analisisItem => {
            // Skip incomplete analyses
            if (!analisisItem || (!analisisItem.analisis && !analisisItem.comparacion)) {
                console.warn('⚠️ Análisis incompleto encontrado, omitiendo:', analisisItem?.id);
                return;
            }

            const fecha = new Date(analisisItem.timestamp).toLocaleDateString('es-ES');
            const tipo = analisisItem.datos && analisisItem.datos.sector ? 'Sectorial' : 'Personalizada';

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
                        ${analisisItem.datos && analisisItem.datos.sector ? `
                            <div>
                                <span class="text-sm font-medium text-gray-700">Sector:</span>
                                <span class="text-gray-600 ml-2">${analisisItem.datos.sector || 'N/A'}</span>
                            </div>
                            <div>
                                <span class="text-sm font-medium text-gray-700">Tamaño:</span>
                                <span class="text-gray-600 ml-2">${analisisItem.datos.tamanoEmpresa || 'N/A'}</span>
                            </div>
                        ` : analisisItem.datos && analisisItem.datos.empresaBase ? `
                            <div>
                                <span class="text-sm font-medium text-gray-700">Empresa:</span>
                                <span class="text-gray-600 ml-2">${analisisItem.datos.empresaBase.nombre || 'N/A'}</span>
                            </div>
                            <div>
                                <span class="text-sm font-medium text-gray-700">Comparaciones:</span>
                                <span class="text-gray-600 ml-2">${analisisItem.datos.empresasComparacion ? analisisItem.datos.empresasComparacion.length : 0} empresas</span>
                            </div>
                        ` : `
                            <div>
                                <span class="text-sm font-medium text-gray-700">Tipo:</span>
                                <span class="text-gray-600 ml-2">${tipo}</span>
                            </div>
                            <div>
                                <span class="text-sm font-medium text-gray-700">Estado:</span>
                                <span class="text-gray-600 ml-2">Datos limitados</span>
                            </div>
                        `}
                    </div>

                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-500">
                            ${Object.keys(analisisItem.analisis || analisisItem.comparacion?.resultados || {}).length} métricas analizadas
                        </div>
                        <button class="ver-resultado bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 text-sm"
                                data-analisis-id="${analisisItem.id}">
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
    verResultadoHistorial(analisisId) {
        try {
            const analisisGuardados = BenchmarkingUtils.cargarAnalisisBenchmarking();
            const analisis = Object.values(analisisGuardados).find(a => a.id == analisisId);

            if (analisis) {
                // Cambiar a la pestaña de resultados
                this.ui.showCalculator('resultados');

                // Mostrar el resultado
                if (analisis.analisis) {
                    this.ui.mostrarResultadosBenchmarking(analisis.analisis, analisis.recomendaciones, analisis.datos);
                    setTimeout(() => {
                        this.ui.crearGraficoPercentiles(analisis.analisis, analisis.datos);
                    }, 100);
                } else if (analisis.comparacion) {
                    this.ui.mostrarResultadosComparacion(analisis.comparacion, analisis.insights, analisis.datos);
                    setTimeout(() => {
                        this.ui.crearGraficoRadarComparacion(analisis.comparacion);
                    }, 100);
                }
            }
        } catch (error) {
            console.error('Error cargando resultado del historial:', error);
            BenchmarkingUtils.mostrarError('Error al cargar el resultado');
        }
    }

    /**
     * Guardar análisis en el sistema
     */
    guardarAnalisisBenchmarking(tipo, datos) {
        console.log('💾 BenchmarkingManager guardando análisis:', tipo, datos);
        const resultado = BenchmarkingUtils.guardarAnalisisBenchmarking(tipo, datos);
        console.log('📦 Resultado del guardado:', resultado);

        // Store reference in manager (but don't save to localStorage again)
        this.datosBenchmarking[tipo] = resultado;

        console.log('🏠 Estado actual del manager:', this.datosBenchmarking);
        return resultado;
    }

    /**
     * Cargar grupos de benchmarking disponibles
     */
    async cargarGruposBenchmarking() {
        try {
            console.log('🔍 Cargando grupos de benchmarking...');

            // Obtener todos los grupos disponibles
            const gruposResponse = await fetch('/api/v1/benchmarking/grupos');
            const gruposData = await gruposResponse.json();

            if (!gruposData.success) {
                console.error('❌ Error cargando grupos:', gruposData.error);
                this.mostrarGruposBenchmarking([]);
                return;
            }

            // Obtener grupos del usuario actual
            const usuarioId = BenchmarkingUtils.obtenerUsuarioActual();
            if (!usuarioId) {
                console.warn('⚠️ Usuario no autenticado, mostrando solo grupos disponibles');
                this.mostrarGruposBenchmarking(gruposData.grupos);
                return;
            }

            const usuarioGruposResponse = await fetch(`/api/v1/usuarios/${usuarioId}/benchmarking/grupos`);
            const usuarioGruposData = await usuarioGruposResponse.json();

            let gruposDisponibles = gruposData.grupos;

            // Filtrar grupos donde el usuario ya es miembro
            if (usuarioGruposData.success) {
                const gruposUsuarioIds = usuarioGruposData.grupos.map(g => g.benchmarking_id);
                gruposDisponibles = gruposData.grupos.filter(grupo =>
                    !gruposUsuarioIds.includes(grupo.benchmarking_id)
                );

                // Mostrar grupos del usuario
                this.mostrarGruposUsuario(usuarioGruposData.grupos);
            }

            // Mostrar grupos disponibles
            this.mostrarGruposBenchmarking(gruposDisponibles);

        } catch (error) {
            console.error('❌ Error cargando grupos de benchmarking:', error);
            this.mostrarGruposBenchmarking([]);
        }
    }

    /**
     * Mostrar grupos disponibles en la interfaz
     */
    mostrarGruposBenchmarking(grupos) {
        const container = document.getElementById('grupos-container');
        if (!container) return;

        if (grupos.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8 col-span-2">
                    <i class="fas fa-users text-4xl mb-4"></i>
                    <p>No hay grupos disponibles actualmente.</p>
                    <p class="text-sm">¡Sé el primero en crear un grupo!</p>
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

        // Configurar event listeners para los botones
        this.setupGruposButtons();
    }

    /**
     * Mostrar grupos del usuario en "Mis Grupos"
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
                            ${grupo.miembros || '2 miembros'} <!-- Placeholder, debería venir de la API -->
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

        // Configurar event listeners para los botones de "Mis Grupos"
        this.setupMisGruposButtons();
    }

    /**
     * Configurar event listeners para botones de grupos disponibles
     */
    setupGruposButtons() {
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

    /**
     * Configurar event listeners para botones de "Mis Grupos"
     */
    setupMisGruposButtons() {
        // Botones de ver grupo (miembro)
        document.querySelectorAll('.ver-miembro').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const grupoId = e.target.closest('.ver-miembro').dataset.grupoId;
                this.verGrupo(grupoId);
            });
        });

        // Botones de abandonar grupo
        document.querySelectorAll('.abandonar-grupo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const grupoId = e.target.closest('.abandonar-grupo').dataset.grupoId;
                this.abandonarGrupo(grupoId);
            });
        });
    }

    /**
     * Unirse a un grupo de benchmarking
     */
    async unirseAGrupo(grupoId) {
        try {
            const usuarioId = BenchmarkingUtils.obtenerUsuarioActual();
            if (!usuarioId) {
                BenchmarkingUtils.mostrarError('Debes iniciar sesión para unirte a grupos');
                return;
            }

            const response = await fetch(`/api/v1/benchmarking/grupos/${grupoId}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario_id: usuarioId })
            });

            const data = await response.json();

            if (data.success) {
                BenchmarkingUtils.mostrarExito('Te has unido al grupo exitosamente', '¡Unión Exitosa!');

                // Actualizar UI inmediatamente
                this.actualizarUIUnionGrupo(grupoId);

                // Recargar para asegurar consistencia
                setTimeout(() => {
                    this.cargarGruposBenchmarking();
                }, 1000);

            } else {
                BenchmarkingUtils.mostrarError(data.error || 'Error al unirse al grupo');
            }
        } catch (error) {
            console.error('Error uniendo al grupo:', error);
            BenchmarkingUtils.mostrarError('Error al unirse al grupo');
        }
    }

    /**
     * Abandonar un grupo de benchmarking
     */
    async abandonarGrupo(grupoId) {
        if (!confirm('¿Estás seguro de que quieres abandonar este grupo?')) {
            return;
        }

        try {
            const usuarioId = BenchmarkingUtils.obtenerUsuarioActual();
            if (!usuarioId) {
                BenchmarkingUtils.mostrarError('Debes iniciar sesión');
                return;
            }

            const response = await fetch(`/api/v1/benchmarking/grupos/${grupoId}/usuarios/${usuarioId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                BenchmarkingUtils.mostrarExito('Has abandonado el grupo exitosamente', 'Grupo Abandonado');

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
                BenchmarkingUtils.mostrarError(data.error || 'Error al abandonar el grupo');
            }
        } catch (error) {
            console.error('Error abandonando el grupo:', error);
            BenchmarkingUtils.mostrarError('Error al abandonar el grupo');
        }
    }

    /**
     * Ver detalles de un grupo
     */
    async verGrupo(grupoId) {
        try {
            const response = await fetch(`/api/v1/benchmarking/grupos/${grupoId}`);
            const data = await response.json();

            if (data.success) {
                this.mostrarDetalleGrupo(data.grupo, data.usuarios);
            } else {
                BenchmarkingUtils.mostrarError(data.error || 'Error al cargar el grupo');
            }
        } catch (error) {
            console.error('Error cargando grupo:', error);
            BenchmarkingUtils.mostrarError('Error al cargar el grupo');
        }
    }

    /**
     * Actualizar UI después de unirse a un grupo
     */
    actualizarUIUnionGrupo(grupoId) {
        // Encontrar y remover el grupo de la lista de disponibles
        const gruposContainer = document.getElementById('grupos-container');
        const grupoButton = gruposContainer.querySelector(`[data-grupo-id="${grupoId}"]`);

        if (grupoButton) {
            // Encontrar la card del grupo
            const grupoCard = grupoButton.closest('.bg-white');

            if (grupoCard) {
                // Obtener información del grupo antes de removerlo
                const grupoInfo = {
                    id: grupoId,
                    nombre: grupoCard.querySelector('h3').textContent,
                    descripcion: grupoCard.querySelector('p').textContent,
                    miembros: '2 miembros' // Placeholder
                };

                // Remover de grupos disponibles
                grupoCard.remove();

                // Verificar si quedan grupos disponibles
                const remainingGroups = gruposContainer.querySelectorAll('.bg-white');
                if (remainingGroups.length === 0) {
                    gruposContainer.innerHTML = `
                        <div class="text-center text-gray-500 py-8 col-span-2">
                            <i class="fas fa-users text-4xl mb-4"></i>
                            <p>No hay más grupos disponibles.</p>
                            <p>¡Sé el primero en crear un grupo!</p>
                        </div>
                    `;
                }

                // Agregar a "Mis Grupos"
                this.agregarGrupoAMisGrupos(grupoInfo);
            }
        }
    }

    /**
     * Agregar grupo a "Mis Grupos" en la UI
     */
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

    /**
     * Mostrar modal con detalles del grupo
     */
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
                                    ${usuario.nombre_usuario ? usuario.nombre_usuario.charAt(0).toUpperCase() : '?'}
                                </div>
                                <span class="text-gray-700">${usuario.nombre_usuario || 'Usuario'}</span>
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

    /**
     * Crear un nuevo grupo de benchmarking
     */
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
                BenchmarkingUtils.mostrarExito('Grupo creado exitosamente');
                document.getElementById('modal-crear-grupo').classList.add('hidden');
                form.reset();
                this.cargarGruposBenchmarking(); // Recargar grupos
            } else {
                BenchmarkingUtils.mostrarError(data.error || 'Error al crear el grupo');
            }
        } catch (error) {
            console.error('Error creando grupo:', error);
            BenchmarkingUtils.mostrarError('Error al crear el grupo');
        }
    }

    // Métodos de cálculo (implementaciones básicas)
    async obtenerDatosSectoriales(sector, periodo) {
        // Simular datos sectoriales
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
            }
        };

        const datosSector = datosBase[sector] || datosBase['Tecnología'];
        return this.generarDistribucionDatos(datosSector, 100);
    }

    generarDistribucionDatos(datosBase, nEmpresas) {
        const datos = [];

        for (let i = 0; i < nEmpresas; i++) {
            const variacion = (Math.random() - 0.5) * 0.4;

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

    calcularAnalisisSectorial(metricasEmpresa, datosSectoriales, tamanoEmpresa) {
        const analisis = {};

        let datosFiltrados = datosSectoriales;
        if (tamanoEmpresa !== 'todos') {
            datosFiltrados = this.filtrarPorTamanoEmpresa(datosSectoriales, tamanoEmpresa);
        }

        Object.entries(metricasEmpresa).forEach(([metrica, valor]) => {
            if (datosFiltrados.length > 0) {
                const valoresSector = datosFiltrados.map(d => d[metrica]).filter(v => v !== undefined);

                if (valoresSector.length > 0) {
                    analisis[metrica] = {
                        valor_empresa: valor,
                        promedio_sector: BenchmarkingUtils.calcularPromedio(valoresSector),
                        mediana_sector: BenchmarkingUtils.calcularMediana(valoresSector),
                        percentil_25: BenchmarkingUtils.calcularPercentil(valoresSector, 25),
                        percentil_75: BenchmarkingUtils.calcularPercentil(valoresSector, 75),
                        percentil_90: BenchmarkingUtils.calcularPercentil(valoresSector, 90),
                        minimo: Math.min(...valoresSector),
                        maximo: Math.max(...valoresSector),
                        desviacion_estandar: BenchmarkingUtils.calcularDesviacionEstandar(valoresSector),
                        posicion_relativa: this.calcularPosicionRelativa(valor, valoresSector)
                    };
                }
            }
        });

        return analisis;
    }

    filtrarPorTamanoEmpresa(datos, tamano) {
        const rangos = {
            'micro': d => d.empleados <= 10,
            'pequena': d => d.empleados > 10 && d.empleados <= 50,
            'mediana': d => d.empleados > 50 && d.empleados <= 200,
            'grande': d => d.empleados > 200
        };

        const filtro = rangos[tamano];
        return filtro ? datos.filter(filtro) : datos;
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

    generarRecomendacionesBenchmarking(analisis, datos) {
        const recomendaciones = [];

        Object.entries(analisis).forEach(([metrica, stats]) => {
            // Skip if stats is incomplete
            if (!stats || typeof stats !== 'object') {
                console.warn('⚠️ Estadísticas incompletas para métrica:', metrica);
                return;
            }

            const { valor_empresa, percentil_25, percentil_75, posicion_relativa } = stats;

            // Basic recommendations based on percentiles (if available)
            if (typeof valor_empresa === 'number' && typeof percentil_25 === 'number') {
                if (valor_empresa < percentil_25) {
                    recomendaciones.push({
                        tipo: 'oportunidad_mejora',
                        metrica: metrica,
                        mensaje: `Tu ${BenchmarkingUtils.nombreMetrica(metrica)} está por debajo del 25% inferior del sector. Considera estrategias para mejorar esta métrica.`,
                        acciones: ['Revisar procesos operativos', 'Implementar mejores prácticas', 'Buscar asesoramiento especializado']
                    });
                } else if (typeof percentil_75 === 'number' && valor_empresa > percentil_75) {
                    recomendaciones.push({
                        tipo: 'ventaja_competitiva',
                        metrica: metrica,
                        mensaje: `¡Excelente! Tu ${BenchmarkingUtils.nombreMetrica(metrica)} está en el 25% superior del sector.`,
                        acciones: ['Mantener las buenas prácticas', 'Compartir conocimientos con el sector', 'Considerar expansión']
                    });
                }
            }

            // Advanced recommendations based on relative position (if available)
            if (posicion_relativa && typeof posicion_relativa.percentil === 'number') {
                if (posicion_relativa.percentil < 50) {
                    recomendaciones.push({
                        tipo: 'benchmarking',
                        metrica: metrica,
                        mensaje: `Benchmarking: Estudia las mejores prácticas de empresas en el percentil superior para ${BenchmarkingUtils.nombreMetrica(metrica)}.`,
                        acciones: ['Analizar casos de éxito', 'Implementar mejores prácticas', 'Buscar mentoría']
                    });
                }
            }
        });

        return recomendaciones;
    }

    async realizarComparacionPersonalizada(datos) {
        const { empresaBase, empresasComparacion, criteriosComparacion } = datos;

        const datosComparacion = await this.obtenerDatosEmpresasComparacion(empresasComparacion);

        const comparacion = {
            empresa_base: empresaBase,
            empresas_comparacion: datosComparacion,
            criterios: criteriosComparacion,
            resultados: {}
        };

        criteriosComparacion.forEach(criterio => {
            comparacion.resultados[criterio] = this.compararCriterio(
                empresaBase.metricas[criterio],
                datosComparacion.map(emp => emp.metricas[criterio])
            );
        });

        return comparacion;
    }

    async obtenerDatosEmpresasComparacion(empresas) {
        return empresas.map((empresa, index) => ({
            nombre: empresa.nombre,
            metricas: {
                ingresos: empresa.metricas.ingresos * (0.8 + Math.random() * 0.4),
                margen_beneficio: empresa.metricas.margen_beneficio * (0.9 + Math.random() * 0.2),
                roi: empresa.metricas.roi * (0.85 + Math.random() * 0.3),
                empleados: Math.round(empresa.metricas.empleados * (0.9 + Math.random() * 0.2))
            }
        }));
    }

    compararCriterio(valorBase, valoresComparacion) {
        const promedioComparacion = BenchmarkingUtils.calcularPromedio(valoresComparacion);
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
        const sorted = [...valores, valor].sort((a, b) => b - a);
        const posicion = sorted.indexOf(valor) + 1;
        const total = sorted.length;

        if (posicion === 1) return 'Mejor';
        if (posicion <= total * 0.33) return 'Superior';
        if (posicion <= total * 0.67) return 'Promedio';
        return 'Por debajo del promedio';
    }

    generarInsightsComparacion(comparacion) {
        const insights = [];

        Object.entries(comparacion.resultados).forEach(([criterio, resultado]) => {
            const nombreCriterio = BenchmarkingUtils.nombreMetrica(criterio);
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
    // Cargar módulos primero (en entorno navegador con script tags)
    // En producción, esto sería manejado por un bundler

    // Crear instancia principal
    window.benchmarkingManager = new BenchmarkingManager();
    console.log('🔍 Gestor de Benchmarking inicializado');
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BenchmarkingManager;
}
