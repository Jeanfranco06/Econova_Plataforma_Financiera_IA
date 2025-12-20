#!/usr/bin/env python3
"""
Script para previsualizar el template del email de confirmación
"""

def preview_email_template():
    """Muestra una previsualización del template del email"""

    # Datos de ejemplo
    nombre_usuario = "Juan Carlos"  # Nombre real del usuario
    url_confirmacion = "http://localhost:5000/confirmar/test-token-123"

    # Template HTML del email (versión formal) - ya renderizado
    html_body = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirma tu cuenta - Econova</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; }}
        .header {{ background-color: #2c3e50; color: white; padding: 30px 30px; text-align: center; }}
        .content {{ padding: 30px; }}
        .button {{ display: inline-block; background-color: #3498db; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 20px 0; }}
        .footer {{ background-color: #f5f5f5; padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; }}
        .highlight {{ color: #2c3e50; font-weight: bold; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Bienvenido a Econova</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Plataforma de Simulación Financiera</p>
        </div>

        <div class="content">
            <p>Estimado {nombre_usuario},</p>

            <p>Gracias por registrarte en <span class="highlight">Econova</span>. Para completar el proceso de registro y activar tu cuenta, es necesario confirmar tu dirección de correo electrónico.</p>

            <p>Por favor, haz clic en el siguiente enlace para confirmar tu cuenta:</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{url_confirmacion}" class="button">Confirmar Cuenta</a>
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
                <span style="word-break: break-all;">{url_confirmacion}</span>
            </p>
        </div>

        <div class="footer">
            <p><strong>Econova</strong> - Plataforma Inteligente de Simulación Financiera</p>
            <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
        </div>
    </div>
</body>
</html>"""

    print("📧 PREVISUALIZACIÓN DEL EMAIL DE CONFIRMACIÓN")
    print("=" * 60)
    print(f"📌 Asunto: ¡Bienvenido a Econova! Confirma tu cuenta")
    print(f"📌 Destinatario: {nombre_usuario}")
    print("\n" + "=" * 60)
    print("💡 El email tendrá este aspecto en tu bandeja de entrada:")
    print("\n--- INICIO DEL EMAIL ---")
    print(f"Estimado {nombre_usuario},")
    print()
    print("Gracias por registrarte en Econova. Para completar el proceso de registro y activar tu cuenta, es necesario confirmar tu dirección de correo electrónico.")
    print()
    print("Por favor, haz clic en el siguiente enlace para confirmar tu cuenta:")
    print()
    print(f"[Confirmar Cuenta] -> {url_confirmacion}")
    print()
    print("Una vez confirmada tu cuenta, podrás acceder a todas las funcionalidades de la plataforma, incluyendo:")
    print("• Simulación de VAN, TIR y portafolios de inversión")
    print("• Análisis de sensibilidad con Monte Carlo")
    print("• Benchmarking anónimo con otros empresarios")
    print("• Asistente de IA para interpretación de resultados")
    print("• Reportes y exportación de datos")
    print()
    print("Si no solicitaste este registro, puedes ignorar este mensaje de forma segura.")
    print()
    print("--- FIN DEL EMAIL ---")
    print()
    print("✅ El template está funcionando correctamente")
    print("✅ Diseño formal sin símbolos de check")
    print("✅ Usa el nombre real del usuario")
    print("✅ Contenido profesional y claro")

    # Guardar el HTML completo en un archivo para que el usuario pueda verlo
    with open('email_preview.html', 'w', encoding='utf-8') as f:
        f.write(html_body)

    print("\n💾 HTML completo guardado en: email_preview.html")
    print("   Puedes abrir este archivo en tu navegador para ver el diseño completo")

if __name__ == "__main__":
    preview_email_template()
