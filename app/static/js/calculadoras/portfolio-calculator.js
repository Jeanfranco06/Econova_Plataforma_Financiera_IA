/**
 * Calculadora de Portafolio - Econova
 * Optimización de portafolios usando teoría moderna de portafolios
 */

class PortfolioCalculator {
    constructor() {
        this.graficos = {};
        this.simulacionTimeout = null;
    }

    /**
     * Optimiza portafolio usando teoría moderna de portafolios
     */
    simular(form) {
        console.log('🚀 Iniciando simulación de portafolio');

        const formData = new FormData(form);
        const datos = {
            nombrePortafolio: formData.get('nombre_portafolio') || 'Mi Portafolio',
            activos: this.parsearActivos(form),
            tasaLibreRiesgo: parseFloat(formData.get('tasa_libre_riesgo')) || 3.0,
            metodoOptimizacion: formData.get('metodo_optimizacion') || 'markowitz',
            objetivo: formData.get('objetivo') || 'max_retorno',
            restriccionRiesgo: parseFloat(formData.get('restriccion_riesgo')) || null,
            horizonteTiempo: formData.get('horizonte_tiempo') || 'anual',
            analisisSensibilidad: formData.get('analisis_sensibilidad') === 'on',
            mostrarFrontera: formData.get('mostrar_frontera') === 'on'
        };

        console.log('📊 Datos parseados:', datos);

        // Validar datos con mensajes específicos
        const errores = ValidationUtils.validarDatosPortafolio(datos);
        if (errores.length > 0) {
            console.error('❌ Errores de validación:', errores);
            ValidationUtils.mostrarErrores(errores, 'portafolio-form');
            return;
        }

        console.log('✅ Validación pasada, calculando portafolio...');

        // Mostrar indicador de carga
        UIUtils.mostrarCarga('portafolio-results', 'Optimizando portafolio...');

        // Calcular optimización de portafolio
        const resultado = this.optimizarPortafolio(datos);
        console.log('📈 Resultado del cálculo:', resultado);

        // Mostrar resultados
        console.log('🖥️ Mostrando resultados...');
        this.mostrarResultadosPortafolioProfesional(resultado, datos);

        // Crear gráficos según opciones seleccionadas
        console.log('Creando gráficos - Chart.js disponible:', typeof Chart !== 'undefined');
        console.log('Opciones seleccionadas:', { mostrarFrontera: datos.mostrarFrontera, analisisSensibilidad: datos.analisisSensibilidad });

        if (typeof Chart !== 'undefined') {
            // Frontera eficiente (siempre se muestra por defecto)
            if (datos.mostrarFrontera !== false) {
                console.log('Creando gráfico de frontera eficiente...');
                setTimeout(() => {
                    try {
                        this.crearGraficoFronteraEficiente(datos, resultado);
                        console.log('Gráfico de frontera creado exitosamente');
                    } catch (error) {
                        console.error('Error creando gráfico de frontera:', error);
                    }
                }, 500);
            }

            // Análisis de sensibilidad si está solicitado
            if (datos.analisisSensibilidad) {
                console.log('Creando gráfico de sensibilidad...');
                setTimeout(() => {
                    try {
                        this.crearGraficoSensibilidadPortafolio(datos, resultado);
                        console.log('Gráfico de sensibilidad creado exitosamente');
                    } catch (error) {
                        console.error('Error creando gráfico de sensibilidad:', error);
                    }
                }, 1000);
            }
        } else {
            console.error('Chart.js no está disponible. Los gráficos no se mostrarán.');
        }

        // Guardar simulación
        UIUtils.guardarSimulacion('portafolio', {
            datos,
            resultado,
            timestamp: new Date(),
            version: '2.0',
            tipo: 'optimizacion_portafolio'
        });

        // Disparar evento
        UIUtils.dispararEvento('portafolioOptimizado', { datos, resultado });
    }

    /**
     * Parsea los activos del formulario
     */
    parsearActivos(form) {
        const activos = [];
        let index = 1;

        while (true) {
            const nombre = form.querySelector(`input[name="activo${index}"]`)?.value;
            const peso = parseFloat(form.querySelector(`input[name="peso${index}"]`)?.value) || 0;
            const rendimiento = parseFloat(form.querySelector(`input[name="rendimiento${index}"]`)?.value) || 0;

            if (!nombre) break;

            activos.push({
                nombre: nombre,
                peso: peso / 100, // Convertir a decimal
                rendimientoEsperado: rendimiento / 100, // Convertir a decimal
                volatilidad: this.generarVolatilidadAleatoria(rendimiento), // Generar volatilidad simulada
                id: index
            });

            index++;
        }

        return activos;
    }

    /**
     * Genera volatilidad aleatoria basada en el rendimiento (simulación)
     */
    generarVolatilidadAleatoria(rendimiento) {
        // Simulación simple: mayor rendimiento = mayor volatilidad
        const baseVolatilidad = 0.15; // 15% base
        const factorRendimiento = Math.abs(rendimiento) * 0.5;
        const volatilidad = baseVolatilidad + factorRendimiento + (Math.random() - 0.5) * 0.1;

        return Math.max(0.05, Math.min(0.50, volatilidad)); // Entre 5% y 50%
    }

    /**
     * Optimiza portafolio usando teoría moderna de portafolios
     */
    optimizarPortafolio(datos) {
        const { activos, tasaLibreRiesgo, objetivo, restriccionRiesgo } = datos;

        // Calcular métricas del portafolio actual
        const portafolioActual = this.calcularMetricasPortafolio(activos);

        // Generar portafolios aleatorios para frontera eficiente
        const portafoliosAleatorios = this.generarPortafoliosAleatorios(activos, 1000);

        // Encontrar portafolio óptimo según objetivo
        let portafolioOptimo = null;

        switch (objetivo) {
            case 'max_retorno':
                portafolioOptimo = this.encontrarMaxRetorno(portafoliosAleatorios);
                break;
            case 'min_riesgo':
                portafolioOptimo = this.encontrarMinRiesgo(portafoliosAleatorios);
                break;
            case 'max_sharpe':
                portafolioOptimo = this.encontrarMaxSharpe(portafoliosAleatorios, tasaLibreRiesgo);
                break;
            case 'riesgo_especifico':
                if (restriccionRiesgo) {
                    portafolioOptimo = this.encontrarRiesgoEspecifico(portafoliosAleatorios, restriccionRiesgo / 100);
                } else {
                    portafolioOptimo = this.encontrarMaxSharpe(portafoliosAleatorios, tasaLibreRiesgo);
                }
                break;
            default:
                portafolioOptimo = this.encontrarMaxSharpe(portafoliosAleatorios, tasaLibreRiesgo);
        }

        // Calcular métricas adicionales
        const tasaDecimal = tasaLibreRiesgo / 100;
        const sharpeRatioActual = (portafolioActual.retorno - tasaDecimal) / portafolioActual.riesgo;
        const sharpeRatio = portafolioOptimo ? (portafolioOptimo.retorno - tasaDecimal) / portafolioOptimo.riesgo : 0;
        const sortinoRatio = portafolioOptimo ? this.calcularSortinoRatio(portafolioOptimo, tasaDecimal) : 0;

        return {
            portafolioActual: portafolioActual,
            portafolioOptimo: portafolioOptimo,
            fronteraEficiente: portafoliosAleatorios.filter(p => this.esEficiente(p, portafoliosAleatorios)),
            sharpeRatioActual: sharpeRatioActual,
            sharpeRatio: sharpeRatio,
            sortinoRatio: sortinoRatio,
            tasaLibreRiesgo: tasaDecimal,
            objetivo: objetivo,
            activos: activos,
            // Análisis de contribución al riesgo
            contribucionRiesgo: portafolioOptimo ? this.calcularContribucionRiesgo(activos, portafolioOptimo.pesos) : null
        };
    }

    /**
     * Calcula métricas básicas de un portafolio
     */
    calcularMetricasPortafolio(activos) {
        const retornoEsperado = activos.reduce((sum, activo) => sum + activo.peso * activo.rendimientoEsperado, 0);
        const varianza = this.calcularVarianzaPortafolio(activos);
        const volatilidad = Math.sqrt(varianza);

        return {
            retorno: retornoEsperado,
            riesgo: volatilidad,
            pesos: activos.map(a => a.peso),
            activos: activos
        };
    }

    /**
     * Calcula varianza del portafolio
     */
    calcularVarianzaPortafolio(activos) {
        let varianza = 0;

        for (let i = 0; i < activos.length; i++) {
            for (let j = 0; j < activos.length; j++) {
                const covarianza = this.calcularCovarianza(activos[i], activos[j]);
                varianza += activos[i].peso * activos[j].peso * covarianza;
            }
        }

        return varianza;
    }

    /**
     * Calcula covarianza entre dos activos (simulación simplificada)
     */
    calcularCovarianza(activo1, activo2) {
        if (activo1 === activo2) {
            return activo1.volatilidad * activo1.volatilidad; // Varianza
        }

        // Simulación de correlación: entre -0.5 y 0.8
        const correlacion = Math.random() * 1.3 - 0.5;
        return correlacion * activo1.volatilidad * activo2.volatilidad;
    }

    /**
     * Genera portafolios aleatorios para análisis
     */
    generarPortafoliosAleatorios(activos, cantidad) {
        const portafolios = [];

        for (let i = 0; i < cantidad; i++) {
            // Generar pesos aleatorios que sumen 1
            const pesos = this.generarPesosAleatorios(activos.length);

            // Calcular métricas del portafolio
            const retorno = activos.reduce((sum, activo, index) => sum + pesos[index] * activo.rendimientoEsperado, 0);
            const varianza = this.calcularVarianzaPortafolioPesos(activos, pesos);
            const riesgo = Math.sqrt(varianza);

            portafolios.push({
                pesos: pesos,
                retorno: retorno,
                riesgo: riesgo,
                sharpeRatio: (retorno - 0.03) / riesgo // Tasa libre de riesgo asumida 3%
            });
        }

        return portafolios;
    }

    /**
     * Genera pesos aleatorios que sumen 1
     */
    generarPesosAleatorios(cantidadActivos) {
        const pesos = [];
        let suma = 0;

        // Generar pesos aleatorios
        for (let i = 0; i < cantidadActivos; i++) {
            const peso = Math.random();
            pesos.push(peso);
            suma += peso;
        }

        // Normalizar para que sumen 1
        return pesos.map(peso => peso / suma);
    }

    /**
     * Calcula varianza del portafolio con pesos específicos
     */
    calcularVarianzaPortafolioPesos(activos, pesos) {
        let varianza = 0;

        for (let i = 0; i < activos.length; i++) {
            for (let j = 0; j < activos.length; j++) {
                const covarianza = this.calcularCovarianza(activos[i], activos[j]);
                varianza += pesos[i] * pesos[j] * covarianza;
            }
        }

        return varianza;
    }

    /**
     * Encuentra portafolio con máximo retorno
     */
    encontrarMaxRetorno(portafolios) {
        return portafolios.reduce((max, p) => p.retorno > max.retorno ? p : max);
    }

    /**
     * Encuentra portafolio con mínimo riesgo
     */
    encontrarMinRiesgo(portafolios) {
        return portafolios.reduce((min, p) => p.riesgo < min.riesgo ? p : min);
    }

    /**
     * Encuentra portafolio con máximo ratio de Sharpe
     */
    encontrarMaxSharpe(portafolios, tasaLibreRiesgo) {
        const tasaDecimal = tasaLibreRiesgo / 100;

        return portafolios.reduce((max, p) => {
            const sharpeActual = (p.retorno - tasaDecimal) / p.riesgo;
            const sharpeMax = (max.retorno - tasaDecimal) / max.riesgo;
            return sharpeActual > sharpeMax ? p : max;
        });
    }

    /**
     * Encuentra portafolio con riesgo específico
     */
    encontrarRiesgoEspecifico(portafolios, riesgoObjetivo) {
        return portafolios.reduce((mejor, p) => {
            const diferenciaActual = Math.abs(p.riesgo - riesgoObjetivo);
            const diferenciaMejor = Math.abs(mejor.riesgo - riesgoObjetivo);
            return diferenciaActual < diferenciaMejor ? p : mejor;
        });
    }

    /**
     * Determina si un portafolio es eficiente (está en la frontera eficiente)
     */
    esEficiente(portafolio, todosPortafolios) {
        return !todosPortafolios.some(p =>
            p.retorno > portafolio.retorno && p.riesgo <= portafolio.riesgo
        );
    }

    /**
     * Calcula ratio de Sortino
     */
    calcularSortinoRatio(portafolio, tasaLibreRiesgo) {
        // Para simplificación, asumimos que no hay retornos negativos
        // En un cálculo real, se usaría la desviación estándar de retornos negativos
        return (portafolio.retorno - tasaLibreRiesgo) / portafolio.riesgo;
    }

    /**
     * Calcula contribución al riesgo de cada activo
     */
    calcularContribucionRiesgo(activos, pesos) {
        const contribuciones = [];

        for (let i = 0; i < activos.length; i++) {
            // Contribución simplificada: peso * volatilidad del activo
            const contribucion = pesos[i] * activos[i].volatilidad;
            contribuciones.push({
                activo: activos[i].nombre,
                contribucion: contribucion,
                porcentaje: (contribucion / pesos.reduce((sum, p, j) => sum + p * activos[j].volatilidad, 0)) * 100
            });
        }

        return contribuciones;
    }

    /**
     * Muestra resultados de portafolio profesional
     */
    mostrarResultadosPortafolioProfesional(resultado, datos) {
        console.log('🎨 Generando HTML de resultados de portafolio...');

        const resultsDiv = document.getElementById('portafolio-results');
        if (!resultsDiv) {
            console.error('❌ No se encontró el elemento portafolio-results');
            return;
        }

        console.log('✅ Elemento portafolio-results encontrado');

        // Construir HTML completo para resultados profesionales
        const html = `
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-xl font-bold text-gray-800">Resultados de Optimización de Portafolio</h4>
              <div class="flex gap-2">
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar PDF" onclick="window.portfolioCalculator.exportarPDF()">
                  <i class="fas fa-file-pdf"></i>
                </button>
                <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar Excel" onclick="window.portfolioCalculator.exportarExcel()">
                  <i class="fas fa-file-excel"></i>
                </button>
              </div>
            </div>

            <!-- Portafolio Actual vs Óptimo -->
            <div class="grid md:grid-cols-2 gap-6 mb-8">
              <!-- Portafolio Actual -->
              <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                  <i class="fas fa-chart-pie mr-2 text-gray-600"></i>
                  Portafolio Actual
                </h5>

                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Retorno Esperado:</span>
                    <span class="font-semibold text-green-600">${FinancialUtils.formatearPorcentaje(resultado.portafolioActual.retorno)}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Riesgo (Volatilidad):</span>
                    <span class="font-semibold text-red-600">${FinancialUtils.formatearPorcentaje(resultado.portafolioActual.riesgo)}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Ratio Sharpe:</span>
                    <span class="font-semibold text-blue-600">${resultado.sharpeRatioActual.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <!-- Portafolio Óptimo -->
              <div class="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg shadow-sm border border-green-200">
                <h5 class="font-bold text-green-800 mb-4 flex items-center">
                  <i class="fas fa-trophy mr-2"></i>
                  Portafolio Óptimo
                </h5>

                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Retorno Esperado:</span>
                    <span class="font-semibold text-green-600">${resultado.portafolioOptimo ? FinancialUtils.formatearPorcentaje(resultado.portafolioOptimo.retorno) : 'N/A'}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Riesgo (Volatilidad):</span>
                    <span class="font-semibold text-red-600">${resultado.portafolioOptimo ? FinancialUtils.formatearPorcentaje(resultado.portafolioOptimo.riesgo) : 'N/A'}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Ratio Sharpe:</span>
                    <span class="font-semibold text-blue-600">${resultado.sharpeRatio.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Distribución Óptima -->
            ${resultado.portafolioOptimo ? `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-balance-scale mr-2 text-gray-600"></i>
                Distribución Óptima de Activos
              </h5>

              <div class="space-y-4">
                ${resultado.portafolioOptimo.pesos.map((peso, index) => `
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-4 h-4 rounded-full bg-orange-500"></div>
                      <span class="font-medium text-gray-700">${datos.activos[index].nombre}</span>
                    </div>
                    <div class="flex items-center space-x-4">
                      <div class="w-32 bg-gray-200 rounded-full h-2">
                        <div class="bg-orange-500 h-2 rounded-full" style="width: ${peso * 100}%"></div>
                      </div>
                      <span class="font-semibold text-orange-600 min-w-[60px] text-right">${FinancialUtils.formatearPorcentaje(peso)}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Métricas de Rendimiento -->
            <div class="grid md:grid-cols-3 gap-6 mb-6">
              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-blue-600 mb-1">${resultado.sharpeRatio.toFixed(2)}</div>
                <div class="text-sm text-gray-600">Ratio de Sharpe</div>
                <div class="text-xs text-gray-500 mt-1">Riesgo Ajustado</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-purple-600 mb-1">${resultado.sortinoRatio.toFixed(2)}</div>
                <div class="text-sm text-gray-600">Ratio de Sortino</div>
                <div class="text-xs text-gray-500 mt-1">Riesgo Bajista</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div class="text-2xl font-bold text-indigo-600 mb-1">${datos.activos.length}</div>
                <div class="text-sm text-gray-600">Número de Activos</div>
                <div class="text-xs text-gray-500 mt-1">Diversificación</div>
              </div>
            </div>

            <!-- Decision Framework -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-gavel mr-2 text-gray-600"></i>
                Recomendaciones de Inversión
              </h5>

              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-800">Estrategia Óptima:</span>
                    <span class="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      ${this.getNombreEstrategia(datos.objetivo)}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    ${this.getDescripcionEstrategia(datos.objetivo)}
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-800">Diversificación:</span>
                    <span class="px-3 py-1 rounded-full text-sm font-semibold ${
                        datos.activos.length >= 5 ? 'bg-green-100 text-green-800' :
                        datos.activos.length >= 3 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }">
                      ${datos.activos.length >= 5 ? 'Excelente' : datos.activos.length >= 3 ? 'Buena' : 'Limitada'}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    ${datos.activos.length} activos en el portafolio
                  </div>
                </div>
              </div>
            </div>

            ${datos.mostrarFrontera ? `
            <!-- Efficient Frontier Chart -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-chart-line mr-2 text-gray-600"></i>
                Frontera Eficiente - Teoría Moderna de Portafolios
              </h5>

              <div class="bg-gray-50 p-4 rounded-lg">
                <canvas id="grafico-portafolio-frontera" width="400" height="200"></canvas>
              </div>

              <div class="mt-4 text-sm text-gray-600">
                <p><strong>Frontera Eficiente:</strong> Conjunto de portafolios que ofrecen el máximo retorno esperado para un nivel dado de riesgo.</p>
                <p><strong>Punto Óptimo:</strong> Portafolio que maximiza el ratio de Sharpe (retorno adicional por unidad de riesgo).</p>
              </div>
            </div>
            ` : ''}

            <!-- Teoría Moderna de Portafolios -->
            <div class="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg border border-orange-200 mb-6">
              <h5 class="font-bold text-orange-800 mb-4 flex items-center">
                <i class="fas fa-lightbulb mr-2"></i>
                Teoría Moderna de Portafolios
              </h5>

              <div class="bg-white p-4 rounded-lg mb-4">
                <div class="text-center">
                  <div class="text-lg font-mono text-orange-800 mb-2">
                    E[rₚ] = Σ(wᵢ × E[rᵢ])<br>
                    σₚ² = ΣΣ(wᵢ × wⱼ × Cov(rᵢ,rⱼ))
                  </div>
                  <div class="text-sm text-gray-600">
                    Retorno esperado del portafolio | Varianza del portafolio
                  </div>
                </div>
              </div>

              <div class="text-sm text-orange-700 space-y-2">
                <p><strong>Principio de Markowitz:</strong> La diversificación reduce el riesgo sin sacrificar retorno esperado.</p>
                <p><strong>Frontera Eficiente:</strong> Conjunto de portafolios que ofrecen el máximo retorno para un nivel dado de riesgo.</p>
                <p><strong>Ratio Sharpe:</strong> Mide el retorno adicional por unidad de riesgo asumido.</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.portfolioCalculator.guardarAnalisis()">
                <i class="fas fa-save mr-2"></i>Guardar Portafolio
              </button>
              <button class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.portfolioCalculator.consultarConIA()">
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
     * Obtiene nombre de estrategia según objetivo
     */
    getNombreEstrategia(objetivo) {
        const estrategias = {
            'max_retorno': 'Máximo Retorno',
            'min_riesgo': 'Mínimo Riesgo',
            'max_sharpe': 'Máximo Sharpe',
            'riesgo_especifico': 'Riesgo Específico'
        };
        return estrategias[objetivo] || 'Optimización General';
    }

    /**
     * Obtiene descripción de estrategia
     */
    getDescripcionEstrategia(objetivo) {
        const descripciones = {
            'max_retorno': 'Enfocado en maximizar el retorno esperado, aceptando mayor volatilidad.',
            'min_riesgo': 'Prioriza la estabilidad y reducción de riesgo, con retorno moderado.',
            'max_sharpe': 'Equilibra retorno y riesgo para obtener la mejor relación riesgo-retorno.',
            'riesgo_especifico': 'Mantiene el riesgo dentro de límites aceptables.'
        };
        return descripciones[objetivo] || 'Optimización personalizada según sus preferencias.';
    }

    /**
     * Crea gráfico de análisis de sensibilidad
     */
    crearGraficoSensibilidadPortafolio(datos, resultado) {
        if (!resultado.portafolioOptimo || typeof Chart === 'undefined') return;

        // Agregar contenedor para el gráfico de sensibilidad en los resultados
        const resultsDiv = document.getElementById('portafolio-results');
        if (!resultsDiv) return;

        // Buscar donde insertar el gráfico de sensibilidad (después del gráfico de frontera)
        const fronteraSection = resultsDiv.querySelector('.bg-white.p-6.rounded-lg.shadow-sm.border.border-gray-200.mb-6 canvas#grafico-portafolio-frontera');
        if (!fronteraSection) return;

        const parentSection = fronteraSection.closest('.bg-white.p-6.rounded-lg.shadow-sm.border.border-gray-200.mb-6');

        // Crear sección de sensibilidad
        const sensibilidadSection = document.createElement('div');
        sensibilidadSection.className = 'bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6';
        sensibilidadSection.innerHTML = `
            <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-chart-line mr-2 text-orange-600"></i>
                Análisis de Sensibilidad - Impacto de Cambios en Rendimientos
            </h5>

            <div class="bg-gray-50 p-4 rounded-lg">
                <canvas id="grafico-portafolio-sensibilidad" width="400" height="200"></canvas>
            </div>

            <div class="mt-4 text-sm text-gray-600">
                <p><strong>Análisis de Sensibilidad:</strong> Muestra cómo cambia el retorno óptimo del portafolio cuando varían los rendimientos esperados de los activos individuales.</p>
                <p><strong>Interpretación:</strong> Una pendiente pronunciada indica que el portafolio es muy sensible a cambios en ese activo específico.</p>
            </div>
        `;

        parentSection.insertAdjacentElement('afterend', sensibilidadSection);

        // Crear datos de sensibilidad
        const sensibilidades = this.calcularSensibilidadPortafolio(datos, resultado);

        const ctx = document.getElementById('grafico-portafolio-sensibilidad');
        if (!ctx) return;

        if (this.graficos.sensibilidad) {
            this.graficos.sensibilidad.destroy();
        }

        this.graficos.sensibilidad = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sensibilidades.labels,
                datasets: sensibilidades.datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Sensibilidad del Portafolio a Cambios en Rendimientos'
                    },
                    legend: {
                        display: true
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Variación en Rendimiento (%)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Retorno del Portafolio (%)'
                        },
                        beginAtZero: false
                    }
                }
            }
        });
    }

    /**
     * Calcula sensibilidad del portafolio a cambios en rendimientos
     */
    calcularSensibilidadPortafolio(datos, resultado) {
        const variaciones = [-20, -10, -5, 0, 5, 10, 20]; // ±20%
        const datasets = [];

        // Para cada activo, calcular cómo cambia el retorno óptimo
        datos.activos.forEach((activo, index) => {
            const dataPoints = [];

            variaciones.forEach(variacion => {
                // Crear copia de datos con rendimiento modificado
                const datosModificados = JSON.parse(JSON.stringify(datos));
                datosModificados.activos[index].rendimientoEsperado = activo.rendimientoEsperado * (1 + variacion / 100);

                // Recalcular portafolio óptimo
                const resultadoModificado = this.optimizarPortafolio(datosModificados);
                const retornoOptimo = resultadoModificado.portafolioOptimo ?
                    resultadoModificado.portafolioOptimo.retorno * 100 : 0;

                dataPoints.push(retornoOptimo);
            });

            datasets.push({
                label: activo.nombre,
                data: dataPoints,
                borderColor: this.getColorByIndex(index),
                backgroundColor: this.getColorByIndex(index, 0.1),
                tension: 0.4
            });
        });

        return {
            labels: variaciones.map(v => v + '%'),
            datasets: datasets
        };
    }

    /**
     * Obtiene color basado en índice
     */
    getColorByIndex(index, alpha = 1) {
        const colors = [
            `rgba(249, 115, 22, ${alpha})`,   // Orange
            `rgba(16, 185, 129, ${alpha})`,   // Green
            `rgba(59, 130, 246, ${alpha})`,   // Blue
            `rgba(168, 85, 247, ${alpha})`,   // Purple
            `rgba(239, 68, 68, ${alpha})`,    // Red
            `rgba(245, 158, 11, ${alpha})`,   // Yellow
            `rgba(6, 182, 212, ${alpha})`,    // Cyan
            `rgba(236, 72, 153, ${alpha})`    // Pink
        ];
        return colors[index % colors.length];
    }

    /**
     * Crea gráfico de frontera eficiente
     */
    crearGraficoFronteraEficiente(datos, resultado) {
        if (!resultado.fronteraEficiente || typeof Chart === 'undefined') return;

        const ctx = document.getElementById('grafico-portafolio-frontera');
        if (!ctx) return;

        const fronteraData = resultado.fronteraEficiente.slice(0, 50); // Limitar puntos para mejor visualización

        if (this.graficos.fronteraEficiente) {
            this.graficos.fronteraEficiente.destroy();
        }

        this.graficos.fronteraEficiente = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Frontera Eficiente',
                    data: fronteraData.map(p => ({ x: p.riesgo * 100, y: p.retorno * 100 })),
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    showLine: true,
                    tension: 0.4
                }, {
                    label: 'Portafolio Actual',
                    data: resultado.portafolioActual ? [{
                        x: resultado.portafolioActual.riesgo * 100,
                        y: resultado.portafolioActual.retorno * 100
                    }] : [],
                    borderColor: '#6b7280',
                    backgroundColor: '#6b7280',
                    pointRadius: 8,
                    pointHoverRadius: 10
                }, {
                    label: 'Portafolio Óptimo',
                    data: resultado.portafolioOptimo ? [{
                        x: resultado.portafolioOptimo.riesgo * 100,
                        y: resultado.portafolioOptimo.retorno * 100
                    }] : [],
                    borderColor: '#16a34a',
                    backgroundColor: '#16a34a',
                    pointRadius: 8,
                    pointHoverRadius: 10
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Frontera Eficiente - Teoría Moderna de Portafolios'
                    },
                    legend: {
                        display: true
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Riesgo (Volatilidad %)'
                        },
                        beginAtZero: true
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Retorno Esperado (%)'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Funciones de acción para portafolio
     */
    guardarAnalisis() {
        UIUtils.guardarAnalisis('portafolio');
    }

    compartirAnalisis() {
        UIUtils.compartirAnalisis('portafolio');
    }

    imprimirAnalisis() {
        UIUtils.imprimirAnalisis('portafolio');
    }

    exportarPDF() {
        UIUtils.exportarPDF('portafolio');
    }

    exportarExcel() {
        UIUtils.exportarExcel('portafolio');
    }

    /**
     * Agrega un nuevo activo al portafolio
     */
    agregarActivo() {
        const container = document.getElementById('portafolio-activos');
        if (!container) return;

        const existingActivos = container.querySelectorAll('.grid.md\\:grid-cols-4');
        const nextIndex = existingActivos.length + 1;

        const newActivoDiv = document.createElement('div');
        newActivoDiv.className = 'grid md:grid-cols-4 gap-4 items-center';
        newActivoDiv.innerHTML = `
            <div>
                <input
                    type="text"
                    name="activo${nextIndex}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Ej: Bono Corporativo"
                    value="Activo ${nextIndex}"
                >
            </div>
            <div>
                <input
                    type="number"
                    name="peso${nextIndex}"
                    min="0"
                    max="100"
                    step="0.01"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="10"
                    value="10"
                >
            </div>
            <div>
                <input
                    type="number"
                    name="rendimiento${nextIndex}"
                    step="0.01"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="6"
                    value="6"
                >
            </div>
            <div class="flex items-center justify-center">
                <button type="button" class="remover-activo text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        container.appendChild(newActivoDiv);

        // Agregar event listener al botón de quitar
        const removeBtn = newActivoDiv.querySelector('.remover-activo');
        removeBtn.addEventListener('click', () => {
            this.quitarActivo(newActivoDiv);
        });
    }

    /**
     * Quita un activo del portafolio
     */
    quitarActivo(activoDiv) {
        const container = document.getElementById('portafolio-activos');
        if (!container) return;

        // No permitir quitar si solo queda un activo
        const remainingActivos = container.querySelectorAll('.grid.md\\:grid-cols-4');
        if (remainingActivos.length <= 1) {
            alert('Debe mantener al menos un activo en el portafolio.');
            return;
        }

        activoDiv.remove();
        this.renumerarActivos();
    }

    /**
     * Renumera los activos después de quitar uno
     */
    renumerarActivos() {
        const container = document.getElementById('portafolio-activos');
        if (!container) return;

        const activoDivs = container.querySelectorAll('.grid.md\\:grid-cols-4');

        activoDivs.forEach((div, index) => {
            const inputs = div.querySelectorAll('input');
            const indexActual = index + 1;

            // Actualizar nombres de los inputs
            if (inputs.length >= 3) {
                inputs[0].name = `activo${indexActual}`;
                inputs[1].name = `peso${indexActual}`;
                inputs[2].name = `rendimiento${indexActual}`;
            }
        });
    }

    /**
     * Actualiza simulación en tiempo real
     */
    actualizarSimulacionTiempoReal(input) {
        UIUtils.actualizarSimulacionTiempoReal(input);
    }

    /**
     * Obtiene los datos actuales de la simulación de portafolio
     */
    obtenerDatosActuales() {
        const simulacion = UIUtils.obtenerSimulacion('portafolio');
        if (!simulacion) return null;

        return {
            tipo: 'portafolio',
            retorno: simulacion.resultado?.portafolioOptimo?.retorno || 0,
            riesgo: simulacion.resultado?.portafolioOptimo?.riesgo || 0,
            sharpe: simulacion.resultado?.sharpeRatio || 0,
            activos_actual: simulacion.datos?.activos?.length || 0,
            activos_optimo: simulacion.resultado?.portafolioOptimo ? simulacion.resultado.portafolioOptimo.pesos.filter(p => p > 0.01).length : 0,
            nombre_proyecto: simulacion.datos?.nombrePortafolio || 'Portafolio'
        };
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioCalculator;
}
