from flask import Flask, jsonify, render_template
from flask_cors import CORS
from flask_mail import Mail
from app.config import config
from app.utils.base_datos import get_db_connection, init_db
from app.servicios.email_servicio import email_service
import os


def crear_tablas_sqlite():
    """Crear tablas necesarias para SQLite"""
    try:
        db = get_db_connection()
        db.connect()

        # Crear tabla Usuarios
        db.cur.execute("""
            CREATE TABLE IF NOT EXISTS Usuarios (
                usuario_id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombres TEXT NOT NULL,
                apellidos TEXT,
                email TEXT UNIQUE NOT NULL,
                telefono TEXT,
                nombre_usuario TEXT UNIQUE,
                password_hash TEXT,
                empresa TEXT,
                sector TEXT,
                tamano_empresa TEXT,
                newsletter BOOLEAN DEFAULT 0,
                nivel TEXT DEFAULT 'basico',
                foto_perfil TEXT,
                email_confirmado BOOLEAN DEFAULT 0,
                confirmation_token TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Crear tabla Simulaciones
        db.cur.execute("""
            CREATE TABLE IF NOT EXISTS Simulaciones (
                simulacion_id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER,
                nombre TEXT,
                tipo_simulacion TEXT NOT NULL,
                parametros TEXT,
                resultados TEXT,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id)
            )
        """)

        # Crear tabla Resultados
        db.cur.execute("""
            CREATE TABLE IF NOT EXISTS Resultados (
                resultado_id INTEGER PRIMARY KEY AUTOINCREMENT,
                simulacion_id INTEGER NOT NULL,
                indicador TEXT NOT NULL,
                valor REAL NOT NULL,
                FOREIGN KEY (simulacion_id) REFERENCES Simulaciones(simulacion_id)
            )
        """)

        # Crear tabla Insignias
        db.cur.execute("""
            CREATE TABLE IF NOT EXISTS Insignias (
                insignia_id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre_insig TEXT NOT NULL UNIQUE,
                descripcion_insig TEXT NOT NULL
            )
        """)

        # Crear tabla Usuario_Insignia
        db.cur.execute("""
            CREATE TABLE IF NOT EXISTS Usuario_Insignia (
                insignia_id INTEGER NOT NULL,
                usuario_id INTEGER NOT NULL,
                fecha_obtenida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (usuario_id, insignia_id),
                FOREIGN KEY (insignia_id) REFERENCES Insignias(insignia_id),
                FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id)
            )
        """)

        # Crear tabla Ranking
        db.cur.execute("""
            CREATE TABLE IF NOT EXISTS Ranking (
                ranking_id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                puntaje REAL,
                sector TEXT,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id)
            )
        """)

        # Crear tabla Notificaciones
        db.cur.execute("""
            CREATE TABLE IF NOT EXISTS Notificaciones (
                notificacion_id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                tipo TEXT NOT NULL,
                mensaje TEXT NOT NULL,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                estado TEXT DEFAULT 'Pendiente',
                FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id)
            )
        """)

        # Crear tabla Benchmarking_Grupo
        db.cur.execute("""
            CREATE TABLE IF NOT EXISTS Benchmarking_Grupo (
                benchmarking_id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre_grupo TEXT,
                descripcion TEXT
            )
        """)

        # Crear tabla Usuario_Benchmarking
        db.cur.execute("""
            CREATE TABLE IF NOT EXISTS Usuario_Benchmarking (
                usuario_id INTEGER NOT NULL,
                benchmarking_id INTEGER NOT NULL,
                PRIMARY KEY (usuario_id, benchmarking_id),
                FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id),
                FOREIGN KEY (benchmarking_id) REFERENCES Benchmarking_Grupo(benchmarking_id)
            )
        """)

        # Crear índices
        db.cur.execute("CREATE INDEX IF NOT EXISTS idx_email ON Usuarios(email)")
        db.cur.execute("CREATE INDEX IF NOT EXISTS idx_nombre_usuario ON Usuarios(nombre_usuario)")
        db.cur.execute("CREATE INDEX IF NOT EXISTS idx_simulaciones_usuario ON Simulaciones(usuario_id)")
        db.cur.execute("CREATE INDEX IF NOT EXISTS idx_resultados_simulacion ON Resultados(simulacion_id)")

        # Agregar columnas faltantes si no existen (para migración)
        try:
            db.cur.execute("ALTER TABLE Usuarios ADD COLUMN foto_perfil TEXT")
            print("✅ Columna foto_perfil agregada a tabla Usuarios")
        except Exception as e:
            # La columna ya existe, ignorar error
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                pass
            else:
                print(f"⚠️ Nota sobre columna foto_perfil: {e}")

        # Agregar columna email_confirmado si no existe
        try:
            db.cur.execute("ALTER TABLE Usuarios ADD COLUMN email_confirmado BOOLEAN DEFAULT 0")
            print("✅ Columna email_confirmado agregada a tabla Usuarios")
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                pass
            else:
                print(f"⚠️ Nota sobre columna email_confirmado: {e}")

        # Agregar columna confirmation_token si no existe
        try:
            db.cur.execute("ALTER TABLE Usuarios ADD COLUMN confirmation_token TEXT")
            print("✅ Columna confirmation_token agregada a tabla Usuarios")
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                pass
            else:
                print(f"⚠️ Nota sobre columna confirmation_token: {e}")

        db.conn.commit()
        print("✅ Tablas SQLite creadas exitosamente")

    except Exception as e:
        print(f"❌ Error creando tablas SQLite: {e}")
    finally:
        db.disconnect()


def crear_app(config_name="development"):
    """
    Factory para crear la aplicación Flask

    Args:
        config_name: Nombre de la configuración ('development', 'production', 'testing')

    Returns:
        app: Aplicación Flask configurada
    """
    app = Flask(__name__, template_folder="plantillas")

    # Cargar configuración
    app.config.from_object(config[config_name])

    # Configurar CORS
    CORS(app, origins=app.config["CORS_ORIGINS"])

    # Inicializar Flask-Mail
    mail = Mail(app)

    # Inicializar servicio de email
    email_service.init_app(app)

    # Inicializar conexión a BD
    with app.app_context():
        try:
            if init_db():
                print("✅ Base de datos conectada exitosamente")
                # Crear tablas si es SQLite
                from app.utils.base_datos import USE_POSTGRESQL

                if not USE_POSTGRESQL:
                    crear_tablas_sqlite()
            else:
                print("⚠️  No se pudo conectar a la base de datos")
                print("   La aplicación funcionará con limitaciones")
        except Exception as e:
            print(f"❌ Error inicializando base de datos: {e}")
            print("   La aplicación funcionará con limitaciones")

    # Registrar Blueprints (Rutas)
    registrar_blueprints(app)

    # Registrar manejadores de errores
    registrar_manejadores_errores(app)

    # Ruta de salud (health check)
    @app.route("/health")
    def health_check():
        return jsonify(
            {
                "status": "healthy",
                "service": "Econova API",
                "version": app.config["API_VERSION"],
            }
        ), 200

    @app.route("/")
    def index():
        return render_template("inicio.html")

    @app.route("/terminos")
    def terminos():
        return render_template("terminos.html")

    @app.route("/privacidad")
    def privacidad():
        return render_template("privacidad.html")

    @app.route("/simulacion")
    def simulacion():
        return render_template("simulacion.html")

    @app.route("/resultados")
    def resultados():
        from flask import session
        from app.modelos.simulacion import Simulacion

        # Check if user is logged in
        if 'usuario_id' not in session:
            return render_template("resultados.html", simulaciones=[], total_simulaciones=0, analisis_benchmarking=[])

        # Get user's simulations
        usuario_id = session['usuario_id']
        simulaciones = Simulacion.obtener_simulaciones_usuario(usuario_id, limite=50)
        total_simulaciones = len(simulaciones)

        # Placeholder for benchmarking analysis (will be loaded via JavaScript)
        analisis_benchmarking = []

        return render_template("resultados.html", simulaciones=simulaciones, total_simulaciones=total_simulaciones, analisis_benchmarking=analisis_benchmarking)

    @app.route("/chatbot")
    def chatbot():
        from flask import request, session
        contexto = None
        mensaje_inicial = None

        # Check for contextual data in URL parameters
        contexto_param = request.args.get('contexto')
        if contexto_param:
            try:
                import json
                contexto = json.loads(contexto_param)
                mensaje_inicial = contexto.get('mensaje_contextual', '')
            except json.JSONDecodeError:
                contexto = None

        # Get user info for avatar
        usuario_id = session.get('usuario_id')
        foto_perfil = None

        if usuario_id:
            # Import here to avoid circular imports
            from app.modelos.usuario import Usuario
            usuario = Usuario.obtener_usuario_por_id(usuario_id)
            if usuario and usuario.foto_perfil:
                foto_perfil = usuario.foto_perfil

        return render_template('chatbot.html',
                             contexto=contexto,
                             mensaje_inicial=mensaje_inicial,
                             foto_perfil=foto_perfil)

    @app.route("/benchmarking")
    def benchmarking():
        return render_template("benchmarking.html")

    @app.route("/prestamo")
    def prestamo():
        return render_template("prestamo.html")

    @app.route("/ahorro-inversion")
    def ahorro_inversion():
        return render_template("ahorro_inversion.html")

    @app.route("/demo")
    def demo():
        return render_template("demo.html")

    @app.route("/gamification")
    def gamification():
        from flask import session, flash, redirect, url_for
        if 'usuario_id' not in session:
            flash('Debes iniciar sesión para acceder al sistema de gamificación', 'error')
            return redirect(url_for('login'))

        usuario_id = session.get('usuario_id')

        # Obtener estadísticas del usuario
        from app.servicios.gamification_servicio import GamificationService
        from app.modelos.logro import Ranking

        estadisticas = GamificationService.obtener_estadisticas_gamification(usuario_id)

        # Obtener ranking del usuario
        ranking_usuario = Ranking.obtener_ranking_usuario(usuario_id)

        # Obtener top 10 del ranking general
        ranking_general = Ranking.obtener_ranking_sector('General', 10)

        return render_template('gamification.html',
                             estadisticas=estadisticas,
                             ranking_usuario=ranking_usuario,
                             ranking_general=ranking_general)

    # User page routes (moved from usuarios blueprint to avoid /api/v1 prefix)
    @app.route('/login', methods=['GET'])
    def login():
        """Mostrar página de inicio de sesión"""
        return render_template('login.html')

    @app.route('/registro', methods=['GET'])
    def registro():
        """Mostrar formulario de registro"""
        return render_template('registro.html')

    @app.route('/dashboard')
    def dashboard():
        """Mostrar dashboard del usuario"""
        from flask import session, flash, redirect, url_for
        if 'usuario_id' not in session:
            flash('Debes iniciar sesión para acceder al dashboard.', 'error')
            return redirect(url_for('login'))

        return render_template('dashboard.html')

    @app.route('/perfil')
    def perfil():
        """Mostrar perfil del usuario"""
        from flask import session, flash, redirect, url_for
        print("🔍 DEBUG - PERFIL ROUTE CALLED")
        if 'usuario_id' not in session:
            print("🔍 DEBUG - No user ID in session")
            flash('Debes iniciar sesión para acceder a tu perfil.', 'error')
            return redirect(url_for('login'))

        # Obtener datos del perfil
        from app.modelos.usuario import Usuario
        usuario_id = session['usuario_id']
        print(f"🔍 DEBUG - User ID from session: {usuario_id}")
        usuario = Usuario.obtener_usuario_por_id(usuario_id)
        print(f"🔍 DEBUG - Usuario object returned: {usuario}")

        return render_template('perfil.html', perfil_data=usuario)

    @app.route('/logout')
    def logout():
        """Cerrar sesión del usuario"""
        from flask import session, flash, redirect
        session.clear()
        flash('Sesión cerrada exitosamente.', 'success')
        return redirect('/')

    # Context processor to make current user available in all templates
    @app.context_processor
    def inject_current_user():
        from flask import session
        from app.modelos.usuario import Usuario
        if 'usuario_id' in session:
            try:
                current_user = Usuario.obtener_usuario_por_id(session['usuario_id'])
                return {'current_user': current_user}
            except:
                return {'current_user': None}
        return {'current_user': None}

    return app


def registrar_blueprints(app):
    """Registra todos los blueprints de la aplicación"""

    # Rutas financieras (Germaín)
    from app.rutas.financiero import bp_financiero

    app.register_blueprint(bp_financiero)

    # Rutas de usuarios (Germaín)
    from app.rutas.usuarios import usuarios_bp

    app.register_blueprint(usuarios_bp, url_prefix="/api/v1")

    # Rutas de ML (Diego) - placeholder
    from app.rutas.ml import bp_ml

    app.register_blueprint(bp_ml)

    # Rutas de Chatbot (Ronaldo) - placeholder
    from app.rutas.chatbot import chatbot_bp

    app.register_blueprint(chatbot_bp, url_prefix="/api/v1")

    # Rutas de Benchmarking (Jeanfranco) - placeholder
    from app.rutas.benchmarking import benchmarking_bp

    app.register_blueprint(benchmarking_bp, url_prefix="/api/v1")

    # Rutas de Gamificación
    from app.rutas.gamification import gamification_bp

    app.register_blueprint(gamification_bp)


def registrar_manejadores_errores(app):
    """Registra manejadores de errores globales"""

    @app.errorhandler(404)
    def no_encontrado(error):
        return jsonify({"error": "Recurso no encontrado", "status": 404}), 404

    @app.errorhandler(500)
    def error_interno(error):
        return jsonify({"error": "Error interno del servidor", "status": 500}), 500

    @app.errorhandler(400)
    def peticion_invalida(error):
        return jsonify({"error": "Petición inválida", "status": 400}), 400


# Crear instancia global de la aplicación para Gunicorn
# En producción, usa la configuración de producción
# En desarrollo, usa la configuración de desarrollo
config_name = "production" if os.getenv("RENDER") or os.getenv("PRODUCTION") else "development"
app = crear_app(config_name)
