// Resultados page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabSimulaciones = document.getElementById('tab-simulaciones');
    const tabBenchmarking = document.getElementById('tab-benchmarking');
    const simulacionesFilters = document.getElementById('simulaciones-filters');
    const benchmarkingHeader = document.getElementById('benchmarking-header');
    const benchmarkingResults = document.getElementById('benchmarking-results');

    // Tab switching
    tabSimulaciones.addEventListener('click', function() {
        // Update tab styles
        tabSimulaciones.classList.remove('border-transparent', 'text-gray-500');
        tabSimulaciones.classList.add('border-blue-500', 'text-blue-600');
        tabBenchmarking.classList.remove('border-blue-500', 'text-blue-600');
        tabBenchmarking.classList.add('border-transparent', 'text-gray-500');

        // Show simulations, hide benchmarking
        simulacionesFilters.classList.remove('hidden');
        benchmarkingHeader.classList.add('hidden');
        benchmarkingResults.classList.add('hidden');

        // Show simulation results (hide benchmarking results)
        document.querySelectorAll('.grid.gap-6 > div:not(#benchmarking-results)').forEach(card => {
            if (!card.id.includes('benchmarking')) {
                card.style.display = 'block';
            }
        });
    });

    tabBenchmarking.addEventListener('click', function() {
        // Update tab styles
        tabBenchmarking.classList.remove('border-transparent', 'text-gray-500');
        tabBenchmarking.classList.add('border-blue-500', 'text-blue-600');
        tabSimulaciones.classList.remove('border-blue-500', 'text-blue-600');
        tabSimulaciones.classList.add('border-transparent', 'text-gray-500');

        // Hide simulations, show benchmarking
        simulacionesFilters.classList.add('hidden');
        benchmarkingHeader.classList.remove('hidden');
        benchmarkingResults.classList.remove('hidden');

        // Hide simulation results, load benchmarking results
        document.querySelectorAll('.grid.gap-6 > div:not(#benchmarking-results)').forEach(card => {
            card.style.display = 'none';
        });

        // Always refresh benchmarking results when tab becomes active
        console.log('🔄 Refrescando datos de benchmarking al activar pestaña');
        loadBenchmarkingResults();
    });

    // Benchmarking update button
    const btnActualizarBenchmarking = document.getElementById('btn-actualizar-benchmarking');
    if (btnActualizarBenchmarking) {
        btnActualizarBenchmarking.addEventListener('click', function() {
            loadBenchmarkingResults();
        });
    }

    // Simulation filtering functionality
    const filterType = document.getElementById('filter-type');
    const filterDate = document.getElementById('filter-date');
    // Only select cards that have the 'bg-white rounded-2xl shadow-xl p-6' class (simulation cards)
    const simulationCards = document.querySelectorAll('.grid.gap-6 > div.bg-white.rounded-2xl.shadow-xl.p-6');

    // Function to filter simulations
    function filterSimulations() {
        const typeFilter = filterType.value.toLowerCase();
        const dateFilter = filterDate.value;

        simulationCards.forEach(card => {
            // Skip the "no results" card
            if (card.querySelector('h3') && card.querySelector('h3').textContent.includes('No tienes simulaciones')) {
                return;
            }

            let showCard = true;

            // Filter by type
            if (typeFilter) {
                // Get the simulation type from the data attribute or title
                // The title contains the tipo_simulacion value
                const titleElement = card.querySelector('h3');
                let simulationType = '';

                if (titleElement) {
                    simulationType = titleElement.textContent.toLowerCase().trim();
                }

                // Direct match against the filter value
                // The title should contain the tipo_simulacion like "VAN", "TIR", etc.
                showCard = simulationType.includes(typeFilter) ||
                          simulationType.includes(typeFilter.toUpperCase());
            }

            // Filter by date
            if (dateFilter && showCard) {
                const dateElement = card.querySelector('p.text-gray-600.text-sm');
                if (dateElement) {
                    const dateText = dateElement.textContent;
                    const now = new Date();
                    let cardDate = null;

                    // Try to parse the date from the text
                    // The date format is "Realizado el YYYY-MM-DD HH:MM:SS"
                    const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2})/);
                    if (dateMatch) {
                        cardDate = new Date(dateMatch[1]);
                    }

                    if (cardDate) {
                        const diffTime = now - cardDate;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        switch (dateFilter) {
                            case 'today':
                                showCard = diffDays <= 1;
                                break;
                            case 'week':
                                showCard = diffDays <= 7;
                                break;
                            case 'month':
                                showCard = diffDays <= 30;
                                break;
                            case 'year':
                                showCard = diffDays <= 365;
                                break;
                        }
                    }
                }
            }

            // Show/hide card
            card.style.display = showCard ? 'block' : 'none';
        });

        // Update statistics if they exist
        updateStatistics();
    }

    // Function to update statistics based on all user simulations
    function updateStatistics() {
        // Get all simulation data from the template elements
        const simulationElements = document.querySelectorAll('.grid.gap-6 > div.bg-white.rounded-2xl.shadow-xl.p-6');
        const allSimulations = [];

        simulationElements.forEach(element => {
            const detailButton = element.querySelector('.ver-detalles-btn');
            if (detailButton && detailButton.dataset.simulacionData) {
                try {
                    const simulationData = JSON.parse(detailButton.dataset.simulacionData);
                    allSimulations.push(simulationData);
                } catch (e) {
                    console.warn('Error parsing simulation data:', e);
                }
            }
        });

        if (allSimulations.length === 0) {
            // Fallback: count from visible cards if no backend data
            const visibleCards = Array.from(simulationCards).filter(card => {
                return card.style.display !== 'none' &&
                       !card.querySelector('h3')?.textContent.includes('No tienes simulaciones');
            });

            const totalStat = document.querySelector('.grid.md\\:grid-cols-4 > div:nth-child(1) .text-2xl');
            if (totalStat) {
                totalStat.textContent = visibleCards.length;
            }

            // Reset other stats
            const viableStat = document.querySelector('.grid.md\\:grid-cols-4 > div:nth-child(2) .text-2xl');
            const revisionStat = document.querySelector('.grid.md\\:grid-cols-4 > div:nth-child(3) .text-2xl');
            const noViableStat = document.querySelector('.grid.md\\:grid-cols-4 > div:nth-child(4) .text-2xl');

            if (viableStat) viableStat.textContent = '0';
            if (revisionStat) revisionStat.textContent = '0';
            if (noViableStat) noViableStat.textContent = '0';

            return;
        }

        // Calculate real statistics from user data
        let viableCount = 0;
        let revisionCount = 0;
        let noViableCount = 0;

        allSimulations.forEach(simulacion => {
            if (simulacion.resultados) {
                // Check decision based on VAN or similar metric
                const van = simulacion.resultados.van;
                const tir = simulacion.resultados.tir;
                const decision = simulacion.resultados.decision;

                if (decision === 'viable' || decision === 'Viable') {
                    viableCount++;
                } else if (decision === 'no_viable' || decision === 'No Viable') {
                    noViableCount++;
                } else if (van !== undefined && van !== null) {
                    // Fallback: determine based on VAN value
                    if (van > 0) {
                        viableCount++;
                    } else {
                        noViableCount++;
                    }
                } else {
                    // No clear decision, count as in review
                    revisionCount++;
                }
            } else {
                // No results, count as in review
                revisionCount++;
            }
        });

        // Update statistics display
        const totalStat = document.querySelector('.grid.md\\:grid-cols-4 > div:nth-child(1) .text-2xl');
        const viableStat = document.querySelector('.grid.md\\:grid-cols-4 > div:nth-child(2) .text-2xl');
        const revisionStat = document.querySelector('.grid.md\\:grid-cols-4 > div:nth-child(3) .text-2xl');
        const noViableStat = document.querySelector('.grid.md\\:grid-cols-4 > div:nth-child(4) .text-2xl');

        if (totalStat) totalStat.textContent = allSimulations.length;
        if (viableStat) viableStat.textContent = viableCount;
        if (revisionStat) revisionStat.textContent = revisionCount;
        if (noViableStat) noViableStat.textContent = noViableCount;
    }

    // Add event listeners
    if (filterType) {
        filterType.addEventListener('change', filterSimulations);
    }

    if (filterDate) {
        filterDate.addEventListener('change', filterSimulations);
    }

    // Initialize statistics on page load
    updateStatistics();

    // Add event listeners for "Ver Detalles" buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.ver-detalles-btn')) {
            const button = e.target.closest('.ver-detalles-btn');
            const simulacionId = button.getAttribute('data-simulacion-id');
            showSimulationDetails(simulacionId);
        }
    });

    // Function to show simulation details
    function showSimulationDetails(simulacionId) {
        // Find the button with the simulation data
        const button = document.querySelector(`[data-simulacion-id="${simulacionId}"]`);
        if (button) {
            const dataAttribute = button.getAttribute('data-simulacion-data');
            if (dataAttribute) {
                try {
                    const simulationData = JSON.parse(dataAttribute);
                    showDetailsModal(simulationData);
                } catch (e) {
                    console.error('Error parsing simulation data:', e);
                }
            }
        }
    }

    // Function to show details modal
    function showDetailsModal(data) {
        // Remove existing modal if any
        const existingModal = document.getElementById('simulation-details-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Format date
        let formattedDate = 'Fecha no disponible';
        if (data.fecha) {
            try {
                const date = new Date(data.fecha);
                formattedDate = date.toLocaleString('es-ES');
            } catch (e) {
                formattedDate = data.fecha;
            }
        }

        // Create results HTML
        let resultsHTML = '';
        if (data.resultados && Object.keys(data.resultados).length > 0) {
            const resultItems = [];
            Object.entries(data.resultados).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    let displayValue = value;
                    let label = key.toUpperCase();

                    // Format specific financial metrics
                    if (key === 'van' && typeof value === 'number') {
                        displayValue = `S/ ${value.toLocaleString('es-ES', {maximumFractionDigits: 0})}`;
                        label = 'VAN Calculado';
                    } else if (key === 'tir' && typeof value === 'number') {
                        displayValue = `${value.toFixed(1)}%`;
                        label = 'TIR';
                    } else if (key === 'wacc_porcentaje' && typeof value === 'number') {
                        displayValue = `${value.toFixed(1)}%`;
                        label = 'WACC';
                    } else if (key === 'wacc' && typeof value === 'number') {
                        displayValue = `${(value * 100).toFixed(1)}%`;
                        label = 'WACC';
                    } else if (key === 'payback' && typeof value === 'number') {
                        displayValue = `${value.toFixed(1)} años`;
                        label = 'Periodo Recuperación';
                    } else if (key === 'rendimiento' && typeof value === 'number') {
                        displayValue = `${value.toFixed(1)}%`;
                        label = 'Rendimiento Esperado';
                    } else if (key === 'riesgo' && typeof value === 'number') {
                        displayValue = `${value.toFixed(1)}%`;
                        label = 'Riesgo (Volatilidad)';
                    } else if (typeof value === 'number') {
                        displayValue = value.toLocaleString('es-ES');
                    }

                    resultItems.push(`
                        <div class="bg-white border border-gray-200 p-4 rounded-lg">
                            <div class="text-sm text-gray-600 mb-1">${label}</div>
                            <div class="text-xl font-bold text-gray-800">${displayValue}</div>
                        </div>
                    `);
                }
            });
            resultsHTML = `<div class="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">${resultItems.join('')}</div>`;
        } else {
            resultsHTML = '<p class="text-gray-600">No hay resultados disponibles para esta simulación.</p>';
        }

        // Create parameters HTML
        let paramsHTML = '';
        if (data.parametros && Object.keys(data.parametros).length > 0) {
            const paramItems = [];
            Object.entries(data.parametros).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    let displayValue = value;
                    if (Array.isArray(value)) {
                        if (value.length === 0) {
                            displayValue = '(vacío)';
                        } else if (typeof value[0] === 'object' && value[0] !== null) {
                            // Array of objects (like activos)
                            if (key === 'activos') {
                                displayValue = `${value.length} activos configurados`;
                            } else {
                                displayValue = `${value.length} elementos`;
                            }
                        } else {
                            // Regular array
                            displayValue = value.join(', ');
                        }
                    } else if (typeof value === 'number') {
                        displayValue = value.toLocaleString('es-ES');
                    } else if (typeof value === 'object') {
                        // Handle objects
                        displayValue = JSON.stringify(value, null, 2);
                    }
                    paramItems.push(`<li class="text-sm"><strong>${key}:</strong> ${displayValue}</li>`);
                }
            });
            if (paramItems.length > 0) {
                paramsHTML = `
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-green-800 mb-2">Parámetros de la Simulación</h4>
                        <ul class="text-green-700 space-y-1" style="max-height: 160px; overflow-y: auto; word-wrap: break-word; font-size: 14px; line-height: 1.6;">${paramItems.join('')}</ul>
                    </div>
                `;
            }
        }

        // Create modal HTML
        const modalHTML = `
            <div id="simulation-details-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-gray-800">Detalles de Simulación</h2>
                            <button id="close-modal" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div class="space-y-4">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h3 class="font-semibold text-lg text-gray-800 mb-2">${data.nombre || data.title}</h3>
                                <p class="text-gray-600 text-sm">Realizado el ${formattedDate}</p>
                                <span class="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                    ${data.tipo_simulacion || data.type}
                                </span>
                            </div>

                            ${paramsHTML}

                            <div class="bg-white border border-gray-200 p-4 rounded-lg">
                                <h4 class="font-semibold text-gray-800 mb-4">Resultados</h4>
                                ${resultsHTML}
                            </div>

                            <div class="bg-blue-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-blue-800 mb-2">Información Adicional</h4>
                                <p class="text-blue-700 text-sm">
                                    <strong>ID de Simulación:</strong> ${data.id}<br>
                                    Esta simulación fue realizada con parámetros específicos de análisis financiero.
                                    Los resultados mostrados son calculados automáticamente por el sistema.
                                </p>
                            </div>
                        </div>

                        <div class="flex justify-end gap-3 mt-6">
                            <button id="close-modal-bottom" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners for closing modal
        document.getElementById('close-modal').addEventListener('click', () => {
            document.getElementById('simulation-details-modal').remove();
        });

        document.getElementById('close-modal-bottom').addEventListener('click', () => {
            document.getElementById('simulation-details-modal').remove();
        });

        // Close modal when clicking outside
        document.getElementById('simulation-details-modal').addEventListener('click', (e) => {
            if (e.target.id === 'simulation-details-modal') {
                document.getElementById('simulation-details-modal').remove();
            }
        });
    }

    // Function to load and display benchmarking results
    function loadBenchmarkingResults() {
        console.log('📊 Cargando resultados de benchmarking...');

        try {
            // Get benchmarking data from localStorage (same key used by BenchmarkingUtils)
            const analisisGuardados = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
            // Handle different data structures - now only unique keys, but support legacy type keys
            const analisis = [];

            Object.entries(analisisGuardados).forEach(([key, value]) => {
                if (value && typeof value === 'object' && value.id) {
                    // Check if it's a complete analysis (has id and either analisis or comparacion)
                    if (value.analisis || value.comparacion) {
                        // Complete analysis object
                        analisis.push(value);
                    } else if (value.timestamp) {
                        // Partial analysis - might be from an incomplete save
                        console.warn('⚠️ Análisis incompleto encontrado:', value.id, value);
                        // Still include it but mark it for potential issues
                        analisis.push(value);
                    }
                }
            });

            console.log('📋 Análisis encontrados:', analisis.length, analisis);
            console.log('🔍 Estructura localStorage completa:', Object.keys(analisisGuardados));
            Object.entries(analisisGuardados).forEach(([key, value]) => {
                console.log(`   ${key}:`, value?.id || 'sin ID', value?.analisis ? 'completo' : value?.comparacion ? 'completo' : 'incompleto');
            });

            const benchmarkingResultsContainer = document.getElementById('benchmarking-results');
            const emptyState = document.getElementById('benchmarking-empty-state');

            // Clear all existing results first
            const allExistingCards = benchmarkingResultsContainer.querySelectorAll('.bg-white.rounded-2xl');
            allExistingCards.forEach(card => card.remove());

            if (analisis.length === 0) {
                // Show empty state
                if (emptyState) {
                    benchmarkingResultsContainer.appendChild(emptyState);
                    emptyState.style.display = 'block';
                }
                return;
            }

            // Hide empty state if it exists
            if (emptyState) {
                emptyState.style.display = 'none';
            }

            // Sort by date (most recent first)
            analisis.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Filter out duplicates (same ID) - important because saving creates both unique key and type key
            const uniqueAnalisis = [];
            const seenIds = new Set();

            analisis.forEach(item => {
                if (item.id && !seenIds.has(item.id)) {
                    seenIds.add(item.id);
                    uniqueAnalisis.push(item);
                } else if (item.id && seenIds.has(item.id)) {
                    console.warn('🔄 Duplicado encontrado y omitido:', item.id);
                }
            });

            console.log('🔄 Análisis únicos:', uniqueAnalisis.length);

            // Create result cards
            uniqueAnalisis.forEach(analisisItem => {
                const fecha = new Date(analisisItem.timestamp).toLocaleDateString('es-ES');
                const tipo = analisisItem.datos ? 'Sectorial' : 'Personalizada';
                const hasCompleteData = analisisItem.analisis || analisisItem.comparacion;

                let resultHTML = '';

                if (analisisItem.analisis) {
                    // Sectorial analysis
                    const stats = analisisItem.analisis;
                    resultHTML = `
                        <div class="grid md:grid-cols-3 gap-4 mb-4">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-green-600">${calcularEmpresasComparadas(stats)}</div>
                                <div class="text-sm text-gray-600">Empresas Comparadas</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-blue-600">${analisisItem.numeroMetricas || Object.keys(stats).filter(k => !k.startsWith('_')).length}</div>
                                <div class="text-sm text-gray-600">Métricas Analizadas</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-purple-600">${calcularPercentilPromedio(stats).toFixed(1)}%</div>
                                <div class="text-sm text-gray-600">Percentil Promedio</div>
                            </div>
                        </div>
                        <div class="bg-green-50 p-4 rounded-lg">
                            <h6 class="font-semibold text-green-800 mb-2">Información del Análisis</h6>
                            <div class="grid md:grid-cols-2 gap-4 text-sm">
                                <div><strong>Sector:</strong> ${analisisItem.sector || analisisItem.datos?.sector || 'No disponible'}</div>
                                <div><strong>Tamaño:</strong> ${analisisItem.tamanoEmpresa || analisisItem.datos?.tamanoEmpresa || 'No disponible'}</div>
                            </div>
                        </div>
                    `;
                } else if (analisisItem.comparacion) {
                    // Personalized comparison
                    const comparacion = analisisItem.comparacion;
                    resultHTML = `
                        <div class="grid md:grid-cols-3 gap-4 mb-4">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-purple-600">${comparacion.empresas_comparacion.length}</div>
                                <div class="text-sm text-gray-600">Empresas Comparadas</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-pink-600">${Object.keys(comparacion.resultados).length}</div>
                                <div class="text-sm text-gray-600">Criterios Analizados</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-indigo-600">${calcularPosicionGeneral(comparacion).toFixed(1)}%</div>
                                <div class="text-sm text-gray-600">Posición General</div>
                            </div>
                        </div>
                        <div class="bg-purple-50 p-4 rounded-lg">
                            <h6 class="font-semibold text-purple-800 mb-2">Empresa Base</h6>
                            <p class="text-purple-700">${analisisItem.datos.empresaBase.nombre}</p>
                        </div>
                    `;
                } else {
                    // Incomplete analysis
                    resultHTML = `
                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <h6 class="font-semibold text-yellow-800 mb-2">Análisis Incompleto</h6>
                            <p class="text-yellow-700 text-sm">Este análisis no tiene datos completos y no se puede mostrar detalles.</p>
                        </div>
                    `;
                }

                const cardHTML = `
                    <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
                        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">Análisis de Benchmarking ${tipo}</h3>
                                <p class="text-gray-600 text-sm">Realizado el ${fecha}</p>
                                ${!hasCompleteData ? '<p class="text-yellow-600 text-sm font-medium">⚠️ Análisis incompleto</p>' : ''}
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="px-3 py-1 rounded-full text-sm font-semibold ${tipo === 'Sectorial' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}">
                                    ${tipo}
                                </span>
                                ${hasCompleteData ? `
                                    <button class="text-blue-600 hover:text-blue-700 ver-benchmarking-detalles-btn"
                                            data-analisis-id="${analisisItem.id}">
                                        <i class="fas fa-eye mr-1"></i>Ver Detalles
                                    </button>
                                ` : `
                                    <span class="text-gray-400 text-sm">
                                        <i class="fas fa-eye-slash mr-1"></i>Sin detalles
                                    </span>
                                `}
                            </div>
                        </div>

                        ${resultHTML}

                        <div class="flex justify-between items-center mt-4">
                            <div class="text-sm text-gray-500">
                                ${analisisItem.numeroMetricas || (tipo === 'Sectorial' ? Object.keys(analisisItem.analisis || {}).filter(k => !k.startsWith('_')).length : Object.keys(analisisItem.comparacion?.resultados || {}).length)} métricas analizadas
                            </div>
                        </div>
                    </div>
                `;

                // Add to container
                benchmarkingResultsContainer.insertAdjacentHTML('beforeend', cardHTML);
            });

            // Re-add empty state at the end if needed
            if (emptyState && uniqueAnalisis.length === 0) {
                benchmarkingResultsContainer.appendChild(emptyState);
                emptyState.style.display = 'block';
            }

            // Add event listeners for benchmarking detail buttons (using event delegation)
            setupBenchmarkingDetailListeners();

        } catch (error) {
            console.error('Error cargando resultados de benchmarking:', error);
        }
    }

    // Function to show benchmarking details modal
    function showBenchmarkingDetails(analisisId) {
        console.log('🔍 Mostrando detalles de benchmarking para ID:', analisisId);

        try {
            const analisisGuardados = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
            console.log('📊 Datos en localStorage:', analisisGuardados);

            // Search through all values to find the analysis with the matching ID
            let analisis = null;
            for (const value of Object.values(analisisGuardados)) {
                if (value && typeof value === 'object' && value.id == analisisId) {
                    analisis = value;
                    break;
                }
            }

            console.log('🎯 Análisis encontrado:', analisis);

            if (!analisis) {
                console.error('❌ Análisis no encontrado con ID:', analisisId);
                console.log('📋 Valores disponibles:', Object.values(analisisGuardados));
                return;
            }

            console.log('✅ Análisis encontrado correctamente');

            // Create modal content based on analysis type
            let modalContent = '';
            const fecha = new Date(analisis.timestamp).toLocaleDateString('es-ES');

            if (analisis.analisis) {
                // Sectorial analysis details
                const stats = analisis.analisis;
                modalContent = `
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Detalles del Benchmarking Sectorial</h2>
                    <div class="space-y-6">
                        <div class="bg-green-50 p-4 rounded-lg">
                            <h3 class="font-semibold text-green-800 mb-2">Información General</h3>
                            <p class="text-green-700"><strong>Fecha:</strong> ${fecha}</p>
                            <p class="text-green-700"><strong>Sector:</strong> ${analisis.sector || analisis.datos?.sector || 'No disponible'}</p>
                            <p class="text-green-700"><strong>Tamaño:</strong> ${analisis.tamanoEmpresa || analisis.datos?.tamanoEmpresa || 'No disponible'}</p>
                        </div>

                        <div>
                            <h3 class="font-semibold text-gray-800 mb-4">Resultados por Métrica</h3>
                            <div class="space-y-4">
                                ${Object.entries(stats).filter(([metrica, data]) => !metrica.startsWith('_')).map(([metrica, data]) => `
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <h4 class="font-semibold text-gray-800 mb-2">${BenchmarkingUtils.nombreMetrica(metrica)}</h4>
                                        <div class="grid md:grid-cols-3 gap-4">
                                            <div class="text-center">
                                                <div class="text-lg font-bold text-blue-600">${BenchmarkingUtils.formatearValor(metrica, data.valor_empresa)}</div>
                                                <div class="text-xs text-gray-600">Tu Valor</div>
                                            </div>
                                            <div class="text-center">
                                                <div class="text-lg font-bold text-gray-600">${BenchmarkingUtils.formatearValor(metrica, data.promedio_sector)}</div>
                                                <div class="text-xs text-gray-600">Promedio Sector</div>
                                            </div>
                                            <div class="text-center">
                                                <div class="text-lg font-bold ${data.posicion_relativa && data.posicion_relativa.percentil >= 75 ? 'text-green-600' : data.posicion_relativa && data.posicion_relativa.percentil >= 50 ? 'text-blue-600' : data.posicion_relativa && data.posicion_relativa.percentil >= 25 ? 'text-yellow-600' : 'text-red-600'}">${formatearPercentilBenchmarking(data.posicion_relativa?.percentil)}</div>
                                                <div class="text-xs text-gray-600">Tu Posición</div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            } else if (analisis.comparacion) {
                // Personalized comparison details
                const comparacion = analisis.comparacion;
                modalContent = `
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Detalles de la Comparación Personalizada</h2>
                    <div class="space-y-6">
                        <div class="bg-purple-50 p-4 rounded-lg">
                            <h3 class="font-semibold text-purple-800 mb-2">Información General</h3>
                            <p class="text-purple-700"><strong>Fecha:</strong> ${fecha}</p>
                            <p class="text-purple-700"><strong>Empresa Base:</strong> ${analisis.datos.empresaBase.nombre}</p>
                            <p class="text-purple-700"><strong>Empresas Comparadas:</strong> ${comparacion.empresas_comparacion.length}</p>
                        </div>

                        <div>
                            <h3 class="font-semibold text-gray-800 mb-4">Resultados por Criterio</h3>
                            <div class="space-y-4">
                                ${Object.entries(comparacion.resultados).map(([criterio, data]) => `
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <h4 class="font-semibold text-gray-800 mb-2">${BenchmarkingUtils.nombreMetrica(criterio)}</h4>
                                        <div class="grid md:grid-cols-3 gap-4">
                                            <div class="text-center">
                                                <div class="text-lg font-bold text-blue-600">${BenchmarkingUtils.formatearValor(criterio, data.valor_base)}</div>
                                                <div class="text-xs text-gray-600">Tu Valor</div>
                                            </div>
                                            <div class="text-center">
                                                <div class="text-lg font-bold text-gray-600">${BenchmarkingUtils.formatearValor(criterio, data.promedio_comparacion)}</div>
                                                <div class="text-xs text-gray-600">Promedio Comparación</div>
                                            </div>
                                            <div class="text-center">
                                                <div class="text-lg font-bold ${data.posicion === 'Mejor' ? 'text-green-600' : data.posicion === 'Superior' ? 'text-blue-600' : data.posicion === 'Promedio' ? 'text-yellow-600' : 'text-red-600'}">${data.posicion}</div>
                                                <div class="text-xs text-gray-600">Tu Posición</div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }

            // Create and show modal
            const modalHTML = `
                <div id="benchmarking-details-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="p-6">
                            <div class="flex justify-between items-center mb-6">
                                <button id="close-benchmarking-modal" class="text-gray-400 hover:text-gray-600">
                                    <i class="fas fa-times text-xl"></i>
                                </button>
                            </div>

                            ${modalContent}

                            <div class="flex justify-end gap-3 mt-6">
                                <button id="close-benchmarking-modal-bottom" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Add event listeners for closing modal
            document.getElementById('close-benchmarking-modal').addEventListener('click', () => {
                document.getElementById('benchmarking-details-modal').remove();
            });

            document.getElementById('close-benchmarking-modal-bottom').addEventListener('click', () => {
                document.getElementById('benchmarking-details-modal').remove();
            });

            // Close modal when clicking outside
            document.getElementById('benchmarking-details-modal').addEventListener('click', (e) => {
                if (e.target.id === 'benchmarking-details-modal') {
                    document.getElementById('benchmarking-details-modal').remove();
                }
            });

        } catch (error) {
            console.error('Error mostrando detalles de benchmarking:', error);
        }
    }

    // Helper functions for benchmarking calculations
    function calcularEmpresasComparadas(analisis) {
        // For sectorial analysis, try to get the actual number from the analysis data
        // The analysis should contain information about the dataset size used
        if (analisis && typeof analisis === 'object') {
            // Check if there's a stored count in the analysis metadata
            if (analisis._empresasComparadas !== undefined) {
                return analisis._empresasComparadas;
            }

            // Fallback: estimate based on available data
            const numMetricas = Object.keys(analisis).length;
            if (numMetricas > 0) {
                // For sectorial benchmarking, we typically use 100 companies
                // This is hardcoded in the obtenerDatosSectoriales function
                return 100;
            }
        }

        return 0;
    }

    function calcularPercentilPromedio(analisis) {
        if (!analisis || typeof analisis !== 'object') return 0;

        // Filtrar solo las métricas reales (excluir metadatos que empiezan con _)
        const metricasReales = Object.entries(analisis)
            .filter(([key, value]) => !key.startsWith('_') && value && typeof value === 'object' && value.posicion_relativa);

        const percentiles = metricasReales
            .map(([key, stats]) => stats?.posicion_relativa?.percentil)
            .filter(percentil => typeof percentil === 'number' && !isNaN(percentil));

        console.log('📊 Calculando percentil promedio:', {
            metricasReales: metricasReales.length,
            percentiles: percentiles
        });

        if (percentiles.length === 0) return 0;

        const promedio = percentiles.reduce((sum, p) => sum + p, 0) / percentiles.length;
        return isNaN(promedio) ? 0 : promedio;
    }

    function calcularPosicionGeneral(comparacion) {
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

    // Function to setup event listeners for benchmarking detail buttons
    function setupBenchmarkingDetailListeners() {
        console.log('🎯 Configurando listeners para botones de benchmarking');

        // Remove existing listeners first
        document.removeEventListener('click', handleBenchmarkingDetailClick);

        // Add new listener using named function for better control
        document.addEventListener('click', handleBenchmarkingDetailClick);

        function handleBenchmarkingDetailClick(e) {
            if (e.target.closest('.ver-benchmarking-detalles-btn')) {
                e.preventDefault();
                const button = e.target.closest('.ver-benchmarking-detalles-btn');
                const analisisId = button.getAttribute('data-analisis-id') || button.dataset.analisisId;

                console.log('🔍 Click en botón de detalles, ID:', analisisId);
                console.log('📋 Botón:', button);
                console.log('📊 Dataset:', button.dataset);

                if (analisisId) {
                    showBenchmarkingDetails(analisisId);
                } else {
                    console.error('❌ No se encontró ID de análisis en el botón');
                }
            }
        }
    }

    // Make loadBenchmarkingResults available globally
    window.loadBenchmarkingResults = loadBenchmarkingResults;

    // Function to clear all benchmarking data (for testing)
    window.clearBenchmarkingData = function() {
        try {
            localStorage.removeItem('econova_benchmarking');
            console.log('🗑️ Todos los análisis de benchmarking han sido eliminados');
            // Reload the results
            loadBenchmarkingResults();
        } catch (error) {
            console.error('Error eliminando datos de benchmarking:', error);
        }
    };

    // Function to format percentiles in benchmarking results
    function formatearPercentilBenchmarking(percentil) {
        if (percentil === null || percentil === undefined || isNaN(percentil)) {
            return '0.0%';
        }
        return percentil.toFixed(1) + '%';
    }
});
