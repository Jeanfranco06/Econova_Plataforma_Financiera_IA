/**
 * Utilidades del Sistema de Benchmarking
 * Validación, persistencia y helpers
 */

class BenchmarkingUtils {
    constructor() {}

    /**
     * Validar datos de benchmarking sectorial
     */
    validarDatosBenchmarking(datos) {
        return datos.sector &&
               datos.metricas &&
               Object.keys(datos.metricas).length > 0 &&
               Object.values(datos.metricas).every(val => !isNaN(val) && val > 0);
    }

    /**
     * Validar datos de comparación personalizada
     */
    validarDatosComparacionPersonalizada(datos) {
        return datos.empresaBase.nombre &&
               datos.empresaBase.metricas &&
               datos.empresasComparacion.length > 0;
    }

    /**
     * Obtener usuario actual
     */
    obtenerUsuarioActual() {
        try {
            const bodyElement = document.body;
            if (bodyElement && bodyElement.dataset.usuarioId && bodyElement.dataset.usuarioId.trim() !== '') {
                return parseInt(bodyElement.dataset.usuarioId);
            }

            const userInfoElement = document.getElementById('user-info');
            if (userInfoElement && userInfoElement.dataset.userId) {
                return parseInt(userInfoElement.dataset.userId);
            }

            const storedUserId = localStorage.getItem('econova_user_id');
            if (storedUserId) {
                return parseInt(storedUserId);
            }
        } catch (error) {
            console.warn('Error obteniendo usuario actual:', error);
        }
        return null;
    }

    /**
     * Guardar análisis de benchmarking
     */
    async guardarAnalisisBenchmarking(tipo, datos) {
        try {
            const usuarioId = this.obtenerUsuarioActual();
            if (!usuarioId) {
                throw new Error('Usuario no autenticado');
            }

            const datosEnvio = {
                usuario_id: usuarioId,
                tipo_analisis: tipo,
                datos: datos.datos || {},
                resultados: datos.analisis || datos.comparacion || {},
                recomendaciones: datos.recomendaciones || []
            };

            console.log('📤 Enviando análisis al backend:', datosEnvio);

            const response = await fetch('/api/v1/benchmarking/analisis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosEnvio)
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Análisis guardado exitosamente:', result.analisis_id);

                // Guardar en localStorage como respaldo
                this.guardarEnLocalStorage(tipo, {
                    ...datos,
                    timestamp: new Date(),
                    id: result.analisis_id
                });

                return result.analisis_id;
            } else {
                console.error('❌ Error guardando análisis:', result.error);
                throw new Error(result.error || 'Error guardando análisis');
            }
        } catch (error) {
            console.error('💥 Error guardando análisis:', error);

            // Fallback: guardar solo en localStorage
            console.log('🔄 Guardando en localStorage como respaldo');
            this.guardarEnLocalStorage(tipo, {
                ...datos,
                timestamp: new Date(),
                id: Date.now()
            });

            return Date.now();
        }
    }

    /**
     * Cargar análisis guardados
     */
    cargarAnalisisBenchmarking() {
        try {
            const analisisGuardados = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
            return analisisGuardados;
        } catch (error) {
            console.error('Error cargando análisis:', error);
            return {};
        }
    }

    /**
     * Guardar en localStorage
     */
    guardarEnLocalStorage(tipo, datos) {
        try {
            const analisisGuardados = this.cargarAnalisisBenchmarking();
            analisisGuardados[tipo] = datos;
            localStorage.setItem('econova_benchmarking', JSON.stringify(analisisGuardados));
        } catch (error) {
            console.warn('Error guardando en localStorage:', error);
        }
    }

    /**
     * Disparar evento personalizado
     */
    dispararEvento(evento, datos) {
        const customEvent = new CustomEvent(`benchmarking${evento.charAt(0).toUpperCase() + evento.slice(1)}`, {
            detail: datos
        });
        document.dispatchEvent(customEvent);
    }

    /**
     * Limpiar todos los análisis (para testing)
     */
    limpiarAnalisisBenchmarking() {
        try {
            localStorage.removeItem('econova_benchmarking');
            console.log('🗑️ Todos los análisis han sido eliminados');
            return true;
        } catch (error) {
            console.error('Error limpiando análisis:', error);
            return false;
        }
    }

    /**
     * Formatear valor para display
     */
    formatearValor(metrica, valor) {
        if (!valor || isNaN(valor)) return 'N/A';

        if (metrica.includes('margen') || metrica.includes('roi') || metrica.includes('crecimiento')) {
            return (valor * 100).toFixed(2) + '%';
        }
        if (metrica === 'ingresos') {
            return 'S/ ' + valor.toLocaleString('es-PE');
        }
        if (metrica === 'empleados') {
            return Math.round(valor).toString();
        }
        return valor.toFixed(2);
    }

    /**
     * Obtener nombre legible de métrica
     */
    nombreMetrica(metrica) {
        const nombres = {
            'ingresos': 'ingresos',
            'margen_beneficio': 'margen de beneficio',
            'roi': 'retorno sobre inversión',
            'empleados': 'número de empleados',
            'crecimiento': 'tasa de crecimiento'
        };
        return nombres[metrica] || metrica;
    }

    /**
     * Calcular promedio de array
     */
    calcularPromedio(valores) {
        if (!valores || valores.length === 0) return 0;
        return valores.reduce((sum, val) => sum + val, 0) / valores.length;
    }

    /**
     * Calcular mediana de array
     */
    calcularMediana(valores) {
        if (!valores || valores.length === 0) return 0;

        const sorted = [...valores].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);

        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    /**
     * Calcular percentil
     */
    calcularPercentil(valores, percentil) {
        if (!valores || valores.length === 0) return 0;

        const sorted = [...valores].sort((a, b) => a - b);
        const index = (percentil / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);

        if (lower === upper) {
            return sorted[lower];
        }

        const weight = index - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    /**
     * Generar ID único
     */
    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BenchmarkingUtils;
}
