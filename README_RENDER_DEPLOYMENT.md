# 🚀 Guía de Despliegue en Render - Econova Plataforma Financiera IA

Esta guía te ayudará a desplegar la aplicación Econova en Render de manera exitosa.

## 📋 Prerrequisitos

- Cuenta activa en [Render](https://render.com)
- Repositorio en GitHub con el código de Econova
- API Keys necesarias (Groq, OpenAI opcional)

## 🗄️ Paso 1: Configurar PostgreSQL en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Crea un nuevo servicio PostgreSQL:
   - **Service Type**: PostgreSQL
   - **Name**: `econova-db` (o el nombre que prefieras)
   - **Database**: `econova_db`
   - **User**: `econova_user`
3. Espera a que se cree la base de datos
4. Copia la **External Database URL** (tendrá el formato: `postgresql://user:password@host:port/database`)

## 🔑 Paso 2: Obtener API Keys

### Groq API (Requerido)
1. Ve a [Groq Console](https://console.groq.com/)
2. Crea una cuenta y genera una API Key
3. Copia la clave (formato: `gsk_...`)

### OpenAI API (Opcional)
1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea una cuenta y genera una API Key
3. Copia la clave (formato: `sk-...`)

## 🌐 Paso 3: Crear Servicio Web en Render

1. En Render Dashboard, crea un nuevo **Web Service**
2. Conecta tu repositorio de GitHub
3. Configura el servicio:
   - **Name**: `econova-plataforma`
   - **Runtime**: Python 3
   - **Build Command**: Se ejecuta automáticamente desde `render.yaml`
   - **Start Command**: Se ejecuta automáticamente desde `render.yaml`

## ⚙️ Paso 4: Configurar Variables de Entorno

En la sección **Environment** del servicio web, agrega estas variables:

### Variables Requeridas
```bash
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/database
SECRET_KEY=tu_clave_secreta_muy_segura_de_al_menos_32_caracteres
GROQ_API_KEY=gsk_tu_clave_api_de_groq_aqui
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_password_de_aplicacion_de_gmail
CORS_ORIGINS=https://tu-app.onrender.com
```

### Variables Opcionales
```bash
OPENAI_API_KEY=sk-tu_clave_api_de_openai_aqui
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890
GOOGLE_SHEETS_CREDENTIALS_PATH=/path/to/credentials.json
```

## 🔐 Paso 5: Configurar Email (Gmail)

Para usar Gmail como servidor de email:

1. Ve a [Google Account Settings](https://myaccount.google.com/)
2. Activa la **verificación en 2 pasos**
3. Genera una **contraseña de aplicación**:
   - Ve a "Seguridad" > "Contraseñas de aplicaciones"
   - Selecciona "Correo" y "Otro"
   - Copia la contraseña generada (16 caracteres)
4. Usa esta contraseña en `MAIL_PASSWORD`

## 🚀 Paso 6: Desplegar

1. Haz commit y push de todos los cambios a GitHub
2. En Render, el despliegue se iniciará automáticamente
3. Monitorea los logs en tiempo real
4. Una vez completado, obtén la URL de tu aplicación

## ✅ Paso 7: Verificar Despliegue

Después del despliegue, verifica que todo funcione:

1. **Health Check**: Visita `https://tu-app.onrender.com/health`
2. **Página Principal**: `https://tu-app.onrender.com/`
3. **Registro/Login**: Prueba crear una cuenta
4. **Chatbot**: Verifica que responda
5. **Calculadoras**: Prueba las funciones financieras

## 🐛 Solución de Problemas

### Error de Base de Datos
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate de que la base de datos PostgreSQL esté activa

### Error de API Keys
- Verifica que `GROQ_API_KEY` sea válida
- Comprueba que las APIs estén activas

### Error de Email
- Confirma que usas la contraseña de aplicación de Gmail
- Verifica que el email esté habilitado para "acceso de aplicaciones menos seguras"

### Logs de Error
- Revisa los logs en Render Dashboard
- Busca mensajes de error específicos
- Usa el script `check_render_deployment.py` localmente para diagnosticar

## 📊 Monitoreo y Mantenimiento

### Health Checks
Render realiza health checks automáticamente en `/health`

### Logs
- Accede a logs en tiempo real desde Render Dashboard
- Configura alertas para errores críticos

### Backups
- Render hace backups automáticos de PostgreSQL
- Configura backups adicionales si es necesario

## 🔄 Actualizaciones

Para actualizar la aplicación:

1. Haz cambios en el código
2. Commit y push a GitHub
3. Render detectará cambios y redeploy automáticamente
4. O forza un redeploy manual desde el dashboard

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en Render
2. Verifica la configuración de variables de entorno
3. Usa el script de verificación local
4. Consulta la documentación de Render

## 🎯 Checklist Final

- [ ] PostgreSQL creado en Render
- [ ] API Keys obtenidas (Groq, OpenAI opcional)
- [ ] Servicio web creado en Render
- [ ] Variables de entorno configuradas
- [ ] Email configurado
- [ ] Despliegue completado exitosamente
- [ ] Funcionalidades verificadas
- [ ] Backups configurados

¡Felicitaciones! 🎉 Tu aplicación Econova está ahora desplegada en Render.

---

**Nota**: Esta configuración está optimizada para producción. Para desarrollo local, usa `run.py` o configura un entorno SQLite.
