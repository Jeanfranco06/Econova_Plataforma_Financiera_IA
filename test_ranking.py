import requests

# Probar el endpoint del ranking
try:
    response = requests.get('http://localhost:5000/gamification/api/ranking/General', timeout=5)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print(f'Success: {data.get("success")}')
        print(f'Ranking items: {len(data.get("ranking", []))}')
        print(f'Usuarios items: {len(data.get("usuarios", []))}')
        print(f'Usuario actual: {data.get("usuario_actual") is not None}')
        if data.get('ranking'):
            print(f'Primer ranking: {data["ranking"][0]}')
        if data.get('usuarios'):
            print(f'Primer usuario: {data["usuarios"][0]}')
    else:
        print(f'Response: {response.text[:300]}...')
except Exception as e:
    print(f'Error: {e}')
