from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash, session
from app.modelos.usuario import Usuario
from app.modelos.logro import Usuario_Insignia, Ranking
from app.modelos.notificacion import Notificacion
from app.utils.exportar import GoogleSheetsExporter, ExcelExporter
from app.servicios.email_servicio import email_service
from werkzeug.security import check_password_hash
import re
import secrets

usuarios_bp = Blueprint('usuarios', __name__)

@usuarios_bp.route('/usuarios', methods=['GET'])
def listar_usuarios():
    """Listar todos los usuarios"""
    try:
        usuarios = Usuario.listar_usuarios()
        return jsonify({
            'success': True,
            'usuarios': [usuario.to_dict() for usuario in usuarios]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>', methods=['GET'])
def obtener_usuario(usuario_id):
    """Obtener información de un usuario específico"""
    try:
        usuario = Usuario.obtener_usuario_por_id(usuario_id)
        if usuario:
            return jsonify({
                'success': True,
                'usuario': usuario.to_dict()
            })
        return jsonify({
            'success': False,
            'error': 'Usuario no encontrado'
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/insignias', methods=['GET'])
def obtener_insignias_usuario(usuario_id):
    """Obtener todas las insignias de un usuario"""
    try:
        insignias = Usuario_Insignia.obtener_insignias_usuario(usuario_id)
        return jsonify({
            'success': True,
            'insignias': insignias
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/ranking', methods=['GET'])
def obtener_ranking_usuario(usuario_id):
    """Obtener rankings de un usuario"""
    try:
        rankings = Ranking.obtener_ranking_usuario(usuario_id)
        return jsonify({
            'success': True,
            'rankings': [ranking.to_dict() for ranking in rankings]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/notificaciones', methods=['GET'])
def obtener_notificaciones_usuario(usuario_id):
    """Obtener notificaciones de un usuario"""
    try:
        limite = request.args.get('limite', 20, type=int)
        notificaciones = Notificacion.obtener_notificaciones_usuario(usuario_id, limite)
        no_leidas = Notificacion.obtener_notificaciones_no_leidas(usuario_id)

        return jsonify({
            'success': True,
            'notificaciones': [notif.to_dict() for notif in notificaciones],
            'no_leidas': no_leidas
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/notificaciones/<int:notificacion_id>/leer', methods=['PUT'])
def marcar_notificacion_leida(usuario_id, notificacion_id):
    """Marcar una notificación como leída"""
    try:
        success = Notificacion.marcar_como_leida(notificacion_id)
        if success:
            return jsonify({
                'success': True,
                'message': 'Notificación marcada como leída'
            })
        return jsonify({
            'success': False,
            'error': 'Error al marcar notificación como leída'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/exportar/sheets', methods=['POST'])
def exportar_resultados_sheets(usuario_id):
    """Exportar resultados del usuario a Google Sheets"""
    try:
        exporter = GoogleSheetsExporter()
        spreadsheet_id = request.json.get('spreadsheet_id')

        success = exporter.exportar_resultados_usuario(usuario_id, spreadsheet_id)

        if success:
            return jsonify({
                'success': True,
                'message': 'Resultados exportados exitosamente a Google Sheets'
            })
        return jsonify({
            'success': False,
            'error': 'Error exportando a Google Sheets'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/exportar/excel', methods=['GET'])
def exportar_resultados_excel(usuario_id):
    """Exportar resultados del usuario a Excel"""
    try:
        success = ExcelExporter.exportar_resultados_usuario_excel(usuario_id)

        if success:
            return jsonify({
                'success': True,
                'message': 'Resultados exportados exitosamente a Excel'
            })
        return jsonify({
            'success': False,
            'error': 'Error exportando a Excel'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@usuarios_bp.route('/usuarios/<int:usuario_id>/nivel', methods=['PUT'])
def actualizar_nivel_usuario(usuario_id):
    """Actualizar nivel de un usuario"""
    try:
        data = request.get_json()
        nuevo_nivel = data.get('nivel')

        if not nuevo_nivel:
            return jsonify({
                'success': False,
                'error': 'Nivel requerido'
            }), 400

        success = Usuario.actualizar_nivel(usuario_id, nuevo_nivel)

        if success:
            return jsonify({
                'success': True,
                'message': 'Nivel actualizado exitosamente'
            })
        return jsonify({
            'success': False,
            'error': 'Error actualizando nivel'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Registration Routes
@usuarios_bp.route('/registro', methods=['GET'])
def registro():
    """Mostrar formulario de registro"""
    return render_template('registro.html')

@usuarios_bp.route('/registrar', methods=['POST'])
def registrar_usuario():
    """API para registrar un nuevo usuario"""
    try:
        # Get JSON data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Datos JSON requeridos'
            }), 400

        nombres = data.get('nombres', '').strip()
        apellidos = data.get('apellidos', '').strip()
        email = data.get('email', '').strip().lower()
        telefono = data.get('telefono', '').strip()
        nombre_usuario = data.get('nombre_usuario', '').strip()
        password = data.get('password', '')
        empresa = data.get('empresa', '').strip()
        sector = data.get('sector', '')
        tamano_empresa = data.get('tamano_empresa', '')
        terminos = data.get('terminos')
        newsletter = data.get('newsletter', False)

        # Validation
        errors = []

        # Required fields
        if not nombres or not apellidos or not email or not nombre_usuario or not password:
            errors.append('Todos los campos marcados con * son obligatorios')

        # Email validation
        if email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            errors.append('El correo electrónico no es válido')

        # Username validation
        if nombre_usuario and not re.match(r'^[a-zA-Z0-9_]{3,20}$', nombre_usuario):
            errors.append('El nombre de usuario debe tener entre 3-20 caracteres y solo letras, números y guiones bajos')

        # Password validation
        if password:
            if len(password) < 8:
                errors.append('La contraseña debe tener al menos 8 caracteres')
            if not re.search(r'\d', password):
                errors.append('La contraseña debe contener al menos un número')
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
                errors.append('La contraseña debe contener al menos un carácter especial')

        # Terms acceptance
        if not terminos:
            errors.append('Debes aceptar los términos y condiciones')

        # Check if user already exists
        if email and Usuario.obtener_usuario_por_email(email):
            errors.append('Ya existe una cuenta con este correo electrónico')

        if nombre_usuario and Usuario.obtener_usuario_por_nombre_usuario(nombre_usuario):
            errors.append('Este nombre de usuario ya está en uso')

        if errors:
            return jsonify({
                'success': False,
                'error': ' '.join(errors),
                'data': {
                    'nombres': nombres,
                    'apellidos': apellidos,
                    'email': email,
                    'telefono': telefono,
                    'nombre_usuario': nombre_usuario,
                    'empresa': empresa,
                    'sector': sector,
                    'tamano_empresa': tamano_empresa,
                    'newsletter': newsletter
                }
            }), 400

        # Create user
        usuario = Usuario.crear(
            nombres=nombres,
            apellidos=apellidos,
            email=email,
            telefono=telefono if telefono else None,
            nombre_usuario=nombre_usuario,
            password=password,
            empresa=empresa if empresa else None,
            sector=sector if sector else None,
            tamano_empresa=tamano_empresa if tamano_empresa else None,
            newsletter=newsletter
        )

        if usuario:
            # Set default level to 'basico'
            Usuario.actualizar_nivel(usuario.usuario_id, 'basico')

            return jsonify({
                'success': True,
                'message': 'Usuario registrado exitosamente',
                'usuario': usuario.to_dict()
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Error al crear la cuenta'
            }), 500

    except Exception as e:
        print(f"Error en registro API: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500

@usuarios_bp.route('/confirmar/<token>')
def confirmar_cuenta(token):
    """Confirmar cuenta de usuario con token"""
    try:
        # TODO: Implementar verificación real del token
        # Por ahora, solo mostramos una página de confirmación exitosa
        return render_template('confirmacion.html', token=token)
    except Exception as e:
        print(f"Error en confirmación: {e}")
        return render_template('error.html', error="Error al confirmar la cuenta"), 500

@usuarios_bp.route('/login', methods=['GET'])
def login():
    """Mostrar página de inicio de sesión"""
    return render_template('login.html')

@usuarios_bp.route('/login', methods=['POST'])
def procesar_login():
    """Procesar formulario de inicio de sesión"""
    try:
        # Get form data
        email_username = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        remember = request.form.get('remember') is not None

        # Validation
        if not email_username or not password:
            flash('Por favor ingresa tu email/nombre de usuario y contraseña.', 'error')
            return render_template('login.html', email_value=email_username)

        # Buscar usuario por email o nombre de usuario
        usuario = None

        # Primero intentar como email
        if '@' in email_username:
            usuario = Usuario.obtener_usuario_por_email(email_username)
        else:
            # Si no tiene @, buscar como nombre de usuario
            usuario = Usuario.obtener_usuario_por_nombre_usuario(email_username)

        # Verificar si el usuario existe y la contraseña es correcta
        if usuario and usuario.password_hash:
            if check_password_hash(usuario.password_hash, password):
                # Login exitoso - crear sesión
                session['usuario_id'] = usuario.usuario_id
                session['usuario_email'] = usuario.email
                session['usuario_nombre'] = f"{usuario.nombres} {usuario.apellidos}"
                session['usuario_nivel'] = usuario.nivel

                # TODO: Implementar "recordar sesión" si remember=True

                print(f"✅ Login exitoso para usuario: {usuario.email}")
                flash('Inicio de sesión exitoso. Bienvenido a Econova!', 'success')
                return redirect(url_for('usuarios.dashboard'))  # Redirigir al dashboard
            else:
                print(f"❌ Contraseña incorrecta para usuario: {email_username}")
                flash('Contraseña incorrecta. Por favor, inténtalo de nuevo.', 'error')
                return render_template('login.html', email_value=email_username, remember_checked=remember)
        else:
            print(f"❌ Usuario no encontrado: {email_username}")
            flash('Usuario no encontrado. Verifica tu email o nombre de usuario.', 'error')
            return render_template('login.html', email_value=email_username, remember_checked=remember)

    except Exception as e:
        print(f"Error en login: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        flash('Error interno del servidor. Por favor, inténtalo de nuevo.', 'error')
        return render_template('login.html', email_value=email_username, remember_checked=remember)

@usuarios_bp.route('/registro', methods=['POST'])
def procesar_registro():
    """Procesar formulario de registro"""
    try:
        # Get form data
        nombres = request.form.get('nombres', '').strip()
        apellidos = request.form.get('apellidos', '').strip()
        email = request.form.get('email', '').strip().lower()
        telefono = request.form.get('telefono', '').strip()
        nombre_usuario = request.form.get('nombre_usuario', '').strip()
        password = request.form.get('password', '')
        empresa = request.form.get('empresa', '').strip()
        sector = request.form.get('sector', '')
        tamano_empresa = request.form.get('tamano_empresa', '')
        terminos = request.form.get('terminos')
        newsletter = request.form.get('newsletter') is not None

        # Validation
        errors = []

        # Required fields
        if not nombres or not apellidos or not email or not nombre_usuario or not password:
            errors.append('Todos los campos marcados con * son obligatorios')

        # Email validation
        if email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            errors.append('El correo electrónico no es válido')

        # Username validation
        if nombre_usuario and not re.match(r'^[a-zA-Z0-9_]{3,20}$', nombre_usuario):
            errors.append('El nombre de usuario debe tener entre 3-20 caracteres y solo letras, números y guiones bajos')

        # Password validation
        if password:
            if len(password) < 8:
                errors.append('La contraseña debe tener al menos 8 caracteres')
            if not re.search(r'\d', password):
                errors.append('La contraseña debe contener al menos un número')
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
                errors.append('La contraseña debe contener al menos un carácter especial')

        # Terms acceptance
        if not terminos:
            errors.append('Debes aceptar los términos y condiciones')

        # Check if user already exists
        if email and Usuario.obtener_usuario_por_email(email):
            errors.append('Ya existe una cuenta con este correo electrónico')

        if nombre_usuario and Usuario.obtener_usuario_por_nombre_usuario(nombre_usuario):
            errors.append('Este nombre de usuario ya está en uso')

        if errors:
            flash(' '.join(errors), 'error')
            # Mantener los datos del formulario cuando hay errores
            return render_template('registro.html',
                                 nombres=nombres,
                                 apellidos=apellidos,
                                 email=email,
                                 telefono=telefono,
                                 nombre_usuario=nombre_usuario,
                                 empresa=empresa,
                                 sector=sector,
                                 tamano_empresa=tamano_empresa,
                                 newsletter_checked=newsletter)

        # Create user
        usuario = Usuario.crear(
            nombres=nombres,
            apellidos=apellidos,
            email=email,
            telefono=telefono if telefono else None,
            nombre_usuario=nombre_usuario,
            password=password,
            empresa=empresa if empresa else None,
            sector=sector if sector else None,
            tamano_empresa=tamano_empresa if tamano_empresa else None,
            newsletter=newsletter
        )

        if usuario:
            # Set default level to 'basico'
            Usuario.actualizar_nivel(usuario.usuario_id, 'basico')

            # Generate confirmation token
            token_confirmacion = secrets.token_urlsafe(32)

            # Send confirmation email
            print(f"📧 Intentando enviar email de confirmación a: {email}")
            print(f"📧 Nombre de usuario: {nombres}")
            print(f"📧 Token de confirmación: {token_confirmacion}")

            try:
                email_enviado = email_service.enviar_email_confirmacion(
                    email=email,
                    nombre_usuario=nombres,  # Usar el nombre real, no el username
                    token_confirmacion=token_confirmacion
                )

                if email_enviado:
                    print("✅ Email de confirmación enviado exitosamente")
                    flash('¡Cuenta creada exitosamente! Revisa tu bandeja de entrada y carpeta de SPAM para el email de confirmación. El email puede tardar unos minutos en llegar.', 'success')
                else:
                    print("❌ Error: email_service.enviar_email_confirmacion retornó False")
                    flash('Cuenta creada, pero hubo un problema enviando el email de confirmación. Contacta soporte si el problema persiste.', 'warning')
            except Exception as e:
                print(f"❌ Error enviando email: {e}")
                print(f"❌ Tipo de error: {type(e)}")
                import traceback
                print(f"❌ Traceback: {traceback.format_exc()}")
                flash('Cuenta creada, pero hubo un problema enviando el email de confirmación. Contacta soporte.', 'warning')

            return redirect(url_for('usuarios.registro'))
        else:
            flash('Error al crear la cuenta. Por favor, inténtalo de nuevo.', 'error')
            return redirect(url_for('usuarios.registro'))

    except Exception as e:
        print(f"Error en registro: {e}")
        flash('Error interno del servidor. Por favor, inténtalo de nuevo.', 'error')
        return redirect(url_for('usuarios.registro'))

@usuarios_bp.route('/dashboard')
def dashboard():
    """Mostrar dashboard del usuario"""
    if 'usuario_id' not in session:
        flash('Debes iniciar sesión para acceder al dashboard.', 'error')
        return redirect(url_for('usuarios.login'))

    return render_template('dashboard.html')

@usuarios_bp.route('/perfil')
def perfil():
    """Mostrar perfil del usuario"""
    if 'usuario_id' not in session:
        flash('Debes iniciar sesión para acceder a tu perfil.', 'error')
        return redirect(url_for('usuarios.login'))

    return render_template('perfil.html')

@usuarios_bp.route('/perfil', methods=['GET'])
def obtener_perfil():
    """Obtener datos del perfil del usuario actual (API)"""
    try:
        if 'usuario_id' not in session:
            return jsonify({
                'success': False,
                'error': 'Usuario no autenticado'
            }), 401

        usuario_id = session['usuario_id']
        usuario = Usuario.obtener_usuario_por_id(usuario_id)

        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado'
            }), 404

        return jsonify({
            'success': True,
            'usuario': usuario.to_dict()
        })

    except Exception as e:
        print(f"Error obteniendo perfil: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500

@usuarios_bp.route('/logout')
def logout():
    """Cerrar sesión del usuario"""
    session.clear()
    flash('Sesión cerrada exitosamente.', 'success')
    return redirect('/')

def usuario_autenticado():
    """Verificar si el usuario está autenticado"""
    return 'usuario_id' in session

def obtener_usuario_actual():
    """Obtener información del usuario actual"""
    if usuario_autenticado():
        usuario_id = session['usuario_id']
        return Usuario.obtener_usuario_por_id(usuario_id)
    return None
