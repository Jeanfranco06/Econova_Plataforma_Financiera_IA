/**
 * JavaScript para la página de Ahorro e Inversión
 * Maneja formularios y llamadas a la API
 */

class AhorroInversionManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('💰 Módulo de Ahorro e Inversión inicializado');
        this.setupEventListeners();
        this.setupTabs();
    }

    setupEventListeners() {
        // Formulario de proyección de ahorro
        const savingsForm = document.getElementById('savings-form');
        if (savingsForm) {
            savingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calcularAhorro();
            });
        }

        // Formulario de meta de ahorro
        const metaForm = document.getElementById('meta-form');
        if (metaForm) {
            metaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calcularMetaAhorro();
            });
        }

        // Formulario de comparador
        const comparadorForm = document.getElementById('comparador-form');
        if (comparadorForm) {
            comparadorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.compararInstrumentos();
            });
        }

        // Formulario de sensibilidad
        const sensibilidadForm = document.getElementById('sensibilidad-form');
        if (sensibilidadForm) {
            sensibilidadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.analizarSensibilidad();
            });
        }
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.savings-tab-btn');
        const tabContents = document.querySelectorAll('.savings-tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');

                // Remove active class and green border from all buttons
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.classList.remove('border-b-2', 'border-green-600');
                    btn.classList.add('text-gray-600', 'hover:text-gray-800');
                });

                // Hide all tab contents
                tabContents.forEach(content => content.classList.add('hidden'));

                // Add active class and green border to clicked button
                button.classList.add('active');
                button.classList.remove('text-gray-600', 'hover:text-gray-800');
                button.classList.add('border-b-2', 'border-green-600');

                // Show corresponding content
                const targetContent = document.getElementById(`${tabName}-tab`);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                }
            });
        });
    }

    async calcularAhorro() {
        const formData = new FormData(document.getElementById('savings-form'));
        const data = {
            monto_inicial: parseFloat(formData.get('monto_inicial')) || 0,
            aporte_mensual: parseFloat(formData.get('aporte_mensual')) || 0,
            tasa_anual: parseFloat(formData.get('tasa_anual')) || 0,
            meses: parseInt(formData.get('meses')) || 0,
            tasa_impuesto: parseFloat(formData.get('tasa_impuesto')) || 0,
            inflacion_anual: parseFloat(formData.get('inflacion_anual')) || 0,
            nombre_simulacion: formData.get('nombre_simulacion') || 'Proyección de Ahorro'
        };

        try {
            const response = await fetch('/api/v1/financiero/ahorro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.mostrarResultadosAhorro(result.data);
            } else {
                this.mostrarError(result.error || 'Error en el cálculo');
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error de conexión. Intente nuevamente.');
        }
    }

    async calcularMetaAhorro() {
        const formData = new FormData(document.getElementById('meta-form'));
        const data = {
            monto_objetivo: parseFloat(formData.get('monto_objetivo')) || 0,
            monto_inicial: parseFloat(formData.get('monto_inicial')) || 0,
            tasa_anual: parseFloat(formData.get('tasa_anual')) || 0,
            aporte_mensual: parseFloat(formData.get('aporte_mensual')) || 0
        };

        try {
            const response = await fetch('/api/v1/financiero/ahorro/meta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                this.mostrarResultadosMeta(result.data);
            } else {
                this.mostrarError(result.error || 'Error en el cálculo');
            }
        } catch (error) {
            console.error('Error completo:', error);
            this.mostrarError(`Error de conexión: ${error.message}`);
        }
    }

    async compararInstrumentos() {
        const formData = new FormData(document.getElementById('comparador-form'));
        const data = {
            monto_inicial: parseFloat(formData.get('monto_inicial')) || 0,
            aporte_mensual: parseFloat(formData.get('aporte_mensual')) || 0,
            meses: parseInt(formData.get('meses')) || 0,
            instrumentos: [],
            nombre_simulacion: 'Comparador de Instrumentos'
        };

        // Get selected instruments
        const checkedInstruments = document.querySelectorAll('input[name="instrument"]:checked');
        checkedInstruments.forEach(checkbox => {
            const value = checkbox.value;
            if (value === 'plazo_fijo') {
                data.instrumentos.push({
                    nombre: 'Plazo Fijo',
                    tasa_anual: 5.0,
                    tasa_impuesto: 0,
                    descripcion: 'Depósito a plazo fijo tradicional'
                });
            } else if (value === 'fondo_mutuo') {
                data.instrumentos.push({
                    nombre: 'Fondo Mutuo',
                    tasa_anual: 8.5,
                    tasa_impuesto: 0.05,
                    descripcion: 'Fondo de inversión diversificado'
                });
            } else if (value === 'renta_fija') {
                data.instrumentos.push({
                    nombre: 'Renta Fija',
                    tasa_anual: 6.5,
                    tasa_impuesto: 0,
                    descripcion: 'Inversión en renta fija'
                });
            }
        });

        try {
            const response = await fetch('/api/v1/financiero/ahorro/comparar-instrumentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.mostrarResultadosComparador(result.data);
            } else {
                this.mostrarError(result.error || 'Error en el cálculo');
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error de conexión. Intente nuevamente.');
        }
    }

    async analizarSensibilidad() {
        const formData = new FormData(document.getElementById('sensibilidad-form'));
        const data = {
            monto_inicial: parseFloat(formData.get('monto_inicial')) || 0,
            aporte_mensual: parseFloat(formData.get('aporte_mensual')) || 0,
            tasa_anual: parseFloat(formData.get('tasa_anual')) || 0,
            meses: parseInt(formData.get('meses')) || 0,
            variacion_tasa: 1.0
        };

        try {
            const response = await fetch('/api/v1/financiero/ahorro/sensibilidad', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.mostrarResultadosSensibilidad(result.data);
            } else {
                this.mostrarError(result.error || 'Error en el cálculo');
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error de conexión. Intente nuevamente.');
        }
    }

    mostrarResultadosAhorro(data) {
        // Update summary cards
        document.getElementById('result-saldo-final').textContent = `S/ ${data.resumen.saldo_final.toLocaleString('es-PE', {minimumFractionDigits: 2})}`;
        document.getElementById('result-ganancia-neta').textContent = `S/ ${data.resumen.ganancia_neta.toLocaleString('es-PE', {minimumFractionDigits: 2})}`;
        document.getElementById('result-rendimiento').textContent = `${data.indicadores.rendimiento_porcentaje.toFixed(2)}%`;

        // Update detailed summary
        const summaryDiv = document.getElementById('savings-summary');
        summaryDiv.innerHTML = `
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <strong>Monto Inicial:</strong> S/ ${data.resumen.monto_inicial.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                </div>
                <div>
                    <strong>Aportes Totales:</strong> S/ ${data.resumen.aporte_total.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                </div>
                <div>
                    <strong>Intereses Ganados:</strong> S/ ${data.resumen.interes_ganado.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                </div>
                <div>
                    <strong>Impuestos Pagados:</strong> S/ ${data.resumen.impuestos_pagados.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                </div>
                <div>
                    <strong>Tasa Efectiva Anual:</strong> ${data.indicadores.tasa_efectiva_anual.toFixed(2)}%
                </div>
                <div>
                    <strong>Período:</strong> ${data.resumen.periodo_anos.toFixed(1)} años
                </div>
            </div>
        `;

        // Update inflation impact
        document.getElementById('poder-adquisitivo').textContent = `S/ ${data.indicadores.saldo_poder_adquisitivo_real.toLocaleString('es-PE', {minimumFractionDigits: 2})}`;

        // Create chart
        this.crearGraficoAhorro(data.proyeccion);

        // Show results
        document.getElementById('savings-results').classList.remove('hidden');
        document.getElementById('savings-results').scrollIntoView({ behavior: 'smooth' });
    }

    mostrarResultadosMeta(data) {
        const resultsDiv = document.getElementById('meta-results');

        if (data.meta_alcanzable === false) {
            resultsDiv.innerHTML = `
                <div class="text-center">
                    <div class="text-3xl font-bold text-red-600 mb-2">❌</div>
                    <div class="text-xl text-gray-600">Meta no alcanzable</div>
                    <div class="text-sm text-gray-500 mt-2">${data.mensaje}</div>
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `
                <div class="text-center mb-6">
                    <div class="text-5xl font-bold text-green-600 mb-2">${data.meses_necesarios}</div>
                    <div class="text-2xl text-gray-600">Meses necesarios</div>
                    <div class="text-lg text-gray-500">(${data.anos_necesarios.toFixed(1)} años)</div>
                </div>
                <div class="space-y-3 text-sm">
                    <div class="flex justify-between">
                        <span>Monto Objetivo:</span>
                        <span>S/ ${data.saldo_objetivo.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Saldo Final Estimado:</span>
                        <span>S/ ${data.saldo_final.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Aportes Totales:</span>
                        <span>S/ ${data.aporte_total.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Intereses Ganados:</span>
                        <span>S/ ${data.interes_ganado.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                    </div>
                </div>
            `;
        }

        document.getElementById('meta-results').classList.remove('hidden');
        document.getElementById('meta-results').scrollIntoView({ behavior: 'smooth' });
    }

    mostrarResultadosComparador(data) {
        // Show best option
        const mejorOpcionDiv = document.getElementById('mejor-opcion');
        if (data.mejor_opcion) {
            mejorOpcionDiv.innerHTML = `
                <h4 class="font-semibold text-green-800">${data.mejor_opcion.nombre}</h4>
                <div class="mt-2 space-y-1 text-sm">
                    <div><strong>Tasa:</strong> ${data.mejor_opcion.tasa_anual}%</div>
                    <div><strong>Saldo Final:</strong> S/ ${data.mejor_opcion.saldo_final.toLocaleString('es-PE', {minimumFractionDigits: 2})}</div>
                    <div><strong>Rendimiento:</strong> ${data.mejor_opcion.rendimiento_porcentaje.toFixed(2)}%</div>
                </div>
            `;
        }

        // Fill comparison table
        const tableBody = document.getElementById('comparador-table');
        tableBody.innerHTML = data.comparativa.map(item => `
            <tr>
                <td class="px-4 py-3 text-left font-medium">${item.nombre}</td>
                <td class="px-4 py-3 text-right">${item.tasa_anual}%</td>
                <td class="px-4 py-3 text-right">S/ ${item.saldo_final.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td class="px-4 py-3 text-right">S/ ${item.ganancia_neta.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td class="px-4 py-3 text-right">${item.rendimiento_porcentaje.toFixed(2)}%</td>
            </tr>
        `).join('');

        document.getElementById('comparador-results').classList.remove('hidden');
        document.getElementById('comparador-results').scrollIntoView({ behavior: 'smooth' });
    }

    mostrarResultadosSensibilidad(data) {
        const tableBody = document.getElementById('sensibilidad-table');
        tableBody.innerHTML = data.escenarios.map(escenario => `
            <tr>
                <td class="px-4 py-3 text-left">${escenario.tasa}%</td>
                <td class="px-4 py-3 text-right">S/ ${escenario.saldo_final.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td class="px-4 py-3 text-right">${escenario.variacion_porcentaje.toFixed(2)}%</td>
                <td class="px-4 py-3 text-left">${escenario.escenario}</td>
            </tr>
        `).join('');

        document.getElementById('sensibilidad-results').classList.remove('hidden');
        document.getElementById('sensibilidad-results').scrollIntoView({ behavior: 'smooth' });
    }

    crearGraficoAhorro(proyeccion) {
        const ctx = document.getElementById('savings-chart');
        if (!ctx) return;

        const labels = proyeccion.map(p => `Año ${p.ano}`);
        const data = proyeccion.map(p => p.saldo);

        if (window.savingsChart) {
            window.savingsChart.destroy();
        }

        window.savingsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Saldo del Ahorro',
                    data: data,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'S/ ' + value.toLocaleString('es-PE');
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Saldo: S/ ' + context.parsed.y.toLocaleString('es-PE');
                            }
                        }
                    }
                }
            }
        });
    }

    mostrarError(mensaje) {
        // Simple alert for now, could be enhanced with a better notification system
        alert(`Error: ${mensaje}`);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.ahorroInversionManager = new AhorroInversionManager();
    console.log('💰 Gestor de Ahorro e Inversión inicializado');
});
