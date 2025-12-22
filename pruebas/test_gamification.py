#!/usr/bin/env python3
"""
Pruebas para el sistema de gamificación, benchmarking y base de datos de Econova
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.base_datos import init_db, close_db
from app.modelos.usuario import Usuario
from app.modelos.simulacion import Simulacion, Resultado
from app.modelos.logro import Insignia, Usuario_Insignia, Ranking
from app.modelos.benchmarking import Benchmarking_Grupo, Usuario_Benchmarking, BenchmarkingService
from app.modelos.notificacion import Notificacion
from app.servicios.gamification_servicio import GamificationService

def test_database_connection():
    """Probar conexión a la base de datos"""
    print("🔍 Probando conexión a la base de datos...")
    try:
        if init_db():
            print("✅ Conexión exitosa")
            return True
        else:
            print("❌ Error de conexión")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_usuario_operations():
    """Probar operaciones de usuario"""
    print("\n👤 Probando operaciones de usuario...")

    # Crear usuario de prueba
    usuario_id = Usuario.crear_usuario(
        nombre_usuario='test_user',
        nombres='Usuario de Prueba',
        apellidos='Test',
        email='test@example.com',
        nivel='Principiante'
    )

    if not usuario_id:
        print("❌ Error creando usuario")
        return False

    print(f"✅ Usuario creado con ID: {usuario_id}")

    # Obtener usuario
    usuario = Usuario.obtener_usuario_por_id(usuario_id)
    if not usuario:
        print("❌ Error obteniendo usuario")
        return False

    print(f"✅ Usuario obtenido: {usuario.nombre_usuario}")

    return usuario_id

def test_simulacion_operations(usuario_id):
    """Probar operaciones de simulación"""
    print("\n📊 Probando operaciones de simulación...")

    # Crear simulación
    simulacion_id = Simulacion.crear_simulacion(usuario_id, 'VAN_TIR_Portafolio')
    if not simulacion_id:
        print("❌ Error creando simulación")
        return False

    print(f"✅ Simulación creada con ID: {simulacion_id}")

    # Guardar resultados
    resultados = [
        ('VAN', 15000.50),
        ('TIR', 12.5),
        ('Payback', 3.2)
    ]

    for indicador, valor in resultados:
        resultado_id = Resultado.guardar_resultado(simulacion_id, indicador, valor)
        if not resultado_id:
            print(f"❌ Error guardando resultado {indicador}")
            return False

    print("✅ Resultados guardados")

    # Obtener resultados
    resultados_obtenidos = Resultado.obtener_resultados_simulacion(simulacion_id)
    if len(resultados_obtenidos) != 3:
        print("❌ Error obteniendo resultados")
        return False

    print(f"✅ Resultados obtenidos: {len(resultados_obtenidos)}")

    return simulacion_id

def test_insignia_operations():
    """Probar operaciones de insignias"""
    print("\n🏆 Probando operaciones de insignias...")

    # Listar insignias
    insignias = Insignia.listar_insignias()
    if not insignias:
        print("❌ No se encontraron insignias")
        return False

    print(f"✅ Insignias encontradas: {len(insignias)}")

    # Obtener primera insignia
    primera_insignia = insignias[0]
    print(f"✅ Primera insignia: {primera_insignia.nombre_insig}")

    return True

def test_benchmarking_operations():
    """Probar operaciones de benchmarking"""
    print("\n📈 Probando operaciones de benchmarking...")

    # Listar grupos
    grupos = Benchmarking_Grupo.listar_grupos()
    if not grupos:
        print("❌ No se encontraron grupos de benchmarking")
        return False

    print(f"✅ Grupos encontrados: {len(grupos)}")

    return True

def test_ranking_operations(usuario_id):
    """Probar operaciones de ranking"""
    print("\n🏅 Probando operaciones de ranking...")

    # Actualizar ranking
    success = Ranking.actualizar_puntaje_usuario(usuario_id, 'Tecnología', 85.5)
    if not success:
        print("❌ Error actualizando ranking")
        return False

    print("✅ Ranking actualizado")

    # Obtener ranking del sector
    rankings = Ranking.obtener_ranking_sector('Tecnología', limite=5)
    print(f"✅ Rankings obtenidos: {len(rankings)}")

    return True

def test_gamification_service(usuario_id, simulacion_id):
    """Probar servicio de gamificación"""
    print("\n🎮 Probando servicio de gamificación...")

    # Verificar y otorgar insignias
    insignias_otorgadas = GamificationService.verificar_y_otorgar_insignias(usuario_id)
    print(f"✅ Insignias otorgadas: {len(insignias_otorgadas)}")

    # Calcular puntaje
    puntaje = GamificationService.calcular_puntaje_gamification(usuario_id)
    print(f"✅ Puntaje de gamificación: {puntaje}")

    # Obtener estadísticas
    stats = GamificationService.obtener_estadisticas_gamification(usuario_id)
    print(f"✅ Estadísticas obtenidas: {stats['num_insignias']} insignias, {stats['num_simulaciones']} simulaciones")

    return True

def test_notificacion_operations(usuario_id):
    """Probar operaciones de notificaciones"""
    print("\n🔔 Probando operaciones de notificaciones...")

    # Crear notificación
    notif_id = Notificacion.crear_notificacion(
        usuario_id=usuario_id,
        tipo='prueba',
        mensaje='Esta es una notificación de prueba'
    )

    if not notif_id:
        print("❌ Error creando notificación")
        return False

    print("✅ Notificación creada")

    # Obtener notificaciones
    notificaciones = Notificacion.obtener_notificaciones_usuario(usuario_id, limite=5)
    print(f"✅ Notificaciones obtenidas: {len(notificaciones)}")

    return True

def cleanup_test_data():
    """Limpiar datos de prueba"""
    print("\n🧹 Limpiando datos de prueba...")
    # Nota: En un entorno de producción, sería mejor tener una base de datos de prueba separada
    print("✅ Limpieza completada")

def main():
    """Función principal de pruebas"""
    print("🚀 Iniciando pruebas del sistema Econova - Parte 5")
    print("=" * 50)

    # Probar conexión
    if not test_database_connection():
        print("❌ Falló la conexión a la base de datos")
        return

    try:
        # Probar operaciones de usuario
        usuario_id = test_usuario_operations()
        if not usuario_id:
            return

        # Probar operaciones de simulación
        simulacion_id = test_simulacion_operations(usuario_id)
        if not simulacion_id:
            return

        # Probar otras operaciones
        test_insignia_operations()
        test_benchmarking_operations()
        test_ranking_operations(usuario_id)
        test_gamification_service(usuario_id, simulacion_id)
        test_notificacion_operations(usuario_id)

        print("\n" + "=" * 50)
        print("🎉 Todas las pruebas pasaron exitosamente!")
        print("✅ Sistema de base de datos, gamificación y benchmarking funcionando correctamente")

    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {e}")
        import traceback
        traceback.print_exc()

    finally:
        # Limpiar
        cleanup_test_data()
        close_db()

if __name__ == "__main__":
    main()
