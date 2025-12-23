"""
Sistema de Niveles de Usuario - Módulo Centralizado
Gestiona la clasificación y evolución de niveles de usuario en Econova
"""

import logging
from typing import Optional, Dict, Any, Tuple

# Variable global para la función de base de datos
_get_db_connection = None

# Imports relativos - solo cuando se ejecuta como parte de un paquete
if __name__ != "__main__":
    try:
        from ..utils.base_datos import get_db_connection
        _get_db_connection = get_db_connection
    except ImportError:
        _get_db_connection = None

logger = logging.getLogger(__name__)

class SistemaNiveles:
    """
    Sistema centralizado para gestión de niveles de usuario
    Maneja la lógica de clasificación, estadísticas y evolución de niveles
    """

    # Definición de niveles y sus requisitos
    NIVELES = {
        'basico': {
            'nombre': 'Básico',
            'descripcion': 'Usuario principiante aprendiendo conceptos financieros',
            'min_conversaciones': 0,
            'min_simulaciones': 0,
            'min_consultas_tecnicas': 0,
            'icono': '🌱',
            'color': '#10B981'
        },
        'intermedio': {
            'nombre': 'Intermedio',
            'descripcion': 'Usuario con conocimientos moderados realizando análisis',
            'min_conversaciones': 10,
            'min_simulaciones': 2,
            'min_consultas_tecnicas': 3,
            'icono': '📈',
            'color': '#3B82F6'
        },
        'experto': {
            'nombre': 'Experto',
            'descripcion': 'Usuario avanzado realizando análisis complejos',
            'min_conversaciones': 20,
            'min_simulaciones': 5,
            'min_consultas_tecnicas': 10,
            'icono': '🚀',
            'color': '#8B5CF6'
        }
    }

    # Orden de niveles para comparaciones
    ORDEN_NIVELES = ['basico', 'intermedio', 'experto']

    @staticmethod
    def determinar_nivel_usuario(usuario_id: Optional[int] = None,
                               historial_conversaciones: Optional[list] = None) -> str:
        """
        Determina el nivel de expertise del usuario basado en su historial

        Args:
            usuario_id: ID del usuario (opcional si se pasa historial)
            historial_conversaciones: Historial pre-cargado (opcional)

        Returns:
            str: Nivel del usuario ('basico', 'intermedio', 'experto')
        """
        if not usuario_id:
            return "basico"

        try:
            # Obtener estadísticas del usuario
            stats = SistemaNiveles._calcular_estadisticas_usuario(usuario_id)

            if not stats:
                return "basico"

            total_conv = stats.get('total_conversaciones', 0)
            simulaciones = stats.get('simulaciones', 0)
            consultas_tecnicas = stats.get('consultas_tecnicas', 0)

            # Lógica de clasificación
            if total_conv >= SistemaNiveles.NIVELES['experto']['min_conversaciones'] and \
               (simulaciones >= SistemaNiveles.NIVELES['experto']['min_simulaciones'] or \
                consultas_tecnicas >= SistemaNiveles.NIVELES['experto']['min_consultas_tecnicas']):
                return "experto"
            elif total_conv >= SistemaNiveles.NIVELES['intermedio']['min_conversaciones'] and \
                 (simulaciones >= SistemaNiveles.NIVELES['intermedio']['min_simulaciones'] or \
                  consultas_tecnicas >= SistemaNiveles.NIVELES['intermedio']['min_consultas_tecnicas']):
                return "intermedio"
            else:
                return "basico"

        except Exception as e:
            logger.error(f"Error determinando nivel usuario {usuario_id}: {e}")
            return "basico"

    @staticmethod
    def _calcular_estadisticas_usuario(usuario_id: int) -> Optional[Dict[str, Any]]:
        """
        Calcula estadísticas detalladas del usuario para determinar su nivel

        Args:
            usuario_id: ID del usuario

        Returns:
            Dict con estadísticas o None si hay error
        """
        global _get_db_connection

        try:
            # Verificar que tengamos acceso a la base de datos
            if _get_db_connection is None:
                logger.error("get_db_connection no disponible - archivo no importado correctamente")
                return None

            conn = _get_db_connection().conn
            cursor = conn.cursor()

            # Consulta principal de estadísticas
            cursor.execute("""
                SELECT
                    COUNT(*) as total_conversaciones,
                    AVG(LENGTH(mensaje_usuario)) as longitud_promedio,
                    COUNT(CASE WHEN tipo_interaccion = 'simulacion_financiera' THEN 1 END) as simulaciones,
                    COUNT(CASE WHEN tipo_interaccion = 'consulta_tecnica' THEN 1 END) as consultas_tecnicas,
                    COUNT(CASE WHEN tipo_interaccion LIKE 'simulacion_%' THEN 1 END) as total_simulaciones,
                    MAX(fecha) as ultima_conversacion,
                    MIN(fecha) as primera_conversacion
                FROM Conversaciones_Chatbot
                WHERE usuario_id = ? AND fecha > datetime('now', '-30 days')
            """, (usuario_id,))

            row = cursor.fetchone()
            conn.close()

            if not row:
                return None

            stats = {
                'total_conversaciones': row[0] or 0,
                'longitud_promedio': row[1] or 0,
                'simulaciones': row[2] or 0,
                'consultas_tecnicas': row[3] or 0,
                'total_simulaciones': row[4] or 0,
                'ultima_conversacion': row[5],
                'primera_conversacion': row[6]
            }

            return stats

        except Exception as e:
            logger.error(f"Error calculando estadísticas usuario {usuario_id}: {e}")
            return None

    @staticmethod
    def obtener_info_nivel(nivel: str) -> Dict[str, Any]:
        """
        Obtiene información completa sobre un nivel específico

        Args:
            nivel: Nombre del nivel

        Returns:
            Dict con información del nivel
        """
        return SistemaNiveles.NIVELES.get(nivel, SistemaNiveles.NIVELES['basico'])

    @staticmethod
    def obtener_proximo_nivel(nivel_actual: str) -> Optional[str]:
        """
        Obtiene el siguiente nivel en la jerarquía

        Args:
            nivel_actual: Nivel actual del usuario

        Returns:
            Siguiente nivel o None si ya está en el máximo
        """
        try:
            current_index = SistemaNiveles.ORDEN_NIVELES.index(nivel_actual)
            if current_index < len(SistemaNiveles.ORDEN_NIVELES) - 1:
                return SistemaNiveles.ORDEN_NIVELES[current_index + 1]
            return None
        except ValueError:
            return None

    @staticmethod
    def calcular_progreso_hacia_nivel(usuario_id: int, nivel_objetivo: str) -> Dict[str, Any]:
        """
        Calcula el progreso del usuario hacia un nivel específico

        Args:
            usuario_id: ID del usuario
            nivel_objetivo: Nivel al que se quiere llegar

        Returns:
            Dict con información de progreso
        """
        stats = SistemaNiveles._calcular_estadisticas_usuario(usuario_id)
        if not stats:
            return {'progreso': 0, 'faltante': {}, 'completado': False}

        requisitos = SistemaNiveles.NIVELES.get(nivel_objetivo, {})
        if not requisitos:
            return {'progreso': 0, 'faltante': {}, 'completado': False}

        # Calcular progreso por cada métrica
        progreso_conversaciones = min(100, (stats['total_conversaciones'] / requisitos['min_conversaciones']) * 100) if requisitos['min_conversaciones'] > 0 else 100
        progreso_simulaciones = min(100, (stats['simulaciones'] / requisitos['min_simulaciones']) * 100) if requisitos['min_simulaciones'] > 0 else 100
        progreso_consultas = min(100, (stats['consultas_tecnicas'] / requisitos['min_consultas_tecnicas']) * 100) if requisitos['min_consultas_tecnicas'] > 0 else 100

        # Progreso general (promedio ponderado)
        progreso_general = (progreso_conversaciones + progreso_simulaciones + progreso_consultas) / 3

        # Calcular qué falta
        faltante = {}
        if stats['total_conversaciones'] < requisitos['min_conversaciones']:
            faltante['conversaciones'] = requisitos['min_conversaciones'] - stats['total_conversaciones']
        if stats['simulaciones'] < requisitos['min_simulaciones']:
            faltante['simulaciones'] = requisitos['min_simulaciones'] - stats['simulaciones']
        if stats['consultas_tecnicas'] < requisitos['min_consultas_tecnicas']:
            faltante['consultas_tecnicas'] = requisitos['min_consultas_tecnicas'] - stats['consultas_tecnicas']

        return {
            'progreso': round(progreso_general, 1),
            'detalle_progreso': {
                'conversaciones': round(progreso_conversaciones, 1),
                'simulaciones': round(progreso_simulaciones, 1),
                'consultas_tecnicas': round(progreso_consultas, 1)
            },
            'faltante': faltante,
            'completado': len(faltante) == 0,
            'estadisticas_actuales': stats,
            'requisitos': requisitos
        }

    @staticmethod
    def obtener_recomendaciones_mejora(nivel_actual: str, usuario_id: int) -> list:
        """
        Genera recomendaciones para que el usuario suba de nivel

        Args:
            nivel_actual: Nivel actual del usuario
            usuario_id: ID del usuario

        Returns:
            Lista de recomendaciones
        """
        recomendaciones = []

        proximo_nivel = SistemaNiveles.obtener_proximo_nivel(nivel_actual)
        if not proximo_nivel:
            return ["¡Ya estás en el nivel máximo! Sigue aprendiendo y contribuyendo."]

        progreso = SistemaNiveles.calcular_progreso_hacia_nivel(usuario_id, proximo_nivel)

        if not progreso['completado']:
            faltante = progreso['faltante']

            if 'conversaciones' in faltante:
                recomendaciones.append(f"Realiza {faltante['conversaciones']} conversaciones más con el chatbot")

            if 'simulaciones' in faltante:
                recomendaciones.append(f"Completa {faltante['simulaciones']} simulaciones financieras más")

            if 'consultas_tecnicas' in faltante:
                recomendaciones.append(f"Haz {faltante['consultas_tecnicas']} consultas técnicas más sobre VAN, TIR, WACC")

        # Recomendaciones generales
        recomendaciones.extend([
            "Explora diferentes tipos de análisis financiero",
            "Participa en grupos de benchmarking",
            "Prueba los calculadores avanzados de ML"
        ])

        return recomendaciones

    @staticmethod
    def validar_nivel(nivel: str) -> bool:
        """
        Valida si un nivel es válido

        Args:
            nivel: Nivel a validar

        Returns:
            True si es válido, False en caso contrario
        """
        return nivel in SistemaNiveles.NIVELES

    @staticmethod
    def obtener_todos_niveles() -> Dict[str, Dict]:
        """
        Obtiene información de todos los niveles disponibles

        Returns:
            Dict con información de todos los niveles
        """
        return SistemaNiveles.NIVELES.copy()

    @staticmethod
    def comparar_niveles(nivel1: str, nivel2: str) -> int:
        """
        Compara dos niveles y retorna cuál es superior

        Args:
            nivel1: Primer nivel
            nivel2: Segundo nivel

        Returns:
            -1 si nivel1 < nivel2, 0 si son iguales, 1 si nivel1 > nivel2
        """
        try:
            idx1 = SistemaNiveles.ORDEN_NIVELES.index(nivel1)
            idx2 = SistemaNiveles.ORDEN_NIVELES.index(nivel2)
            return (idx1 > idx2) - (idx1 < idx2)  # Retorna -1, 0, o 1
        except ValueError:
            return 0  # Si algún nivel no es válido, considera iguales


# Instancia global para acceso directo
sistema_niveles = SistemaNiveles()
