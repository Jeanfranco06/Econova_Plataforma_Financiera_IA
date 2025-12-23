/**
 * JavaScript para la página de Préstamos
 * Maneja formularios y llamadas a la API
 */

class PrestamoManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('🏦 Módulo de Préstamos inicializado');
        this.setupEventListeners();
        this.setupTabs();
    }

    setupEventListeners() {
        // Formulario principal de cálculo de préstamo
        const loanForm = document.getElementById('loan-form');
        if (loanForm) {
            loanForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calcularPrestamo();
            });
        }

        // Formulario de sensibilidad
        const loanSensibilidadForm = document.getElementById('loan-sensibilidad-form');
        if (loanSensibilidadForm) {
            loanSensibilidadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.analizarSensibilidad();
            });
        }

        // Formulario de comparación de plazos
        const loanCompararForm = document.getElementById('loan-comparar-form');
        if (loanCompararForm) {
            loanCompararForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.compararPlazos();
            });
        }
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.loan-tab-btn');
        const tabContents = document.querySelectorAll('.loan-tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');

                // Remove active class and blue border from all buttons
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.classList.remove('border-b-2', 'border-blue-600');
                    btn.classList.add('text-gray-600', 'hover:text-gray-800');
                });

                // Hide all tab contents
                tabContents.forEach(content => content.classList.add('hidden'));

                // Add active class and blue border to clicked button
                button.classList.add('active');
                button.classList.remove('text-gray-600', 'hover:text-gray-800');
                button.classList.add('border-b-2', 'border-blue-600');

                // Show corresponding content
                const targetContent = document.getElementById(`${tabName}-tab`);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                }
            });
        });
    }

    async calcularPrestamo() {
        const formData = new FormData(document.getElementById('loan-form'));
        const data = {
            monto: parseFloat(formData.get('monto')) || 0,
            tasa_anual: parseFloat(formData.get('tasa_anual')) || 0,
            plazo_meses: parseInt(formData.get('plazo_meses')) || 0,
            tasa_impuesto: parseFloat(formData.get('tasa_impuesto')) || 0,
            comision_inicial: parseFloat(formData.get('comision_inicial')) || 0,
            nombre_simulacion: formData.get('nombre_simulacion') || 'Simulación Préstamo'
        };

        try {
            const response = await fetch('/api/v1/financiero/prestamo', {
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
                this.mostrarResultadosPrestamo(result.data);
            } else {
                this.mostrarError(result.error || 'Error en el cálculo');
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error de conexión. Intente nuevamente.');
        }
    }

    async analizarSensibilidad() {
        const formData = new FormData(document.getElementById('loan-sensibilidad-form'));
        const data = {
            monto: parseFloat(formData.get('monto')) || 0,
            tasa_anual: parseFloat(formData.get('tasa_anual')) || 0,
            plazo_meses: parseInt(formData.get('plazo_meses')) || 0,
            variacion_tasa: parseFloat(formData.get('variacion_tasa')) || 0.5
        };

        try {
            const response = await fetch('/api/v1/financiero/prestamo/sensibilidad', {
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
                this.mostrarError(result.error || 'Error en el análisis');
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error de conexión. Intente nuevamente.');
        }
    }

    async compararPlazos() {
        const formData = new FormData(document.getElementById('loan-comparar-form'));
        const plazosInput = document.getElementById('plazos-input').value;
        const plazos = plazosInput.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));

        const data = {
            monto: parseFloat(formData.get('monto')) || 0,
            tasa_anual: parseFloat(formData.get('tasa_anual')) || 0,
            plazos: plazos
        };

        try {
            const response = await fetch('/api/v1/financiero/prestamo/comparar-plazos', {
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
                this.mostrarResultadosComparacion(result.data);
            } else {
                this.mostrarError(result.error || 'Error en la comparación');
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError('Error de conexión. Intente nuevamente.');
        }
    }

    mostrarResultadosPrestamo(data) {
        // Update summary cards
        document.getElementById('result-cuota').textContent = `S/ ${data.resumen.cuota_mensual.toLocaleString('es-PE', {minimumFractionDigits: 2})}`;
        document.getElementById('result-interes').textContent = `S/ ${data.costos.costo_interes.toLocaleString('es-PE', {minimumFractionDigits: 2})}`;
        document.getElementById('result-ted').textContent = `${data.resumen.ted_tasa_efectiva.toFixed(2)}%`;
        document.getElementById('result-total').textContent = `S/ ${data.costos.costo_total_desembolsado.toLocaleString('es-PE', {minimumFractionDigits: 2})}`;

        // Update cost summary
        const costSummaryDiv = document.getElementById('loan-cost-summary');
        costSummaryDiv.innerHTML = `
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <strong>Monto Solicitado:</strong> S/ ${data.resumen.monto_solicitado.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                </div>
                <div>
                    <strong>Monto Neto Desembolsado:</strong> S/ ${data.resumen.monto_neto_desembolsado.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                </div>
                <div>
                    <strong>Comisión Inicial:</strong> S/ ${data.costos.comision_inicial.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                </div>
                <div>
                    <strong>Costo Promedio Mensual:</strong> S/ ${data.costos.costo_promedio_mensual.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                </div>
                <div>
                    <strong>Impuestos:</strong> S/ ${data.costos.impuestos.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                </div>
                <div>
                    <strong>Plazo:</strong> ${data.resumen.plazo_anos.toFixed(1)} años (${data.resumen.plazo_meses} meses)
                </div>
            </div>
        `;

        // Fill amortization table (first 12 months)
        const tableBody = document.getElementById('loan-table-body');
        const first12Months = data.tabla_amortizacion.slice(0, 12);
        tableBody.innerHTML = first12Months.map(cuota => `
            <tr>
                <td class="px-4 py-3 text-center">${cuota.mes}</td>
                <td class="px-4 py-3 text-right">S/ ${cuota.cuota.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td class="px-4 py-3 text-right">S/ ${cuota.capital.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td class="px-4 py-3 text-right">S/ ${cuota.interes.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td class="px-4 py-3 text-right">S/ ${cuota.saldo_restante.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
            </tr>
        `).join('');

        // Show results
        document.getElementById('loan-results').classList.remove('hidden');
        document.getElementById('loan-results').scrollIntoView({ behavior: 'smooth' });
    }

    mostrarResultadosSensibilidad(data) {
        const tableBody = document.getElementById('sensibilidad-table');
        tableBody.innerHTML = data.escenarios.map(escenario => `
            <tr>
                <td class="px-4 py-3 text-left">${escenario.tasa}%</td>
                <td class="px-4 py-3 text-right">S/ ${escenario.cuota_mensual.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td class="px-4 py-3 text-right">S/ ${escenario.costo_total.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td class="px-4 py-3 text-right">${escenario.variacion_cuota_porcentaje.toFixed(2)}%</td>
                <td class="px-4 py-3 text-left">${escenario.escenario}</td>
            </tr>
        `).join('');

        document.getElementById('sensibilidad-results').classList.remove('hidden');
        document.getElementById('sensibilidad-results').scrollIntoView({ behavior: 'smooth' });
    }

    mostrarResultadosComparacion(data) {
        const tableBody = document.getElementById('comparar-table');
        tableBody.innerHTML = data.comparativa_plazos.map(item => `
            <tr>
                <td class="px-4 py-3 text-center">${item.plazo_anos.toFixed(1)}</td>
                <td class="px-4 py-3 text-right">S/ ${item.cuota_mensual.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td class="px-4 py-3 text-right">S/ ${item.costo_interes.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td class="px-4 py-3 text-right">S/ ${item.costo_total.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
            </tr>
        `).join('');

        document.getElementById('comparar-results').classList.remove('hidden');
        document.getElementById('comparar-results').scrollIntoView({ behavior: 'smooth' });
    }

    mostrarError(mensaje) {
        // Simple alert for now, could be enhanced with a better notification system
        alert(`Error: ${mensaje}`);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.prestamoManager = new PrestamoManager();
    console.log('🏦 Gestor de Préstamos inicializado');
});
