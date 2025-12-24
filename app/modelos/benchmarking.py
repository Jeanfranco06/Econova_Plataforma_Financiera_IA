import json
from app.utils.base_datos import get_db_connection

class Benchmarking_Grupo:
    def __init__(self, benchmarking_id=None, nombre_grupo=None, descripcion=None):
        self.benchmarking_id = benchmarking_id
        self.nombre_grupo = nombre_grupo
        self.descripcion = descripcion

    @staticmethod
    def crear_grupo(nombre_grupo, descripcion):
        """Crear un nuevo grupo de benchmarking"""
        db = get_db_connection()
        query = """
        INSERT INTO Benchmarking_Grupo (nombre_grupo, descripcion)
        VALUES (%s, %s)
        RETURNING benchmarking_id
        """
        try:
            db.connect()
            result = db.execute_query(query, (nombre_grupo, descripcion), fetch=True)
            db.commit()
            if result:
                return result[0]['benchmarking_id']
            return None
        except Exception as e:
            print(f"Error creando grupo de benchmarking: {e}")
            return None
        finally:
            db.disconnect()

    @staticmethod
    def listar_grupos():
        """Listar todos los grupos de benchmarking"""
        db = get_db_connection()
        query = "SELECT * FROM Benchmarking_Grupo ORDER BY nombre_grupo"
        try:
            db.connect()
            result = db.execute_query(query, fetch=True)
            grupos = []
            if result:
                for row in result:
                    grupos.append(Benchmarking_Grupo(**dict(row)))
            return grupos
        except Exception as e:
            print(f"Error listando grupos de benchmarking: {e}")
            return []
        finally:
            db.disconnect()

    @staticmethod
    def obtener_grupo_por_id(benchmarking_id):
        """Obtener un grupo específico por ID"""
        db = get_db_connection()
        query = "SELECT * FROM Benchmarking_Grupo WHERE benchmarking_id = %s"
        try:
            db.connect()
            result = db.execute_query(query, (benchmarking_id,), fetch=True)
            if result:
                return Benchmarking_Grupo(**dict(result[0]))
            return None
        except Exception as e:
            print(f"Error obteniendo grupo por ID: {e}")
            return None
        finally:
            db.disconnect()

    def to_dict(self):
        """Convertir objeto a diccionario"""
        return {
            'benchmarking_id': self.benchmarking_id,
            'nombre_grupo': self.nombre_grupo,
            'descripcion': self.descripcion
        }


class Analisis_Benchmarking:
    def __init__(self, analisis_id=None, usuario_id=None, tipo_analisis=None, datos=None, resultados=None, recomendaciones=None, fecha=None):
        self.analisis_id = analisis_id
        self.usuario_id = usuario_id
        self.tipo_analisis = tipo_analisis  # 'sectorial' o 'personalizado'
        self.datos = datos or {}
        self.resultados = resultados or {}
        self.recomendaciones = recomendaciones or []
        self.fecha = fecha

    @staticmethod
    def guardar_analisis(usuario_id, tipo_analisis, datos, resultados=None, recomendaciones=None):
        """Guardar un análisis de benchmarking completo"""
        db = get_db_connection()

        # Convertir datos a JSON
        datos_json = json.dumps(datos) if datos else None
        resultados_json = json.dumps(resultados) if resultados else None
        recomendaciones_json = json.dumps(recomendaciones) if recomendaciones else None

        query = """
        INSERT INTO Analisis_Benchmarking (usuario_id, tipo_analisis, datos, resultados, recomendaciones)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING analisis_id
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id, tipo_analisis, datos_json, resultados_json, recomendaciones_json), fetch=True)
            db.commit()
            if result:
                analisis_id = result[0]['analisis_id']
                return Analisis_Benchmarking(
                    analisis_id=analisis_id,
                    usuario_id=usuario_id,
                    tipo_analisis=tipo_analisis,
                    datos=datos,
                    resultados=resultados,
                    recomendaciones=recomendaciones
                )
            return None
        except Exception as e:
            print(f"Error guardando análisis de benchmarking: {e}")
            return None
        finally:
            db.disconnect()

    @staticmethod
    def obtener_analisis_usuario(usuario_id, limite=50):
        """Obtener análisis de benchmarking de un usuario"""
        db = get_db_connection()
        query = """
        SELECT * FROM Analisis_Benchmarking
        WHERE usuario_id = %s
        ORDER BY fecha DESC
        LIMIT %s
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id, limite), fetch=True)
            analisis = []
            if result:
                for row in result:
                    # Convertir Row a dict para permitir modificaciones
                    data = dict(row)
                    # Parsear JSON
                    if data['datos']:
                        data['datos'] = json.loads(data['datos'])
                    if data['resultados']:
                        data['resultados'] = json.loads(data['resultados'])
                    if data['recomendaciones']:
                        data['recomendaciones'] = json.loads(data['recomendaciones'])

                    analisis.append(Analisis_Benchmarking(**data))
            return analisis
        except Exception as e:
            print(f"Error obteniendo análisis del usuario: {e}")
            return []
        finally:
            db.disconnect()

    @staticmethod
    def obtener_analisis_por_id(analisis_id):
        """Obtener un análisis específico por ID"""
        db = get_db_connection()
        query = "SELECT * FROM Analisis_Benchmarking WHERE analisis_id = %s"
        try:
            db.connect()
            result = db.execute_query(query, (analisis_id,), fetch=True)
            if result:
                # Convertir Row a dict para permitir modificaciones
                data = dict(result[0])
                # Parsear JSON
                if data['datos']:
                    data['datos'] = json.loads(data['datos'])
                if data['resultados']:
                    data['resultados'] = json.loads(data['resultados'])
                if data['recomendaciones']:
                    data['recomendaciones'] = json.loads(data['recomendaciones'])

                return Analisis_Benchmarking(**data)
            return None
        except Exception as e:
            print(f"Error obteniendo análisis por ID: {e}")
            return None
        finally:
            db.disconnect()

    def to_dict(self):
        """Convertir objeto a diccionario"""
        return {
            'analisis_id': self.analisis_id,
            'usuario_id': self.usuario_id,
            'tipo_analisis': self.tipo_analisis,
            'datos': self.datos,
            'resultados': self.resultados,
            'recomendaciones': self.recomendaciones,
            'fecha': self.fecha
        }





class Usuario_Benchmarking:
    def __init__(self, usuario_id=None, benchmarking_id=None):
        self.usuario_id = usuario_id
        self.benchmarking_id = benchmarking_id

    @staticmethod
    def agregar_usuario_a_grupo(usuario_id, benchmarking_id):
        """Agregar un usuario a un grupo de benchmarking"""
        db = get_db_connection()
        query = """
        INSERT INTO Usuario_Benchmarking (usuario_id, benchmarking_id)
        VALUES (%s, %s)
        ON CONFLICT (usuario_id, benchmarking_id) DO NOTHING
        """
        try:
            db.connect()
            success = db.execute_query(query, (usuario_id, benchmarking_id))
            if success:
                db.commit()
                return True
            return False
        except Exception as e:
            print(f"Error agregando usuario al grupo: {e}")
            return False
        finally:
            db.disconnect()

    @staticmethod
    def remover_usuario_de_grupo(usuario_id, benchmarking_id):
        """Remover un usuario de un grupo de benchmarking"""
        db = get_db_connection()
        query = """
        DELETE FROM Usuario_Benchmarking
        WHERE usuario_id = %s AND benchmarking_id = %s
        """
        try:
            db.connect()
            success = db.execute_query(query, (usuario_id, benchmarking_id))
            if success:
                db.commit()
                return True
            return False
        except Exception as e:
            print(f"Error removiendo usuario del grupo: {e}")
            return False
        finally:
            db.disconnect()

    @staticmethod
    def obtener_grupos_usuario(usuario_id):
        """Obtener todos los grupos de benchmarking de un usuario"""
        db = get_db_connection()
        query = """
        SELECT bg.*
        FROM Benchmarking_Grupo bg
        JOIN Usuario_Benchmarking ub ON bg.benchmarking_id = ub.benchmarking_id
        WHERE ub.usuario_id = %s
        ORDER BY bg.nombre_grupo
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id,), fetch=True)
            grupos = []
            if result:
                for data in result:
                    grupos.append(Benchmarking_Grupo(**data))
            return grupos
        except Exception as e:
            print(f"Error obteniendo grupos del usuario: {e}")
            return []
        finally:
            db.disconnect()

    @staticmethod
    def obtener_usuarios_en_grupo(benchmarking_id):
        """Obtener todos los usuarios en un grupo de benchmarking"""
        db = get_db_connection()
        query = """
        SELECT u.*
        FROM Usuarios u
        JOIN Usuario_Benchmarking ub ON u.usuario_id = ub.usuario_id
        WHERE ub.benchmarking_id = %s
        ORDER BY u.nombre_usuario
        """
        try:
            db.connect()
            result = db.execute_query(query, (benchmarking_id,), fetch=True)
            usuarios = []
            if result:
                from app.modelos.usuario import Usuario
                for data in result:
                    usuarios.append(Usuario(**data))
            return usuarios
        except Exception as e:
            print(f"Error obteniendo usuarios del grupo: {e}")
            return []
        finally:
            db.disconnect()

    @staticmethod
    def verificar_usuario_en_grupo(usuario_id, benchmarking_id):
        """Verificar si un usuario pertenece a un grupo específico"""
        db = get_db_connection()
        query = """
        SELECT COUNT(*) as count
        FROM Usuario_Benchmarking
        WHERE usuario_id = %s AND benchmarking_id = %s
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id, benchmarking_id), fetch=True)
            if result:
                return result[0]['count'] > 0
            return False
        except Exception as e:
            print(f"Error verificando usuario en grupo: {e}")
            return False
        finally:
            db.disconnect()


class BenchmarkingService:
    @staticmethod
    def comparar_con_grupo(usuario_id, indicador, benchmarking_id=None):
        """Comparar el rendimiento de un usuario con su grupo de benchmarking"""
        from app.modelos.simulacion import Resultado

        db = get_db_connection()

        # Obtener el promedio del usuario para el indicador
        query_usuario = """
        SELECT AVG(r.valor) as promedio_usuario
        FROM Resultados r
        JOIN Simulaciones s ON r.simulacion_id = s.simulacion_id
        WHERE s.usuario_id = %s AND r.indicador = %s
        """

        # Obtener el promedio del grupo para el indicador
        if benchmarking_id:
            query_grupo = """
            SELECT AVG(r.valor) as promedio_grupo
            FROM Resultados r
            JOIN Simulaciones s ON r.simulacion_id = s.simulacion_id
            JOIN Usuario_Benchmarking ub ON s.usuario_id = ub.usuario_id
            WHERE ub.benchmarking_id = %s AND r.indicador = %s
            """
        else:
            # Si no se especifica grupo, comparar con todos los usuarios
            query_grupo = """
            SELECT AVG(r.valor) as promedio_grupo
            FROM Resultados r
            JOIN Simulaciones s ON r.simulacion_id = s.simulacion_id
            WHERE r.indicador = %s
            """

        try:
            db.connect()

            # Obtener promedio del usuario
            result_usuario = db.execute_query(query_usuario, (usuario_id, indicador), fetch=True)
            promedio_usuario = result_usuario[0]['promedio_usuario'] if result_usuario and result_usuario[0]['promedio_usuario'] else 0

            # Obtener promedio del grupo
            if benchmarking_id:
                result_grupo = db.execute_query(query_grupo, (benchmarking_id, indicador), fetch=True)
            else:
                result_grupo = db.execute_query(query_grupo, (indicador,), fetch=True)

            promedio_grupo = result_grupo[0]['promedio_grupo'] if result_grupo and result_grupo[0]['promedio_grupo'] else 0

            # Calcular percentil del usuario en el grupo
            if benchmarking_id:
                query_percentil = """
                SELECT COUNT(*) as total_usuarios,
                       SUM(CASE WHEN r_avg.avg_valor <= %s THEN 1 ELSE 0 END) as usuarios_debajo
                FROM (
                    SELECT s.usuario_id, AVG(r.valor) as avg_valor
                    FROM Resultados r
                    JOIN Simulaciones s ON r.simulacion_id = s.simulacion_id
                    JOIN Usuario_Benchmarking ub ON s.usuario_id = ub.usuario_id
                    WHERE ub.benchmarking_id = %s AND r.indicador = %s
                    GROUP BY s.usuario_id
                ) r_avg
                """
                result_percentil = db.execute_query(query_percentil, (promedio_usuario, benchmarking_id, indicador), fetch=True)
            else:
                query_percentil = """
                SELECT COUNT(*) as total_usuarios,
                       SUM(CASE WHEN r_avg.avg_valor <= %s THEN 1 ELSE 0 END) as usuarios_debajo
                FROM (
                    SELECT s.usuario_id, AVG(r.valor) as avg_valor
                    FROM Resultados r
                    JOIN Simulaciones s ON r.simulacion_id = s.simulacion_id
                    WHERE r.indicador = %s
                    GROUP BY s.usuario_id
                ) r_avg
                """
                result_percentil = db.execute_query(query_percentil, (promedio_usuario, indicador), fetch=True)

            if result_percentil and result_percentil[0]['total_usuarios'] > 0:
                total_usuarios = result_percentil[0]['total_usuarios']
                usuarios_debajo = result_percentil[0]['usuarios_debajo']
                percentil = (usuarios_debajo / total_usuarios) * 100
            else:
                percentil = 0

            return {
                'indicador': indicador,
                'promedio_usuario': float(promedio_usuario) if promedio_usuario else 0,
                'promedio_grupo': float(promedio_grupo) if promedio_grupo else 0,
                'percentil': float(percentil),
                'comparacion': 'superior' if promedio_usuario > promedio_grupo else 'inferior' if promedio_usuario < promedio_grupo else 'igual'
            }

        except Exception as e:
            print(f"Error en comparación de benchmarking: {e}")
            return None
        finally:
            db.disconnect()

    @staticmethod
    def obtener_estadisticas_grupo(benchmarking_id, indicador):
        """Obtener estadísticas detalladas de un grupo para un indicador"""
        db = get_db_connection()
        query = """
        SELECT
            COUNT(DISTINCT s.usuario_id) as total_usuarios,
            AVG(r.valor) as promedio,
            MIN(r.valor) as minimo,
            MAX(r.valor) as maximo,
            STDDEV(r.valor) as desviacion_estandar
        FROM Resultados r
        JOIN Simulaciones s ON r.simulacion_id = s.simulacion_id
        JOIN Usuario_Benchmarking ub ON s.usuario_id = ub.usuario_id
        WHERE ub.benchmarking_id = %s AND r.indicador = %s
        """
        try:
            db.connect()
            result = db.execute_query(query, (benchmarking_id, indicador), fetch=True)
            if result and result[0]['total_usuarios']:
                stats = result[0]
                return {
                    'total_usuarios': stats['total_usuarios'],
                    'promedio': float(stats['promedio']) if stats['promedio'] else 0,
                    'minimo': float(stats['minimo']) if stats['minimo'] else 0,
                    'maximo': float(stats['maximo']) if stats['maximo'] else 0,
                    'desviacion_estandar': float(stats['desviacion_estandar']) if stats['desviacion_estandar'] else 0
                }
            return None
        except Exception as e:
            print(f"Error obteniendo estadísticas del grupo: {e}")
            return None
        finally:
            db.disconnect()
