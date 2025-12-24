# Sistema de Benchmarking Modular

## Estructura de Archivos

```
benchmarking/
├── core/
│   └── benchmarking-core.js      # Lógica de cálculos y análisis
├── ui/
│   └── benchmarking-ui.js        # Gestión de interfaz de usuario
├── utils/
│   └── benchmarking-utils.js     # Utilidades y helpers
├── benchmarking-manager.js       # Coordinador principal
└── README.md                     # Esta documentación
```

## Funcionalidades

### Análisis Sectorial
1. **Selección de métricas**: Elige qué métricas analizar
2. **Selección de sector**: Tecnología, Manufactura, Comercio, etc.
3. **Selección de tamaño**: Micro, pequeña, mediana, grande
4. **Generación automática**: Comparación con datos simulados del sector
5. **Resultados detallados**: Percentiles, posiciones, recomendaciones

### Comparación Personalizada
1. **Empresa base**: Tus datos actuales
2. **Empresas de comparación**: Datos manuales de competidores
3. **Criterios flexibles**: Elige qué comparar
4. **Análisis detallado**: Posicionamiento relativo
5. **Insights inteligentes**: Recomendaciones basadas en datos

### Grupos de Benchmarking
1. **Grupos públicos**: Unirse a comunidades especializadas
2. **Grupos privados**: Crear tus propios grupos
3. **Comparación anónima**: Datos agregados sin identificar empresas
4. **Historial completo**: Todos tus análisis guardados

## Uso del Sistema

### Carga de Archivos
Incluir en el HTML en este orden:

```html
<!-- Núcleo del sistema -->
<script src="/static/js/benchmarking/core/benchmarking-core.js"></script>

<!-- Interfaz de usuario -->
<script src="/static/js/benchmarking/ui/benchmarking-ui.js"></script>

<!-- Utilidades -->
<script src="/static/js/benchmarking/utils/benchmarking-utils.js"></script>

<!-- Gestor principal -->
<script src="/static/js/benchmarking/benchmarking-manager.js"></script>
```

### API Principal
```javascript
// Acceder al sistema
const manager = window.benchmarkingManager;

// Generar análisis sectorial
await manager.generarBenchmarkingSectorial(formElement);

// Obtener análisis guardado
const analisis = manager.obtenerAnalisisBenchmarking('sectorial');

// Exportar datos
const datosExport = manager.exportarDatosBenchmarking('sectorial');
```

## Arquitectura Modular

### BenchmarkingCore
- **Responsabilidades**:
  - Cálculos estadísticos
  - Generación de datos simulados
  - Análisis de percentiles
  - Recomendaciones inteligentes

- **Métodos principales**:
  - `generarAnalisisSectorial()`: Análisis completo
  - `calcularPosicionRelativa()`: Percentiles y rankings
  - `generarRecomendaciones()`: Insights accionables

### BenchmarkingUI
- **Responsabilidades**:
  - Gestión de formularios
  - Navegación entre secciones
  - Creación de gráficos
  - Manejo de eventos

- **Métodos principales**:
  - `mostrarResultadosBenchmarking()`: Resultados sectoriales
  - `crearGraficoPercentiles()`: Visualización de datos
  - `setupEventListeners()`: Interactividad

### BenchmarkingUtils
- **Responsabilidades**:
  - Validación de datos
  - Persistencia localStorage
  - Comunicación con backend
  - Utilidades generales

- **Métodos principales**:
  - `guardarAnalisisBenchmarking()`: Persistencia
  - `validarDatosBenchmarking()`: Validación
  - `obtenerUsuarioActual()`: Usuario activo

## Desarrollo y Mantenimiento

### Agregar Nueva Métrica
1. Actualizar `BenchmarkingCore.nombreMetrica()`
2. Añadir validación en `BenchmarkingUtils.validarDatosBenchmarking()`
3. Actualizar formularios HTML
4. Probar cálculos estadísticos

### Nuevo Tipo de Análisis
1. Extender `BenchmarkingCore` con nuevo método
2. Actualizar `BenchmarkingManager` para manejar el tipo
3. Añadir UI correspondiente en `BenchmarkingUI`
4. Actualizar rutas del backend si es necesario

### Debugging
- Usar `console.log` con prefijos descriptivos (🔍, 💾, 📊, etc.)
- Verificar que todos los módulos estén cargados
- Revisar localStorage para datos persistidos
- Verificar comunicación con backend

## Problemas Comunes

### "Módulos no están cargados correctamente"
- Verificar orden de carga de scripts en HTML
- Asegurar que todos los archivos existen y son accesibles
- Revisar errores de sintaxis en consola

### "Estadísticas incompletas"
- Verificar que los datos de entrada sean válidos
- Revisar cálculos en `BenchmarkingCore`
- Asegurar que las métricas seleccionadas tengan valores

### "Percentiles en 0.0%"
- Verificar `calcularPosicionRelativa()` en `BenchmarkingCore`
- Revisar que los datos sectoriales se generen correctamente
- Comprobar que las comparaciones sean válidas

### "Gráficos no se muestran"
- Verificar que Chart.js esté cargado
- Revisar que los datos sean numéricos
- Comprobar que los elementos canvas existan

## Migración desde Versión Anterior

La nueva arquitectura modular es completamente compatible con la versión anterior. Para migrar:

1. Reemplazar el archivo único `benchmarking.js` por los módulos separados
2. Actualizar las referencias en las plantillas HTML
3. Probar todas las funcionalidades
4. Eliminar el archivo antiguo una vez verificado el funcionamiento

Los datos guardados en localStorage son compatibles entre versiones.
