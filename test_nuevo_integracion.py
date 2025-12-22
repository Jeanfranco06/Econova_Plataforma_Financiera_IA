#!/usr/bin/env python3
"""
Tests de integración para nuevos módulos
"""

import pytest
import json
from app import crear_app

class TestIntegracionNueva:
    """Tests para nuevos módulos de integración"""

    def setup_method(self):
        """Configuración antes de cada test"""
        self.app = crear_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.client = self.app.test_client()

    def teardown_method(self):
        """Limpieza después de cada test"""
        self.app_context.pop()

    def test_integracion_financiera_completa(self):
        """Test integración completa financiera"""
        # Simular flujo completo: registro → simulación → resultados
        print("🧪 Probando integración financiera completa...")

        # 1. Registro de usuario
        datos_registro = {
            "nombres": "Test",
            "apellidos": "Integracion",
            "email": "test_integracion@example.com",
            "nombre_usuario": "test_integracion",
            "password": "Test123!",
            "empresa": "Test Company",
            "sector": "Tecnología"
        }

        response = self.client.post('/api/v1/registrar',
                                  data=json.dumps(datos_registro),
                                  content_type='application/json')
        assert response.status_code == 201
        registro_data = json.loads(response.data)
        assert registro_data["success"] == True

        print("✅ Usuario registrado exitosamente")

        # 2. Login
        datos_login = {
            "email": "test_integracion@example.com",
            "password": "Test123!"
        }

        response = self.client.post('/api/v1/login',
                                  data=json.dumps(datos_login),
                                  content_type='application/json')
        assert response.status_code == 200

        print("✅ Login exitoso")

        # 3. Simulación financiera (VAN)
        datos_van = {
            "flujos": [-10000, 3000, 4000, 5000, 6000],
            "tasa_descuento": 0.12
        }

        response = self.client.post('/api/v1/financiero/van',
                                  data=json.dumps(datos_van),
                                  content_type='application/json')
        assert response.status_code == 200
        van_data = json.loads(response.data)
        assert "van" in van_data
        assert isinstance(van_data["van"], (int, float))

        print(f"✅ VAN calculado: {van_data['van']}")

        # 4. Ver perfil
        response = self.client.get('/api/v1/perfil')
        assert response.status_code == 200
        perfil_data = json.loads(response.data)
        assert perfil_data["success"] == True
        assert perfil_data["usuario"]["email"] == "test_integracion@example.com"

        print("✅ Perfil obtenido correctamente")

    def test_integracion_ml_completa(self):
        """Test integración completa de ML"""
        print("🧪 Probando integración ML completa...")

        # 1. Predicción de ventas
        datos_prediccion = {
            "datos_historicos": [100, 120, 110, 130, 125, 140, 135, 150],
            "periodos": 3
        }

        response = self.client.post('/api/v1/ml/predecir',
                                  data=json.dumps(datos_prediccion),
                                  content_type='application/json')
        assert response.status_code == 200
        prediccion_data = json.loads(response.data)
        assert "predicciones" in prediccion_data
        assert len(prediccion_data["predicciones"]) == 3

        print(f"✅ Predicciones generadas: {prediccion_data['predicciones']}")

        # 2. Análisis de tendencias
        datos_tendencias = {
            "ventas": [100, 105, 110, 108, 115, 120, 118, 125],
            "costos": [80, 82, 85, 87, 89, 91, 93, 95]
        }

        response = self.client.post('/api/v1/ml/analizar',
                                  data=json.dumps(datos_tendencias),
                                  content_type='application/json')
        assert response.status_code == 200
        tendencias_data = json.loads(response.data)
        assert "correlacion" in tendencias_data
        assert isinstance(tendencias_data["correlacion"], (int, float))

        print(f"✅ Correlación calculada: {tendencias_data['correlacion']}")

    def test_integracion_gamificacion(self):
        """Test integración de gamificación"""
        print("🧪 Probando integración de gamificación...")

        # Crear usuario de prueba
        datos_registro = {
            "nombres": "Test",
            "apellidos": "Gamificacion",
            "email": "test_gamificacion@example.com",
            "nombre_usuario": "test_gamificacion",
            "password": "Test123!",
            "empresa": "Test Company"
        }

        response = self.client.post('/api/v1/registrar',
                                  data=json.dumps(datos_registro),
                                  content_type='application/json')
        assert response.status_code == 201

        # Login
        datos_login = {
            "email": "test_gamificacion@example.com",
            "password": "Test123!"
        }
        self.client.post('/api/v1/login',
                        data=json.dumps(datos_login),
                        content_type='application/json')

        # Ver insignias (debería tener al menos la insignia básica)
        response = self.client.get('/api/v1/usuarios/1/insignias')
        assert response.status_code == 200
        insignias_data = json.loads(response.data)
        assert "insignias" in insignias_data

        print(f"✅ Insignias obtenidas: {len(insignias_data['insignias'])}")

    def test_integracion_benchmarking(self):
        """Test integración de benchmarking"""
        print("🧪 Probando integración de benchmarking...")

        # Crear usuario de prueba
        datos_registro = {
            "nombres": "Test",
            "apellidos": "Benchmarking",
            "email": "test_benchmarking@example.com",
            "nombre_usuario": "test_benchmarking",
            "password": "Test123!",
            "empresa": "Test Company",
            "sector": "Tecnología"
        }

        response = self.client.post('/api/v1/registrar',
                                  data=json.dumps(datos_registro),
                                  content_type='application/json')
        assert response.status_code == 201

        # Login
        datos_login = {
            "email": "test_benchmarking@example.com",
            "password": "Test123!"
        }
        self.client.post('/api/v1/login',
                        data=json.dumps(datos_login),
                        content_type='application/json')

        # Ver ranking
        response = self.client.get('/api/v1/usuarios/1/ranking')
        assert response.status_code == 200
        ranking_data = json.loads(response.data)
        assert "rankings" in ranking_data

        print(f"✅ Rankings obtenidos: {len(ranking_data['rankings'])}")

    def test_rendimiento_api(self):
        """Test de rendimiento de APIs"""
        import time

        print("🧪 Probando rendimiento de APIs...")

        # Medir tiempo de respuesta de health check
        start_time = time.time()
        response = self.client.get('/health')
        end_time = time.time()

        response_time = (end_time - start_time) * 1000  # ms
        assert response.status_code == 200
        assert response_time < 500  # Debe responder en menos de 500ms

        print(f"✅ Tiempo de respuesta: {response_time:.2f}ms")

    def test_validacion_datos_completa(self):
        """Test validación completa de datos"""
        print("🧪 Probando validación completa de datos...")

        # Datos válidos
        datos_validos = {
            "nombres": "Juan Pérez",
            "apellidos": "González",
            "email": "juan.perez@email.com",
            "telefono": "+51987654321",
            "nombre_usuario": "juan_perez",
            "password": "Password123!",
            "empresa": "Empresa S.A.",
            "sector": "Tecnología",
            "tamano_empresa": "Mediana",
            "terminos": True,
            "newsletter": True
        }

        response = self.client.post('/api/v1/registrar',
                                  data=json.dumps(datos_validos),
                                  content_type='application/json')
        assert response.status_code == 201

        print("✅ Validación de datos correcta")

        # Intentar registrar con mismo email (debe fallar)
        response = self.client.post('/api/v1/registrar',
                                  data=json.dumps(datos_validos),
                                  content_type='application/json')
        assert response.status_code == 400
        error_data = json.loads(response.data)
        assert not error_data["success"]
        assert "correo electrónico" in error_data["error"]

        print("✅ Validación de duplicados correcta")

if __name__ == "__main__":
    # Ejecutar tests manualmente
    test_instance = TestIntegracionNueva()

    print("🚀 Ejecutando tests de integración nueva...\n")

    try:
        test_instance.setup_method()

        test_instance.test_integracion_financiera_completa()
        print()

        test_instance.test_integracion_ml_completa()
        print()

        test_instance.test_integracion_gamificacion()
        print()

        test_instance.test_integracion_benchmarking()
        print()

        test_instance.test_rendimiento_api()
        print()

        test_instance.test_validacion_datos_completa()
        print()

        test_instance.teardown_method()

        print("🎉 Todos los tests de integración pasaron exitosamente!")

    except Exception as e:
        print(f"❌ Error en tests de integración: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
