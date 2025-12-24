/**
 * Utilidades de Interfaz de Usuario - CORRECCIÓN PARA PORTAFOLIO
 * Versión corregida que envía datos reales de portafolio
 */

// Sobrescribir la función problemática
if (typeof UIUtils !== 'undefined' && UIUtils.prepararDatosParaBackend) {
    const originalPrepararDatosParaBackend = UIUtils.prepararDatosParaBackend;

    UIUtils.prepararDatosParaBackend = function(tipo, simulacion) {
        if (tipo.toLowerCase() === 'portafolio') {
            console.log('🎯 Preparando datos REALES para portafolio:', simulacion.datos);

            const baseData = {
                usuario_id: this.getUsuarioId(),
                nombre_simulacion: simulacion.nombre || `${tipo.toUpperCase()} - ${new Date().toLocaleDateString()}`
            };

            // Obtener activos de los datos de la simulación
            const activos = simulacion.datos?.activos || [];
            console.log('📊 Activos encontrados:', activos);

            if (activos.length > 0) {
                // Convertir datos reales de activos a formato backend
                const retornos = activos.map(activo => {
                    const rendimiento = activo.rendimientoEsperado || activo.rendimiento || 0;
                    // Si está en porcentaje (>1), convertir a decimal
                    return rendimiento > 1 ? rendimiento / 100 : rendimiento;
                });

                const ponderaciones = activos.map(activo => {
                    const peso = activo.peso || 0;
                    // Si está en porcentaje (>1), convertir a decimal
                    return peso > 1 ? peso / 100 : peso;
                });

                console.log('✅ Datos convertidos - Retornos:', retornos, 'Ponderaciones:', ponderaciones);

                // Guardar información completa del portafolio
                const nombresActivos = activos.map(activo => activo.nombre || `Activo ${activos.indexOf(activo) + 1}`);

                return {
                    ...baseData,
                    // Datos básicos para cálculo
                    retornos: retornos,
                    ponderaciones: ponderaciones,
                    volatilidades: simulacion.datos?.volatilidades || [],
                    matriz_correlacion: simulacion.datos?.matriz_correlacion || [],
                    // Información adicional del portafolio
                    activos: activos, // Guardar objetos completos de activos
                    nombres_activos: nombresActivos,
                    // Configuración de la simulación
                    tasa_libre_riesgo: simulacion.datos?.tasaLibreRiesgo || 0.03,
                    objetivo_optimizacion: simulacion.datos?.objetivo || 'max_sharpe',
                    horizonte_tiempo: simulacion.datos?.horizonteTiempo || 'anual'
                };
            } else {
                // Si no hay activos, enviar arrays vacíos (el backend los manejará)
                console.log('⚠️ No hay activos, enviando arrays vacíos');
                return {
                    ...baseData,
                    retornos: [],
                    ponderaciones: [],
                    volatilidades: [],
                    matriz_correlacion: []
                };
            }
        } else {
            // Para otros tipos, usar la función original
            return originalPrepararDatosParaBackend.call(this, tipo, simulacion);
        }
    };

    console.log('🔧 UIUtils corregido para portafolio - ahora envía datos reales');
}
