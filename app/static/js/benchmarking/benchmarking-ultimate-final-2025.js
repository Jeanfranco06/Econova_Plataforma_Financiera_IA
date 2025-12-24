/**
 * SISTEMA DE BENCHMARKING FINAL v3.0
 * Versión completamente simplificada y funcional
 */

// ==================== CORE MODULE ====================
class BenchmarkingCoreFinal {
    constructor() {
        // Core Benchmarking inicializado
    }

    async generarAnalisisSectorial(metricas, sector, tamanoEmpresa, gruposUsuario = []) {

        const datosSectoriales = this.obtenerDatosSectoriales(sector, gruposUsuario);
        const datosFiltrados = this.filtrarPorTamanoEmpresa(datosSectoriales, tamanoEmpresa);
        const analisis = this.calcularAnalisisSectorial(metricas, datosFiltrados);

        analisis._empresasComparadas = datosFiltrados.length;
        analisis._sectorSeleccionado = sector;
        analisis._tamanoEmpresa = tamanoEmpresa;
        analisis._gruposUsuario = gruposUsuario.length;

        return analisis;
    }

    async obtenerGruposUsuarioActualesDirecto(usuarioId) {
        try {
            if (!usuarioId) {
                return [];
            }

            const response = await fetch(`/api/v1/usuarios/${usuarioId}/benchmarking/grupos`);
            const result = await response.json();

            if (result.success && result.grupos) {
                return result.grupos;
            } else {
                return [];
            }
        } catch (error) {
            }
        return [];
    }

    obtenerDatosSectoriales(sector, gruposUsuario = []) {
        const datasets = {
            'Tecnología': { ingresos_promedio: 2500000, margen_beneficio: 0.15, roi_promedio: 0.22, empleados_promedio: 45, crecimiento_anual: 0.18, endeudamiento_promedio: 0.35 },
            'Manufactura': { ingresos_promedio: 1800000, margen_beneficio: 0.12, roi_promedio: 0.15, empleados_promedio: 120, crecimiento_anual: 0.08, endeudamiento_promedio: 0.42 },
            'Comercio': { ingresos_promedio: 950000, margen_beneficio: 0.08, roi_promedio: 0.12, empleados_promedio: 15, crecimiento_anual: 0.05, endeudamiento_promedio: 0.28 },
            'Servicios Financieros': { ingresos_promedio: 3200000, margen_beneficio: 0.25, roi_promedio: 0.28, empleados_promedio: 35, crecimiento_anual: 0.12, endeudamiento_promedio: 0.55 }
        };

        // Si el usuario pertenece a grupos, ajustar los datos según el perfil de grupos
        let datosBase = datasets[sector] || datasets['Tecnología'];
        let numeroEmpresas = 100;
        let variacionBase = 0.6;

        if (gruposUsuario.length > 0) {
            // Crear datos más específicos basados en grupos del usuario
            const perfilGrupo = this.calcularPerfilGrupo(gruposUsuario);

            // Ajustar datos base según perfil de grupos
            datosBase = {
                ingresos_promedio: datosBase.ingresos_promedio * perfilGrupo.multiplicadorIngresos,
                margen_beneficio: Math.max(0.05, datosBase.margen_beneficio * perfilGrupo.multiplicadorMargen),
                roi_promedio: datosBase.roi_promedio * perfilGrupo.multiplicadorROI,
                empleados_promedio: datosBase.empleados_promedio * perfilGrupo.multiplicadorEmpleados,
                crecimiento_anual: datosBase.crecimiento_anual * perfilGrupo.multiplicadorCrecimiento,
                endeudamiento_promedio: datosBase.endeudamiento_promedio * perfilGrupo.multiplicadorEndeudamiento
            };

            // Más empresas similares en grupos pequeños, menos variación
            numeroEmpresas = Math.max(20, Math.min(50, perfilGrupo.numeroEmpresas));
            variacionBase = perfilGrupo.variacion; // Menos variación = datos más similares
        }

        const datos = [];

        for (let i = 0; i < numeroEmpresas; i++) {
            const variacion = (Math.random() - 0.5) * variacionBase;
            datos.push({
                ingresos: Math.max(1000, datosBase.ingresos_promedio * (1 + variacion)),
                margen_beneficio: Math.max(0.001, Math.min(1, datosBase.margen_beneficio * (1 + variacion * 0.5))),
                roi: Math.max(0.001, Math.min(5, datosBase.roi_promedio * (1 + variacion * 0.3))),
                empleados: Math.max(1, Math.round(datosBase.empleados_promedio * (1 + variacion))),
                crecimiento: Math.max(-0.5, Math.min(2, datosBase.crecimiento_anual * (1 + variacion * 0.8))),
                endeudamiento: Math.max(0.01, Math.min(2, datosBase.endeudamiento_promedio * (1 + variacion * 0.4)))
            });
        }

        return datos.sort((a, b) => a.ingresos - b.ingresos);
    }

    calcularPerfilGrupo(gruposUsuario) {
        // Analizar los grupos del usuario para crear un perfil más específico
        const perfil = {
            multiplicadorIngresos: 1,
            multiplicadorMargen: 1,
            multiplicadorROI: 1,
            multiplicadorEmpleados: 1,
            multiplicadorCrecimiento: 1,
            multiplicadorEndeudamiento: 1,
            numeroEmpresas: 30,
            variacion: 0.3 // Menos variación = más precisión en grupos
        };

        gruposUsuario.forEach(grupo => {
            const nombreGrupo = grupo.nombre_grupo.toLowerCase();

            // Ajustes basados en el nombre del grupo
            if (nombreGrupo.includes('pequeña') || nombreGrupo.includes('micro')) {
                perfil.multiplicadorIngresos *= 0.4;
                perfil.multiplicadorEmpleados *= 0.3;
                perfil.numeroEmpresas = 25;
            }

            if (nombreGrupo.includes('mediana')) {
                perfil.multiplicadorIngresos *= 0.8;
                perfil.multiplicadorEmpleados *= 0.7;
                perfil.numeroEmpresas = 35;
            }

            if (nombreGrupo.includes('tecnología') || nombreGrupo.includes('tech')) {
                perfil.multiplicadorMargen *= 1.3;
                perfil.multiplicadorROI *= 1.2;
                perfil.multiplicadorCrecimiento *= 1.4;
                perfil.multiplicadorEndeudamiento *= 0.8;
            }

            if (nombreGrupo.includes('manufactura') || nombreGrupo.includes('industrial')) {
                perfil.multiplicadorMargen *= 0.9;
                perfil.multiplicadorROI *= 0.9;
                perfil.multiplicadorEndeudamiento *= 1.2;
            }

            if (nombreGrupo.includes('comercio')) {
                perfil.multiplicadorMargen *= 0.8;
                perfil.multiplicadorROI *= 0.85;
                perfil.multiplicadorCrecimiento *= 0.9;
            }

            if (nombreGrupo.includes('energía') || nombreGrupo.includes('sostenible')) {
                perfil.multiplicadorCrecimiento *= 1.1;
                perfil.multiplicadorEndeudamiento *= 1.3;
            }

            if (nombreGrupo.includes('turismo')) {
                perfil.multiplicadorMargen *= 0.85;
                perfil.multiplicadorCrecimiento *= 1.2;
                perfil.numeroEmpresas = 40;
            }
        });

        return perfil;
    }

    filtrarPorTamanoEmpresa(datos, tamano) {
        if (tamano === 'todos') return datos;
        const filtros = {
            'micro': d => d.empleados <= 10,
            'pequena': d => d.empleados > 10 && d.empleados <= 50,
            'mediana': d => d.empleados > 50 && d.empleados <= 200,
            'grande': d => d.empleados > 200
        };
        return filtros[tamano] ? datos.filter(filtros[tamano]) : datos;
    }

    calcularAnalisisSectorial(metricasEmpresa, datosSectoriales) {
        const analisis = {};
        Object.entries(metricasEmpresa).forEach(([metrica, valor]) => {
            if (datosSectoriales.length > 0) {
                const valoresSector = datosSectoriales.map(d => d[metrica]).filter(v => v !== undefined && !isNaN(v));
                if (valoresSector.length > 0) {
                    analisis[metrica] = {
                        valor_empresa: valor,
                        promedio_sector: valoresSector.reduce((a, b) => a + b, 0) / valoresSector.length,
                        percentil_25: this.calcularPercentil(valoresSector, 25),
                        percentil_75: this.calcularPercentil(valoresSector, 75),
                        minimo: Math.min(...valoresSector),
                        maximo: Math.max(...valoresSector),
                        posicion_relativa: this.calcularPosicionRelativa(valor, valoresSector)
                    };
                }
            }
        });
        return analisis;
    }

    calcularPercentil(valores, percentil) {
        const sorted = [...valores].sort((a, b) => a - b);
        const index = (percentil / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        if (lower === upper) return sorted[lower];
        const weight = index - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    calcularPosicionRelativa(valor, valores) {
        const sorted = [...valores].sort((a, b) => a - b);
        let menoresOiguales = 0;
        for (let val of sorted) {
            if (valor >= val) menoresOiguales++;
            else break;
        }
        const percentil = (menoresOiguales / sorted.length) * 100;
        return { percentil, ranking: `${menoresOiguales} de ${sorted.length}` };
    }

    generarRecomendaciones(analisis, datos) {
        const recomendaciones = [];
        Object.entries(analisis).filter(([key]) => !key.startsWith('_')).forEach(([metrica, stats]) => {
            if (stats.posicion_relativa.percentil < 50) {
                recomendaciones.push({
                    tipo: 'oportunidad_mejora',
                    metrica: metrica,
                    mensaje: `Tu ${this.nombreMetrica(metrica)} está por debajo del promedio sectorial.`,
                    acciones: ['Revisar procesos', 'Implementar mejores prácticas']
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

    // ==================== FUNCIONES PERSONALIZADAS ====================

    async generarAnalisisPersonalizado(empresaBase, empresasComparacion, criteriosSeleccionados) {
        const analisis = {};

        // Para cada criterio seleccionado, calcular estadísticas comparativas
        criteriosSeleccionados.forEach(criterio => {
            const valorBase = empresaBase[criterio];
            const valoresComparacion = empresasComparacion
                .map(empresa => empresa[criterio])
                .filter(valor => valor !== null && valor !== undefined && !isNaN(valor));

            // Calcular posición relativa (siempre disponible)
            const posicionRelativa = this.calcularPosicionRelativaPersonalizada(valorBase, valoresComparacion);

            if (valoresComparacion.length > 0) {
                // Calcular estadísticas completas cuando hay datos de comparación
                const promedio = valoresComparacion.reduce((a, b) => a + b, 0) / valoresComparacion.length;
                const minimo = Math.min(...valoresComparacion);
                const maximo = Math.max(...valoresComparacion);
                const mediana = this.calcularMediana(valoresComparacion);

                analisis[criterio] = {
                    valor_base: valorBase,
                    promedio_comparacion: promedio,
                    minimo_comparacion: minimo,
                    maximo_comparacion: maximo,
                    mediana_comparacion: mediana,
                    empresas_comparadas: valoresComparacion.length,
                    posicion_relativa: posicionRelativa,
                    mejor_que_promedio: valorBase > promedio,
                    percentil: posicionRelativa.percentil
                };
            } else {
                // Crear entrada básica cuando no hay datos de comparación
                analisis[criterio] = {
                    valor_base: valorBase,
                    promedio_comparacion: 0,
                    minimo_comparacion: 0,
                    maximo_comparacion: 0,
                    mediana_comparacion: 0,
                    empresas_comparadas: 0,
                    posicion_relativa: posicionRelativa,
                    mejor_que_promedio: false,
                    percentil: posicionRelativa.percentil
                };
            }
        });

        analisis._empresaBase = empresaBase.nombre;
        analisis._empresasComparadas = empresasComparacion.length;
        analisis._criteriosAnalizados = criteriosSeleccionados.length;

        return analisis;
    }

    calcularMediana(valores) {
        const sorted = [...valores].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    calcularPosicionRelativaPersonalizada(valorBase, valoresComparacion) {
        if (!valoresComparacion || valoresComparacion.length === 0) {
            return {
                percentil: 50, // Posición neutral si no hay datos para comparar
                ranking: '1 de 1',
                mejorQue: 0,
                peorQue: 0,
                igualQue: 0
            };
        }

        const todosLosValores = [...valoresComparacion, valorBase].sort((a, b) => a - b);
        const posicion = todosLosValores.indexOf(valorBase);
        const percentil = todosLosValores.length > 1 ? (posicion / (todosLosValores.length - 1)) * 100 : 50;

        return {
            percentil: percentil,
            ranking: `${posicion + 1} de ${todosLosValores.length}`,
            mejorQue: valoresComparacion.filter(v => valorBase > v).length,
            peorQue: valoresComparacion.filter(v => valorBase < v).length,
            igualQue: valoresComparacion.filter(v => valorBase === v).length
        };
    }

    generarInsightsPersonalizados(analisis, empresaBase, empresasComparacion) {
        const insights = [];

        Object.entries(analisis).filter(([key]) => !key.startsWith('_')).forEach(([criterio, stats]) => {
            // Verificar que stats tenga todas las propiedades necesarias
            if (!stats || !stats.posicion_relativa || typeof stats.posicion_relativa.percentil === 'undefined') {
                return;
            }

            const nombreMetrica = this.nombreMetrica(criterio);
            const valorBase = stats.valor_base;
            const promedio = stats.promedio_comparacion;

            // Insight sobre posición general
            if (stats.posicion_relativa.percentil >= 75) {
                insights.push({
                    tipo: 'destacado',
                    icono: 'trophy',
                    titulo: `Excelente en ${nombreMetrica}`,
                    descripcion: `Tu ${nombreMetrica} (${this.formatearValorSimple(criterio, valorBase)}) está entre el top 25% de las empresas comparadas.`,
                    color: 'green'
                });
            } else if (stats.posicion_relativa.percentil <= 25) {
                insights.push({
                    tipo: 'oportunidad',
                    icono: 'arrow-up',
                    titulo: `Oportunidad de mejora en ${nombreMetrica}`,
                    descripcion: `Tu ${nombreMetrica} está por debajo del promedio de las empresas comparadas.`,
                    color: 'yellow'
                });
            }

            // Insight sobre brecha con el mejor
            const brechaConMejor = ((stats.maximo_comparacion - valorBase) / stats.maximo_comparacion) * 100;
            if (brechaConMejor > 20) {
                insights.push({
                    tipo: 'brecha',
                    icono: 'chart-line',
                    titulo: `Brecha significativa en ${nombreMetrica}`,
                    descripcion: `Hay una diferencia de ${brechaConMejor.toFixed(1)}% con la mejor empresa en este criterio.`,
                    color: 'blue'
                });
            }

            // Insight sobre consistencia
            const valoresComparacionCriterio = empresasComparacion.map(empresa => empresa[criterio]);
            const variacionComparacion = this.calcularVariacion(valoresComparacionCriterio);
            if (variacionComparacion < 15) {
                insights.push({
                    tipo: 'consistencia',
                    icono: 'balance-scale',
                    titulo: `Mercado consistente en ${nombreMetrica}`,
                    descripcion: `Las empresas comparadas tienen valores similares, indicando un mercado maduro.`,
                    color: 'purple'
                });
            }
        });

        // Insights generales
        const criteriosAnalizados = Object.keys(analisis).filter(k => !k.startsWith('_')).length;
        const criteriosDestacados = Object.values(analisis).filter(stats =>
            stats && stats.posicion_relativa && typeof stats.posicion_relativa.percentil === 'number' && stats.posicion_relativa.percentil >= 75
        ).length;

        if (criteriosDestacados === criteriosAnalizados && criteriosAnalizados > 0) {
            insights.push({
                tipo: 'general',
                icono: 'star',
                titulo: 'Empresa Líder',
                descripcion: 'Tu empresa está entre las mejores en todos los criterios analizados.',
                color: 'gold'
            });
        } else if (criteriosDestacados >= criteriosAnalizados / 2 && criteriosAnalizados > 0) {
            insights.push({
                tipo: 'general',
                icono: 'thumbs-up',
                titulo: 'Buen desempeño general',
                descripcion: 'Tu empresa tiene un buen desempeño en la mayoría de los criterios.',
                color: 'green'
            });
        }

        return insights;
    }

    calcularVariacion(valores) {
        if (valores.length === 0) return 0;
        const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
        const varianza = valores.reduce((acc, val) => acc + Math.pow(val - promedio, 2), 0) / valores.length;
        const desviacion = Math.sqrt(varianza);
        return (desviacion / promedio) * 100;
    }

    formatearValorSimple(criterio, valor) {
        if (criterio === 'ingresos') return `S/ ${valor.toLocaleString('es-PE')}`;
        if (criterio === 'empleados') return `${Math.round(valor)} empleados`;
        if (criterio.includes('margen') || criterio.includes('roi') || criterio.includes('crecimiento')) {
            return valor > 1 ? `${valor.toFixed(1)}%` : `${(valor * 100).toFixed(1)}%`;
        }
        return valor.toFixed(2);
    }

    generarRecomendacionesPersonalizadas(analisis, empresaBase) {
        const recomendaciones = [];

        Object.entries(analisis).filter(([key]) => !key.startsWith('_')).forEach(([criterio, stats]) => {
            // Verificar que stats tenga posicion_relativa válida
            if (!stats || !stats.posicion_relativa || typeof stats.posicion_relativa.percentil === 'undefined') {
                return;
            }

            const nombreMetrica = this.nombreMetrica(criterio);

            if (stats.posicion_relativa.percentil < 50) {
                // Recomendaciones específicas por métrica
                switch (criterio) {
                    case 'ingresos':
                        recomendaciones.push({
                            tipo: 'estrategia_comercial',
                            metrica: criterio,
                            titulo: `Estrategias para aumentar ingresos`,
                            descripcion: `Considera diversificar productos/servicios, expandir mercados o mejorar estrategias de pricing.`,
                            prioridad: stats.posicion_relativa.percentil < 25 ? 'alta' : 'media'
                        });
                        break;

                    case 'margen_beneficio':
                        recomendaciones.push({
                            tipo: 'optimizacion_costos',
                            metrica: criterio,
                            titulo: `Optimización de costos y márgenes`,
                            descripcion: `Revisa estructura de costos, negocia con proveedores o mejora procesos productivos.`,
                            prioridad: 'alta'
                        });
                        break;

                    case 'roi':
                        recomendaciones.push({
                            tipo: 'inversiones',
                            metrica: criterio,
                            titulo: `Mejora del retorno de inversiones`,
                            descripcion: `Evalúa proyectos de inversión actuales y enfócate en aquellos con mayor retorno esperado.`,
                            prioridad: stats.posicion_relativa.percentil < 25 ? 'alta' : 'media'
                        });
                        break;

                    case 'empleados':
                        recomendaciones.push({
                            tipo: 'productividad',
                            metrica: criterio,
                            titulo: `Optimización de recursos humanos`,
                            descripcion: `Considera capacitación, mejora de procesos o evaluación de estructura organizacional.`,
                            prioridad: 'media'
                        });
                        break;

                    case 'crecimiento':
                        recomendaciones.push({
                            tipo: 'expansion',
                            metrica: criterio,
                            titulo: `Estrategias de crecimiento`,
                            descripcion: `Explora nuevos mercados, alianzas estratégicas o innovación de productos/servicios.`,
                            prioridad: 'alta'
                        });
                        break;
                }
            }
        });

        // Recomendaciones generales basadas en el perfil
        const criteriosBajos = Object.values(analisis).filter(stats =>
            stats && stats.posicion_relativa && typeof stats.posicion_relativa.percentil === 'number' && stats.posicion_relativa.percentil < 50
        ).length;
        const totalCriterios = Object.keys(analisis).filter(k => !k.startsWith('_')).length;

        if (criteriosBajos > totalCriterios / 2) {
            recomendaciones.push({
                tipo: 'diagnostico_general',
                titulo: 'Diagnóstico integral recomendado',
                descripcion: `Considera realizar un análisis más profundo de tu empresa para identificar oportunidades de mejora sistemáticas.`,
                prioridad: 'alta'
            });
        }

        return recomendaciones;
    }
}

// ==================== UI MODULE ====================
class BenchmarkingUIFinal {
    constructor() {
        this.currentCalculator = null;
        }

    setupCalculatorSelection() {
        document.querySelectorAll('.calculator-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const calculatorType = card.dataset.calculator;
                this.showCalculator(calculatorType);
            });
        });
    }

    showCalculator(type) {
        // Remover indicadores visuales previos
        document.querySelectorAll('.calculator-card').forEach(card => {
            card.classList.remove('ring-2', 'ring-blue-500', 'ring-green-500', 'ring-purple-500', 'bg-blue-50', 'bg-green-50', 'bg-purple-50');
            const icon = card.querySelector('i');
            if (icon) icon.classList.remove('text-blue-600', 'text-green-600', 'text-purple-600');
        });

        // Ocultar todas las calculadoras
        document.querySelectorAll('.simulation-calculator').forEach(calc => calc.style.display = 'none');

        // Mostrar calculadora seleccionada
        const target = document.getElementById(`${type}-calculator`);
        if (target) target.style.display = 'block';
        this.currentCalculator = type;

        // Agregar indicadores visuales según el tipo seleccionado
        const selectedCard = document.querySelector(`.calculator-card[data-calculator="${type}"]`);
        if (selectedCard) {
            const icon = selectedCard.querySelector('i');
            if (type === 'grupos') {
                selectedCard.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
                if (icon) icon.classList.add('text-blue-600');
            } else if (type === 'sectorial') {
                selectedCard.classList.add('ring-2', 'ring-green-500', 'bg-green-50');
                if (icon) icon.classList.add('text-green-600');
            } else if (type === 'personalizado') {
                selectedCard.classList.add('ring-2', 'ring-purple-500', 'bg-purple-50');
                if (icon) icon.classList.add('text-purple-600');
            }
        }
    }

    mostrarResultadosBenchmarking(analisis, recomendaciones, datos) {
        const container = document.getElementById('sectorial-results');
        if (!container) return;

        // Determinar qué mostrar basado en opciones
        const mostrarRecomendaciones = datos.incluirRecomendaciones !== false;
        const mostrarDetallado = datos.analisisDetallado === true;

        let html = `
            <div class="flex items-center justify-between mb-6">
                <h4 class="text-xl font-bold text-gray-800">Resultados del Benchmarking Sectorial</h4>
            </div>

            <!-- Resumen -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h5 class="font-bold text-gray-800 mb-4">Resumen del Análisis</h5>
                <div class="grid md:grid-cols-3 gap-4 mb-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">${analisis._empresasComparadas}</div>
                        <div class="text-sm text-gray-600">Empresas Comparadas</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">${Object.keys(analisis).filter(k => !k.startsWith('_')).length}</div>
                        <div class="text-sm text-gray-600">Métricas Analizadas</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600">${this.calcularPercentilPromedio(analisis).toFixed(1)}%</div>
                        <div class="text-sm text-gray-600">Posición Promedio</div>
                    </div>
                </div>

                <!-- Información de Grupos Personalizados -->
                ${analisis._gruposUsuario > 0 ? `
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <i class="fas fa-users-cog text-blue-600 text-lg mt-1"></i>
                            </div>
                            <div class="ml-3 flex-1">
                                <h6 class="font-semibold text-blue-800 mb-2">Análisis Personalizado por Grupos</h6>
                                <div class="text-sm text-blue-700 space-y-1">
                                    <div><strong>${analisis._gruposUsuario}</strong> grupo(s) personalizado(s) influenciaron este análisis</div>
                                    <div class="text-xs text-blue-600 mt-2">
                                        Los datos comparativos fueron ajustados para reflejar empresas similares a las de tus grupos
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <i class="fas fa-info-circle text-gray-500 text-lg mt-1"></i>
                            </div>
                            <div class="ml-3 flex-1">
                                <h6 class="font-semibold text-gray-700 mb-2">Análisis Sectorial Estándar</h6>
                                <div class="text-sm text-gray-600">
                                    Únete a grupos de benchmarking para obtener análisis más personalizados y precisos
                                </div>
                            </div>
                        </div>
                    </div>
                `}
            </div>

            <!-- Análisis Detallado -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h5 class="font-bold text-gray-800 mb-4">Análisis Detallado por Métrica</h5>
                <div class="space-y-4">
        `;

        Object.entries(analisis).filter(([key]) => !key.startsWith('_')).forEach(([metrica, stats]) => {
            html += `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h6 class="font-semibold text-gray-800 mb-3">${window.benchmarkingManager.core.nombreMetrica(metrica)}</h6>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div class="text-center">
                            <div class="text-lg font-bold text-blue-600">${this.formatearValor(metrica, stats.valor_empresa)}</div>
                            <div class="text-xs text-gray-600">Tu Valor</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold text-gray-600">${this.formatearValor(metrica, stats.promedio_sector)}</div>
                            <div class="text-xs text-gray-600">Promedio Sector</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-bold ${this.clasePosicion(stats.posicion_relativa.percentil)}">${this.formatearPercentil(stats.posicion_relativa.percentil)}</div>
                            <div class="text-xs text-gray-600">Tu Posición</div>
                        </div>
                    </div>
                    ${mostrarDetallado ? `
                        <div class="mt-3 pt-3 border-t border-gray-200">
                            <div class="grid md:grid-cols-2 gap-2 text-xs text-gray-500">
                                <div>P25: ${this.formatearValor(metrica, stats.percentil_25)}</div>
                                <div>P75: ${this.formatearValor(metrica, stats.percentil_75)}</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += `</div></div>`;

        // Recomendaciones (solo si está habilitado)
        if (mostrarRecomendaciones && recomendaciones.length > 0) {
            html += `
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <h5 class="font-bold text-gray-800 mb-4">Recomendaciones de Mejora</h5>
                    <div class="space-y-3">
            `;

            recomendaciones.forEach(rec => {
                html += `
                    <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
                        <div class="flex items-start">
                            <i class="fas fa-lightbulb text-blue-600 mt-1 mr-3"></i>
                            <div>
                                <h6 class="font-semibold text-gray-800">${rec.metrica}</h6>
                                <p class="text-sm text-gray-700">${rec.mensaje}</p>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        }

        // Gráfica
        html += `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h5 class="font-bold text-gray-800 mb-4">Visualización de Resultados</h5>
                <div><canvas id="grafico-sectorial" width="600" height="300"></canvas></div>
            </div>

            <!-- Botón Guardar -->
            <div class="flex justify-center mt-6">
                <button onclick="window.benchmarkingManager.guardarAnalisis()" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold">
                    <i class="fas fa-save mr-2"></i>Guardar Análisis
                </button>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        // Crear gráfica después de mostrar resultados
        setTimeout(() => this.crearGrafica(analisis, datos), 100);
    }

    crearGrafica(analisis, datos) {
        const ctx = document.getElementById('grafico-sectorial');
        if (!ctx) return;

        const metricas = Object.keys(analisis).filter(k => !k.startsWith('_'));

        // Crear gráfica simple con todas las métricas
        const labels = metricas.map(m => window.benchmarkingManager.core.nombreMetrica(m));

        // Normalizar valores para comparación visual
        const datosEmpresa = metricas.map(m => {
            const valor = analisis[m].valor_empresa;
            // Normalizar porcentajes y valores absolutos
            if (m === 'ingresos') return valor / 10000; // Escalar ingresos
            if (m === 'empleados') return valor; // Mantener empleados
            return valor > 1 ? valor : valor * 100; // Convertir decimales a %
        });

        const datosSector = metricas.map(m => {
            const valor = analisis[m].promedio_sector;
            // Normalizar porcentajes y valores absolutos
            if (m === 'ingresos') return valor / 10000; // Escalar ingresos
            if (m === 'empleados') return valor; // Mantener empleados
            return valor > 1 ? valor : valor * 100; // Convertir decimales a %
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tu Empresa',
                    data: datosEmpresa,
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    borderWidth: 1
                }, {
                    label: 'Promedio Sector',
                    data: datosSector,
                    backgroundColor: '#ef4444',
                    borderColor: '#dc2626',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: `Benchmarking Sectorial - ${datos.sector}` },
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                const dataIndex = context.dataIndex;
                                const metrica = metricas[dataIndex];

                                // Obtener el valor real dependiendo del dataset
                                let realValue;
                                if (context.datasetIndex === 0) {
                                    // Tu Empresa
                                    realValue = analisis[metrica].valor_empresa;
                                } else {
                                    // Promedio Sector
                                    realValue = analisis[metrica].promedio_sector;
                                }

                                // Formatear valores reales
                                if (metrica === 'ingresos') {
                                    return `${label}: S/ ${realValue.toLocaleString('es-PE')}`;
                                } else if (metrica === 'empleados') {
                                    return `${label}: ${Math.round(realValue)} personas`;
                                } else {
                                    // Porcentajes
                                    const percentValue = realValue > 1 ? realValue : realValue * 100;
                                    return `${label}: ${percentValue.toFixed(1)}%`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Valor Normalizado' },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1);
                            }
                        }
                    }
                }
            }
        });
    }

    calcularPercentilPromedio(analisis) {
        const percentiles = Object.values(analisis)
            .filter(stats => stats.posicion_relativa)
            .map(stats => stats.posicion_relativa.percentil)
            .filter(p => !isNaN(p));

        return percentiles.length > 0 ? percentiles.reduce((a, b) => a + b, 0) / percentiles.length : 0;
    }

    formatearValor(metrica, valor) {
        if (valor === null || valor === undefined || isNaN(valor)) return 'N/A';

        if (metrica.includes('margen') || metrica.includes('roi') || metrica.includes('crecimiento') || metrica.includes('endeudamiento')) {
            const num = parseFloat(valor);
            return num > 1 ? num.toFixed(2) + '%' : (num * 100).toFixed(2) + '%';
        }
        if (metrica === 'ingresos') return 'S/ ' + parseFloat(valor).toLocaleString('es-PE');
        if (metrica === 'empleados') return Math.round(parseFloat(valor)).toString();
        return parseFloat(valor).toFixed(2);
    }

    clasePosicion(percentil) {
        if (percentil >= 75) return 'text-green-600';
        if (percentil >= 50) return 'text-blue-600';
        if (percentil >= 25) return 'text-yellow-600';
        return 'text-red-600';
    }

    formatearPercentil(percentil) {
        if (percentil === null || percentil === undefined || isNaN(percentil)) {
            return '0.0%';
        }
        return percentil.toFixed(1) + '%';
    }

    mostrarExito(mensaje) {
        if (window.benchmarkingNotifications) {
            window.benchmarkingNotifications.success(mensaje);
        } else {
            alert('✅ ' + mensaje);
        }
    }

    mostrarError(mensaje) {
        if (window.benchmarkingNotifications) {
            window.benchmarkingNotifications.error(mensaje);
        } else {
            alert('❌ ' + mensaje);
        }
    }

    // ==================== RESULTADOS PERSONALIZADOS ====================

    mostrarResultadosPersonalizados(analisis, empresaBase, empresasComparacion, criteriosSeleccionados, insights, recomendaciones, opciones) {
        const container = document.getElementById('personalizado-results');
        if (!container) return;

        let html = `
            <div class="flex items-center justify-between mb-6">
                <h4 class="text-xl font-bold text-gray-800">Resultados de Comparación Personalizada</h4>
                <div class="flex gap-2">
                    <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar PDF">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                    <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100" title="Exportar Excel">
                        <i class="fas fa-file-excel"></i>
                    </button>
                </div>
            </div>

            <!-- Resumen de Comparación -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-clipboard-check mr-2 text-purple-600"></i>
                    Resumen de la Comparación
                </h5>

                <div class="grid md:grid-cols-4 gap-4 mb-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600">${empresasComparacion.length}</div>
                        <div class="text-sm text-gray-600">Empresas Comparadas</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-pink-600">${criteriosSeleccionados.length}</div>
                        <div class="text-sm text-gray-600">Criterios Analizados</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-indigo-600">${this.calcularPosicionPromedioPersonalizada(analisis).toFixed(1)}%</div>
                        <div class="text-sm text-gray-600">Posición Promedio</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">${insights.length}</div>
                        <div class="text-sm text-gray-600">Insights Generados</div>
                    </div>
                </div>

                <!-- Empresa Base Info -->
                <div class="bg-purple-50 p-4 rounded-lg">
                    <h6 class="font-semibold text-purple-800 mb-2">Empresa Base</h6>
                    <p class="text-purple-700 font-medium">${empresaBase.nombre}</p>
                    <div class="text-sm text-purple-600 mt-1">
                        Comparada contra ${empresasComparacion.length} empresa(s) en ${criteriosSeleccionados.length} criterio(s)
                    </div>
                </div>
            </div>

            <!-- Análisis Detallado por Criterio -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-bar mr-2 text-purple-600"></i>
                    Análisis Detallado por Criterio
                </h5>

                <div class="space-y-4">
        `;

        // Mostrar análisis por cada criterio
        criteriosSeleccionados.forEach(criterio => {
            if (analisis[criterio]) {
                const stats = analisis[criterio];
                const nombreMetrica = window.benchmarkingManager.core.nombreMetrica(criterio);

                html += `
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h6 class="font-semibold text-gray-800 mb-3">${nombreMetrica}</h6>
                        <div class="grid md:grid-cols-4 gap-4">
                            <div class="text-center">
                                <div class="text-lg font-bold text-blue-600">${this.formatearValor(criterio, stats.valor_base)}</div>
                                <div class="text-xs text-gray-600">Tu Valor</div>
                            </div>
                            <div class="text-center">
                                <div class="text-lg font-bold text-gray-600">${this.formatearValor(criterio, stats.promedio_comparacion)}</div>
                                <div class="text-xs text-gray-600">Promedio</div>
                            </div>
                            <div class="text-center">
                                <div class="text-lg font-bold text-green-600">${this.formatearValor(criterio, stats.maximo_comparacion)}</div>
                                <div class="text-xs text-gray-600">Mejor Competidor</div>
                            </div>
                            <div class="text-center">
                                <div class="text-lg font-bold ${this.clasePosicion(stats.percentil)}">${stats.percentil.toFixed(1)}%</div>
                                <div class="text-xs text-gray-600">Tu Posición</div>
                            </div>
                        </div>
                        <div class="mt-3 text-sm text-gray-600">
                            <span class="font-medium">Ranking:</span> ${stats.posicion_relativa.ranking}
                            ${stats.mejor_que_promedio ?
                                '<span class="text-green-600 ml-2">✓ Mejor que el promedio</span>' :
                                '<span class="text-red-600 ml-2">⚠ Debajo del promedio</span>'}
                        </div>
                    </div>
                `;
            }
        });

        html += `
                </div>
            </div>
        `;

        // Insights (si están habilitados)
        if (opciones.generarInsights && insights.length > 0) {
            html += `
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-lightbulb mr-2 text-yellow-600"></i>
                        Insights Automáticos (${insights.length})
                    </h5>

                    <div class="grid md:grid-cols-2 gap-4">
            `;

            insights.forEach(insight => {
                const colorClasses = {
                    'green': 'border-green-400 bg-green-50',
                    'yellow': 'border-yellow-400 bg-yellow-50',
                    'blue': 'border-blue-400 bg-blue-50',
                    'purple': 'border-purple-400 bg-purple-50',
                    'gold': 'border-yellow-400 bg-yellow-50'
                };

                const iconClasses = {
                    'trophy': 'fas fa-trophy text-yellow-600',
                    'arrow-up': 'fas fa-arrow-up text-red-600',
                    'chart-line': 'fas fa-chart-line text-blue-600',
                    'balance-scale': 'fas fa-balance-scale text-purple-600',
                    'star': 'fas fa-star text-yellow-600',
                    'thumbs-up': 'fas fa-thumbs-up text-green-600'
                };

                html += `
                    <div class="border-l-4 p-4 rounded-r-lg ${colorClasses[insight.color] || 'border-gray-400 bg-gray-50'}">
                        <div class="flex items-start">
                            <i class="${iconClasses[insight.icono] || 'fas fa-info-circle text-gray-600'} mt-1 mr-3"></i>
                            <div>
                                <h6 class="font-semibold text-gray-800 mb-1">${insight.titulo}</h6>
                                <p class="text-sm text-gray-700">${insight.descripcion}</p>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Recomendaciones (si están habilitadas)
        if (opciones.incluirRecomendaciones && recomendaciones.length > 0) {
            html += `
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-clipboard-list mr-2 text-blue-600"></i>
                        Recomendaciones de Mejora (${recomendaciones.length})
                    </h5>

                    <div class="space-y-3">
            `;

            recomendaciones.forEach(rec => {
                const prioridadClasses = {
                    'alta': 'border-red-400 bg-red-50',
                    'media': 'border-yellow-400 bg-yellow-50',
                    'baja': 'border-blue-400 bg-blue-50'
                };

                const prioridadIcon = {
                    'alta': 'fas fa-exclamation-triangle text-red-600',
                    'media': 'fas fa-info-circle text-yellow-600',
                    'baja': 'fas fa-check-circle text-blue-600'
                };

                html += `
                    <div class="border-l-4 p-4 rounded-r-lg ${prioridadClasses[rec.prioridad] || 'border-gray-400 bg-gray-50'}">
                        <div class="flex items-start">
                            <i class="${prioridadIcon[rec.prioridad] || 'fas fa-info-circle text-gray-600'} mt-1 mr-3"></i>
                            <div class="flex-1">
                                <div class="flex items-center justify-between mb-1">
                                    <h6 class="font-semibold text-gray-800">${rec.titulo}</h6>
                                    <span class="text-xs px-2 py-1 rounded-full ${rec.prioridad === 'alta' ? 'bg-red-100 text-red-800' : rec.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}">
                                        ${rec.prioridad.toUpperCase()}
                                    </span>
                                </div>
                                <p class="text-sm text-gray-700">${rec.descripcion}</p>
                                ${rec.metrica ? `<div class="text-xs text-gray-500 mt-1">Relacionado con: ${window.benchmarkingManager.core.nombreMetrica(rec.metrica)}</div>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Gráfica de comparación
        html += `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h5 class="font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-radar mr-2 text-blue-600"></i>
                    Visualización Comparativa
                </h5>

                <div class="grid md:grid-cols-1 gap-6">
                    <div>
                        <canvas id="grafico-personalizado-radar" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <button id="btn-guardar-personalizado" onclick="window.benchmarkingManager.guardarAnalisisPersonalizado()" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300 font-semibold flex items-center justify-center">
                    <i class="fas fa-save mr-2"></i>Guardar Análisis
                </button>
                <button class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold flex items-center justify-center" onclick="window.benchmarkingManager.ui.showCalculator('personalizado')">
                    <i class="fas fa-redo mr-2"></i>Nueva Comparación
                </button>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        // Crear gráfica después de mostrar resultados
        setTimeout(() => this.crearGraficaPersonalizada(analisis, empresaBase, empresasComparacion, criteriosSeleccionados), 100);
    }

    calcularPosicionPromedioPersonalizada(analisis) {
        const percentiles = Object.values(analisis)
            .filter(stats => stats && typeof stats.percentil === 'number')
            .map(stats => stats.percentil);

        return percentiles.length > 0 ? percentiles.reduce((a, b) => a + b, 0) / percentiles.length : 0;
    }

    crearGraficaPersonalizada(analisis, empresaBase, empresasComparacion, criteriosSeleccionados) {
        const ctx = document.getElementById('grafico-personalizado-radar');
        if (!ctx) return;

        // Preparar datos para gráfica radar
        const labels = criteriosSeleccionados.map(criterio => window.benchmarkingManager.core.nombreMetrica(criterio));

        // Normalizar valores para comparación visual (escala 0-100)
        const normalizarValor = (valor, criterio) => {
            if (criterio === 'ingresos') return Math.min(100, (valor / 1000000) * 100); // Escalar ingresos
            if (criterio === 'empleados') return Math.min(100, (valor / 100) * 100); // Escalar empleados
            if (valor > 1) return Math.min(100, valor); // Valores absolutos
            return Math.min(100, valor * 100); // Convertir porcentajes
        };

        // Datos de la empresa base
        const datosBase = criteriosSeleccionados.map(criterio =>
            normalizarValor(analisis[criterio]?.valor_base || 0, criterio)
        );

        // Datos promedio de comparación
        const datosPromedio = criteriosSeleccionados.map(criterio =>
            normalizarValor(analisis[criterio]?.promedio_comparacion || 0, criterio)
        );

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: empresaBase.nombre,
                    data: datosBase,
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(139, 92, 246, 1)'
                }, {
                    label: 'Promedio Competidores',
                    data: datosPromedio,
                    backgroundColor: 'rgba(236, 72, 153, 0.2)',
                    borderColor: 'rgba(236, 72, 153, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(236, 72, 153, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(236, 72, 153, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparación Personalizada - Perfil Empresarial',
                        font: { size: 16 }
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }
}

// ==================== UTILS MODULE ====================
class BenchmarkingUtilsFinal {
    constructor() {
        }

    validarDatosBenchmarking(datos) {
        return datos.sector && datos.metricas && Object.keys(datos.metricas).length > 0;
    }

    guardarAnalisisBenchmarking(tipo, datos) {
        const analisisData = {
            id: Date.now(),
            tipo: tipo,
            datos: datos,
            timestamp: new Date().toISOString()
        };

        const existentes = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
        existentes[analisisData.id] = analisisData;
        localStorage.setItem('econova_benchmarking', JSON.stringify(existentes));

        return analisisData;
    }

    cargarAnalisisBenchmarking() {
        return JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
    }
}

// ==================== MAIN MANAGER ====================
class BenchmarkingManagerFinal {
    constructor() {
        this.core = new BenchmarkingCoreFinal();
        this.ui = new BenchmarkingUIFinal();
        this.utils = new BenchmarkingUtilsFinal();

        this.isProcessing = false;
        this.datosAnalisisActual = null; // Para guardar análisis actual
        this.init();
    }

    init() {
        this.ui.setupCalculatorSelection();
        this.setupEventListeners();
        this.setupMetricInputs(); // Habilitar/deshabilitar inputs según checkboxes
        this.ui.showCalculator('grupos');

        // Cargar grupos de benchmarking reales desde la API
        this.cargarGruposBenchmarking();

        }

    setupEventListeners() {
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'form-benchmarking-sectorial') {
                e.preventDefault();

                if (this.isProcessing) {
                    return;
                }

                this.isProcessing = true;
                this.procesarBenchmarkingSectorial(e.target);
            }

            if (e.target.id === 'form-comparacion-personalizada') {
                e.preventDefault();

                if (this.isProcessing) {
                    return;
                }

                this.isProcessing = true;
                this.procesarComparacionPersonalizada(e.target);
            }
        });

        // Event listener para agregar empresas
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btn-agregar-empresa' || e.target.closest('#btn-agregar-empresa')) {
                e.preventDefault();
                this.agregarEmpresaComparacion();
            }

            // Verificar si se hizo click en botón remover o en su icono
            const botonRemover = e.target.classList.contains('remover-empresa') ? e.target : e.target.closest('.remover-empresa');
            if (botonRemover) {
                e.preventDefault();
                this.removerEmpresaComparacion(botonRemover);
            }
        });
    }

    async procesarBenchmarkingSectorial(form) {
        const formData = new FormData(form);
        const metricasSeleccionadas = formData.getAll('metricas[]');

        const metricas = {};
        metricasSeleccionadas.forEach(metrica => {
            const valor = parseFloat(formData.get(metrica));
            if (!isNaN(valor) && valor > 0) {
                metricas[metrica] = valor;
            }
        });

        const datos = {
            sector: formData.get('sector'),
            tamanoEmpresa: formData.get('tamano_empresa'),
            metricas: metricas,
            periodo: formData.get('periodo') || 'ultimo_anio',
            analisisDetallado: formData.has('analisis_detallado'),
            incluirRecomendaciones: formData.has('incluir_recomendaciones')
        };

        if (!this.utils.validarDatosBenchmarking(datos)) {
            this.ui.mostrarError('Complete los datos correctamente');
            this.isProcessing = false;
            return;
        }

        try {
            // Obtener grupos del usuario actual antes del análisis
            const usuarioId = this.getUsuarioId();
            const gruposUsuario = usuarioId ? await this.core.obtenerGruposUsuarioActualesDirecto(usuarioId) : [];

            const analisis = await this.core.generarAnalisisSectorial(
                datos.metricas,
                datos.sector,
                datos.tamanoEmpresa,
                gruposUsuario
            );

            const recomendaciones = this.core.generarRecomendaciones(analisis, datos);

            // Guardar datos del análisis actual para poder guardarlo después
            this.datosAnalisisActual = {
                analisis: analisis,
                recomendaciones: recomendaciones,
                datos: datos,
                timestamp: new Date().toISOString()
            };

            this.ui.mostrarResultadosBenchmarking(analisis, recomendaciones, datos);
            this.ui.mostrarExito('Análisis completado exitosamente');

        } catch (error) {
            this.ui.mostrarError('Error generando análisis');
        } finally {
            this.isProcessing = false;
        }
    }

    guardarAnalisis() {
        try {
            // Validar que haya datos de análisis actual
            if (!this.datosAnalisisActual || !this.datosAnalisisActual.datos) {
                this.ui.mostrarError('Primero debes generar un análisis antes de guardarlo');
                return;
            }

            const analisisActual = this.datosAnalisisActual;

            // Validar que tenga datos mínimos
            if (!analisisActual.datos.sector || !analisisActual.datos.metricas ||
                Object.keys(analisisActual.datos.metricas).length === 0) {
                this.ui.mostrarError('El análisis no tiene datos completos para guardar');
                return;
            }

            // Crear entrada completa para guardar
            const sector = analisisActual.datos.sector;
            const tamanoEmpresa = analisisActual.datos.tamanoEmpresa;
            const periodo = analisisActual.datos.periodo;

            // Formatear tamaño de empresa para mostrar
            const tamanoFormateado = {
                'micro': 'Microempresa (1-10 empleados)',
                'pequena': 'Pequeña (11-50 empleados)',
                'mediana': 'Mediana (51-200 empleados)',
                'grande': 'Grande (201+ empleados)',
                'todos': 'Todos los tamaños'
            }[tamanoEmpresa] || tamanoEmpresa;

            const analisisData = {
                id: Date.now(),
                tipo: 'sectorial',
                titulo: `Análisis de Benchmarking Sectorial - ${sector}`,
                sector: sector,
                tamanoEmpresa: tamanoFormateado, // Guardar versión formateada
                periodo: periodo,
                metricasAnalizadas: Object.keys(analisisActual.datos.metricas),
                numeroMetricas: Object.keys(analisisActual.datos.metricas).length,
                empresasComparadas: analisisActual.analisis._empresasComparadas || 0,
                percentilPromedio: window.benchmarkingManager.ui.calcularPercentilPromedio(analisisActual.analisis),
                timestamp: new Date().toISOString(),
                fechaFormateada: new Date().toLocaleDateString('es-ES'),
                datos: analisisActual,
                analisis: analisisActual.analisis,
                recomendaciones: analisisActual.recomendaciones
            };

            // Guardar en localStorage
            const existentes = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
            existentes[analisisData.id] = analisisData;
            localStorage.setItem('econova_benchmarking', JSON.stringify(existentes));

            this.ui.mostrarExito('Análisis guardado correctamente');

        } catch (error) {
            this.ui.mostrarError('Error al guardar el análisis');
        }
    }

    async cargarGruposBenchmarking() {
        const gruposContainer = document.getElementById('grupos-container');
        if (!gruposContainer) {
            return;
        }

        try {
            // Mostrar loading
            gruposContainer.innerHTML = `
                <div class="text-center py-8">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p class="mt-4 text-gray-600">Cargando grupos...</p>
                </div>
            `;

            const usuarioId = this.getUsuarioId();

            // Cargar todos los grupos disponibles
            const responseGrupos = await fetch('/api/v1/benchmarking/grupos');
            const resultGrupos = await responseGrupos.json();

            let gruposUsuario = [];
            if (usuarioId) {
                // Cargar grupos del usuario
                const responseUsuario = await fetch(`/api/v1/usuarios/${usuarioId}/benchmarking/grupos`);
                const resultUsuario = await responseUsuario.json();
                if (resultUsuario.success) {
                    gruposUsuario = resultUsuario.grupos || [];
                }
            }

            if (responseGrupos.ok && resultGrupos.success) {
                const todosLosGrupos = resultGrupos.grupos || [];
                const gruposUsuarioIds = gruposUsuario.map(g => g.benchmarking_id);

                // Separar grupos ya unidos y disponibles
                const gruposUnidos = todosLosGrupos.filter(g => gruposUsuarioIds.includes(g.benchmarking_id));
                const gruposDisponibles = todosLosGrupos.filter(g => !gruposUsuarioIds.includes(g.benchmarking_id));

                // Mostrar grupos disponibles con diseño limpio
                let html = '';

                // Grupos a los que ya se unió
                if (gruposUnidos.length > 0) {
                    html += `
                        <div class="mb-8">
                            <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <i class="fas fa-user-check text-green-600 mr-2"></i>
                                Mis Grupos (${gruposUnidos.length})
                            </h4>
                            <div class="w-full flex flex-wrap justify-start gap-4" style="width: 100%;">
                    `;

                    gruposUnidos.forEach(grupo => {
                        html += `
                            <div class="bg-green-50 rounded-xl shadow-sm border border-green-200 hover:shadow-lg transition-all duration-300 overflow-hidden" style="width: 300px; flex-shrink: 0;">
                                <div class="p-4">
                                    <div class="flex items-start justify-between mb-4">
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center mb-2">
                                                <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                                    <i class="fas fa-users text-white text-sm"></i>
                                                </div>
                                                <h4 class="font-semibold text-gray-800 text-lg truncate">${grupo.nombre_grupo}</h4>
                                            </div>
                                            <p class="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">${grupo.descripcion}</p>
                                            <div class="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                                                <i class="fas fa-check-circle text-green-500 mr-1 text-xs"></i>
                                                <span class="font-medium">Ya eres miembro</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div class="text-xs text-gray-500">
                                            <i class="fas fa-chart-bar mr-1"></i>
                                            Análisis disponibles
                                        </div>
                                        <button onclick="window.benchmarkingManager.verGrupo(${grupo.benchmarking_id})"
                                                class="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                                            <i class="fas fa-eye mr-2"></i>Ver Grupo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    });

                    html += `
                        </div>
                    </div>
                    `;
                }

                // Grupos disponibles para unirse
                if (gruposDisponibles.length > 0) {
                    html += `
                        <div class="mb-8">
                            <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <i class="fas fa-users text-blue-600 mr-2"></i>
                                Grupos Disponibles (${gruposDisponibles.length})
                            </h4>
                            <div class="w-full flex flex-wrap justify-start gap-4" style="width: 100%;">
                    `;

                    gruposDisponibles.forEach(grupo => {
                        html += `
                            <div class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden" style="width: 300px; flex-shrink: 0;">
                                <div class="p-4">
                                    <div class="flex items-start justify-between mb-4">
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center mb-2">
                                                <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                                    <i class="fas fa-users text-white text-sm"></i>
                                                </div>
                                                <h4 class="font-semibold text-gray-800 text-lg truncate">${grupo.nombre_grupo}</h4>
                                            </div>
                                            <p class="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">${grupo.descripcion}</p>
                                            <div class="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit">
                                                <i class="fas fa-circle text-blue-500 mr-1 text-xs"></i>
                                                <span class="font-medium">Grupo activo</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div class="text-xs text-gray-500">
                                            <i class="fas fa-chart-bar mr-1"></i>
                                            Análisis disponibles
                                        </div>
                                        <button onclick="window.benchmarkingManager.unirseAGrupo(${grupo.benchmarking_id})"
                                                class="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                                            <i class="fas fa-plus mr-2"></i>Unirme al Grupo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    });

                    html += `
                        </div>
                    </div>
                    `;
                }

                if (todosLosGrupos.length === 0) {
                    html = `
                        <div class="text-center text-gray-500 py-8">
                            <i class="fas fa-users text-4xl mb-4"></i>
                            <p>No hay grupos de benchmarking disponibles.</p>
                            <p>Los grupos permiten comparar tus métricas con empresas similares de manera anónima.</p>
                        </div>
                    `;
                }

                gruposContainer.innerHTML = html;
                } else {
                throw new Error(resultGrupos.error || 'Error al cargar grupos');
            }

        } catch (error) {
            gruposContainer.innerHTML = `
                <div class="text-center text-red-500 py-8">
                    <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <p>Error al cargar los grupos de benchmarking.</p>
                    <p class="text-sm mt-2">Inténtalo de nuevo más tarde.</p>
                </div>
            `;
        }
    }

    async unirseAGrupo(benchmarkingId) {
        try {
            const response = await fetch(`/api/v1/benchmarking/grupos/${benchmarkingId}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario_id: this.getUsuarioId() })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.ui.mostrarExito('Te has unido al grupo exitosamente');
                // Recargar grupos para mostrar el estado actualizado
                this.cargarGruposBenchmarking();
            } else {
                throw new Error(result.error || 'Error al unirse al grupo');
            }

        } catch (error) {
            this.ui.mostrarError('Error al unirse al grupo: ' + error.message);
        }
    }

    verGrupo(benchmarkingId) {
        // Mostrar información del grupo (placeholder por ahora)
        this.ui.mostrarExito('Funcionalidad para ver detalles del grupo próximamente disponible');
    }

    mostrarCrearGrupo() {
        // Placeholder para funcionalidad futura
        alert('Funcionalidad para crear grupos próximamente disponible');
    }

    getUsuarioId() {
        // Obtener usuario_id de la sesión (similar a UIUtils)
        const sessionData = document.querySelector('[data-usuario-id]');
        if (sessionData) {
            return sessionData.dataset.usuarioId;
        }

        const userData = localStorage.getItem('econova_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.usuario_id;
            } catch (e) {
                return null;
            }
        }

        if (window.usuarioActual && window.usuarioActual.usuario_id) {
            return window.usuarioActual.usuario_id;
        }

        return null;
    }

    setupMetricInputs() {
        // Habilitar/deshabilitar inputs según checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.name === 'metricas[]') {
                const metrica = e.target.value;
                const input = document.querySelector(`input[name="${metrica}"].metric-value`);
                if (input) {
                    input.disabled = !e.target.checked;
                    if (!e.target.checked) {
                        input.value = '';
                    }
                }
                }
        });
        }

    // ==================== FUNCIONALIDAD PERSONALIZADA ====================

    async procesarComparacionPersonalizada(form) {
        const formData = new FormData(form);

        // Recopilar datos de la empresa base
        const empresaBase = {
            nombre: formData.get('empresa_base_nombre'),
            ingresos: parseFloat(formData.get('empresa_base_ingresos')) || 0,
            margen_beneficio: parseFloat(formData.get('empresa_base_margen_beneficio')) || 0,
            roi: parseFloat(formData.get('empresa_base_roi')) || 0,
            empleados: parseInt(formData.get('empresa_base_empleados')) || 0,
            crecimiento: parseFloat(formData.get('empresa_base_crecimiento')) || 0
        };

        // Recopilar empresas de comparación
        const empresasComparacion = [];
        let contadorEmpresas = 1;

        while (formData.has(`empresa_${contadorEmpresas}_nombre`)) {
            const empresa = {
                nombre: formData.get(`empresa_${contadorEmpresas}_nombre`),
                ingresos: parseFloat(formData.get(`empresa_${contadorEmpresas}_ingresos`)) || 0,
                margen_beneficio: parseFloat(formData.get(`empresa_${contadorEmpresas}_margen_beneficio`)) || 0,
                roi: parseFloat(formData.get(`empresa_${contadorEmpresas}_roi`)) || 0,
                empleados: parseInt(formData.get(`empresa_${contadorEmpresas}_empleados`)) || 0,
                crecimiento: parseFloat(formData.get(`empresa_${contadorEmpresas}_crecimiento`)) || 0
            };

            // Solo agregar si tiene datos válidos
            if (empresa.nombre && (empresa.ingresos > 0 || empresa.margen_beneficio > 0 || empresa.roi > 0)) {
                empresasComparacion.push(empresa);
            }

            contadorEmpresas++;
        }

        // Criterios de comparación seleccionados
        const criteriosSeleccionados = formData.getAll('criterios_comparacion[]');

        // Opciones de análisis
        const opciones = {
            generarInsights: formData.has('generar_insights'),
            incluirRecomendaciones: formData.has('incluir_recomendaciones')
        };

        // Validar datos mínimos
        if (!empresaBase.nombre || empresasComparacion.length === 0 || criteriosSeleccionados.length === 0) {
            this.ui.mostrarError('Complete los datos de su empresa, agregue al menos una empresa para comparar y seleccione criterios de comparación');
            this.isProcessing = false;
            return;
        }

        try {
            // Generar análisis personalizado
            const analisis = await this.core.generarAnalisisPersonalizado(empresaBase, empresasComparacion, criteriosSeleccionados);

            // Generar insights y recomendaciones si está habilitado
            let insights = [];
            let recomendaciones = [];

            if (opciones.generarInsights) {
                insights = this.core.generarInsightsPersonalizados(analisis, empresaBase, empresasComparacion);
            }

            if (opciones.incluirRecomendaciones) {
                recomendaciones = this.core.generarRecomendacionesPersonalizadas(analisis, empresaBase);
            }

            // Guardar datos del análisis actual
            this.datosAnalisisActual = {
                tipo: 'personalizado',
                empresaBase: empresaBase,
                empresasComparacion: empresasComparacion,
                criteriosSeleccionados: criteriosSeleccionados,
                opciones: opciones,
                analisis: analisis,
                insights: insights,
                recomendaciones: recomendaciones,
                timestamp: new Date().toISOString()
            };

            // Mostrar resultados
            this.ui.mostrarResultadosPersonalizados(analisis, empresaBase, empresasComparacion, criteriosSeleccionados, insights, recomendaciones, opciones);
            this.ui.mostrarExito('Comparación personalizada completada exitosamente');

        } catch (error) {
            this.ui.mostrarError('Error generando comparación personalizada');
        } finally {
            this.isProcessing = false;
        }
    }

    agregarEmpresaComparacion() {
        const container = document.getElementById('empresas-comparacion-container');
        if (!container) {
            return;
        }

        // Contar empresas existentes
        const empresasExistentes = container.querySelectorAll('.empresa-comparacion').length;
        const numeroEmpresa = empresasExistentes + 1;

        // Crear nueva empresa
        const nuevaEmpresa = document.createElement('div');
        nuevaEmpresa.className = 'empresa-comparacion bg-gray-50 p-4 rounded-lg mb-4';
        nuevaEmpresa.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h5 class="font-medium text-gray-700">Empresa ${numeroEmpresa}</h5>
                <button type="button" class="remover-empresa text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm text-gray-600 mb-1">Nombre</label>
                    <input type="text" name="empresa_${numeroEmpresa}_nombre" placeholder="Empresa Competidora S.A." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Ingresos (S/)</label>
                        <input type="number" name="empresa_${numeroEmpresa}_ingresos" placeholder="450000" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Margen (%)</label>
                        <input type="number" step="0.01" name="empresa_${numeroEmpresa}_margen_beneficio" placeholder="12.3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">ROI (%)</label>
                        <input type="number" step="0.01" name="empresa_${numeroEmpresa}_roi" placeholder="18.7" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Empleados</label>
                        <input type="number" name="empresa_${numeroEmpresa}_empleados" placeholder="22" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Crecimiento (%)</label>
                        <input type="number" step="0.01" name="empresa_${numeroEmpresa}_crecimiento" placeholder="15.2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(nuevaEmpresa);
        }

    removerEmpresaComparacion(botonRemover) {
        const empresaDiv = botonRemover.closest('.empresa-comparacion');
        if (empresaDiv) {
            empresaDiv.remove();
            this.reordenarEmpresasComparacion();
            }
    }

    reordenarEmpresasComparacion() {
        const container = document.getElementById('empresas-comparacion-container');
        if (!container) return;

        const empresas = container.querySelectorAll('.empresa-comparacion');

        empresas.forEach((empresa, index) => {
            const numeroEmpresa = index + 1;
            const titulo = empresa.querySelector('h5');
            if (titulo) {
                titulo.textContent = `Empresa ${numeroEmpresa}`;
            }

            // Actualizar nombres de inputs
            const inputs = empresa.querySelectorAll('input');
            inputs.forEach(input => {
                const nameParts = input.name.split('_');
                if (nameParts.length >= 3) {
                    const campo = nameParts.slice(2).join('_'); // Obtener el campo (nombre, ingresos, etc.)
                    input.name = `empresa_${numeroEmpresa}_${campo}`;
                }
            });
        });

        }

    guardarAnalisisPersonalizado() {
        try {
            // Validar que haya datos de análisis actual
            if (!this.datosAnalisisActual || this.datosAnalisisActual.tipo !== 'personalizado') {
                this.ui.mostrarError('Primero debes generar una comparación personalizada antes de guardarla');
                return;
            }

            const analisisActual = this.datosAnalisisActual;

            // Validar que tenga datos mínimos
            if (!analisisActual.empresaBase || !analisisActual.empresasComparacion ||
                analisisActual.empresasComparacion.length === 0 || !analisisActual.criteriosSeleccionados ||
                analisisActual.criteriosSeleccionados.length === 0) {
                this.ui.mostrarError('El análisis personalizado no tiene datos completos para guardar');
                return;
            }

            // Crear entrada completa para guardar
            const analisisData = {
                id: Date.now(),
                tipo: 'personalizado',
                titulo: `Comparación Personalizada - ${analisisActual.empresaBase.nombre}`,
                empresaBase: analisisActual.empresaBase.nombre,
                empresasComparadas: analisisActual.empresasComparacion.map(e => e.nombre),
                numeroEmpresas: analisisActual.empresasComparacion.length,
                criteriosSeleccionados: analisisActual.criteriosSeleccionados,
                numeroCriterios: analisisActual.criteriosSeleccionados.length,
                posicionPromedio: this.ui.calcularPosicionPromedioPersonalizada(analisisActual.analisis),
                insightsGenerados: analisisActual.insights.length,
                recomendacionesGeneradas: analisisActual.recomendaciones.length,
                timestamp: new Date().toISOString(),
                fechaFormateada: new Date().toLocaleDateString('es-ES'),
                datos: analisisActual,
                analisis: analisisActual.analisis,
                insights: analisisActual.insights,
                recomendaciones: analisisActual.recomendaciones
            };

            // Guardar en localStorage
            const existentes = JSON.parse(localStorage.getItem('econova_benchmarking') || '{}');
            existentes[analisisData.id] = analisisData;
            localStorage.setItem('econova_benchmarking', JSON.stringify(existentes));

            this.ui.mostrarExito('Comparación personalizada guardada correctamente');

            // Trigger gamification event
            this.triggerGamificationEvent('benchmarking_personalizado_completado', {
                empresasComparadas: analisisActual.empresasComparacion.length,
                criteriosAnalizados: analisisActual.criteriosSeleccionados.length,
                posicionPromedio: analisisData.posicionPromedio
            });

        } catch (error) {
            this.ui.mostrarError('Error al guardar la comparación personalizada');
        }
    }

    triggerGamificationEvent(eventType, data) {
        // Trigger gamification event for benchmarking completion
        if (window.gamificationManager && window.gamificationManager.otorgarPuntos) {
            // Para benchmarking personalizado, usar el evento general
            window.gamificationManager.otorgarPuntos('benchmarking_realizado', {
                tipo: 'personalizado',
                ...data
            });
        }

        // Disparar evento personalizado para actualizar actividad reciente
        this.dispararEventoActividadReciente('benchmarking_personalizado', data);
    }

    dispararEventoActividadReciente(tipo, data) {
        // Disparar evento para actualizar actividad reciente
        const eventoActividad = new CustomEvent('actividadRecienteActualizada', {
            detail: {
                tipo: tipo,
                descripcion: `Realizó benchmarking personalizado comparando ${data.empresasComparadas || 0} empresas`,
                timestamp: new Date(),
                icono: '🔍',
                color: '#9C27B0'
            }
        });
        document.dispatchEvent(eventoActividad);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    window.benchmarkingManager = new BenchmarkingManagerFinal();
});
