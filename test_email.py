#!/usr/bin/env python3
"""
Test script to verify email functionality
"""
import sys
import os
sys.path.append('.')

from app.servicios.email_servicio import EmailService
from flask import Flask

# Create a test Flask app
app = Flask(__name__)

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Set up Flask app with environment variables
app.config['SMTP_SERVER'] = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
app.config['SMTP_PORT'] = int(os.getenv('SMTP_PORT', 587))
app.config['SMTP_USERNAME'] = os.getenv('SMTP_USERNAME', '')
app.config['SMTP_PASSWORD'] = os.getenv('SMTP_PASSWORD', '')
app.config['EMAIL_MOCK'] = os.getenv('EMAIL_MOCK', 'false').lower() == 'true'

# Test with Gmail configuration
configs = [
    {
        'name': 'Gmail',
        'MAIL_SERVER': app.config['SMTP_SERVER'],
        'MAIL_PORT': app.config['SMTP_PORT'],
        'MAIL_USE_TLS': True,
        'MAIL_USE_SSL': False,
        'MAIL_USERNAME': app.config['SMTP_USERNAME'],
        'MAIL_PASSWORD': app.config['SMTP_PASSWORD'],
        'MAIL_DEFAULT_SENDER': app.config['SMTP_USERNAME']
    }
]

for config in configs:
    print(f"\n🔄 Testing {config['name']} configuration...")
    app.config.update(config)

    # Initialize email service
    email_service = EmailService(app)

    try:
        with app.app_context():
            result = email_service.enviar_email_confirmacion(
                email='jeff_20_06@hotmail.com',
                nombre_usuario='TestUser',
                token_confirmacion='test-token-123'
            )

        if result:
            print(f"✅ {config['name']}: Email sent successfully!")
            break
        else:
            print(f"❌ {config['name']}: Email sending failed!")

    except Exception as e:
        print(f"❌ {config['name']}: Exception - {e}")

print("\n📋 If all configurations fail, check:")
print("   1. Gmail app password is correct (16 characters)")
print("   2. 2FA is enabled on Gmail account")
print("   3. App password was generated recently")
print("   4. Gmail security settings allow less secure apps")

# Initialize email service
email_service = EmailService(app)

print("🧪 Testing Email Service...")
print("📧 Configuration:")
print(f"  Server: smtp.gmail.com")
print(f"  Port: 587")
print(f"  Username: jean20francisco06@gmail.com")
print(f"  Password: xqcgsxxkkkrgrqfd")

# Test sending email
print("\n📤 Sending test email...")
with app.app_context():
    result = email_service.enviar_email_confirmacion(
        email='jeff_20_06@hotmail.com',  # Send to yourself for testing
        nombre_usuario='TestUser',
        token_confirmacion='test-token-123'
    )

if result:
    print("✅ Email sent successfully!")
    print("📬 Check your Gmail inbox (and spam folder) for the test email")
else:
    print("❌ Email sending failed!")
    print("🔍 Check the error messages above for details")
