/**
 * Calculadora WACC - Econova
 * Funcionalidades específicas para análisis del Costo Promedio Ponderado del Capital
 */

class WACCCalculator {
    constructor() {
        this.graficos = {};
        this.simulacionTimeout = null;
    }

    /**
     * Simula WACC con análisis completo de estructura de capital
     */
    simular(form) {
        const formData = new FormData(form);
        const datos = {
            empresa: formData.get('empresa') || 'Empresa sin nombre',
            sector: formData.get('sector') || 'general',
            costoDeuda: parseFloat(formData.get('costo_deuda')) || 0,
            costoCapital: parseFloat(formData.get('costo_capital')) || 0,
            proporcionDeuda: parseFloat(formData.get('proporcion_deuda')) || 0,
            proporcionCapital: parseFloat(formData.get('proporcion_capital')) || 0,
            tasaImpuestos: parseFloat(formData.get('tasa_impuestos')) || 0,
            escudoFiscal: formData.get('escudo_fiscal') === 'on',
            analisisSensibilidad: formData.get('analisis_sensibilidad') === 'on',
            comparacionSector: formData.get('comparacion_sector') === 'on'
        };

        // Validar datos con mensajes específicos
        const errores = ValidationUtils.validarDatosWACCDetallado(datos);
        if (errores.length > 0) {
            ValidationUtils.mostrarErrores(errores, 'wacc-form');
            return;
        }

        // Mostrar indicador de carga
        UIUtils.mostrarCarga('wacc-results', 'Calculando WACC y análisis de capital...');

        // Calcular WACC con análisis completo
        const resultado = this.calcularWACCCompleto(datos);

        // Mostrar resultados
        this.mostrarResultadosWACCProfesional(resultado, datos);

        // Crear gráfico de sensibilidad si está solicitado
        if (datos.analisisSensibilidad && typeof Chart !== 'undefined') {
            this.crearGraficoSensibilidadWACC(datos, resultado);
        }

        // Guardar simulación
        UIUtils.guardarSimulacion('wacc', {
            datos,
            resultado,
            timestamp: new Date(),
            version: '2.0',
            tipo: 'ingenieria_economica'
        });

        // Disparar evento
        UIUtils.dispararEvento('waccSimulado', { datos, resultado });
    }

    /**
     * Calcula WACC completo con análisis detallado de componentes
     */
    calcularWACCCompleto(datos) {
        const { costoDeuda, costoCapital, proporcionDeuda, proporcionCapital, tasaImpuestos, escudoFiscal } = datos;

        // Calcular costo de deuda después de impuestos
        const costoDeudaDespuesImpuestos = escudoFiscal ? costoDeuda * (1 - tasaImpuestos / 100) : costoDeuda;

        // Calcular WACC
        const wacc = (proporcionDeuda / 100) * costoDeudaDespuesImpuestos + (proporcionCapital / 100) * costoCapital;

        // Calcular contribución de cada componente
        const contribucionDeuda = (proporcionDeuda / 100) * costoDeudaDespuesImpuestos;
        const contribucionCapital = (proporcionCapital / 100) * costoCapital;

        // Calcular métricas adicionales
        const leverageRatio = proporcionDeuda / proporcionCapital;
        const taxShieldValue = escudoFiscal ? costoDeuda * (tasaImpuestos / 100) * (proporcionDeuda / 100) : 0;

        // Determinar evaluación del WACC
        const evaluacion = FinancialUtils.evaluarWACC(wacc);

        // Calcular WACC sin escudo fiscal para comparación
        const waccSinEscudo = proporcionDeuda / 100 * costoDeuda + proporcionCapital / 100 * costoCapital;
        const ahorroFiscal = waccSinEscudo - wacc;

        // Análisis de sensibilidad si solicitado
        const sensibilidad = datos.analisisSensibilidad ? this.analizarSensibilidadWACC(datos) : null;

        // Referencias sectoriales
        const referenciasSectoriales = this.obtenerReferenciasSectoriales(datos.sector);

        return {
            wacc: wacc,
            costoDeudaDespuesImpuestos: costoDeudaDespuesImpuestos,
            contribucionDeuda: contribucionDeuda,
            contribucionCapital: contribucionCapital,
            leverageRatio: leverageRatio,
            taxShieldValue: taxShieldValue,
            evaluacion: evaluacion.evaluacion,
            evaluacionTexto: evaluacion.evaluacionTexto,
            evaluacionColor: evaluacion.evaluacionColor,
            waccSinEscudo: waccSinEscudo,
            ahorroFiscal: ahorroFiscal,
            escudoFiscalAplicado: escudoFiscal,
            // Datos originales
            costoDeuda: costoDeuda,
            costoCapital: costoCapital,
            proporcionDeuda: proporcionDeuda,
            proporcionCapital: proporcionCapital,
            tasaImpuestos: tasaImpuestos,
            // Análisis adicional
            sensibilidad: sensibilidad,
            referenciasSectoriales: referenciasSectoriales
        };
    }

    /**
     * Analiza sensibilidad del WACC
     */
    analizarSensibilidadWACC(datos) {
        const sensibilidades = [];
        const variaciones = [-20, -10, -5, 0, 5, 10, 20]; // ±20%

        for (const variacion of variaciones) {
            // Variar costo de deuda
            const costoDeudaModificado = datos.costoDeuda * (1 + variacion / 100);
            const costoDeudaDespuesImpuestosMod = datos.escudoFiscal ?
                costoDeudaModificado * (1 - datos.tasaImpuestos / 100) : costoDeudaModificado;

            const waccDeuda = (datos.proporcionDeuda / 100) * costoDeudaDespuesImpuestosMod +
                             (datos.proporcionCapital / 100) * datos.costoCapital;

            // Variar costo de capital propio
            const costoCapitalModificado = datos.costoCapital * (1 + variacion / 100);
            const waccCapital = (datos.proporcionDeuda / 100) * datos.costoDeudaDespuesImpuestos +
                               (datos.proporcionCapital / 100) * costoCapitalModificado;

            sensibilidades.push({
                variacion: variacion,
                waccDeuda: waccDeuda,
                waccCapital: waccCapital,
                diferenciaDeuda: waccDeuda - this.calcularWACCBase(datos),
                diferenciaCapital: waccCapital - this.calcularWACCBase(datos)
            });
        }

        return sensibilidades;
    }

    /**
     * Calcula WACC base para comparaciones
     */
    calcularWACCBase(datos) {
        const costoDeudaDespuesImpuestos = datos.escudoFiscal ?
            datos.costoDeuda * (1 - datos.tasaImpuestos / 100) : datos.costoDeuda;

        return (datos.proporcionDeuda / 100) * costoDeudaDespuesImpuestos +
               (datos.proporcionCapital / 100) * datos.costoCapital;
    }

    /**
     * Obtiene referencias sectoriales para comparación
     */
    obtenerReferenciasSectoriales(sector) {
        const referencias = {
            energia: { wacc: 8.5, rango: [7.0, 10.0], descripcion: "Energía y Recursos" },
            manufactura: { wacc: 9.2, rango: [8.0, 11.0], descripcion: "Manufactura" },
            tecnologia: { wacc: 10.8, rango: [9.0, 13.0], descripcion: "Tecnología" },
            construccion: { wacc: 9.8, rango: [8.5, 11.5], descripcion: "Construcción" },
            financiero: { wacc: 8.9, rango: [7.5, 10.5], descripcion: "Servicios Financieros" },
            retail: { wacc: 9.5, rango: [8.0, 11.0], descripcion: "Retail y Comercio" },
            salud: { wacc: 9.1, rango: [7.8, 10.5], descripcion: "Salud" },
            general: { wacc: 9.5, rango: [8.0, 11.0], descripcion: "Promedio General" }
        };

        return referencias[sector] || referencias.general;
    }

    /**
     * Muestra resultados WACC profesionales con métricas completas
     */
    mostrarResultadosWACCProfesional(resultado, datos) {
        const resultsDiv = document.getElementById('wacc-results');
        if (!resultsDiv) return;

        // Construir HTML completo para resultados profesionales
        const html = `
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-xl font-bold text-gray-800">Resultados del Análisis WACC</h4>
              <div class="flex gap-2">
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar PDF" onclick="window.waccCalculator.exportarPDF()">
                  <i class="fas fa-file-pdf"></i>
                </button>
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar Excel" onclick="window.waccCalculator.exportarExcel()">
                  <i class="fas fa-file-excel"></i>
                </button>
              </div>
            </div>

            <!-- Main WACC Result -->
            <div class="text-center mb-8">
              <div class="inline-block bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div class="text-4xl font-bold text-purple-600 mb-2" id="wacc-result">
                  ${FinancialUtils.formatearPorcentaje(resultado.wacc)}
                </div>
                <div class="text-lg text-gray-600 font-medium">Costo Promedio Ponderado del Capital</div>
                <div class="text-sm text-gray-500 mt-1">Tasa de descuento apropiada</div>
              </div>
            </div>

            <!-- Component Breakdown -->
            <div class="grid md:grid-cols-2 gap-6 mb-8">
              <!-- Debt Component -->
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h5 class="font-bold text-red-800 mb-4 flex items-center">
                  <i class="fas fa-credit-card mr-2"></i>
                  Componente de Deuda
                </h5>

                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Costo de deuda (antes de impuestos):</span>
                    <span class="font-semibold text-red-600" id="wacc-deuda-display">${FinancialUtils.formatearPorcentaje(resultado.costoDeuda)}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Costo de deuda (después de impuestos):</span>
                    <span class="font-semibold text-red-600" id="wacc-deuda-after-tax">${FinancialUtils.formatearPorcentaje(resultado.costoDeudaDespuesImpuestos)}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Peso de la deuda:</span>
                    <span class="font-semibold text-gray-800" id="wacc-peso-deuda">${FinancialUtils.formatearPorcentaje(resultado.proporcionDeuda)}</span>
                  </div>
                  <div class="flex justify-between items-center border-t pt-2">
                    <span class="text-sm font-medium text-gray-700">Contribución al WACC:</span>
                    <span class="font-bold text-red-600" id="wacc-contribucion-deuda">${FinancialUtils.formatearPorcentaje(resultado.contribucionDeuda)}</span>
                  </div>
                </div>
              </div>

              <!-- Equity Component -->
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h5 class="font-bold text-green-800 mb-4 flex items-center">
                  <i class="fas fa-chart-line mr-2"></i>
                  Componente de Capital Propio
                </h5>

                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Costo de capital propio:</span>
                    <span class="font-semibold text-green-600" id="wacc-capital-display">${FinancialUtils.formatearPorcentaje(resultado.costoCapital)}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Peso del capital propio:</span>
                    <span class="font-semibold text-gray-800" id="wacc-peso-capital">${FinancialUtils.formatearPorcentaje(resultado.proporcionCapital)}</span>
                  </div>
                  <div class="flex justify-between items-center border-t pt-2">
                    <span class="text-sm font-medium text-gray-700">Contribución al WACC:</span>
                    <span class="font-bold text-green-600" id="wacc-contribucion-capital">${FinancialUtils.formatearPorcentaje(resultado.contribucionCapital)}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Decision Framework -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-gavel mr-2 text-gray-600"></i>
                Marco de Decisión Económica
              </h5>

              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-800">Evaluación WACC:</span>
                    <span id="wacc-evaluation" class="px-3 py-1 rounded-full text-sm font-semibold ${
                        resultado.evaluacion === 'bajo' ? 'bg-green-100 text-green-800' :
                        resultado.evaluacion === 'moderado' ? 'bg-yellow-100 text-yellow-800' :
                        resultado.evaluacion === 'alto' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                    }">${
                        resultado.evaluacion === 'bajo' ? 'Bajo - Favorable' :
                        resultado.evaluacion === 'moderado' ? 'Moderado' :
                        resultado.evaluacion === 'alto' ? 'Alto - Elevado' :
                        'Muy Alto - Prohibitivo'
                    }</span>
                  </div>
                  <div class="text-sm text-gray-600" id="wacc-evaluation-text">
                    ${resultado.evaluacionTexto}
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-800">Ratio de Endeudamiento:</span>
                    <span class="px-3 py-1 rounded-full text-sm font-semibold ${
                        resultado.leverageRatio < 1 ? 'bg-green-100 text-green-800' :
                        resultado.leverageRatio < 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }">
                      ${resultado.leverageRatio.toFixed(2)}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    Deuda/Capital = ${resultado.proporcionDeuda}%/${resultado.proporcionCapital}%
                  </div>
                </div>
              </div>
            </div>

            <!-- Tax Shield Analysis -->
            ${resultado.escudoFiscalAplicado ? `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
              <h5 class="font-bold text-blue-800 mb-4 flex items-center">
                <i class="fas fa-shield-alt mr-2"></i>
                Análisis del Escudo Fiscal
              </h5>

              <div class="grid md:grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded-lg text-center">
                  <div class="text-lg font-bold text-blue-600 mb-1">${FinancialUtils.formatearPorcentaje(resultado.ahorroFiscal)}</div>
                  <div class="text-sm text-gray-600">Ahorro Fiscal Anual</div>
                </div>
                <div class="bg-white p-4 rounded-lg text-center">
                  <div class="text-lg font-bold text-green-600 mb-1">${FinancialUtils.formatearPorcentaje(resultado.waccSinEscudo)}</div>
                  <div class="text-sm text-gray-600">WACC sin Escudo</div>
                </div>
                <div class="bg-white p-4 rounded-lg text-center">
                  <div class="text-lg font-bold text-purple-600 mb-1">${FinancialUtils.formatearPorcentaje(resultado.wacc)}</div>
                  <div class="text-sm text-gray-600">WACC con Escudo</div>
                </div>
              </div>

              <div class="mt-4 text-sm text-blue-700">
                <p><strong>Valor del escudo fiscal:</strong> El ahorro fiscal reduce el costo efectivo de la deuda, haciendo más atractiva la financiación con deuda.</p>
              </div>
            </div>
            ` : ''}

            <!-- WACC Formula Explanation -->
            <div class="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-lightbulb mr-2 text-purple-600"></i>
                Fórmula del WACC
              </h5>

              <div class="bg-white p-4 rounded-lg mb-4">
                <div class="text-center">
                  <div class="text-lg font-mono text-purple-800 mb-2">
                    WACC = (D/V × Rd × (1-Tc)) + (E/V × Re)
                  </div>
                  <div class="text-sm text-gray-600">
                    Donde: D/V = Proporción de deuda | E/V = Proporción de capital propio |<br>
                    Rd = Costo de deuda | Re = Costo de capital propio | Tc = Tasa de impuestos
                  </div>
                </div>
              </div>

              <div class="text-sm text-gray-700 space-y-2">
                <p><strong>WACC calculado:</strong> <span id="wacc-formula-result" class="font-semibold text-purple-600">${FinancialUtils.formatearPorcentaje(resultado.wacc)}</span></p>
                <p><strong>Interpretación:</strong> Este es el costo mínimo de rendimiento que debe generar un proyecto para crear valor para los accionistas.</p>
                <p><strong>Aplicación:</strong> Use este WACC como tasa de descuento en análisis VAN y TIR de proyectos con riesgo similar al de la empresa.</p>
              </div>
            </div>

            <!-- Industry Benchmarks -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-industry mr-2 text-gray-600"></i>
                Referencias Sectoriales
              </h5>

              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left font-medium text-gray-700">Sector</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">WACC Promedio</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">Rango Típico</th>
                      <th class="px-4 py-2 text-center font-medium text-gray-700">Comparación</th>
                    </tr>
                  </thead>
                  <tbody id="wacc-sector-table" class="divide-y divide-gray-200">
                    <tr class="${resultado.referenciasSectoriales.descripcion === 'Energía y Recursos' ? 'bg-blue-50' : ''}">
                      <td class="px-4 py-2 text-left font-medium text-gray-700">Energía y Recursos</td>
                      <td class="px-4 py-2 text-right text-gray-700">8.5%</td>
                      <td class="px-4 py-2 text-right text-gray-700">7.0% - 10.0%</td>
                      <td class="px-4 py-2 text-center">${resultado.referenciasSectoriales.descripcion === 'Energía y Recursos' ? '← Su sector' : ''}</td>
                    </tr>
                    <tr class="${resultado.referenciasSectoriales.descripcion === 'Manufactura' ? 'bg-blue-50' : ''} bg-gray-50">
                      <td class="px-4 py-2 text-left font-medium text-gray-700">Manufactura</td>
                      <td class="px-4 py-2 text-right text-gray-700">9.2%</td>
                      <td class="px-4 py-2 text-right text-gray-700">8.0% - 11.0%</td>
                      <td class="px-4 py-2 text-center">${resultado.referenciasSectoriales.descripcion === 'Manufactura' ? '← Su sector' : ''}</td>
                    </tr>
                    <tr class="${resultado.referenciasSectoriales.descripcion === 'Tecnología' ? 'bg-blue-50' : ''}">
                      <td class="px-4 py-2 text-left font-medium text-gray-700">Tecnología</td>
                      <td class="px-4 py-2 text-right text-gray-700">10.8%</td>
                      <td class="px-4 py-2 text-right text-gray-700">9.0% - 13.0%</td>
                      <td class="px-4 py-2 text-center">${resultado.referenciasSectoriales.descripcion === 'Tecnología' ? '← Su sector' : ''}</td>
                    </tr>
                    <tr class="${resultado.referenciasSectoriales.descripcion === 'Construcción' ? 'bg-blue-50' : ''} bg-gray-50">
                      <td class="px-4 py-2 text-left font-medium text-gray-700">Construcción</td>
                      <td class="px-4 py-2 text-right text-gray-700">9.8%</td>
                      <td class="px-4 py-2 text-right text-gray-700">8.5% - 11.5%</td>
                      <td class="px-4 py-2 text-center">${resultado.referenciasSectoriales.descripcion === 'Construcción' ? '← Su sector' : ''}</td>
                    </tr>
                    <tr class="${resultado.referenciasSectoriales.descripcion === 'Servicios Financieros' ? 'bg-blue-50' : ''}">
                      <td class="px-4 py-2 text-left font-medium text-gray-700">Servicios Financieros</td>
                      <td class="px-4 py-2 text-right text-gray-700">8.9%</td>
                      <td class="px-4 py-2 text-right text-gray-700">7.5% - 10.5%</td>
                      <td class="px-4 py-2 text-center">${resultado.referenciasSectoriales.descripcion === 'Servicios Financieros' ? '← Su sector' : ''}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                <p class="text-sm text-blue-800">
                  <strong>Su WACC (${FinancialUtils.formatearPorcentaje(resultado.wacc)}) vs Sector ${resultado.referenciasSectoriales.descripcion}:</strong>
                  ${resultado.wacc < resultado.referenciasSectoriales.wacc ? 'Por debajo del promedio sectorial (ventaja competitiva)' :
                    resultado.wacc > resultado.referenciasSectoriales.rango[1] ? 'Por encima del rango sectorial (revisar estructura de capital)' :
                    'Dentro del rango sectorial (adecuado)'}
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.waccCalculator.guardarAnalisis()">
                <i class="fas fa-save mr-2"></i>Guardar Análisis
              </button>
              <button class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.waccCalculator.consultarConIA()">
                <i class="fas fa-robot mr-2"></i>Consultar con IA
              </button>
            </div>
        `;

        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';

        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Crea gráfico de sensibilidad para WACC
     */
    crearGraficoSensibilidadWACC(datos, resultado) {
        if (!resultado.sensibilidad || typeof Chart === 'undefined') return;

        const ctx = document.getElementById('grafico-wacc-sensibilidad');
        if (!ctx) return;

        const labels = resultado.sensibilidad.map(s => s.variacion + '%');

        if (this.graficos.waccSensibilidad) {
            this.graficos.waccSensibilidad.destroy();
        }

        this.graficos.waccSensibilidad = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'WACC (variando costo deuda)',
                    data: resultado.sensibilidad.map(s => s.waccDeuda),
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    tension: 0.4
                }, {
                    label: 'WACC (variando costo capital)',
                    data: resultado.sensibilidad.map(s => s.waccCapital),
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Análisis de Sensibilidad - WACC vs Variación en Costos de Capital'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'WACC (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Variación en Costos (%)'
                        }
                    }
                }
            }
        });
    }

    /**
     * Funciones de acción para WACC
     */
    guardarAnalisis() {
        UIUtils.guardarAnalisis('wacc');
    }

    compartirAnalisis() {
        UIUtils.compartirAnalisis('wacc');
    }

    imprimirAnalisis() {
        UIUtils.imprimirAnalisis('wacc');
    }

    exportarPDF() {
        UIUtils.exportarPDF('wacc');
    }

    exportarExcel() {
        UIUtils.exportarExcel('wacc');
    }

    /**
     * Actualiza simulación en tiempo real
     */
    actualizarSimulacionTiempoReal(input) {
        UIUtils.actualizarSimulacionTiempoReal(input);
    }

    /**
     * Obtiene los datos actuales de la simulación WACC
     */
    obtenerDatosActuales() {
        const simulacion = UIUtils.obtenerSimulacion('wacc');
        if (!simulacion) return null;

        return {
            tipo: 'wacc',
            wacc: simulacion.resultado?.wacc || 0,
            costo_deuda: simulacion.datos?.costoDeuda || 0,
            costo_capital: simulacion.datos?.costoCapital || 0,
            peso_deuda: simulacion.datos?.proporcionDeuda || 0,
            peso_capital: simulacion.datos?.proporcionCapital || 0,
            tasa_impuestos: simulacion.datos?.tasaImpuestos || 0,
            evaluacion: simulacion.resultado?.evaluacion || 'moderado',
            nombre_proyecto: simulacion.datos?.empresa || 'Empresa WACC'
        };
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WACCCalculator;
}
