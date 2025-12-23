/**
 * Sistema de temas para Econova
 * Maneja el cambio entre modo claro y oscuro con colores pasteles
 */

// Clase para manejar el sistema de temas
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'light';this.init();}

    // Obtener tema almacenado
    getStoredTheme() {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem('econova-theme');}
        return null;}

    // Almacenar tema
    storeTheme(theme) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('econova-theme', theme);}
    }

    // Aplicar tema
    applyTheme(theme) {
        this.currentTheme = theme;this.storeTheme(theme);// Actualizar clase del body
        document.body.classList.remove('theme-light', 'theme-dark');document.body.classList.add(`theme-${theme}`);// Aplicar estilos CSS variables
        this.setCSSVariables(theme);// Disparar evento de cambio de tema
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: theme } 
        }));}

    // Establecer variables CSS según el tema
    setCSSVariables(theme) {
        const root = document.documentElement;if (theme === 'dark') {
            // Modo oscuro - paleta elegante y profesional
            root.style.setProperty('--color-primary', '#2563eb');       // Azul profesional
            root.style.setProperty('--color-secondary', '#64748b');    // Gris medio elegante
            root.style.setProperty('--color-success', '#059669');      // Verde esmeralda
            root.style.setProperty('--color-danger', '#dc2626');       // Rojo carmesí
            root.style.setProperty('--color-warning', '#d97706');      // Ámbar dorado
            root.style.setProperty('--color-background', '#0f172a');   // Azul marino profundo
            root.style.setProperty('--color-surface', '#1e293b');      // Gris azulado
            root.style.setProperty('--color-text-primary', '#f1f5f9'); // Blanco casi puro
            root.style.setProperty('--color-text-secondary', '#cbd5e1'); // Gris claro suave
            root.style.setProperty('--color-border', '#334155');       // Gris azulado medio
            root.style.setProperty('--color-shadow', 'rgba(0, 0, 0, 0.25)');root.style.setProperty('--color-card-bg', '#1e293b');      // Fondo de tarjetas
            root.style.setProperty('--color-input-bg', '#374151');     // Fondo de inputs

            // Colores adicionales para chatbot y componentes específicos
            root.style.setProperty('--color-chatbot-bg', '#0f172a');   // Fondo del chatbot
            root.style.setProperty('--color-message-bot', '#1e293b');  // Burbuja bot
            root.style.setProperty('--color-message-user', '#2563eb'); // Burbuja usuario
            root.style.setProperty('--color-scrollbar-track', '#1e293b'); // Scrollbar
            root.style.setProperty('--color-scrollbar-thumb', '#64748b'); // Scrollbar thumb
            root.style.setProperty('--color-header-accent', '#334155'); // Acentos de header

            // Colores para gamificación
            root.style.setProperty('--color-achievement-bg', '#1e293b');root.style.setProperty('--color-progress-bg', '#374151');root.style.setProperty('--color-progress-fill', '#2563eb');} else {
            // Modo claro - paleta elegante y profesional
            root.style.setProperty('--color-primary', '#1e40af');       // Azul marino
            root.style.setProperty('--color-secondary', '#475569');    // Gris pizarra
            root.style.setProperty('--color-success', '#047857');      // Verde pino
            root.style.setProperty('--color-danger', '#b91c1c');       // Rojo bermellón
            root.style.setProperty('--color-warning', '#b45309');      // Naranja terracota
            root.style.setProperty('--color-background', '#ffffff');   // Blanco puro
            root.style.setProperty('--color-surface', '#f8fafc');      // Gris perla muy claro
            root.style.setProperty('--color-text-primary', '#0f172a'); // Azul marino oscuro
            root.style.setProperty('--color-text-secondary', '#475569'); // Gris pizarra
            root.style.setProperty('--color-border', '#cbd5e1');       // Gris claro elegante
            root.style.setProperty('--color-shadow', 'rgba(15, 23, 42, 0.08)');root.style.setProperty('--color-card-bg', '#ffffff');      // Fondo blanco de tarjetas
            root.style.setProperty('--color-input-bg', '#ffffff');     // Fondo blanco de inputs

            // Colores adicionales para chatbot y componentes específicos
            root.style.setProperty('--color-chatbot-bg', '#f8fafc');   // Fondo del chatbot
            root.style.setProperty('--color-message-bot', '#ffffff');  // Burbuja bot
            root.style.setProperty('--color-message-user', '#1e40af'); // Burbuja usuario
            root.style.setProperty('--color-scrollbar-track', '#f1f5f9'); // Scrollbar
            root.style.setProperty('--color-scrollbar-thumb', '#cbd5e1'); // Scrollbar thumb
            root.style.setProperty('--color-header-accent', '#e2e8f0'); // Acentos de header

            // Colores para gamificación
            root.style.setProperty('--color-achievement-bg', '#ffffff');root.style.setProperty('--color-progress-bg', '#e2e8f0');root.style.setProperty('--color-progress-fill', '#1e40af');}
    }

    // Inicializar el sistema de temas
    init() {
        // Aplicar tema almacenado o por defecto
        this.applyTheme(this.currentTheme);// Escuchar cambios en localStorage (para sincronizar entre pestañas)
        window.addEventListener('storage', (e) => {
            if (e.key === 'econova-theme' && e.newValue) {
                this.applyTheme(e.newValue);}
        });}

    // Alternar entre temas
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';this.applyTheme(newTheme);return newTheme;}

    // Obtener tema actual
    getCurrentTheme() {
        return this.currentTheme;}
}

// Inicializar el sistema de temas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia del gestor de temas
    window.themeManager = new ThemeManager();// Exponer métodos globales para compatibilidad con el código existente
    window.switchTheme = (theme) => {
        if (window.themeManager) {
            window.themeManager.applyTheme(theme);}
    };});// Exportar para uso en otros módulos (si se usa ES6)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;}
