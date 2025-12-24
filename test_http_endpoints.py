#!/usr/bin/env python3
import requests

def test_endpoints():
    base_url = "http://localhost:5000"

    # Test endpoint insignias/usuario
    try:
        response = requests.get(f"{base_url}/gamification/api/insignias/usuario")
        print(f"Endpoint /gamification/api/insignias/usuario:")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Success!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Failed with status {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    print()

    # Test endpoint ranking/General
    try:
        response = requests.get(f"{base_url}/gamification/api/ranking/General")
        print(f"Endpoint /gamification/api/ranking/General:")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Success!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Failed with status {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_endpoints()
