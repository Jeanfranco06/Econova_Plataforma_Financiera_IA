/**
 * Utilidades de Validación - Econova
 * Funciones de validación compartidas para formularios
 */

class ValidationUtils {
    /**
     * Muestra errores de validación para un formulario
     */
    static mostrarErrores(errores, formId, errorContainerId = null) {
        // Crear contenedor de errores si no existe
        let errorContainer = document.getElementById(errorContainerId || `${formId}-errores`);
        if (!errorContainer) {
            const form = document.getElementById(formId);
            if (form) {
                errorContainer = document.createElement('div');
                errorContainer.id = errorContainerId || `${formId}-errores`;
                errorContainer.className = 'mb-6';
                form.insertBefore(errorContainer, form.firstChild);
            }
        }

        if (errorContainer) {
            const erroresErrores = errores.filter(e => e.tipo === 'error');
            const erroresAdvertencias = errores.filter(e => e.tipo === 'advertencia');

            let html = '';

            if (erroresErrores.length > 0) {
                html += `
                    <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-circle text-red-400"></i>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-red-800">Errores encontrados:</h3>
                                <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                                    ${erroresErrores.map(e => `<li>${e.mensaje}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }

            if (erroresAdvertencias.length > 0) {
                html += `
                    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-yellow-800">Advertencias:</h3>
                                <ul class="mt-2 text-sm text-yellow-700 list-disc list-inside">
                                    ${erroresAdvertencias.map(e => `<li>${e.mensaje}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }

            errorContainer.innerHTML = html;

            // Scroll to errors
            errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Valida datos del VAN
     */
    static validarDatosVANDetallado(datos) {
        const errores = [];

        // Validar inversión inicial
        if (!datos.inversion || datos.inversion <= 0) {
            errores.push({
                campo: 'inversion',
                mensaje: 'La inversión inicial debe ser mayor a cero.',
                tipo: 'error'
            });
        } else if (datos.inversion > 100000000) { // 100 millones
            errores.push({
                campo: 'inversion',
                mensaje: 'La inversión inicial parece demasiado alta. Verifique las unidades.',
                tipo: 'advertencia'
            });
        }

        // Validar tasa de descuento
        if (datos.tasaDescuento < 0 || datos.tasaDescuento > 50) {
            errores.push({
                campo: 'tasa',
                mensaje: 'La tasa de descuento debe estar entre 0% y 50%.',
                tipo: 'error'
            });
        } else if (datos.tasaDescuento === 0) {
            errores.push({
                campo: 'tasa',
                mensaje: 'Una tasa de descuento del 0% no es realista para análisis financiero.',
                tipo: 'advertencia'
            });
        }

        // Validar flujos de caja
        if (!datos.flujos || datos.flujos.length === 0) {
            errores.push({
                campo: 'flujos',
                mensaje: 'Debe ingresar al menos un flujo de caja.',
                tipo: 'error'
            });
        } else if (datos.flujos.length > 20) {
            errores.push({
                campo: 'flujos',
                mensaje: 'El análisis está limitado a 20 períodos. Considere agrupar flujos.',
                tipo: 'advertencia'
            });
        }

        // Validar que haya al menos un flujo positivo
        const tieneFlujoPositivo = datos.flujos.some(f => f > 0);
        if (!tieneFlujoPositivo) {
            errores.push({
                campo: 'flujos',
                mensaje: 'Debe haber al menos un flujo de caja positivo para que el proyecto sea viable.',
                tipo: 'error'
            });
        }

        // Validar valores extremos en flujos
        datos.flujos.forEach((flujo, index) => {
            if (Math.abs(flujo) > 10000000) { // 10 millones
                errores.push({
                    campo: `flujo${index + 1}`,
                    mensaje: `El flujo del año ${index + 1} parece demasiado alto. Verifique las unidades.`,
                    tipo: 'advertencia'
                });
            }
        });

        return errores;
    }

    /**
     * Valida datos del TIR
     */
    static validarDatosTIRDetallado(datos) {
        const errores = [];

        // Validar inversión inicial
        if (!datos.inversion || datos.inversion <= 0) {
            errores.push({
                campo: 'inversion',
                mensaje: 'La inversión inicial debe ser mayor a cero.',
                tipo: 'error'
            });
        }

        // Validar flujos de caja
        if (!datos.flujos || datos.flujos.length === 0) {
            errores.push({
                campo: 'flujos',
                mensaje: 'Debe ingresar al menos un flujo de caja.',
                tipo: 'error'
            });
        } else if (datos.flujos.length > 20) {
            errores.push({
                campo: 'flujos',
                mensaje: 'El análisis está limitado a 20 períodos. Considere agrupar flujos.',
                tipo: 'advertencia'
            });
        }

        // Validar que haya al menos un flujo positivo
        const tieneFlujoPositivo = datos.flujos.some(f => f > 0);
        if (!tieneFlujoPositivo) {
            errores.push({
                campo: 'flujos',
                mensaje: 'Debe haber al menos un flujo de caja positivo para calcular la TIR.',
                tipo: 'error'
            });
        }

        // Validar que haya al menos un flujo negativo (inversión)
        const tieneFlujoNegativo = datos.flujos.some(f => f < 0) || datos.inversion > 0;
        if (!tieneFlujoNegativo) {
            errores.push({
                campo: 'inversion',
                mensaje: 'Debe haber al menos un flujo negativo (inversión) para calcular la TIR.',
                tipo: 'error'
            });
        }

        // Validar valores extremos en flujos
        datos.flujos.forEach((flujo, index) => {
            if (Math.abs(flujo) > 10000000) { // 10 millones
                errores.push({
                    campo: `flujo${index + 1}`,
                    mensaje: `El flujo del año ${index + 1} parece demasiado alto. Verifique las unidades.`,
                    tipo: 'advertencia'
                });
            }
        });

        return errores;
    }

    /**
     * Valida datos del WACC
     */
    static validarDatosWACCDetallado(datos) {
        const errores = [];

        // Validar empresa
        if (!datos.empresa || datos.empresa.trim() === '') {
            errores.push({
                campo: 'empresa',
                mensaje: 'El nombre de la empresa es requerido.',
                tipo: 'error'
            });
        }

        // Validar costo de deuda
        if (datos.costoDeuda < 0 || datos.costoDeuda > 50) {
            errores.push({
                campo: 'costo_deuda',
                mensaje: 'El costo de deuda debe estar entre 0% y 50%.',
                tipo: 'error'
            });
        } else if (datos.costoDeuda === 0) {
            errores.push({
                campo: 'costo_deuda',
                mensaje: 'Un costo de deuda del 0% no es realista. Considere el costo de mercado.',
                tipo: 'advertencia'
            });
        }

        // Validar costo de capital propio
        if (datos.costoCapitalPropio < 0 || datos.costoCapitalPropio > 50) {
            errores.push({
                campo: 'costo_capital',
                mensaje: 'El costo de capital propio debe estar entre 0% y 50%.',
                tipo: 'error'
            });
        } else if (datos.costoCapitalPropio < 5) {
            errores.push({
                campo: 'costo_capital',
                mensaje: 'El costo de capital propio parece bajo. Verifique el cálculo del CAPM.',
                tipo: 'advertencia'
            });
        }

        // Validar proporciones
        if (datos.proporcionDeuda < 0 || datos.proporcionDeuda > 100) {
            errores.push({
                campo: 'proporcion_deuda',
                mensaje: 'La proporción de deuda debe estar entre 0% y 100%.',
                tipo: 'error'
            });
        }

        if (datos.proporcionCapital < 0 || datos.proporcionCapital > 100) {
            errores.push({
                campo: 'proporcion_capital',
                mensaje: 'La proporción de capital propio debe estar entre 0% y 100%.',
                tipo: 'error'
            });
        }

        // Validar que las proporciones sumen 100%
        const sumaProporciones = datos.proporcionDeuda + datos.proporcionCapital;
        if (Math.abs(sumaProporciones - 100) > 0.01) {
            errores.push({
                campo: 'proporciones',
                mensaje: 'La suma de las proporciones de deuda y capital propio debe ser 100%.',
                tipo: 'error'
            });
        }

        // Validar tasa de impuestos
        if (datos.tasaImpuestos < 0 || datos.tasaImpuestos > 50) {
            errores.push({
                campo: 'tasa_impuestos',
                mensaje: 'La tasa de impuestos debe estar entre 0% y 50%.',
                tipo: 'error'
            });
        }

        return errores;
    }

    /**
     * Valida datos del portafolio
     */
    static validarDatosPortafolio(datos) {
        const errores = [];

        if (!datos.activos || datos.activos.length === 0) {
            errores.push({
                campo: 'activos',
                mensaje: 'Debe incluir al menos un activo en el portafolio.',
                tipo: 'error'
            });
            return errores;
        }

        const sumaPesos = datos.activos.reduce((sum, activo) => sum + activo.peso, 0);
        if (Math.abs(sumaPesos - 1) > 0.01) {
            errores.push({
                campo: 'pesos',
                mensaje: 'La suma de los pesos debe ser igual a 100%.',
                tipo: 'error'
            });
        }

        datos.activos.forEach((activo, index) => {
            if (activo.peso <= 0) {
                errores.push({
                    campo: `activo${index + 1}_peso`,
                    mensaje: `El peso del activo ${activo.nombre} debe ser mayor a cero.`,
                    tipo: 'error'
                });
            }
            if (activo.retorno < 0) {
                errores.push({
                    campo: `activo${index + 1}_retorno`,
                    mensaje: `El retorno esperado del activo ${activo.nombre} no puede ser negativo.`,
                    tipo: 'advertencia'
                });
            }
            if (activo.riesgo < 0) {
                errores.push({
                    campo: `activo${index + 1}_riesgo`,
                    mensaje: `El riesgo del activo ${activo.nombre} no puede ser negativo.`,
                    tipo: 'error'
                });
            }
        });

        return errores;
    }

    /**
     * Valida datos de ML
     */
    static validarDatosPrediccion(datos) {
        const errores = [];

        if (datos.ingresos_anuales <= 0) {
            errores.push({
                campo: 'ingresos_anuales',
                mensaje: 'Los ingresos anuales deben ser mayores a cero.',
                tipo: 'error'
            });
        }

        if (datos.gastos_operativos < 0) {
            errores.push({
                campo: 'gastos_operativos',
                mensaje: 'Los gastos operativos no pueden ser negativos.',
                tipo: 'error'
            });
        }

        if (datos.activos_totales <= 0) {
            errores.push({
                campo: 'activos_totales',
                mensaje: 'Los activos totales deben ser mayores a cero.',
                tipo: 'error'
            });
        }

        if (datos.pasivos_totales < 0) {
            errores.push({
                campo: 'pasivos_totales',
                mensaje: 'Los pasivos totales no pueden ser negativos.',
                tipo: 'error'
            });
        }

        return errores;
    }

    static validarDatosTornado(datos) {
        const errores = [];

        if (datos.inversionInicial < 0) {
            errores.push({
                campo: 'inversion_inicial',
                mensaje: 'La inversión inicial no puede ser negativa.',
                tipo: 'error'
            });
        }

        if (datos.tasaDescuento < 0 || datos.tasaDescuento > 100) {
            errores.push({
                campo: 'tasa_descuento',
                mensaje: 'La tasa de descuento debe estar entre 0% y 100%.',
                tipo: 'error'
            });
        }

        if (!datos.flujos || datos.flujos.length === 0) {
            errores.push({
                campo: 'flujos',
                mensaje: 'Debe ingresar al menos un flujo de caja.',
                tipo: 'error'
            });
        }

        return errores;
    }

    static validarDatosMonteCarlo(datos) {
        const errores = [];

        if (datos.inversionInicial < 0) {
            errores.push({
                campo: 'inversion_inicial',
                mensaje: 'La inversión inicial no puede ser negativa.',
                tipo: 'error'
            });
        }

        if (datos.tasaDescuento < 0 || datos.tasaDescuento > 100) {
            errores.push({
                campo: 'tasa_descuento',
                mensaje: 'La tasa de descuento debe estar entre 0% y 100%.',
                tipo: 'error'
            });
        }

        if (!datos.flujos || datos.flujos.length === 0) {
            errores.push({
                campo: 'flujos',
                mensaje: 'Debe ingresar al menos un flujo de caja.',
                tipo: 'error'
            });
        }

        if (datos.nSimulaciones <= 0 || datos.nSimulaciones > 25000) {
            errores.push({
                campo: 'n_simulaciones',
                mensaje: 'El número de simulaciones debe estar entre 1 y 25,000.',
                tipo: 'error'
            });
        }

        return errores;
    }

    static validarDatosSensibilidad(datos) {
        const errores = [];

        if (datos.inversionInicial < 0) {
            errores.push({
                campo: 'inversion_inicial',
                mensaje: 'La inversión inicial no puede ser negativa.',
                tipo: 'error'
            });
        }

        if (datos.tasaDescuento < 0 || datos.tasaDescuento > 100) {
            errores.push({
                campo: 'tasa_descuento',
                mensaje: 'La tasa de descuento debe estar entre 0% y 100%.',
                tipo: 'error'
            });
        }

        if (!datos.flujos || datos.flujos.length === 0) {
            errores.push({
                campo: 'flujos',
                mensaje: 'Debe ingresar al menos un flujo de caja.',
                tipo: 'error'
            });
        }

        return errores;
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationUtils;
}
