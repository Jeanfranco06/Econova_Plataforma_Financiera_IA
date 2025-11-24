"""
Autor: Germaín (Backend) - Integración con Jeanfranco (BD y Gamificación)
"""
from datetime import datetime
from typing import Dict, Any, Optional, List
from app.utils.base_datos import ejecutar_query, ejecutar_query_una_fila, insertar_con_retorno

class Logro:
    """Modelo de Logros para gamificación"""
    
    def __init__(self, logro_id: int = None, usuario_id: int = None,
                 tipo_logro: str = None, nombre: str = None, descripcion: str = None,
                 puntos: int = 0, fecha_obtencion: datetime = None):
        self.logro_id = logro_id
        self.usuario_id = usuario_id
        self.tipo_logro = tipo_logro
        self.nombre = nombre
        self.descripcion = descripcion
        self.puntos = puntos
        self.fecha_obtencion = fecha_obtencion
    
    @classmethod
    def otorgar_logro(cls, usuario_id: int, tipo_logro: str, nombre: str,
                      descripcion: str, puntos: int = 10) -> 'Logro':
        """
        Otorga un logro a un usuario
        
        Args:
            usuario_id: ID del usuario
            tipo_logro: Tipo de logro (primera_simulacion, experto_van, etc.)
            nombre: Nombre del logro
            descripcion: Descripción del logro
            puntos: Puntos otorgados
            
        Returns:
            Logro: Objeto Logro creado
        """
        query = """
            INSERT INTO logros (usuario_id, tipo_logro, nombre, descripcion, puntos, fecha_obtencion)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING logro_id, usuario_id, tipo_logro, nombre, descripcion, puntos, fecha_obtencion
        """
        
        resultado = insertar_con_retorno(query, (
            usuario_id, tipo_logro, nombre, descripcion, puntos, datetime.now()
        ))
        
        return cls(
            logro_id=resultado['logro_id'],
            usuario_id=resultado['usuario_id'],
            tipo_logro=resultado['tipo_logro'],
            nombre=resultado['nombre'],
            descripcion=resultado['descripcion'],
            puntos=resultado['puntos'],
            fecha_obtencion=resultado['fecha_obtencion']
        )
    
    @classmethod
    def listar_por_usuario(cls, usuario_id: int) -> List['Logro']:
        """
        Lista todos los logros de un usuario
        
        Args:
            usuario_id: ID del usuario
            
        Returns:
            List[Logro]: Lista de logros
        """
        query = """
            SELECT * FROM logros 
            WHERE usuario_id = %s 
            ORDER BY fecha_obtencion DESC
        """
        resultados = ejecutar_query(query, (usuario_id,))
        
        return [cls(
            logro_id=r['logro_id'],
            usuario_id=r['usuario_id'],
            tipo_logro=r['tipo_logro'],
            nombre=r['nombre'],
            descripcion=r['descripcion'],
            puntos=r['puntos'],
            fecha_obtencion=r['fecha_obtencion']
        ) for r in resultados]
    
    @classmethod
    def obtener_puntos_totales(cls, usuario_id: int) -> int:
        """
        Obtiene el total de puntos de un usuario
        
        Args:
            usuario_id: ID del usuario
            
        Returns:
            int: Total de puntos
        """
        query = "SELECT COALESCE(SUM(puntos), 0) as total FROM logros WHERE usuario_id = %s"
        resultado = ejecutar_query_una_fila(query, (usuario_id,))
        return resultado['total'] if resultado else 0
    
    @classmethod
    def verificar_logro_existe(cls, usuario_id: int, tipo_logro: str) -> bool:
        """
        Verifica si un usuario ya tiene un logro específico
        
        Args:
            usuario_id: ID del usuario
            tipo_logro: Tipo de logro
            
        Returns:
            bool: True si ya tiene el logro
        """
        query = "SELECT COUNT(*) as count FROM logros WHERE usuario_id = %s AND tipo_logro = %s"
        resultado = ejecutar_query_una_fila(query, (usuario_id, tipo_logro))
        return resultado['count'] > 0 if resultado else False
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convierte el logro a diccionario
        
        Returns:
            Dict: Representación del logro
        """
        return {
            'logro_id': self.logro_id,
            'usuario_id': self.usuario_id,
            'tipo_logro': self.tipo_logro,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'puntos': self.puntos,
            'fecha_obtencion': self.fecha_obtencion.isoformat() if self.fecha_obtencion else None
        }
    
    def __repr__(self):
        return f"<Logro {self.logro_id}: {self.nombre} (+{self.puntos} pts)>"