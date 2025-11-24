from datetime import datetime
from typing import Dict, Any, Optional, List
import json
from app.utils.base_datos import ejecutar_query, ejecutar_query_una_fila, insertar_con_retorno

class Simulacion:
    """Modelo de Simulación Financiera"""
    
    TIPOS_VALIDOS = ['VAN', 'TIR', 'WACC', 'PORTAFOLIO', 'REEMPLAZO_ACTIVOS']
    
    def __init__(self, simulacion_id: int = None, usuario_id: int = None,
                 nombre: str = None, tipo_simulacion: str = None,
                 parametros: Dict = None, resultados: Dict = None,
                 fecha_creacion: datetime = None, activo: bool = True):
        self.simulacion_id = simulacion_id
        self.usuario_id = usuario_id
        self.nombre = nombre
        self.tipo_simulacion = tipo_simulacion
        self.parametros = parametros or {}
        self.resultados = resultados or {}
        self.fecha_creacion = fecha_creacion or datetime.now()
        self.activo = activo
    
    @classmethod
    def crear(cls, usuario_id: int, nombre: str, tipo_simulacion: str,
              parametros: Dict, resultados: Dict) -> 'Simulacion':
        """
        Crea una nueva simulación en la base de datos
        
        Args:
            usuario_id: ID del usuario
            nombre: Nombre de la simulación
            tipo_simulacion: Tipo (VAN, TIR, WACC, etc.)
            parametros: Diccionario con parámetros de entrada
            resultados: Diccionario con resultados calculados
            
        Returns:
            Simulacion: Objeto Simulacion creado
        """
        if tipo_simulacion not in cls.TIPOS_VALIDOS:
            raise ValueError(f"Tipo de simulación inválido. Debe ser uno de: {cls.TIPOS_VALIDOS}")
        
        query = """
            INSERT INTO simulaciones 
            (usuario_id, nombre, tipo_simulacion, parametros, resultados, fecha_creacion, activo)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING simulacion_id, usuario_id, nombre, tipo_simulacion, 
                      parametros, resultados, fecha_creacion, activo
        """
        
        resultado = insertar_con_retorno(query, (
            usuario_id,
            nombre,
            tipo_simulacion,
            json.dumps(parametros),
            json.dumps(resultados),
            datetime.now(),
            True
        ))
        
        return cls(
            simulacion_id=resultado['simulacion_id'],
            usuario_id=resultado['usuario_id'],
            nombre=resultado['nombre'],
            tipo_simulacion=resultado['tipo_simulacion'],
            parametros=resultado['parametros'] if isinstance(resultado['parametros'], dict) 
                      else json.loads(resultado['parametros']),
            resultados=resultado['resultados'] if isinstance(resultado['resultados'], dict)
                      else json.loads(resultado['resultados']),
            fecha_creacion=resultado['fecha_creacion'],
            activo=resultado['activo']
        )
    
    @classmethod
    def obtener_por_id(cls, simulacion_id: int) -> Optional['Simulacion']:
        """
        Obtiene una simulación por su ID
        
        Args:
            simulacion_id: ID de la simulación
            
        Returns:
            Simulacion o None si no existe
        """
        query = "SELECT * FROM simulaciones WHERE simulacion_id = %s"
        resultado = ejecutar_query_una_fila(query, (simulacion_id,))
        
        if resultado:
            return cls._from_db_row(resultado)
        return None
    
    @classmethod
    def listar_por_usuario(cls, usuario_id: int, tipo: str = None, limit: int = 50) -> List['Simulacion']:
        """
        Lista simulaciones de un usuario
        
        Args:
            usuario_id: ID del usuario
            tipo: Filtrar por tipo de simulación (opcional)
            limit: Límite de resultados
            
        Returns:
            List[Simulacion]: Lista de simulaciones
        """
        if tipo:
            query = """
                SELECT * FROM simulaciones 
                WHERE usuario_id = %s AND tipo_simulacion = %s AND activo = true
                ORDER BY fecha_creacion DESC LIMIT %s
            """
            resultados = ejecutar_query(query, (usuario_id, tipo, limit))
        else:
            query = """
                SELECT * FROM simulaciones 
                WHERE usuario_id = %s AND activo = true
                ORDER BY fecha_creacion DESC LIMIT %s
            """
            resultados = ejecutar_query(query, (usuario_id, limit))
        
        return [cls._from_db_row(r) for r in resultados]
    
    @classmethod
    def listar_todas(cls, limit: int = 100) -> List['Simulacion']:
        """
        Lista todas las simulaciones
        
        Args:
            limit: Límite de resultados
            
        Returns:
            List[Simulacion]: Lista de simulaciones
        """
        query = """
            SELECT * FROM simulaciones 
            WHERE activo = true
            ORDER BY fecha_creacion DESC LIMIT %s
        """
        resultados = ejecutar_query(query, (limit,))
        
        return [cls._from_db_row(r) for r in resultados]
    
    @classmethod
    def obtener_estadisticas_por_tipo(cls) -> List[Dict[str, Any]]:
        """
        Obtiene estadísticas agrupadas por tipo de simulación
        
        Returns:
            List[Dict]: Estadísticas por tipo
        """
        query = """
            SELECT 
                tipo_simulacion,
                COUNT(*) as total,
                COUNT(DISTINCT usuario_id) as usuarios_unicos
            FROM simulaciones
            WHERE activo = true
            GROUP BY tipo_simulacion
            ORDER BY total DESC
        """
        
        return ejecutar_query(query)
    
    def actualizar_resultados(self, nuevos_resultados: Dict) -> bool:
        """
        Actualiza los resultados de una simulación
        
        Args:
            nuevos_resultados: Diccionario con nuevos resultados
            
        Returns:
            bool: True si se actualizó correctamente
        """
        query = "UPDATE simulaciones SET resultados = %s WHERE simulacion_id = %s"
        filas_afectadas = ejecutar_query(query, (json.dumps(nuevos_resultados), self.simulacion_id), fetch=False)
        
        if filas_afectadas > 0:
            self.resultados = nuevos_resultados
            return True
        return False
    
    def eliminar(self) -> bool:
        """
        Marca la simulación como inactiva (soft delete)
        
        Returns:
            bool: True si se eliminó correctamente
        """
        query = "UPDATE simulaciones SET activo = false WHERE simulacion_id = %s"
        filas_afectadas = ejecutar_query(query, (self.simulacion_id,), fetch=False)
        
        if filas_afectadas > 0:
            self.activo = False
            return True
        return False
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convierte la simulación a diccionario
        
        Returns:
            Dict: Representación de la simulación
        """
        return {
            'simulacion_id': self.simulacion_id,
            'usuario_id': self.usuario_id,
            'nombre': self.nombre,
            'tipo_simulacion': self.tipo_simulacion,
            'parametros': self.parametros,
            'resultados': self.resultados,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'activo': self.activo
        }
    
    @staticmethod
    def _from_db_row(row: Dict) -> 'Simulacion':
        """
        Crea una instancia de Simulacion desde una fila de BD
        
        Args:
            row: Diccionario con datos de la BD
            
        Returns:
            Simulacion: Objeto Simulacion
        """
        return Simulacion(
            simulacion_id=row['simulacion_id'],
            usuario_id=row['usuario_id'],
            nombre=row['nombre'],
            tipo_simulacion=row['tipo_simulacion'],
            parametros=row['parametros'] if isinstance(row['parametros'], dict) 
                      else json.loads(row['parametros']) if row['parametros'] else {},
            resultados=row['resultados'] if isinstance(row['resultados'], dict)
                      else json.loads(row['resultados']) if row['resultados'] else {},
            fecha_creacion=row['fecha_creacion'],
            activo=row['activo']
        )
    
    def __repr__(self):
        return f"<Simulacion {self.simulacion_id}: {self.nombre} ({self.tipo_simulacion})>"