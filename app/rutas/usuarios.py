from flask import Blueprint, request, jsonify
from app.modelos.usuario import Usuario
from app.modelos.logro import Logro

bp_usuarios = Blueprint('usuarios', __name__, url_prefix='/api/v1/usuarios')

@bp_usuarios.route('/', methods=['POST'])
def crear_usuario():
    """
    Crea un nuevo usuario
    
    Body JSON:
    {
        "email": "user@example.com",
        "nombre": "Juan Pérez",
        "nivel": "basico"
    }
    """
    try:
        datos = request.get_json()
        
        email = datos.get('email')
        nombre = datos.get('nombre')
        nivel = datos.get('nivel', 'basico')
        
        if not email or not nombre:
            return jsonify({'error': 'Email y nombre son requeridos'}), 400
        
        # Verificar si el usuario ya existe
        usuario_existente = Usuario.obtener_por_email(email)
        if usuario_existente:
            return jsonify({'error': 'El email ya está registrado'}), 400
        
        # Crear usuario
        usuario = Usuario.crear(email, nombre, nivel)
        
        # Otorgar logro de bienvenida
        Logro.otorgar_logro(
            usuario_id=usuario.usuario_id,
            tipo_logro='bienvenida',
            nombre='¡Bienvenido a Econova!',
            descripcion='Te registraste en la plataforma',
            puntos=5
        )
        
        return jsonify({
            'success': True,
            'data': usuario.to_dict(),
            'message': 'Usuario creado exitosamente'
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500

@bp_usuarios.route('/<int:usuario_id>', methods=['GET'])
def obtener_usuario(usuario_id):
    """Obtiene un usuario por ID"""
    try:
        usuario = Usuario.obtener_por_id(usuario_id)
        
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'success': True,
            'data': usuario.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500

@bp_usuarios.route('/email/<email>', methods=['GET'])
def obtener_usuario_por_email(email):
    """Obtiene un usuario por email"""
    try:
        usuario = Usuario.obtener_por_email(email)
        
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'success': True,
            'data': usuario.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500

@bp_usuarios.route('/<int:usuario_id>/estadisticas', methods=['GET'])
def obtener_estadisticas(usuario_id):
    """Obtiene estadísticas de un usuario"""
    try:
        usuario = Usuario.obtener_por_id(usuario_id)
        
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        stats = usuario.obtener_estadisticas()
        
        # Agregar logros y puntos
        logros = Logro.listar_por_usuario(usuario_id)
        puntos_totales = Logro.obtener_puntos_totales(usuario_id)
        
        stats['logros'] = [l.to_dict() for l in logros]
        stats['total_logros'] = len(logros)
        stats['puntos_totales'] = puntos_totales
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500

@bp_usuarios.route('/<int:usuario_id>/nivel', methods=['PUT'])
def actualizar_nivel(usuario_id):
    """
    Actualiza el nivel de un usuario
    
    Body JSON:
    {
        "nivel": "avanzado"
    }
    """
    try:
        usuario = Usuario.obtener_por_id(usuario_id)
        
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        datos = request.get_json()
        nuevo_nivel = datos.get('nivel')
        
        if nuevo_nivel not in ['basico', 'avanzado', 'experto']:
            return jsonify({'error': 'Nivel inválido. Debe ser: basico, avanzado o experto'}), 400
        
        usuario.actualizar_nivel(nuevo_nivel)
        
        return jsonify({
            'success': True,
            'data': usuario.to_dict(),
            'message': f'Nivel actualizado a {nuevo_nivel}'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500

@bp_usuarios.route('/<int:usuario_id>/logros', methods=['GET'])
def obtener_logros_usuario(usuario_id):
    """Obtiene los logros de un usuario"""
    try:
        logros = Logro.listar_por_usuario(usuario_id)
        puntos_totales = Logro.obtener_puntos_totales(usuario_id)
        
        return jsonify({
            'success': True,
            'data': [l.to_dict() for l in logros],
            'total_logros': len(logros),
            'puntos_totales': puntos_totales
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500

@bp_usuarios.route('/', methods=['GET'])
def listar_usuarios():
    """Lista todos los usuarios"""
    try:
        limit = int(request.args.get('limit', 100))
        usuarios = Usuario.listar_todos(limit)
        
        return jsonify({
            'success': True,
            'data': [u.to_dict() for u in usuarios],
            'total': len(usuarios)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500