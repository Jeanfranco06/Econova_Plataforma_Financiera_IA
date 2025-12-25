/**
 * Calculadora VAN - Econova
 * Funcionalidades específicas para análisis de Valor Actual Neto
 */

class VANCalculator {
    constructor() {
        this.graficos = {};
        this.simulacionTimeout = null;
    }

    /**
     * Simula VAN con análisis completo de ingeniería económica
     */
    simular(form) {
        const formData = new FormData(form);
        const datos = {
            nombreProyecto: formData.get('nombre_proyecto') || 'Proyecto sin nombre',
            sector: formData.get('sector') || 'general',
            inversion: parseFloat(formData.get('inversion')) || 0,
            flujos: UIUtils.parsearFlujosVAN(form),
            tasaDescuento: parseFloat(formData.get('tasa')) || 0,
            incluirSensibilidad: formData.get('sensibilidad') === 'on',
            incluirRiesgo: formData.get('riesgo') === 'on',
            rangoSensibilidad: 10 // ±10% por defecto para análisis de sensibilidad
        };

        // Validar datos con mensajes específicos
        const errores = ValidationUtils.validarDatosVANDetallado(datos);
        if (errores.length > 0) {
            ValidationUtils.mostrarErrores(errores, 'van-form');
            return;
        }

        // Mostrar indicador de carga
        UIUtils.mostrarCarga('van-results', 'Calculando análisis económico...');

        // Calcular VAN con análisis completo
        const resultado = this.calcularVANCompleto(datos);

        // Crear análisis de riesgo si solicitado (antes de mostrar resultados)
        if (datos.incluirRiesgo) {
            resultado.riesgo = this.analizarRiesgoVAN(datos, resultado);
        }

        // Mostrar resultados
        this.mostrarResultadosVANProfesional(resultado, datos);

        // Crear tabla de flujos de caja
        this.crearTablaFlujosVAN(resultado.detalleFlujos, datos.inversion);

        // Crear gráfico si está disponible y solicitado
        if (datos.incluirSensibilidad && typeof Chart !== 'undefined') {
            this.crearGraficoSensibilidadVAN(datos, resultado);
        }

        // Guardar simulación
        UIUtils.guardarSimulacion('van', {
            datos,
            resultado,
            timestamp: new Date(),
            version: '2.0',
            tipo: 'ingenieria_economica'
        });

        // Disparar evento
        UIUtils.dispararEvento('vanSimulado', { datos, resultado });
    }

    /**
     * Calcula VAN completo con métricas adicionales de ingeniería económica
     */
    calcularVANCompleto(datos) {
        const { flujos, tasaDescuento, inversion } = datos;
        const tasaDecimal = tasaDescuento / 100;

        let van = -inversion; // VAN = -inversión inicial + flujos descontados
        let vanAcumulado = -inversion;
        const detalleFlujos = [];

        // Calcular VAN y detalles de flujos
        for (let i = 0; i < flujos.length; i++) {
            const flujo = flujos[i];
            const factorDescuento = Math.pow(1 + tasaDecimal, i + 1); // +1 porque el flujo 0 es la inversión
            const valorPresente = flujo / factorDescuento;

            van += valorPresente;
            vanAcumulado += valorPresente;

            detalleFlujos.push({
                periodo: i + 1,
                flujo: flujo,
                factorDescuento: factorDescuento,
                valorPresente: valorPresente,
                vanAcumulado: vanAcumulado
            });
        }

        // Calcular TIR usando método mejorado
        const tir = FinancialUtils.calcularTIRNewton([-inversion, ...flujos]);

        // Calcular período de recuperación (payback)
        const payback = FinancialUtils.calcularPaybackPeriod(inversion, flujos);

        // Calcular VAN/Inversión (rentabilidad relativa)
        const vanSobreInversion = van / inversion;

        // Determinar decisión económica
        const decision = FinancialUtils.determinarDecisionEconomica(van);

        // Calcular métricas adicionales
        const metricas = FinancialUtils.calcularMetricasVAN(van, inversion, flujos);

        return {
            van: van,
            tir: tir,
            payback: payback,
            vanSobreInversion: vanSobreInversion,
            roi: metricas.roi,
            bcr: metricas.bcr,
            detalleFlujos: detalleFlujos,
            decision: decision.decision,
            decisionTexto: decision.decisionTexto,
            decisionColor: decision.decisionColor,
            tasaDescuento: tasaDescuento,
            inversion: inversion,
            horizonte: flujos.length,
            // Análisis de sensibilidad si solicitado
            sensibilidad: datos.incluirSensibilidad ? this.analizarSensibilidadVAN(flujos, tasaDescuento, 10, inversion) : null
        };
    }

    /**
     * Analiza sensibilidad del VAN
     */
    analizarSensibilidadVAN(flujos, tasaBase, rango, inversion = 0) {
        const sensibilidades = [];
        const pasos = 20;

        for (let i = -rango; i <= rango; i += (rango * 2) / pasos) {
            const tasaActual = tasaBase + i;
            if (tasaActual >= 0) {
                let vanSensibilidad = -inversion; // Incluir inversión inicial
                const tasaDecimal = tasaActual / 100;

                for (let j = 0; j < flujos.length; j++) {
                    vanSensibilidad += flujos[j] / Math.pow(1 + tasaDecimal, j + 1); // +1 porque el flujo 0 es la inversión
                }

                sensibilidades.push({
                    tasa: tasaActual,
                    van: vanSensibilidad
                });
            }
        }

        return sensibilidades;
    }

    /**
     * Muestra resultados VAN profesionales con métricas completas
     */
    mostrarResultadosVANProfesional(resultado, datos) {
        const resultsDiv = document.getElementById('van-results');
        if (!resultsDiv) return;

        // Construir HTML completo para resultados profesionales
        const html = `
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-xl font-bold text-gray-800">Resultados del Análisis Económico</h4>
              <div class="flex gap-2">
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar PDF" onclick="window.vanCalculator.exportarPDF()">
                  <i class="fas fa-file-pdf"></i>
                </button>
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar Excel" onclick="window.vanCalculator.exportarExcel()">
                  <i class="fas fa-file-excel"></i>
                </button>
              </div>
            </div>

            <!-- Main Metrics -->
            <div class="grid md:grid-cols-4 gap-6 mb-8">
              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold ${resultado.van >= 0 ? 'text-green-600' : 'text-red-600'} mb-1" id="van-result">${FinancialUtils.formatearMoneda(resultado.van)}</div>
                <div class="text-sm text-gray-600 font-medium">Valor Actual Neto</div>
                <div class="text-xs text-gray-500 mt-1">VAN</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-green-600 mb-1" id="van-tir">${resultado.tir !== null ? FinancialUtils.formatearPorcentaje(resultado.tir) : 'N/A'}</div>
                <div class="text-sm text-gray-600 font-medium">Tasa Interna de Retorno</div>
                <div class="text-xs text-gray-500 mt-1">TIR</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-purple-600 mb-1" id="van-payback">${resultado.payback !== null ? resultado.payback.toFixed(1) + ' años' : 'No recuperable'}</div>
                <div class="text-sm text-gray-600 font-medium">Periodo de Recuperación</div>
                <div class="text-xs text-gray-500 mt-1">Payback</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-orange-600 mb-1" id="van-vpn-inversion">${FinancialUtils.formatearPorcentaje(resultado.vanSobreInversion)}</div>
                <div class="text-sm text-gray-600 font-medium">VAN/Inversión</div>
                <div class="text-xs text-gray-500 mt-1">Rentabilidad Relativa</div>
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
                    <span class="font-medium text-gray-800">Evaluación:</span>
                    <span id="van-evaluation" class="px-3 py-1 rounded-full text-sm font-semibold ${
                        resultado.decision === 'viable' ? 'bg-green-100 text-green-800' :
                        resultado.decision === 'no_viable' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }">${
                        resultado.decision === 'viable' ? 'Proyecto Viable' :
                        resultado.decision === 'no_viable' ? 'Proyecto No Viable' :
                        'Proyecto Indiferente'
                    }</span>
                  </div>
                  <div class="text-sm text-gray-600" id="van-evaluation-text">
                    ${resultado.decisionTexto}
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-800">Confianza:</span>
                    <span class="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      Alta
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    Basado en datos completos y consistentes
                  </div>
                </div>
              </div>
            </div>

            <!-- Cash Flow Table -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-table mr-2 text-gray-600"></i>
                Desglose de Flujos de Caja
              </h5>

              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left font-medium text-gray-700">Período</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">Flujo de Caja</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">Factor Descuento</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">Valor Presente</th>
                      <th class="px-4 py-2 text-right font-medium text-gray-700">VAN Acumulado</th>
                    </tr>
                  </thead>
                  <tbody id="van-cashflow-table" class="divide-y divide-gray-200">
                    <!-- Table rows will be populated by JavaScript -->
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Additional Metrics -->
            <div class="grid md:grid-cols-3 gap-6 mb-6">
              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-lg font-bold text-blue-600 mb-1">${FinancialUtils.formatearPorcentaje(resultado.roi)}</div>
                <div class="text-sm text-gray-600">Retorno sobre Inversión</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-lg font-bold text-indigo-600 mb-1">${resultado.bcr.toFixed(2)}</div>
                <div class="text-sm text-gray-600">Beneficio-Costo Ratio</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-lg font-bold text-teal-600 mb-1">${resultado.horizonte} años</div>
                <div class="text-sm text-gray-600">Horizonte de Análisis</div>
              </div>
            </div>

            ${datos.incluirSensibilidad ? `
            <!-- Análisis de Sensibilidad -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-chart-line mr-2 text-blue-600"></i>
                Análisis de Sensibilidad - VAN vs Tasa de Descuento
              </h5>

              <div class="mb-4">
                <canvas id="grafico-van-sensibilidad" width="400" height="200"></canvas>
              </div>

              <div class="bg-blue-50 p-4 rounded-lg">
                <h6 class="font-semibold text-blue-800 mb-2">Interpretación</h6>
                <p class="text-blue-700 text-sm">
                  El gráfico muestra cómo cambia el VAN cuando varía la tasa de descuento.
                  Una pendiente pronunciada indica alta sensibilidad a cambios en la tasa de descuento.
                  ${resultado.sensibilidad ? `Rango analizado: ${(Math.min(...resultado.sensibilidad.map(s => s.tasa)))}% - ${(Math.max(...resultado.sensibilidad.map(s => s.tasa)))}%` : ''}
                </p>
              </div>
            </div>
            ` : ''}

            ${datos.incluirRiesgo && resultado.riesgo ? `
            <!-- Evaluación de Riesgo -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-exclamation-triangle mr-2 text-orange-600"></i>
                Evaluación de Riesgo del Proyecto
              </h5>

              <!-- Nivel de Riesgo Principal -->
              <div class="bg-gray-50 p-4 rounded-lg mb-6">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium text-gray-800">Nivel de Riesgo:</span>
                  <span class="px-3 py-1 rounded-full text-sm font-semibold ${resultado.riesgo.nivelRiesgoColor} bg-current">
                    ${resultado.riesgo.nivelRiesgo}
                  </span>
                </div>
                <p class="text-sm text-gray-600">${resultado.riesgo.nivelRiesgoTexto}</p>
              </div>

              <!-- Métricas de Riesgo -->
              <div class="grid md:grid-cols-3 gap-4 mb-6">
                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                  <div class="text-lg font-bold text-red-600 mb-1">${FinancialUtils.formatearMoneda(resultado.riesgo.volatilidad)}</div>
                  <div class="text-sm text-gray-600">Volatilidad (Desv. Estándar)</div>
                  <div class="text-xs text-gray-500 mt-1">${resultado.riesgo.volatilidadRelativa.toFixed(1)}% relativo</div>
                </div>

                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                  <div class="text-lg font-bold text-purple-600 mb-1">${FinancialUtils.formatearMoneda(resultado.riesgo.var95)}</div>
                  <div class="text-sm text-gray-600">Value at Risk (VaR 95%)</div>
                  <div class="text-xs text-gray-500 mt-1">Pérdida máxima estimada</div>
                </div>

                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                  <div class="text-lg font-bold text-indigo-600 mb-1">${resultado.riesgo.escenarios.length}</div>
                  <div class="text-sm text-gray-600">Escenarios Analizados</div>
                  <div class="text-xs text-gray-500 mt-1">Optimista, Base, Pesimista</div>
                </div>
              </div>

              <!-- Escenarios de Riesgo -->
              <div class="mb-6">
                <h6 class="font-semibold text-gray-800 mb-3">Análisis por Escenarios</h6>
                <div class="space-y-3">
                  ${resultado.riesgo.escenarios.map(escenario => `
                    <div class="bg-gray-50 p-3 rounded-lg">
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-medium ${escenario.color}">${escenario.nombre}</span>
                        <span class="font-bold ${escenario.van >= 0 ? 'text-green-600' : 'text-red-600'}">
                          ${FinancialUtils.formatearMoneda(escenario.van)}
                        </span>
                      </div>
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600">Variación: ${escenario.variacion >= 0 ? '+' : ''}${escenario.variacion.toFixed(1)}%</span>
                        <span class="text-gray-600">Flujos: ${escenario.factor === 1.0 ? 'Base' : escenario.factor > 1.0 ? '+' + Math.round(((escenario.factor - 1) * 100) * 100) / 100 + '%' : Math.round(((escenario.factor - 1) * 100) * 100) / 100 + '%'}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Recomendaciones -->
              <div class="bg-orange-50 p-4 rounded-lg">
                <h6 class="font-semibold text-orange-800 mb-2 flex items-center">
                  <i class="fas fa-lightbulb mr-2"></i>
                  Recomendaciones de Gestión de Riesgo
                </h6>
                <ul class="text-orange-700 text-sm space-y-1">
                  ${resultado.riesgo.recomendaciones.map(rec => `<li>• ${rec}</li>`).join('')}
                </ul>
              </div>
            </div>
            ` : ''}

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.vanCalculator.guardarAnalisis()">
                <i class="fas fa-save mr-2"></i>Guardar Análisis
              </button>
              <button id="van-consultar-ia" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300 font-semibold flex items-center justify-center">
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
     * Crea tabla de flujos de caja para VAN
     */
    crearTablaFlujosVAN(detalleFlujos, inversion) {
        const tableBody = document.getElementById('van-cashflow-table');
        if (!tableBody) return;

        let html = '';

        // Fila de inversión inicial
        html += `
            <tr class="bg-red-50">
                <td class="px-4 py-2 text-left font-medium text-gray-700">Inversión Inicial</td>
                <td class="px-4 py-2 text-right text-red-600 font-medium">${FinancialUtils.formatearMoneda(-inversion)}</td>
                <td class="px-4 py-2 text-right text-gray-500">-</td>
                <td class="px-4 py-2 text-right text-red-600 font-medium">${FinancialUtils.formatearMoneda(-inversion)}</td>
                <td class="px-4 py-2 text-right text-red-600 font-bold">${FinancialUtils.formatearMoneda(-inversion)}</td>
            </tr>
        `;

        // Filas de flujos de caja
        detalleFlujos.forEach((flujo, index) => {
            // flujo.vanAcumulado ya incluye la inversión inicial restada
            const claseVAN = flujo.vanAcumulado >= 0 ? 'text-green-600' : 'text-red-600';

            html += `
                <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
                    <td class="px-4 py-2 text-left font-medium text-gray-700">Año ${flujo.periodo}</td>
                    <td class="px-4 py-2 text-right text-gray-700">${FinancialUtils.formatearMoneda(flujo.flujo)}</td>
                    <td class="px-4 py-2 text-right text-gray-600">${flujo.factorDescuento.toFixed(4)}</td>
                    <td class="px-4 py-2 text-right text-gray-700">${FinancialUtils.formatearMoneda(flujo.valorPresente)}</td>
                    <td class="px-4 py-2 text-right font-bold ${claseVAN}">${FinancialUtils.formatearMoneda(flujo.vanAcumulado)}</td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    }

    /**
     * Crea gráfico de sensibilidad para VAN
     */
    crearGraficoSensibilidadVAN(datos, resultado) {
        if (!resultado.sensibilidad || typeof Chart === 'undefined') return;

        const ctx = document.getElementById('grafico-van-sensibilidad');
        if (!ctx) return;

        const labels = resultado.sensibilidad.map(s => s.tasa.toFixed(1) + '%');
        const data = resultado.sensibilidad.map(s => s.van);

        if (this.graficos.vanSensibilidad) {
            this.graficos.vanSensibilidad.destroy();
        }

        this.graficos.vanSensibilidad = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'VAN',
                    data: data,
                    borderColor: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Análisis de Sensibilidad - VAN vs Tasa de Descuento'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'VAN (S/)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tasa de Descuento (%)'
                        }
                    }
                }
            }
        });
    }

    /**
     * Funciones de acción para VAN
     */
    guardarAnalisis() {
        UIUtils.guardarAnalisis('van');
    }

    compartirAnalisis() {
        UIUtils.compartirAnalisis('van');
    }

    imprimirAnalisis() {
        UIUtils.imprimirAnalisis('van');
    }

    exportarPDF() {
        UIUtils.exportarPDF('van');
    }

    exportarExcel() {
        UIUtils.exportarExcel('van');
    }

    /**
     * Agrega un nuevo año de flujo de caja
     */
    agregarAnio() {
        UIUtils.agregarAnioVAN();
    }

    /**
     * Actualiza simulación en tiempo real
     */
    actualizarSimulacionTiempoReal(input) {
        UIUtils.actualizarSimulacionTiempoReal(input);
    }

    /**
     * Analiza riesgo del VAN basado en variabilidad de flujos y escenarios
     */
    analizarRiesgoVAN(datos, resultado) {
        const { flujos, tasaDescuento, inversion } = datos;
        const tasaDecimal = tasaDescuento / 100;

        // Calcular VAN base
        const vanBase = resultado.van;

        // Escenarios de riesgo: optimista (+20%), base, pesimista (-20%)
        const escenarios = [
            { nombre: 'Optimista', factor: 1.2, color: 'text-green-600' },
            { nombre: 'Base', factor: 1.0, color: 'text-blue-600' },
            { nombre: 'Pesimista', factor: 0.8, color: 'text-red-600' }
        ];

        const analisisEscenarios = escenarios.map(escenario => {
            const flujosAjustados = flujos.map(flujo => flujo * escenario.factor);
            let vanEscenario = -inversion;

            for (let i = 0; i < flujosAjustados.length; i++) {
                vanEscenario += flujosAjustados[i] / Math.pow(1 + tasaDecimal, i + 1);
            }

            return {
                ...escenario,
                van: vanEscenario,
                variacion: Math.round((((vanEscenario - vanBase) / Math.abs(vanBase)) * 100) * 100) / 100 // Redondear a 2 decimales
            };
        });

        // Calcular volatilidad (desviación estándar de escenarios)
        const vans = analisisEscenarios.map(e => e.van);
        const promedio = vans.reduce((a, b) => a + b, 0) / vans.length;
        const varianza = vans.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) / vans.length;
        const volatilidad = Math.sqrt(varianza);

        // Calcular Value at Risk (VaR) aproximado (percentil 5% de escenarios)
        const vansOrdenados = [...vans].sort((a, b) => a - b);
        const var95 = vansOrdenados[Math.floor(vansOrdenados.length * 0.05)];

        // Clasificar nivel de riesgo
        let nivelRiesgo, nivelRiesgoColor, nivelRiesgoTexto;
        const volatilidadRelativa = volatilidad / Math.abs(vanBase);

        if (volatilidadRelativa < 0.1) {
            nivelRiesgo = 'Bajo';
            nivelRiesgoColor = 'text-green-600';
            nivelRiesgoTexto = 'Riesgo bajo. El proyecto es relativamente estable.';
        } else if (volatilidadRelativa < 0.3) {
            nivelRiesgo = 'Moderado';
            nivelRiesgoColor = 'text-yellow-600';
            nivelRiesgoTexto = 'Riesgo moderado. Considerar estrategias de mitigación.';
        } else {
            nivelRiesgo = 'Alto';
            nivelRiesgoColor = 'text-red-600';
            nivelRiesgoTexto = 'Riesgo alto. Requiere análisis más detallado y mitigación.';
        }

        return {
            escenarios: analisisEscenarios,
            volatilidad: volatilidad,
            volatilidadRelativa: volatilidadRelativa * 100,
            var95: var95,
            nivelRiesgo: nivelRiesgo,
            nivelRiesgoColor: nivelRiesgoColor,
            nivelRiesgoTexto: nivelRiesgoTexto,
            recomendaciones: this.generarRecomendacionesRiesgo(volatilidadRelativa)
        };
    }

    /**
     * Genera recomendaciones basadas en el nivel de riesgo
     */
    generarRecomendacionesRiesgo(volatilidadRelativa) {
        if (volatilidadRelativa < 0.1) {
            return [
                'El proyecto tiene bajo riesgo. Proceder con confianza.',
                'Monitorear indicadores clave durante la ejecución.',
                'Considerar diversificación de fuentes de ingresos.'
            ];
        } else if (volatilidadRelativa < 0.3) {
            return [
                'Implementar planes de contingencia para escenarios adversos.',
                'Diversificar fuentes de financiamiento.',
                'Establecer indicadores de alerta temprana.',
                'Considerar seguros o coberturas contra riesgos.'
            ];
        } else {
            return [
                'Realizar análisis de sensibilidad más detallado.',
                'Desarrollar planes de mitigación específicos.',
                'Considerar postergar o rediseñar el proyecto.',
                'Evaluar alternativas con menor riesgo.',
                'Consultar con expertos en gestión de riesgos.'
            ];
        }
    }

    /**
     * Obtiene los datos actuales de la simulación VAN
     */
    obtenerDatosActuales() {
        const simulacion = UIUtils.obtenerSimulacion('van');
        if (!simulacion) return null;

        return {
            tipo_analisis: 'van',
            tipo: 'van',
            van: simulacion.resultado?.van || 0,
            tir: simulacion.resultado?.tir || 0,
            payback: simulacion.resultado?.payback || 0,
            inversion: simulacion.datos?.inversion || 0,
            tasa: simulacion.datos?.tasaDescuento || 0,
            flujos: simulacion.datos?.flujos || [],
            decision: simulacion.resultado?.decision || 'indiferente',
            nombre_proyecto: simulacion.datos?.nombreProyecto || 'Proyecto VAN'
        };
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VANCalculator;
}
