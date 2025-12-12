"""
Script de Entrenamiento de Modelos ML - Diego
Ejecutar: python entrenar_modelos.py
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import xgboost as xgb
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("🤖 ENTRENAMIENTO DE MODELOS ML - ECONOVA")
print("   Responsable: Diego")
print("=" * 60)

# Crear directorio para modelos si no existe
os.makedirs('ml/modelos', exist_ok=True)

# ============================================================================
# 1. GENERAR DATOS SINTÉTICOS
# ============================================================================
print("\n📊 Generando datos sintéticos de entrenamiento...")

np.random.seed(42)
n_samples = 2000

# Variables de entrada
datos = {
    'ingresos_anuales': np.random.uniform(50000, 5000000, n_samples),
    'gastos_operativos': np.random.uniform(30000, 4000000, n_samples),
    'activos_totales': np.random.uniform(100000, 10000000, n_samples),
    'pasivos_totales': np.random.uniform(20000, 8000000, n_samples),
    'antiguedad_anios': np.random.uniform(1, 30, n_samples),
    'num_empleados': np.random.randint(5, 500, n_samples),
    'num_clientes': np.random.randint(50, 10000, n_samples),
    'tasa_retencion_clientes': np.random.uniform(0.5, 0.98, n_samples),
    'inflacion': np.random.uniform(0.02, 0.10, n_samples),
    'tasa_interes_referencia': np.random.uniform(0.03, 0.15, n_samples),
    'crecimiento_pib_sector': np.random.uniform(-0.05, 0.15, n_samples)
}

df = pd.DataFrame(datos)

# Asegurar coherencia en los datos
df['gastos_operativos'] = np.minimum(df['gastos_operativos'], df['ingresos_anuales'] * 0.95)
df['pasivos_totales'] = np.minimum(df['pasivos_totales'], df['activos_totales'] * 0.9)

# Calcular métricas derivadas
df['margen_operativo'] = (df['ingresos_anuales'] - df['gastos_operativos']) / df['ingresos_anuales']
df['ratio_endeudamiento'] = df['pasivos_totales'] / df['activos_totales']
df['productividad_empleado'] = df['ingresos_anuales'] / df['num_empleados']

# Variables objetivo
# Ingresos del próximo año
df['ingresos_proximo_anio'] = (
    df['ingresos_anuales'] * (1 + df['crecimiento_pib_sector']) * 
    (1 + df['margen_operativo'] * 0.3) * 
    (0.8 + df['tasa_retencion_clientes'] * 0.3) +
    np.random.normal(0, df['ingresos_anuales'] * 0.05, n_samples)
)

# Tasa de crecimiento
df['tasa_crecimiento'] = (
    df['crecimiento_pib_sector'] * 0.4 +
    df['margen_operativo'] * 0.3 +
    (1 - df['ratio_endeudamiento']) * 0.2 +
    df['tasa_retencion_clientes'] * 0.1 +
    np.random.normal(0, 0.03, n_samples)
)

# Nivel de riesgo (0=Bajo, 1=Medio, 2=Alto)
score_riesgo = (
    df['ratio_endeudamiento'] * 0.4 +
    (1 - df['margen_operativo']) * 0.3 +
    (1 - df['tasa_retencion_clientes']) * 0.2 +
    df['inflacion'] * 0.1
)
df['nivel_riesgo'] = pd.cut(score_riesgo, bins=3, labels=[0, 1, 2]).astype(int)

print(f"   ✅ {n_samples} registros generados")

# ============================================================================
# 2. PREPARAR FEATURES
# ============================================================================
print("\n🔧 Preparando features...")

features = [
    'ingresos_anuales', 'gastos_operativos', 'activos_totales', 'pasivos_totales',
    'antiguedad_anios', 'num_empleados', 'num_clientes', 'tasa_retencion_clientes',
    'inflacion', 'tasa_interes_referencia', 'crecimiento_pib_sector',
    'margen_operativo', 'ratio_endeudamiento', 'productividad_empleado'
]

X = df[features]
print(f"   ✅ {len(features)} features")

# ============================================================================
# 3. MODELO DE PREDICCIÓN DE INGRESOS
# ============================================================================
print("\n" + "=" * 60)
print("📈 MODELO 1: PREDICCIÓN DE INGRESOS")
print("=" * 60)

y_ingresos = df['ingresos_proximo_anio']
X_train, X_test, y_train, y_test = train_test_split(X, y_ingresos, test_size=0.2, random_state=42)

# Normalizar
scaler_ingresos = StandardScaler()
X_train_scaled = scaler_ingresos.fit_transform(X_train)
X_test_scaled = scaler_ingresos.transform(X_test)

# Entrenar Random Forest
print("   Entrenando Random Forest...")
modelo_ingresos = RandomForestRegressor(
    n_estimators=100,
    max_depth=15,
    min_samples_split=5,
    random_state=42,
    n_jobs=-1
)
modelo_ingresos.fit(X_train_scaled, y_train)

# Evaluar
y_pred = modelo_ingresos.predict(X_test_scaled)
r2 = r2_score(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)

print(f"   R² Score: {r2:.4f}")
print(f"   RMSE: ${rmse:,.2f}")
print(f"   MAE: ${mae:,.2f}")

# Validación cruzada
cv_scores = cross_val_score(modelo_ingresos, X_train_scaled, y_train, cv=5, scoring='r2')
print(f"   CV R² (5-fold): {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")

# Guardar
joblib.dump(modelo_ingresos, 'ml/modelos/modelo_ingresos.joblib')
joblib.dump(scaler_ingresos, 'ml/modelos/scaler_ingresos.joblib')
print("   ✅ Modelo guardado en ml/modelos/modelo_ingresos.joblib")

# ============================================================================
# 4. MODELO DE PREDICCIÓN DE CRECIMIENTO
# ============================================================================
print("\n" + "=" * 60)
print("📊 MODELO 2: PREDICCIÓN DE CRECIMIENTO")
print("=" * 60)

y_crecimiento = df['tasa_crecimiento']
X_train, X_test, y_train, y_test = train_test_split(X, y_crecimiento, test_size=0.2, random_state=42)

# Normalizar
scaler_crecimiento = StandardScaler()
X_train_scaled = scaler_crecimiento.fit_transform(X_train)
X_test_scaled = scaler_crecimiento.transform(X_test)

# Entrenar Gradient Boosting
print("   Entrenando Gradient Boosting...")
modelo_crecimiento = GradientBoostingRegressor(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42
)
modelo_crecimiento.fit(X_train_scaled, y_train)

# Evaluar
y_pred = modelo_crecimiento.predict(X_test_scaled)
r2 = r2_score(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)

print(f"   R² Score: {r2:.4f}")
print(f"   RMSE: {rmse:.4f}")
print(f"   MAE: {mae:.4f}")

# Validación cruzada
cv_scores = cross_val_score(modelo_crecimiento, X_train_scaled, y_train, cv=5, scoring='r2')
print(f"   CV R² (5-fold): {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")

# Guardar
joblib.dump(modelo_crecimiento, 'ml/modelos/modelo_crecimiento.joblib')
joblib.dump(scaler_crecimiento, 'ml/modelos/scaler_crecimiento.joblib')
print("   ✅ Modelo guardado en ml/modelos/modelo_crecimiento.joblib")

# ============================================================================
# 5. MODELO DE CLASIFICACIÓN DE RIESGO
# ============================================================================
print("\n" + "=" * 60)
print("⚠️  MODELO 3: CLASIFICACIÓN DE RIESGO (XGBoost)")
print("=" * 60)

y_riesgo = df['nivel_riesgo']
X_train, X_test, y_train, y_test = train_test_split(X, y_riesgo, test_size=0.2, random_state=42)

# Normalizar
scaler_riesgo = StandardScaler()
X_train_scaled = scaler_riesgo.fit_transform(X_train)
X_test_scaled = scaler_riesgo.transform(X_test)

# Entrenar XGBoost
print("   Entrenando XGBoost Classifier...")
modelo_riesgo = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    objective='multi:softprob',
    num_class=3,
    random_state=42,
    use_label_encoder=False,
    eval_metric='mlogloss'
)
modelo_riesgo.fit(X_train_scaled, y_train)

# Evaluar
y_pred = modelo_riesgo.predict(X_test_scaled)
from sklearn.metrics import accuracy_score, classification_report
accuracy = accuracy_score(y_test, y_pred)

print(f"   Accuracy: {accuracy:.4f}")
print("\n   Classification Report:")
print(classification_report(y_test, y_pred, target_names=['Bajo', 'Medio', 'Alto']))

# Guardar
joblib.dump(modelo_riesgo, 'ml/modelos/modelo_riesgo.joblib')
joblib.dump(scaler_riesgo, 'ml/modelos/scaler_riesgo.joblib')
print("   ✅ Modelo guardado en ml/modelos/modelo_riesgo.joblib")

# ============================================================================
# 6. GUARDAR LISTA DE FEATURES
# ============================================================================
joblib.dump(features, 'ml/modelos/features.joblib')

# ============================================================================
# RESUMEN FINAL
# ============================================================================
print("\n" + "=" * 60)
print("✅ ENTRENAMIENTO COMPLETADO")
print("=" * 60)
print("\nModelos guardados en ml/modelos/:")
for f in os.listdir('ml/modelos'):
    size = os.path.getsize(f'ml/modelos/{f}') / 1024
    print(f"   📁 {f} ({size:.1f} KB)")

print("\n🎉 ¡Modelos listos para usar en producción!")
