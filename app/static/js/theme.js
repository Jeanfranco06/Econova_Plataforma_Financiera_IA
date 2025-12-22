/**
 * Sistema de Temas de Econova
 * Gestión de temas claro/oscuro y personalización
 */

class ThemeManager {
    constructor(options = {}) {
        this.options = {
            defaultTheme: options.defaultTheme || 'light',
            storageKey: options.storageKey || 'econova_theme',
            ...options
        };

        this.currentTheme = this.getStoredTheme() || this.options.defaultTheme;
        this.themes = {
            light: {
                name: 'Claro',
                colors: {
                    primary: '#00ffff',
                    secondary: '#ff6b6b',
                    accent: '#4ecdc4',
                    background: '#ffffff',
                    surface: '#f8f9fa',
                    text: '#333333',
                    textSecondary: '#666666',
                    border: '#e0e0e0',
                    shadow: 'rgba(0, 0, 0, 0.1)',
                    success: '#4caf50',
                    error: '#f44336',
                    warning: '#ff9800',
                    info: '#2196f3'
                }
            },
            dark: {
                name: 'Oscuro',
                colors: {
                    primary: '#00ffff',
                    secondary: '#ff6b6b',
                    accent: '#4ecdc4',
                    background: '#121212',
                    surface: '#1e1e1e',
                    text: '#ffffff',
                    textSecondary: '#b0b0b0',
                    border: '#333333',
                    shadow: 'rgba(0, 0, 0, 0.3)',
                    success: '#4caf50',
                    error: '#f44336',
                    warning: '#ff9800',
                    info: '#2196f3'
                }
            },
            cyberpunk: {
                name: 'Cyberpunk',
                colors: {
                    primary: '#00ffff',
                    secondary: '#ff0080',
                    accent: '#00ff80',
                    background: '#0a0a0a',
                    surface: '#1a1a2e',
                    text: '#ffffff',
                    textSecondary: '#00ffff',
                    border: '#00ffff',
                    shadow: 'rgba(0, 255, 255, 0.3)',
                    success: '#00ff80',
                    error: '#ff0080',
                    warning: '#ffff00',
                    info: '#0080ff'
                }
            },
            nature: {
                name: 'Naturaleza',
                colors: {
                    primary: '#4ecdc4',
                    secondary: '#45b7d1',
                    accent: '#96ceb4',
                    background: '#f5f9f8',
                    surface: '#ffffff',
                    text: '#2c3e50',
                    textSecondary: '#7f8c8d',
                    border: '#ecf0f1',
                    shadow: 'rgba(46, 204, 113, 0.1)',
                    success: '#27ae60',
                    error: '#e74c3c',
                    warning: '#f39c12',
                    info: '#3498db'
                }
            }
        };

        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.createThemeSwitcher();
        this.setupSystemThemeDetection();
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) {
            console.warn(`Tema "${themeName}" no encontrado`);
            return;
        }

        this.currentTheme = themeName;

        // Aplicar variables CSS
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        // Aplicar clase al body
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${themeName}`);

        // Forzar actualización de elementos que usan clases temáticas
        this.updateThemeAwareElements();

        // Guardar en localStorage
        this.saveTheme(themeName);

        // Disparar evento
        this.dispatchEvent('themeChanged', { theme: themeName, colors: theme.colors });

        console.log(`Tema cambiado a: ${themeName}`, theme.colors);
    }

    updateThemeAwareElements() {
        // Actualizar elementos que necesitan refrescarse con el nuevo tema
        const themeElements = document.querySelectorAll('.theme-bg-background, .theme-bg-surface, .theme-text-primary, .theme-text-secondary, .theme-border, .theme-shadow');

        themeElements.forEach(element => {
            // Forzar reflow para aplicar nuevos estilos
            element.style.display = 'none';
            element.offsetHeight; // Trigger reflow
            element.style.display = '';
        });

        // Actualizar elementos con clases Tailwind que deben usar variables de tema
        const tailwindOverrides = [
            '.bg-gray-50', '.bg-white', '.text-gray-800', '.text-gray-700',
            '.text-gray-600', '.text-gray-500', '.border-gray-200', '.bg-gray-100'
        ];

        tailwindOverrides.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Forzar actualización de estilos computados
                const computedStyle = getComputedStyle(element);
                element.style.cssText += '; display: ' + computedStyle.display + ';';
            });
        });
    }

    createThemeSwitcher() {
        // Don't create theme switcher if we have the navbar theme toggle
        if (document.getElementById('theme-toggle-btn') || document.getElementById('theme-menu')) return;

        const switcher = document.createElement('div');
        switcher.id = 'theme-switcher';
        switcher.innerHTML = `
            <button id="theme-toggle" class="theme-toggle-btn" title="Cambiar tema">
                <i class="fas fa-palette"></i>
            </button>
            <div id="theme-menu" class="theme-menu hidden">
                ${Object.entries(this.themes).map(([key, theme]) => `
                    <button class="theme-option ${key === this.currentTheme ? 'active' : ''}"
                            data-theme="${key}"
                            title="${theme.name}">
                        <div class="theme-preview">
                            <div class="theme-color" style="background: ${theme.colors.primary}"></div>
                            <div class="theme-color" style="background: ${theme.colors.secondary}"></div>
                            <div class="theme-color" style="background: ${theme.colors.accent}"></div>
                        </div>
                        <span class="theme-name">${theme.name}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Estilos CSS
        const styles = `
            #theme-switcher {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 10000;
            }

            .theme-toggle-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 3px solid #fff;
                background: var(--color-primary);
                color: #000;
                font-size: 18px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .theme-toggle-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(0,0,0,0.4);
            }

            .theme-menu {
                position: absolute;
                top: 60px;
                right: 0;
                background: var(--color-surface);
                border: 2px solid var(--color-border);
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                min-width: 200px;
                backdrop-filter: blur(10px);
                z-index: 10001;
            }

            .theme-menu.hidden {
                display: none;
            }

            .theme-option {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px;
                border: none;
                background: none;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.2s;
                color: var(--color-text);
                font-size: 14px;
            }

            .theme-option:hover {
                background: var(--color-primary);
                color: #000;
            }

            .theme-option.active {
                background: var(--color-primary);
                color: #000;
                font-weight: bold;
            }

            .theme-preview {
                display: flex;
                gap: 4px;
            }

            .theme-color {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 1px solid var(--color-border);
            }

            .theme-name {
                font-weight: 500;
                flex: 1;
                text-align: left;
            }

            @media (max-width: 768px) {
                #theme-switcher {
                    top: 70px;
                    right: 10px;
                }

                .theme-toggle-btn {
                    width: 44px;
                    height: 44px;
                    font-size: 16px;
                }

                .theme-menu {
                    min-width: 180px;
                    padding: 8px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        document.body.appendChild(switcher);

        console.log('🎨 Theme switcher created and appended to body');

        // Event listeners
        const toggleBtn = document.getElementById('theme-toggle');
        const menu = document.getElementById('theme-menu');

        if (toggleBtn && menu) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('hidden');
                console.log('🎨 Theme menu toggled');
            });

            // Cerrar menú al hacer click fuera
            document.addEventListener('click', (e) => {
                if (!switcher.contains(e.target)) {
                    menu.classList.add('hidden');
                }
            });

            // Cambiar tema
            document.querySelectorAll('.theme-option').forEach(option => {
                option.addEventListener('click', () => {
                    const theme = option.dataset.theme;
                    console.log('🎨 Switching to theme:', theme);
                    this.applyTheme(theme);
                    menu.classList.add('hidden');

                    // Actualizar clase active
                    document.querySelectorAll('.theme-option').forEach(opt => {
                        opt.classList.remove('active');
                    });
                    option.classList.add('active');
                });
            });
        } else {
            console.error('🎨 Theme switcher elements not found');
        }
    }

    setupSystemThemeDetection() {
        // Detectar preferencia del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        this.systemTheme = prefersDark.matches ? 'dark' : 'light';

        // Escuchar cambios
        prefersDark.addEventListener('change', (e) => {
            this.systemTheme = e.matches ? 'dark' : 'light';
            // Solo cambiar si no hay tema guardado manualmente
            if (!this.getStoredTheme()) {
                this.applyTheme(this.systemTheme);
            }
        });
    }

    getStoredTheme() {
        try {
            return localStorage.getItem(this.options.storageKey);
        } catch (error) {
            return null;
        }
    }

    saveTheme(theme) {
        try {
            localStorage.setItem(this.options.storageKey, theme);
        } catch (error) {
            console.warn('No se pudo guardar el tema:', error);
        }
    }

    getAvailableThemes() {
        return Object.keys(this.themes);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getThemeColors(themeName = null) {
        const theme = themeName || this.currentTheme;
        return this.themes[theme]?.colors || null;
    }

    setCustomColors(colors) {
        // Permitir personalización de colores
        const currentTheme = this.themes[this.currentTheme];
        if (currentTheme) {
            Object.assign(currentTheme.colors, colors);
            this.applyTheme(this.currentTheme);
        }
    }

    resetToDefault() {
        this.applyTheme(this.options.defaultTheme);
    }

    toggleTheme() {
        const themes = this.getAvailableThemes();
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.applyTheme(themes[nextIndex]);
    }

    dispatchEvent(eventName, detail = null) {
        const event = new CustomEvent(`theme${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`, {
            detail: detail
        });
        document.dispatchEvent(event);
    }

    // API pública
    switchToLight() { this.applyTheme('light'); }
    switchToDark() { this.applyTheme('dark'); }
    switchToCyberpunk() { this.applyTheme('cyberpunk'); }
    switchToNature() { this.applyTheme('nature'); }
}

// Inicialización global
document.addEventListener('DOMContentLoaded', function() {
    window.themeManager = new ThemeManager({
        defaultTheme: 'light'
    });
});

// Funciones de conveniencia globales
window.switchTheme = (theme) => window.themeManager.applyTheme(theme);
window.toggleTheme = () => window.themeManager.toggleTheme();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
