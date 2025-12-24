#!/usr/bin/env python3
"""Test script to check benchmarking database functionality"""

from app import crear_app
from app.modelos.benchmarking import Analisis_Benchmarking
from app.utils.base_datos import get_db_connection

def test_benchmarking_db():
    """Test benchmarking database operations"""
    print("🔍 Testing benchmarking database...")

    # Create app context
    app = crear_app('development')
    with app.app_context():
        # Check if table exists
        db = get_db_connection()
        db.connect()

        try:
            from app.utils.base_datos import USE_POSTGRESQL

            if not USE_POSTGRESQL:
                # SQLite
                db.cur.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="Analisis_Benchmarking"')
                result = db.cur.fetchone()
                table_exists = result is not None
            else:
                # PostgreSQL
                db.cur.execute("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analisis_benchmarking')")
                result = db.cur.fetchone()
                table_exists = result[0] if result else False

            print(f"✅ Table Analisis_Benchmarking exists: {table_exists}")

            # Test inserting data
            test_data = {
                'usuario_id': 1,
                'tipo_analisis': 'sectorial',
                'datos': {'sector': 'Tecnología', 'metricas': {'ingresos': 500000}},
                'resultados': {'ingresos': {'percentil': 75}},
                'recomendaciones': ['Mejorar ingresos']
            }

            print("🔍 Testing data insertion...")
            analisis = Analisis_Benchmarking.guardar_analisis(**test_data)

            if analisis:
                print(f"✅ Analysis saved with ID: {analisis.analisis_id}")

                # Test retrieving data
                print("🔍 Testing data retrieval...")
                retrieved = Analisis_Benchmarking.obtener_analisis_por_id(analisis.analisis_id)

                if retrieved:
                    print(f"✅ Analysis retrieved successfully: {retrieved.tipo_analisis}")
                    print(f"   Datos: {retrieved.datos}")
                    print(f"   Resultados: {retrieved.resultados}")
                else:
                    print("❌ Failed to retrieve analysis")

                # Test getting user analyses
                print("🔍 Testing user analyses retrieval...")
                user_analyses = Analisis_Benchmarking.obtener_analisis_usuario(1, 10)

                print(f"✅ Found {len(user_analyses)} analyses for user 1")

                for analysis in user_analyses:
                    print(f"   - ID {analysis.analisis_id}: {analysis.tipo_analisis}")

            else:
                print("❌ Failed to save analysis")

        except Exception as e:
            print(f"❌ Error testing database: {e}")
            import traceback
            traceback.print_exc()
        finally:
            db.disconnect()

if __name__ == "__main__":
    test_benchmarking_db()
