#!/usr/bin/env python3
"""
Script to debug the login process
"""

import os
import sys
sys.path.append('.')

# Set up environment
os.environ['FLASK_ENV'] = 'development'
os.environ['DB_NAME'] = 'econova.db'

from app import crear_app

def test_login():
    """Test the login process manually"""
    app = crear_app('development')

    with app.app_context():
        from app.modelos.usuario import Usuario

        # First, let's check if we can find the user
        email = 'jjgonzaleses@unitru.edu.pe'
        print(f"🔍 Looking up user by email: {email}")

        try:
            usuario = Usuario.obtener_usuario_por_email(email)
            if usuario:
                print(f"✅ User found: ID {usuario.usuario_id}, Email: {usuario.email}, Confirmed: {usuario.email_confirmado}")
                print(f"   Password hash exists: {usuario.password_hash is not None}")
            else:
                print(f"❌ User not found")
                return
        except Exception as e:
            print(f"❌ Error looking up user: {e}")
            import traceback
            print(f"📋 Traceback: {traceback.format_exc()}")
            return

        # Test data - we'll need the correct password
        test_data = {
            'email_username': email,
            'password': 'somepassword'  # We don't know the actual password
        }

        print(f"🔍 Testing login API call (this will likely fail due to wrong password)")

        # Simulate the login API call
        with app.test_client() as client:
            response = client.post('/api/v1/login', json=test_data)
            print(f"Response status: {response.status_code}")
            print(f"Response data: {response.get_json()}")

if __name__ == "__main__":
    test_login()
