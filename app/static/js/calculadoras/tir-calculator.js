/**
 * Calculadora TIR - Econova
 * Funcionalidades específicas para análisis de Tasa Interna de Retorno
 */

class TIRCalculator {
    constructor() {
        this.graficos = {};
        this.simulacionTimeout = null;
    }

    /**
     * Simula TIR con análisis completo de ingeniería económica
     */
    simular(form) {
        const formData = new FormData(form);
        const datos = {
            nombreProyecto: formData.get('nombre_proyecto') || 'Proyecto sin nombre',
            sector: formData.get('sector') || 'general',
            inversion: parseFloat(formData.get('inversion')) || 0,
            flujos: UIUtils.parsearFlujosTIR(form),
            metodo: formData.get('metodo') || 'newton',
            mostrarConvergencia: formData.get('mostrar_convergencia') === 'on',
            analisisSensibilidad: formData.get('analisis_sensibilidad') === 'on'
        };

        // Validar datos con mensajes específicos
        const errores = ValidationUtils.validarDatosTIRDetallado(datos);
        if (errores.length > 0) {
            ValidationUtils.mostrarErrores(errores, 'tir-form');
            return;
        }

        // Mostrar indicador de carga
        UIUtils.mostrarCarga('tir-results', 'Calculando TIR y análisis...');

        // Calcular TIR con análisis completo
        const resultado = this.calcularTIRCompleto(datos);

        // Mostrar resultados
        this.mostrarResultadosTIRProfesional(resultado, datos);

        // Crear tabla de convergencia si está solicitada
        if (datos.mostrarConvergencia && resultado.convergencia) {
            this.crearTablaConvergenciaTIR(resultado.convergencia);
        }

        // Crear gráfico de sensibilidad si está solicitado
        if (datos.analisisSensibilidad && typeof Chart !== 'undefined') {
            this.crearGraficoSensibilidadTIR(datos, resultado);
        }

        // Guardar simulación
        UIUtils.guardarSimulacion('tir', {
            datos,
            resultado,
            timestamp: new Date(),
            version: '2.0',
            tipo: 'ingenieria_economica'
        });

        // Disparar evento
        UIUtils.dispararEvento('tirSimulado', { datos, resultado });
    }

    /**
     * Calcula TIR completo con análisis detallado de convergencia
     */
    calcularTIRCompleto(datos) {
        const { flujos, inversion, metodo } = datos;

        // Crear array de flujos incluyendo inversión inicial (negativa)
        const flujosCompletos = [-Math.abs(inversion), ...flujos];

        let tir = null;
        let convergencia = null;
        let metodoUsado = metodo;

        // Intentar calcular TIR con el método seleccionado
        if (metodo === 'newton') {
            const resultado = this.calcularTIRNewtonConConvergencia(flujosCompletos);
            tir = resultado.tir;
            convergencia = resultado.convergencia;
        } else if (metodo === 'biseccion') {
            const resultado = this.calcularTIRBiseccionConConvergencia(flujosCompletos);
            tir = resultado.tir;
            convergencia = resultado.convergencia;
        } else {
            // Método aproximación simple
            tir = this.calcularTIRAproximacion(flujosCompletos);
            metodoUsado = 'aproximacion';
        }

        // Calcular VAN a la TIR encontrada (verificación)
        let vanATir = null;
        if (tir !== null) {
            vanATir = FinancialUtils.calcularVAN(flujos, tir);
        }

        // Calcular VAN con tasa de descuento estándar para comparación
        const tasaDescuentoEstandar = 12; // 12% como referencia
        const vanEstandar = FinancialUtils.calcularVAN(flujos, tasaDescuentoEstandar);

        // Determinar evaluación de la TIR
        const evaluacion = FinancialUtils.evaluarTIR(tir);

        // Calcular métricas adicionales
        const flujoTotal = flujos.reduce((sum, flujo) => sum + flujo, 0);
        const flujoPromedio = flujoTotal / flujos.length;

        return {
            tir: tir,
            metodoUsado: metodoUsado,
            vanATir: vanATir,
            vanEstandar: vanEstandar,
            tasaDescuentoEstandar: tasaDescuentoEstandar,
            flujoTotal: flujoTotal,
            flujoPromedio: flujoPromedio,
            convergencia: convergencia,
            evaluacion: evaluacion.evaluacion,
            evaluacionTexto: evaluacion.evaluacionTexto,
            evaluacionColor: evaluacion.evaluacionColor,
            inversion: inversion,
            horizonte: flujos.length,
            // Análisis de sensibilidad si solicitado
            sensibilidad: datos.analisisSensibilidad ? this.analizarSensibilidadTIR(flujosCompletos) : null
        };
    }

    /**
     * Calcula TIR usando método de Newton-Raphson con registro de convergencia
     */
    calcularTIRNewtonConConvergencia(flujos) {
        const maxIteraciones = 100;
        const tolerancia = 0.000001;
        const convergencia = [];

        let tir = 0.1; // Estimación inicial del 10%

        for (let iteracion = 0; iteracion < maxIteraciones; iteracion++) {
            let van = 0;
            let derivada = 0;

            for (let i = 0; i < flujos.length; i++) {
                if (Math.abs(tir) > 1e-10) {
                    van += flujos[i] / Math.pow(1 + tir, i);
                    if (i > 0) {
                        derivada -= i * flujos[i] / Math.pow(1 + tir, i + 1);
                    }
                }
            }

            convergencia.push({
                iteracion: iteracion + 1,
                tir: tir * 100,
                van: van,
                derivada: derivada,
                error: Math.abs(van)
            });

            if (Math.abs(van) < tolerancia) {
                return {
                    tir: tir * 100, // Convertir a porcentaje
                    convergencia: convergencia
                };
            }

            if (Math.abs(derivada) > 1e-10) {
                const nuevaTir = tir - van / derivada;
                if (Math.abs(nuevaTir - tir) < tolerancia) {
                    return {
                        tir: nuevaTir * 100,
                        convergencia: convergencia
                    };
                }
                tir = nuevaTir;
            } else {
                tir += 0.001;
            }

            if (tir < -0.9 || tir > 5) {
                return {
                    tir: null, // No convergió
                    convergencia: convergencia
                };
            }
        }

        return {
            tir: null, // No convergió en iteraciones máximas
            convergencia: convergencia
        };
    }

    /**
     * Calcula TIR usando método de bisección con registro de convergencia
     */
    calcularTIRBiseccionConConvergencia(flujos) {
        const maxIteraciones = 100;
        const tolerancia = 0.000001;
        const convergencia = [];

        let a = -0.9; // Límite inferior
        let b = 5.0;  // Límite superior

        // Verificar que hay cambio de signo
        const vanA = this.calcularVAN(flujos, a);
        const vanB = this.calcularVAN(flujos, b);

        if (vanA * vanB > 0) {
            return {
                tir: null,
                convergencia: []
            };
        }

        for (let iteracion = 0; iteracion < maxIteraciones; iteracion++) {
            const c = (a + b) / 2;
            const vanC = this.calcularVAN(flujos, c);

            convergencia.push({
                iteracion: iteracion + 1,
                tir: c * 100,
                van: vanC,
                intervalo: `[${(a * 100).toFixed(2)}%, ${(b * 100).toFixed(2)}%]`,
                error: Math.abs(vanC)
            });

            if (Math.abs(vanC) < tolerancia) {
                return {
                    tir: c * 100,
                    convergencia: convergencia
                };
            }

            if (vanA * vanC < 0) {
                b = c;
            } else {
                a = c;
            }
        }

        return {
            tir: null,
            convergencia: convergencia
        };
    }

    /**
     * Calcula VAN para un conjunto de flujos y tasa dada
     */
    calcularVAN(flujos, tasa) {
        return flujos.reduce((van, flujo, i) => {
            return van + flujo / Math.pow(1 + tasa, i);
        }, 0);
    }

    /**
     * Calcula TIR usando aproximación simple
     */
    calcularTIRAproximacion(flujos) {
        // Método simple: aproximación lineal entre dos tasas
        const tasaBaja = 0;
        const tasaAlta = 0.5; // 50%

        const vanBaja = this.calcularVAN(flujos, tasaBaja);
        const vanAlta = this.calcularVAN(flujos, tasaAlta);

        if (vanBaja * vanAlta > 0) {
            return null; // No hay cambio de signo
        }

        // Interpolación lineal
        const pendiente = (vanAlta - vanBaja) / (tasaAlta - tasaBaja);
        const tir = tasaBaja - vanBaja / pendiente;

        return tir * 100;
    }

    /**
     * Analiza sensibilidad de la TIR
     */
    analizarSensibilidadTIR(flujos) {
        const sensibilidades = [];
        const variaciones = [-20, -10, -5, 0, 5, 10, 20]; // ±20%

        for (const variacion of variaciones) {
            const flujosModificados = flujos.map((flujo, index) => {
                if (index === 0) return flujo; // Inversión no cambia
                return flujo * (1 + variacion / 100);
            });

            const tir = FinancialUtils.calcularTIRNewton(flujosModificados);
            sensibilidades.push({
                variacion: variacion,
                tir: tir,
                cambio: tir ? tir - (sensibilidades.find(s => s.variacion === 0)?.tir || 0) : 0
            });
        }

        return sensibilidades;
    }

    /**
     * Muestra resultados TIR profesionales con métricas completas
     */
    mostrarResultadosTIRProfesional(resultado, datos) {
        const resultsDiv = document.getElementById('tir-results');
        if (!resultsDiv) return;

        // Construir HTML completo para resultados profesionales
        const html = `
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-xl font-bold text-gray-800">Resultados del Análisis TIR</h4>
              <div class="flex gap-2">
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar PDF" onclick="window.tirCalculator.exportarPDF()">
                  <i class="fas fa-file-pdf"></i>
                </button>
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar Excel" onclick="window.tirCalculator.exportarExcel()">
                  <i class="fas fa-file-excel"></i>
                </button>
              </div>
            </div>

            <!-- Main TIR Result -->
            <div class="text-center mb-8">
              <div class="inline-block bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div class="text-4xl font-bold ${resultado.tir !== null ? 'text-green-600' : 'text-red-600'} mb-2" id="tir-result">
                  ${resultado.tir !== null ? FinancialUtils.formatearPorcentaje(resultado.tir) : 'N/A'}
                </div>
                <div class="text-lg text-gray-600 font-medium">Tasa Interna de Retorno</div>
                <div class="text-sm text-gray-500 mt-1">Método: ${resultado.metodoUsado === 'newton' ? 'Newton-Raphson' : resultado.metodoUsado === 'biseccion' ? 'Bisección' : 'Aproximación'}</div>
              </div>
            </div>

            <!-- Key Metrics -->
            <div class="grid md:grid-cols-3 gap-6 mb-8">
              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-blue-600 mb-1" id="tir-van-tir">${resultado.vanATir !== null ? FinancialUtils.formatearMoneda(resultado.vanATir) : 'N/A'}</div>
                <div class="text-sm text-gray-600 font-medium">VAN a la TIR</div>
                <div class="text-xs text-gray-500 mt-1">Verificación (debe ser ≈ 0)</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-purple-600 mb-1" id="tir-flujo-total">${FinancialUtils.formatearMoneda(resultado.flujoTotal)}</div>
                <div class="text-sm text-gray-600 font-medium">Flujo Total</div>
                <div class="text-xs text-gray-500 mt-1">Suma de flujos operativos</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-indigo-600 mb-1" id="tir-flujo-promedio">${FinancialUtils.formatearMoneda(resultado.flujoPromedio)}</div>
                <div class="text-sm text-gray-600 font-medium">Flujo Promedio</div>
                <div class="text-xs text-gray-500 mt-1">Promedio anual</div>
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
                    <span class="font-medium text-gray-800">Evaluación TIR:</span>
                    <span id="tir-evaluation" class="px-3 py-1 rounded-full text-sm font-semibold ${
                        resultado.evaluacion === 'excelente' ? 'bg-green-100 text-green-800' :
                        resultado.evaluacion === 'muy_buena' ? 'bg-green-100 text-green-800' :
                        resultado.evaluacion === 'buena' ? 'bg-blue-100 text-blue-800' :
                        resultado.evaluacion === 'aceptable' ? 'bg-yellow-100 text-yellow-800' :
                        resultado.evaluacion === 'baja' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                    }">${
                        resultado.evaluacion === 'excelente' ? 'Excelente' :
                        resultado.evaluacion === 'muy_buena' ? 'Muy Buena' :
                        resultado.evaluacion === 'buena' ? 'Buena' :
                        resultado.evaluacion === 'aceptable' ? 'Aceptable' :
                        resultado.evaluacion === 'baja' ? 'Baja' :
                        'No Calculable'
                    }</span>
                  </div>
                  <div class="text-sm text-gray-600" id="tir-evaluation-text">
                    ${resultado.evaluacionTexto}
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-800">VAN con tasa 12%:</span>
                    <span class="px-3 py-1 rounded-full text-sm font-semibold ${
                        resultado.vanEstandar >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">
                      ${FinancialUtils.formatearMoneda(resultado.vanEstandar)}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    VAN usando tasa de descuento del ${resultado.tasaDescuentoEstandar}%
                  </div>
                </div>
              </div>
            </div>

            <!-- Convergence Analysis -->
            ${datos.mostrarConvergencia && resultado.convergencia ? `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-chart-line mr-2 text-gray-600"></i>
                Análisis de Convergencia - Método ${resultado.metodoUsado === 'newton' ? 'Newton-Raphson' : 'Bisección'}
              </h5>

              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left font-medium text-gray-700">Iteración</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">TIR (%)</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">VAN</th>
                      ${resultado.metodoUsado === 'newton' ? '<th class="px-4 py-2 text-right font-medium text-gray-700">Derivada</th>' : '<th class="px-4 py-2 text-center font-medium text-gray-700">Intervalo</th>'}
                      <th class="px-4 py-2 text-right font-medium text-gray-700">Error</th>
                    </tr>
                  </thead>
                  <tbody id="tir-convergence-table" class="divide-y divide-gray-200">
                    <!-- Convergence data will be populated by JavaScript -->
                  </tbody>
                </table>
              </div>
            </div>
            ` : ''}

            <!-- TIR Formula Explanation -->
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-lightbulb mr-2 text-green-600"></i>
                Concepto de la TIR
              </h5>

              <div class="bg-white p-4 rounded-lg mb-4">
                <div class="text-center">
                  <div class="text-lg font-mono text-green-800 mb-2">
                    TIR = r | VAN(r) = 0
                  </div>
                  <div class="text-sm text-gray-600">
                    La TIR es la tasa de descuento que hace que el VAN sea exactamente cero.<br>
                    Matemáticamente: Σ [CFₜ / (1 + TIR)ᵗ] = 0 para t = 0 a n
                  </div>
                </div>
              </div>

              <div class="text-sm text-gray-700 space-y-2">
                <p><strong>Interpretación:</strong> La TIR representa la tasa de rentabilidad real del proyecto, permitiendo comparar inversiones con diferentes escalas y horizontes temporales.</p>
                <p><strong>Comparación con WACC:</strong> Si TIR > WACC, el proyecto crea valor; si TIR < WACC, el proyecto destruye valor.</p>
                <p><strong>Limitaciones:</strong> La TIR asume reinversión de flujos a la propia TIR, lo cual puede no ser realista.</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.tirCalculator.guardarAnalisis()">
                <i class="fas fa-save mr-2"></i>Guardar Análisis
              </button>
              <button class="border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-700 hover:text-white transition duration-300 font-semibold flex items-center justify-center" onclick="window.tirCalculator.compartirAnalisis()">
                <i class="fas fa-share mr-2"></i>Compartir Resultados
              </button>
              <button class="border-2 border-gray-600 text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-700 hover:text-white transition duration-300 font-semibold flex items-center justify-center" onclick="window.tirCalculator.imprimirAnalisis()">
                <i class="fas fa-print mr-2"></i>Imprimir Reporte
              </button>
            </div>
        `;

        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';

        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Crea tabla de convergencia para TIR
     */
    crearTablaConvergenciaTIR(convergencia) {
        const tableBody = document.getElementById('tir-convergence-table');
        if (!tableBody) return;

        let html = '';

        convergencia.forEach((iter, index) => {
            const claseError = iter.error < 0.0001 ? 'text-green-600 font-bold' : 'text-gray-700';

            html += `
                <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
                    <td class="px-4 py-2 text-left font-medium text-gray-700">${iter.iteracion}</td>
                    <td class="px-4 py-2 text-right text-gray-700">${iter.tir.toFixed(6)}%</td>
                    <td class="px-4 py-2 text-right text-gray-700">${iter.van.toFixed(6)}</td>
                    ${iter.derivada !== undefined ?
                        `<td class="px-4 py-2 text-right text-gray-700">${iter.derivada.toFixed(6)}</td>` :
                        `<td class="px-4 py-2 text-center text-gray-700">${iter.intervalo}</td>`
                    }
                    <td class="px-4 py-2 text-right ${claseError}">${iter.error.toFixed(8)}</td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    }

    /**
     * Crea gráfico de sensibilidad para TIR
     */
    crearGraficoSensibilidadTIR(datos, resultado) {
        if (!resultado.sensibilidad || typeof Chart === 'undefined') return;

        const ctx = document.getElementById('grafico-tir-sensibilidad');
        if (!ctx) return;

        const labels = resultado.sensibilidad.map(s => s.variacion + '%');
        const data = resultado.sensibilidad.map(s => s.tir);

        if (this.graficos.tirSensibilidad) {
            this.graficos.tirSensibilidad.destroy();
        }

        this.graficos.tirSensibilidad = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'TIR (%)',
                    data: data,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Análisis de Sensibilidad - TIR vs Variación en Flujos'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'TIR (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Variación en Flujos (%)'
                        }
                    }
                }
            }
        });
    }

    /**
     * Funciones de acción para TIR
     */
    guardarAnalisis() {
        UIUtils.guardarAnalisis('tir');
    }

    compartirAnalisis() {
        UIUtils.compartirAnalisis('tir');
    }

    imprimirAnalisis() {
        UIUtils.imprimirAnalisis('tir');
    }

    exportarPDF() {
        UIUtils.exportarPDF('tir');
    }

    exportarExcel() {
        UIUtils.exportarExcel('tir');
    }

    /**
     * Agrega un nuevo año de flujo de caja
     */
    agregarAnio() {
        // Similar to VAN calculator but for TIR form
        const container = document.getElementById('tir-flujos');
        if (!container) return;

        const existingInputs = container.querySelectorAll('input[name^="flujo"]');
        const nextIndex = existingInputs.length + 1;

        const newInputDiv = document.createElement('div');
        newInputDiv.className = 'flex items-center space-x-3';
        newInputDiv.innerHTML = `
            <span class="text-sm text-gray-600 w-16">Año ${nextIndex}:</span>
            <input
                type="number"
                name="flujo${nextIndex}"
                step="0.01"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
            >
            <button type="button" class="remover-anio text-red-500 hover:text-red-700 px-2">
                <i class="fas fa-trash"></i>
            </button>
        `;

        container.appendChild(newInputDiv);

        // Add event listener to remove button
        const removeBtn = newInputDiv.querySelector('.remover-anio');
        removeBtn.addEventListener('click', () => {
            newInputDiv.remove();
            this.reenumerarAniosTIR();
        });
    }

    reenumerarAniosTIR() {
        const container = document.getElementById('tir-flujos');
        if (!container) return;

        const inputDivs = container.querySelectorAll('.flex.items-center.space-x-3');
        inputDivs.forEach((div, index) => {
            const span = div.querySelector('span');
            const input = div.querySelector('input');
            if (span && input) {
                span.textContent = `Año ${index + 1}:`;
                input.name = `flujo${index + 1}`;
            }
        });
    }

    /**
     * Actualiza simulación en tiempo real
     */
    actualizarSimulacionTiempoReal(input) {
        UIUtils.actualizarSimulacionTiempoReal(input);
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TIRCalculator;
}
