// Resultados page filtering functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterType = document.getElementById('filter-type');
    const filterDate = document.getElementById('filter-date');
    const simulationCards = document.querySelectorAll('.grid.gap-6 > div');

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

    // Function to update statistics
    function updateStatistics() {
        const visibleCards = Array.from(simulationCards).filter(card => {
            return card.style.display !== 'none' &&
                   !card.querySelector('h3')?.textContent.includes('No tienes simulaciones');
        });

        // Update total simulations count
        const totalStat = document.querySelector('.grid.md\\:grid-cols-4 > div:nth-child(1) .text-2xl');
        if (totalStat) {
            totalStat.textContent = visibleCards.length;
        }

        // Count viable projects
        let viableCount = 0;
        visibleCards.forEach(card => {
            const decisionBadge = card.querySelector('.bg-green-100');
            if (decisionBadge) {
                viableCount++;
            }
        });

        const viableStat = document.querySelector('.grid.md\\:grid-cols-4 > div:nth-child(2) .text-2xl');
        if (viableStat) {
            viableStat.textContent = viableCount;
        }

        // For now, set other stats to 0 as we don't have that data
        const revisionStat = document.querySelector('.grid.md\\:grid-cols-4 > div:nth-child(3) .text-2xl');
        if (revisionStat) {
            revisionStat.textContent = '0';
        }

        const noViableStat = document.querySelector('.grid.md\\:grid-cols-4 > div:nth-child(4) .text-2xl');
        if (noViableStat) {
            noViableStat.textContent = '0';
        }
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
                    } else if (key === 'wacc' && typeof value === 'number') {
                        displayValue = `${value.toFixed(1)}%`;
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
            resultsHTML = `<div class="grid md:grid-cols-2 gap-4">${resultItems.join('')}</div>`;
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
                        displayValue = value.join(', ');
                    } else if (typeof value === 'number') {
                        displayValue = value.toLocaleString('es-ES');
                    }
                    paramItems.push(`<li class="text-sm"><strong>${key}:</strong> ${displayValue}</li>`);
                }
            });
            if (paramItems.length > 0) {
                paramsHTML = `
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-green-800 mb-2">Parámetros de la Simulación</h4>
                        <ul class="text-green-700 space-y-1">${paramItems.join('')}</ul>
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
});
