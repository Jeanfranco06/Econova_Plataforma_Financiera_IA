/**
 * Utilidades de Interfaz de Usuario - Econova
 * Funciones compartidas para manejo de UI
 */

class UIUtils {
    /**
     * Muestra indicador de carga
     */
    static mostrarCarga(elementId, mensaje = 'Calculando...') {
        const element = document.getElementById(elementId);if (element) {
            element.innerHTML = `
                <div class="text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p class="mt-4 text-lg text-gray-600">${mensaje}</p>
                    <p class="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
                </div>
            `;element.style.display = 'block';element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });}
    }

    /**
     * Oculta indicador de carga
     */
    static ocultarCarga(elementId) {
        // El contenido se reemplaza cuando se muestran los resultados
        // Esta función está aquí por compatibilidad, pero no hace nada
        // ya que mostrarResultados* reemplaza el contenido completo
    }

    /**
     * Muestra mensaje de error
     */
    static mostrarError(mensaje) {
        // Usar sistema de mensajes contextuales si está disponible
        if (window.contextualMessages) {
            window.contextualMessages.error({
                title: 'Error en simulación',
                body: mensaje
            });} else {
            alert(`Error: ${mensaje}`);}
    }

    /**
     * Dispara evento personalizado
     */
    static dispararEvento(evento, datos) {
        const customEvent = new CustomEvent(`simulacion${evento.charAt(0).toUpperCase() + evento.slice(1)}`, {
            detail: datos
        });document.dispatchEvent(customEvent);}

    /**
     * Actualiza simulación en tiempo real
     */
    static actualizarSimulacionTiempoReal(input, callback) {
        // Implementar actualizaciones en tiempo real si es necesario
        const form = input.closest('form');if (form) {
            clearTimeout(this.simulacionTimeout);this.simulacionTimeout = setTimeout(() => {
                if (callback) callback();// Trigger simulation update
                const event = new CustomEvent('actualizarGrafico', {
                    detail: { formId: form.id, inputId: input.id }
                });document.dispatchEvent(event);}, 300);}
    }

    /**
     * Actualiza gráfico (placeholder para futuras implementaciones)
     */
    static actualizarGrafico(detalles) {
        // Implementar actualizaciones de gráficos en tiempo real
        
    }

    /**
     * Guarda simulación en localStorage
     */
    static guardarSimulacion(tipo, datos) {
        try {
            const simulacionesGuardadas = JSON.parse(localStorage.getItem('econova_simulaciones') || '{}');simulacionesGuardadas[tipo] = {
                ...datos,
                timestamp: new Date(),
                id: Date.now()
            };localStorage.setItem('econova_simulaciones', JSON.stringify(simulacionesGuardadas));} catch (error) {
            
        }
    }

    /**
     * Obtiene simulación guardada
     */
    static obtenerSimulacion(tipo) {
        try {
            const simulacionesGuardadas = JSON.parse(localStorage.getItem('econova_simulaciones') || '{}');return simulacionesGuardadas[tipo] || null;} catch (error) {
            
            return null;}
    }

    /**
     * Lista todas las simulaciones guardadas
     */
    static listarSimulaciones() {
        try {
            const simulacionesGuardadas = JSON.parse(localStorage.getItem('econova_simulaciones') || '{}');return Object.keys(simulacionesGuardadas);} catch (error) {
            
            return [];}
    }

    /**
     * Exporta resultados de simulación
     */
    static exportarResultados(tipo) {
        const simulacion = UIUtils.obtenerSimulacion(tipo);if (!simulacion) return null;return {
            tipo: tipo,
            datos: simulacion.datos,
            resultados: simulacion.resultado,
            timestamp: simulacion.timestamp,
            exportado: new Date()
        };}

    /**
     * Funciones de acción para análisis
     */
    static async guardarAnalisis(tipo) {

        const simulacion = UIUtils.obtenerSimulacion(tipo);if (!simulacion) {
            console.error('❌ No hay análisis para guardar');UIUtils.mostrarNotificacion('No hay análisis para guardar. Realice un cálculo primero.', 'error');return;}

        // Obtener usuario_id de la sesión
        const usuarioId = this.getUsuarioId();if (!usuarioId) {
            console.error('❌ Usuario no autenticado');UIUtils.mostrarNotificacion('Debe iniciar sesión para guardar análisis', 'error');return;}

        // Preparar datos para enviar al backend
        const datosPreparados = this.prepararDatosParaBackend(tipo, simulacion);
        const datosEnvio = {
            usuario_id: usuarioId,
            nombre_simulacion: `${tipo.toUpperCase()} - ${new Date().toLocaleDateString()}`,
            ...datosPreparados
        };

        console.log('📤 Datos a enviar al backend:', datosEnvio);
        console.log('📊 Simulación original:', simulacion);

        try {
            // Hacer la petición al backend (sin modal)
            
            const response = await fetch(`/api/v1/financiero/${tipo.toLowerCase()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosEnvio)
            });const result = await response.json();if (response.ok && result.success) {
                // Actualizar localStorage con el ID de simulación
                simulacion.simulacion_id = result.data.simulacion_id;UIUtils.guardarSimulacion(tipo, simulacion);

                // Verificar y otorgar insignias automáticamente
                console.log('🏆 Verificando insignias después de guardar...');
                try {
                    await UIUtils.verificarYOtorgarInsignias(tipo);
                } catch (error) {
                    console.error('❌ Error verificando insignias:', error);
                }

                // Mostrar mensaje de éxito
                UIUtils.mostrarNotificacion('Análisis guardado exitosamente en su cuenta.');} else {
                console.error('❌ Error en respuesta del servidor:', result.error);throw new Error(result.error || 'Error al guardar el análisis');}

        } catch (error) {
            console.error('💥 Error guardando análisis:', error);UIUtils.mostrarNotificacion(`Error al guardar: ${error.message}`, 'error');}
    }

    /**
     * Obtener usuario_id de la sesión
     */
    static getUsuarioId() {
        // Intentar obtener de diferentes fuentes
        const sessionData = document.querySelector('[data-usuario-id]');if (sessionData) {
            return sessionData.dataset.usuarioId;}

        // Intentar de localStorage
        const userData = localStorage.getItem('econova_user');if (userData) {
            try {
                const user = JSON.parse(userData);return user.usuario_id;} catch (e) {
                
            }
        }

        // Intentar de variables globales
        if (window.usuarioActual && window.usuarioActual.usuario_id) {
            return window.usuarioActual.usuario_id;}

        return null;}

    /**
     * Preparar datos específicos para cada tipo de análisis
     */
    static prepararDatosParaBackend(tipo, simulacion) {
        const baseData = {
            usuario_id: this.getUsuarioId(),
            nombre_simulacion: simulacion.nombre || `${tipo.toUpperCase()} - ${new Date().toLocaleDateString()}`
        };switch (tipo.toLowerCase()) {
            case 'van':
                return {
                    ...baseData,
                    inversion_inicial: simulacion.datos?.inversion || 0,
                    flujos_caja: simulacion.datos?.flujos || [],
                    tasa_descuento: simulacion.datos?.tasaDescuento || 0
                };case 'tir':
                return {
                    ...baseData,
                    inversion_inicial: simulacion.datos?.inversion || 0,
                    flujos_caja: simulacion.datos?.flujos || [],
                    tasa_referencia: simulacion.datos?.tasaReferencia || 0.10
                };case 'wacc':
                // Para WACC, convertir proporciones en montos absolutos
                // Asumir un valor total de capital de 1,000,000 para calcular montos
                const valorTotalAsumido = 1000000; // 1 millón
                const proporcionCapital = simulacion.datos?.proporcionCapital || 0;
                const proporcionDeuda = simulacion.datos?.proporcionDeuda || 0;
                const capitalPropio = (proporcionCapital / 100) * valorTotalAsumido;
                const deuda = (proporcionDeuda / 100) * valorTotalAsumido;
                return {
                    ...baseData,
                    capital_propio: capitalPropio || 500000, // Valor por defecto si es 0
                    deuda: deuda || 500000, // Valor por defecto si es 0
                    costo_capital: simulacion.datos?.costoCapital || 0,
                    costo_deuda: simulacion.datos?.costoDeuda || 0,
                    tasa_impuesto: simulacion.datos?.tasaImpuestos || 0
                };case 'portafolio':
                return {
                    ...baseData,
                    retornos: simulacion.datos?.retornos || [],
                    ponderaciones: simulacion.datos?.ponderaciones || [],
                    volatilidades: simulacion.datos?.volatilidades || [],
                    matriz_correlacion: simulacion.datos?.matriz_correlacion || []
                };default:
                return baseData;}
    }

    /**
     * Mostrar mensaje temporal con estilo mejorado
     */
    static mostrarMensajeTemporal(mensaje, tipo = 'info') {
        // Remover mensajes anteriores
        const mensajesAnteriores = document.querySelectorAll('.mensaje-temporal');mensajesAnteriores.forEach(msg => msg.remove());// Crear nuevo mensaje
        const mensajeDiv = document.createElement('div');mensajeDiv.className = `mensaje-temporal fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${this.getColorClase(tipo)}`;mensajeDiv.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${this.getIconoTipo(tipo)}</span>
                <span>${mensaje}</span>
            </div>
        `;document.body.appendChild(mensajeDiv);// Auto-remover después de 3 segundos
        setTimeout(() => {
            if (mensajeDiv.parentNode) {
                mensajeDiv.classList.add('opacity-0', 'transition-opacity', 'duration-300');setTimeout(() => mensajeDiv.remove(), 300);}
        }, 3000);}

    /**
     * Mostrar notificación estilo perfil (similar a subir foto)
     */
    static mostrarNotificacion(mensaje, tipo = 'success') {
        // Crear notificación element
        const notification = document.createElement('div');notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;if (tipo === 'success') {
            notification.classList.add('bg-green-500', 'text-white');} else if (tipo === 'error') {
            notification.classList.add('bg-red-500', 'text-white');} else {
            notification.classList.add('bg-blue-500', 'text-white');}

        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>
                <span>${mensaje}</span>
            </div>
        `;document.body.appendChild(notification);// Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');}, 100);// Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);}
            }, 300);}, 3000);}

    /**
     * Obtener clase de color para el tipo de mensaje
     */
    static getColorClase(tipo) {
        const colores = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            warning: 'bg-yellow-600',
            info: 'bg-blue-600'
        };return colores[tipo] || colores.info;}

    /**
     * Obtener icono para el tipo de mensaje
     */
    static getIconoTipo(tipo) {
        const iconos = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };return iconos[tipo] || iconos.info;}

    /**
     * Mostrar modal con mensaje
     */
    static mostrarModal(titulo, mensaje, tipo = 'info', tiempoAutoCierre = 3000) {
        // Remover modales anteriores
        this.cerrarModal();// Crear modal
        const modal = document.createElement('div');modal.id = 'modal-mensaje';modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
                <div class="p-6">
                    <div class="flex items-center mb-4">
                        <div class="flex-shrink-0 ${this.getColorIconoModal(tipo)}">
                            <i class="fas ${this.getIconoModal(tipo)} text-2xl"></i>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-lg font-medium text-gray-900">${titulo}</h3>
                        </div>
                    </div>
                    <div class="mb-6">
                        <p class="text-sm text-gray-600">${mensaje}</p>
                    </div>
                    <div class="flex justify-end">
                        <button onclick="UIUtils.cerrarModal()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;document.body.appendChild(modal);// Auto-cerrar si se especifica tiempo
        if (tiempoAutoCierre > 0) {
            setTimeout(() => {
                this.cerrarModal();}, tiempoAutoCierre);}
    }

    /**
     * Mostrar modal de carga (completamente deshabilitado)
     */
    static mostrarModalCarga(titulo, mensaje) {
        // Función completamente deshabilitada - no hace nada
        return;}

    /**
     * Cerrar modal
     */
    static cerrarModal() {
        const modalMensaje = document.getElementById('modal-mensaje');const modalCarga = document.getElementById('modal-carga');if (modalMensaje) {
            modalMensaje.remove();}
        if (modalCarga) {
            modalCarga.remove();}
    }

    /**
     * Obtener color para icono del modal
     */
    static getColorIconoModal(tipo) {
        const colores = {
            success: 'text-green-600',
            error: 'text-red-600',
            warning: 'text-yellow-600',
            info: 'text-blue-600'
        };return colores[tipo] || colores.info;}

    /**
     * Obtener icono para modal
     */
    static getIconoModal(tipo) {
        const iconos = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };return iconos[tipo] || iconos.info;}

    static compartirAnalisis(tipo) {
        const simulacion = UIUtils.obtenerSimulacion(tipo);if (!simulacion) {
            UIUtils.mostrarError('No hay análisis para compartir');return;}

        // Crear URL para compartir
        const url = window.location.href;const texto = `Análisis ${tipo.toUpperCase()} - ${simulacion.datos.nombreProyecto || 'Proyecto'}\nVAN: ${FinancialUtils.formatearMoneda(simulacion.resultado.van || 0)}`;if (navigator.share) {
            navigator.share({
                title: 'Análisis Económico - Econova',
                text: texto,
                url: url
            });} else {
            // Fallback: copiar al portapapeles
            navigator.clipboard.writeText(`${texto}\n${url}`).then(() => {
                alert('Enlace copiado al portapapeles');});}
    }

    static imprimirAnalisis(tipo) {
        const simulacion = UIUtils.obtenerSimulacion(tipo);if (!simulacion) {
            UIUtils.mostrarError('No hay análisis para imprimir');return;}

        window.print();}

    static exportarPDF(tipo) {
        alert('Exportación a PDF próximamente disponible');}

    static exportarExcel(tipo) {
        alert('Exportación a Excel próximamente disponible');}

    /**
     * Funciones auxiliares para formularios
     */
    static parsearFlujos(form, prefix = 'flujo') {
        const flujos = [];let index = 1;while (true) {
            const input = form.querySelector(`input[name="${prefix}${index}"]`);if (!input) break;const valor = parseFloat(input.value);if (!isNaN(valor)) {
                flujos.push(valor);}
            index++;}
        return flujos;}

    static parsearFlujosVAN(form) {
        return UIUtils.parsearFlujos(form, 'flujo');}

    static parsearFlujosTIR(form) {
        return UIUtils.parsearFlujos(form, 'flujo');}

    static agregarAnioVAN() {
        const container = document.getElementById('van-flujos');if (!container) return;const existingInputs = container.querySelectorAll('input[name^="flujo"]');const nextIndex = existingInputs.length + 1;const newInputDiv = document.createElement('div');newInputDiv.className = 'flex items-center space-x-3';newInputDiv.innerHTML = `
            <span class="text-sm text-gray-600 w-16">Año ${nextIndex}:</span>
            <input
                type="number"
                name="flujo${nextIndex}"
                step="0.01"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
            >
            <button type="button" class="remover-anio text-red-500 hover:text-red-700 px-2">
                <i class="fas fa-trash"></i>
            </button>
        `;container.appendChild(newInputDiv);// Add event listener to remove button
        const removeBtn = newInputDiv.querySelector('.remover-anio');removeBtn.addEventListener('click', () => {
            newInputDiv.remove();UIUtils.reenumerarAniosVAN();});}

    static reenumerarAniosVAN() {
        const container = document.getElementById('van-flujos');if (!container) return;const inputDivs = container.querySelectorAll('.flex.items-center.space-x-3');inputDivs.forEach((div, index) => {
            const span = div.querySelector('span');const input = div.querySelector('input');if (span && input) {
                span.textContent = `Año ${index + 1}:`;input.name = `flujo${index + 1}`;}
        });}

    /**
     * Inicializa gráficos si Chart.js está disponible
     */
    static inicializarGraficos() {
        // Verificar si Chart.js está disponible
        if (typeof Chart !== 'undefined') {
            // Chart.js disponible para gráficos
        } else {
            // Chart.js no está cargado - gráficos no disponibles
        }
    }

    /**
     * Configura botones de tipo de simulación
     */
    static setupSimulationTypeButtons() {
        const buttons = document.querySelectorAll('.simulation-type-btn, .ml-analysis-btn');const calculators = document.querySelectorAll('.simulation-calculator');buttons.forEach(button => {
            button.addEventListener('click', () => {
                // Remover clase active de todos los botones
                buttons.forEach(btn => {
                    btn.classList.remove('active', 'bg-blue-600', 'text-white', 'border-blue-600');btn.classList.remove('bg-purple-600', 'text-purple-600', 'border-purple-600');btn.classList.remove('bg-red-600', 'text-red-600', 'border-red-600');btn.classList.remove('bg-green-600', 'text-green-600', 'border-green-600');btn.classList.remove('bg-indigo-600', 'text-indigo-600', 'border-indigo-600');// Reset to default styles
                    if (btn.classList.contains('simulation-type-btn')) {
                        btn.classList.add('bg-white', 'text-gray-700', 'border-gray-300');} else if (btn.classList.contains('ml-analysis-btn')) {
                        btn.classList.add('bg-white', 'text-gray-700', 'border-purple-300');}
                });// Ocultar todos los calculadores
                calculators.forEach(calc => {
                    calc.style.display = 'none';});// Agregar clase active al botón clickeado
                if (button.classList.contains('simulation-type-btn')) {
                    button.classList.add('active', 'bg-blue-600', 'text-white', 'border-blue-600');button.classList.remove('bg-white', 'text-gray-700', 'border-gray-300');} else if (button.classList.contains('ml-analysis-btn')) {
                    // Handle ML analysis buttons
                    const mlType = button.id.replace('-btn', '');if (mlType === 'prediccion') {
                        button.classList.add('bg-purple-600', 'text-white', 'border-purple-600');} else if (mlType === 'tornado') {
                        button.classList.add('bg-red-600', 'text-white', 'border-red-600');} else if (mlType === 'montecarlo') {
                        button.classList.add('bg-green-600', 'text-white', 'border-green-600');} else if (mlType === 'sensibilidad') {
                        button.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');}
                    button.classList.remove('bg-white', 'text-gray-700', 'border-purple-300');}

                // Mostrar el calculador correspondiente
                const calculatorId = button.id.replace('-btn', '-calculator');const calculator = document.getElementById(calculatorId);if (calculator) {
                    calculator.style.display = 'block';}
            });});}

    /**
     * Cambia tab de análisis ML
     */
    static cambiarTabML(tabId) {
        // Remover clase active de todos los tabs
        const tabs = document.querySelectorAll('.ml-tab-btn');tabs.forEach(tab => {
            tab.classList.remove('active', 'bg-purple-600', 'text-white');tab.classList.add('bg-white', 'text-purple-700', 'border', 'border-purple-300');});// Ocultar todos los contenidos de tab
        const contents = document.querySelectorAll('.ml-tab-content');contents.forEach(content => {
            content.style.display = 'none';});// Ocultar todos los botones de agregar período
        const addButtons = document.querySelectorAll('.add-period-btn');addButtons.forEach(button => {
            button.style.display = 'none';});// Ocultar resultados
        const resultsDiv = document.getElementById('ml-results');if (resultsDiv) {
            resultsDiv.style.display = 'none';}

        // Activar tab seleccionado
        const activeTab = document.getElementById(tabId);if (activeTab) {
            activeTab.classList.add('active', 'bg-purple-600', 'text-white');activeTab.classList.remove('bg-white', 'text-purple-700', 'border', 'border-purple-300');}

        // Mostrar contenido correspondiente
        const contentId = tabId.replace('-tab', '-content');const activeContent = document.getElementById(contentId);if (activeContent) {
            activeContent.style.display = 'block';// Mostrar el botón de agregar período correspondiente a este tab
            const tabType = tabId.replace('-tab', ''); // prediccion, tornado, montecarlo, sensibilidad
            const addButton = document.getElementById(`add-flujo-${tabType}`);if (addButton) {
                addButton.style.display = 'flex';}
        }
    }

    /**
     * Verificar y otorgar insignias automáticamente después de guardar simulación
     */
    static async verificarYOtorgarInsignias(tipo) {
        const usuarioId = this.getUsuarioId();
        if (!usuarioId) {
            console.error('❌ No hay usuario autenticado para verificar insignias');
            return;
        }

        try {
            console.log('🔍 Consultando estadísticas de usuario para verificar insignias...');

            // Obtener estadísticas del usuario
            const response = await fetch(`/api/v1/gamification/estadisticas/${usuarioId}`);
            if (!response.ok) {
                console.error('❌ Error obteniendo estadísticas del usuario');
                return;
            }

            const estadisticas = await response.json();
            console.log('📊 Estadísticas obtenidas:', estadisticas);

            // Verificar insignias basadas en las estadísticas
            const insigniasVerificadas = await this.verificarInsigniasUsuario(estadisticas, tipo);

            if (insigniasVerificadas && insigniasVerificadas.length > 0) {
                console.log('🎉 Insignias verificadas para otorgar:', insigniasVerificadas);

                // Mostrar modal de felicitación si hay nuevas insignias
                this.mostrarModalInsignias(insigniasVerificadas);

                // Actualizar la interfaz de gamificación si está abierta
                this.actualizarInterfazGamification();
            }

        } catch (error) {
            console.error('💥 Error verificando insignias:', error);
        }
    }

    /**
     * Verificar qué insignias debe tener el usuario basado en sus estadísticas
     */
    static async verificarInsigniasUsuario(estadisticas, tipoSimulacion) {
        const insigniasOtorgadas = [];

        try {
            // Verificar insignias basadas en conteos
            if (estadisticas.simulaciones_van >= 1 && !this.tieneInsignia('Primeros Pasos', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Primeros Pasos');
                insigniasOtorgadas.push('Primeros Pasos');
            }

            if (estadisticas.simulaciones_van >= 5 && !this.tieneInsignia('Analista Novato', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Analista Novato');
                insigniasOtorgadas.push('Analista Novato');
            }

            if (estadisticas.simulaciones_van >= 10 && !this.tieneInsignia('Analista Avanzado', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Analista Avanzado');
                insigniasOtorgadas.push('Analista Avanzado');
            }

            if (estadisticas.simulaciones_van >= 10 && !this.tieneInsignia('Experto en VAN', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Experto en VAN');
                insigniasOtorgadas.push('Experto en VAN');
            }

            if (estadisticas.simulaciones_tir >= 10 && !this.tieneInsignia('Experto en TIR', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Experto en TIR');
                insigniasOtorgadas.push('Experto en TIR');
            }

            if (estadisticas.simulaciones_tir >= 15 && !this.tieneInsignia('Maestro TIR', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Maestro TIR');
                insigniasOtorgadas.push('Maestro TIR');
            }

            if (estadisticas.simulaciones_wacc >= 10 && !this.tieneInsignia('Financiero Estratégico', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Financiero Estratégico');
                insigniasOtorgadas.push('Financiero Estratégico');
            }

            if (estadisticas.simulaciones_portafolio >= 20 && !this.tieneInsignia('Inversor Estratégico', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Inversor Estratégico');
                insigniasOtorgadas.push('Inversor Estratégico');
            }

            // Verificar insignia "Maestro de Finanzas" (todas las categorías)
            const tieneTodasLasCategorias = estadisticas.simulaciones_van >= 10 &&
                                          estadisticas.simulaciones_tir >= 10 &&
                                          estadisticas.simulaciones_wacc >= 10 &&
                                          estadisticas.simulaciones_portafolio >= 10;

            if (tieneTodasLasCategorias && !this.tieneInsignia('Maestro de Finanzas', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Maestro de Finanzas');
                insigniasOtorgadas.push('Maestro de Finanzas');
            }

            // Verificar insignias de conteo total
            const totalSimulaciones = estadisticas.simulaciones_van +
                                    estadisticas.simulaciones_tir +
                                    estadisticas.simulaciones_wacc +
                                    estadisticas.simulaciones_portafolio;

            if (totalSimulaciones >= 10 && !this.tieneInsignia('Calculador Financiero', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Calculador Financiero');
                insigniasOtorgadas.push('Calculador Financiero');
            }

            if (totalSimulaciones >= 25 && !this.tieneInsignia('Analista Avanzado', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Analista Avanzado');
                insigniasOtorgadas.push('Analista Avanzado');
            }

            if (totalSimulaciones >= 100 && !this.tieneInsignia('Financiero Profesional', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Financiero Profesional');
                insigniasOtorgadas.push('Financiero Profesional');
            }

            // Verificar insignia "Maestro de WACC" (10 simulaciones WACC)
            if (estadisticas.simulaciones_wacc >= 10 && !this.tieneInsignia('Maestro de WACC', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Maestro de WACC');
                insigniasOtorgadas.push('Maestro de WACC');
            }

            // Verificar insignias de actividad
            if (estadisticas.dias_consecutivos >= 7 && !this.tieneInsignia('Login Diario', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Login Diario');
                insigniasOtorgadas.push('Login Diario');
            }

            if (estadisticas.dias_consecutivos >= 30 && !this.tieneInsignia('Streak Master', estadisticas.insignias)) {
                await this.otorgarInsigniaUsuario('Streak Master');
                insigniasOtorgadas.push('Streak Master');
            }

        } catch (error) {
            console.error('❌ Error verificando insignias específicas:', error);
        }

        return insigniasOtorgadas;
    }

    /**
     * Verificar si el usuario ya tiene una insignia
     */
    static tieneInsignia(nombreInsignia, insigniasUsuario = []) {
        return insigniasUsuario.some(insignia => insignia.nombre === nombreInsignia);
    }

    /**
     * Otorgar insignia al usuario
     */
    static async otorgarInsigniaUsuario(nombreInsignia) {
        const usuarioId = this.getUsuarioId();
        if (!usuarioId) return;

        try {
            const response = await fetch('/api/v1/gamification/otorgar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usuario_id: usuarioId,
                    nombre_insignia: nombreInsignia
                })
            });

            if (response.ok) {
                console.log(`✅ Insignia "${nombreInsignia}" otorgada exitosamente`);
            } else {
                console.error(`❌ Error otorgando insignia "${nombreInsignia}"`);
            }
        } catch (error) {
            console.error('💥 Error en la petición de otorgar insignia:', error);
        }
    }

    /**
     * Mostrar modal de felicitación por nuevas insignias
     */
    static mostrarModalInsignias(insignias) {
        if (!insignias || insignias.length === 0) return;

        const titulo = insignias.length === 1 ?
            '¡Nueva Insignia Obtenida!' :
            `¡${insignias.length} nuevas insignias obtenidas!`;

        const mensaje = insignias.length === 1 ?
            `Felicitaciones! Has obtenido la insignia: <strong>${insignias[0]}</strong>` :
            `Felicitaciones! Has obtenido las siguientes insignias:<br><br>${insignias.map(i => `• ${i}`).join('<br>')}`;

        this.mostrarModal(titulo, mensaje, 'success', 5000);
    }

    /**
     * Actualizar interfaz de gamificación si está abierta
     */
    static actualizarInterfazGamification() {
        // Disparar evento para actualizar la interfaz de gamificación
        const event = new CustomEvent('gamificationActualizada');
        document.dispatchEvent(event);
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIUtils;}
