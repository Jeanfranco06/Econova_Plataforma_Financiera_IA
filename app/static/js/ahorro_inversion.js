/**
 * Módulo de Ahorro e Inversión - Econova
 * Funcionalidades para cálculos de ahorro, interés compuesto y recomendaciones
 */

class AhorroInversionManager {
    constructor() {
        this.calculos = {};
        this.recomendaciones = [];
        this.init();
    }

    init() {
        console.log('💰 Módulo de Ahorro e Inversión inicializado');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Escuchar eventos de formularios de ahorro
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'form-ahorro-compuesto') {
                e.preventDefault();
                this.calcularInteresCompuesto(e.target);
            }
            if (e.target.id === 'form-plan-ahorro') {
                e.preventDefault();
                this.generarPlanAhorro(e.target);
            }
            if (e.target.id === 'form-meta-ahorro') {
                e.preventDefault();
                this.calcularMetaAhorro(e.target);
            }
        });

        // Escuchar eventos de cambio en inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('ahorro-input')) {
                this.actualizarCalculosTiempoReal(e.target);
            }
        });
    }

    /**
     * Calcular interés compuesto
     */
    calcularInteresCompuesto(form) {
        const formData = new FormData(form);
        const datos = {
            capitalInicial: parseFloat(formData.get('capital_inicial')) || 0,
            aporteMensual: parseFloat(formData.get('aporte_mensual')) || 0,
            tasaInteres: parseFloat(formData.get('tasa_interes')) || 0,
            tiempo: parseInt(formData.get('tiempo')) || 0,
            frecuencia: formData.get('frecuencia') || 'mensual'
        };

        // Validar datos
        if (!this.validarDatosInteresCompuesto(datos)) {
            this.mostrarError('Por favor, complete todos los campos correctamente.');
            return;
        }

        // Calcular interés compuesto
        const resultado = this.calculoInteresCompuesto(datos);

        // Mostrar resultados
        this.mostrarResultadosInteresCompuesto(resultado, datos);

        // Guardar cálculo
        this.guardarCalculo('interes_compuesto', { datos, resultado });

        // Disparar evento
        this.dispararEvento('interesCompuestoCalculado', resultado);
    }

    calculoInteresCompuesto(datos) {
        const { capitalInicial, aporteMensual, tasaInteres, tiempo, frecuencia } = datos;

        // Convertir tasa según frecuencia
        let tasaPeriodica = tasaInteres / 100;
        let periodos = tiempo;

        switch (frecuencia) {
            case 'diaria':
                tasaPeriodica = tasaPeriodica / 365;
                periodos = tiempo * 365;
                break;
            case 'mensual':
                tasaPeriodica = tasaPeriodica / 12;
                periodos = tiempo * 12;
                break;
            case 'trimestral':
                tasaPeriodica = tasaPeriodica / 4;
                periodos = tiempo * 4;
                break;
            case 'semestral':
                tasaPeriodica = tasaPeriodica / 2;
                periodos = tiempo * 2;
                break;
            case 'anual':
                // Ya está en tasa anual
                break;
        }

        let capitalFinal = capitalInicial;
        let totalAportado = capitalInicial;
        let interesesGenerados = 0;

        // Calcular período por período
        for (let i = 0; i < periodos; i++) {
            // Aplicar interés al capital actual
            const interesPeriodo = capitalFinal * tasaPeriodica;
            capitalFinal += interesPeriodo;

            // Agregar aporte mensual (si aplica)
            if (aporteMensual > 0 && frecuencia === 'mensual') {
                capitalFinal += aporteMensual;
                totalAportado += aporteMensual;
            }

            interesesGenerados += interesPeriodo;
        }

        // Si hay aportes mensuales y frecuencia no es mensual, agregarlos al final
        if (aporteMensual > 0 && frecuencia !== 'mensual') {
            const aportesTotales = aporteMensual * periodos;
            capitalFinal += aportesTotales;
            totalAportado += aportesTotales;
        }

        return {
            capitalFinal: capitalFinal,
            totalAportado: totalAportado,
            interesesGenerados: interesesGenerados,
            rendimientoTotal: ((capitalFinal - totalAportado) / totalAportado) * 100,
            periodos: periodos
        };
    }

    /**
     * Generar plan de ahorro personalizado
     */
    generarPlanAhorro(form) {
        const formData = new FormData(form);
        const datos = {
            ingresosMensuales: parseFloat(formData.get('ingresos_mensuales')) || 0,
            gastosMensuales: parseFloat(formData.get('gastos_mensuales')) || 0,
            objetivoAhorro: parseFloat(formData.get('objetivo_ahorro')) || 0,
            tiempoMeses: parseInt(formData.get('tiempo_meses')) || 0,
            toleranciaRiesgo: formData.get('tolerancia_riesgo') || 'media'
        };

        // Validar datos
        if (!this.validarDatosPlanAhorro(datos)) {
            this.mostrarError('Por favor, complete todos los campos correctamente.');
            return;
        }

        // Generar plan
        const plan = this.crearPlanAhorro(datos);

        // Mostrar plan
        this.mostrarPlanAhorro(plan, datos);

        // Guardar plan
        this.guardarCalculo('plan_ahorro', { datos, plan });

        // Disparar evento
        this.dispararEvento('planAhorroGenerado', plan);
    }

    crearPlanAhorro(datos) {
        const { ingresosMensuales, gastosMensuales, objetivoAhorro, tiempoMeses, toleranciaRiesgo } = datos;

        // Calcular capacidad de ahorro
        const capacidadAhorro = ingresosMensuales - gastosMensuales;
        const porcentajeRecomendado = this.obtenerPorcentajeAhorroRecomendado(toleranciaRiesgo);
        const ahorroRecomendado = Math.max(capacidadAhorro * porcentajeRecomendado, capacidadAhorro * 0.1);

        // Calcular proyección
        const ahorroMensualNecesario = objetivoAhorro / tiempoMeses;
        const deficit = ahorroMensualNecesario - ahorroRecomendado;

        // Generar recomendaciones
        const recomendaciones = [];

        if (capacidadAhorro < 0) {
            recomendaciones.push({
                tipo: 'crítico',
                titulo: 'Revisar gastos',
                descripcion: 'Tus gastos superan tus ingresos. Considera reducir gastos innecesarios.',
                acciones: ['Analizar presupuesto', 'Buscar ingresos adicionales']
            });
        } else if (deficit > 0) {
            recomendaciones.push({
                tipo: 'advertencia',
                titulo: 'Aumentar ahorro',
                descripcion: `Para alcanzar tu meta, necesitas ahorrar S/ ${deficit.toFixed(2)} adicionales por mes.`,
                acciones: ['Buscar ingresos extra', 'Reducir gastos discrecionales']
            });
        } else {
            recomendaciones.push({
                tipo: 'positivo',
                titulo: '¡Plan viable!',
                descripcion: 'Tu plan de ahorro es realista y alcanzable.',
                acciones: ['Mantener disciplina', 'Revisar progreso mensualmente']
            });
        }

        // Generar proyección mensual
        const proyeccion = this.generarProyeccionAhorro(ahorroRecomendado, tiempoMeses, 0.05); // 5% anual

        return {
            capacidadAhorro: capacidadAhorro,
            ahorroRecomendado: ahorroRecomendado,
            ahorroMensualNecesario: ahorroMensualNecesario,
            deficit: Math.max(0, deficit),
            recomendaciones: recomendaciones,
            proyeccion: proyeccion,
            porcentajeAhorro: (ahorroRecomendado / ingresosMensuales) * 100
        };
    }

    obtenerPorcentajeAhorroRecomendado(toleranciaRiesgo) {
        const recomendaciones = {
            'baja': 0.15,    // 15%
            'media': 0.20,   // 20%
            'alta': 0.25     // 25%
        };
        return recomendaciones[toleranciaRiesgo] || 0.20;
    }

    generarProyeccionAhorro(ahorroMensual, meses, tasaAnual) {
        const tasaMensual = tasaAnual / 12;
        const proyeccion = [];

        let ahorroAcumulado = 0;

        for (let mes = 1; mes <= meses; mes++) {
            ahorroAcumulado += ahorroMensual;
            ahorroAcumulado *= (1 + tasaMensual); // Aplicar interés

            proyeccion.push({
                mes: mes,
                ahorroAcumulado: ahorroAcumulado,
                ahorroMensual: ahorroMensual
            });
        }

        return proyeccion;
    }

    /**
     * Calcular meta de ahorro
     */
    calcularMetaAhorro(form) {
        const formData = new FormData(form);
        const datos = {
            capitalActual: parseFloat(formData.get('capital_actual')) || 0,
            ahorroMensual: parseFloat(formData.get('ahorro_mensual')) || 0,
            metaCapital: parseFloat(formData.get('meta_capital')) || 0,
            tasaEsperada: parseFloat(formData.get('tasa_esperada')) || 0
        };

        // Validar datos
        if (!this.validarDatosMetaAhorro(datos)) {
            this.mostrarError('Por favor, complete todos los campos correctamente.');
            return;
        }

        // Calcular tiempo necesario
        const resultado = this.calculoMetaAhorro(datos);

        // Mostrar resultados
        this.mostrarResultadosMetaAhorro(resultado, datos);

        // Guardar cálculo
        this.guardarCalculo('meta_ahorro', { datos, resultado });

        // Disparar evento
        this.dispararEvento('metaAhorroCalculada', resultado);
    }

    calculoMetaAhorro(datos) {
        const { capitalActual, ahorroMensual, metaCapital, tasaEsperada } = datos;
        const tasaMensual = (tasaEsperada / 100) / 12;

        // Calcular capital faltante
        const capitalFaltante = metaCapital - capitalActual;

        if (capitalFaltante <= 0) {
            return {
                tiempoNecesario: 0,
                mensaje: '¡Ya has alcanzado tu meta!',
                capitalFaltante: 0
            };
        }

        // Calcular tiempo necesario usando fórmula de interés compuesto
        let meses = 0;
        let capitalProyectado = capitalActual;

        while (capitalProyectado < metaCapital && meses < 1200) { // Máximo 100 años
            capitalProyectado += ahorroMensual;
            capitalProyectado *= (1 + tasaMensual);
            meses++;
        }

        const anios = Math.floor(meses / 12);
        const mesesRestantes = meses % 12;

        return {
            tiempoNecesario: meses,
            tiempoFormateado: `${anios} años y ${mesesRestantes} meses`,
            capitalFaltante: capitalFaltante,
            capitalFinalProyectado: capitalProyectado,
            totalAportado: capitalActual + (ahorroMensual * meses),
            interesesGenerados: capitalProyectado - capitalActual - (ahorroMensual * meses)
        };
    }

    /**
     * Funciones de validación
     */
    validarDatosInteresCompuesto(datos) {
        return datos.capitalInicial >= 0 &&
               datos.tasaInteres >= 0 && datos.tasaInteres <= 50 &&
               datos.tiempo > 0 && datos.tiempo <= 100;
    }

    validarDatosPlanAhorro(datos) {
        return datos.ingresosMensuales > 0 &&
               datos.gastosMensuales >= 0 &&
               datos.objetivoAhorro > 0 &&
               datos.tiempoMeses > 0;
    }

    validarDatosMetaAhorro(datos) {
        return datos.capitalActual >= 0 &&
               datos.ahorroMensual > 0 &&
               datos.metaCapital > datos.capitalActual &&
               datos.tasaEsperada >= 0 && datos.tasaEsperada <= 30;
    }

    /**
     * Funciones de UI
     */
    mostrarResultadosInteresCompuesto(resultado, datos) {
        const resultadoDiv = document.getElementById('resultado-interes-compuesto');
        if (!resultadoDiv) return;

        resultadoDiv.innerHTML = `
            <div class="resultado-card">
                <h3>Resultados del Cálculo</h3>
                <div class="resultado-grid">
                    <div class="resultado-item">
                        <label>Capital Final:</label>
                        <span class="valor-destacado">${this.formatearMoneda(resultado.capitalFinal)}</span>
                    </div>
                    <div class="resultado-item">
                        <label>Total Aportado:</label>
                        <span>${this.formatearMoneda(resultado.totalAportado)}</span>
                    </div>
                    <div class="resultado-item">
                        <label>Intereses Generados:</label>
                        <span class="valor-positivo">${this.formatearMoneda(resultado.interesesGenerados)}</span>
                    </div>
                    <div class="resultado-item">
                        <label>Rendimiento Total:</label>
                        <span class="valor-positivo">${resultado.rendimientoTotal.toFixed(2)}%</span>
                    </div>
                </div>
                <div class="resultado-info">
                    <p>Períodos calculados: ${resultado.periodos}</p>
                    <p>Tasa periódica: ${(datos.tasaInteres / this.obtenerDivisorFrecuencia(datos.frecuencia)).toFixed(4)}%</p>
                </div>
            </div>
        `;

        resultadoDiv.style.display = 'block';
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    }

    mostrarPlanAhorro(plan, datos) {
        const resultadoDiv = document.getElementById('resultado-plan-ahorro');
        if (!resultadoDiv) return;

        const recomendacionesHTML = plan.recomendaciones.map(rec =>
            `<div class="recomendacion ${rec.tipo}">
                <h4>${rec.titulo}</h4>
                <p>${rec.descripcion}</p>
                <ul>${rec.acciones.map(accion => `<li>${accion}</li>`).join('')}</ul>
            </div>`
        ).join('');

        resultadoDiv.innerHTML = `
            <div class="resultado-card">
                <h3>Tu Plan de Ahorro Personalizado</h3>
                <div class="plan-resumen">
                    <div class="plan-metrica">
                        <span class="metrica-valor">${this.formatearMoneda(plan.capacidadAhorro)}</span>
                        <span class="metrica-label">Capacidad de Ahorro Mensual</span>
                    </div>
                    <div class="plan-metrica">
                        <span class="metrica-valor">${this.formatearMoneda(plan.ahorroRecomendado)}</span>
                        <span class="metrica-label">Ahorro Recomendado</span>
                    </div>
                    <div class="plan-metrica">
                        <span class="metrica-valor">${plan.porcentajeAhorro.toFixed(1)}%</span>
                        <span class="metrica-label">Porcentaje de Ingresos</span>
                    </div>
                </div>

                <div class="recomendaciones">
                    <h4>Recomendaciones</h4>
                    ${recomendacionesHTML}
                </div>

                <div class="proyeccion-ahorro">
                    <h4>Proyección a ${datos.tiempoMeses} meses</h4>
                    <div class="proyeccion-final">
                        <span class="proyeccion-valor">${this.formatearMoneda(plan.proyeccion[plan.proyeccion.length - 1]?.ahorroAcumulado || 0)}</span>
                        <span class="proyeccion-label">Ahorro acumulado proyectado</span>
                    </div>
                </div>
            </div>
        `;

        resultadoDiv.style.display = 'block';
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    }

    mostrarResultadosMetaAhorro(resultado, datos) {
        const resultadoDiv = document.getElementById('resultado-meta-ahorro');
        if (!resultadoDiv) return;

        if (resultado.capitalFaltante <= 0) {
            resultadoDiv.innerHTML = `
                <div class="resultado-card success">
                    <h3>¡Felicidades!</h3>
                    <p class="mensaje-exito">${resultado.mensaje}</p>
                    <p>Tu capital actual: <strong>${this.formatearMoneda(datos.capitalActual)}</strong></p>
                    <p>Meta objetivo: <strong>${this.formatearMoneda(datos.metaCapital)}</strong></p>
                </div>
            `;
        } else {
            resultadoDiv.innerHTML = `
                <div class="resultado-card">
                    <h3>Plan para Alcanzar tu Meta</h3>
                    <div class="resultado-grid">
                        <div class="resultado-item">
                            <label>Capital Faltante:</label>
                            <span>${this.formatearMoneda(resultado.capitalFaltante)}</span>
                        </div>
                        <div class="resultado-item">
                            <label>Tiempo Necesario:</label>
                            <span class="valor-destacado">${resultado.tiempoFormateado}</span>
                        </div>
                        <div class="resultado-item">
                            <label>Capital Final Proyectado:</label>
                            <span>${this.formatearMoneda(resultado.capitalFinalProyectado)}</span>
                        </div>
                        <div class="resultado-item">
                            <label>Intereses Generados:</label>
                            <span class="valor-positivo">${this.formatearMoneda(resultado.interesesGenerados)}</span>
                        </div>
                    </div>
                    <div class="resultado-info">
                        <p>Con un ahorro mensual de ${this.formatearMoneda(datos.ahorroMensual)} al ${datos.tasaEsperada}% anual</p>
                    </div>
                </div>
            `;
        }

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

    obtenerDivisorFrecuencia(frecuencia) {
        const divisores = {
            'diaria': 365,
            'mensual': 12,
            'trimestral': 4,
            'semestral': 2,
            'anual': 1
        };
        return divisores[frecuencia] || 12;
    }

    actualizarCalculosTiempoReal(input) {
        // Implementar cálculos en tiempo real si es necesario
        const form = input.closest('form');
        if (form && form.id === 'form-ahorro-compuesto') {
            // Calcular automáticamente cuando cambian los valores
            clearTimeout(this.calculoTimeout);
            this.calculoTimeout = setTimeout(() => {
                this.calcularInteresCompuesto(form);
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
            const calculosGuardados = JSON.parse(localStorage.getItem('econova_calculos_ahorro') || '{}');
            calculosGuardados[tipo] = this.calculos[tipo];
            localStorage.setItem('econova_calculos_ahorro', JSON.stringify(calculosGuardados));
        } catch (error) {
            console.warn('No se pudo guardar el cálculo:', error);
        }
    }

    dispararEvento(evento, datos) {
        const customEvent = new CustomEvent(`ahorro${evento.charAt(0).toUpperCase() + evento.slice(1)}`, {
            detail: datos
        });
        document.dispatchEvent(customEvent);
    }

    // API pública
    calcularVAN(flujos, tasa) {
        // Implementar cálculo de VAN si es necesario
        return flujos.reduce((van, flujo, index) =>
            van + flujo / Math.pow(1 + tasa, index), 0);
    }

    calcularTIR(flujos) {
        // Implementar cálculo de TIR usando método numérico
        // Esta es una implementación simplificada
        let tir = 0.1; // Estimación inicial
        const maxIter = 100;
        const precision = 0.0001;

        for (let i = 0; i < maxIter; i++) {
            const van = this.calcularVAN(flujos, tir);
            const derivada = flujos.reduce((sum, flujo, index) =>
                sum - index * flujo / Math.pow(1 + tir, index + 1), 0);

            const nuevaTir = tir - van / derivada;

            if (Math.abs(nuevaTir - tir) < precision) {
                return nuevaTir;
            }

            tir = nuevaTir;
        }

        return tir;
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    window.ahorroInversionManager = new AhorroInversionManager();
    console.log('💰 Gestor de Ahorro e Inversión inicializado');
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AhorroInversionManager;
}
