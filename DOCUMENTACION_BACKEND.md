# 📚 Documentación Técnica del Backend - Econova

**Autor:** Germaín  
**Módulo:** Backend y Algoritmos Financieros  
**Fecha:** Noviembre 2025

---

## 📋 Índice

1. [Arquitectura General](#arquitectura-general)
2. [Servicios Financieros](#servicios-financieros)
3. [API REST Endpoints](#api-rest-endpoints)
4. [Base de Datos](#base-de-datos)
5. [Validaciones](#validaciones)
6. [Pruebas](#pruebas)
7. [Despliegue](#despliegue)

---

## 🏗️ Arquitectura General

### Patrón de Diseño

El backend sigue el patrón **MVC (Model-View-Controller)** adaptado para APIs:

```
├── Modelos (models/)          → Representación de datos y lógica de BD
├── Servicios (servicios/)     → Lógica de negocio
├── Rutas (rutas/)            → Controllers (endpoints REST)
├── Utilidades (utils/)       → Funciones auxiliares
```

### Flujo de una Petición

```
1. Cliente HTTP → 2. Flask Router → 3. Blueprint/Ruta → 4. Validadores
                                                              ↓
8. Respuesta JSON ← 7. Formatear ← 6. Modelo BD ← 5. Servicio
```

### Componentes Principales

#### 1. **Servicios Financieros** (`servicios/financiero_servicio.py`)
- Implementa todos los algoritmos financieros
- Puro Python, sin dependencias de Flask
- Funciones estáticas para fácil testing

#### 2. **Modelos de Datos** (`modelos/`)
- ORM manual con PostgreSQL
- Métodos de clase para CRUD
- Validación en la capa de modelo

#### 3. **Rutas API** (`rutas/`)
- Blueprints de Flask
- Manejo de requests/responses JSON
- Integración con modelos y servicios

#### 4. **Utilidades** (`utils/`)
- Conexión a BD (pool de conexiones)
- Validadores de datos
- Exportadores de resultados

---

## 💰 Servicios Financieros

### Clase `ServicioFinanciero`

Ubicación: `app/servicios/financiero_servicio.py`

#### Métodos Implementados

##### 1. `calcular_van()`

**Propósito:** Calcula el Valor Actual Neto de un proyecto de inversión.

**Parámetros:**
```python
inversion_inicial: float    # Inversión inicial (positiva)
flujos_caja: List[float]   # Flujos de caja por periodo
tasa_descuento: float      # Tasa de descuento (0.10 = 10%)
```

**Retorna:**
```python
{
    'van': float,                      # VAN calculado
    'decision': str,                   # ACEPTAR/RECHAZAR/INDIFERENTE
    'inversion_inicial': float,
    'tasa_descuento': float,
    'flujos_caja': List[float],
    'flujos_descontados': List[float], # Flujos actualizados
    'periodos': int,
    'interpretacion': str              # Explicación en lenguaje natural
}
```

**Ejemplo de uso:**
```python
from app.servicios.financiero_servicio import ServicioFinanciero

resultado = ServicioFinanciero.calcular_van(
    inversion_inicial=100000,
    flujos_caja=[30000, 35000, 40000, 45000, 50000],
    tasa_descuento=0.10
)

print(f"VAN: ${resultado['van']:,.2f}")
print(f"Decisión: {resultado['decision']}")
```

**Fórmula implementada:**
```
VAN = -I₀ + Σ(FCₜ / (1 + r)ᵗ)
```

##### 2. `calcular_tir()`

**Propósito:** Calcula la Tasa Interna de Retorno usando Newton-Raphson.

**Parámetros:**
```python
inversion_inicial: float
flujos_caja: List[float]
tasa_referencia: float = 0.10  # Para comparación
```

**Retorna:**
```python
{
    'tir': float,                  # TIR en decimal
    'tir_porcentaje': float,       # TIR en porcentaje
    'decision': str,               # ACEPTAR/RECHAZAR/NO CALCULABLE
    'tasa_referencia': float,
    'interpretacion': str
}
```

**Nota:** Si no se puede calcular TIR (flujos irregulares), retorna `None` y decision `NO CALCULABLE`.

##### 3. `calcular_wacc()`

**Propósito:** Calcula el Costo Promedio Ponderado de Capital.

**Parámetros:**
```python
capital_propio: float    # Equity
deuda: float            # Debt
costo_capital: float    # Re
costo_deuda: float      # Rd
tasa_impuesto: float    # Tax rate
```

**Retorna:**
```python
{
    'wacc': float,
    'wacc_porcentaje': float,
    'capital_propio': float,
    'deuda': float,
    'valor_total': float,
    'peso_capital': float,
    'peso_deuda': float,
    'escudo_fiscal': float,  # Beneficio fiscal de la deuda
    'interpretacion': str
}
```

##### 4. `analizar_portafolio()`

**Propósito:** Analiza un portafolio de inversión (retorno y riesgo).

**Parámetros:**
```python
retornos: List[float]                    # Retornos esperados
ponderaciones: List[float]               # Pesos (deben sumar 1)
volatilidades: List[float] = None       # Opcional
matriz_correlacion: List[List[float]] = None  # Opcional
```

**Retorna:**
```python
{
    'retorno_esperado': float,
    'retorno_esperado_porcentaje': float,
    'riesgo': float,                    # Si se proporciona matriz
    'ratio_sharpe': float,              # Si se proporciona matriz
    'activos': int,
    'ponderaciones': List[float],
    'interpretacion': str
}
```

##### 5. `analizar_reemplazo_activo()`

**Propósito:** Determina si conviene reemplazar un activo.

**Parámetros:**
```python
costo_actual_anual: float
costo_nuevo_anual: float
costo_nuevo_compra: float
valor_salvamento_actual: float
vida_util_nuevo: int
tasa_descuento: float
```

**Retorna:**
```python
{
    'decision': str,            # REEMPLAZAR/MANTENER ACTUAL
    'van_reemplazo': float,
    'ahorro_anual': float,
    'inversion_neta': float,
    'interpretacion': str
}
```

##### 6. `calcular_periodo_recuperacion()`

**Propósito:** Calcula cuándo se recupera la inversión.

**Parámetros:**
```python
inversion_inicial: float
flujos_caja: List[float]
```

**Retorna:**
```python
{
    'periodo_recuperacion': float,  # En años/periodos
    'se_recupera': bool,
    'interpretacion': str
}
```

---

## 🌐 API REST Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Autenticación
Actualmente no requiere autenticación (en desarrollo).

### Headers Requeridos
```
Content-Type: application/json
```

---

### Endpoints Financieros

#### POST `/financiero/van`

Calcula el VAN de un proyecto.

**Request:**
```json
{
  "inversion_inicial": 100000,
  "flujos_caja": [30000, 35000, 40000, 45000, 50000],
  "tasa_descuento": 0.10,
  "usuario_id": 1,
  "nombre_simulacion": "Proyecto Solar"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "van": 49789.12,
    "decision": "ACEPTAR",
    "inversion_inicial": 100000,
    "tasa_descuento": 0.1,
    "flujos_caja": [30000, 35000, 40000, 45000, 50000],
    "flujos_descontados": [27272.73, 28925.62, 30052.59, 30735.16, 31030.42],
    "periodos": 5,
    "interpretacion": "El proyecto genera $49,789.12 en valor presente",
    "simulacion_id": 1
  },
  "formatted": {
    "tipo_calculo": "Valor Actual Neto (VAN)",
    "fecha_calculo": "2025-11-24T...",
    "van": "$49,789.12",
    "decision": "ACEPTAR PROYECTO"
  }
}
```

**Errores:**
```json
// 400 Bad Request
{
  "error": "Faltan parámetros requeridos: inversion_inicial, flujos_caja"
}

// 400 Bad Request
{
  "error": "Inversión inicial debe ser positivo"
}

// 500 Internal Server Error
{
  "error": "Error interno: [descripción]"
}
```

---

#### POST `/financiero/tir`

Similar a VAN pero calcula la TIR.

---

#### POST `/financiero/wacc`

**Request:**
```json
{
  "capital_propio": 500000,
  "deuda": 300000,
  "costo_capital": 0.15,
  "costo_deuda": 0.08,
  "tasa_impuesto": 0.30,
  "usuario_id": 1
}
```

---

#### POST `/financiero/portafolio`

**Request:**
```json
{
  "retornos": [0.12, 0.15, 0.10],
  "ponderaciones": [0.4, 0.35, 0.25],
  "volatilidades": [0.20, 0.25, 0.15],
  "matriz_correlacion": [
    [1.0, 0.5, 0.3],
    [0.5, 1.0, 0.4],
    [0.3, 0.4, 1.0]
  ]
}
```

---

### Endpoints de Usuarios

#### POST `/usuarios`

Crea un nuevo usuario.

**Request:**
```json
{
  "email": "usuario@example.com",
  "nombre": "Juan Pérez",
  "nivel": "basico"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "usuario_id": 1,
    "email": "usuario@example.com",
    "nombre": "Juan Pérez",
    "nivel": "basico",
    "fecha_registro": "2025-11-24T10:00:00",
    "activo": true
  },
  "message": "Usuario creado exitosamente"
}
```

---

#### GET `/usuarios/{usuario_id}`

Obtiene información de un usuario.

**Response:**
```json
{
  "success": true,
  "data": {
    "usuario_id": 1,
    "email": "usuario@example.com",
    "nombre": "Juan Pérez",
    "nivel": "basico",
    "fecha_registro": "2025-11-24T10:00:00",
    "activo": true
  }
}
```

---

#### GET `/usuarios/{usuario_id}/estadisticas`

Obtiene estadísticas completas del usuario.

**Response:**
```json
{
  "success": true,
  "data": {
    "usuario_id": 1,
    "nombre": "Juan Pérez",
    "nivel": "basico",
    "total_simulaciones": 5,
    "tipos_usados": 3,
    "logros": [
      {
        "logro_id": 1,
        "nombre": "¡Bienvenido!",
        "puntos": 5,
        "fecha_obtencion": "2025-11-24T10:00:00"
      }
    ],
    "total_logros": 3,
    "puntos_totales": 35
  }
}
```

---

#### GET `/usuarios/{usuario_id}/logros`

Lista los logros de un usuario.

---

#### PUT `/usuarios/{usuario_id}/nivel`

Actualiza el nivel de un usuario.

**Request:**
```json
{
  "nivel": "avanzado"
}
```

---

### Endpoints de Simulaciones

#### GET `/financiero/simulaciones/{simulacion_id}`

Obtiene una simulación por ID.

---

#### GET `/financiero/simulaciones/usuario/{usuario_id}`

Lista simulaciones de un usuario.

**Query params:**
- `tipo`: Filtrar por tipo (VAN, TIR, etc.)
- `limit`: Número máximo de resultados (default: 50)

**Example:**
```
GET /api/v1/financiero/simulaciones/usuario/1?tipo=VAN&limit=10
```

---

## 🗄️ Base de Datos

### Esquema Principal

#### Tabla: `usuarios`

```sql
CREATE TABLE usuarios (
    usuario_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    nivel VARCHAR(20) DEFAULT 'basico',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true
);
```

**Niveles válidos:** `basico`, `avanzado`, `experto`

---

#### Tabla: `simulaciones`

```sql
CREATE TABLE simulaciones (
    simulacion_id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(usuario_id),
    nombre VARCHAR(255) NOT NULL,
    tipo_simulacion VARCHAR(50) NOT NULL,
    parametros JSONB NOT NULL,
    resultados JSONB NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true
);
```

**Tipos válidos:** `VAN`, `TIR`, `WACC`, `PORTAFOLIO`, `REEMPLAZO_ACTIVOS`

**Campo JSONB `parametros`:** Almacena todos los inputs de la simulación.
**Campo JSONB `resultados`:** Almacena todos los outputs calculados.

---

#### Tabla: `logros`

```sql
CREATE TABLE logros (
    logro_id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(usuario_id),
    tipo_logro VARCHAR(100) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    puntos INTEGER DEFAULT 10,
    fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, tipo_logro)
);
```

**Tipos de logros:**
- `bienvenida`: Registro en la plataforma (5 pts)
- `primera_simulacion`: Primera simulación (10 pts)
- `primera_van`: Primera simulación VAN (10 pts)
- `primera_tir`: Primera simulación TIR (10 pts)
- `primera_wacc`: Primera simulación WACC (15 pts)
- `primera_portafolio`: Primera simulación de portafolio (15 pts)
- `cinco_simulaciones`: 5 simulaciones completadas (25 pts)
- `experto`: Alcanzar nivel experto (50 pts)

---

### Pool de Conexiones

La clase `DatabaseManager` (`utils/base_datos.py`) maneja un pool de conexiones:

```python
from app.utils.base_datos import DatabaseManager

# Inicializar pool (automático en app startup)
DatabaseManager.initialize_pool(minconn=1, maxconn=10)

# Usar conexión
with DatabaseManager.get_cursor() as cursor:
    cursor.execute("SELECT * FROM usuarios WHERE usuario_id = %s", (1,))
    user = cursor.fetchone()

# Cerrar todas las conexiones
DatabaseManager.close_all_connections()
```

---

### Funciones Auxiliares

```python
from app.utils.base_datos import ejecutar_query, ejecutar_query_una_fila, insertar_con_retorno

# Consulta múltiple
usuarios = ejecutar_query("SELECT * FROM usuarios WHERE activo = %s", (True,))

# Consulta una fila
usuario = ejecutar_query_una_fila("SELECT * FROM usuarios WHERE email = %s", ('user@example.com',))

# INSERT con RETURNING
nuevo_usuario = insertar_con_retorno(
    "INSERT INTO usuarios (email, nombre) VALUES (%s, %s) RETURNING *",
    ('new@example.com', 'Nuevo Usuario')
)
```

---

## ✅ Validaciones

### Módulo `utils/validadores.py`

#### Validadores Disponibles

##### `validar_numero_positivo(valor, nombre_campo)`

Valida que un valor sea numérico y positivo.

```python
from app.utils.validadores import validar_numero_positivo

# OK
num = validar_numero_positivo(100, "inversión")  # → 100.0

# Error
num = validar_numero_positivo(-50, "inversión")  # → ValueError
```

---

##### `validar_tasa(tasa, nombre_campo)`

Valida una tasa de interés (0-100% o 0-1).

```python
# Acepta porcentaje
tasa = validar_tasa(10, "tasa")  # → 0.10

# Acepta decimal
tasa = validar_tasa(0.10, "tasa")  # → 0.10

# Error
tasa = validar_tasa(150, "tasa")  # → ValueError (>100%)
```

---

##### `validar_flujos_caja(flujos, nombre_campo)`

Valida lista de flujos de caja.

```python
flujos = validar_flujos_caja([1000, 2000, 3000], "flujos")  # → OK
flujos = validar_flujos_caja([], "flujos")  # → ValueError (vacío)
flujos = validar_flujos_caja("invalid", "flujos")  # → ValueError
```

---

##### `validar_ponderaciones(ponderaciones)`

Valida que las ponderaciones sumen 100% (o 1).

```python
# OK - suma 100%
ponds = validar_ponderaciones([40, 35, 25])  # → [0.4, 0.35, 0.25]

# OK - suma 1
ponds = validar_ponderaciones([0.4, 0.35, 0.25])  # → [0.4, 0.35, 0.25]

# Error
ponds = validar_ponderaciones([0.5, 0.3])  # → ValueError (suma 80%)
```

---

##### `validar_wacc_params(params)`

Valida todos los parámetros necesarios para WACC.

```python
params = {
    'capital_propio': 500000,
    'deuda': 300000,
    'costo_capital': 0.15,
    'costo_deuda': 0.08,
    'tasa_impuesto': 0.30
}

params_validados = validar_wacc_params(params)  # → Dict con valores validados
```

---

## 🧪 Pruebas

### Estructura de Pruebas

```
pruebas/
├── test_financiero.py    # Pruebas de servicios financieros
├── test_rutas.py         # Pruebas de endpoints
├── test_ml.py            # Pruebas de ML (Diego)
└── test_chatbot.py       # Pruebas de chatbot (Ronaldo)
```

### Ejecutar Pruebas

```bash
# Todas las pruebas
pytest pruebas/ -v

# Solo financiero
pytest pruebas/test_financiero.py -v

# Con cobertura
pytest --cov=app pruebas/

# Reporte HTML de cobertura
pytest --cov=app --cov-report=html pruebas/
```

### Ejemplo de Prueba

```python
import pytest
from app.servicios.financiero_servicio import ServicioFinanciero

def test_van_positivo():
    resultado = ServicioFinanciero.calcular_van(
        inversion_inicial=100000,
        flujos_caja=[30000, 35000, 40000, 45000, 50000],
        tasa_descuento=0.10
    )
    
    assert resultado['van'] > 0
    assert resultado['decision'] == 'ACEPTAR'

def test_van_validacion():
    with pytest.raises(ValueError):
        ServicioFinanciero.calcular_van(
            inversion_inicial=-1000,  # Negativa
            flujos_caja=[1000, 2000],
            tasa_descuento=0.10
        )
```

---

## 🚀 Despliegue

### Variables de Entorno para Producción

```env
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=tu-secret-key-muy-segura-aqui

DB_HOST=tu-host-postgresql.com
DB_PORT=5432
DB_NAME=econova_prod_db
DB_USER=econova_user
DB_PASSWORD=password-segura
```

### Despliegue en Render

1. **Crear cuenta en Render.com**

2. **Conectar repositorio GitHub**

3. **Configurar servicio:**
   - Tipo: Web Service
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn run:app`

4. **Variables de entorno:** Configurar en el dashboard de Render

5. **Base de datos:** Crear PostgreSQL en Render o usar servicio externo

### Despliegue en Heroku

```bash
# Login
heroku login

# Crear app
heroku create econova-api

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configurar variables
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=tu-secret-key

# Deploy
git push heroku main

# Ejecutar migraciones
heroku run psql $DATABASE_URL -f base_datos/esquema.sql
```

---

## 📊 Métricas y Monitoreo

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Econova API",
  "version": "v1"
}
```

### Logs

Los logs se manejan automáticamente por Flask y gunicorn en producción.

---

## 🔒 Seguridad

### Mejores Prácticas Implementadas

1. **Validación de Inputs:** Todos los inputs se validan antes de procesar
2. **SQL Injection:** Uso de queries parametrizadas con psycopg2
3. **CORS:** Configurado correctamente para permitir solo orígenes autorizados
4. **Secrets:** Variables sensibles en `.env` (no en código)
5. **Error Handling:** Errores no revelan información sensible

### Pendientes (para producción):

- [ ] Autenticación JWT
- [ ] Rate limiting
- [ ] Encriptación de passwords
- [ ] HTTPS obligatorio
- [ ] Input sanitization adicional

---

## 📞 Soporte

Para dudas o problemas con el backend:

**Germaín** - Backend y Algoritmos Financieros  
Email: [tu-email]

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0
