#!/usr/bin/env python3
"""
Script para probar el envío de emails con SendGrid
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def test_sendgrid():
    """Prueba conexión y envío con SendGrid"""
    # Credenciales del usuario
    smtp_server = "smtp.sendgrid.net"
    smtp_port = 587
    username = "apikey"
    password = os.getenv("SENDGRID_API_KEY", "SG.TU_API_KEY_AQUI")  # Usar variable de entorno

    try:
        print("🔄 PROBANDO CONEXIÓN SENDGRID")
        print(f"Servidor: {smtp_server}:{smtp_port}")
        print(f"Usuario: {username}")

        # Crear mensaje de prueba
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Test Email - Econova"
        msg['From'] = "jjgonzaleses@unitru.edu.pe"  # Usa el email verificado en SendGrid
        msg['To'] = "jeff_20_06@hotmail.com"

        # Contenido simple
        html_content = """
        <html>
        <body>
            <h1>Test Email desde Econova</h1>
            <p>Este es un email de prueba para verificar que SendGrid funciona correctamente.</p>
            <p>Si recibes este email, ¡la configuración es correcta!</p>
        </body>
        </html>
        """

        html_part = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(html_part)

        # Conectar y enviar
        print("🔌 Conectando a SendGrid...")
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
        server.starttls()

        print("🔐 Autenticando...")
        server.login(username, password)

        print("📤 Enviando email de prueba...")
        server.sendmail("jjgonzaleses@unitru.edu.pe", "jeff_20_06@hotmail.com", msg.as_string())

        server.quit()

        print("✅ ÉXITO: Email enviado correctamente")
        print("📧 Revisa tu bandeja de entrada en jeff_20_06@hotmail.com")
        return True

    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ ERROR DE AUTENTICACIÓN: {e}")
        print("La API key de SendGrid no es válida")
        return False

    except smtplib.SMTPConnectError as e:
        print(f"❌ ERROR DE CONEXIÓN: {e}")
        print("No se puede conectar a SendGrid")
        return False

    except Exception as e:
        print(f"❌ ERROR INESPERADO: {e}")
        return False

if __name__ == "__main__":
    print("🧪 TEST DE SENDGRID - ECONOVA")
    print("=" * 40)

    success = test_sendgrid()

    if success:
        print("\n🎉 ¡EXCELENTE! SendGrid funciona correctamente")
        print("La API key es válida y el envío funciona")
    else:
        print("\n❌ SendGrid no funciona con estas credenciales")
        print("Revisa la API key o la configuración")
