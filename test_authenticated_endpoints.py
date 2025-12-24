#!/usr/bin/env python3
from app.servicios.gamification_servicio import GamificationService
from app.modelos.logro import Usuario_Insignia

def test_authenticated_methods():
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

    print("\nTesting GamificationService.obtener_estadisticas_gamification...")
    try:
        result = GamificationService.obtener_estadisticas_gamification(usuario_id)
        print(f"✅ Success: Estadísticas obtenidas")
        print(f"  - Puntaje total: {result['puntaje_total']}")
        print(f"  - Num insignias: {result['num_insignias']}")
        print(f"  - Num simulaciones: {result['num_simulaciones']}")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_authenticated_methods()
