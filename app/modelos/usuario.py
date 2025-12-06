from app.utils.base_datos import get_db_connection


class Usuario:
    def __init__(
        self,
        usuario_id=None,
        nombre_usuario=None,
        nombres=None,
        apellidos=None,
        email=None,
        nivel=None,
    ):
        self.usuario_id = usuario_id
        self.nombre_usuario = nombre_usuario
        self.nombres = nombres
        self.apellidos = apellidos
        self.email = email
        self.nivel = nivel

    @staticmethod
    def crear_usuario(nombre_usuario, nombres, apellidos, email, nivel="Principiante"):
        """Crear un nuevo usuario"""
        db = get_db_connection()
        query = """
        INSERT INTO Usuarios (nombre_usuario, nombres, apellidos, email, nivel)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING usuario_id
        """
        try:
            db.connect()
            result = db.execute_query(
                query, (nombre_usuario, nombres, apellidos, email, nivel), fetch=True
            )
            db.commit()
            if result:
                return result[0]["usuario_id"]
            return None
        except Exception as e:
            print(f"Error creando usuario: {e}")
            return None
        finally:
            db.disconnect()

    @staticmethod
    def obtener_usuario_por_id(usuario_id):
        """Obtener usuario por ID"""
        db = get_db_connection()
        query = "SELECT * FROM Usuarios WHERE usuario_id = %s"
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id,), fetch=True)
            if result:
                data = result[0]
                return Usuario(**data)
            return None
        except Exception as e:
            print(f"Error obteniendo usuario: {e}")
            return None
        finally:
            db.disconnect()

    @staticmethod
    def obtener_usuario_por_email(email):
        """Obtener usuario por email"""
        db = get_db_connection()
        query = "SELECT * FROM Usuarios WHERE email = %s"
        try:
            db.connect()
            result = db.execute_query(query, (email,), fetch=True)
            if result:
                data = result[0]
                return Usuario(**data)
            return None
        except Exception as e:
            print(f"Error obteniendo usuario por email: {e}")
            return None
        finally:
            db.disconnect()

    @staticmethod
    def actualizar_nivel(usuario_id, nuevo_nivel):
        """Actualizar nivel del usuario"""
        db = get_db_connection()
        query = "UPDATE Usuarios SET nivel = %s WHERE usuario_id = %s"
        try:
            db.connect()
            success = db.execute_query(query, (nuevo_nivel, usuario_id))
            if success:
                db.commit()
                return True
            return False
        except Exception as e:
            print(f"Error actualizando nivel: {e}")
            return False
        finally:
            db.disconnect()

    @staticmethod
    def obtener_estadisticas(usuario_id):
        """Obtener estadísticas del usuario"""
        from app.modelos.simulacion import Simulacion

        try:
            usuario = Usuario.obtener_usuario_por_id(usuario_id)
            if not usuario:
                return None

            # Obtener cantidad de simulaciones
            simulaciones = Simulacion.obtener_simulaciones_usuario(
                usuario_id, limite=1000
            )
            total_simulaciones = len(simulaciones)

            # Contar por tipo
            simulaciones_por_tipo = {}
            for sim in simulaciones:
                tipo = sim.tipo_simulacion
                simulaciones_por_tipo[tipo] = simulaciones_por_tipo.get(tipo, 0) + 1

            return {
                "usuario_id": usuario_id,
                "total_simulaciones": total_simulaciones,
                "simulaciones_por_tipo": simulaciones_por_tipo,
                "nivel": usuario.nivel,
                "nombre": f"{usuario.nombres} {usuario.apellidos}",
            }
        except Exception as e:
            print(f"Error obteniendo estadísticas: {e}")
            return None

    @staticmethod
    def listar_usuarios():
        """Listar todos los usuarios"""
        db = get_db_connection()
        query = "SELECT * FROM Usuarios ORDER BY usuario_id"
        try:
            db.connect()
            result = db.execute_query(query, fetch=True)
            usuarios = []
            if result:
                for data in result:
                    usuarios.append(Usuario(**data))
            return usuarios
        except Exception as e:
            print(f"Error listando usuarios: {e}")
            return []
        finally:
            db.disconnect()

    def to_dict(self):
        """Convertir objeto a diccionario"""
        return {
            "usuario_id": self.usuario_id,
            "nombre_usuario": self.nombre_usuario,
            "nombres": self.nombres,
            "apellidos": self.apellidos,
            "email": self.email,
            "nivel": self.nivel,
        }
