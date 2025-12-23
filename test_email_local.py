#!/usr/bin/env python3
"""
Script para probar envío de emails localmente con las mismas credenciales que usa la app
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def test_email_local():
    """Prueba envío de email usando las mismas credenciales que la aplicación"""

    # Credenciales EXACTAMENTE igual que en .env (Gmail)
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    username = "jjgonzaleses@unitru.edu.pe"
    password = "tbswxtvkwhvtkrpe"  # App Password de Gmail
    sender = "jjgonzaleses@unitru.edu.pe"

    print("🧪 PRUEBA LOCAL - MISMA CONFIGURACIÓN QUE LA APP")
    print("=" * 50)
    print(f"Servidor: {smtp_server}:{smtp_port}")
    print(f"Usuario: {username}")
    print(f"Remitente: {sender}")
    print(f"Destinatario: jeff_20_06@hotmail.com")
    print()

    try:
        # Crear mensaje igual que la app
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Test Local - Econova"
        msg['From'] = sender
        msg['To'] = "jeff_20_06@hotmail.com"

        html_content = """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c3e50;">Test Local - Econova</h1>
            <p>Este email se envió desde la máquina local usando las mismas credenciales que la aplicación.</p>
            <p>Si lo recibes, significa que las credenciales funcionan correctamente.</p>
            <p>Hora del envío: """ + str(os.popen('date').read().strip()) + """</p>
        </body>
        </html>
        """

        html_part = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(html_part)

        print("🔌 Conectando a Gmail SMTP...")
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)

        print("🔒 Estableciendo TLS...")
        server.starttls()

        print("🔐 Autenticando...")
        server.login(username, password)

        print("📤 Enviando email...")
        server.sendmail(sender, "jeff_20_06@hotmail.com", msg.as_string())

        server.quit()

        print("✅ ÉXITO: Email enviado correctamente desde local")
        print("📧 Revisa jeff_20_06@hotmail.com")
        print("Si NO llega este email, entonces las credenciales NO funcionan")
        return True

    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ ERROR DE AUTENTICACIÓN: {e}")
        print("La API key es inválida o ha expirado")
        return False

    except smtplib.SMTPConnectError as e:
        print(f"❌ ERROR DE CONEXIÓN: {e}")
        print("No se puede conectar a SendGrid")
        return False

    except Exception as e:
        print(f"❌ ERROR INESPERADO: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = test_email_local()

    print("\n" + "=" * 50)
    if success:
        print("✅ RESULTADO: Las credenciales FUNCIONAN localmente")
        print("Si no llega el email, revisa tu bandeja de spam")
        print("Si llega, entonces el problema está en Render")
    else:
        print("❌ RESULTADO: Las credenciales NO funcionan")
        print("Necesitas generar una nueva API key en SendGrid")
