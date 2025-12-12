"""
Servicio de Machine Learning - Econova
Autor: Diego (Responsable de ML)

Este módulo proporciona servicios de ML para:
- Predicción de ingresos
- Predicción de crecimiento empresarial
- Clasificación de riesgo financiero
- Análisis de sensibilidad (Monte Carlo, Tornado, Escenarios)
"""

import os
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple, Optional
from scipy import stats

# Intentar cargar joblib para modelos pre-entrenados
try:
    import joblib
    JOBLIB_AVAILABLE = True
except ImportError:
    JOBLIB_AVAILABLE = False


class ServicioML:
    """
    Servicio principal de Machine Learning para predicciones financieras.
    Carga modelos pre-entrenados y proporciona métodos de predicción.
    """
    
    def __init__(self):
        """Inicializa el servicio y carga los modelos si están disponibles."""
        self.modelos_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'modelos')
        self.modelos_cargados = False
        self.modelo_ingresos = None
        self.modelo_crecimiento = None
        self.modelo_riesgo = None
        self.scaler_ingresos = None
        self.label_encoder_riesgo = None
        self.metadatos = None
        
        self._cargar_modelos()
    
    def _cargar_modelos(self):
        """Intenta cargar los modelos pre-entrenados."""
        if not JOBLIB_AVAILABLE:
            print("⚠️ joblib no disponible, usando modelos simulados")
            return
            
        try:
            if os.path.exists(self.modelos_dir):
                self.modelo_ingresos = joblib.load(
                    os.path.join(self.modelos_dir, 'modelo_ingresos_xgb.joblib')
                )
                self.modelo_crecimiento = joblib.load(
                    os.path.join(self.modelos_dir, 'modelo_crecimiento_xgb.joblib')
                )
                self.modelo_riesgo = joblib.load(
                    os.path.join(self.modelos_dir, 'modelo_riesgo_xgb.joblib')
                )
                self.scaler_ingresos = joblib.load(
                    os.path.join(self.modelos_dir, 'scaler_ingresos.joblib')
                )
                self.label_encoder_riesgo = joblib.load(
                    os.path.join(self.modelos_dir, 'label_encoder_riesgo.joblib')
                )
                self.metadatos = joblib.load(
                    os.path.join(self.modelos_dir, 'metadatos_modelos.joblib')
                )
                self.modelos_cargados = True
                print("✅ Modelos ML cargados exitosamente")
        except Exception as e:
            print(f"⚠️ No se pudieron cargar modelos: {e}")
            self.modelos_cargados = False
    
    def predecir_ingresos(self, datos_empresa: Dict[str, float]) -> Dict[str, Any]:
        """
        Predice los ingresos del próximo año para una empresa.
        
        Args:
            datos_empresa: Diccionario con indicadores financieros:
                - ingresos_anuales: Ingresos actuales
                - gastos_operativos: Gastos operativos
                - activos_totales: Total de activos
                - pasivos_totales: Total de pasivos
                - antiguedad_anios: Años de operación
                - num_empleados: Número de empleados
                - num_clientes: Número de clientes
                - tasa_retencion_clientes: Tasa de retención (0-1)
                - inflacion: Tasa de inflación esperada
                - tasa_interes_referencia: Tasa de interés del mercado
                - crecimiento_pib_sector: Crecimiento esperado del sector
                
        Returns:
            Predicción de ingresos con intervalos de confianza
        """
        # Calcular indicadores derivados
        margen_bruto = (datos_empresa['ingresos_anuales'] - datos_empresa['gastos_operativos']) / datos_empresa['ingresos_anuales']
        ratio_endeudamiento = datos_empresa['pasivos_totales'] / datos_empresa['activos_totales']
        roi = (datos_empresa['ingresos_anuales'] - datos_empresa['gastos_operativos']) / datos_empresa['activos_totales']
        liquidez = datos_empresa['activos_totales'] / (datos_empresa['pasivos_totales'] + 1)
        
        if self.modelos_cargados and self.modelo_ingresos is not None:
            # Usar modelo entrenado
            features = np.array([[
                datos_empresa['ingresos_anuales'],
                datos_empresa['gastos_operativos'],
                datos_empresa['activos_totales'],
                datos_empresa['pasivos_totales'],
                datos_empresa.get('antiguedad_anios', 5),
                datos_empresa.get('num_empleados', 50),
                datos_empresa.get('num_clientes', 500),
                datos_empresa.get('tasa_retencion_clientes', 0.8),
                margen_bruto,
                ratio_endeudamiento,
                roi,
                liquidez,
                datos_empresa.get('inflacion', 0.04),
                datos_empresa.get('tasa_interes_referencia', 0.08),
                datos_empresa.get('crecimiento_pib_sector', 0.03)
            ]])
            
            prediccion = self.modelo_ingresos.predict(features)[0]
        else:
            # Modelo simplificado (fallback)
            crecimiento_estimado = (
                0.02 +  # Base
                margen_bruto * 0.12 +
                roi * 0.08 +
                datos_empresa.get('crecimiento_pib_sector', 0.03) * 0.4 +
                datos_empresa.get('tasa_retencion_clientes', 0.8) * 0.06 -
                ratio_endeudamiento * 0.04 -
                datos_empresa.get('inflacion', 0.04) * 0.2
            )
            prediccion = datos_empresa['ingresos_anuales'] * (1 + crecimiento_estimado)
        
        # Calcular intervalos de confianza (±15% aproximado)
        error_std = prediccion * 0.15
        
        return {
            'ingresos_predichos': round(prediccion, 2),
            'intervalo_confianza_90': {
                'inferior': round(prediccion - 1.645 * error_std, 2),
                'superior': round(prediccion + 1.645 * error_std, 2)
            },
            'crecimiento_esperado_pct': round((prediccion / datos_empresa['ingresos_anuales'] - 1) * 100, 2),
            'modelo_usado': 'XGBoost' if self.modelos_cargados else 'Heurístico',
            'indicadores_calculados': {
                'margen_bruto': round(margen_bruto, 4),
                'ratio_endeudamiento': round(ratio_endeudamiento, 4),
                'roi': round(roi, 4),
                'liquidez': round(liquidez, 4)
            }
        }
    
    def predecir_crecimiento(self, datos_empresa: Dict[str, float]) -> Dict[str, Any]:
        """
        Predice la tasa de crecimiento anual de una empresa.
        
        Args:
            datos_empresa: Diccionario con indicadores financieros
            
        Returns:
            Predicción de tasa de crecimiento
        """
        # Calcular indicadores
        margen_bruto = (datos_empresa['ingresos_anuales'] - datos_empresa['gastos_operativos']) / datos_empresa['ingresos_anuales']
        ratio_endeudamiento = datos_empresa['pasivos_totales'] / datos_empresa['activos_totales']
        roi = (datos_empresa['ingresos_anuales'] - datos_empresa['gastos_operativos']) / datos_empresa['activos_totales']
        liquidez = datos_empresa['activos_totales'] / (datos_empresa['pasivos_totales'] + 1)
        
        if self.modelos_cargados and self.modelo_crecimiento is not None:
            features = np.array([[
                datos_empresa['ingresos_anuales'],
                datos_empresa['gastos_operativos'],
                datos_empresa['activos_totales'],
                datos_empresa.get('antiguedad_anios', 5),
                datos_empresa.get('num_empleados', 50),
                datos_empresa.get('tasa_retencion_clientes', 0.8),
                margen_bruto,
                ratio_endeudamiento,
                roi,
                liquidez,
                datos_empresa.get('inflacion', 0.04),
                datos_empresa.get('tasa_interes_referencia', 0.08),
                datos_empresa.get('crecimiento_pib_sector', 0.03)
            ]])
            
            crecimiento = self.modelo_crecimiento.predict(features)[0]
        else:
            # Modelo heurístico
            crecimiento = (
                0.02 +
                margen_bruto * 0.15 +
                roi * 0.10 +
                datos_empresa.get('crecimiento_pib_sector', 0.03) * 0.5 +
                datos_empresa.get('tasa_retencion_clientes', 0.8) * 0.08 -
                ratio_endeudamiento * 0.05 -
                datos_empresa.get('inflacion', 0.04) * 0.3
            )
        
        # Clasificar el crecimiento
        if crecimiento > 0.15:
            categoria = 'Alto'
            color = 'green'
        elif crecimiento > 0.05:
            categoria = 'Moderado'
            color = 'yellow'
        elif crecimiento > 0:
            categoria = 'Bajo'
            color = 'orange'
        else:
            categoria = 'Negativo'
            color = 'red'
        
        return {
            'crecimiento_anual': round(crecimiento, 4),
            'crecimiento_porcentaje': round(crecimiento * 100, 2),
            'categoria': categoria,
            'color': color,
            'modelo_usado': 'XGBoost' if self.modelos_cargados else 'Heurístico',
            'interpretacion': f"Se espera un crecimiento {categoria.lower()} del {crecimiento*100:.1f}% anual"
        }
    
    def clasificar_riesgo(self, datos_empresa: Dict[str, float]) -> Dict[str, Any]:
        """
        Clasifica el nivel de riesgo financiero de una empresa.
        
        Args:
            datos_empresa: Diccionario con indicadores financieros
            
        Returns:
            Clasificación de riesgo (Bajo, Medio, Alto) con probabilidades
        """
        # Calcular indicadores
        margen_bruto = (datos_empresa['ingresos_anuales'] - datos_empresa['gastos_operativos']) / datos_empresa['ingresos_anuales']
        ratio_endeudamiento = datos_empresa['pasivos_totales'] / datos_empresa['activos_totales']
        roi = (datos_empresa['ingresos_anuales'] - datos_empresa['gastos_operativos']) / datos_empresa['activos_totales']
        liquidez = datos_empresa['activos_totales'] / (datos_empresa['pasivos_totales'] + 1)
        
        if self.modelos_cargados and self.modelo_riesgo is not None:
            features = np.array([[
                datos_empresa['ingresos_anuales'],
                datos_empresa['gastos_operativos'],
                datos_empresa['activos_totales'],
                datos_empresa['pasivos_totales'],
                datos_empresa.get('antiguedad_anios', 5),
                datos_empresa.get('num_empleados', 50),
                datos_empresa.get('tasa_retencion_clientes', 0.8),
                margen_bruto,
                ratio_endeudamiento,
                roi,
                liquidez,
                datos_empresa.get('inflacion', 0.04),
                datos_empresa.get('tasa_interes_referencia', 0.08)
            ]])
            
            prediccion_encoded = self.modelo_riesgo.predict(features)[0]
            nivel_riesgo = self.label_encoder_riesgo.inverse_transform([prediccion_encoded])[0]
            
            # Obtener probabilidades si el modelo lo soporta
            try:
                probabilidades = self.modelo_riesgo.predict_proba(features)[0]
                probs_dict = {
                    clase: round(prob, 4) 
                    for clase, prob in zip(self.label_encoder_riesgo.classes_, probabilidades)
                }
            except:
                probs_dict = {nivel_riesgo: 1.0}
        else:
            # Clasificación heurística
            score_riesgo = 0
            
            if ratio_endeudamiento > 0.7:
                score_riesgo += 3
            elif ratio_endeudamiento > 0.5:
                score_riesgo += 1
            
            if margen_bruto < 0.1:
                score_riesgo += 3
            elif margen_bruto < 0.2:
                score_riesgo += 1
            
            if liquidez < 1.2:
                score_riesgo += 2
            elif liquidez < 1.5:
                score_riesgo += 1
            
            if roi < 0.05:
                score_riesgo += 2
            elif roi < 0.1:
                score_riesgo += 1
            
            if score_riesgo >= 5:
                nivel_riesgo = 'Alto'
                probs_dict = {'Alto': 0.8, 'Medio': 0.15, 'Bajo': 0.05}
            elif score_riesgo >= 2:
                nivel_riesgo = 'Medio'
                probs_dict = {'Alto': 0.2, 'Medio': 0.6, 'Bajo': 0.2}
            else:
                nivel_riesgo = 'Bajo'
                probs_dict = {'Alto': 0.05, 'Medio': 0.2, 'Bajo': 0.75}
        
        # Generar recomendaciones
        recomendaciones = self._generar_recomendaciones_riesgo(
            nivel_riesgo, margen_bruto, ratio_endeudamiento, roi, liquidez
        )
        
        return {
            'nivel_riesgo': nivel_riesgo,
            'probabilidades': probs_dict,
            'color': {'Bajo': 'green', 'Medio': 'yellow', 'Alto': 'red'}[nivel_riesgo],
            'indicadores': {
                'margen_bruto': round(margen_bruto, 4),
                'ratio_endeudamiento': round(ratio_endeudamiento, 4),
                'roi': round(roi, 4),
                'liquidez': round(liquidez, 4)
            },
            'recomendaciones': recomendaciones,
            'modelo_usado': 'XGBoost' if self.modelos_cargados else 'Heurístico'
        }
    
    def _generar_recomendaciones_riesgo(
        self, nivel: str, margen: float, endeudamiento: float, roi: float, liquidez: float
    ) -> List[str]:
        """Genera recomendaciones basadas en indicadores de riesgo."""
        recomendaciones = []
        
        if endeudamiento > 0.6:
            recomendaciones.append("⚠️ Reducir el nivel de endeudamiento para mejorar la solvencia")
        
        if margen < 0.15:
            recomendaciones.append("📈 Mejorar el margen bruto optimizando costos o precios")
        
        if liquidez < 1.5:
            recomendaciones.append("💧 Aumentar la liquidez para mayor flexibilidad financiera")
        
        if roi < 0.08:
            recomendaciones.append("🎯 Mejorar el retorno sobre activos optimizando la operación")
        
        if nivel == 'Bajo':
            recomendaciones.append("✅ Mantener las buenas prácticas financieras actuales")
        
        return recomendaciones if recomendaciones else ["✅ Los indicadores están en rangos saludables"]


class SimulacionMonteCarlo:
    """
    Clase para realizar simulaciones Monte Carlo en análisis financiero.
    """
    
    def __init__(self, n_simulaciones: int = 10000, seed: int = 42):
        self.n_simulaciones = n_simulaciones
        np.random.seed(seed)
    
    def simular_van(
        self,
        inversion_inicial: float,
        flujos_base: List[float],
        tasa_descuento_base: float,
        variacion_flujos: float = 0.15,
        variacion_tasa: float = 0.02
    ) -> Dict[str, Any]:
        """
        Simula el VAN con variaciones en flujos de caja y tasa de descuento.
        """
        resultados_van = []
        
        for _ in range(self.n_simulaciones):
            # Simular flujos con distribución normal
            flujos_simulados = [
                max(0, np.random.normal(flujo, flujo * variacion_flujos))
                for flujo in flujos_base
            ]
            
            # Simular tasa de descuento
            tasa_simulada = max(0.01, np.random.normal(tasa_descuento_base, variacion_tasa))
            
            # Calcular VAN
            van = -inversion_inicial
            for t, flujo in enumerate(flujos_simulados, start=1):
                van += flujo / ((1 + tasa_simulada) ** t)
            
            resultados_van.append(van)
        
        resultados_van = np.array(resultados_van)
        
        return {
            'van_medio': round(float(np.mean(resultados_van)), 2),
            'van_mediana': round(float(np.median(resultados_van)), 2),
            'desviacion_estandar': round(float(np.std(resultados_van)), 2),
            'van_minimo': round(float(np.min(resultados_van)), 2),
            'van_maximo': round(float(np.max(resultados_van)), 2),
            'percentil_5': round(float(np.percentile(resultados_van, 5)), 2),
            'percentil_95': round(float(np.percentile(resultados_van, 95)), 2),
            'probabilidad_van_positivo': round(float(np.mean(resultados_van > 0)), 4),
            'probabilidad_van_negativo': round(float(np.mean(resultados_van < 0)), 4),
            'var_95': round(float(np.percentile(resultados_van, 5)), 2),
            'cvar_95': round(float(np.mean(resultados_van[resultados_van <= np.percentile(resultados_van, 5)])), 2),
            'n_simulaciones': self.n_simulaciones,
            'histograma_data': {
                'valores': [round(v, 2) for v in np.percentile(resultados_van, np.arange(0, 101, 5)).tolist()],
                'percentiles': list(range(0, 101, 5))
            }
        }
    
    def simular_tir(
        self,
        inversion_inicial: float,
        flujos_base: List[float],
        variacion_flujos: float = 0.15
    ) -> Dict[str, Any]:
        """
        Simula la TIR con variaciones en los flujos de caja.
        """
        from scipy.optimize import newton
        
        resultados_tir = []
        
        for _ in range(self.n_simulaciones):
            flujos_simulados = [
                max(0, np.random.normal(flujo, flujo * variacion_flujos))
                for flujo in flujos_base
            ]
            
            def van_funcion(tasa):
                van = -inversion_inicial
                for t, flujo in enumerate(flujos_simulados, start=1):
                    van += flujo / ((1 + tasa) ** t)
                return van
            
            try:
                tir = newton(van_funcion, x0=0.1, maxiter=50)
                if -0.5 < tir < 2.0:  # TIR realista
                    resultados_tir.append(tir)
            except:
                continue
        
        if not resultados_tir:
            return {'error': 'No se pudo calcular la TIR en las simulaciones'}
        
        resultados_tir = np.array(resultados_tir)
        
        return {
            'tir_media': round(float(np.mean(resultados_tir)) * 100, 2),
            'tir_mediana': round(float(np.median(resultados_tir)) * 100, 2),
            'desviacion_estandar': round(float(np.std(resultados_tir)) * 100, 2),
            'tir_minima': round(float(np.min(resultados_tir)) * 100, 2),
            'tir_maxima': round(float(np.max(resultados_tir)) * 100, 2),
            'percentil_5': round(float(np.percentile(resultados_tir, 5)) * 100, 2),
            'percentil_95': round(float(np.percentile(resultados_tir, 95)) * 100, 2),
            'simulaciones_exitosas': len(resultados_tir)
        }


class AnalisisSensibilidad:
    """
    Clase para realizar análisis de sensibilidad en proyectos financieros.
    """
    
    @staticmethod
    def calcular_van(inversion: float, flujos: List[float], tasa: float) -> float:
        """Calcula el VAN de un proyecto."""
        van = -inversion
        for t, flujo in enumerate(flujos, start=1):
            van += flujo / ((1 + tasa) ** t)
        return van
    
    def analisis_tornado(
        self,
        inversion_inicial: float,
        flujos_base: List[float],
        tasa_base: float,
        variacion: float = 0.20
    ) -> Dict[str, Any]:
        """
        Análisis de tornado para comparar sensibilidad de múltiples variables.
        """
        van_base = self.calcular_van(inversion_inicial, flujos_base, tasa_base)
        
        resultados_tornado = []
        
        # Análisis para inversión
        van_inv_bajo = self.calcular_van(inversion_inicial * (1 - variacion), flujos_base, tasa_base)
        van_inv_alto = self.calcular_van(inversion_inicial * (1 + variacion), flujos_base, tasa_base)
        resultados_tornado.append({
            'variable': 'Inversión Inicial',
            'van_bajo': round(van_inv_alto, 2),
            'van_alto': round(van_inv_bajo, 2),
            'rango': round(abs(van_inv_alto - van_inv_bajo), 2)
        })
        
        # Análisis para flujos
        van_flujos_bajo = self.calcular_van(inversion_inicial, [f * (1 - variacion) for f in flujos_base], tasa_base)
        van_flujos_alto = self.calcular_van(inversion_inicial, [f * (1 + variacion) for f in flujos_base], tasa_base)
        resultados_tornado.append({
            'variable': 'Flujos de Caja',
            'van_bajo': round(van_flujos_bajo, 2),
            'van_alto': round(van_flujos_alto, 2),
            'rango': round(abs(van_flujos_alto - van_flujos_bajo), 2)
        })
        
        # Análisis para tasa
        van_tasa_bajo = self.calcular_van(inversion_inicial, flujos_base, tasa_base * (1 - variacion))
        van_tasa_alto = self.calcular_van(inversion_inicial, flujos_base, tasa_base * (1 + variacion))
        resultados_tornado.append({
            'variable': 'Tasa de Descuento',
            'van_bajo': round(van_tasa_alto, 2),
            'van_alto': round(van_tasa_bajo, 2),
            'rango': round(abs(van_tasa_alto - van_tasa_bajo), 2)
        })
        
        # Ordenar por impacto
        resultados_tornado.sort(key=lambda x: x['rango'], reverse=True)
        
        return {
            'van_base': round(van_base, 2),
            'variacion_aplicada': variacion,
            'resultados': resultados_tornado,
            'variable_mas_sensible': resultados_tornado[0]['variable']
        }
    
    def analisis_escenarios(
        self,
        inversion_inicial: float,
        flujos_base: List[float],
        tasa_base: float,
        escenarios_config: Optional[Dict[str, Dict]] = None
    ) -> Dict[str, Any]:
        """
        Análisis de escenarios: pesimista, base, optimista.
        """
        if escenarios_config is None:
            escenarios_config = {
                'pesimista': {'flujos_mult': 0.75, 'tasa_mult': 1.25},
                'base': {'flujos_mult': 1.0, 'tasa_mult': 1.0},
                'optimista': {'flujos_mult': 1.25, 'tasa_mult': 0.85}
            }
        
        resultados = {}
        
        for nombre, config in escenarios_config.items():
            flujos_esc = [f * config['flujos_mult'] for f in flujos_base]
            tasa_esc = tasa_base * config['tasa_mult']
            van = self.calcular_van(inversion_inicial, flujos_esc, tasa_esc)
            
            resultados[nombre] = {
                'van': round(van, 2),
                'flujos': [round(f, 2) for f in flujos_esc],
                'tasa': round(tasa_esc, 4),
                'decision': 'ACEPTAR' if van > 0 else 'RECHAZAR'
            }
        
        # Generar recomendación
        van_pesimista = resultados['pesimista']['van']
        van_base = resultados['base']['van']
        van_optimista = resultados['optimista']['van']
        
        if van_pesimista > 0:
            recomendacion = "PROYECTO ROBUSTO: Rentable incluso en escenario pesimista"
        elif van_base > 0 and van_pesimista < 0:
            recomendacion = "PROYECTO CON RIESGO MODERADO: Rentable en escenario base pero no en pesimista"
        elif van_optimista > 0 and van_base < 0:
            recomendacion = "PROYECTO ARRIESGADO: Solo rentable en escenario optimista"
        else:
            recomendacion = "PROYECTO NO RECOMENDADO: No rentable en ningún escenario"
        
        return {
            'escenarios': resultados,
            'rango_van': round(resultados['optimista']['van'] - resultados['pesimista']['van'], 2),
            'recomendacion': recomendacion
        }
    
    def punto_equilibrio(
        self,
        inversion_inicial: float,
        flujos_base: List[float],
        tasa_base: float,
        variable: str = 'flujos'
    ) -> Dict[str, Any]:
        """
        Calcula el punto de equilibrio (VAN = 0) para una variable.
        """
        from scipy.optimize import brentq
        
        van_base = self.calcular_van(inversion_inicial, flujos_base, tasa_base)
        
        if variable == 'flujos':
            def objetivo(mult):
                flujos_mod = [f * mult for f in flujos_base]
                return self.calcular_van(inversion_inicial, flujos_mod, tasa_base)
            
            try:
                multiplicador = brentq(objetivo, 0.1, 3.0)
                variacion_necesaria = (multiplicador - 1) * 100
                return {
                    'variable': 'Flujos de Caja',
                    'multiplicador_equilibrio': round(multiplicador, 4),
                    'variacion_necesaria_pct': round(variacion_necesaria, 2),
                    'interpretacion': f"Los flujos pueden reducirse hasta {-variacion_necesaria:.1f}% antes de que el VAN sea negativo" if variacion_necesaria < 0 else f"Los flujos deben aumentar {variacion_necesaria:.1f}% para que el VAN sea positivo"
                }
            except:
                return {'error': 'No se encontró punto de equilibrio en el rango analizado'}
        
        elif variable == 'tasa':
            def objetivo(tasa):
                return self.calcular_van(inversion_inicial, flujos_base, tasa)
            
            try:
                tasa_equilibrio = brentq(objetivo, 0.001, 1.0)
                return {
                    'variable': 'Tasa de Descuento',
                    'tasa_equilibrio': round(tasa_equilibrio, 4),
                    'tasa_equilibrio_pct': round(tasa_equilibrio * 100, 2),
                    'margen_seguridad': round((tasa_equilibrio - tasa_base) * 100, 2),
                    'interpretacion': f"La TIR del proyecto es {tasa_equilibrio*100:.2f}%, con un margen de {(tasa_equilibrio - tasa_base)*100:.2f}% sobre la tasa de descuento"
                }
            except:
                return {'error': 'No se encontró punto de equilibrio en el rango analizado'}
        
        return {'error': f'Variable no reconocida: {variable}'}


# Instancia global del servicio (singleton)
_servicio_ml = None

def obtener_servicio_ml() -> ServicioML:
    """Obtiene la instancia del servicio ML (patrón singleton)."""
    global _servicio_ml
    if _servicio_ml is None:
        _servicio_ml = ServicioML()
    return _servicio_ml
