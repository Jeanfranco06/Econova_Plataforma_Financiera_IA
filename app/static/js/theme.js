/**
 * Sistema de temas para Econova
 * Maneja el cambio entre modo claro y oscuro con colores pasteles
 */

// Clase para manejar el sistema de temas
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'light';
        this.init();
    }

    // Obtener tema almacenado
    getStoredTheme() {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem('econova-theme');
        }
        return null;
    }

    // Almacenar tema
    storeTheme(theme) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('econova-theme', theme);
        }
    }

    // Aplicar tema
    applyTheme(theme) {
        this.currentTheme = theme;
        this.storeTheme(theme);
        
        // Actualizar clase del body
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);
        
        // Aplicar estilos CSS variables
        this.setCSSVariables(theme);
        
        // Disparar evento de cambio de tema
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: theme } 
        }));
        
        console.log(`🌙 Tema cambiado a: ${theme}`);
    }

    // Establecer variables CSS según el tema
    setCSSVariables(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            // Modo oscuro - colores pasteles oscuros
            root.style.setProperty('--color-primary', 'var(--dark-color-primary)');
            root.style.setProperty('--color-secondary', 'var(--dark-color-secondary)');
            root.style.setProperty('--color-success', 'var(--dark-color-success)');
            root.style.setProperty('--color-danger', 'var(--dark-color-danger)');
            root.style.setProperty('--color-warning', 'var(--dark-color-warning)');
            root.style.setProperty('--color-background', 'var(--dark-color-background)');
            root.style.setProperty('--color-surface', 'var(--dark-color-surface)');
            root.style.setProperty('--color-text-primary', 'var(--dark-color-text-primary)');
            root.style.setProperty('--color-text-secondary', 'var(--dark-color-text-secondary)');
            root.style.setProperty('--color-border', 'var(--dark-color-border)');
            root.style.setProperty('--color-shadow', 'var(--dark-color-shadow)');
        } else {
            // Modo claro - colores pasteles claros
            root.style.setProperty('--color-primary', '#93c5fd');      // Azul pastel
            root.style.setProperty('--color-secondary', '#cbd5e1');    // Gris pastel
            root.style.setProperty('--color-success', '#86efac');      // Verde pastel
            root.style.setProperty('--color-danger', '#fca5a5');       // Rojo pastel
            root.style.setProperty('--color-warning', '#fde68a');      // Amarillo pastel
            root.style.setProperty('--color-background', '#ffffff');
            root.style.setProperty('--color-surface', '#f8fafc');      // Gris claro fondo
            root.style.setProperty('--color-text-primary', '#1e293b'); // Texto principal
            root.style.setProperty('--color-text-secondary', '#64748b'); // Texto secundario
            root.style.setProperty('--color-border', '#e2e8f0');       // Bordes sutiles
            root.style.setProperty('--color-shadow', 'rgba(0, 0, 0, 0.08)');
        }
    }

    // Inicializar el sistema de temas
    init() {
        // Aplicar tema almacenado o por defecto
        this.applyTheme(this.currentTheme);
        
        // Escuchar cambios en localStorage (para sincronizar entre pestañas)
        window.addEventListener('storage', (e) => {
            if (e.key === 'econova-theme' && e.newValue) {
                this.applyTheme(e.newValue);
            }
        });
    }

    // Alternar entre temas
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        return newTheme;
    }

    // Obtener tema actual
    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Inicializar el sistema de temas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia del gestor de temas
    window.themeManager = new ThemeManager();
    
    // Exponer métodos globales para compatibilidad con el código existente
    window.switchTheme = (theme) => {
        if (window.themeManager) {
            window.themeManager.applyTheme(theme);
        }
    };
    
    console.log('🎨 Sistema de temas inicializado');
});

// Exportar para uso en otros módulos (si se usa ES6)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
