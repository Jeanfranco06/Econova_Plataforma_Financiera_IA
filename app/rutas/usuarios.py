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

# API Routes for User Management
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

@usuarios_bp.route('/login', methods=['POST'])
def procesar_login():
    """API para procesar inicio de sesión"""
    try:
        # Get JSON data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Datos JSON requeridos'
            }), 400

        email_username = data.get('email_username', '').strip()
        password = data.get('password', '')

        # Validation
        if not email_username or not password:
            return jsonify({
                'success': False,
                'error': 'Email/nombre de usuario y contraseña son requeridos'
            }), 400

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

                return jsonify({
                    'success': True,
                    'message': 'Inicio de sesión exitoso',
                    'usuario': usuario.to_dict()
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Contraseña incorrecta'
                }), 401
        else:
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado'
            }), 404

    except Exception as e:
        print(f"Error en login API: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500

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

@usuarios_bp.route('/perfil/upload-picture', methods=['POST'])
def upload_profile_picture():
    """Subir foto de perfil del usuario"""
    print("=== PROFILE PICTURE UPLOAD STARTED ===")
    try:
        if 'usuario_id' not in session:
            print("ERROR: User not authenticated")
            return jsonify({
                'success': False,
                'error': 'Usuario no autenticado'
            }), 401

        usuario_id = session['usuario_id']
        print(f"User ID: {usuario_id}")

        # Check if file is in request
        if 'profile_picture' not in request.files:
            print("ERROR: No file found in request.files")
            return jsonify({
                'success': False,
                'error': 'No se encontró el archivo'
            }), 400

        file = request.files['profile_picture']
        print(f"File received: {file.filename}")

        # Check if file is selected
        if file.filename == '':
            print("ERROR: Empty filename")
            return jsonify({
                'success': False,
                'error': 'No se seleccionó ningún archivo'
            }), 400

        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
        if not file or '.' not in file.filename:
            print("ERROR: Invalid file")
            return jsonify({
                'success': False,
                'error': 'Archivo no válido'
            }), 400

        extension = file.filename.rsplit('.', 1)[1].lower()
        print(f"File extension: {extension}")
        if extension not in allowed_extensions:
            print(f"ERROR: Extension {extension} not allowed")
            return jsonify({
                'success': False,
                'error': 'Tipo de archivo no permitido. Use PNG, JPG, JPEG o GIF'
            }), 400

        # Validate file size (max 5MB)
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Seek back to beginning
        print(f"File size: {file_size} bytes")

        if file_size > 5 * 1024 * 1024:  # 5MB
            print("ERROR: File too large")
            return jsonify({
                'success': False,
                'error': 'El archivo es demasiado grande. Máximo 5MB'
            }), 400

        # Create uploads directory if it doesn't exist
        import os
        uploads_dir = os.path.join(os.getcwd(), 'app', 'static', 'uploads', 'profile_pictures')
        print(f"Uploads directory: {uploads_dir}")
        os.makedirs(uploads_dir, exist_ok=True)

        # Generate unique filename
        import uuid
        filename = f"{usuario_id}_{uuid.uuid4().hex}.{extension}"
        filepath = os.path.join(uploads_dir, filename)
        print(f"File will be saved to: {filepath}")

        # Save file
        print("Saving file...")
        file.save(filepath)
        print("File saved successfully")

        # Update user profile picture in database
        print("Updating database...")
        try:
            # Use the existing Usuario model method to update
            print(f"Updating user {usuario_id} with photo {filename}")
            success = Usuario.actualizar_foto_perfil(usuario_id, filename)
            if not success:
                print("ERROR: Model update returned False")
                return jsonify({
                    'success': False,
                    'error': 'Error actualizando la base de datos'
                }), 500

            print("Database updated successfully via model")

            # Generate URL for the uploaded image
            image_url = f"/static/uploads/profile_pictures/{filename}"

            print("=== PROFILE PICTURE UPLOAD COMPLETED SUCCESSFULLY ===")
            return jsonify({
                'success': True,
                'message': 'Foto de perfil actualizada exitosamente',
                'image_url': image_url,
                'filename': filename
            })

        except Exception as e:
            print(f"ERROR updating database: {e}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return jsonify({
                'success': False,
                'error': 'Error interno del servidor'
            }), 500

    except Exception as e:
        print(f"ERROR in upload function: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor'
        }), 500

def usuario_autenticado():
    """Verificar si el usuario está autenticado"""
    return 'usuario_id' in session

def obtener_usuario_actual():
    """Obtener información del usuario actual"""
    if usuario_autenticado():
        usuario_id = session['usuario_id']
        return Usuario.obtener_usuario_por_id(usuario_id)
    return None
