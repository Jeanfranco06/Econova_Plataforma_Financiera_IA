import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app, render_template_string
import os

class EmailService:
    """Servicio para envío de emails"""

    def __init__(self, app=None):
        self.mail = None
        self.smtp_server = None
        self.smtp_port = None
        self.username = None
        self.password = None
        self.sender = None
        self.use_mock = False

        if app:
            self.init_app(app)

    def init_app(self, app):
        """Inicializar servicio de email"""
        self.smtp_server = app.config.get('MAIL_SERVER', 'smtp.gmail.com')
        self.smtp_port = app.config.get('MAIL_PORT', 587)
        self.username = app.config.get('MAIL_USERNAME', '')
        self.password = app.config.get('MAIL_PASSWORD', '')
        self.sender = app.config.get('MAIL_USERNAME', 'jean20francisco06@gmail.com')

        # Check if we should use mock mode (for testing)
        self.use_mock = app.config.get('EMAIL_MOCK', False)

        # Force mock mode in production if SMTP credentials are not properly set
        if not self.username or not self.password or self.username == '' or self.password == '':
            print("⚠️ SMTP credentials not properly configured, forcing mock mode")
            self.use_mock = True

        print(f"📧 Email service initialized:")
        print(f"   Server: {self.smtp_server}")
        print(f"   Port: {self.smtp_port}")
        print(f"   Username: {'***' if self.username else 'NOT SET'}")
        print(f"   Password: {'***' if self.password else 'NOT SET'}")
        print(f"   Sender: {self.sender}")
        print(f"   Mock mode: {self.use_mock}")
        print(f"   Base URL: {os.getenv('BASE_URL', os.getenv('RENDER_EXTERNAL_URL', 'http://localhost:5000'))}")

    def _send_email(self, to_email, subject, html_content):
        """Enviar email usando SMTP directo"""
        if self.use_mock:
            print(f"📧 [MOCK] Email enviado a {to_email}")
            print(f"   Asunto: {subject}")
            return True

        try:
            # Crear mensaje con codificación UTF-8
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.sender
            msg['To'] = to_email
            msg['Content-Type'] = 'text/html; charset=UTF-8'

            # Adjuntar contenido HTML con codificación UTF-8
            html_part = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(html_part)

            # Conectar al servidor SMTP
            print(f"🔌 Conectando a {self.smtp_server}:{self.smtp_port}")
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()  # Usar TLS

            # Autenticar
            print(f"🔐 Autenticando como {self.username}")
            server.login(self.username, self.password)

            # Enviar email con codificación UTF-8
            print(f"📤 Enviando email a {to_email}")
            server.sendmail(self.sender, to_email, msg.as_string().encode('utf-8'))
            server.quit()

            print(f"✅ Email enviado exitosamente a {to_email}")
            return True

        except Exception as e:
            print(f"❌ Error enviando email: {e}")
            import traceback
            print(f"📋 Traceback: {traceback.format_exc()}")
            return False

    def enviar_email_confirmacion(self, email, nombre_usuario, token_confirmacion=None):
        """Enviar email de confirmación de registro"""
        try:
            print(f"🔄 ENVIANDO EMAIL DE CONFIRMACIÓN a {email}")
            subject = "¡Bienvenido a Econova! Confirma tu cuenta"

            # URL de confirmación - usar variable de entorno o detectar automáticamente
            base_url = os.getenv('BASE_URL', os.getenv('RENDER_EXTERNAL_URL', 'http://localhost:5000'))
            url_confirmacion = f"{base_url}/api/v1/confirmar/{token_confirmacion or 'placeholder'}"
            print(f"🔗 URL de confirmación: {url_confirmacion}")

            # Template HTML del email
            html_template = """
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Confirma tu cuenta - Econova</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; }
                    .header { background-color: #2c3e50; color: white; padding: 30px 30px; text-align: center; }
                    .content { padding: 30px; }
                    .button { display: inline-block; background-color: #3498db; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 20px 0; }
                    .footer { background-color: #f5f5f5; padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; }
                    .highlight { color: #2c3e50; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 24px;">Bienvenido a Econova</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Plataforma de Simulación Financiera</p>
                    </div>

                    <div class="content">
                        <p>Estimado {{ nombre_usuario }},</p>

                        <p>Gracias por registrarte en <span class="highlight">Econova</span>. Para completar el proceso de registro y activar tu cuenta, es necesario confirmar tu dirección de correo electrónico.</p>

                        <p>Por favor, haz clic en el siguiente enlace para confirmar tu cuenta:</p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{ url_confirmacion }}" class="button">Confirmar Cuenta</a>
                        </div>

                        <p>Una vez confirmada tu cuenta, podrás acceder a todas las funcionalidades de la plataforma, incluyendo:</p>
                        <ul style="margin: 20px 0;">
                            <li>Simulación de VAN, TIR y portafolios de inversión</li>
                            <li>Análisis de sensibilidad con Monte Carlo</li>
                            <li>Benchmarking anónimo con otros empresarios</li>
                            <li>Asistente de IA para interpretación de resultados</li>
                            <li>Reportes y exportación de datos</li>
                        </ul>

                        <p style="color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                            Si no solicitaste este registro, puedes ignorar este mensaje de forma segura.
                        </p>

                        <p style="color: #666; font-size: 12px;">
                            Si el enlace no funciona, copia y pega la siguiente dirección en tu navegador:<br>
                            <span style="word-break: break-all;">{{ url_confirmacion }}</span>
                        </p>
                    </div>

                    <div class="footer">
                        <p><strong>Econova</strong> - Plataforma Inteligente de Simulación Financiera</p>
                        <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
                    </div>
                </div>
            </body>
            </html>
            """

            # Renderizar template
            html_body = render_template_string(html_template,
                                             nombre_usuario=nombre_usuario,
                                             url_confirmacion=url_confirmacion)

            # Enviar email
            return self._send_email(email, subject, html_body)

        except Exception as e:
            print(f"❌ Error en enviar_email_confirmacion: {e}")
            return False

    def enviar_email_bienvenida(self, email, nombre_usuario):
        """Enviar email de bienvenida después de confirmación"""
        try:
            print(f"🔄 ENVIANDO EMAIL DE BIENVENIDA a {email}")
            subject = "¡Tu cuenta ha sido confirmada! - Econova"

            html_template = """
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bienvenido a Econova</title>
                <style>
                    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
                    .content { padding: 40px 30px; }
                    .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                    .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
                    .highlight { color: #10b981; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 28px;">¡Cuenta Confirmada!</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Ya puedes comenzar a usar Econova</p>
                    </div>

                    <div class="content">
                        <h2 style="color: #333; margin-bottom: 20px;">¡Felicitaciones {{ nombre_usuario }}!</h2>

                        <p>Tu cuenta en <span class="highlight">Econova</span> ha sido confirmada exitosamente. Ahora tienes acceso completo a todas nuestras herramientas de simulación financiera.</p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{ base_url }}" class="button">Comenzar a Simular</a>
                        </div>

                        <p><strong>¿Qué puedes hacer ahora?</strong></p>
                        <ul style="margin: 20px 0;">
                            <li>🚀 Crear tu primera simulación financiera</li>
                            <li>💡 Explorar escenarios "qué pasaría si..."</li>
                            <li>📊 Comparar con otros empresarios (benchmarking)</li>
                            <li>🤖 Chatear con nuestro asistente IA</li>
                            <li>📈 Exportar resultados a Excel o Google Sheets</li>
                        </ul>

                        <p style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 30px 0;">
                            <strong>💡 Tip del día:</strong> Comienza con una simulación simple de VAN para familiarizarte con la plataforma. ¡Es más de lo que piensas!
                        </p>

                        <p>Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!</p>

                        <p style="color: #10b981; font-weight: bold; margin-top: 30px;">
                            ¡Bienvenido a la comunidad Econova! 🚀
                        </p>
                    </div>

                    <div class="footer">
                        <p><strong>Econova</strong> - Plataforma Inteligente de Simulación Financiera</p>
                        <p>Empoderando a emprendedores con IA y análisis avanzado</p>
                    </div>
                </div>
            </body>
            </html>
            """

            # URL de bienvenida - usar variable de entorno o detectar automáticamente
            base_url = os.getenv('BASE_URL', os.getenv('RENDER_EXTERNAL_URL', 'http://localhost:5000'))

            html_body = render_template_string(html_template, nombre_usuario=nombre_usuario, base_url=base_url)
            return self._send_email(email, subject, html_body)

        except Exception as e:
            print(f"❌ Error en enviar_email_bienvenida: {e}")
            return False

    def enviar_email_recuperacion(self, email, nombre_usuario, token_recuperacion):
        """Enviar email de recuperación de contraseña"""
        try:
            print(f"🔄 ENVIANDO EMAIL DE RECUPERACIÓN a {email}")
            subject = "Recupera tu contraseña - Econova"

            html_template = """
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recupera tu contraseña - Econova</title>
                <style>
                    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
                    .content { padding: 40px 30px; }
                    .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                    .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
                    .warning { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 28px;">Recupera tu Contraseña</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Te ayudamos a recuperar el acceso a tu cuenta</p>
                    </div>

                    <div class="content">
                        <h2 style="color: #333; margin-bottom: 20px;">Hola {{ nombre_usuario }},</h2>

                        <p>Hemos recibido una solicitud para recuperar la contraseña de tu cuenta en <strong>Econova</strong>.</p>

                        <p>Para crear una nueva contraseña, haz clic en el botón a continuación:</p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{ url_recuperacion }}" class="button">Restablecer Contraseña</a>
                        </div>

                        <div class="warning">
                            <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas por seguridad.
                            Si no solicitaste este cambio, puedes ignorar este email.
                        </div>

                        <p>Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                        <a href="{{ url_recuperacion }}" style="color: #f59e0b; word-break: break-all;">{{ url_recuperacion }}</a></p>
                    </div>

                    <div class="footer">
                        <p><strong>Econova</strong> - Plataforma Inteligente de Simulación Financiera</p>
                        <p>¿Necesitas ayuda? <a href="mailto:soporte@econova.com" style="color: #f59e0b;">Contáctanos</a></p>
                    </div>
                </div>
            </body>
            </html>
            """

            base_url = os.getenv('BASE_URL', os.getenv('RENDER_EXTERNAL_URL', 'http://localhost:5000'))
            url_recuperacion = f"{base_url}/reset-password/{token_recuperacion}"
            html_body = render_template_string(html_template,
                                             nombre_usuario=nombre_usuario,
                                             url_recuperacion=url_recuperacion)

            return self._send_email(email, subject, html_body)

        except Exception as e:
            print(f"❌ Error en enviar_email_recuperacion: {e}")
            return False

# Instancia global del servicio
email_service = EmailService()
