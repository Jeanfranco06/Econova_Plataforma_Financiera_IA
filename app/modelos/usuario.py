"""
Autor: Germaín (Backend) - Integración con Jeanfranco (BD y Gamificación)
"""
from datetime import datetime
from typing import Dict, Any, Optional, List
from app.utils.base_datos import ejecutar_query, ejecutar_query_una_fila, insertar_con_retorno

class Usuario:
    """Modelo de Usuario del sistema"""
    
    def __init__(self, usuario_id: int = None, email: str = None, nombre: str = None,
                 nivel: str = 'basico', fecha_registro: datetime = None, activo: bool = True):
        self.usuario_id = usuario_id
        self.email = email
        self.nombre = nombre
        self.nivel = nivel  # basico, avanzado, experto
        self.fecha_registro = fecha_registro or datetime.now()
        self.activo = activo
    
    @classmethod
    def crear(cls, email: str, nombre: str, nivel: str = 'basico') -> 'Usuario':
        """
        Crea un nuevo usuario en la base de datos
        
        Args:
            email: Email del usuario
            nombre: Nombre del usuario
            nivel: Nivel de experiencia (basico, avanzado, experto)
            
        Returns:
            Usuario: Objeto Usuario creado
        """
        query = """
            INSERT INTO usuarios (email, nombre, nivel, fecha_registro, activo)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING usuario_id, email, nombre, nivel, fecha_registro, activo
        """
        
        resultado = insertar_con_retorno(query, (email, nombre, nivel, datetime.now(), True))
        
        return cls(
            usuario_id=resultado['usuario_id'],
            email=resultado['email'],
            nombre=resultado['nombre'],
            nivel=resultado['nivel'],
            fecha_registro=resultado['fecha_registro'],
            activo=resultado['activo']
        )
    
    @classmethod
    def obtener_por_id(cls, usuario_id: int) -> Optional['Usuario']:
        """
        Obtiene un usuario por su ID
        
        Args:
            usuario_id: ID del usuario
            
        Returns:
            Usuario o None si no existe
        """
        query = "SELECT * FROM usuarios WHERE usuario_id = %s"
        resultado = ejecutar_query_una_fila(query, (usuario_id,))
        
        if resultado:
            return cls(
                usuario_id=resultado['usuario_id'],
                email=resultado['email'],
                nombre=resultado['nombre'],
                nivel=resultado['nivel'],
                fecha_registro=resultado['fecha_registro'],
                activo=resultado['activo']
            )
        return None
    
    @classmethod
    def obtener_por_email(cls, email: str) -> Optional['Usuario']:
        """
        Obtiene un usuario por su email
        
        Args:
            email: Email del usuario
            
        Returns:
            Usuario o None si no existe
        """
        query = "SELECT * FROM usuarios WHERE email = %s"
        resultado = ejecutar_query_una_fila(query, (email,))
        
        if resultado:
            return cls(
                usuario_id=resultado['usuario_id'],
                email=resultado['email'],
                nombre=resultado['nombre'],
                nivel=resultado['nivel'],
                fecha_registro=resultado['fecha_registro'],
                activo=resultado['activo']
            )
        return None
    
    @classmethod
    def listar_todos(cls, limit: int = 100) -> List['Usuario']:
        """
        Lista todos los usuarios
        
        Args:
            limit: Límite de resultados
            
        Returns:
            List[Usuario]: Lista de usuarios
        """
        query = "SELECT * FROM usuarios WHERE activo = true ORDER BY fecha_registro DESC LIMIT %s"
        resultados = ejecutar_query(query, (limit,))
        
        return [cls(
            usuario_id=r['usuario_id'],
            email=r['email'],
            nombre=r['nombre'],
            nivel=r['nivel'],
            fecha_registro=r['fecha_registro'],
            activo=r['activo']
        ) for r in resultados]
    
    def actualizar_nivel(self, nuevo_nivel: str) -> bool:
        """
        Actualiza el nivel del usuario
        
        Args:
            nuevo_nivel: Nuevo nivel (basico, avanzado, experto)
            
        Returns:
            bool: True si se actualizó correctamente
        """
        query = "UPDATE usuarios SET nivel = %s WHERE usuario_id = %s"
        filas_afectadas = ejecutar_query(query, (nuevo_nivel, self.usuario_id), fetch=False)
        
        if filas_afectadas > 0:
            self.nivel = nuevo_nivel
            return True
        return False
    
    def obtener_estadisticas(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas del usuario
        
        Returns:
            Dict: Estadísticas del usuario
        """
        query = """
            SELECT 
                COUNT(*) as total_simulaciones,
                COUNT(DISTINCT tipo_simulacion) as tipos_usados
            FROM simulaciones
            WHERE usuario_id = %s
        """
        
        stats = ejecutar_query_una_fila(query, (self.usuario_id,))
        
        return {
            'usuario_id': self.usuario_id,
            'nombre': self.nombre,
            'nivel': self.nivel,
            'total_simulaciones': stats['total_simulaciones'] if stats else 0,
            'tipos_usados': stats['tipos_usados'] if stats else 0,
            'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convierte el usuario a diccionario
        
        Returns:
            Dict: Representación del usuario
        """
        return {
            'usuario_id': self.usuario_id,
            'email': self.email,
            'nombre': self.nombre,
            'nivel': self.nivel,
            'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None,
            'activo': self.activo
        }
    
    def __repr__(self):
        return f"<Usuario {self.usuario_id}: {self.nombre} ({self.nivel})>"