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

        # Insignia: Analista Avanzado - 25 simulaciones completadas
        if GamificationService._verificar_analista_avanzado(usuario_id):
            insignia_id = GamificationService._obtener_insignia_por_nombre('Analista Avanzado')
            if insignia_id and GamificationService._otorgar_insignia_si_no_tiene(usuario_id, insignia_id):
                insignias_otorgadas.append('Analista Avanzado')

        # Insignia: Benchmarking Explorer - Se unió a un grupo
        if GamificationService._verificar_benchmarking_explorer(usuario_id):
            insignia_id = GamificationService._obtener_insignia_por_nombre('Benchmarking Explorer')
            if insignia_id and GamificationService._otorgar_insignia_si_no_tiene(usuario_id, insignia_id):
                insignias_otorgadas.append('Benchmarking Explorer')

        # Insignia: Login Diario - Se otorga solo una vez al día
        insignia_id = GamificationService._obtener_insignia_por_nombre('Login Diario')
        if insignia_id and GamificationService._verificar_login_diario(usuario_id):
            if GamificationService._otorgar_insignia_si_no_tiene(usuario_id, insignia_id):
                insignias_otorgadas.append('Login Diario')

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
    def _verificar_analista_avanzado(usuario_id):
        """Verificar si el usuario realizó 25 simulaciones"""
        count = Simulacion.contar_simulaciones_usuario(usuario_id)
        return count >= 25

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
    def _verificar_login_diario(usuario_id):
        """Verificar si el usuario ya recibió Login Diario hoy"""
        db = get_db_connection()
        query = """
        SELECT COUNT(*) as count
        FROM Usuario_Insignia ui
        JOIN Insignias i ON ui.insignia_id = i.insignia_id
        WHERE ui.usuario_id = %s AND i.nombre_insig = 'Login Diario'
        AND DATE(ui.fecha_obtenida) = DATE('now')
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id,), fetch=True)
            if result:
                return result[0]['count'] == 0  # True si no ha recibido hoy
            return True
        except Exception as e:
            print(f"Error verificando login diario: {e}")
            return True  # En caso de error, permitir otorgar
        finally:
            db.disconnect()

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

    @staticmethod
    def obtener_ranking_global(limite=10):
        """Obtener ranking global de usuarios por puntaje de gamificación"""
        db = get_db_connection()

        # Query para obtener usuarios con más puntos de gamificación
        # Usando la misma lógica que calcular_puntaje_gamification()
        query = """
        SELECT
            u.usuario_id,
            u.nombres,
            u.apellidos,
            u.nivel,
            COUNT(ui.insignia_id) as num_insignias,
            (
                SELECT COUNT(*) FROM Simulaciones s WHERE s.usuario_id = u.usuario_id
            ) as num_simulaciones,
            (
                -- 10 puntos por insignia
                COUNT(ui.insignia_id) * 10 +
                -- 5 puntos por simulación
                (SELECT COUNT(*) FROM Simulaciones s WHERE s.usuario_id = u.usuario_id) * 5 +
                -- Bonus por rankings existentes (máximo 50 puntos por ranking)
                COALESCE((
                    SELECT SUM(CASE WHEN r.puntaje > 0 THEN
                        CASE WHEN (r.puntaje / 10) < 50 THEN (r.puntaje / 10) ELSE 50 END
                    ELSE 0 END)
                    FROM Ranking r
                    WHERE r.usuario_id = u.usuario_id
                ), 0)
            ) as puntaje_total
        FROM Usuarios u
        LEFT JOIN Usuario_Insignia ui ON u.usuario_id = ui.usuario_id
        GROUP BY u.usuario_id, u.nombres, u.apellidos, u.nivel
        ORDER BY puntaje_total DESC, num_insignias DESC, num_simulaciones DESC
        LIMIT %s
        """

        try:
            db.connect()
            result = db.execute_query(query, (limite,), fetch=True)

            ranking = []
            if result:
                posicion = 1
                for row in result:
                    # Obtener insignia principal del usuario
                    insignia_principal = GamificationService._obtener_insignia_principal_usuario(row['usuario_id'])

                    ranking.append({
                        'posicion': posicion,
                        'usuario_id': row['usuario_id'],
                        'nombre': f"{row['nombres']} {row['apellidos']}",
                        'nivel': row['nivel'] or 1,
                        'puntaje': int(row['puntaje_total']),
                        'insignias': int(row['num_insignias']),
                        'simulaciones': int(row['num_simulaciones']),
                        'insignia_principal': insignia_principal
                    })
                    posicion += 1

            return ranking
        except Exception as e:
            print(f"Error obteniendo ranking global: {e}")
            return []
        finally:
            db.disconnect()

    @staticmethod
    def _obtener_insignia_principal_usuario(usuario_id):
        """Obtener la insignia principal de un usuario"""
        try:
            insignias_usuario = Usuario_Insignia.obtener_insignias_usuario(usuario_id)
            if not insignias_usuario:
                return None

            # Orden de importancia de insignias
            orden_importancia = [
                'Maestro de Finanzas', 'Inversor Estratégico', 'Analista Avanzado',
                'Benchmarking Experto', 'Experto en VAN', 'Maestro TIR',
                'Benchmarking Explorer', 'Analista Novato', 'Primeros Pasos'
            ]

            for nombre_insignia in orden_importancia:
                for item in insignias_usuario:
                    insignia = item.get('insignia')
                    if insignia and insignia.get('nombre_insig') == nombre_insignia:
                        return {
                            'nombre': nombre_insignia,
                            'icono': insignia.get('icono_insig') or '🏆'
                        }

            # Si no tiene ninguna de las principales, devolver la primera que tenga
            if insignias_usuario and len(insignias_usuario) > 0:
                primera_insignia = insignias_usuario[0].get('insignia')
                if primera_insignia:
                    return {
                        'nombre': primera_insignia.get('nombre_insig', 'Insignia'),
                        'icono': primera_insignia.get('icono_insig') or '🏆'
                    }

            return None
        except Exception as e:
            print(f"Error obteniendo insignia principal: {e}")
            return None

    @staticmethod
    def obtener_logros_proximos(usuario_id):
        """Obtener logros próximos que el usuario puede obtener"""
        # Obtener todas las insignias disponibles
        todas_insignias = Insignia.listar_insignias()

        # Obtener insignias que el usuario ya tiene
        insignias_usuario = Usuario_Insignia.obtener_insignias_usuario(usuario_id)
        insignias_tenidas = {item['insignia']['insignia_id'] for item in insignias_usuario}

        logros_proximos = []

        for insignia in todas_insignias:
            if insignia.insignia_id not in insignias_tenidas:
                # Calcular progreso basado en el nombre de la insignia
                progreso = GamificationService._calcular_progreso_insignia(usuario_id, insignia.nombre_insig)

                logros_proximos.append({
                    'nombre': insignia.nombre_insig,
                    'descripcion': insignia.descripcion_insig,
                    'progreso': progreso
                })

        # Ordenar por progreso descendente y limitar a 3
        logros_proximos.sort(key=lambda x: x['progreso'], reverse=True)
        return logros_proximos[:3]

    @staticmethod
    def _calcular_progreso_insignia(usuario_id, nombre_insignia):
        """Calcular el progreso hacia una insignia específica"""
        if nombre_insignia == 'Primeros Pasos':
            return 100 if GamificationService._verificar_primera_simulacion(usuario_id) else 0

        elif nombre_insignia == 'Analista Novato':
            count = Simulacion.contar_simulaciones_usuario(usuario_id)
            return round(min(count / 5 * 100, 100))

        elif nombre_insignia == 'Analista Avanzado':
            count = Simulacion.contar_simulaciones_usuario(usuario_id)
            return round(min(count / 25 * 100, 100))

        elif nombre_insignia == 'Experto en VAN':
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
                    count = result[0]['count']
                    return round(min(count / 10 * 100, 100))
                return 0
            except Exception as e:
                print(f"Error calculando progreso Experto VAN: {e}")
                return 0
            finally:
                db.disconnect()

        elif nombre_insignia == 'Benchmarking Explorer':
            grupos = Usuario_Benchmarking.obtener_grupos_usuario(usuario_id)
            return 100 if len(grupos) > 0 else 0

        elif nombre_insignia == 'Benchmarking Experto':
            grupos = Usuario_Benchmarking.obtener_grupos_usuario(usuario_id)
            return round(min(len(grupos) / 15 * 100, 100))

        elif nombre_insignia == 'Inversor Estratégico':
            db = get_db_connection()
            query = """
            SELECT COUNT(*) as count
            FROM Resultados r
            JOIN Simulaciones s ON r.simulacion_id = s.simulacion_id
            WHERE s.usuario_id = %s AND r.indicador = 'Portafolio'
            """
            try:
                db.connect()
                result = db.execute_query(query, (usuario_id,), fetch=True)
                if result:
                    count = result[0]['count']
                    return round(min(count / 20 * 100, 100))
                return 0
            except Exception as e:
                print(f"Error calculando progreso Inversor Estratégico: {e}")
                return 0
            finally:
                db.disconnect()

        # Para insignias que no tienen progreso calculable, devolver 0 (no mostrar en próximos logros)
        return 0

    @staticmethod
    def obtener_actividad_reciente(usuario_id, limite=5):
        """Obtener actividad reciente del usuario"""
        actividades = []

        # Obtener insignias recientes
        insignias_recientes = Usuario_Insignia.obtener_insignias_usuario(usuario_id)
        for item in insignias_recientes[-limite:]:
            fecha = item['fecha_obtenida']
            if hasattr(fecha, 'strftime'):
                tiempo_str = fecha.strftime('%Y-%m-%d %H:%M:%S')
            else:
                tiempo_str = str(fecha)
            actividades.append({
                'descripcion': f'Obtuviste la insignia "{item["insignia"]["nombre_insig"]}"',
                'puntos': '+100',
                'tiempo': tiempo_str,
                'icono': 'medal',
                'color': 'bg-green-100 text-green-600'
            })

        # Obtener simulaciones recientes
        db = get_db_connection()
        query = """
        SELECT s.fecha_creacion, COUNT(r.resultado_id) as num_calculos
        FROM Simulaciones s
        LEFT JOIN Resultados r ON s.simulacion_id = r.simulacion_id
        WHERE s.usuario_id = %s
        GROUP BY s.simulacion_id, s.fecha_creacion
        ORDER BY s.fecha_creacion DESC
        LIMIT %s
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id, limite), fetch=True)
            if result:
                for row in result:
                    fecha = row['fecha_creacion']
                    if hasattr(fecha, 'strftime'):
                        tiempo_str = fecha.strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        tiempo_str = str(fecha)
                    actividades.append({
                        'descripcion': f'Completaste una simulación financiera',
                        'puntos': '+25',
                        'tiempo': tiempo_str,
                        'icono': 'calculator',
                        'color': 'bg-blue-100 text-blue-600'
                    })
        except Exception as e:
            print(f"Error obteniendo actividad reciente: {e}")
        finally:
            db.disconnect()

        # Ordenar por tiempo descendente y limitar
        actividades.sort(key=lambda x: x['tiempo'], reverse=True)
        return actividades[:limite]
