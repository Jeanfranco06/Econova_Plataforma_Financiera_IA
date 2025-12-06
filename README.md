# 🌟 ECONOVA - Plataforma Inteligente de Simulación Financiera

[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![Python](https://img.shields.io/badge/python-3.8%2B-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

Econova es una **plataforma web profesional** para análisis financiero y simulación de inversiones, desarrollada con **Python Flask** en el backend y **JavaScript vanilla** con **Bootstrap 5** en el frontend.

---

## 📋 Contenido

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Uso](#uso)
- [Módulos](#módulos)
- [API REST](#api-rest)
- [Documentación](#documentación)
- [Equipo](#equipo)

---

## ✨ Características

### 🎯 Análisis Financieros

| Análisis | Descripción | Uso |
|----------|-------------|-----|
| **VAN** | Valor Actual Neto | Evaluar rentabilidad de proyectos |
| **TIR** | Tasa Interna de Retorno | Calcular tasa de retorno esperada |
| **WACC** | Costo Promedio Ponderado de Capital | Determinar costo de financiamiento |
| **Portafolio** | Análisis de Cartera | Retorno y riesgo de múltiples activos |
| **Reemplazo** | Decisión de Reemplazo de Activos | Evaluar reemplazo vs. mantener |
| **Payback** | Período de Recuperación | Tiempo para recuperar inversión |

### 🎮 Gamificación

- ✅ Sistema de logros y insignias
- ✅ Puntos por simulaciones realizadas
- ✅ Rankings por sector
- ✅ Niveles de usuario (Principiante, Intermedio, Experto)
- ✅ Notificaciones de logros

### 📊 Visualización

- ✅ Gráficos interactivos con Plotly
- ✅ Tablas detalladas de resultados
- ✅ Comparativas de escenarios
- ✅ Exportación a JSON, CSV, PDF

### 🔐 Seguridad

- ✅ Validación de inputs en cliente y servidor
- ✅ CORS configurado
- ✅ Pool de conexiones a BD seguro
- ✅ Queries parametrizadas (sin SQL injection)

---

## 🛠️ Stack Tecnológico

### Backend
```
Python 3.8+
Flask 3.0.0
PostgreSQL 12+
Flask-CORS 4.0.0
psycopg2 (driver PostgreSQL)
python-dotenv (variables de entorno)
pytest (testing)
```

### Frontend
```
HTML5
CSS3
JavaScript (vanilla)
Bootstrap 5
Plotly.js (gráficos)
Font Awesome 6 (iconos)
Jinja2 (template engine)
```

### Herramientas
```
Git / GitHub
VS Code
Postman (testing API)
```

---

## 📁 Estructura del Proyecto

```
Econova_Plataforma_Financiera_IA/
│
├── 📄 README.md                          ← Documentación principal
├── 📄 requirements.txt                   ← Dependencias Python
├── 📄 run.py                             ← Punto de entrada
├── 📄 .env                               ← Variables de entorno
├── 📄 .gitignore                         ← Git ignore
├── 📄 Procfile                           ← Despliegue Render
│
├── 📁 app/                               ← Aplicación Flask
│   ├── __init__.py                       ← Factory de Flask
│   ├── config.py                         ← Configuración (dev/prod/test)
│   │
│   ├── 📁 plantillas/                    ← HTML Templates
│   │   ├── base.html                     ← Plantilla base
│   │   ├── inicio.html                   ← Dashboard
│   │   ├── simulacion.html               ← Formularios
│   │   ├── resultados.html               ← Visualización
│   │   └── chatbot.html                  ← Chat IA
│   │
│   ├── 📁 static/
│   │   ├── 📁 js/
│   │   │   └── api-service.js            ← Servicios JS
│   │   └── 📁 css/
│   │       └── (estilos adicionales)
│   │
│   ├── 📁 modelos/                       ← ORM Manual
│   │   ├── usuario.py                    ← Modelo Usuario
│   │   ├── simulacion.py                 ← Modelo Simulación
│   │   ├── logro.py                      ← Modelo Logros/Insignias
│   │   ├── notificacion.py               ← Modelo Notificación
│   │   └── benchmarking.py               ← Modelo Benchmarking
│   │
│   ├── 📁 servicios/                     ← Lógica de Negocio
│   │   ├── financiero_servicio.py        ← Cálculos VAN/TIR/WACC
│   │   ├── gamification_servicio.py      ← Sistema de logros
│   │   ├── chatbot_servicio.py           ← Integración OpenAI
│   │   ├── ml_servicio.py                ← Predicciones ML
│   │   └── benchmarking_servicio.py      ← Comparativas
│   │
│   ├── 📁 rutas/                         ← Endpoints Flask
│   │   ├── frontend.py                   ← Rutas HTML
│   │   ├── financiero.py                 ← API Financiera
│   │   ├── usuarios.py                   ← API Usuarios
│   │   ├── chatbot.py                    ← API Chatbot
│   │   ├── ml.py                         ← API ML
│   │   └── benchmarking.py               ← API Benchmarking
│   │
│   ├── 📁 utils/                         ← Utilidades
│   │   ├── base_datos.py                 ← Conexión BD
│   │   ├── validadores.py                ← Validaciones
│   │   └── exportar.py                   ← Exportación
│   │
│   └── 📁 docs/
│       └── prompts_chatbot.md            ← Prompts para IA
│
├── 📁 base_datos/                        ← Esquemas SQL
│   ├── esquema.sql                       ← DDL tablas
│   ├── semilla.sql                       ← Datos de prueba
│   ├── init_db.py                        ← Script inicialización
│   └── test_pg.py                        ← Test conexión
│
├── 📁 ml/                                ← Machine Learning
│   ├── entrenamiento_modelos.ipynb       ← Training
│   ├── analisis_sensibilidad.ipynb       ← Análisis
│   └── predecir.py                       ← Predicciones
│
├── 📁 pruebas/                           ← Tests
│   ├── test_financiero.py                ← Tests VAN/TIR/WACC
│   ├── test_ml.py                        ← Tests ML
│   ├── test_chatbot.py                   ← Tests Chatbot
│   ├── test_gamification.py              ← Tests Logros
│   └── test_rutas.py                     ← Tests API
│
├── 📄 DOCUMENTACION_BACKEND.md            ← Docs Backend (Germaín)
├── 📄 DOCUMENTACION_FRONTEND.md           ← Docs Frontend (Gianfranco)
├── 📄 RESUMEN_GERMAIN.md                 ← Resumen Backend
├── 📄 RESUMEN_FRONTEND.md                ← Resumen Frontend
└── 📄 ejemplos_uso.py                    ← Ejemplos de uso
```

---

## 🚀 Instalación

### Prerrequisitos
- Python 3.8+
- PostgreSQL 12+
- Git
- pip / conda

### Pasos

#### 1. Clonar Repositorio
```bash
git clone https://github.com/Jeanfranco06/Econova_Plataforma_Financiera_IA.git
cd Econova_Plataforma_Financiera_IA
```

#### 2. Crear Entorno Virtual
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

#### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
```

#### 4. Configurar Base de Datos
```bash
# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales PostgreSQL
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=econova_db
# DB_USER=postgres
# DB_PASSWORD=tu_contraseña

# Inicializar BD
python base_datos/init_db.py
```

#### 5. Ejecutar Servidor
```bash
python run.py
```

#### 6. Abrir en Navegador
```
http://localhost:5000
```

---

## 💻 Uso

### Dashboard
1. Navega a `http://localhost:5000`
2. Visualiza resumen de estadísticas
3. Accede a simulaciones recientes
4. Selecciona un análisis para comenzar

### Realizar Simulación
1. Click en "Simulación" → Selecciona tipo (VAN, TIR, etc.)
2. Completa el formulario
3. Click "Ejecutar Análisis"
4. Sistema calcula y muestra resultados

### Visualizar Resultados
1. Gráficos interactivos (zoom, pan, hover)
2. Tabla detallada de valores
3. Exportar a JSON/CSV/PDF
4. Comparar con otras simulaciones

---

## 📡 API REST

### Base URL
```
http://localhost:5000/api/v1
```

### Endpoints Principales

#### Usuarios
```
GET    /usuarios/{id}                      → Obtener usuario
GET    /usuarios/{id}/estadisticas         → Estadísticas
GET    /usuarios/{id}/logros               → Logros desbloqueados
POST   /usuarios                           → Crear usuario
PUT    /usuarios/{id}/nivel                → Actualizar nivel
```

#### Financiero
```
POST   /financiero/van                     → Calcular VAN
POST   /financiero/tir                     → Calcular TIR
POST   /financiero/wacc                    → Calcular WACC
POST   /financiero/portafolio              → Analizar Portafolio
POST   /financiero/reemplazo-activo        → Reemplazo Activos
POST   /financiero/periodo-recuperacion    → Payback Period
GET    /financiero/simulaciones/{id}       → Obtener simulación
GET    /financiero/simulaciones/usuario/{id} → Listar simulaciones
```

#### Chatbot
```
POST   /chatbot/mensaje                    → Enviar mensaje
GET    /chatbot/historial/{usuario_id}    → Historial de chat
```

#### ML
```
POST   /ml/predecir                        → Predicción
POST   /ml/analisis-sensibilidad           → Análisis sensibilidad
```

---

## 📚 Documentación

### Para Desarrolladores

- **[DOCUMENTACION_BACKEND.md](DOCUMENTACION_BACKEND.md)** - API, servicios, BD (Germaín)
- **[DOCUMENTACION_FRONTEND.md](DOCUMENTACION_FRONTEND.md)** - HTML, CSS, JS (Gianfranco)
- **[ejemplos_uso.py](ejemplos_uso.py)** - Ejemplos prácticos
- **[Postman Collection](docs/)** - Endpoints para testing

### Resúmenes Ejecutivos

- **[RESUMEN_GERMAIN.md](RESUMEN_GERMAIN.md)** - Módulo Backend
- **[RESUMEN_FRONTEND.md](RESUMEN_FRONTEND.md)** - Módulo Frontend

---

## 👥 Equipo

| Nombre | Rol | Módulo |
|--------|-----|--------|
| **Germaín** | Backend Lead | Financiero, API, BD |
| **Gianfranco** | Frontend Lead | HTML, CSS, JS, UI/UX |
| **Diego** | ML Engineer | Machine Learning, Predicciones |
| **Ronaldo** | Chatbot Dev | IA conversacional, OpenAI |
| **Jeanfranco** | DevOps/BD | Base de Datos, Gamificación |

---

## 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| Líneas Código Python | ~3,500 |
| Líneas Código JS | ~1,100 |
| Líneas HTML | ~2,700 |
| Líneas CSS | ~400 |
| Endpoints API | 20+ |
| Tablas BD | 10 |
| Vistas BD | 3 |
| Tests | 50+ |
| **Total Líneas** | **~7,700** |

---

## 🔒 Seguridad

### Implementado
- ✅ Validación de inputs
- ✅ SQL parametrizadas
- ✅ CORS configurado
- ✅ Rate limiting en BD
- ✅ Sanitización de datos

### Pendiente
- ⏳ Autenticación JWT
- ⏳ HTTPS/SSL
- ⏳ Encriptación de passwords
- ⏳ 2FA
- ⏳ Audit logs

---

## 🚀 Despliegue

### Producción (Render)

```bash
# Crear archivo .env con credenciales
# Commit y push a GitHub
git add .
git commit -m "Deploy a producción"
git push origin main

# En Render.com:
# 1. Conectar repositorio GitHub
# 2. Configurar variables de entorno
# 3. Deploy automático en push
```

### Heroku (alternativo)

```bash
heroku login
heroku create econova-app
git push heroku main
```

---

## 📈 Próximas Mejoras

### Q1 2026
- [ ] Autenticación JWT completa
- [ ] Análisis sensibilidad avanzado
- [ ] Stress testing
- [ ] Reportes PDF profesionales

### Q2 2026
- [ ] App móvil (React Native)
- [ ] Integración con APIs financieras reales
- [ ] Backtest de estrategias
- [ ] Colaboración en tiempo real

### Q3 2026
- [ ] Machine Learning avanzado
- [ ] Predicciones con redes neuronales
- [ ] Dashboard ejecutivo
- [ ] Integración con Excel/Power BI

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para detalles

---

## 📞 Soporte

### Contacto
- **Issues:** GitHub Issues
- **Email:** equipo@econova.com
- **Docs:** [Documentación Técnica](DOCUMENTACION_BACKEND.md)

### FAQ
Ver [docs/FAQ.md](docs/FAQ.md)

---

## 🎯 Roadmap

```
v1.0.0 (Actual)  ✅ Financiero básico, Frontend, BD
v1.1.0 (Próximo) ⏳ Chatbot, Notificaciones, Reportes
v1.2.0           ⏳ ML, Predicciones, Stress Test
v2.0.0           ⏳ App móvil, APIs reales, 2FA
```

---

## 🙏 Agradecimientos

Gracias a todo el equipo por su trabajo en este proyecto:
- 💻 Germaín (Backend)
- 🎨 Gianfranco (Frontend)  
- 🤖 Diego (ML)
- 💬 Ronaldo (Chatbot)
- 📊 Jeanfranco (DevOps)

---

<div align="center">

**Econova v1.0.0** | Plataforma de Simulación Financiera Inteligente

Made with ❤️ by Econova Team

[![GitHub](https://img.shields.io/badge/GitHub-Econova-blue)](https://github.com/Jeanfranco06/Econova_Plataforma_Financiera_IA)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen)]()

</div>
