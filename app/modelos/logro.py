from app.utils.base_datos import get_db_connection
from datetime import datetime

class Insignia:
    def __init__(self, insignia_id=None, nombre_insig=None, descripcion_insig=None):
        self.insignia_id = insignia_id
        self.nombre_insig = nombre_insig
        self.descripcion_insig = descripcion_insig

    @staticmethod
    def crear_insignia(nombre_insig, descripcion_insig):
        """Crear una nueva insignia"""
        db = get_db_connection()
        query = """
        INSERT INTO Insignias (nombre_insig, descripcion_insig)
        VALUES (%s, %s)
        RETURNING insignia_id
        """
        try:
            db.connect()
            result = db.execute_query(query, (nombre_insig, descripcion_insig), fetch=True)
            db.commit()
            if result:
                return result[0]['insignia_id']
            return None
        except Exception as e:
            print(f"Error creando insignia: {e}")
            return None
        finally:
            db.disconnect()

    @staticmethod
    def obtener_insignia_por_id(insignia_id):
        """Obtener insignia por ID"""
        db = get_db_connection()
        query = "SELECT * FROM Insignias WHERE insignia_id = %s"
        try:
            db.connect()
            result = db.execute_query(query, (insignia_id,), fetch=True)
            if result:
                data = result[0]
                return Insignia(**data)
            return None
        except Exception as e:
            print(f"Error obteniendo insignia: {e}")
            return None
        finally:
            db.disconnect()

    @staticmethod
    def listar_insignias():
        """Listar todas las insignias"""
        db = get_db_connection()
        query = "SELECT * FROM Insignias ORDER BY insignia_id"
        try:
            db.connect()
            result = db.execute_query(query, fetch=True)
            insignias = []
            if result:
                for data in result:
                    insignias.append(Insignia(**data))
            return insignias
        except Exception as e:
            print(f"Error listando insignias: {e}")
            return []
        finally:
            db.disconnect()

    def to_dict(self):
        """Convertir objeto a diccionario"""
        return {
            'insignia_id': self.insignia_id,
            'nombre_insig': self.nombre_insig,
            'descripcion_insig': self.descripcion_insig
        }


class Usuario_Insignia:
    def __init__(self, insignia_id=None, usuario_id=None, fecha_obtenida=None):
        self.insignia_id = insignia_id
        self.usuario_id = usuario_id
        self.fecha_obtenida = fecha_obtenida

    @staticmethod
    def otorgar_insignia(usuario_id, insignia_id):
        """Otorgar insignia a un usuario"""
        db = get_db_connection()
        query = """
        INSERT INTO Usuario_Insignia (insignia_id, usuario_id)
        VALUES (%s, %s)
        ON CONFLICT (usuario_id, insignia_id) DO NOTHING
        """
        try:
            db.connect()
            success = db.execute_query(query, (insignia_id, usuario_id))
            if success:
                db.commit()
                return True
            return False
        except Exception as e:
            print(f"Error otorgando insignia: {e}")
            return False
        finally:
            db.disconnect()

    @staticmethod
    def obtener_insignias_usuario(usuario_id):
        """Obtener todas las insignias de un usuario"""
        db = get_db_connection()
        query = """
        SELECT i.*, ui.fecha_obtenida
        FROM Insignias i
        JOIN Usuario_Insignia ui ON i.insignia_id = ui.insignia_id
        WHERE ui.usuario_id = %s
        ORDER BY ui.fecha_obtenida DESC
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id,), fetch=True)
            insignias = []
            if result:
                for data in result:
                    insignia = Insignia(
                        insignia_id=data['insignia_id'],
                        nombre_insig=data['nombre_insig'],
                        descripcion_insig=data['descripcion_insig']
                    )
                    insignias.append({
                        'insignia': insignia.to_dict(),
                        'fecha_obtenida': data['fecha_obtenida']
                    })
            return insignias
        except Exception as e:
            print(f"Error obteniendo insignias del usuario: {e}")
            return []
        finally:
            db.disconnect()

    @staticmethod
    def verificar_insignia_usuario(usuario_id, insignia_id):
        """Verificar si un usuario tiene una insignia específica"""
        db = get_db_connection()
        query = """
        SELECT COUNT(*) as count
        FROM Usuario_Insignia
        WHERE usuario_id = %s AND insignia_id = %s
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id, insignia_id), fetch=True)
            if result:
                return result[0]['count'] > 0
            return False
        except Exception as e:
            print(f"Error verificando insignia: {e}")
            return False
        finally:
            db.disconnect()


class Ranking:
    def __init__(self, ranking_id=None, usuario_id=None, puntaje=None, sector=None, fecha=None):
        self.ranking_id = ranking_id
        self.usuario_id = usuario_id
        self.puntaje = puntaje
        self.sector = sector
        self.fecha = fecha

    @staticmethod
    def crear_ranking(usuario_id, puntaje, sector):
        """Crear un nuevo ranking para un usuario"""
        db = get_db_connection()
        query = """
        INSERT INTO Ranking (usuario_id, puntaje, sector)
        VALUES (%s, %s, %s)
        RETURNING ranking_id
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id, puntaje, sector), fetch=True)
            db.commit()
            if result:
                return result[0]['ranking_id']
            return None
        except Exception as e:
            print(f"Error creando ranking: {e}")
            return None
        finally:
            db.disconnect()

    @staticmethod
    def actualizar_puntaje_usuario(usuario_id, sector, nuevo_puntaje):
        """Actualizar o crear puntaje de usuario en un sector"""
        db = get_db_connection()
        # Primero verificar si existe un ranking para este usuario en este sector
        check_query = """
        SELECT ranking_id FROM Ranking
        WHERE usuario_id = %s AND sector = %s
        ORDER BY fecha DESC LIMIT 1
        """
        update_query = """
        UPDATE Ranking SET puntaje = %s, fecha = CURRENT_TIMESTAMP
        WHERE ranking_id = %s
        """
        insert_query = """
        INSERT INTO Ranking (usuario_id, puntaje, sector)
        VALUES (%s, %s, %s)
        """

        try:
            db.connect()
            # Verificar si existe
            result = db.execute_query(check_query, (usuario_id, sector), fetch=True)
            if result:
                # Actualizar
                ranking_id = result[0]['ranking_id']
                success = db.execute_query(update_query, (nuevo_puntaje, ranking_id))
            else:
                # Insertar nuevo
                success = db.execute_query(insert_query, (usuario_id, nuevo_puntaje, sector))

            if success:
                db.commit()
                return True
            return False
        except Exception as e:
            print(f"Error actualizando puntaje: {e}")
            return False
        finally:
            db.disconnect()

    @staticmethod
    def obtener_ranking_sector(sector, limite=10):
        """Obtener ranking de un sector específico"""
        db = get_db_connection()
        query = """
        SELECT r.*, u.nombre_usuario, u.nombres, u.apellidos
        FROM Ranking r
        JOIN Usuarios u ON r.usuario_id = u.usuario_id
        WHERE r.sector = %s
        ORDER BY r.puntaje DESC, r.fecha DESC
        LIMIT %s
        """
        try:
            db.connect()
            result = db.execute_query(query, (sector, limite), fetch=True)
            rankings = []
            if result:
                for data in result:
                    ranking = Ranking(
                        ranking_id=data['ranking_id'],
                        usuario_id=data['usuario_id'],
                        puntaje=data['puntaje'],
                        sector=data['sector'],
                        fecha=data['fecha']
                    )
                    rankings.append({
                        'ranking': ranking.to_dict(),
                        'usuario': {
                            'usuario_id': data['usuario_id'],
                            'nombre_usuario': data['nombre_usuario'],
                            'nombres': data['nombres'],
                            'apellidos': data['apellidos']
                        }
                    })
            return rankings
        except Exception as e:
            print(f"Error obteniendo ranking del sector: {e}")
            return []
        finally:
            db.disconnect()

    @staticmethod
    def obtener_ranking_usuario(usuario_id):
        """Obtener rankings de un usuario específico"""
        db = get_db_connection()
        query = """
        SELECT * FROM Ranking
        WHERE usuario_id = %s
        ORDER BY fecha DESC
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id,), fetch=True)
            rankings = []
            if result:
                for data in result:
                    rankings.append(Ranking(**data))
            return rankings
        except Exception as e:
            print(f"Error obteniendo rankings del usuario: {e}")
            return []
        finally:
            db.disconnect()

    def to_dict(self):
        """Convertir objeto a diccionario"""
        return {
            'ranking_id': self.ranking_id,
            'usuario_id': self.usuario_id,
            'puntaje': self.puntaje,
            'sector': self.sector,
            'fecha': self.fecha
        }
