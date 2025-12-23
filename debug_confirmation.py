#!/usr/bin/env python3
"""
Script to debug the confirmation process
"""

import os
import sys
sys.path.append('.')

# Set up environment
os.environ['FLASK_ENV'] = 'development'
os.environ['DB_NAME'] = 'econova.db'

from app import crear_app
from app.utils.base_datos import get_db_connection

def adapt_query(query):
    """Adaptar consulta SQL para el tipo de base de datos"""
    from app.utils.base_datos import USE_POSTGRESQL
    if USE_POSTGRESQL:
        return query
    else:
        # SQLite: cambiar %s por ?
        return query.replace('%s', '?')

def test_confirmation():
    """Test the confirmation process manually"""
    app = crear_app('development')

    with app.app_context():
        token = 'j-jgZq2dRw3nqq9Cz8fE1dDH5OJa_JzKlKmTBcvxOg4'

        print(f"🔍 Testing confirmation for token: '{token}'")

        # Find user by confirmation token
        db = get_db_connection()
        query = adapt_query("SELECT * FROM Usuarios WHERE confirmation_token = %s")
        print(f"🔍 Query: {query}")

        try:
            db.connect()
            result = db.execute_query(query, (token,), fetch=True)
            print(f"🔍 Query result: {result}")

            if not result:
                print(f"❌ No user found with token '{token}'")
                return

            usuario_data = result[0]
            usuario_id = usuario_data['usuario_id']
            email = usuario_data['email']
            print(f"✅ Found user ID {usuario_id} with email {email}")

            # Check if already confirmed
            email_confirmado = usuario_data.get('email_confirmado')
            print(f"🔍 Current email_confirmado status: {email_confirmado} (type: {type(email_confirmado)})")

            # Convert boolean if needed
            if isinstance(email_confirmado, int):
                email_confirmado = bool(email_confirmado)

            if email_confirmado:
                print(f"ℹ️ User {usuario_id} already confirmed")
                return

            # Update user as confirmed
            update_query = adapt_query("UPDATE Usuarios SET email_confirmado = 1, confirmation_token = NULL WHERE usuario_id = %s")
            print(f"🔄 Updating user {usuario_id} to confirmed")
            print(f"🔄 Update query: {update_query}")

            success = db.execute_query(update_query, (usuario_id,))
            print(f"🔄 Update result: {success}")

            if success:
                db.commit()
                print(f"✅ User {usuario_id} confirmed successfully")
            else:
                print(f"❌ Update failed for user {usuario_id}")
                db.rollback()

        except Exception as e:
            print(f"❌ Exception during confirmation: {e}")
            import traceback
            print(f"📋 Traceback: {traceback.format_exc()}")
            db.rollback()
        finally:
            db.disconnect()

if __name__ == "__main__":
    test_confirmation()
