from app.modelos.usuario import Usuario
from app.modelos.simulacion import Simulacion, Resultado
from app.modelos.logro import Insignia, Usuario_Insignia, Ranking
from app.modelos.benchmarking import Usuario_Benchmarking
from app.modelos.notificacion import NotificacionService
from app.utils.base_datos import get_db_connection

class GamificationService:
    @staticmethod
    def verificar_y_otorgar_insignias(usuario_id):
        """Verificar condiciones y otorgar insignias automáticamente"""
        insignias_otorgadas = []

        # Insignia: Primeros Pasos - Primera simulación
        if GamificationService._verificar_primera_simulacion(usuario_id):
            insignia_id = GamificationService._obtener_insignia_por_nombre('Primeros Pasos')
            if insignia_id and GamificationService._otorgar_insignia_si_no_tiene(usuario_id, insignia_id):
                insignias_otorgadas.append('Primeros Pasos')

        # Insignia: Analista Novato - 5 simulaciones diferentes
        if GamificationService._verificar_cinco_simulaciones(usuario_id):
            insignia_id = GamificationService._obtener_insignia_por_nombre('Analista Novato')
            if insignia_id and GamificationService._otorgar_insignia_si_no_tiene(usuario_id, insignia_id):
                insignias_otorgadas.append('Analista Novato')

        # Insignia: Experto en VAN - Más de 10 cálculos de VAN
        if GamificationService._verificar_experto_van(usuario_id):
            insignia_id = GamificationService._obtener_insignia_por_nombre('Experto en VAN')
            if insignia_id and GamificationService._otorgar_insignia_si_no_tiene(usuario_id, insignia_id):
                insignias_otorgadas.append('Experto en VAN')

        # Insignia: Benchmarking Explorer - Se unió a un grupo
        if GamificationService._verificar_benchmarking_explorer(usuario_id):
            insignia_id = GamificationService._obtener_insignia_por_nombre('Benchmarking Explorer')
            if insignia_id and GamificationService._otorgar_insignia_si_no_tiene(usuario_id, insignia_id):
                insignias_otorgadas.append('Benchmarking Explorer')

        # Insignia: Exportador - Exportó resultados
        # Esta se otorgará cuando se use la funcionalidad de exportar

        # Notificar insignias obtenidas
        for nombre_insignia in insignias_otorgadas:
            NotificacionService.notificar_logro_obtenido(usuario_id, nombre_insignia)

        return insignias_otorgadas

    @staticmethod
    def actualizar_ranking_usuario(usuario_id, sector, nuevo_puntaje):
        """Actualizar ranking de usuario y verificar mejoras"""
        # Obtener puntaje anterior
        ranking_anterior = Ranking.obtener_ranking_usuario(usuario_id)
        puntaje_anterior = None

        for ranking in ranking_anterior:
            if ranking.sector == sector:
                puntaje_anterior = ranking.puntaje
                break

        # Actualizar ranking
        success = Ranking.actualizar_puntaje_usuario(usuario_id, sector, nuevo_puntaje)

        if success:
            # Verificar si mejoró posición
            posicion_actual = GamificationService._obtener_posicion_en_sector(usuario_id, sector)

            if posicion_actual == 1:
                # Otorgar insignia de líder si no la tiene
                insignia_id = GamificationService._obtener_insignia_por_nombre('Líder de Sector')
                if insignia_id:
                    GamificationService._otorgar_insignia_si_no_tiene(usuario_id, insignia_id)
                    NotificacionService.notificar_logro_obtenido(usuario_id, 'Líder de Sector')

            # Notificar mejora de ranking
            if posicion_actual and posicion_actual <= 10:
                NotificacionService.notificar_mejora_ranking(usuario_id, sector, posicion_actual)

        return success

    @staticmethod
    def verificar_record_personal(usuario_id, indicador, valor_nuevo):
        """Verificar si se rompió un record personal"""
        db = get_db_connection()
        query = """
        SELECT MAX(r.valor) as max_valor
        FROM Resultados r
        JOIN Simulaciones s ON r.simulacion_id = s.simulacion_id
        WHERE s.usuario_id = %s AND r.indicador = %s
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id, indicador), fetch=True)
            if result and result[0]['max_valor']:
                max_anterior = float(result[0]['max_valor'])
                if valor_nuevo > max_anterior:
                    # Notificar record personal
                    NotificacionService.notificar_record_personal(
                        usuario_id, indicador, max_anterior, valor_nuevo
                    )
                    return True
            return False
        except Exception as e:
            print(f"Error verificando record personal: {e}")
            return False
        finally:
            db.disconnect()

    @staticmethod
    def verificar_rendimiento_superior(usuario_id, indicador):
        """Verificar si el usuario está por encima del promedio"""
        from app.modelos.benchmarking import BenchmarkingService

        # Obtener grupos del usuario
        grupos = Usuario_Benchmarking.obtener_grupos_usuario(usuario_id)

        for grupo in grupos:
            comparacion = BenchmarkingService.comparar_con_grupo(
                usuario_id, indicador, grupo.benchmarking_id
            )

            if comparacion and comparacion['percentil'] >= 75:  # Top 25%
                NotificacionService.notificar_benchmarking_superior(
                    usuario_id, indicador, comparacion['percentil']
                )
                break

    @staticmethod
    def _verificar_primera_simulacion(usuario_id):
        """Verificar si el usuario completó su primera simulación"""
        count = Simulacion.contar_simulaciones_usuario(usuario_id)
        return count >= 1

    @staticmethod
    def _verificar_cinco_simulaciones(usuario_id):
        """Verificar si el usuario realizó 5 simulaciones"""
        count = Simulacion.contar_simulaciones_usuario(usuario_id)
        return count >= 5

    @staticmethod
    def _verificar_experto_van(usuario_id):
        """Verificar si calculó VAN en más de 10 proyectos"""
        db = get_db_connection()
        query = """
        SELECT COUNT(*) as count
        FROM Resultados r
        JOIN Simulaciones s ON r.simulacion_id = s.simulacion_id
        WHERE s.usuario_id = %s AND r.indicador = 'VAN'
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id,), fetch=True)
            if result:
                return result[0]['count'] >= 10
            return False
        except Exception as e:
            print(f"Error verificando experto VAN: {e}")
            return False
        finally:
            db.disconnect()

    @staticmethod
    def _verificar_benchmarking_explorer(usuario_id):
        """Verificar si el usuario se unió a al menos un grupo de benchmarking"""
        grupos = Usuario_Benchmarking.obtener_grupos_usuario(usuario_id)
        return len(grupos) > 0

    @staticmethod
    def _obtener_insignia_por_nombre(nombre):
        """Obtener ID de insignia por nombre"""
        insignias = Insignia.listar_insignias()
        for insignia in insignias:
            if insignia.nombre_insig == nombre:
                return insignia.insignia_id
        return None

    @staticmethod
    def _otorgar_insignia_si_no_tiene(usuario_id, insignia_id):
        """Otorgar insignia solo si el usuario no la tiene"""
        if not Usuario_Insignia.verificar_insignia_usuario(usuario_id, insignia_id):
            return Usuario_Insignia.otorgar_insignia(usuario_id, insignia_id)
        return False

    @staticmethod
    def _obtener_posicion_en_sector(usuario_id, sector):
        """Obtener posición del usuario en el ranking de un sector"""
        rankings = Ranking.obtener_ranking_sector(sector, limite=1000)  # Obtener todos para encontrar posición

        for i, item in enumerate(rankings):
            if item['ranking']['usuario_id'] == usuario_id:
                return i + 1  # Posición basada en 1

        return None

    @staticmethod
    def calcular_puntaje_gamification(usuario_id):
        """Calcular puntaje total de gamificación basado en logros"""
        puntaje = 0

        # Obtener insignias del usuario
        insignias_usuario = Usuario_Insignia.obtener_insignias_usuario(usuario_id)
        puntaje += len(insignias_usuario) * 10  # 10 puntos por insignia

        # Obtener simulaciones realizadas
        num_simulaciones = Simulacion.contar_simulaciones_usuario(usuario_id)
        puntaje += num_simulaciones * 5  # 5 puntos por simulación

        # Bonus por posiciones en ranking
        rankings = Ranking.obtener_ranking_usuario(usuario_id)
        for ranking in rankings:
            if ranking.puntaje > 0:
                # Puntos adicionales por estar en ranking
                puntaje += min(ranking.puntaje / 10, 50)  # Máximo 50 puntos por ranking

        return int(puntaje)

    @staticmethod
    def obtener_estadisticas_gamification(usuario_id):
        """Obtener estadísticas completas de gamificación del usuario"""
        insignias = Usuario_Insignia.obtener_insignias_usuario(usuario_id)
        rankings = Ranking.obtener_ranking_usuario(usuario_id)
        num_simulaciones = Simulacion.contar_simulaciones_usuario(usuario_id)
        puntaje_total = GamificationService.calcular_puntaje_gamification(usuario_id)

        # Obtener grupos de benchmarking
        grupos = Usuario_Benchmarking.obtener_grupos_usuario(usuario_id)

        return {
            'puntaje_total': puntaje_total,
            'num_insignias': len(insignias),
            'insignias': insignias,
            'num_simulaciones': num_simulaciones,
            'rankings': [ranking.to_dict() for ranking in rankings],
            'num_grupos_benchmarking': len(grupos),
            'grupos_benchmarking': [grupo.to_dict() for grupo in grupos]
        }
