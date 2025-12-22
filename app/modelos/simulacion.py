from app.utils.base_datos import get_db_connection
import json

class Simulacion:
    def __init__(self, simulacion_id=None, usuario_id=None, tipo_simulacion=None, nombre=None, parametros=None, resultados=None, fecha=None):
        self.simulacion_id = simulacion_id
        self.usuario_id = usuario_id
        self.tipo_simulacion = tipo_simulacion
        self.nombre = nombre
        self.parametros = parametros or {}
        self.resultados = resultados or {}
        self.fecha = fecha

    @staticmethod
    def crear(usuario_id, nombre, tipo_simulacion, parametros=None, resultados=None):
        """Crear una nueva simulación completa"""
        db = get_db_connection()

        # Convertir parámetros y resultados a JSON si son diccionarios
        parametros_json = json.dumps(parametros) if parametros else None
        resultados_json = json.dumps(resultados) if resultados else None

        query = """
        INSERT INTO Simulaciones (usuario_id, nombre, tipo_simulacion, parametros, resultados)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING simulacion_id
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id, nombre, tipo_simulacion, parametros_json, resultados_json), fetch=True)
            db.commit()
            if result:
                simulacion_id = result[0]['simulacion_id']
                return Simulacion(
                    simulacion_id=simulacion_id,
                    usuario_id=usuario_id,
                    nombre=nombre,
                    tipo_simulacion=tipo_simulacion,
                    parametros=parametros,
                    resultados=resultados
                )
            return None
        except Exception as e:
            print(f"Error creando simulación: {e}")
            db.rollback()
            return None
        finally:
            db.disconnect()

    @staticmethod
    def crear_simulacion(usuario_id, tipo_simulacion):
        """Crear una nueva simulación básica (compatibilidad)"""
        return Simulacion.crear(usuario_id, f"Simulación {tipo_simulacion}", tipo_simulacion)

    @staticmethod
    def obtener_simulacion_por_id(simulacion_id):
        """Obtener simulación por ID"""
        db = get_db_connection()
        query = "SELECT * FROM Simulaciones WHERE simulacion_id = %s"
        try:
            db.connect()
            result = db.execute_query(query, (simulacion_id,), fetch=True)
            if result:
                data = result[0]
                # Convert sqlite3.Row to dict for mutability
                if hasattr(data, 'keys'):  # sqlite3.Row or dict-like
                    data_dict = dict(data)
                else:
                    data_dict = data

                # Parse JSON fields back to dictionaries
                if data_dict.get('parametros'):
                    try:
                        data_dict['parametros'] = json.loads(data_dict['parametros']) if isinstance(data_dict['parametros'], str) else data_dict['parametros']
                    except (json.JSONDecodeError, TypeError):
                        data_dict['parametros'] = {}
                else:
                    data_dict['parametros'] = {}

                if data_dict.get('resultados'):
                    try:
                        data_dict['resultados'] = json.loads(data_dict['resultados']) if isinstance(data_dict['resultados'], str) else data_dict['resultados']
                    except (json.JSONDecodeError, TypeError):
                        data_dict['resultados'] = {}
                else:
                    data_dict['resultados'] = {}

                return Simulacion(**data_dict)
            return None
        except Exception as e:
            print(f"Error obteniendo simulación: {e}")
            return None
        finally:
            db.disconnect()

    @staticmethod
    def obtener_simulaciones_usuario(usuario_id, limite=50):
        """Obtener simulaciones de un usuario"""
        db = get_db_connection()
        query = """
        SELECT * FROM Simulaciones
        WHERE usuario_id = %s
        ORDER BY fecha DESC
        LIMIT %s
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id, limite), fetch=True)
            simulaciones = []
            if result:
                for data in result:
                    # Convert sqlite3.Row to dict for mutability
                    if hasattr(data, 'keys'):  # sqlite3.Row or dict-like
                        data_dict = dict(data)
                    else:
                        data_dict = data

                    # Parse JSON fields back to dictionaries
                    if data_dict.get('parametros'):
                        try:
                            data_dict['parametros'] = json.loads(data_dict['parametros']) if isinstance(data_dict['parametros'], str) else data_dict['parametros']
                        except (json.JSONDecodeError, TypeError):
                            data_dict['parametros'] = {}
                    else:
                        data_dict['parametros'] = {}

                    if data_dict.get('resultados'):
                        try:
                            data_dict['resultados'] = json.loads(data_dict['resultados']) if isinstance(data_dict['resultados'], str) else data_dict['resultados']
                        except (json.JSONDecodeError, TypeError):
                            data_dict['resultados'] = {}
                    else:
                        data_dict['resultados'] = {}

                    simulaciones.append(Simulacion(**data_dict))
            return simulaciones
        except Exception as e:
            print(f"Error obteniendo simulaciones del usuario: {e}")
            return []
        finally:
            db.disconnect()

    @staticmethod
    def contar_simulaciones_usuario(usuario_id):
        """Contar total de simulaciones de un usuario"""
        db = get_db_connection()
        query = "SELECT COUNT(*) as count FROM Simulaciones WHERE usuario_id = %s"
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id,), fetch=True)
            if result:
                return result[0]['count']
            return 0
        except Exception as e:
            print(f"Error contando simulaciones: {e}")
            return 0
        finally:
            db.disconnect()

    def to_dict(self):
        """Convertir objeto a diccionario"""
        return {
            'simulacion_id': self.simulacion_id,
            'usuario_id': self.usuario_id,
            'tipo_simulacion': self.tipo_simulacion,
            'fecha': self.fecha
        }


class Resultado:
    def __init__(self, resultado_id=None, simulacion_id=None, indicador=None, valor=None):
        self.resultado_id = resultado_id
        self.simulacion_id = simulacion_id
        self.indicador = indicador
        self.valor = valor

    @staticmethod
    def guardar_resultado(simulacion_id, indicador, valor):
        """Guardar un resultado de simulación"""
        db = get_db_connection()
        query = """
        INSERT INTO Resultados (simulacion_id, indicador, valor)
        VALUES (%s, %s, %s)
        RETURNING resultado_id
        """
        try:
            db.connect()
            result = db.execute_query(query, (simulacion_id, indicador, valor), fetch=True)
            db.commit()
            if result:
                return result[0]['resultado_id']
            return None
        except Exception as e:
            print(f"Error guardando resultado: {e}")
            return None
        finally:
            db.disconnect()

    @staticmethod
    def obtener_resultados_simulacion(simulacion_id):
        """Obtener todos los resultados de una simulación"""
        db = get_db_connection()
        query = "SELECT * FROM Resultados WHERE simulacion_id = %s ORDER BY indicador"
        try:
            db.connect()
            result = db.execute_query(query, (simulacion_id,), fetch=True)
            resultados = []
            if result:
                for data in result:
                    resultados.append(Resultado(**data))
            return resultados
        except Exception as e:
            print(f"Error obteniendo resultados: {e}")
            return []
        finally:
            db.disconnect()

    @staticmethod
    def obtener_resultados_usuario_por_tipo(usuario_id, tipo_simulacion, limite=10):
        """Obtener resultados de simulaciones de un usuario por tipo"""
        db = get_db_connection()
        query = """
        SELECT r.*, s.fecha, s.tipo_simulacion
        FROM Resultados r
        JOIN Simulaciones s ON r.simulacion_id = s.simulacion_id
        WHERE s.usuario_id = %s AND s.tipo_simulacion = %s
        ORDER BY s.fecha DESC
        LIMIT %s
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id, tipo_simulacion, limite), fetch=True)
            resultados = []
            if result:
                for data in result:
                    resultado = Resultado(
                        resultado_id=data['resultado_id'],
                        simulacion_id=data['simulacion_id'],
                        indicador=data['indicador'],
                        valor=data['valor']
                    )
                    resultados.append({
                        'resultado': resultado.to_dict(),
                        'fecha': data['fecha'],
                        'tipo_simulacion': data['tipo_simulacion']
                    })
            return resultados
        except Exception as e:
            print(f"Error obteniendo resultados por tipo: {e}")
            return []
        finally:
            db.disconnect()

    @staticmethod
    def calcular_promedio_sector(indicador, sector=None):
        """Calcular promedio de un indicador en un sector"""
        db = get_db_connection()
        query = """
        SELECT AVG(r.valor) as promedio
        FROM Resultados r
        JOIN Simulaciones s ON r.simulacion_id = s.simulacion_id
        JOIN Usuarios u ON s.usuario_id = u.usuario_id
        WHERE r.indicador = %s
        """
        params = [indicador]

        if sector:
            query += " AND u.nivel = %s"
            params.append(sector)

        try:
            db.connect()
            result = db.execute_query(query, tuple(params), fetch=True)
            if result and result[0]['promedio']:
                return float(result[0]['promedio'])
            return 0.0
        except Exception as e:
            print(f"Error calculando promedio: {e}")
            return 0.0
        finally:
            db.disconnect()

    def to_dict(self):
        """Convertir objeto a diccionario"""
        return {
            'resultado_id': self.resultado_id,
            'simulacion_id': self.simulacion_id,
            'indicador': self.indicador,
            'valor': self.valor
        }
