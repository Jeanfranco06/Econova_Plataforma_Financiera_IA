/**
 * Utilidades para Benchmarking
 * Funciones auxiliares y helpers
 */

class BenchmarkingUtils {
    /**
     * Obtener ID del usuario actual
     */
    static obtenerUsuarioActual() {
        try {
            // Buscar el usuario ID en el elemento oculto del template
            const userInfoElement = document.getElementById('user-info');
            if (userInfoElement && userInfoElement.dataset.userId) {
                return parseInt(userInfoElement.dataset.userId);
            }

            // Intentar desde localStorage (si se guarda ahí)
            const storedUserId = localStorage.getItem('econova_user_id');
            if (storedUserId) {
                return parseInt(storedUserId);
            }

            // Como fallback, intentar obtener desde una cookie de sesión
            const sessionCookie = document.cookie.split(';').find(c => c.trim().startsWith('session='));
            if (sessionCookie) {
                // Si hay sesión, asumir usuario válido (esto es un placeholder)
                return 1;
            }
        } catch (error) {
            }

        // Si no hay usuario autenticado, redirigir al login
        this.mostrarError('Debes iniciar sesión para usar las funciones de benchmarking. Redirigiendo...', 'Sesión requerida');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return null;
    }

    /**
     * Mostrar notificación de éxito
     */
    static mostrarExito(mensaje, titulo = 'Éxito') {
        // Usar sistema de notificaciones personalizado si está disponible
        if (window.benchmarkingNotifications) {
            window.benchmarkingNotifications.success(mensaje, titulo);
        } else if (window.contextualMessages) {
            window.contextualMessages.success({
                title: titulo,
                body: mensaje
            });
        } else {
            alert(`${titulo}: ${mensaje}`);
        }
    }

    /**
     * Mostrar notificación de error
     */
    static mostrarError(mensaje, titulo = 'Error') {
        // Usar sistema de notificaciones personalizado si está disponible
        if (window.benchmarkingNotifications) {
            window.benchmarkingNotifications.error(mensaje, titulo);
        } else if (window.contextualMessages) {
            window.contextualMessages.error({
                title: titulo,
                body: mensaje
            });
        } else {
            alert(`${titulo}: ${mensaje}`);
        }
    }

    /**
     * Formatear valores monetarios y porcentuales
     */
    static formatearValor(metrica, valor) {
        // Handle undefined or null values
        if (valor === undefined || valor === null || isNaN(valor)) {
            return 'N/A';
        }

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
    static nombreMetrica(metrica) {
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
     * Calcular promedio de valores
     */
    static calcularPromedio(valores) {
        return valores.reduce((sum, val) => sum + val, 0) / valores.length;
    }

    /**
     * Calcular mediana
     */
    static calcularMediana(valores) {
        const sorted = [...valores].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    /**
     * Calcular percentil
     */
    static calcularPercentil(valores, percentil) {
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
     * Calcular desviación estándar
     */
    static calcularDesviacionEstandar(valores) {
        const media = this.calcularPromedio(valores);
        const varianza = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / valores.length;
        return Math.sqrt(varianza);
    }

    /**
     * Validar datos de benchmarking
     */
    static validarDatosBenchmarking(datos) {
        return datos.sector && datos.metricas && Object.keys(datos.metricas).length > 0;
    }

    /**
     * Validar datos de comparación personalizada
     */
    static validarDatosComparacionPersonalizada(datos) {
        return datos.empresaBase.nombre &&
               datos.empresaBase.metricas &&
               datos.empresasComparacion.length > 0;
    }

    /**
     * Guardar análisis en localStorage
     */
    static guardarAnalisisBenchmarking(tipo, datos) {
        const id = Date.now();
        const analisisData = {
            ...datos,
            timestamp: new Date(),
            id: id,
            tipo: tipo // Store the type in the data for easier identification
        };

        try {
            const analisisGuardados = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');

            // Clear any old entries for this type to avoid duplicates
            Object.keys(analisisGuardados).forEach(key => {
                if (key.startsWith(`${tipo}_`) || key === tipo || key === `${tipo}_guardado`) {
                    delete analisisGuardados[key];
                    }
            });

            // Store only with unique key
            const uniqueKey = `${tipo}_${id}`;
            analisisGuardados[uniqueKey] = analisisData;

            localStorage.setItem('econova_benchmarking', JSON.stringify(analisisGuardados));

            } catch (error) {
            }

        return analisisData;
    }

    /**
     * Cargar análisis desde localStorage
     */
    static cargarAnalisisBenchmarking() {
        try {
            return JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
        } catch (error) {
            return {};
        }
    }

    /**
     * Disparar evento personalizado
     */
    static dispararEvento(evento, datos) {
        const customEvent = new CustomEvent(`benchmarking${evento.charAt(0).toUpperCase() + evento.slice(1)}`, {
            detail: datos
        });
        document.dispatchEvent(customEvent);
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BenchmarkingUtils;
}
