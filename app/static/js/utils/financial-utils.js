/**
 * Utilidades Financieras - Econova
 * Funciones matemáticas y de formateo compartidas
 */

class FinancialUtils {
    /**
     * Formatea un número como moneda en soles peruanos
     */
    static formatearMoneda(valor) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(valor);
    }

    /**
     * Formatea un número como porcentaje
     */
    static formatearPorcentaje(valor) {
        return (valor).toFixed(2) + '%';
    }

    /**
     * Calcula el VAN de una serie de flujos a una tasa dada
     */
    static calcularVAN(flujos, tasaDescuento) {
        const tasaDecimal = tasaDescuento / 100;
        return flujos.reduce((van, flujo, i) => {
            return van + flujo / Math.pow(1 + tasaDecimal, i);
        }, 0);
    }

    /**
     * Calcula la TIR usando método de Newton-Raphson
     */
    static calcularTIRNewton(flujos, maxIteraciones = 100, tolerancia = 0.000001) {
        if (!flujos || flujos.length < 2) return null;

        // Verificar que hay al menos un flujo negativo y uno positivo
        const tieneNegativo = flujos.some(f => f < 0);
        const tienePositivo = flujos.some(f => f > 0);

        if (!tieneNegativo || !tienePositivo) return null;

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

            if (Math.abs(van) < tolerancia) {
                return tir * 100; // Convertir a porcentaje
            }

            if (Math.abs(derivada) > 1e-10) {
                const nuevaTir = tir - van / derivada;
                if (Math.abs(nuevaTir - tir) < tolerancia) {
                    return nuevaTir * 100;
                }
                tir = nuevaTir;
            } else {
                tir += 0.001;
            }

            if (tir < -0.9 || tir > 5) {
                return null; // No convergió
            }
        }

        return null; // No convergió en iteraciones máximas
    }

    /**
     * Calcula el período de recuperación (payback period)
     */
    static calcularPaybackPeriod(inversion, flujos) {
        if (!flujos || flujos.length === 0 || inversion <= 0) return null;

        let acumulado = -inversion;
        let periodo = 0;

        for (let i = 0; i < flujos.length; i++) {
            acumulado += flujos[i];
            periodo = i + 1;

            if (acumulado >= 0) {
                // Si recuperamos la inversión exactamente en este período
                if (acumulado === 0) {
                    return periodo;
                }
                // Si ya recuperamos la inversión, calcular fracción del período
                const exceso = acumulado;
                const flujoActual = flujos[i];
                const fraccion = exceso / flujoActual;

                return periodo - fraccion;
            }
        }

        // Si no se recupera la inversión en el período analizado
        return null;
    }

    /**
     * Calcula métricas adicionales de VAN
     */
    static calcularMetricasVAN(van, inversion, flujos) {
        const vanSobreInversion = van / inversion;
        const roi = (van / inversion) * 100; // Retorno sobre inversión
        const bcr = van > 0 ? (van + inversion) / inversion : 0; // Beneficio-Costo Ratio

        return {
            vanSobreInversion: vanSobreInversion,
            roi: roi,
            bcr: bcr
        };
    }

    /**
     * Determina la decisión económica basada en VAN
     */
    static determinarDecisionEconomica(van) {
        if (van > 0) {
            return {
                decision: 'viable',
                decisionTexto: 'Proyecto económicamente viable - genera valor',
                decisionColor: 'green'
            };
        } else if (van < 0) {
            return {
                decision: 'no_viable',
                decisionTexto: 'Proyecto económicamente no viable - destruye valor',
                decisionColor: 'red'
            };
        } else {
            return {
                decision: 'indiferente',
                decisionTexto: 'El proyecto es económicamente indiferente',
                decisionColor: 'yellow'
            };
        }
    }

    /**
     * Evalúa la TIR según estándares de mercado
     */
    static evaluarTIR(tir) {
        if (tir === null) {
            return {
                evaluacion: 'no_calculable',
                evaluacionTexto: 'No se pudo calcular la TIR',
                evaluacionColor: 'gray'
            };
        }

        if (tir > 20) {
            return {
                evaluacion: 'excelente',
                evaluacionTexto: 'TIR Excelente - Proyecto altamente rentable',
                evaluacionColor: 'green'
            };
        } else if (tir > 15) {
            return {
                evaluacion: 'muy_buena',
                evaluacionTexto: 'TIR Muy Buena - Proyecto muy rentable',
                evaluacionColor: 'green'
            };
        } else if (tir > 12) {
            return {
                evaluacion: 'buena',
                evaluacionTexto: 'TIR Buena - Proyecto rentable',
                evaluacionColor: 'blue'
            };
        } else if (tir > 8) {
            return {
                evaluacion: 'aceptable',
                evaluacionTexto: 'TIR Aceptable - Proyecto marginalmente viable',
                evaluacionColor: 'yellow'
            };
        } else if (tir > 0) {
            return {
                evaluacion: 'baja',
                evaluacionTexto: 'TIR Baja - Revisar viabilidad del proyecto',
                evaluacionColor: 'orange'
            };
        } else {
            return {
                evaluacion: 'negativa',
                evaluacionTexto: 'TIR Negativa - Proyecto no viable',
                evaluacionColor: 'red'
            };
        }
    }

    /**
     * Evalúa el WACC según estándares de mercado
     */
    static evaluarWACC(wacc) {
        if (wacc > 20) {
            return {
                evaluacion: 'muy_alto',
                evaluacionTexto: 'WACC Muy Alto - Costo de capital prohibitivo',
                evaluacionColor: 'red'
            };
        } else if (wacc > 15) {
            return {
                evaluacion: 'alto',
                evaluacionTexto: 'WACC Alto - Costo de capital elevado',
                evaluacionColor: 'orange'
            };
        } else if (wacc > 10) {
            return {
                evaluacion: 'moderado',
                evaluacionTexto: 'WACC Moderado - Costo de capital razonable',
                evaluacionColor: 'yellow'
            };
        } else {
            return {
                evaluacion: 'bajo',
                evaluacionTexto: 'WACC Bajo - Costo de capital favorable',
                evaluacionColor: 'green'
            };
        }
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialUtils;
}
