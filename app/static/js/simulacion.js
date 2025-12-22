/**
 * Módulo de Simulación Financiera - Econova
 * Funcionalidades para simulaciones financieras interactivas
 */

class SimulacionFinanciera {
    constructor() {
        this.simulaciones = {};
        this.graficos = {};
        this.init();
    }

    init() {
        console.log('📊 Módulo de Simulación Financiera inicializado');
        this.setupEventListeners();
        this.inicializarGraficos();
    }

    setupEventListeners() {
        // Escuchar eventos de formularios de simulación
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'form-simulacion-van') {
                e.preventDefault();
                this.simularVAN(e.target);
            }
            if (e.target.id === 'form-simulacion-tir') {
                e.preventDefault();
                this.simularTIR(e.target);
            }
            if (e.target.id === 'form-simulacion-portafolio') {
                e.preventDefault();
                this.simularPortafolio(e.target);
            }
            if (e.target.id === 'form-simulacion-sensibilidad') {
                e.preventDefault();
                this.simularSensibilidad(e.target);
            }
        });

        // Escuchar eventos de cambio en inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('simulacion-input')) {
                this.actualizarSimulacionTiempoReal(e.target);
            }
        });

        // Escuchar eventos de actualización de gráficos
        document.addEventListener('actualizarGrafico', (event) => {
            this.actualizarGrafico(event.detail);
        });
    }

    /**
     * Simular VAN con análisis de sensibilidad
     */
    simularVAN(form) {
        const formData = new FormData(form);
        const datos = {
            flujos: this.parsearFlujos(formData.get('flujos')),
            tasaDescuento: parseFloat(formData.get('tasa_descuento')) || 0,
            incluirSensibilidad: formData.get('sensibilidad') === 'on',
            rangoSensibilidad: parseFloat(formData.get('rango_sensibilidad')) || 5
        };

        // Validar datos
        if (!this.validarDatosVAN(datos)) {
            this.mostrarError('Por favor, complete todos los campos correctamente.');
            return;
        }

        // Calcular VAN
        const resultado = this.calcularVAN(datos);

        // Mostrar resultados
        this.mostrarResultadosVAN(resultado, datos);

        // Crear gráfico si está disponible
        if (datos.incluirSensibilidad) {
            this.crearGraficoSensibilidadVAN(datos, resultado);
        }

        // Guardar simulación
        this.guardarSimulacion('van', { datos, resultado });

        // Disparar evento
        this.dispararEvento('vanSimulado', resultado);
    }

    calcularVAN(datos) {
        const { flujos, tasaDescuento } = datos;
        const tasaDecimal = tasaDescuento / 100;

        let van = 0;
        const detalleFlujos = [];

        for (let i = 0; i < flujos.length; i++) {
            const flujo = flujos[i];
            const factorDescuento = Math.pow(1 + tasaDecimal, i);
            const valorPresente = flujo / factorDescuento;

            van += valorPresente;

            detalleFlujos.push({
                periodo: i,
                flujo: flujo,
                factorDescuento: factorDescuento,
                valorPresente: valorPresente
            });
        }

        // Análisis de sensibilidad si está habilitado
        let sensibilidad = null;
        if (datos.incluirSensibilidad) {
            sensibilidad = this.analizarSensibilidadVAN(flujos, tasaDescuento, datos.rangoSensibilidad);
        }

        return {
            van: van,
            detalleFlujos: detalleFlujos,
            sensibilidad: sensibilidad,
            decision: van > 0 ? 'Viable' : van < 0 ? 'No Viable' : 'Indiferente',
            tasaDescuento: tasaDescuento
        };
    }

    analizarSensibilidadVAN(flujos, tasaBase, rango) {
        const sensibilidades = [];
        const pasos = 20;

        for (let i = -rango; i <= rango; i += (rango * 2) / pasos) {
            const tasaActual = tasaBase + i;
            if (tasaActual >= 0) {
                let vanSensibilidad = 0;
                const tasaDecimal = tasaActual / 100;

                for (let j = 0; j < flujos.length; j++) {
                    vanSensibilidad += flujos[j] / Math.pow(1 + tasaDecimal, j);
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
     * Simular TIR con análisis detallado
     */
    simularTIR(form) {
        const formData = new FormData(form);
        const datos = {
            flujos: this.parsearFlujos(formData.get('flujos_tir')),
            metodo: formData.get('metodo_tir') || 'newton',
            maxIteraciones: parseInt(formData.get('max_iteraciones')) || 100,
            tolerancia: parseFloat(formData.get('tolerancia')) || 0.0001
        };

        // Validar datos
        if (!this.validarDatosTIR(datos)) {
            this.mostrarError('Por favor, complete todos los campos correctamente.');
            return;
        }

        // Calcular TIR
        const resultado = this.calcularTIR(datos);

        // Mostrar resultados
        this.mostrarResultadosTIR(resultado, datos);

        // Crear gráfico de convergencia
        this.crearGraficoConvergenciaTIR(resultado);

        // Guardar simulación
        this.guardarSimulacion('tir', { datos, resultado });

        // Disparar evento
        this.dispararEvento('tirSimulado', resultado);
    }

    calcularTIR(datos) {
        const { flujos, metodo, maxIteraciones, tolerancia } = datos;

        // Verificar que hay al menos un flujo negativo y uno positivo
        const tieneNegativo = flujos.some(f => f < 0);
        const tienePositivo = flujos.some(f => f > 0);

        if (!tieneNegativo || !tienePositivo) {
            return {
                tir: null,
                error: 'Se requiere al menos un flujo negativo (inversión) y uno positivo (ingreso)',
                iteraciones: 0,
                convergencia: []
            };
        }

        let tir = 0;
        const convergencia = [];

        if (metodo === 'newton') {
            // Método de Newton-Raphson
            tir = 0.1; // Estimación inicial
            let iteracion = 0;

            while (iteracion < maxIteraciones) {
                let van = 0;
                let derivada = 0;

                for (let i = 0; i < flujos.length; i++) {
                    van += flujos[i] / Math.pow(1 + tir, i);
                    if (i > 0) {
                        derivada -= i * flujos[i] / Math.pow(1 + tir, i + 1);
                    }
                }

                convergencia.push({
                    iteracion: iteracion + 1,
                    tir: tir * 100,
                    van: van,
                    derivada: derivada
                });

                if (Math.abs(van) < tolerancia) {
                    break;
                }

                if (Math.abs(derivada) < 1e-10) {
                    tir += 0.01; // Pequeño ajuste si derivada es muy pequeña
                } else {
                    tir = tir - van / derivada;
                }

                // Limitar TIR a rango razonable
                if (tir < -0.5 || tir > 1) {
                    return {
                        tir: null,
                        error: 'No se pudo encontrar TIR en el rango válido',
                        iteraciones: iteracion + 1,
                        convergencia: convergencia
                    };
                }

                iteracion++;
            }

            if (iteracion >= maxIteraciones) {
                return {
                    tir: null,
                    error: 'No convergió en el número máximo de iteraciones',
                    iteraciones: iteracion,
                    convergencia: convergencia
                };
            }

        } else {
            // Método de aproximaciones sucesivas
            let tirInferior = 0;
            let tirSuperior = 1;
            let iteracion = 0;

            while (iteracion < maxIteraciones) {
                const tirMedio = (tirInferior + tirSuperior) / 2;

                let vanInferior = 0;
                let vanSuperior = 0;
                let vanMedio = 0;

                for (let i = 0; i < flujos.length; i++) {
                    vanInferior += flujos[i] / Math.pow(1 + tirInferior, i);
                    vanSuperior += flujos[i] / Math.pow(1 + tirSuperior, i);
                    vanMedio += flujos[i] / Math.pow(1 + tirMedio, i);
                }

                convergencia.push({
                    iteracion: iteracion + 1,
                    tir: tirMedio * 100,
                    van: vanMedio
                });

                if (Math.abs(vanMedio) < tolerancia) {
                    tir = tirMedio;
                    break;
                }

                if (vanMedio > 0) {
                    tirInferior = tirMedio;
                } else {
                    tirSuperior = tirMedio;
                }

                iteracion++;
            }

            if (iteracion >= maxIteraciones) {
                return {
                    tir: null,
                    error: 'No convergió en el número máximo de iteraciones',
                    iteraciones: iteracion,
                    convergencia: convergencia
                };
            }
        }

        return {
            tir: tir * 100, // Convertir a porcentaje
            iteraciones: convergencia.length,
            convergencia: convergencia,
            metodo: metodo
        };
    }

    /**
     * Simular portafolio de inversión
     */
    simularPortafolio(form) {
        const formData = new FormData(form);
        const datos = {
            activos: [
                {
                    nombre: formData.get('activo1_nombre') || 'Activo 1',
                    peso: parseFloat(formData.get('activo1_peso')) || 0,
                    retorno: parseFloat(formData.get('activo1_retorno')) || 0,
                    riesgo: parseFloat(formData.get('activo1_riesgo')) || 0
                },
                {
                    nombre: formData.get('activo2_nombre') || 'Activo 2',
                    peso: parseFloat(formData.get('activo2_peso')) || 0,
                    retorno: parseFloat(formData.get('activo2_retorno')) || 0,
                    riesgo: parseFloat(formData.get('activo2_riesgo')) || 0
                },
                {
                    nombre: formData.get('activo3_nombre') || 'Activo 3',
                    peso: parseFloat(formData.get('activo3_peso')) || 0,
                    retorno: parseFloat(formData.get('activo3_retorno')) || 0,
                    riesgo: parseFloat(formData.get('activo3_riesgo')) || 0
                }
            ].filter(activo => activo.peso > 0)
        };

        // Validar datos
        if (!this.validarDatosPortafolio(datos)) {
            this.mostrarError('Por favor, complete correctamente los datos del portafolio.');
            return;
        }

        // Calcular portafolio
        const resultado = this.calcularPortafolio(datos);

        // Mostrar resultados
        this.mostrarResultadosPortafolio(resultado, datos);

        // Crear gráfico de eficiencia
        this.crearGraficoPortafolio(resultado);

        // Guardar simulación
        this.guardarSimulacion('portafolio', { datos, resultado });

        // Disparar evento
        this.dispararEvento('portafolioSimulado', resultado);
    }

    calcularPortafolio(datos) {
        const { activos } = datos;

        // Calcular retorno esperado del portafolio
        const retornoPortafolio = activos.reduce((sum, activo) =>
            sum + (activo.peso * activo.retorno), 0) / 100; // Convertir a decimal

        // Calcular riesgo del portafolio (varianza)
        let varianzaPortafolio = 0;

        // Para simplificar, asumimos correlación = 0.5 entre activos
        const correlacion = 0.5;

        for (let i = 0; i < activos.length; i++) {
            for (let j = 0; j < activos.length; j++) {
                const peso_i = activos[i].peso;
                const peso_j = activos[j].peso;
                const riesgo_i = activos[i].riesgo / 100; // Convertir a decimal
                const riesgo_j = activos[j].riesgo / 100;

                if (i === j) {
                    varianzaPortafolio += peso_i * peso_j * riesgo_i * riesgo_j;
                } else {
                    varianzaPortafolio += peso_i * peso_j * riesgo_i * riesgo_j * correlacion;
                }
            }
        }

        const riesgoPortafolio = Math.sqrt(varianzaPortafolio) * 100; // Convertir a porcentaje

        // Calcular ratio de Sharpe (aproximado)
        const tasaLibreRiesgo = 0.03; // 3% aproximado
        const sharpeRatio = (retornoPortafolio - tasaLibreRiesgo) / (riesgoPortafolio / 100);

        // Diversificación
        const diversificacion = activos.length > 1 ? 'Bien diversificado' : 'Poco diversificado';

        return {
            retornoPortafolio: retornoPortafolio * 100, // Convertir a porcentaje
            riesgoPortafolio: riesgoPortafolio,
            sharpeRatio: sharpeRatio,
            diversificacion: diversificacion,
            activos: activos,
            fronteraEficiente: this.calcularFronteraEficiente(activos)
        };
    }

    calcularFronteraEficiente(activos) {
        // Simplificación: calcular algunos puntos de la frontera eficiente
        const puntos = [];
        for (let peso1 = 0; peso1 <= 1; peso1 += 0.1) {
            if (activos.length >= 2) {
                const peso2 = 1 - peso1;
                const retorno = peso1 * activos[0].retorno + peso2 * activos[1].retorno;
                const riesgo = Math.sqrt(
                    peso1 * peso1 * activos[0].riesgo * activos[0].riesgo +
                    peso2 * peso2 * activos[1].riesgo * activos[1].riesgo +
                    2 * peso1 * peso2 * activos[0].riesgo * activos[1].riesgo * 0.5
                );

                puntos.push({ retorno: retorno, riesgo: riesgo });
            }
        }

        return puntos;
    }

    /**
     * Funciones de gráficos
     */
    inicializarGraficos() {
        // Verificar si Chart.js está disponible
        if (typeof Chart !== 'undefined') {
            console.log('📊 Chart.js disponible para gráficos');
        } else {
            console.warn('⚠️ Chart.js no está cargado - gráficos no disponibles');
        }
    }

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

    crearGraficoConvergenciaTIR(resultado) {
        if (!resultado.convergencia || typeof Chart === 'undefined') return;

        const ctx = document.getElementById('grafico-tir-convergencia');
        if (!ctx) return;

        const labels = resultado.convergencia.map(c => 'Iter ' + c.iteracion);
        const data = resultado.convergencia.map(c => c.tir);

        if (this.graficos.tirConvergencia) {
            this.graficos.tirConvergencia.destroy();
        }

        this.graficos.tirConvergencia = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'TIR (%)',
                    data: data,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Convergencia del Método Numérico - TIR'
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'TIR (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Iteración'
                        }
                    }
                }
            }
        });
    }

    crearGraficoPortafolio(resultado) {
        if (!resultado.activos || typeof Chart === 'undefined') return;

        const ctx = document.getElementById('grafico-portafolio');
        if (!ctx) return;

        const labels = resultado.activos.map(a => a.nombre);
        const pesos = resultado.activos.map(a => a.peso * 100);

        if (this.graficos.portafolio) {
            this.graficos.portafolio.destroy();
        }

        this.graficos.portafolio = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: pesos,
                    backgroundColor: [
                        '#00ffff',
                        '#ff6b6b',
                        '#4ecdc4',
                        '#45b7d1',
                        '#96ceb4'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución del Portafolio'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Funciones de validación
     */
    validarDatosVAN(datos) {
        return datos.flujos && datos.flujos.length > 0 &&
               datos.tasaDescuento >= 0 && datos.tasaDescuento <= 50;
    }

    validarDatosTIR(datos) {
        return datos.flujos && datos.flujos.length > 1;
    }

    validarDatosPortafolio(datos) {
        const sumaPesos = datos.activos.reduce((sum, activo) => sum + activo.peso, 0);
        return datos.activos.length > 0 &&
               Math.abs(sumaPesos - 1) < 0.01 && // Suma de pesos ≈ 1
               datos.activos.every(activo => activo.peso > 0 && activo.retorno >= 0 && activo.riesgo >= 0);
    }

    /**
     * Funciones auxiliares
     */
    parsearFlujos(flujosString) {
        if (!flujosString) return [];

        return flujosString.split(',')
            .map(f => parseFloat(f.trim()))
            .filter(f => !isNaN(f));
    }

    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(valor);
    }

    formatearPorcentaje(valor) {
        return (valor).toFixed(2) + '%';
    }

    actualizarSimulacionTiempoReal(input) {
        // Implementar actualizaciones en tiempo real si es necesario
        const form = input.closest('form');
        if (form) {
            clearTimeout(this.simulacionTimeout);
            this.simulacionTimeout = setTimeout(() => {
                // Trigger simulation update
                const event = new CustomEvent('actualizarGrafico', {
                    detail: { formId: form.id, inputId: input.id }
                });
                document.dispatchEvent(event);
            }, 300);
        }
    }

    actualizarGrafico(detalles) {
        // Implementar actualizaciones de gráficos en tiempo real
        console.log('Actualizando gráfico:', detalles);
    }

    mostrarError(mensaje) {
        // Usar sistema de mensajes contextuales si está disponible
        if (window.contextualMessages) {
            window.contextualMessages.error({
                title: 'Error en simulación',
                body: mensaje
            });
        } else {
            alert(`Error: ${mensaje}`);
        }
    }

    guardarSimulacion(tipo, datos) {
        this.simulaciones[tipo] = {
            ...datos,
            timestamp: new Date(),
            id: Date.now()
        };

        // Guardar en localStorage
        try {
            const simulacionesGuardadas = JSON.parse(localStorage.getItem('econova_simulaciones') || '{}');
            simulacionesGuardadas[tipo] = this.simulaciones[tipo];
            localStorage.setItem('econova_simulaciones', JSON.stringify(simulacionesGuardadas));
        } catch (error) {
            console.warn('No se pudo guardar la simulación:', error);
        }
    }

    dispararEvento(evento, datos) {
        const customEvent = new CustomEvent(`simulacion${evento.charAt(0).toUpperCase() + evento.slice(1)}`, {
            detail: datos
        });
        document.dispatchEvent(customEvent);
    }

    // API pública
    obtenerSimulacion(tipo) {
        return this.simulaciones[tipo] || null;
    }

    listarSimulaciones() {
        return Object.keys(this.simulaciones);
    }

    exportarResultados(tipo) {
        const simulacion = this.simulaciones[tipo];
        if (!simulacion) return null;

        return {
            tipo: tipo,
            datos: simulacion.datos,
            resultados: simulacion.resultado,
            timestamp: simulacion.timestamp,
            exportado: new Date()
        };
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    window.simulacionFinanciera = new SimulacionFinanciera();
    console.log('📊 Simulación Financiera inicializada');
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimulacionFinanciera;
}
