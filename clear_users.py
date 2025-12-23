#!/usr/bin/env python3
"""
Script to clear all users from the database
"""

import os
import sys
sys.path.append('.')

# Set up environment
os.environ['FLASK_ENV'] = 'development'
os.environ['DB_NAME'] = 'econova.db'

from app import crear_app
from app.utils.base_datos import get_db_connection

def clear_all_users():
    """Delete all users from the database"""
    app = crear_app('development')

    with app.app_context():
        db = get_db_connection()

        try:
            db.connect()

            # Get count before deletion
            result = db.execute_query("SELECT COUNT(*) as count FROM Usuarios", fetch=True)
            count_before = result[0]['count'] if result else 0

            print(f"📊 Users before deletion: {count_before}")

            # Delete all users
            db.execute_query("DELETE FROM Usuarios")
            db.commit()

            # Get count after deletion
            result = db.execute_query("SELECT COUNT(*) as count FROM Usuarios", fetch=True)
            count_after = result[0]['count'] if result else 0

            print(f"🗑️  Users deleted: {count_before - count_after}")
            print(f"📊 Users remaining: {count_after}")
            print("✅ All users cleared successfully!")

        except Exception as e:
            print(f"❌ Error clearing users: {e}")
            db.rollback()
        finally:
            db.disconnect()

if __name__ == "__main__":
    clear_all_users()
