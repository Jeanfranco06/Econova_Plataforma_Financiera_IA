"""
Servicio de Simulación de Préstamos
Autor: Sistema Econova

Funcionalidades:
- Cálculo de cuota mensual
- Tabla de amortización completa
- Análisis de costo total
- TED (Tasa Efectiva de Deuda)
- Análisis de sensibilidad
"""

import numpy as np
from typing import Dict, List, Any
from app.utils.validadores import validar_numero_positivo, validar_tasa


class ServicioPrestamo:
    """Servicio para cálculos de préstamos y créditos"""

    @staticmethod
    def validar_parametros_prestamo(monto: float, tasa_anual: float, plazo_meses: int):
        """Valida parámetros del préstamo"""
        if monto <= 0:
            raise ValueError("El monto debe ser mayor a 0")
        if tasa_anual < 0:
            raise ValueError("La tasa anual no puede ser negativa")
        if plazo_meses <= 0:
            raise ValueError("El plazo debe ser mayor a 0")
        if plazo_meses > 600:
            raise ValueError("El plazo no puede exceder 50 años")

    @staticmethod
    def calcular_cuota_mensual(
        monto: float, tasa_anual: float, plazo_meses: int
    ) -> float:
        """
        Calcula la cuota mensual usando fórmula de anualidad ordinaria
        Fórmula: Cuota = P × [r(1+r)^n] / [(1+r)^n - 1]

        Args:
            monto: Monto del préstamo
            tasa_anual: Tasa anual en porcentaje (ej: 12.5)
            plazo_meses: Plazo en meses

        Returns:
            Cuota mensual
        """
        tasa_mensual = (tasa_anual / 100) / 12

        if tasa_mensual == 0:
            return monto / plazo_meses

        numerador = tasa_mensual * ((1 + tasa_mensual) ** plazo_meses)
        denominador = ((1 + tasa_mensual) ** plazo_meses) - 1
        cuota = monto * (numerador / denominador)

        return cuota

    @staticmethod
    def calcular_tabla_amortizacion(
        monto: float, tasa_anual: float, plazo_meses: int
    ) -> List[Dict[str, Any]]:
        """
        Genera la tabla de amortización completa

        Args:
            monto: Monto del préstamo
            tasa_anual: Tasa anual en porcentaje
            plazo_meses: Plazo en meses

        Returns:
            Lista con desglose por cuota
        """
        ServicioPrestamo.validar_parametros_prestamo(monto, tasa_anual, plazo_meses)

        tasa_mensual = (tasa_anual / 100) / 12
        cuota = ServicioPrestamo.calcular_cuota_mensual(monto, tasa_anual, plazo_meses)

        tabla = []
        saldo = monto
        interes_total = 0
        capital_total = 0

        for mes in range(1, plazo_meses + 1):
            # Calcular interés sobre saldo actual
            interes = saldo * tasa_mensual

            # Calcular capital (cuota - interés)
            capital = cuota - interes

            # Actualizar saldo
            saldo -= capital

            # Evitar números negativos por redondeo
            if saldo < 0:
                saldo = 0
                capital = cuota - interes

            interes_total += interes
            capital_total += capital

            tabla.append(
                {
                    "mes": mes,
                    "cuota": round(cuota, 2),
                    "capital": round(capital, 2),
                    "interes": round(interes, 2),
                    "saldo_restante": round(max(0, saldo), 2),
                }
            )

        return tabla

    @staticmethod
    def calcular_ted(monto: float, tasa_anual: float, plazo_meses: int) -> float:
        """
        Calcula la TED (Tasa Efectiva de Deuda)
        Considera comisiones y gastos asociados al préstamo

        Para este cálculo simplificado, la TED ≈ TEA (Tasa Efectiva Anual)
        TEA = (1 + tasa_mensual)^12 - 1
        """
        tasa_mensual = (tasa_anual / 100) / 12
        tea = ((1 + tasa_mensual) ** 12 - 1) * 100
        return round(tea, 2)

    @staticmethod
    def calcular_prestamo_completo(
        monto: float,
        tasa_anual: float,
        plazo_meses: int,
        tasa_impuesto: float = 0,
        comision_inicial: float = 0,
    ) -> Dict[str, Any]:
        """
        Realiza análisis completo del préstamo

        Args:
            monto: Monto del préstamo
            tasa_anual: Tasa anual en porcentaje
            plazo_meses: Plazo en meses
            tasa_impuesto: Tasa de impuesto aplicable (%)
            comision_inicial: Comisión inicial (porcentaje del monto)

        Returns:
            Dict con análisis completo
        """
        ServicioPrestamo.validar_parametros_prestamo(monto, tasa_anual, plazo_meses)

        # Validar comisión
        if comision_inicial < 0 or comision_inicial > 100:
            raise ValueError("La comisión debe estar entre 0 y 100%")

        # Validar tasa de impuesto
        if tasa_impuesto < 0 or tasa_impuesto > 100:
            raise ValueError("La tasa de impuesto debe estar entre 0 y 100%")

        cuota_mensual = ServicioPrestamo.calcular_cuota_mensual(
            monto, tasa_anual, plazo_meses
        )
        tabla_amortizacion = ServicioPrestamo.calcular_tabla_amortizacion(
            monto, tasa_anual, plazo_meses
        )
        ted = ServicioPrestamo.calcular_ted(monto, tasa_anual, plazo_meses)

        # Calcular costos
        costo_comision = monto * (comision_inicial / 100)
        costo_total_cuotas = cuota_mensual * plazo_meses
        costo_interes = costo_total_cuotas - monto
        impuestos = costo_interes * (tasa_impuesto / 100)
        costo_total = costo_total_cuotas + costo_comision + impuestos

        # Monto neto desembolsado
        monto_neto = monto - costo_comision

        return {
            "resumen": {
                "monto_solicitado": round(monto, 2),
                "monto_neto_desembolsado": round(monto_neto, 2),
                "tasa_anual": round(tasa_anual, 2),
                "tasa_mensual": round((tasa_anual / 100) / 12 * 100, 4),
                "plazo_meses": plazo_meses,
                "plazo_anos": round(plazo_meses / 12, 1),
                "cuota_mensual": round(cuota_mensual, 2),
                "ted_tasa_efectiva": ted,
            },
            "costos": {
                "comision_inicial": round(costo_comision, 2),
                "costo_interes": round(costo_interes, 2),
                "impuestos": round(impuestos, 2),
                "costo_total_desembolsado": round(costo_total, 2),
                "costo_promedio_mensual": round(costo_total / plazo_meses, 2),
            },
            "indicadores": {
                "costo_interes_porcentaje": round((costo_interes / monto) * 100, 2),
                "interes_por_cuota_promedio": round(costo_interes / plazo_meses, 2),
                "razon_interes_principal": round(costo_interes / monto, 2),
            },
            "tabla_amortizacion": tabla_amortizacion,
        }

    @staticmethod
    def analizar_sensibilidad_prestamo(
        monto: float, tasa_anual: float, plazo_meses: int, variacion_tasa: float = 0.5
    ) -> Dict[str, Any]:
        """
        Analiza sensibilidad del préstamo ante cambios en tasa

        Args:
            monto: Monto del préstamo
            tasa_anual: Tasa anual en porcentaje
            plazo_meses: Plazo en meses
            variacion_tasa: Variación en puntos porcentuales a analizar

        Returns:
            Dict con análisis de sensibilidad
        """
        ServicioPrestamo.validar_parametros_prestamo(monto, tasa_anual, plazo_meses)

        cuota_base = ServicioPrestamo.calcular_cuota_mensual(
            monto, tasa_anual, plazo_meses
        )

        escenarios = []
        tasas_analiticas = [
            tasa_anual - variacion_tasa * 2,
            tasa_anual - variacion_tasa,
            tasa_anual,
            tasa_anual + variacion_tasa,
            tasa_anual + variacion_tasa * 2,
        ]

        for tasa in tasas_analiticas:
            if tasa < 0:
                continue

            try:
                cuota = ServicioPrestamo.calcular_cuota_mensual(
                    monto, tasa, plazo_meses
                )
                costo_total = cuota * plazo_meses
                variacion_cuota = ((cuota - cuota_base) / cuota_base) * 100

                escenarios.append(
                    {
                        "tasa": round(tasa, 2),
                        "cuota_mensual": round(cuota, 2),
                        "costo_total": round(costo_total, 2),
                        "variacion_cuota_porcentaje": round(variacion_cuota, 2),
                        "escenario": "Base"
                        if tasa == tasa_anual
                        else ("Pesimista" if tasa > tasa_anual else "Optimista"),
                    }
                )
            except:
                continue

        return {
            "tasa_actual": round(tasa_anual, 2),
            "cuota_actual": round(cuota_base, 2),
            "escenarios": escenarios,
            "impacto_maximo_alza": round(
                (
                    max(
                        [
                            e["variacion_cuota_porcentaje"]
                            for e in escenarios
                            if e["tasa"] > tasa_anual
                        ],
                        default=0,
                    )
                ),
                2,
            ),
            "impacto_maximo_baja": round(
                (
                    min(
                        [
                            e["variacion_cuota_porcentaje"]
                            for e in escenarios
                            if e["tasa"] < tasa_anual
                        ],
                        default=0,
                    )
                ),
                2,
            ),
        }

    @staticmethod
    def comparar_plazos(
        monto: float, tasa_anual: float, plazos: List[int]
    ) -> Dict[str, Any]:
        """
        Compara cuota y costo total para diferentes plazos

        Args:
            monto: Monto del préstamo
            tasa_anual: Tasa anual
            plazos: Lista de plazos a comparar (en meses)

        Returns:
            Dict con comparativa de plazos
        """
        comparativa = []

        for plazo in plazos:
            try:
                cuota = ServicioPrestamo.calcular_cuota_mensual(
                    monto, tasa_anual, plazo
                )
                costo_total = cuota * plazo
                costo_interes = costo_total - monto

                comparativa.append(
                    {
                        "plazo_meses": plazo,
                        "plazo_anos": round(plazo / 12, 1),
                        "cuota_mensual": round(cuota, 2),
                        "costo_interes": round(costo_interes, 2),
                        "costo_total": round(costo_total, 2),
                        "ahorro_vs_menor_plazo": round(costo_interes, 2)
                        if plazo == plazos[0]
                        else "N/A",
                    }
                )
            except:
                continue

        return {"monto": monto, "tasa": tasa_anual, "comparativa_plazos": comparativa}
