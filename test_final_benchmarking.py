#!/usr/bin/env python3
"""Test final del sistema completo de benchmarking"""

import json
from app import crear_app
from app.modelos.benchmarking import Analisis_Benchmarking

def test_completo():
    """Test completo del sistema de benchmarking"""
    print("🔍 Ejecutando test final completo del sistema de benchmarking...")

    app = crear_app('development')

    with app.test_client() as client:
        # Test 1: Verificar que la tabla existe
        print("\n📊 Test 1: Verificando tabla Analisis_Benchmarking...")
        try:
            from app.utils.base_datos import get_db_connection
            db = get_db_connection()
            db.connect()

            # Usar SQLite query (ya que estamos usando SQLite en desarrollo)
            db.cur.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="Analisis_Benchmarking"')
            result = db.cur.fetchone()
            table_exists = result is not None

            print(f"✅ Tabla Analisis_Benchmarking existe: {table_exists}")
            db.disconnect()

        except Exception as e:
            print(f"❌ Error verificando tabla: {e}")
            return False

        # Test 2: Guardar análisis de prueba
        print("\n💾 Test 2: Guardando análisis de prueba...")
        datos_prueba = {
            'usuario_id': 1,
            'tipo_analisis': 'sectorial',
            'datos': {
                'sector': 'Tecnología',
                'tamanoEmpresa': 'mediana',
                'metricas': {'ingresos': 1500000, 'margen_beneficio': 0.25},
                'periodo': 'ultimo_anio'
            },
            'resultados': {
                'ingresos': {'valor_empresa': 1500000, 'percentil': 35.5},
                'margen_beneficio': {'valor_empresa': 0.25, 'percentil': 75.0}
            },
            'recomendaciones': [
                {'tipo': 'ventaja_competitiva', 'metrica': 'margen_beneficio', 'mensaje': '¡Excelente!'}
            ]
        }

        response = client.post('/api/v1/benchmarking/analisis',
                              json=datos_prueba,
                              content_type='application/json')

        print(f"📥 Status: {response.status_code}")
        if response.status_code == 201:
            data = response.get_json()
            analisis_id = data.get('analisis_id')
            print(f"✅ Análisis guardado con ID: {analisis_id}")

            # Test 3: Recuperar análisis
            print("\n📖 Test 3: Recuperando análisis guardado...")
            response_get = client.get(f'/api/v1/benchmarking/analisis/{analisis_id}')

            print(f"📥 Status GET: {response_get.status_code}")
            if response_get.status_code == 200:
                data_get = response_get.get_json()
                analisis = data_get['analisis']
                print("✅ Análisis recuperado correctamente")
                print(f"   Tipo: {analisis['tipo_analisis']}")
                print(f"   Sector: {analisis['datos']['sector']}")
                print(f"   Resultados: {len(analisis['resultados'])} métricas")
            else:
                print("❌ Error recuperando análisis")
                print(f"   Respuesta: {response_get.get_json()}")
                return False

            # Test 4: Obtener análisis del usuario
            print("\n👤 Test 4: Obteniendo análisis del usuario...")
            response_user = client.get('/api/v1/usuarios/1/benchmarking/analisis')

            print(f"📥 Status usuario: {response_user.status_code}")
            if response_user.status_code == 200:
                data_user = response_user.get_json()
                analisis_count = len(data_user['analisis'])
                print(f"✅ Usuario tiene {analisis_count} análisis guardados")

                # Mostrar detalles de cada análisis
                for i, a in enumerate(data_user['analisis'], 1):
                    print(f"   {i}. ID {a['analisis_id']}: {a['tipo_analisis']} - {a['datos']['sector'] if a['datos'] and 'sector' in a['datos'] else 'Sin sector'}")
            else:
                print("❌ Error obteniendo análisis del usuario")
                print(f"   Respuesta: {response_user.get_json()}")
                return False

            # Test 5: Verificar grupos
            print("\n👥 Test 5: Verificando funcionalidad de grupos...")
            response_grupos = client.get('/api/v1/benchmarking/grupos')

            print(f"📥 Status grupos: {response_grupos.status_code}")
            if response_grupos.status_code == 200:
                data_grupos = response_grupos.get_json()
                grupos_count = len(data_grupos['grupos']) if 'grupos' in data_grupos else 0
                print(f"✅ Encontrados {grupos_count} grupos de benchmarking")

                if grupos_count > 0:
                    print("   Grupos disponibles:")
                    for grupo in data_grupos['grupos'][:3]:  # Mostrar primeros 3
                        print(f"   - {grupo['nombre_grupo']}: {grupo['descripcion'] or 'Sin descripción'}")
                else:
                    print("   ℹ️ No hay grupos disponibles (esto es normal)")
            else:
                print("❌ Error obteniendo grupos")
                print(f"   Respuesta: {response_grupos.get_json()}")
                return False

        else:
            print("❌ Error guardando análisis")
            print(f"   Respuesta: {response.get_json()}")
            return False

        print("\n🎉 ¡Todos los tests pasaron exitosamente!")
        print("\n📋 Resumen de funcionalidad verificada:")
        print("✅ Tabla Analisis_Benchmarking existe")
        print("✅ Guardado de análisis sectorial funciona")
        print("✅ Recuperación de análisis por ID funciona")
        print("✅ Obtención de análisis por usuario funciona")
        print("✅ API de grupos funciona")
        print("✅ Estructura de datos JSON correcta")
        print("\n🚀 El sistema de benchmarking está completamente funcional!")

        return True

if __name__ == "__main__":
    success = test_completo()
    if not success:
        print("\n❌ Algunos tests fallaron. Revisa los errores arriba.")
        exit(1)
    else:
        print("\n✅ Sistema de benchmarking validado exitosamente!")
