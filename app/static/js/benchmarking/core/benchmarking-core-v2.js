/**
 * Núcleo del Sistema de Benchmarking
 * Lógica central de cálculos y análisis
 */

class BenchmarkingCore {
    constructor() {
        this.estadisticasSectoriales = {};
        this.percentilesPrecomputados = {};
    }

    /**
     * Genera análisis sectorial completo
     */
    async generarAnalisisSectorial(metricas, sector, tamanoEmpresa) {
        // Obtener datos sectoriales
        const datosSectoriales = await this.obtenerDatosSectoriales(sector);

        // Filtrar por tamaño de empresa
        const datosFiltrados = this.filtrarPorTamanoEmpresa(datosSectoriales, tamanoEmpresa);

        // Calcular análisis completo
        const analisis = this.calcularAnalisisSectorial(metricas, datosFiltrados);

        // Añadir metadatos
        analisis._empresasComparadas = datosFiltrados.length;
        analisis._sectorSeleccionado = sector;
        analisis._tamanoEmpresa = tamanoEmpresa;

        return analisis;
    }

    /**
     * Obtener datos sectoriales (simulados para demo)
     * Nota: En producción, estos datos vendrían de una base de datos real
     */
    async obtenerDatosSectoriales(sector) {
        // Dataset consistente para cada sector (misma semilla para reproducibilidad)
        const datasetsPorSector = {
            'Tecnología': {
                empresas: 100,
                ingresos_promedio: 2500000,
                margen_beneficio: 0.15,
                roi_promedio: 0.22,
                empleados_promedio: 45,
                crecimiento_anual: 0.18,
                endeudamiento_promedio: 0.35
            },
            'Manufactura': {
                empresas: 100,
                ingresos_promedio: 1800000,
                margen_beneficio: 0.12,
                roi_promedio: 0.15,
                empleados_promedio: 120,
                crecimiento_anual: 0.08,
                endeudamiento_promedio: 0.42
            },
            'Comercio': {
                empresas: 100,
                ingresos_promedio: 950000,
                margen_beneficio: 0.08,
                roi_promedio: 0.12,
                empleados_promedio: 15,
                crecimiento_anual: 0.05,
                endeudamiento_promedio: 0.28
            },
            'Servicios Financieros': {
                empresas: 100,
                ingresos_promedio: 3200000,
                margen_beneficio: 0.25,
                roi_promedio: 0.28,
                empleados_promedio: 35,
                crecimiento_anual: 0.12,
                endeudamiento_promedio: 0.55
            }
        };

        const datosSector = datasetsPorSector[sector] || datasetsPorSector['Tecnología'];
        return this.generarDistribucionDatos(datosSector, 100, sector);
    }

    /**
     * Generar distribución de datos simulados (consistente por sector)
     */
    generarDistribucionDatos(datosBase, nEmpresas, sector = 'default') {
        const datos = [];

        // Usar una semilla basada en el sector para consistencia
        const seed = this.generarSemilla(sector);

        for (let i = 0; i < nEmpresas; i++) {
            // Generar variaciones consistentes usando distribución normal con semilla
            const variacion = this.generarVariacionNormal(seed + i) * 0.3; // Desviación estándar del 30%

            datos.push({
                ingresos: Math.max(1000, datosBase.ingresos_promedio * (1 + variacion)),
                margen_beneficio: Math.max(0.001, Math.min(1, datosBase.margen_beneficio * (1 + variacion * 0.5))),
                roi: Math.max(0.001, Math.min(5, datosBase.roi_promedio * (1 + variacion * 0.3))),
                empleados: Math.max(1, Math.round(datosBase.empleados_promedio * (1 + variacion))),
                crecimiento: Math.max(-0.5, Math.min(2, datosBase.crecimiento_anual * (1 + variacion * 0.8))),
                endeudamiento: Math.max(0.01, Math.min(2, datosBase.endeudamiento_promedio * (1 + variacion * 0.4)))
            });
        }

        // Ordenar los datos para asegurar distribución consistente
        return datos.sort((a, b) => a.ingresos - b.ingresos);
    }

    /**
     * Generar semilla consistente basada en string
     */
    generarSemilla(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32 bits
        }
        return Math.abs(hash) / 2147483647; // Normalizar a [0, 1)
    }

    /**
     * Generar variación normal pseudo-aleatoria con semilla
     */
    generarVariacionNormal(seed) {
        // Implementación simple de distribución normal usando Box-Muller con semilla
        const u1 = this.pseudoRandom(seed);
        const u2 = this.pseudoRandom(seed + 1);
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    /**
     * Generador pseudo-aleatorio simple con semilla
     */
    pseudoRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    /**
     * Filtrar datos por tamaño de empresa
     */
    filtrarPorTamanoEmpresa(datos, tamano) {
        if (tamano === 'todos') return datos;

        const rangos = {
            'micro': d => d.empleados <= 10,
            'pequena': d => d.empleados > 10 && d.empleados <= 50,
            'mediana': d => d.empleados > 50 && d.empleados <= 200,
            'grande': d => d.empleados > 200
        };

        const filtro = rangos[tamano];
        return filtro ? datos.filter(filtro) : datos;
    }

    /**
     * Calcular análisis sectorial detallado
     */
    calcularAnalisisSectorial(metricasEmpresa, datosSectoriales) {
        const analisis = {};

        Object.entries(metricasEmpresa).forEach(([metrica, valor]) => {
            if (datosSectoriales.length > 0) {
                const valoresSector = datosSectoriales.map(d => d[metrica]).filter(v => v !== undefined && !isNaN(v));

                if (valoresSector.length > 0) {
                    analisis[metrica] = {
                        valor_empresa: valor,
                        promedio_sector: this.calcularPromedio(valoresSector),
                        mediana_sector: this.calcularMediana(valoresSector),
                        percentil_25: this.calcularPercentil(valoresSector, 25),
                        percentil_75: this.calcularPercentil(valoresSector, 75),
                        percentil_90: this.calcularPercentil(valoresSector, 90),
                        minimo: Math.min(...valoresSector),
                        maximo: Math.max(...valoresSector),
                        desviacion_estandar: this.calcularDesviacionEstandar(valoresSector),
                        posicion_relativa: this.calcularPosicionRelativa(valor, valoresSector)
                    };
                }
            }
        });

        return analisis;
    }

    /**
     * Funciones estadísticas
     */
    calcularPromedio(valores) {
        return valores.reduce((sum, val) => sum + val, 0) / valores.length;
    }

    calcularMediana(valores) {
        const sorted = [...valores].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    calcularPercentil(valores, percentil) {
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

    calcularDesviacionEstandar(valores) {
        const media = this.calcularPromedio(valores);
        const varianza = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / valores.length;
        return Math.sqrt(varianza);
    }

    calcularPosicionRelativa(valor, valores) {
        const sorted = [...valores].sort((a, b) => a - b);
        let valoresMenoresOIguales = 0;

        // Contar cuántos valores son menores o iguales al valor de la empresa
        for (let i = 0; i < sorted.length; i++) {
            if (valor >= sorted[i]) {
                valoresMenoresOIguales++;
            } else {
                break;
            }
        }

        // Calcular percentil correctamente
        const percentil = (valoresMenoresOIguales / sorted.length) * 100;

        return {
            percentil: percentil,
            ranking: `${valoresMenoresOIguales} de ${sorted.length}`,
            cuartil: this.obtenerCuartil(valoresMenoresOIguales - 1, sorted.length)
        };
    }

    obtenerCuartil(posicion, total) {
        const porcentaje = (posicion / total) * 100;
        if (porcentaje <= 25) return 'Q1 (Inferior)';
        if (porcentaje <= 50) return 'Q2 (Medio inferior)';
        if (porcentaje <= 75) return 'Q3 (Medio superior)';
        return 'Q4 (Superior)';
    }

    calcularPercentilPromedio(analisis) {
        // Filtrar solo métricas reales (excluir metadatos que empiezan con _)
        const metricasReales = Object.entries(analisis)
            .filter(([key, value]) => !key.startsWith('_') && value && typeof value === 'object' && value.posicion_relativa);

        const percentiles = metricasReales
            .map(([key, stats]) => stats?.posicion_relativa?.percentil)
            .filter(percentil => typeof percentil === 'number' && !isNaN(percentil));

        if (percentiles.length === 0) return 0;

        const promedio = percentiles.reduce((sum, p) => sum + p, 0) / percentiles.length;
        return isNaN(promedio) ? 0 : promedio;
    }

    /**
     * Generar recomendaciones inteligentes
     */
    generarRecomendaciones(analisis, datos) {
        const recomendaciones = [];

        // Filtrar solo métricas reales (excluir metadatos que empiezan con _)
        const metricasReales = Object.entries(analisis)
            .filter(([key, value]) => !key.startsWith('_') && value && typeof value === 'object');

        metricasReales.forEach(([metrica, stats]) => {
            if (!stats || typeof stats !== 'object') return;

            const { valor_empresa, percentil_25, percentil_75, posicion_relativa } = stats;

            // Recomendaciones basadas en percentiles
            if (typeof valor_empresa === 'number' && typeof percentil_25 === 'number') {
                if (valor_empresa < percentil_25) {
                    recomendaciones.push({
                        tipo: 'oportunidad_mejora',
                        metrica: metrica,
                        mensaje: `Tu ${this.nombreMetrica(metrica)} está por debajo del 25% inferior del sector. Considera estrategias para mejorar esta métrica.`,
                        acciones: this.obtenerAccionesMejora(metrica, 'bajo')
                    });
                } else if (typeof percentil_75 === 'number' && valor_empresa > percentil_75) {
                    recomendaciones.push({
                        tipo: 'ventaja_competitiva',
                        metrica: metrica,
                        mensaje: `¡Excelente! Tu ${this.nombreMetrica(metrica)} está en el 25% superior del sector.`,
                        acciones: ['Mantener las buenas prácticas', 'Compartir conocimientos con el sector']
                    });
                }
            }

            // Recomendaciones basadas en posición relativa
            if (posicion_relativa && typeof posicion_relativa.percentil === 'number' && posicion_relativa.percentil < 50) {
                recomendaciones.push({
                    tipo: 'benchmarking',
                    metrica: metrica,
                    mensaje: `Benchmarking: Estudia las mejores prácticas de empresas en el percentil superior para ${this.nombreMetrica(metrica)}.`,
                    acciones: ['Analizar casos de éxito', 'Implementar mejores prácticas', 'Buscar mentoría']
                });
            }
        });

        return recomendaciones;
    }

    nombreMetrica(metrica) {
        const nombres = {
            'ingresos': 'ingresos',
            'margen_beneficio': 'margen de beneficio',
            'roi': 'retorno sobre inversión',
            'empleados': 'número de empleados',
            'crecimiento': 'tasa de crecimiento',
            'endeudamiento': 'nivel de endeudamiento'
        };
        return nombres[metrica] || metrica;
    }

    obtenerAccionesMejora(metrica, nivel) {
        const accionesPorMetrica = {
            'ingresos': [
                'Diversificar fuentes de ingresos',
                'Implementar estrategias de marketing digital',
                'Optimizar precios y productos',
                'Expandir mercados geográficos'
            ],
            'margen_beneficio': [
                'Optimizar costos operativos',
                'Negociar mejores condiciones con proveedores',
                'Implementar control de inventarios',
                'Revisar estructura de precios'
            ],
            'roi': [
                'Evaluar proyectos de inversión actuales',
                'Implementar análisis de sensibilidad',
                'Diversificar portafolio de inversiones',
                'Optimizar asignación de capital'
            ]
        };

        return accionesPorMetrica[metrica] || ['Revisar procesos operativos', 'Implementar mejores prácticas'];
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BenchmarkingCore;
}
