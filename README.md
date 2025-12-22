# Econova - Plataforma Inteligente de Simulación Financiera

Una plataforma web completa para análisis financiero, simulaciones económicas y asesoramiento con IA.

## 🚀 Características

- **Simulaciones Financieras**: VAN, TIR, WACC, Portafolio de Inversión
- **Asesoramiento con IA**: Chatbot inteligente para consultas financieras
- **Benchmarking**: Comparación con datos del mercado
- **Gamificación**: Sistema de logros y rankings
- **Dashboard Personal**: Seguimiento de simulaciones y resultados
- **Exportación**: Resultados a Excel y Google Sheets

## 🛠️ Tecnologías

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (Tailwind CSS)
- **Base de Datos**: PostgreSQL (producción) / SQLite (desarrollo)
- **IA**: Groq API, OpenAI API
- **Despliegue**: Render

## 📋 Prerrequisitos

- Python 3.9.18
- PostgreSQL (para producción)
- Cuenta en Render
- APIs de IA (Groq/OpenAI)

## 🚀 Despliegue en Render

### 1. Preparar el Repositorio

1. Clona este repositorio:
```bash
git clone https://github.com/tu-usuario/econova.git
cd econova
```

2. Asegúrate de que todos los archivos de despliegue estén presentes:
- `Procfile`
- `runtime.txt`
- `render.yaml`
- `requirements.txt`
- `.env.example`

### 2. Configurar Render

1. Ve a [Render](https://render.com) y crea una cuenta
2. Conecta tu repositorio de GitHub
3. Crea un nuevo **Web Service**
4. Configura los siguientes ajustes:

#### Build Settings:
- **Environment**: `Python 3`
- **Build Command**:
  ```bash
  pip install -r requirements.txt
  python init_render_db.py
  ```
- **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`

#### Environment Variables:
Agrega estas variables en el dashboard de Render:

```bash
# Base de Datos (Render PostgreSQL)
DATABASE_URL=postgresql://econova_db_user:L4HQicH7tn5sMuq8ZlE5CCQlLIU2RxYh@dpg-d54ja0je5dus73bkkllg-a.oregon-postgres.render.com/econova_db

# Configuración Flask
FLASK_ENV=production
SECRET_KEY=tu_clave_secreta_muy_segura_aqui

# APIs de IA
GROQ_API_KEY=tu_clave_groq
OPENAI_API_KEY=tu_clave_openai

# Email (opcional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_password_app

# CORS
CORS_ORIGINS=https://tu-app-render.com

# Otras configuraciones
API_VERSION=1.0.0
```

### 3. Base de Datos

Render proporciona automáticamente una base de datos PostgreSQL. La aplicación detectará automáticamente la variable `DATABASE_URL`.

### 4. Desplegar

1. Haz commit y push de tus cambios:
```bash
git add .
git commit -m "Sistema preparado para despliegue en Render"
git push origin main
```

2. Render detectará los cambios y comenzará el despliegue automáticamente
3. Una vez completado, tu aplicación estará disponible en la URL proporcionada por Render

## 🔧 Configuración Local (Desarrollo)

1. Instala las dependencias:
```bash
pip install -r requirements.txt
```

2. Copia el archivo de ejemplo de variables de entorno:
```bash
cp .env.example .env
```

3. Configura las variables en `.env`:
```bash
# Base de datos local (SQLite)
DATABASE_URL=sqlite:///econova.db

# Configuración Flask
FLASK_ENV=development
SECRET_KEY=tu_clave_desarrollo

# APIs (opcional para desarrollo)
GROQ_API_KEY=tu_clave_groq
OPENAI_API_KEY=tu_clave_openai
```

4. Ejecuta la aplicación:
```bash
python run.py
```

La aplicación estará disponible en `http://localhost:5000`

**Nota:** El script `run.py` configura automáticamente SQLite para desarrollo local si no hay una base de datos PostgreSQL configurada.

## 📁 Estructura del Proyecto

```
econova/
├── app/
│   ├── __init__.py          # Configuración Flask
│   ├── config.py            # Configuraciones
│   ├── modelos/             # Modelos de datos
│   ├── rutas/               # Rutas/endpoints
│   ├── servicios/           # Lógica de negocio
│   ├── plantillas/          # Templates HTML
│   ├── static/              # Archivos estáticos
│   └── utils/               # Utilidades
├── base_datos/              # Scripts SQL
├── ml/                      # Modelos de machine learning
├── pruebas/                 # Tests
├── Procfile                 # Configuración Render
├── runtime.txt             # Versión Python
├── render.yaml             # Config Render
├── requirements.txt        # Dependencias
└── README.md              # Este archivo
```

## 🔐 Variables de Entorno

### Obligatorias:
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `SECRET_KEY`: Clave secreta para sesiones Flask

### Opcionales:
- `GROQ_API_KEY`: API key para Groq (chatbot)
- `OPENAI_API_KEY`: API key para OpenAI
- `MAIL_*`: Configuración de email
- `CORS_ORIGINS`: Orígenes permitidos para CORS

## 🧪 Testing

Ejecuta los tests:
```bash
pytest pruebas/
```

## 📊 API Endpoints

### Autenticación:
- `POST /api/v1/login` - Iniciar sesión
- `POST /api/v1/registro` - Registrar usuario
- `POST /logout` - Cerrar sesión

### Financiero:
- `POST /api/v1/financiero/van` - Calcular VAN
- `POST /api/v1/financiero/tir` - Calcular TIR
- `POST /api/v1/financiero/wacc` - Calcular WACC
- `POST /api/v1/financiero/portafolio` - Analizar portafolio

### Usuario:
- `GET /api/v1/perfil` - Obtener perfil
- `GET /api/v1/dashboard` - Dashboard del usuario

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Email**: tu-email@ejemplo.com
- **GitHub**: [tu-usuario](https://github.com/tu-usuario)
- **LinkedIn**: [Tu Perfil](https://linkedin.com/in/tu-perfil)

---

¡Gracias por usar Econova! 🎉
