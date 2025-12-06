# 📱 Documentación Frontend - Econova

**Responsable:** Gianfranco  
**Módulo:** Frontend Web (HTML, CSS, JavaScript)  
**Fecha:** Diciembre 2025

---

## 📋 Estructura del Frontend

### Carpetas

```
app/
  plantillas/               ← Archivos HTML (Jinja2)
    base.html             ✅ Plantilla base
    inicio.html           ✅ Dashboard
    simulacion.html       ✅ Formularios de simulación
    resultados.html       ✅ Visualización de resultados
    chatbot.html          (pendiente)
    error.html            (pendiente)
  
  static/
    js/
      api-service.js      ✅ Servicios para llamadas a API
    css/
      (estilos adicionales)
  
  rutas/
    frontend.py           ✅ Rutas Flask para servir HTML
```

### Archivos Creados

#### 1. **base.html** ✅
- Plantilla base Jinja2 con Bootstrap 5
- Navbar con navegación principal
- Sidebar con acceso rápido a simulaciones
- Footer
- CSS global
- Sistema de alertas y loading overlay
- Simulación de usuario demo (sin auth real)

#### 2. **inicio.html** ✅
- Dashboard con tarjetas de resumen
- Estadísticas del usuario
- Simulaciones recientes
- Acceso rápido a 6 tipos de análisis
- Logros desbloqueados

#### 3. **simulacion.html** ✅
- 6 formularios interactivos:
  - VAN (Valor Actual Neto)
  - TIR (Tasa Interna de Retorno)
  - WACC (Costo Promedio Ponderado)
  - Portafolio
  - Reemplazo de Activos
  - Payback (Período de Recuperación)
- Validación en cliente
- Agregar/remover campos dinámicamente
- Integración con API

#### 4. **resultados.html** ✅
- Visualización dinámica según tipo de análisis
- Gráficos interactivos con Plotly
- Tablas detalladas de resultados
- Exportar a JSON, CSV, PDF
- Historial de simulaciones
- Duplicar simulaciones

#### 5. **api-service.js** ✅
- `APIService`: Clase para consumir endpoints REST
- `FormatoUtil`: Formateo de números, fechas, monedas
- `Validador`: Validaciones de entrada
- `GraficoUtil`: Gráficos con Plotly

#### 6. **frontend.py** ✅
- Rutas Flask para servir HTML
- Ruta `/` → inicio.html
- Ruta `/simulacion` → simulacion.html
- Ruta `/resultados` → resultados.html
- Ruta `/chatbot` → chatbot.html
- Manejo de errores 404 y 500

---

## 🚀 Características Implementadas

### Dashboard (inicio.html)
✅ Resumen de estadísticas en tarjetas  
✅ Simulaciones recientes con tabla  
✅ Acceso rápido a 6 análisis  
✅ Logros desbloqueados  
✅ Carga dinámica desde API  

### Formularios (simulacion.html)
✅ VAN con múltiples flujos  
✅ TIR con validación  
✅ WACC con proporciones  
✅ Portafolio con activos dinámicos  
✅ Reemplazo con flujos duales  
✅ Payback  
✅ Campos dinámicos (agregar/remover)  
✅ Validación en cliente  

### Resultados (resultados.html)
✅ Visualización por tipo de análisis  
✅ Tablas de detalles  
✅ Gráficos interactivos (Plotly)  
✅ Exportar JSON/CSV/PDF  
✅ Historial de simulaciones  
✅ Selección y carga dinámicas  

### Estilos (base.html)
✅ Bootstrap 5 responsive  
✅ CSS global personalizado  
✅ Tema de colores coherente  
✅ Navbar sticky  
✅ Sidebar responsive  
✅ Animaciones suaves  
✅ Modo oscuro listo (pendiente)  

### JavaScript (api-service.js)
✅ Llamadas fetch a API REST  
✅ Manejo de errores  
✅ Loading overlay  
✅ Alertas automáticas  
✅ Formateo de datos  
✅ Validadores de entrada  
✅ Gráficos Plotly  

---

## 🔌 Integración API

### Endpoints Utilizados

**Usuarios:**
```javascript
GET    /api/v1/usuarios/{id}
GET    /api/v1/usuarios/{id}/estadisticas
GET    /api/v1/usuarios/{id}/logros
```

**Simulaciones Financieras:**
```javascript
POST   /api/v1/financiero/van
POST   /api/v1/financiero/tir
POST   /api/v1/financiero/wacc
POST   /api/v1/financiero/portafolio
POST   /api/v1/financiero/reemplazo-activo
POST   /api/v1/financiero/periodo-recuperacion
GET    /api/v1/financiero/simulaciones/{id}
GET    /api/v1/financiero/simulaciones/usuario/{id}
```

### Ejemplo de Uso (JavaScript)

```javascript
// Llamar API
const resultado = await APIService.calcularVAN({
    inversion_inicial: 100000,
    flujos_caja: [30000, 35000, 40000],
    tasa_descuento: 0.10,
    usuario_id: 1
});

// Formatear resultado
const moneda = FormatoUtil.formatoMoneda(resultado.data.van);
const porcentaje = FormatoUtil.formatoPorcentaje(resultado.data.tasa_descuento);

// Crear gráfico
GraficoUtil.crearGraficoLineas('elemento-id', xData, yData, 'Título');

// Validar entrada
if (Validador.esNumeroPositivo(valor)) {
    // Procesar
}
```

---

## 🛠️ Cómo Ejecutar

### 1. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 2. Iniciar Servidor
```bash
python run.py
```

### 3. Abrir en Navegador
```
http://localhost:5000
```

---

## 📝 Pendiente

### Por Completar

- [ ] `chatbot.html` - Interfaz de chat
- [ ] `error.html` - Página de errores
- [ ] `perfil.html` - Perfil de usuario
- [ ] `configuracion.html` - Configuración
- [ ] Autenticación real (JWT)
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
- [ ] Más gráficos (comparativas, análisis sensibilidad)
- [ ] Exportar a Excel con estilos
- [ ] Historial de cambios

---

## 🎨 Paleta de Colores

```css
--primary-color: #2563eb     (Azul)
--secondary-color: #1e40af   (Azul oscuro)
--success-color: #10b981     (Verde)
--danger-color: #ef4444      (Rojo)
--warning-color: #f59e0b     (Naranja)
--light-bg: #f9fafb          (Gris claro)
--border-color: #e5e7eb      (Gris borde)
```

---

## 📱 Responsive

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)
- ✅ Sidebar auto-oculto en mobile
- ✅ Formularios adaptables

---

## 🔒 Seguridad

- ✅ CORS configurado
- ✅ Validación en cliente
- ✅ Validación en servidor (API)
- ✅ Sanitización de inputs
- ⚠️ Autenticación JWT (pendiente)
- ⚠️ Encriptación de datos sensibles (pendiente)

---

## 📊 Datos de Sesión

### Usuario Demo Actual
```javascript
{
    usuario_id: 1,
    nombre_usuario: 'usuario_demo',
    nombres: 'Juan',
    apellidos: 'Demo',
    email: 'demo@econova.com',
    nivel: 'Intermedio'
}
```

Para cambiar, editar objeto `usuarioActual` en `base.html`.

---

## 🚀 Próximos Pasos

1. **Completar Chatbot** - UI e integración
2. **Autenticación** - Login real con JWT
3. **Más Gráficos** - Análisis sensibilidad, stress testing
4. **Reportes PDF** - Con gráficos incluidos
5. **Notificaciones** - Alertas en tiempo real
6. **Mobile App** - React Native o Flutter

---

## 📞 Soporte

**Gianfranco** - Frontend Web  
Responsable de: HTML, CSS, JavaScript, Plotly, Bootstrap

**Integración con Backend (Germaín):**
- API REST en `/api/v1/*`
- CORS habilitado
- Respuestas JSON

---

**Estado:** ✅ COMPLETADO (Frontend básico funcional)  
**Última Actualización:** Diciembre 2025  
**Versión:** 1.0.0
