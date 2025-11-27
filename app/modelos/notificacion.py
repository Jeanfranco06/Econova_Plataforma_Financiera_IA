from app.utils.base_datos import get_db_connection
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from twilio.rest import Client
import os
from app.config import Config

class Notificacion:
    def __init__(self, notificacion_id=None, usuario_id=None, tipo=None, mensaje=None, fecha=None, estado=None):
        self.notificacion_id = notificacion_id
        self.usuario_id = usuario_id
        self.tipo = tipo
        self.mensaje = mensaje
        self.fecha = fecha
        self.estado = estado

    @staticmethod
    def crear_notificacion(usuario_id, tipo, mensaje):
        """Crear una nueva notificación"""
        db = get_db_connection()
        query = """
        INSERT INTO Notificaciones (usuario_id, tipo, mensaje)
        VALUES (%s, %s, %s)
        RETURNING notificacion_id
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id, tipo, mensaje), fetch=True)
            db.commit()
            if result:
                return result[0]['notificacion_id']
            return None
        except Exception as e:
            print(f"Error creando notificación: {e}")
            return None
        finally:
            db.disconnect()

    @staticmethod
    def obtener_notificaciones_usuario(usuario_id, limite=20):
        """Obtener notificaciones de un usuario"""
        db = get_db_connection()
        query = """
        SELECT * FROM Notificaciones
        WHERE usuario_id = %s
        ORDER BY fecha DESC
        LIMIT %s
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id, limite), fetch=True)
            notificaciones = []
            if result:
                for data in result:
                    notificaciones.append(Notificacion(**data))
            return notificaciones
        except Exception as e:
            print(f"Error obteniendo notificaciones: {e}")
            return []
        finally:
            db.disconnect()

    @staticmethod
    def marcar_como_leida(notificacion_id):
        """Marcar una notificación como leída"""
        db = get_db_connection()
        query = "UPDATE Notificaciones SET estado = 'Leída' WHERE notificacion_id = %s"
        try:
            db.connect()
            success = db.execute_query(query, (notificacion_id,))
            if success:
                db.commit()
                return True
            return False
        except Exception as e:
            print(f"Error marcando notificación como leída: {e}")
            return False
        finally:
            db.disconnect()

    @staticmethod
    def obtener_notificaciones_no_leidas(usuario_id):
        """Obtener notificaciones no leídas de un usuario"""
        db = get_db_connection()
        query = """
        SELECT COUNT(*) as count
        FROM Notificaciones
        WHERE usuario_id = %s AND estado = 'Pendiente'
        """
        try:
            db.connect()
            result = db.execute_query(query, (usuario_id,), fetch=True)
            if result:
                return result[0]['count']
            return 0
        except Exception as e:
            print(f"Error obteniendo notificaciones no leídas: {e}")
            return 0
        finally:
            db.disconnect()

    def to_dict(self):
        """Convertir objeto a diccionario"""
        return {
            'notificacion_id': self.notificacion_id,
            'usuario_id': self.usuario_id,
            'tipo': self.tipo,
            'mensaje': self.mensaje,
            'fecha': self.fecha,
            'estado': self.estado
        }


class NotificacionService:
    @staticmethod
    def enviar_email(destinatario, asunto, mensaje):
        """Enviar notificación por email"""
        try:
            if not Config.SMTP_USERNAME or not Config.SMTP_PASSWORD:
                print("Configuración de email no disponible")
                return False

            msg = MIMEMultipart()
            msg['From'] = Config.SMTP_USERNAME
            msg['To'] = destinatario
            msg['Subject'] = asunto

            msg.attach(MIMEText(mensaje, 'html'))

            server = smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT)
            server.starttls()
            server.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)
            text = msg.as_string()
            server.sendmail(Config.SMTP_USERNAME, destinatario, text)
            server.quit()

            return True
        except Exception as e:
            print(f"Error enviando email: {e}")
            return False

    @staticmethod
    def enviar_whatsapp(destinatario, mensaje):
        """Enviar notificación por WhatsApp usando Twilio"""
        try:
            if not Config.TWILIO_ACCOUNT_SID or not Config.TWILIO_AUTH_TOKEN:
                print("Configuración de Twilio no disponible")
                return False

            client = Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)

            message = client.messages.create(
                body=mensaje,
                from_=f'whatsapp:{Config.TWILIO_PHONE_NUMBER}',
                to=f'whatsapp:{destinatario}'
            )

            return True
        except Exception as e:
            print(f"Error enviando WhatsApp: {e}")
            return False

    @staticmethod
    def notificar_logro_obtenido(usuario_id, nombre_insignia):
        """Notificar cuando un usuario obtiene una insignia"""
        from app.modelos.usuario import Usuario

        usuario = Usuario.obtener_usuario_por_id(usuario_id)
        if not usuario:
            return False

        mensaje = f"¡Felicitaciones! Has obtenido la insignia '{nombre_insignia}' por tu excelente rendimiento en Econova."
        asunto = "Nueva Insignia Obtenida - Econova"

        # Crear notificación en base de datos
        notif_id = Notificacion.crear_notificacion(usuario_id, 'logro', mensaje)

        # Enviar por email si está configurado
        if usuario.email:
            email_enviado = NotificacionService.enviar_email(
                usuario.email,
                asunto,
                f"""
                <h2>¡Felicitaciones {usuario.nombres}!</h2>
                <p>{mensaje}</p>
                <p>Sigue así y continúa mejorando tus habilidades financieras.</p>
                <br>
                <p>Equipo Econova</p>
                """
            )

        return notif_id is not None

    @staticmethod
    def notificar_mejora_ranking(usuario_id, sector, posicion):
        """Notificar mejora en ranking"""
        from app.modelos.usuario import Usuario

        usuario = Usuario.obtener_usuario_por_id(usuario_id)
        if not usuario:
            return False

        mensaje = f"¡Excelente! Has mejorado tu posición en el ranking del sector '{sector}'. Ahora estás en la posición #{posicion}."
        asunto = "Mejora en Ranking - Econova"

        # Crear notificación en base de datos
        notif_id = Notificacion.crear_notificacion(usuario_id, 'ranking', mensaje)

        # Enviar por email si está configurado
        if usuario.email:
            email_enviado = NotificacionService.enviar_email(
                usuario.email,
                asunto,
                f"""
                <h2>¡Felicitaciones {usuario.nombres}!</h2>
                <p>{mensaje}</p>
                <p>Tu dedicación está dando frutos. ¡Sigue adelante!</p>
                <br>
                <p>Equipo Econova</p>
                """
            )

        return notif_id is not None

    @staticmethod
    def notificar_benchmarking_superior(usuario_id, indicador, percentil):
        """Notificar cuando el usuario supera el promedio del grupo"""
        from app.modelos.usuario import Usuario

        usuario = Usuario.obtener_usuario_por_id(usuario_id)
        if not usuario:
            return False

        mensaje = f"¡Increíble! Estás por encima del {percentil:.1f}% de usuarios en '{indicador}'. ¡Sigue así!"
        asunto = "Rendimiento Superior al Promedio - Econova"

        # Crear notificación en base de datos
        notif_id = Notificacion.crear_notificacion(usuario_id, 'benchmarking', mensaje)

        # Enviar por email si está configurado
        if usuario.email:
            email_enviado = NotificacionService.enviar_email(
                usuario.email,
                asunto,
                f"""
                <h2>¡Excelente trabajo {usuario.nombres}!</h2>
                <p>{mensaje}</p>
                <p>Tu rendimiento en {indicador} está por encima del promedio de la comunidad.</p>
                <br>
                <p>Equipo Econova</p>
                """
            )

        return notif_id is not None

    @staticmethod
    def notificar_record_personal(usuario_id, indicador, valor_anterior, valor_nuevo):
        """Notificar cuando se rompe un record personal"""
        from app.modelos.usuario import Usuario

        usuario = Usuario.obtener_usuario_por_id(usuario_id)
        if not usuario:
            return False

        mensaje = f"¡Nuevo récord personal! Mejoraste tu resultado en '{indicador}' de {valor_anterior:.2f} a {valor_nuevo:.2f}."
        asunto = "Nuevo Récord Personal - Econova"

        # Crear notificación en base de datos
        notif_id = Notificacion.crear_notificacion(usuario_id, 'record', mensaje)

        # Enviar por email si está configurado
        if usuario.email:
            email_enviado = NotificacionService.enviar_email(
                usuario.email,
                asunto,
                f"""
                <h2>¡Felicitaciones {usuario.nombres}!</h2>
                <p>{mensaje}</p>
                <p>Estás superando tus propios límites. ¡Increíble progreso!</p>
                <br>
                <p>Equipo Econova</p>
                """
            )

        return notif_id is not None
