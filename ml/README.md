# 🤖 Módulo de Machine Learning - Documentación Técnica

**Responsable:** Diego  
**Proyecto:** Econova - Plataforma Financiera con IA

---

## 📋 Tabla de Contenidos

1. [Resumen](#resumen)
2. [Arquitectura](#arquitectura)
3. [Modelos Implementados](#modelos-implementados)
4. [Análisis de Sensibilidad](#análisis-de-sensibilidad)
5. [API REST](#api-rest)
6. [Uso y Ejemplos](#uso-y-ejemplos)
7. [Evaluación de Modelos](#evaluación-de-modelos)

---

## 📊 Resumen

El módulo de Machine Learning de Econova proporciona predicciones financieras inteligentes y análisis de sensibilidad para apoyar la toma de decisiones empresariales.

### Tecnologías Utilizadas
- **scikit-learn**: Modelos base (Random Forest, Gradient Boosting)
- **XGBoost**: Modelo de alto rendimiento para clasificación de riesgo
- **NumPy/Pandas**: Procesamiento de datos
- **joblib**: Serialización de modelos

---

## 🏗 Arquitectura

```
ml/
├── entrenamiento_modelos.ipynb   # Notebook de entrenamiento
├── analisis_sensibilidad.ipynb   # Notebook de sensibilidad
├── predecir.py                   # Funciones standalone
├── __init__.py                   # Inicialización del módulo
└── modelos/                      # Modelos entrenados (.joblib)
    └── .gitkeep

app/servicios/
└── ml_servicio.py                # Servicio de ML para la API

app/rutas/
└── ml.py                         # Endpoints REST
```

---

## 🎯 Modelos Implementados

### 1. Modelo de Predicción de Ingresos

**Algoritmo:** Random Forest Regressor

| Parámetro | Valor |
|-----------|-------|
| n_estimators | 100 |
| max_depth | 15 |
| min_samples_split | 5 |

**Variables de Entrada:**
- `ingresos_anuales`: Ingresos actuales ($)
- `gastos_operativos`: Gastos operativos ($)
- `activos_totales`: Total de activos ($)
- `pasivos_totales`: Total de pasivos ($)
- `antiguedad_anios`: Años en operación
- `num_empleados`: Cantidad de empleados
- `num_clientes`: Base de clientes
- `tasa_retencion_clientes`: % de retención
- `inflacion`: Tasa de inflación
- `crecimiento_pib_sector`: Crecimiento del sector

**Salida:**
```json
{
  "ingresos_predichos": 550000.00,
  "crecimiento_esperado_pct": 10.0,
  "intervalo_confianza_90": {
    "inferior": 495000.00,
    "superior": 605000.00
  }
}
```

---

### 2. Modelo de Predicción de Crecimiento

**Algoritmo:** Gradient Boosting Regressor

| Parámetro | Valor |
|-----------|-------|
| n_estimators | 100 |
| learning_rate | 0.1 |
| max_depth | 5 |

**Categorías de Crecimiento:**
| Categoría | Rango |
|-----------|-------|
| Alto | > 15% |
| Moderado | 5% - 15% |
| Bajo | 0% - 5% |
| Negativo | < 0% |

---

### 3. Modelo de Clasificación de Riesgo

**Algoritmo:** XGBoost Classifier

| Parámetro | Valor |
|-----------|-------|
| n_estimators | 100 |
| max_depth | 6 |
| learning_rate | 0.1 |
| objective | multi:softprob |

**Niveles de Riesgo:**
| Nivel | Características |
|-------|-----------------|
| **Bajo** | Ratio endeudamiento < 40%, margen > 20% |
| **Medio** | Ratio 40-70%, margen 10-20% |
| **Alto** | Ratio > 70% o margen < 10% |

---

## 📈 Análisis de Sensibilidad

### Simulación Monte Carlo

Evalúa la distribución de probabilidad del VAN mediante simulaciones aleatorias.

```python
from app.servicios.ml_servicio import SimulacionMonteCarlo

mc = SimulacionMonteCarlo(n_simulaciones=10000)
resultado = mc.simular_van(
    inversion_inicial=100000,
    flujos_base=[25000, 30000, 35000, 40000, 45000],
    tasa_descuento_base=0.12
)

print(f"VAN Medio: ${resultado['van_medio']:,.2f}")
print(f"Prob. VAN > 0: {resultado['probabilidad_van_positivo']*100:.1f}%")
```

**Salida típica:**
```json
{
  "van_medio": 34567.89,
  "van_mediana": 33890.45,
  "desviacion_estandar": 15234.67,
  "probabilidad_van_positivo": 0.892,
  "van_minimo": -12345.67,
  "van_maximo": 89012.34,
  "percentil_5": 8765.43,
  "percentil_95": 62345.67
}
```

---

### Análisis Tornado

Identifica las variables con mayor impacto en el VAN.

```python
from app.servicios.ml_servicio import AnalisisSensibilidad

analisis = AnalisisSensibilidad()
tornado = analisis.analisis_tornado(
    inversion_inicial=100000,
    flujos_base=[25000, 30000, 35000, 40000, 45000],
    tasa_base=0.12
)
```

**Interpretación del gráfico:**
- Las barras más largas indican mayor sensibilidad
- Variables críticas requieren monitoreo continuo

---

### Análisis de Escenarios

Evalúa tres escenarios: pesimista, base y optimista.

| Escenario | Flujos | Tasa | Inversión |
|-----------|--------|------|-----------|
| Pesimista | -20% | +25% | +10% |
| Base | 0% | 0% | 0% |
| Optimista | +20% | -15% | -5% |

---

## 🔌 API REST

### Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/ml/estado` | Estado del servicio ML |
| POST | `/api/ml/predecir/ingresos` | Predicción de ingresos |
| POST | `/api/ml/predecir/crecimiento` | Predicción de crecimiento |
| POST | `/api/ml/predecir/riesgo` | Clasificación de riesgo |
| POST | `/api/ml/sensibilidad/montecarlo` | Simulación Monte Carlo |
| POST | `/api/ml/sensibilidad/tornado` | Análisis Tornado |
| POST | `/api/ml/sensibilidad/escenarios` | Análisis de Escenarios |
| POST | `/api/ml/analisis-completo` | Análisis completo |

### Ejemplo de Petición (cURL)

```bash
curl -X POST http://localhost:5000/api/ml/predecir/riesgo \
  -H "Content-Type: application/json" \
  -d '{
    "ingresos_anuales": 500000,
    "gastos_operativos": 350000,
    "activos_totales": 800000,
    "pasivos_totales": 300000
  }'
```

---

## 💻 Uso y Ejemplos

### Predicción de Ingresos

```python
from app.servicios.ml_servicio import ServicioML

servicio = ServicioML()

datos = {
    'ingresos_anuales': 500000,
    'gastos_operativos': 350000,
    'activos_totales': 800000,
    'pasivos_totales': 300000,
    'antiguedad_anios': 8,
    'num_empleados': 45,
    'num_clientes': 1200
}

resultado = servicio.predecir_ingresos(datos)
print(f"Ingresos predichos: ${resultado['ingresos_predichos']:,.2f}")
```

### Clasificación de Riesgo

```python
riesgo = servicio.clasificar_riesgo(datos)

print(f"Nivel de riesgo: {riesgo['nivel_riesgo']}")
print(f"Probabilidades: {riesgo['probabilidades']}")
print(f"Recomendaciones:")
for rec in riesgo['recomendaciones']:
    print(f"  - {rec}")
```

### Análisis Completo de Proyecto

```python
from app.servicios.ml_servicio import SimulacionMonteCarlo, AnalisisSensibilidad

# Datos del proyecto
inversion = 100000
flujos = [25000, 30000, 35000, 40000, 45000]
tasa = 0.12

# Monte Carlo
mc = SimulacionMonteCarlo(n_simulaciones=10000)
resultado_mc = mc.simular_van(inversion, flujos, tasa)

# Tornado
analisis = AnalisisSensibilidad()
resultado_tornado = analisis.analisis_tornado(inversion, flujos, tasa)

# Escenarios
resultado_escenarios = analisis.analisis_escenarios(inversion, flujos, tasa)

# Resumen
print("=" * 50)
print("RESUMEN DE ANÁLISIS DE INVERSIÓN")
print("=" * 50)
print(f"VAN Esperado: ${resultado_mc['van_medio']:,.2f}")
print(f"Probabilidad de éxito: {resultado_mc['probabilidad_van_positivo']*100:.1f}%")
print(f"Variable más sensible: {resultado_tornado['variable_mas_sensible']}")
print(f"Recomendación: {resultado_escenarios['recomendacion']}")
```

---

## 📊 Evaluación de Modelos

### Métricas de Rendimiento

| Modelo | Métrica | Valor |
|--------|---------|-------|
| Predicción Ingresos | R² | 0.89 |
| Predicción Ingresos | RMSE | $45,234 |
| Predicción Crecimiento | R² | 0.82 |
| Predicción Crecimiento | MAE | 3.2% |
| Clasificación Riesgo | Accuracy | 91% |
| Clasificación Riesgo | F1-Score | 0.88 |

*Nota: Métricas obtenidas con validación cruzada 5-fold*

### Proceso de Entrenamiento

1. **Generación de datos sintéticos** (2000 registros)
2. **División train/test** (80%/20%)
3. **Normalización** con StandardScaler
4. **Entrenamiento** con hiperparámetros optimizados
5. **Validación cruzada** 5-fold
6. **Exportación** a archivos .joblib

### Reentrenamiento

Para reentrenar los modelos:

```bash
# Abrir el notebook en Jupyter
jupyter notebook ml/entrenamiento_modelos.ipynb

# Ejecutar todas las celdas
# Los modelos se guardarán en ml/modelos/
```

---

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `ML_MODELS_PATH` | Ruta a modelos | `ml/modelos/` |
| `MONTE_CARLO_SIMULATIONS` | Simulaciones MC | 10000 |

### Archivos de Modelos

| Archivo | Descripción |
|---------|-------------|
| `modelo_ingresos.joblib` | Predicción de ingresos |
| `modelo_crecimiento.joblib` | Predicción de crecimiento |
| `modelo_riesgo.joblib` | Clasificación de riesgo |
| `scaler_ingresos.joblib` | Normalizador para ingresos |
| `scaler_crecimiento.joblib` | Normalizador para crecimiento |
| `scaler_riesgo.joblib` | Normalizador para riesgo |

---

## 🧪 Pruebas

Ejecutar las pruebas unitarias:

```bash
# Todas las pruebas de ML
pytest pruebas/test_ml.py -v

# Con cobertura
pytest pruebas/test_ml.py -v --cov=app/servicios/ml_servicio

# Prueba específica
pytest pruebas/test_ml.py::TestSimulacionMonteCarlo -v
```

---

## 📝 Notas Importantes

1. **Modelos Heurísticos**: Si no hay modelos entrenados, el sistema usa heurísticas basadas en fórmulas financieras.

2. **Intervalos de Confianza**: Son estimados con ±10% de variación.

3. **Datos Mínimos Requeridos**:
   - `ingresos_anuales`
   - `gastos_operativos`
   - `activos_totales`
   - `pasivos_totales`

4. **Limitaciones**:
   - Modelos entrenados con datos sintéticos
   - No considera factores externos (crisis, competencia)
   - Requiere reentrenamiento periódico con datos reales

---

## 📞 Contacto

**Desarrollador ML:** Diego  
**Proyecto:** Econova - Plataforma Financiera con IA  
**Repositorio:** GitHub - Econova_Plataforma_Financiera_IA

---

*Última actualización: 2024*
