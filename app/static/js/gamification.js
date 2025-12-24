/**
 * Módulo de Gamificación - Econova
 * Sistema de logros, insignias y rankings
 */

class GamificationManager {
    constructor() {
        this.insignias = {};
        this.logros = {};
        this.rankings = {};
        this.puntosUsuario = 0;
        this.nivelUsuario = 1;
        this.init();
    }

    init() {
        console.log('🏆 Módulo de Gamificación inicializado');
        this.setupEventListeners();
        this.cargarInsigniasPredefinidas();
        this.cargarEstadoUsuario();
        this.verificarNotificacionesPendientes();
    }

    setupEventListeners() {
        // Escuchar eventos de acciones del usuario
        document.addEventListener('calculoRealizado', (event) => {
            this.otorgarPuntos('calculo_financiero', event.detail);
        });

        document.addEventListener('simulacionCompletada', (event) => {
            this.otorgarPuntos('simulacion_completada', event.detail);
        });

        document.addEventListener('benchmarkingGenerado', (event) => {
            this.otorgarPuntos('benchmarking_realizado', event.detail);
        });

        document.addEventListener('usuarioRegistrado', (event) => {
            this.otorgarInsignia('primeros_pasos');
            this.mostrarNotificacionBienvenida();
        });

        document.addEventListener('loginExitoso', (event) => {
            this.actualizarEstadoUsuario(event.detail);
        });
    }

    /**
     * Sistema de insignias
     */
    cargarInsigniasPredefinidas() {
        this.insignias = {
            primeros_pasos: {
                id: 'primeros_pasos',
                nombre: 'Primeros Pasos',
                descripcion: 'Te has registrado en Econova',
                icono: '🎯',
                color: '#4CAF50',
                puntos: 100,
                criterio: 'registro_completado'
            },
            calculador_financiero: {
                id: 'calculador_financiero',
                nombre: 'Calculador Financiero',
                descripcion: 'Has realizado 10 cálculos financieros',
                icono: '🧮',
                color: '#2196F3',
                puntos: 250,
                criterio: 'calculos_realizados >= 10'
            },
            analista_avanzado: {
                id: 'analista_avanzado',
                nombre: 'Analista Avanzado',
                descripcion: 'Has completado 25 simulaciones',
                icono: '📊',
                color: '#FF9800',
                puntos: 500,
                criterio: 'simulaciones_completadas >= 25'
            },
            benchmarking_experto: {
                id: 'benchmarking_experto',
                nombre: 'Experto en Benchmarking',
                descripcion: 'Has realizado 15 análisis comparativos',
                icono: '🔍',
                color: '#9C27B0',
                puntos: 400,
                criterio: 'benchmarking_realizados >= 15'
            },
            inversor_estrategico: {
                id: 'inversor_estrategico',
                nombre: 'Inversor Estratégico',
                descripcion: 'Has optimizado 20 portafolios de inversión',
                icono: '📈',
                color: '#00BCD4',
                puntos: 600,
                criterio: 'portafolios_optimizados >= 20'
            },
            maestro_finanzas: {
                id: 'maestro_finanzas',
                nombre: 'Maestro de Finanzas',
                descripcion: 'Has alcanzado el nivel máximo de conocimiento',
                icono: '👑',
                color: '#FFD700',
                puntos: 1000,
                criterio: 'nivel_usuario >= 10'
            },
            early_adopter: {
                id: 'early_adopter',
                nombre: 'Early Adopter',
                descripcion: 'Has usado todas las funcionalidades nuevas',
                icono: '🚀',
                color: '#FF5722',
                puntos: 300,
                criterio: 'funcionalidades_nuevas_usadas >= 5'
            },
            streak_master: {
                id: 'streak_master',
                nombre: 'Streak Master',
                descripcion: 'Has usado la plataforma 30 días consecutivos',
                icono: '🔥',
                color: '#FF6B6B',
                puntos: 800,
                criterio: 'dias_consecutivos >= 30'
            }
        };
    }

    otorgarInsignia(insigniaId) {
        if (!this.insignias[insigniaId]) {
            console.warn(`Insignia ${insigniaId} no encontrada`);
            return false;
        }

        if (this.verificarCriterioInsignia(insigniaId)) {
            const insignia = this.insignias[insigniaId];

            // Agregar a logros del usuario
            if (!this.logros[insigniaId]) {
                this.logros[insigniaId] = {
                    ...insignia,
                    fecha_obtenida: new Date(),
                    notificada: false
                };

                // Otorgar puntos
                this.otorgarPuntos('insignia_obtenida', { insignia: insignia });

                // Mostrar notificación
                this.mostrarNotificacionInsignia(insignia);

                // Verificar si sube de nivel
                this.verificarSubidaNivel();

                // Guardar estado
                this.guardarEstadoUsuario();

                // Disparar evento
                this.dispararEvento('insigniaObtenida', insignia);

                return true;
            }
        }

        return false;
    }

    verificarCriterioInsignia(insigniaId) {
        const insignia = this.insignias[insigniaId];
        if (!insignia) return false;

        // Aquí iría la lógica para verificar cada criterio
        // Por simplicidad, algunos criterios se verifican automáticamente
        const criterios = {
            'registro_completado': true, // Siempre true si se llama
            'calculos_realizados >= 10': this.contarAcciones('calculo_financiero') >= 10,
            'simulaciones_completadas >= 25': this.contarAcciones('simulacion_completada') >= 25,
            'benchmarking_realizados >= 15': this.contarAcciones('benchmarking_realizado') >= 15,
            'portafolios_optimizados >= 20': this.contarAcciones('portafolio_optimizado') >= 20,
            'nivel_usuario >= 10': this.nivelUsuario >= 10,
            'funcionalidades_nuevas_usadas >= 5': this.contarFuncionalidadesNuevas() >= 5,
            'dias_consecutivos >= 30': this.calcularDiasConsecutivos() >= 30
        };

        return criterios[insignia.criterio] || false;
    }

    /**
     * Sistema de puntos y niveles
     */
    otorgarPuntos(accion, datos = {}) {
        const puntosPorAccion = {
            'calculo_financiero': 10,
            'simulacion_completada': 25,
            'benchmarking_realizado': 20,
            'portafolio_optimizado': 30,
            'insignia_obtenida': (datos.insignia?.puntos || 0),
            'login_diario': 5,
            'compartir_resultados': 15
        };

        const puntos = puntosPorAccion[accion] || 0;
        if (puntos > 0) {
            this.puntosUsuario += puntos;

            // Registrar acción
            this.registrarAccion(accion, puntos, datos);

            // Verificar subida de nivel
            this.verificarSubidaNivel();

            // Mostrar notificación de puntos
            this.mostrarNotificacionPuntos(puntos, accion);

            // Guardar estado
            this.guardarEstadoUsuario();

            // Disparar evento
            this.dispararEvento('puntosOtorgados', { puntos: puntos, accion: accion, total: this.puntosUsuario });
        }
    }

    verificarSubidaNivel() {
        const puntosParaNivel = (nivel) => nivel * 100 + (nivel - 1) * 50; // Progresión no lineal

        let nuevoNivel = 1;
        let puntosAcumulados = 0;

        while (puntosAcumulados <= this.puntosUsuario) {
            puntosAcumulados += puntosParaNivel(nuevoNivel);
            if (puntosAcumulados <= this.puntosUsuario) {
                nuevoNivel++;
            } else {
                break;
            }
        }

        if (nuevoNivel > this.nivelUsuario) {
            const nivelesSubidos = nuevoNivel - this.nivelUsuario;
            this.nivelUsuario = nuevoNivel;

            // Otorgar insignia si llega a nivel alto
            if (this.nivelUsuario >= 5) {
                this.otorgarInsignia('maestro_finanzas');
            }

            // Mostrar notificación de subida de nivel
            this.mostrarNotificacionSubidaNivel(nivelesSubidos);

            // Disparar evento
            this.dispararEvento('nivelSubido', { nuevoNivel: this.nivelUsuario, nivelesSubidos: nivelesSubidos });
        }
    }

    /**
     * Sistema de rankings
     */
    async actualizarRankings() {
        // Obtener ranking global real desde la API
        try {
            const response = await fetch('/gamification/api/ranking-global?limite=10');
            const data = await response.json();

            if (data.success) {
                // Convertir datos de la API al formato esperado
                this.rankings.global = data.ranking.map(item => ({
                    usuario: item.nombre,
                    puntos: item.puntaje,
                    nivel: item.nivel,
                    insignia: item.insignia_principal ? item.insignia_principal.nombre.toLowerCase().replace(' ', '_') : null,
                    posicion: item.posicion
                }));

                // Agregar al usuario actual si no está en el ranking
                const usuarioActual = data.usuario_actual;
                if (usuarioActual && !this.rankings.global.find(r => r.usuario === usuarioActual.nombre)) {
                    this.rankings.global.push({
                        usuario: 'Tú',
                        puntos: usuarioActual.puntaje,
                        nivel: usuarioActual.nivel,
                        insignia: usuarioActual.insignia_principal ? usuarioActual.insignia_principal.nombre.toLowerCase().replace(' ', '_') : null,
                        posicion: usuarioActual.posicion
                    });
                }

                // Ordenar por puntos
                this.rankings.global.sort((a, b) => b.puntos - a.puntos);
            }
        } catch (error) {
            console.warn('Error obteniendo ranking global:', error);
            // Fallback a datos simulados
            this.rankings.global = [
                { usuario: 'Ana García', puntos: 2500, nivel: 8, insignia: 'maestro_finanzas' },
                { usuario: 'Carlos López', puntos: 2200, nivel: 7, insignia: 'analista_avanzado' },
                { usuario: 'María Rodríguez', puntos: 2100, nivel: 7, insignia: 'inversor_estrategico' },
                { usuario: 'Tú', puntos: this.puntosUsuario, nivel: this.nivelUsuario, insignia: this.obtenerInsigniaPrincipal() }
            ].sort((a, b) => b.puntos - a.puntos);
        }

        // Rankings por sector (simulado)
        this.rankings.sector = {
            'Tecnología': [
                { usuario: 'Tech Startup #1', puntos: 1800, posicion: 1 },
                { usuario: 'Tú', puntos: this.puntosUsuario, posicion: 2 }
            ],
            'Financiero': [
                { usuario: 'Banco Local', puntos: 1950, posicion: 1 },
                { usuario: 'Tú', puntos: this.puntosUsuario, posicion: 3 }
            ]
        };
    }

    async obtenerRankingUsuario() {
        await this.actualizarRankings();

        const posicionGlobal = this.rankings.global.findIndex(r => r.usuario === 'Tú') + 1;
        const totalUsuarios = this.rankings.global.length;

        return {
            posicion_global: posicionGlobal,
            total_usuarios: totalUsuarios,
            porcentaje_mejores: ((posicionGlobal - 1) / totalUsuarios) * 100,
            puntos_para_siguiente: this.calcularPuntosParaSiguiente(posicionGlobal)
        };
    }

    calcularPuntosParaSiguiente(posicion) {
        if (posicion <= 1) return 0;

        const usuarioActual = this.rankings.global[posicion - 1];
        const usuarioAnterior = this.rankings.global[posicion - 2];

        return Math.max(0, usuarioAnterior.puntos - usuarioActual.puntos + 1);
    }

    /**
     * Funciones auxiliares
     */
    contarAcciones(accion) {
        // Contar acciones realizadas (simulado con localStorage)
        try {
            const acciones = JSON.parse(localStorage.getItem('econova_acciones') || '{}');
            return acciones[accion] || 0;
        } catch (error) {
            return 0;
        }
    }

    registrarAccion(accion, puntos, datos) {
        try {
            const acciones = JSON.parse(localStorage.getItem('econova_acciones') || '{}');
            acciones[accion] = (acciones[accion] || 0) + 1;
            localStorage.setItem('econova_acciones', JSON.stringify(acciones));
        } catch (error) {
            console.warn('No se pudo registrar la acción:', error);
        }
    }

    contarFuncionalidadesNuevas() {
        // Contar uso de funcionalidades nuevas
        const funcionalidades = ['ml_prediccion', 'benchmarking', 'gamification', 'chatbot_ia', 'export_pdf'];
        let contador = 0;

        funcionalidades.forEach(func => {
            if (localStorage.getItem(`econova_func_${func}`)) {
                contador++;
            }
        });

        return contador;
    }

    calcularDiasConsecutivos() {
        // Calcular días de uso consecutivo (simplificado)
        try {
            const ultimoLogin = localStorage.getItem('econova_ultimo_login');
            if (!ultimoLogin) return 1;

            const ultimo = new Date(ultimoLogin);
            const hoy = new Date();
            const diffTime = Math.abs(hoy - ultimo);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays <= 1 ? (parseInt(localStorage.getItem('econova_dias_consecutivos') || '1') + 1) : 1;
        } catch (error) {
            return 1;
        }
    }

    obtenerInsigniaPrincipal() {
        // Obtener la insignia más importante del usuario
        const insigniasOrden = ['maestro_finanzas', 'inversor_estrategico', 'analista_avanzado', 'benchmarking_experto', 'calculador_financiero'];

        for (const insignia of insigniasOrden) {
            if (this.logros[insignia]) {
                return insignia;
            }
        }

        return this.logros.length > 0 ? Object.keys(this.logros)[0] : null;
    }

    /**
     * Funciones de UI
     */
    mostrarNotificacionBienvenida() {
        if (window.contextualMessages) {
            window.contextualMessages.success({
                title: '¡Bienvenido a Econova! 🎉',
                body: 'Has recibido tu primera insignia: "Primeros Pasos". ¡Comienza tu viaje financiero!',
                icon: '🎯'
            });
        }
    }

    mostrarNotificacionInsignia(insignia) {
        if (window.contextualMessages) {
            window.contextualMessages.success({
                title: `¡Nueva Insignia! ${insignia.icono}`,
                body: `Has obtenido: "${insignia.nombre}" - ${insignia.descripcion}`,
                icon: insignia.icono
            });
        }

        // Mostrar modal de insignia
        this.mostrarModalInsignia(insignia);
    }

    mostrarNotificacionPuntos(puntos, accion) {
        if (window.contextualMessages) {
            const accionesLegibles = {
                'calculo_financiero': 'cálculo financiero',
                'simulacion_completada': 'simulación completada',
                'benchmarking_realizado': 'análisis de benchmarking',
                'insignia_obtenida': 'insignia obtenida'
            };

            window.contextualMessages.info({
                title: `+${puntos} puntos`,
                body: `Ganaste puntos por ${accionesLegibles[accion] || accion}`,
                icon: '⭐'
            });
        }
    }

    mostrarNotificacionSubidaNivel(niveles) {
        if (window.contextualMessages) {
            window.contextualMessages.success({
                title: `¡Subiste de nivel! 🚀`,
                body: `Ahora eres nivel ${this.nivelUsuario}. ${niveles > 1 ? `(${niveles} niveles)` : ''}`,
                icon: '⬆️'
            });
        }
    }

    mostrarModalInsignia(insignia) {
        // Crear modal de insignia (simplificado)
        const modal = document.createElement('div');
        modal.className = 'insignia-modal-overlay';
        modal.innerHTML = `
            <div class="insignia-modal">
                <div class="insignia-modal-content">
                    <div class="insignia-icon" style="font-size: 4rem;">${insignia.icono}</div>
                    <h2>${insignia.nombre}</h2>
                    <p>${insignia.descripcion}</p>
                    <div class="insignia-puntos">+${insignia.puntos} puntos</div>
                    <button class="insignia-close">¡Genial!</button>
                </div>
            </div>
        `;

        // Estilos CSS
        const styles = `
            .insignia-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }

            .insignia-modal {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .insignia-icon {
                margin-bottom: 1rem;
            }

            .insignia-modal h2 {
                color: #333;
                margin-bottom: 0.5rem;
            }

            .insignia-modal p {
                color: #666;
                margin-bottom: 1rem;
            }

            .insignia-puntos {
                background: linear-gradient(45deg, #00ffff, #ff6b6b);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                display: inline-block;
                margin-bottom: 1.5rem;
                font-weight: bold;
            }

            .insignia-close {
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                transition: transform 0.2s;
            }

            .insignia-close:hover {
                transform: scale(1.05);
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        document.body.appendChild(modal);

        // Event listener para cerrar
        modal.querySelector('.insignia-close').addEventListener('click', () => {
            modal.remove();
        });

        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 5000);
    }

    /**
     * Persistencia de datos
     */
    cargarEstadoUsuario() {
        try {
            const estado = JSON.parse(localStorage.getItem('econova_gamification') || '{}');
            this.puntosUsuario = estado.puntos || 0;
            this.nivelUsuario = estado.nivel || 1;
            this.logros = estado.logros || {};
        } catch (error) {
            console.warn('Error cargando estado de gamificación:', error);
        }
    }

    guardarEstadoUsuario() {
        try {
            const estado = {
                puntos: this.puntosUsuario,
                nivel: this.nivelUsuario,
                logros: this.logros,
                ultimo_guardado: new Date()
            };
            localStorage.setItem('econova_gamification', JSON.stringify(estado));
        } catch (error) {
            console.warn('Error guardando estado de gamificación:', error);
        }
    }

    actualizarEstadoUsuario(datosUsuario) {
        // Actualizar información del usuario
        this.usuarioActual = datosUsuario;

        // Registrar login diario
        this.otorgarPuntos('login_diario');

        // Actualizar días consecutivos
        const diasConsecutivos = this.calcularDiasConsecutivos();
        localStorage.setItem('econova_dias_consecutivos', diasConsecutivos.toString());
        localStorage.setItem('econova_ultimo_login', new Date().toISOString());

        // Verificar insignia de streak
        if (diasConsecutivos >= 30) {
            this.otorgarInsignia('streak_master');
        }
    }

    /**
     * API pública
     */
    async obtenerEstadoGamification() {
        const ranking = await this.obtenerRankingUsuario();
        return {
            puntos: this.puntosUsuario,
            nivel: this.nivelUsuario,
            insignias: Object.values(this.logros),
            ranking: ranking,
            progreso_siguiente_nivel: this.calcularProgresoSiguienteNivel()
        };
    }

    calcularProgresoSiguienteNivel() {
        const puntosActualesNivel = this.calcularPuntosNivel(this.nivelUsuario);
        const puntosSiguienteNivel = this.calcularPuntosNivel(this.nivelUsuario + 1);
        const puntosEnEsteNivel = this.puntosUsuario - puntosActualesNivel;
        const puntosNecesarios = puntosSiguienteNivel - puntosActualesNivel;

        return {
            puntos_actuales_nivel: puntosEnEsteNivel,
            puntos_necesarios: puntosNecesarios,
            porcentaje: Math.min(100, (puntosEnEsteNivel / puntosNecesarios) * 100)
        };
    }

    calcularPuntosNivel(nivel) {
        // Calcular puntos acumulados hasta el nivel anterior
        let puntosTotales = 0;
        for (let i = 1; i < nivel; i++) {
            puntosTotales += i * 100 + (i - 1) * 50;
        }
        return puntosTotales;
    }

    /**
     * Verificar notificaciones pendientes de logros
     */
    verificarNotificacionesPendientes() {
        // Solo verificar si hay un usuario autenticado
        if (!document.querySelector('[data-usuario-id]')) {
            return;
        }

        fetch('/gamification/api/notificaciones-pendientes')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.notificaciones && data.notificaciones.length > 0) {
                    // Mostrar notificaciones de logros pendientes
                    data.notificaciones.forEach(notificacion => {
                        if (notificacion.tipo === 'logro') {
                            this.mostrarNotificacionLogroPendiente(notificacion);
                        }
                    });

                    // Marcar notificaciones como leídas después de mostrarlas
                    this.marcarNotificacionesComoLeidas(data.notificaciones);
                }
            })
            .catch(error => {
                console.warn('Error verificando notificaciones pendientes:', error);
            });
    }

    /**
     * Mostrar notificación de logro pendiente
     */
    mostrarNotificacionLogroPendiente(notificacion) {
        if (window.contextualMessages) {
            window.contextualMessages.success({
                title: '¡Nueva Insignia Obtenida! 🏆',
                body: notificacion.mensaje,
                icon: '🎖️'
            });
        } else {
            // Fallback si no hay sistema de mensajes contextuales
            alert(`¡Felicitaciones! ${notificacion.mensaje}`);
        }
    }

    /**
     * Marcar notificaciones como leídas
     */
    marcarNotificacionesComoLeidas(notificaciones) {
        const ids = notificaciones.map(n => n.notificacion_id);

        fetch('/gamification/api/marcar-leidas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notificaciones_ids: ids })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Notificaciones marcadas como leídas');
            }
        })
        .catch(error => {
            console.warn('Error marcando notificaciones como leídas:', error);
        });
    }

    dispararEvento(evento, datos) {
        const customEvent = new CustomEvent(`gamification${evento.charAt(0).toUpperCase() + evento.slice(1)}`, {
            detail: datos
        });
        document.dispatchEvent(customEvent);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    window.gamificationManager = new GamificationManager();
    console.log('🏆 Sistema de Gamificación inicializado');
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamificationManager;
}
