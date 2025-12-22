/**
 * Módulo de Préstamos - Econova
 * Funcionalidades para análisis de préstamos y capacidad de pago
 */

class PrestamoManager {
    constructor() {
        this.calculos = {};
        this.init();
    }

    init() {
        console.log('🏦 Módulo de Préstamos inicializado');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Escuchar eventos de formularios de préstamos
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'form-calculo-prestamo') {
                e.preventDefault();
                this.calcularPrestamo(e.target);
            }
            if (e.target.id === 'form-capacidad-pago') {
                e.preventDefault();
                this.analizarCapacidadPago(e.target);
            }
            if (e.target.id === 'form-comparador-prestamos') {
                e.preventDefault();
                this.compararPrestamos(e.target);
            }
        });

        // Escuchar eventos de cambio en inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('prestamo-input')) {
                this.actualizarCalculosTiempoReal(e.target);
            }
        });
    }

    /**
     * Calcular préstamo (cuota mensual)
     */
    calcularPrestamo(form) {
        const formData = new FormData(form);
        const datos = {
            capital: parseFloat(formData.get('capital')) || 0,
            tasaAnual: parseFloat(formData.get('tasa_anual')) || 0,
            plazoMeses: parseInt(formData.get('plazo_meses')) || 0,
            tipoPrestamo: formData.get('tipo_prestamo') || 'frances'
        };

        // Validar datos
        if (!this.validarDatosPrestamo(datos)) {
            this.mostrarError('Por favor, complete todos los campos correctamente.');
            return;
        }

        // Calcular préstamo
        const resultado = this.calculoPrestamo(datos);

        // Mostrar resultados
        this.mostrarResultadosPrestamo(resultado, datos);

        // Guardar cálculo
        this.guardarCalculo('prestamo', { datos, resultado });

        // Disparar evento
        this.dispararEvento('prestamoCalculado', resultado);
    }

    calculoPrestamo(datos) {
        const { capital, tasaAnual, plazoMeses, tipoPrestamo } = datos;
        const tasaMensual = (tasaAnual / 100) / 12;

        let cuotaMensual = 0;
        let totalPagar = 0;
        let totalIntereses = 0;
        const amortizacion = [];

        if (tipoPrestamo === 'frances') {
            // Sistema Francés (cuota constante)
            if (tasaMensual === 0) {
                cuotaMensual = capital / plazoMeses;
            } else {
                cuotaMensual = capital * (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) /
                              (Math.pow(1 + tasaMensual, plazoMeses) - 1);
            }

            let saldoPendiente = capital;

            for (let mes = 1; mes <= plazoMeses; mes++) {
                const interesMes = saldoPendiente * tasaMensual;
                const capitalMes = cuotaMensual - interesMes;
                saldoPendiente -= capitalMes;

                amortizacion.push({
                    mes: mes,
                    cuota: cuotaMensual,
                    interes: interesMes,
                    capital: capitalMes,
                    saldoPendiente: Math.max(0, saldoPendiente)
                });

                totalIntereses += interesMes;
            }

            totalPagar = capital + totalIntereses;

        } else if (tipoPrestamo === 'aleman') {
            // Sistema Alemán (capital constante)
            const capitalMensual = capital / plazoMeses;

            for (let mes = 1; mes <= plazoMeses; mes++) {
                const saldoPendiente = capital - (capitalMensual * (mes - 1));
                const interesMes = saldoPendiente * tasaMensual;
                const cuotaMes = capitalMensual + interesMes;

                amortizacion.push({
                    mes: mes,
                    cuota: cuotaMes,
                    interes: interesMes,
                    capital: capitalMensual,
                    saldoPendiente: Math.max(0, saldoPendiente - capitalMensual)
                });

                totalIntereses += interesMes;
            }

            cuotaMensual = amortizacion[0].cuota; // Primera cuota
            totalPagar = capital + totalIntereses;
        }

        return {
            cuotaMensual: cuotaMensual,
            totalPagar: totalPagar,
            totalIntereses: totalIntereses,
            porcentajeInteres: (totalIntereses / capital) * 100,
            amortizacion: amortizacion
        };
    }

    /**
     * Analizar capacidad de pago
     */
    analizarCapacidadPago(form) {
        const formData = new FormData(form);
        const datos = {
            ingresosMensuales: parseFloat(formData.get('ingresos_mensuales')) || 0,
            gastosMensuales: parseFloat(formData.get('gastos_mensuales')) || 0,
            cuotaMaxima: parseFloat(formData.get('cuota_maxima')) || 0,
            scoreCrediticio: parseInt(formData.get('score_crediticio')) || 0
        };

        // Validar datos
        if (!this.validarDatosCapacidadPago(datos)) {
            this.mostrarError('Por favor, complete todos los campos correctamente.');
            return;
        }

        // Analizar capacidad
        const analisis = this.analisisCapacidadPago(datos);

        // Mostrar resultados
        this.mostrarAnalisisCapacidadPago(analisis, datos);

        // Guardar análisis
        this.guardarCalculo('capacidad_pago', { datos, analisis });

        // Disparar evento
        this.dispararEvento('capacidadPagoAnalizada', analisis);
    }

    analisisCapacidadPago(datos) {
        const { ingresosMensuales, gastosMensuales, cuotaMaxima, scoreCrediticio } = datos;

        // Calcular ratios financieros
        const capacidadAhorro = ingresosMensuales - gastosMensuales;
        const ratioDeudaIngreso = (gastosMensuales / ingresosMensuales) * 100;
        const ratioPagoDeuda = (cuotaMaxima / ingresosMensuales) * 100;

        // Evaluar capacidad según reglas bancarias
        const regla35 = ingresosMensuales * 0.35; // Máximo 35% de ingresos para deuda
        const regla30 = ingresosMensuales * 0.30; // Recomendado 30% de ingresos para deuda

        let capacidadPago = 'baja';
        let montoMaximoRecomendado = 0;
        let nivelRiesgo = 'alto';
        const recomendaciones = [];

        // Evaluar capacidad
        if (ratioPagoDeuda <= 25) {
            capacidadPago = 'excelente';
            nivelRiesgo = 'bajo';
            montoMaximoRecomendado = regla35 - cuotaMaxima;
        } else if (ratioPagoDeuda <= 30) {
            capacidadPago = 'buena';
            nivelRiesgo = 'medio';
            montoMaximoRecomendado = regla30 - cuotaMaxima;
        } else if (ratioPagoDeuda <= 35) {
            capacidadPago = 'regular';
            nivelRiesgo = 'medio-alto';
            montoMaximoRecomendado = Math.max(0, regla30 - cuotaMaxima);
        } else {
            capacidadPago = 'limitada';
            nivelRiesgo = 'alto';
            montoMaximoRecomendado = 0;
            recomendaciones.push('Considera reducir gastos antes de solicitar préstamos');
        }

        // Evaluar score crediticio
        if (scoreCrediticio >= 800) {
            recomendaciones.push('Excelente score crediticio - tendrás las mejores tasas');
        } else if (scoreCrediticio >= 700) {
            recomendaciones.push('Buen score crediticio - tasas competitivas disponibles');
        } else if (scoreCrediticio >= 600) {
            recomendaciones.push('Score regular - revisa opciones con tasas más altas');
        } else {
            recomendaciones.push('Score bajo - considera mejorar historial crediticio primero');
            nivelRiesgo = 'muy_alto';
        }

        // Evaluar capacidad de ahorro
        if (capacidadAhorro < 0) {
            recomendaciones.push('Tus gastos superan ingresos - revisa presupuesto');
            nivelRiesgo = 'muy_alto';
        } else if (capacidadAhorro < ingresosMensuales * 0.1) {
            recomendaciones.push('Capacidad de ahorro limitada - considera aumentar ingresos');
        }

        return {
            capacidadPago: capacidadPago,
            nivelRiesgo: nivelRiesgo,
            montoMaximoRecomendado: Math.max(0, montoMaximoRecomendado),
            ratioDeudaIngreso: ratioDeudaIngreso,
            ratioPagoDeuda: ratioPagoDeuda,
            capacidadAhorro: capacidadAhorro,
            regla35: regla35,
            regla30: regla30,
            recomendaciones: recomendaciones,
            scoreCrediticio: scoreCrediticio
        };
    }

    /**
     * Comparar préstamos
     */
    compararPrestamos(form) {
        const formData = new FormData(form);
        const datos = {
            capital: parseFloat(formData.get('capital_comparar')) || 0,
            plazoMeses: parseInt(formData.get('plazo_comparar')) || 0,
            opciones: [
                {
                    nombre: 'Banco A',
                    tasaAnual: parseFloat(formData.get('tasa_banco_a')) || 0
                },
                {
                    nombre: 'Banco B',
                    tasaAnual: parseFloat(formData.get('tasa_banco_b')) || 0
                },
                {
                    nombre: 'Banco C',
                    tasaAnual: parseFloat(formData.get('tasa_banco_c')) || 0
                }
            ]
        };

        // Validar datos
        if (!this.validarDatosComparacion(datos)) {
            this.mostrarError('Por favor, complete todos los campos correctamente.');
            return;
        }

        // Comparar opciones
        const comparacion = this.compararOpcionesPrestamo(datos);

        // Mostrar comparación
        this.mostrarComparacionPrestamos(comparacion, datos);

        // Guardar comparación
        this.guardarCalculo('comparacion_prestamos', { datos, comparacion });

        // Disparar evento
        this.dispararEvento('prestamosComparados', comparacion);
    }

    compararOpcionesPrestamo(datos) {
        const { capital, plazoMeses, opciones } = datos;
        const resultados = [];

        opciones.forEach(opcion => {
            const calculo = this.calculoPrestamo({
                capital: capital,
                tasaAnual: opcion.tasaAnual,
                plazoMeses: plazoMeses,
                tipoPrestamo: 'frances'
            });

            resultados.push({
                nombre: opcion.nombre,
                tasaAnual: opcion.tasaAnual,
                cuotaMensual: calculo.cuotaMensual,
                totalPagar: calculo.totalPagar,
                totalIntereses: calculo.totalIntereses,
                ahorro: 0 // Se calcula después
            });
        });

        // Calcular ahorros respecto a la opción más cara
        const masCara = Math.max(...resultados.map(r => r.totalPagar));
        resultados.forEach(resultado => {
            resultado.ahorro = masCara - resultado.totalPagar;
        });

        // Ordenar por cuota mensual (más conveniente)
        resultados.sort((a, b) => a.cuotaMensual - b.cuotaMensual);

        return {
            opciones: resultados,
            mejorOpcion: resultados[0],
            peorOpcion: resultados[resultados.length - 1],
            ahorroMaximo: Math.max(...resultados.map(r => r.ahorro))
        };
    }

    /**
     * Funciones de validación
     */
    validarDatosPrestamo(datos) {
        return datos.capital > 0 &&
               datos.tasaAnual >= 0 && datos.tasaAnual <= 50 &&
               datos.plazoMeses > 0 && datos.plazoMeses <= 360;
    }

    validarDatosCapacidadPago(datos) {
        return datos.ingresosMensuales > 0 &&
               datos.gastosMensuales >= 0 &&
               datos.cuotaMaxima >= 0 &&
               datos.scoreCrediticio >= 0 && datos.scoreCrediticio <= 1000;
    }

    validarDatosComparacion(datos) {
        return datos.capital > 0 &&
               datos.plazoMeses > 0 &&
               datos.opciones.every(op => op.tasaAnual >= 0 && op.tasaAnual <= 50);
    }

    /**
     * Funciones de UI
     */
    mostrarResultadosPrestamo(resultado, datos) {
        const resultadoDiv = document.getElementById('resultado-prestamo');
        if (!resultadoDiv) return;

        resultadoDiv.innerHTML = `
            <div class="resultado-card">
                <h3>Resultados del Préstamo</h3>
                <div class="resultado-grid">
                    <div class="resultado-item">
                        <label>Cuota Mensual:</label>
                        <span class="valor-destacado">${this.formatearMoneda(resultado.cuotaMensual)}</span>
                    </div>
                    <div class="resultado-item">
                        <label>Total a Pagar:</label>
                        <span>${this.formatearMoneda(resultado.totalPagar)}</span>
                    </div>
                    <div class="resultado-item">
                        <label>Total Intereses:</label>
                        <span class="valor-negativo">${this.formatearMoneda(resultado.totalIntereses)}</span>
                    </div>
                    <div class="resultado-item">
                        <label>Porcentaje Interés:</label>
                        <span>${resultado.porcentajeInteres.toFixed(2)}%</span>
                    </div>
                </div>

                <div class="detalles-adicionales">
                    <h4>Detalles del Préstamo</h4>
                    <ul>
                        <li><strong>Capital:</strong> ${this.formatearMoneda(datos.capital)}</li>
                        <li><strong>Tasa Anual:</strong> ${datos.tasaAnual}%</li>
                        <li><strong>Plazo:</strong> ${datos.plazoMeses} meses</li>
                        <li><strong>Sistema:</strong> ${datos.tipoPrestamo === 'frances' ? 'Francés' : 'Alemán'}</li>
                    </ul>
                </div>

                <div class="amortizacion-preview">
                    <h4>Primeras Cuotas</h4>
                    <div class="amortizacion-table">
                        <div class="amortizacion-row header">
                            <span>Mes</span>
                            <span>Cuota</span>
                            <span>Interés</span>
                            <span>Capital</span>
                            <span>Saldo</span>
                        </div>
                        ${resultado.amortizacion.slice(0, 5).map(cuota => `
                            <div class="amortizacion-row">
                                <span>${cuota.mes}</span>
                                <span>${this.formatearMoneda(cuota.cuota)}</span>
                                <span>${this.formatearMoneda(cuota.interes)}</span>
                                <span>${this.formatearMoneda(cuota.capital)}</span>
                                <span>${this.formatearMoneda(cuota.saldoPendiente)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        resultadoDiv.style.display = 'block';
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    }

    mostrarAnalisisCapacidadPago(analisis, datos) {
        const resultadoDiv = document.getElementById('resultado-capacidad-pago');
        if (!resultadoDiv) return;

        const colorCapacidad = {
            'excelente': 'success',
            'buena': 'success',
            'regular': 'warning',
            'limitada': 'error'
        };

        const recomendacionesHTML = analisis.recomendaciones.map(rec =>
            `<li>${rec}</li>`
        ).join('');

        resultadoDiv.innerHTML = `
            <div class="resultado-card">
                <h3>Análisis de Capacidad de Pago</h3>

                <div class="capacidad-resumen">
                    <div class="capacidad-principal">
                        <span class="capacidad-label">Capacidad de Pago:</span>
                        <span class="capacidad-valor ${colorCapacidad[analisis.capacidadPago]}">
                            ${analisis.capacidadPago.toUpperCase()}
                        </span>
                    </div>
                    <div class="capacidad-secundaria">
                        <span class="riesgo-label">Nivel de Riesgo:</span>
                        <span class="riesgo-valor ${analisis.nivelRiesgo.replace('_', '-')}">
                            ${analisis.nivelRiesgo.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>

                <div class="metricas-financieras">
                    <div class="metrica">
                        <span class="metrica-label">Ratio Deuda/Ingreso:</span>
                        <span class="metrica-valor">${analisis.ratioDeudaIngreso.toFixed(1)}%</span>
                    </div>
                    <div class="metrica">
                        <span class="metrica-label">Ratio Pago Deuda:</span>
                        <span class="metrica-valor">${analisis.ratioPagoDeuda.toFixed(1)}%</span>
                    </div>
                    <div class="metrica">
                        <span class="metrica-label">Capacidad Ahorro:</span>
                        <span class="metrica-valor">${this.formatearMoneda(analisis.capacidadAhorro)}</span>
                    </div>
                    <div class="metrica">
                        <span class="metrica-label">Monto Máximo Recomendado:</span>
                        <span class="metrica-valor ${analisis.montoMaximoRecomendado > 0 ? 'success' : 'error'}">
                            ${this.formatearMoneda(analisis.montoMaximoRecomendado)}
                        </span>
                    </div>
                </div>

                ${analisis.recomendaciones.length > 0 ? `
                    <div class="recomendaciones">
                        <h4>Recomendaciones</h4>
                        <ul>${recomendacionesHTML}</ul>
                    </div>
                ` : ''}

                <div class="reglas-bancarias">
                    <h4>Referencias Bancarias</h4>
                    <div class="regla">
                        <span>Regla 35% (máximo):</span>
                        <span>${this.formatearMoneda(analisis.regla35)}</span>
                    </div>
                    <div class="regla">
                        <span>Regla 30% (recomendado):</span>
                        <span>${this.formatearMoneda(analisis.regla30)}</span>
                    </div>
                </div>
            </div>
        `;

        resultadoDiv.style.display = 'block';
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    }

    mostrarComparacionPrestamos(comparacion, datos) {
        const resultadoDiv = document.getElementById('resultado-comparador');
        if (!resultadoDiv) return;

        const opcionesHTML = comparacion.opciones.map(opcion => `
            <div class="opcion-prestamo ${opcion.nombre === comparacion.mejorOpcion.nombre ? 'mejor-opcion' : ''}">
                <h4>${opcion.nombre}</h4>
                <div class="opcion-detalles">
                    <div class="opcion-metrica">
                        <span>Tasa Anual:</span>
                        <span>${opcion.tasaAnual}%</span>
                    </div>
                    <div class="opcion-metrica">
                        <span>Cuota Mensual:</span>
                        <span>${this.formatearMoneda(opcion.cuotaMensual)}</span>
                    </div>
                    <div class="opcion-metrica">
                        <span>Total a Pagar:</span>
                        <span>${this.formatearMoneda(opcion.totalPagar)}</span>
                    </div>
                    <div class="opcion-metrica">
                        <span>Total Intereses:</span>
                        <span>${this.formatearMoneda(opcion.totalIntereses)}</span>
                    </div>
                    ${opcion.ahorro > 0 ? `
                        <div class="opcion-metrica ahorro">
                            <span>Ahorro vs más caro:</span>
                            <span>${this.formatearMoneda(opcion.ahorro)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        resultadoDiv.innerHTML = `
            <div class="resultado-card">
                <h3>Comparación de Préstamos</h3>

                <div class="comparacion-info">
                    <p><strong>Capital:</strong> ${this.formatearMoneda(datos.capital)}</p>
                    <p><strong>Plazo:</strong> ${datos.plazoMeses} meses</p>
                </div>

                <div class="opciones-comparacion">
                    ${opcionesHTML}
                </div>

                <div class="comparacion-resumen">
                    <div class="resumen-item">
                        <span>Mejor Opción:</span>
                        <span class="mejor-opcion">${comparacion.mejorOpcion.nombre}</span>
                    </div>
                    <div class="resumen-item">
                        <span>Ahorro Máximo:</span>
                        <span class="ahorro-maximo">${this.formatearMoneda(comparacion.ahorroMaximo)}</span>
                    </div>
                </div>

                <div class="comparacion-nota">
                    <p><em>💡 La comparación se basa en el sistema francés de amortización.</em></p>
                </div>
            </div>
        `;

        resultadoDiv.style.display = 'block';
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    }

    mostrarError(mensaje) {
        // Usar sistema de mensajes contextuales si está disponible
        if (window.contextualMessages) {
            window.contextualMessages.error({
                title: 'Error en el cálculo',
                body: mensaje
            });
        } else {
            alert(`Error: ${mensaje}`);
        }
    }

    /**
     * Funciones auxiliares
     */
    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(valor);
    }

    actualizarCalculosTiempoReal(input) {
        // Implementar cálculos en tiempo real si es necesario
        const form = input.closest('form');
        if (form && form.id === 'form-calculo-prestamo') {
            clearTimeout(this.calculoTimeout);
            this.calculoTimeout = setTimeout(() => {
                this.calcularPrestamo(form);
            }, 500);
        }
    }

    guardarCalculo(tipo, datos) {
        this.calculos[tipo] = {
            ...datos,
            timestamp: new Date(),
            id: Date.now()
        };

        // Guardar en localStorage
        try {
            const calculosGuardados = JSON.parse(localStorage.getItem('econova_calculos_prestamos') || '{}');
            calculosGuardados[tipo] = this.calculos[tipo];
            localStorage.setItem('econova_calculos_prestamos', JSON.stringify(calculosGuardados));
        } catch (error) {
            console.warn('No se pudo guardar el cálculo:', error);
        }
    }

    dispararEvento(evento, datos) {
        const customEvent = new CustomEvent(`prestamo${evento.charAt(0).toUpperCase() + evento.slice(1)}`, {
            detail: datos
        });
        document.dispatchEvent(customEvent);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    window.prestamoManager = new PrestamoManager();
    console.log('🏦 Gestor de Préstamos inicializado');
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrestamoManager;
}
