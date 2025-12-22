# 🔄 INTEGRACIÓN PRÉSTAMO - AHORRO

## 📋 Descripción

Este documento describe la integración entre los módulos de **préstamos** y **ahorro/inversión** en la plataforma Econova.

## 🎯 Objetivos

- ✅ Unificar la lógica de cálculos financieros
- ✅ Compartir datos entre módulos
- ✅ Optimizar recomendaciones de inversión
- ✅ Mejorar la experiencia del usuario

## 🏗️ Arquitectura

### Componentes Principales

#### 1. **Servicio de Préstamos** (`prestamo_servicio.py`)
```python
class PrestamoServicio:
    def calcular_cuota_mensual(self, capital, tasa, plazo):
        """Calcula cuota mensual de préstamo"""

    def analizar_capacidad_pago(self, ingresos, gastos, cuota):
        """Analiza capacidad de pago del usuario"""

    def recomendar_prestamo(self, perfil_usuario):
        """Recomienda tipo de préstamo óptimo"""
```

#### 2. **Servicio de Ahorro/Inversión** (`ahorro_inversion_servicio.py`)
```python
class AhorroInversionServicio:
    def calcular_interes_compuesto(self, capital, tasa, tiempo):
        """Calcula interés compuesto"""

    def analizar_portafolio(self, inversiones):
        """Analiza portafolio de inversiones"""

    def recomendar_inversiones(self, perfil_riesgo, capital):
        """Recomienda inversiones según perfil"""
```

#### 3. **Servicio Integrado** (`financiero_servicio.py`)
```python
class FinancieroServicio:
    def analizar_situacion_financiera(self, usuario_id):
        """Análisis completo de situación financiera"""

    def generar_plan_financiero(self, usuario_id):
        """Genera plan financiero personalizado"""

    def calcular_flujo_caja_proyectado(self, usuario_id):
        """Calcula flujo de caja futuro"""
```

## 🔄 Flujos de Integración

### 1. **Registro de Usuario**
```
Usuario se registra → Se crea perfil financiero base
                   → Se evalúa capacidad de ahorro
                   → Se determina perfil de riesgo
```

### 2. **Solicitud de Préstamo**
```
Usuario solicita préstamo → Se verifica capacidad de pago
                           → Se analiza historial de ahorro
                           → Se calcula riesgo crediticio
                           → Se aprueba/rechaza préstamo
```

### 3. **Recomendaciones de Inversión**
```
Usuario ahorra → Se analiza perfil de riesgo
                → Se evalúan inversiones disponibles
                → Se generan recomendaciones personalizadas
                → Se optimiza portafolio
```

### 4. **Dashboard Financiero**
```
Usuario accede al dashboard → Se muestran métricas consolidadas
                             → Gráficos de ahorro vs deuda
                             → Proyecciones financieras
                             → Recomendaciones integradas
```

## 📊 APIs Integradas

### Endpoints Compartidos

#### `GET /api/v1/financiero/situacion/{usuario_id}`
**Análisis completo de situación financiera**
```json
{
  "ingresos_mensuales": 5000,
  "gastos_mensuales": 3500,
  "ahorros_actuales": 15000,
  "deudas_actuales": 8000,
  "capacidad_ahorro": 1500,
  "score_crediticio": 750,
  "perfil_riesgo": "Moderado",
  "recomendaciones": [...]
}
```

#### `POST /api/v1/financiero/plan`
**Genera plan financiero personalizado**
```json
{
  "usuario_id": 123,
  "objetivos": ["Comprar casa", "Educación hijos"],
  "plazo": 10,
  "riesgo_aceptable": "Medio"
}
```

#### `GET /api/v1/financiero/proyeccion/{usuario_id}`
**Proyección financiera a futuro**
```json
{
  "proyecciones": [
    {"anio": 2024, "ahorros_proyectados": 20000, "deuda_restante": 5000},
    {"anio": 2025, "ahorros_proyectados": 28000, "deuda_restante": 2000}
  ],
  "escenarios": ["Conservador", "Moderado", "Agresivo"]
}
```

## 🔧 Implementación Técnica

### Modelos de Datos Compartidos

#### Tabla `Situacion_Financiera`
```sql
CREATE TABLE Situacion_Financiera (
    situacion_id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES Usuarios(usuario_id),
    ingresos_mensuales DECIMAL(12,2),
    gastos_mensuales DECIMAL(12,2),
    ahorros_actuales DECIMAL(12,2),
    deudas_actuales DECIMAL(12,2),
    capacidad_ahorro DECIMAL(12,2),
    score_crediticio INT,
    perfil_riesgo VARCHAR(20),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla `Objetivos_Financieros`
```sql
CREATE TABLE Objetivos_Financieros (
    objetivo_id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES Usuarios(usuario_id),
    descripcion TEXT,
    monto_objetivo DECIMAL(12,2),
    monto_actual DECIMAL(12,2),
    fecha_limite DATE,
    prioridad VARCHAR(10),
    estado VARCHAR(20) DEFAULT 'Activo'
);
```

### Algoritmos de Recomendación

#### 1. **Evaluación de Capacidad de Pago**
```python
def evaluar_capacidad_pago(ingresos, gastos, cuota_prestamo):
    """
    Evalúa si el usuario puede pagar una cuota de préstamo
    """
    capacidad_pago = ingresos * 0.35  # Regla del 35%
    capacidad_restante = capacidad_pago - (gastos * 0.3)  # Gastos esenciales

    if cuota_prestamo <= capacidad_restante:
        return {"aprobado": True, "nivel_riesgo": "Bajo"}
    elif cuota_prestamo <= capacidad_pago:
        return {"aprobado": True, "nivel_riesgo": "Medio"}
    else:
        return {"aprobado": False, "nivel_riesgo": "Alto"}
```

#### 2. **Optimización de Portafolio**
```python
def optimizar_portafolio(ahorros, perfil_riesgo, objetivos):
    """
    Optimiza distribución de inversiones según perfil
    """
    if perfil_riesgo == "Conservador":
        return {
            "bonos": 0.6,
            "acciones": 0.2,
            "fondos_mutuos": 0.15,
            "liquidez": 0.05
        }
    elif perfil_riesgo == "Moderado":
        return {
            "bonos": 0.4,
            "acciones": 0.4,
            "fondos_mutuos": 0.15,
            "liquidez": 0.05
        }
    else:  # Agresivo
        return {
            "bonos": 0.2,
            "acciones": 0.6,
            "fondos_mutuos": 0.15,
            "liquidez": 0.05
        }
```

## 🎯 Beneficios de la Integración

### Para el Usuario
- ✅ **Visión 360°** de su situación financiera
- ✅ **Recomendaciones personalizadas** basadas en datos reales
- ✅ **Optimización automática** de decisiones financieras
- ✅ **Seguimiento integrado** de progreso

### Para el Sistema
- ✅ **Datos centralizados** y consistentes
- ✅ **Lógica reutilizable** entre módulos
- ✅ **Mantenimiento simplificado**
- ✅ **Escalabilidad mejorada**

## 🧪 Testing de Integración

### Tests Unitarios
```bash
# Tests de servicios individuales
pytest pruebas/test_financiero.py -v
pytest pruebas/test_ahorro_inversion.py -v
pytest pruebas/test_prestamo.py -v
```

### Tests de Integración
```bash
# Tests de flujos completos
pytest pruebas/test_integracion_financiera.py -v
```

### Tests de API
```bash
# Tests de endpoints integrados
pytest pruebas/test_api_integrada.py -v
```

## 📈 Métricas de Éxito

### KPIs de Usuario
- **Tasa de conversión**: Usuarios que completan flujo integrado
- **Satisfacción**: Puntaje de experiencia en dashboard unificado
- **Retención**: Usuarios que regresan después de usar integración

### KPIs Técnicos
- **Tiempo de respuesta**: < 500ms para operaciones integradas
- **Disponibilidad**: 99.9% uptime del sistema integrado
- **Precisión**: > 95% en recomendaciones financieras

## 🚀 Próximos Pasos

### Fase 1: Implementación Base
- [x] Crear servicios integrados
- [x] Implementar APIs compartidas
- [x] Desarrollar dashboard unificado

### Fase 2: Optimización
- [ ] Implementar machine learning para recomendaciones
- [ ] Agregar análisis predictivo
- [ ] Optimizar algoritmos de cálculo

### Fase 3: Expansión
- [ ] Integrar con bancos externos
- [ ] Agregar criptomonedas
- [ ] Implementar asesoría automatizada

## 📞 Contacto

Para preguntas sobre la integración:
- **Equipo Financiero**: responsable de cálculos y algoritmos
- **Equipo ML**: responsable de recomendaciones inteligentes
- **Equipo Frontend**: responsable de dashboard unificado

---

**Estado**: ✅ **Implementado y funcionando**
**Última actualización**: Diciembre 2025
