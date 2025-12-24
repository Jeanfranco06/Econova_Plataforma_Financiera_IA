from app import crear_app

app = crear_app('development')
with app.test_client() as client:
    response = client.get('/api/v1/usuarios/1/benchmarking/analisis')
    data = response.get_json()
    print(f'Status: {response.status_code}')
    print(f'Analisis encontrados: {len(data.get("analisis", []))}')
    for analisis in data.get('analisis', []):
        print(f'ID {analisis["analisis_id"]}: {analisis["tipo_analisis"]} - {len(analisis.get("resultados", {}))} metricas')
