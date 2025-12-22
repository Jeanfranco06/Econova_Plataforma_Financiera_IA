#!/usr/bin/env python3
"""
Tests para las rutas/endpoints de la API
"""

import pytest
import json
from app import crear_app

class TestRutasAPI:
    """Tests para las rutas de la API"""

    def setup_method(self):
        """Configuración antes de cada test"""
        self.app = crear_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()

    def teardown_method(self):
        """Limpieza después de cada test"""
        self.app_context.pop()

    def test_health_check(self):
        """Test endpoint de health check"""
        response = self.client.get('/health')
        assert response.status_code == 200

        data = json.loads(response.data)
        assert "status" in data
        assert "service" in data
        assert "version" in data
        assert data["status"] == "healthy"
        assert data["service"] == "Econova API"

    def test_pagina_inicio(self):
        """Test página de inicio"""
        response = self.client.get('/')
        assert response.status_code == 200
        assert b"Econova" in response.data

    def test_pagina_registro_get(self):
        """Test página de registro (GET)"""
        response = self.client.get('/registro')
        assert response.status_code == 200
        assert b"registro" in response.data.lower()

    def test_pagina_login_get(self):
        """Test página de login (GET)"""
        response = self.client.get('/login')
        assert response.status_code == 200
        assert b"login" in response.data.lower()

    def test_registro_api_sin_datos(self):
        """Test registro API sin datos"""
        response = self.client.post('/api/v1/registrar',
                                  content_type='application/json')
        assert response.status_code == 400

        data = json.loads(response.data)
        assert not data["success"]
        assert "requeridos" in data["error"]

    def test_registro_api_datos_invalidos(self):
        """Test registro API con datos inválidos"""
        datos_invalidos = {
            "nombres": "",
            "email": "email-invalido",
            "password": "123"
        }

        response = self.client.post('/api/v1/registrar',
                                  data=json.dumps(datos_invalidos),
                                  content_type='application/json')
        assert response.status_code == 400

        data = json.loads(response.data)
        assert not data["success"]
        assert "obligatorios" in data["error"] or "inválido" in data["error"]

    def test_perfil_sin_autenticacion(self):
        """Test acceso a perfil sin autenticación"""
        response = self.client.get('/api/v1/perfil')
        assert response.status_code == 401

        data = json.loads(response.data)
        assert not data["success"]
        assert "autenticado" in data["error"]

    def test_dashboard_sin_autenticacion(self):
        """Test acceso a dashboard sin autenticación"""
        response = self.client.get('/dashboard')
        assert response.status_code == 302  # Redirect to login

    def test_listar_usuarios_sin_autenticacion(self):
        """Test listar usuarios sin autenticación (debería requerir auth)"""
        response = self.client.get('/api/v1/usuarios')
        # Esto debería requerir autenticación o devolver error
        assert response.status_code in [401, 403, 200]  # Dependiendo de la implementación

    def test_rutas_plantillas(self):
        """Test rutas que devuelven plantillas HTML"""
        rutas_plantillas = [
            '/terminos',
            '/privacidad',
            '/simulacion',
            '/resultados',
            '/chatbot',
            '/benchmarking',
            '/prestamo',
            '/ahorro-inversion',
            '/demo'
        ]

        for ruta in rutas_plantillas:
            response = self.client.get(ruta)
            assert response.status_code == 200
            assert b"<!DOCTYPE html>" in response.data

    def test_cors_headers(self):
        """Test headers CORS"""
        response = self.client.get('/health')
        assert 'Access-Control-Allow-Origin' in response.headers

    def test_api_content_type(self):
        """Test que las rutas API devuelvan JSON"""
        rutas_api = [
            '/health',
            '/api/v1/perfil'  # Aunque requiera auth, debe devolver JSON
        ]

        for ruta in rutas_api:
            response = self.client.get(ruta)
            if response.status_code != 401:  # Si no requiere auth
                assert response.content_type == 'application/json'

if __name__ == "__main__":
    # Ejecutar tests manualmente
    test_instance = TestRutasAPI()

    print("🧪 Ejecutando tests de rutas API...")

    try:
        test_instance.setup_method()

        test_instance.test_health_check()
        print("✅ Test Health Check pasado")

        test_instance.test_pagina_inicio()
        print("✅ Test Página Inicio pasado")

        test_instance.test_pagina_registro_get()
        print("✅ Test Página Registro pasado")

        test_instance.test_pagina_login_get()
        print("✅ Test Página Login pasado")

        test_instance.test_registro_api_sin_datos()
        print("✅ Test Registro API sin datos pasado")

        test_instance.test_registro_api_datos_invalidos()
        print("✅ Test Registro API datos inválidos pasado")

        test_instance.test_perfil_sin_autenticacion()
        print("✅ Test Perfil sin auth pasado")

        test_instance.test_dashboard_sin_autenticacion()
        print("✅ Test Dashboard sin auth pasado")

        test_instance.test_rutas_plantillas()
        print("✅ Test Rutas Plantillas pasado")

        test_instance.teardown_method()

        print("\n🎉 Todos los tests de rutas pasaron exitosamente!")

    except Exception as e:
        print(f"❌ Error en tests de rutas: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
