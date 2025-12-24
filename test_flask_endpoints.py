#!/usr/bin/env python3
import requests

def test_flask_endpoints():
    base_url = "http://localhost:5000"

    # Crear una sesión para simular usuario autenticado
    session = requests.Session()

    # Simular login - necesitamos crear una sesión válida
    # Como no podemos hacer login real desde aquí, vamos a probar los endpoints que no requieren auth primero

    print("Testing /gamification/api/ranking/General (no auth required)...")
    try:
        response = requests.get(f"{base_url}/gamification/api/ranking/General")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Success!")
        else:
            print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    print("\nTesting /gamification/api/insignias (no auth required)...")
    try:
        response = requests.get(f"{base_url}/gamification/api/insignias")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Success!")
        else:
            print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_flask_endpoints()
