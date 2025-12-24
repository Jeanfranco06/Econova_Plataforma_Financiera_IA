#!/usr/bin/env python3
"""Test completo de la funcionalidad de benchmarking"""

import json
import math
from app import crear_app
from app.modelos.benchmarking import Analisis_Benchmarking
from app.rutas.benchmarking import guardar_analisis_benchmarking
from flask import Flask

def test_backend_api():
    """Probar la API completa de backend"""
    print("🔍 Probando API completa de benchmarking...")

    app = crear_app('development')

    with app.test_client() as client:
        # Probar guardado de análisis
        print("📤 Probando guardado de análisis...")

        datos_prueba = {
            'usuario_id': 1,
            'tipo_analisis': 'sectorial',
            'datos': {
                'sector': 'Tecnología',
                'tamanoEmpresa': 'mediana',
                'metricas': {
                    'ingresos': 1500000,
                    'margen_beneficio': 0.25,
                    'roi': 0.30
                },
                'periodo': 'ultimo_anio'
            },
            'resultados': {
                'ingresos': {
                    'valor_empresa': 1500000,
                    'promedio_sector': 2000000,
                    'percentil_25': 1000000,
                    'percentil_75': 3000000,
                    'percentil_90': 4000000,
                    'posicion_relativa': {
                        'percentil': 35.5,
                        'ranking': '4 de 10',
                        'cuartil': 'Q2 (Medio inferior)'
                    }
                },
                'margen_beneficio': {
                    'valor_empresa': 0.25,
                    'promedio_sector': 0.20,
                    'percentil_25': 0.15,
                    'percentil_75': 0.30,
                    'percentil_90': 0.35,
                    'posicion_relativa': {
                        'percentil': 75.0,
                        'ranking': '3 de 10',
                        'cuartil': 'Q3 (Medio superior)'
                    }
                }
            },
            'recomendaciones': [
                {
                    'tipo': 'ventaja_competitiva',
                    'metrica': 'margen_beneficio',
                    'mensaje': '¡Excelente! Tu margen de beneficio está en el 25% superior del sector.',
                    'acciones': ['Mantener las buenas prácticas', 'Compartir conocimientos con el sector']
                }
            ]
        }

        response = client.post('/api/v1/benchmarking/analisis',
                              json=datos_prueba,
                              content_type='application/json')

        print(f"📥 Respuesta del servidor: {response.status_code}")
        print(f"📄 Datos de respuesta: {response.get_json()}")

        if response.status_code == 201:
            data = response.get_json()
            analisis_id = data.get('analisis_id')
            print(f"✅ Análisis guardado con ID: {analisis_id}")

            # Probar recuperación
            print("🔍 Probando recuperación de análisis...")
            response_get = client.get(f'/api/v1/benchmarking/analisis/{analisis_id}')

            print(f"📥 Respuesta GET: {response_get.status_code}")
            if response_get.status_code == 200:
                data_get = response_get.get_json()
                print("✅ Análisis recuperado exitosamente")
                print(f"   Tipo: {data_get['analisis']['tipo_analisis']}")
                print(f"   Datos: {data_get['analisis']['datos']}")
                print(f"   Resultados: {data_get['analisis']['resultados']}")
            else:
                print("❌ Error al recuperar análisis")

            # Probar obtener análisis del usuario
            print("🔍 Probando obtener análisis del usuario...")
            response_user = client.get('/api/v1/usuarios/1/benchmarking/analisis')

            print(f"📥 Respuesta usuario: {response_user.status_code}")
            if response_user.status_code == 200:
                data_user = response_user.get_json()
                print(f"✅ Encontrados {len(data_user['analisis'])} análisis para usuario 1")
                for analisis in data_user['analisis']:
                    print(f"   - ID {analisis['analisis_id']}: {analisis['tipo_analisis']}")
            else:
                print("❌ Error al obtener análisis del usuario")

        else:
            print("❌ Error al guardar análisis")
            print(f"   Error: {response.get_json()}")

def test_frontend_logic():
    """Probar la lógica del frontend"""
    print("\n🔍 Probando lógica del frontend...")

    # Simular datos que vendrían del formulario
    datos_formulario = {
        'sector': 'Tecnología',
        'tamano_empresa': 'mediana',
        'periodo': 'ultimo_anio',
        'metricas[]': ['ingresos', 'margen_beneficio'],
        'ingresos': '1500000',
        'margen_beneficio': '25'
    }

    # Simular procesamiento del formulario
    metricas_seleccionadas = datos_formulario['metricas[]']
    metricas = {}

    for metrica in metricas_seleccionadas:
        valor = float(datos_formulario[metrica])
        if not isinstance(valor, bool) and not math.isnan(valor) and valor > 0:
            # Convertir porcentajes
            if 'margen' in metrica or 'roi' in metrica or 'crecimiento' in metrica:
                valor = valor / 100
            metricas[metrica] = valor

    datos_esperados = {
        'sector': datos_formulario['sector'],
        'tamanoEmpresa': datos_formulario['tamano_empresa'],
        'metricas': metricas,
        'periodo': datos_formulario['periodo']
    }

    print(f"✅ Datos procesados del formulario: {json.dumps(datos_esperados, indent=2)}")

    # Simular análisis
    analisis_simulado = {
        'ingresos': {
            'valor_empresa': 1500000,
            'promedio_sector': 2000000,
            'percentil': 35.5
        },
        'margen_beneficio': {
            'valor_empresa': 0.25,
            'promedio_sector': 0.20,
            'percentil': 75.0
        }
    }

    print(f"✅ Análisis simulado: {json.dumps(analisis_simulado, indent=2)}")

    # Simular recomendaciones
    recomendaciones_simuladas = [
        {
            'tipo': 'ventaja_competitiva',
            'metrica': 'margen_beneficio',
            'mensaje': '¡Excelente! Tu margen de beneficio está en el 25% superior del sector.',
            'acciones': ['Mantener las buenas prácticas']
        }
    ]

    print(f"✅ Recomendaciones simuladas: {json.dumps(recomendaciones_simuladas, indent=2)}")

    # Simular datos de envío al backend
    datos_envio = {
        'usuario_id': 1,  # Simulado
        'tipo_analisis': 'sectorial',
        'datos': datos_esperados,
        'resultados': analisis_simulado,
        'recomendaciones': recomendaciones_simuladas
    }

    print(f"✅ Datos que se enviarían al backend: {json.dumps(datos_envio, indent=2)}")

if __name__ == "__main__":
    test_backend_api()
    test_frontend_logic()
