#!/usr/bin/env python3
from app.modelos.logro import Usuario_Insignia, Ranking

def test_endpoints():
    # Usar un usuario que existe (usuario_id = 33)
    usuario_id = 33

    print("Testing Usuario_Insignia.obtener_insignias_usuario...")
    try:
        result = Usuario_Insignia.obtener_insignias_usuario(usuario_id)
        print(f"✅ Success: {len(result)} insignias encontradas")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

    print("\nTesting Ranking.obtener_ranking_sector...")
    try:
        result = Ranking.obtener_ranking_sector('General', 10)
        print(f"✅ Success: {len(result)} rankings encontrados")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_endpoints()
