from app.utils.base_datos import get_db_connection, USE_POSTGRESQL

def adapt_query(query):
    """Adaptar consulta SQL para el tipo de base de datos"""
    if USE_POSTGRESQL:
        return query
    else:
        # SQLite: cambiar %s por ?
        return query.replace('%s', '?')

class Usuario:
    def __init__(self, usuario_id=None, nombre_usuario=None, nombres=None, apellidos=None,
                 email=None, telefono=None, password_hash=None, empresa=None, sector=None,
                 tamano_empresa=None, newsletter=None, nivel=None, foto_perfil=None, fecha_creacion=None):
        self.usuario_id = usuario_id
        self.nombre_usuario = nombre_usuario
        self.nombres = nombres
        self.apellidos = apellidos
        self.email = email
        self.telefono = telefono
        self.password_hash = password_hash
        self.empresa = empresa
        self.sector = sector
        self.tamano_empresa = tamano_empresa
        self.newsletter = newsletter
        self.nivel = nivel
        self.foto_perfil = foto_perfil
        self.fecha_creacion = fecha_creacion

    @staticmethod
    def crear_usuario(nombre_usuario, nombres, apellidos, email, nivel='Principiante'):
        """Crear un nuevo usuario"""
        db = get_db_connection()
        query = """
        INSERT INTO Usuarios (nombre_usuario, nombres, apellidos, email, nivel)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING usuario_id
        """
        try:
            db.connect()
            result = db.execute_query(query, (nombre_usuario, nombres, apellidos, email, nivel), fetch=True)
            db.commit()
            if result:
                return result[0]['usuario_id']
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
        query = adapt_query("SELECT * FROM Usuarios WHERE usuario_id = %s")
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
        query = adapt_query("SELECT * FROM Usuarios WHERE email = %s")
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
    def obtener_usuario_por_nombre_usuario(nombre_usuario):
        """Obtener usuario por nombre de usuario"""
        db = get_db_connection()
        query = adapt_query("SELECT * FROM Usuarios WHERE nombre_usuario = %s")
        try:
            db.connect()
            result = db.execute_query(query, (nombre_usuario,), fetch=True)
            if result:
                data = result[0]
                return Usuario(**data)
            return None
        except Exception as e:
            print(f"Error obteniendo usuario por nombre_usuario: {e}")
            return None
        finally:
            db.disconnect()

    @staticmethod
    def crear(nombres, apellidos, email, telefono=None, nombre_usuario=None, password=None,
              empresa=None, sector=None, tamano_empresa=None, newsletter=False):
        """Crear un nuevo usuario con todos los campos"""
        from werkzeug.security import generate_password_hash

        db = get_db_connection()

        # Limpiar parámetros - convertir strings vacías a None
        telefono = telefono if telefono and telefono.strip() else None
        nombre_usuario = nombre_usuario if nombre_usuario and nombre_usuario.strip() else None
        empresa = empresa if empresa and empresa.strip() else None
        sector = sector if sector and sector.strip() else None
        tamano_empresa = tamano_empresa if tamano_empresa and tamano_empresa.strip() else None

        # Usar método de hash más simple para SQLite
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256:1000') if password and password.strip() else None

        # Convertir newsletter a entero para SQLite
        newsletter_int = 1 if newsletter else 0

        params = (nombres, apellidos, email, telefono, nombre_usuario,
                 hashed_password, empresa, sector, tamano_empresa,
                 newsletter_int, 'basico')

        print(f"🔍 Parámetros para crear usuario: {params}")

        try:
            db.connect()

            if USE_POSTGRESQL:
                query = """
                INSERT INTO Usuarios (nombres, apellidos, email, telefono, nombre_usuario,
                                    password_hash, empresa, sector, tamano_empresa, newsletter, nivel)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING usuario_id
                """
                result = db.execute_query(query, params, fetch=True)
                db.commit()
                if result:
                    usuario_id = result[0]['usuario_id']
                else:
                    return None
            else:
                # SQLite
                query = """
                INSERT INTO Usuarios (nombres, apellidos, email, telefono, nombre_usuario,
                                    password_hash, empresa, sector, tamano_empresa, newsletter, nivel)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """

                db.execute_query(query, params)
                db.commit()

                # Obtener el último ID insertado
                result = db.execute_query("SELECT last_insert_rowid() as usuario_id", fetch=True)
                if result:
                    usuario_id = result[0]['usuario_id']
                    print(f"✅ Usuario creado con ID: {usuario_id}")
                else:
                    print("❌ No se pudo obtener el ID del usuario creado")
                    return None

            # Crear objeto Usuario con los datos
            usuario_data = {
                'usuario_id': usuario_id,
                'nombre_usuario': nombre_usuario,
                'nombres': nombres,
                'apellidos': apellidos,
                'email': email,
                'nivel': 'basico'
            }
            return Usuario(**usuario_data)

        except Exception as e:
            print(f"Error creando usuario: {e}")
            import traceback
            print(f"Traceback completo: {traceback.format_exc()}")
            db.rollback()
            return None
        finally:
            db.disconnect()

    @staticmethod
    def actualizar_nivel(usuario_id, nuevo_nivel):
        """Actualizar nivel del usuario"""
        db = get_db_connection()
        query = adapt_query("UPDATE Usuarios SET nivel = %s WHERE usuario_id = %s")
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

    def to_dict(self, include_sensitive=False):
        """Convertir objeto a diccionario"""
        data = {
            'usuario_id': self.usuario_id,
            'nombre_usuario': self.nombre_usuario,
            'nombres': self.nombres,
            'apellidos': self.apellidos,
            'email': self.email,
            'telefono': self.telefono,
            'empresa': self.empresa,
            'sector': self.sector,
            'tamano_empresa': self.tamano_empresa,
            'newsletter': self.newsletter,
            'nivel': self.nivel,
            'foto_perfil': self.foto_perfil,
            'fecha_creacion': self.fecha_creacion
        }

        # Solo incluir campos sensibles si se solicita explícitamente
        if include_sensitive:
            data['password_hash'] = self.password_hash

        return data
