"""
Rutas del Frontend - Econova
Sirve las páginas HTML y gestiona las vistas del usuario
"""

from flask import Blueprint, render_template, request, jsonify

bp_frontend = Blueprint("frontend", __name__)

# ==================== RUTAS PRINCIPALES ====================


@bp_frontend.route("/")
def index():
    """
    Página de inicio - Dashboard principal
    """
    return render_template("inicio.html")


@bp_frontend.route("/simulacion")
def simulacion():
    """
    Página de simulación financiera
    Parámetros URL opcionales:
    - tipo: van, tir, wacc, portafolio, reemplazo, payback
    - duplicar: id de simulación a duplicar
    """
    tipo = request.args.get("tipo", "van").lower()
    duplicar = request.args.get("duplicar")

    # Validar tipo
    tipos_validos = ["van", "tir", "wacc", "portafolio", "reemplazo", "payback"]
    if tipo not in tipos_validos:
        tipo = "van"

    return render_template("simulacion.html", tipo=tipo, duplicar=duplicar)


@bp_frontend.route("/resultados")
def resultados():
    """
    Página de visualización de resultados
    Parámetros URL opcionales:
    - id: id de simulación a mostrar
    """
    simulacion_id = request.args.get("id")

    return render_template("resultados.html", simulacion_id=simulacion_id)


@bp_frontend.route("/chatbot")
def chatbot():
    """
    Página del chatbot inteligente
    """
    return render_template("chatbot.html")


# ==================== RUTAS DE USUARIO ====================


@bp_frontend.route("/perfil")
def perfil():
    """
    Página de perfil del usuario (placeholder)
    """
    return render_template("perfil.html")


@bp_frontend.route("/configuracion")
def configuracion():
    """
    Página de configuración (placeholder)
    """
    return render_template("configuracion.html")


# ==================== RUTAS DE INFORMACIÓN ====================


@bp_frontend.route("/ayuda")
def ayuda():
    """
    Página de ayuda y documentación
    """
    return render_template("ayuda.html")


@bp_frontend.route("/acerca-de")
def acerca_de():
    """
    Página acerca de Econova
    """
    return render_template("acerca-de.html")


# ==================== MANEJO DE ERRORES ====================


@bp_frontend.errorhandler(404)
def pagina_no_encontrada(error):
    """
    Manejo de páginas no encontradas
    """
    return render_template(
        "error.html",
        titulo="Página No Encontrada",
        mensaje="La página que buscas no existe",
        codigo=404,
    ), 404


@bp_frontend.errorhandler(500)
def error_interno(error):
    """
    Manejo de errores internos
    """
    return render_template(
        "error.html",
        titulo="Error Interno del Servidor",
        mensaje="Ocurrió un error inesperado",
        codigo=500,
    ), 500
