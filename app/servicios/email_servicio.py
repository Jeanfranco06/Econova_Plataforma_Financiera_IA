from flask import current_app, render_template_string
from flask_mail import Mail, Message
import os

class EmailService:
    """Servicio para envío de emails"""

    def __init__(self, app=None):
        self.mail = None
        if app:
            self.init_app(app)

    def init_app(self, app):
        """Inicializar Flask-Mail con la aplicación"""
        app.config['MAIL_SERVER'] = app.config.get('SMTP_SERVER', 'smtp.gmail.com')
        app.config['MAIL_PORT'] = app.config.get('SMTP_PORT', 587)
        app.config['MAIL_USE_TLS'] = True
        app.config['MAIL_USE_SSL'] = False
        app.config['MAIL_USERNAME'] = app.config.get('SMTP_USERNAME', '')
        app.config['MAIL_PASSWORD'] = app.config.get('SMTP_PASSWORD', '')
        app.config['MAIL_DEFAULT_SENDER'] = app.config.get('SMTP_USERNAME', 'noreply@econova.com')

        self.mail = Mail(app)

    def enviar_email_confirmacion(self, email, nombre_usuario, token_confirmacion=None):
        """Enviar email de confirmación de registro"""
        try:
            subject = "¡Bienvenido a Econova! Confirma tu cuenta"

            # Template HTML del email (versión formal)
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

            # URL de confirmación (con el prefijo correcto de la API)
            url_confirmacion = f"http://localhost:5000/api/v1/confirmar/{token_confirmacion or 'placeholder'}"

            # Renderizar template
            html_body = render_template_string(html_template,
                                             nombre_usuario=nombre_usuario,
                                             url_confirmacion=url_confirmacion)

            # Crear mensaje
            msg = Message(
                subject=subject,
                recipients=[email],
                html=html_body
            )

            # Enviar email
            if self.mail:
                self.mail.send(msg)
                print(f"Email de confirmación enviado a {email}")
                return True
            else:
                print("Error: Servicio de email no inicializado")
                return False

        except Exception as e:
            print(f"Error enviando email de confirmación: {e}")
            return False

    def enviar_email_bienvenida(self, email, nombre_usuario):
        """Enviar email de bienvenida después de confirmación"""
        try:
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
                            <a href="http://localhost:5000" class="button">Comenzar a Simular</a>
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
                            <strong>💡 Tip del día:</strong> Comienza con una simulación simple de VAN para familiarizarte con la plataforma. ¡Es más fácil de lo que piensas!
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

            html_body = render_template_string(html_template, nombre_usuario=nombre_usuario)

            msg = Message(
                subject=subject,
                recipients=[email],
                html=html_body
            )

            if self.mail:
                self.mail.send(msg)
                print(f"Email de bienvenida enviado a {email}")
                return True
            else:
                print("Error: Servicio de email no inicializado")
                return False

        except Exception as e:
            print(f"Error enviando email de bienvenida: {e}")
            return False

    def enviar_email_recuperacion(self, email, nombre_usuario, token_recuperacion):
        """Enviar email de recuperación de contraseña"""
        try:
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

            url_recuperacion = f"http://localhost:5000/reset-password/{token_recuperacion}"
            html_body = render_template_string(html_template,
                                             nombre_usuario=nombre_usuario,
                                             url_recuperacion=url_recuperacion)

            msg = Message(
                subject=subject,
                recipients=[email],
                html=html_body
            )

            if self.mail:
                self.mail.send(msg)
                print(f"Email de recuperación enviado a {email}")
                return True
            else:
                print("Error: Servicio de email no inicializado")
                return False

        except Exception as e:
            print(f"Error enviando email de recuperación: {e}")
            return False

# Instancia global del servicio
email_service = EmailService()
