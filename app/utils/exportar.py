import pandas as pd
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os
from app.config import Config
from app.modelos.usuario import Usuario
from app.modelos.simulacion import Simulacion, Resultado
from app.modelos.logro import Ranking
from app.modelos.benchmarking import BenchmarkingService

class GoogleSheetsExporter:
    def __init__(self):
        self.creds = None
        self.service = None  # type: googleapiclient.discovery.Resource
        self._authenticate()

    def _authenticate(self):
        """Autenticar con Google Sheets API"""
        try:
            if Config.GOOGLE_SHEETS_CREDENTIALS_PATH and os.path.exists(Config.GOOGLE_SHEETS_CREDENTIALS_PATH):
                self.creds = service_account.Credentials.from_service_account_file(
                    Config.GOOGLE_SHEETS_CREDENTIALS_PATH,
                    scopes=['https://www.googleapis.com/auth/spreadsheets']
                )
                self.service = build('sheets', 'v4', credentials=self.creds)
                return True
            else:
                print("Credenciales de Google Sheets no configuradas")
                return False
        except Exception as e:
            print(f"Error autenticando con Google Sheets: {e}")
            return False

    def exportar_resultados_usuario(self, usuario_id, spreadsheet_id=None):
        """Exportar resultados de simulaciones de un usuario a Google Sheets"""
        if not self.service:
            return False

        try:
            # Obtener datos del usuario
            usuario = Usuario.obtener_usuario_por_id(usuario_id)
            if not usuario:
                return False

            # Obtener simulaciones del usuario
            simulaciones = Simulacion.obtener_simulaciones_usuario(usuario_id, limite=100)

            if not simulaciones:
                return False

            # Preparar datos para exportar
            data = []
            for sim in simulaciones:
                resultados = Resultado.obtener_resultados_simulacion(sim.simulacion_id)
                for resultado in resultados:
                    data.append({
                        'Fecha': sim.fecha.strftime('%Y-%m-%d %H:%M:%S') if sim.fecha else '',
                        'Tipo Simulación': sim.tipo_simulacion,
                        'Indicador': resultado.indicador,
                        'Valor': resultado.valor
                    })

            if not data:
                return False

            # Crear DataFrame
            df = pd.DataFrame(data)

            # Usar spreadsheet ID de config si no se proporciona
            if not spreadsheet_id:
                spreadsheet_id = Config.GOOGLE_SHEETS_SPREADSHEET_ID

            if not spreadsheet_id:
                print("Spreadsheet ID no configurado")
                return False

            # Crear nueva hoja con nombre del usuario
            sheet_name = f"Resultados_{usuario.nombre_usuario}"

            # Convertir DataFrame a formato de Google Sheets
            values = [df.columns.tolist()] + df.values.tolist()

            # Crear la hoja si no existe
            self._crear_hoja_si_no_existe(spreadsheet_id, sheet_name)

            # Limpiar la hoja existente
            range_name = f"{sheet_name}!A:Z"
            self.service.spreadsheets().values().clear(  # type: ignore
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()

            # Escribir los datos
            body = {
                'values': values
            }

            result = self.service.spreadsheets().values().update(  # type: ignore
                spreadsheetId=spreadsheet_id,
                range=f"{sheet_name}!A1",
                valueInputOption='RAW',
                body=body
            ).execute()

            return result.get('updatedRange') is not None

        except HttpError as e:
            print(f"Error de Google Sheets API: {e}")
            return False
        except Exception as e:
            print(f"Error exportando resultados: {e}")
            return False

    def exportar_ranking_sector(self, sector, spreadsheet_id=None, limite=50):
        """Exportar ranking de un sector a Google Sheets"""
        if not self.service:
            return False

        try:
            # Obtener ranking del sector
            rankings = Ranking.obtener_ranking_sector(sector, limite)

            if not rankings:
                return False

            # Preparar datos
            data = []
            for item in rankings:
                ranking = item['ranking']
                usuario = item['usuario']
                data.append({
                    'Posición': len(data) + 1,
                    'Usuario': usuario['nombre_usuario'],
                    'Nombre': f"{usuario['nombres']} {usuario['apellidos']}",
                    'Puntaje': ranking['puntaje'],
                    'Fecha': ranking['fecha'].strftime('%Y-%m-%d %H:%M:%S') if ranking['fecha'] else ''
                })

            df = pd.DataFrame(data)

            # Usar spreadsheet ID de config si no se proporciona
            if not spreadsheet_id:
                spreadsheet_id = Config.GOOGLE_SHEETS_SPREADSHEET_ID

            if not spreadsheet_id:
                print("Spreadsheet ID no configurado")
                return False

            sheet_name = f"Ranking_{sector}"

            # Crear nueva hoja si no existe
            self._crear_hoja_si_no_existe(spreadsheet_id, sheet_name)

            # Limpiar y escribir datos
            values = [df.columns.tolist()] + df.values.tolist()

            range_name = f"{sheet_name}!A:Z"
            self.service.spreadsheets().values().clear(  # type: ignore
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()

            body = {
                'values': values
            }

            result = self.service.spreadsheets().values().update(  # type: ignore
                spreadsheetId=spreadsheet_id,
                range=f"{sheet_name}!A1",
                valueInputOption='RAW',
                body=body
            ).execute()

            return result.get('updatedRange') is not None

        except HttpError as e:
            print(f"Error de Google Sheets API: {e}")
            return False
        except Exception as e:
            print(f"Error exportando ranking: {e}")
            return False

    def exportar_benchmarking_grupo(self, benchmarking_id, indicador, spreadsheet_id=None):
        """Exportar análisis de benchmarking de un grupo"""
        if not self.service:
            return False

        try:
            # Obtener estadísticas del grupo
            stats = BenchmarkingService.obtener_estadisticas_grupo(benchmarking_id, indicador)

            if not stats:
                return False

            # Preparar datos de resumen
            resumen_data = {
                'Indicador': [indicador],
                'Total Usuarios': [stats['total_usuarios']],
                'Promedio': [stats['promedio']],
                'Mínimo': [stats['minimo']],
                'Máximo': [stats['maximo']],
                'Desviación Estándar': [stats['desviacion_estandar']]
            }

            df_resumen = pd.DataFrame(resumen_data)

            # Usar spreadsheet ID de config si no se proporciona
            if not spreadsheet_id:
                spreadsheet_id = Config.GOOGLE_SHEETS_SPREADSHEET_ID

            if not spreadsheet_id:
                print("Spreadsheet ID no configurado")
                return False

            sheet_name = f"Benchmarking_{indicador}"

            # Crear nueva hoja si no existe
            self._crear_hoja_si_no_existe(spreadsheet_id, sheet_name)

            # Escribir resumen
            values_resumen = [df_resumen.columns.tolist()] + df_resumen.values.tolist()

            body_resumen = {
                'values': values_resumen
            }

            self.service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=f"{sheet_name}!A1",
                valueInputOption='RAW',
                body=body_resumen
            ).execute()

            return True

        except HttpError as e:
            print(f"Error de Google Sheets API: {e}")
            return False
        except Exception as e:
            print(f"Error exportando benchmarking: {e}")
            return False

    def _crear_hoja_si_no_existe(self, spreadsheet_id, sheet_name):
        """Crear una hoja si no existe"""
        try:
            # Obtener información del spreadsheet
            spreadsheet = self.service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()  # type: ignore
            sheets = spreadsheet.get('sheets', [])

            # Verificar si la hoja ya existe
            sheet_exists = any(sheet.get('properties', {}).get('title') == sheet_name for sheet in sheets)

            if not sheet_exists:
                # Crear nueva hoja
                requests = [{
                    'addSheet': {
                        'properties': {
                            'title': sheet_name
                        }
                    }
                }]

                body = {
                    'requests': requests
                }

                self.service.spreadsheets().batchUpdate(  # type: ignore
                    spreadsheetId=spreadsheet_id,
                    body=body
                ).execute()

        except HttpError as e:
            print(f"Error creando hoja: {e}")
        except Exception as e:
            print(f"Error verificando/creando hoja: {e}")


class ExcelExporter:
    @staticmethod
    def exportar_resultados_usuario_excel(usuario_id, ruta_archivo=None):
        """Exportar resultados de usuario a Excel"""
        try:
            # Obtener datos del usuario
            usuario = Usuario.obtener_usuario_por_id(usuario_id)
            if not usuario:
                return False

            # Obtener simulaciones
            simulaciones = Simulacion.obtener_simulaciones_usuario(usuario_id, limite=100)

            if not simulaciones:
                return False

            # Preparar datos
            data = []
            for sim in simulaciones:
                resultados = Resultado.obtener_resultados_simulacion(sim.simulacion_id)
                for resultado in resultados:
                    data.append({
                        'Fecha': sim.fecha,
                        'Tipo Simulación': sim.tipo_simulacion,
                        'Indicador': resultado.indicador,
                        'Valor': resultado.valor
                    })

            df = pd.DataFrame(data)

            # Ruta por defecto
            if not ruta_archivo:
                ruta_archivo = f"resultados_{usuario.nombre_usuario}.xlsx"

            # Exportar a Excel
            df.to_excel(ruta_archivo, index=False, engine='openpyxl')

            return True

        except Exception as e:
            print(f"Error exportando a Excel: {e}")
            return False

    @staticmethod
    def exportar_ranking_excel(sector, ruta_archivo=None, limite=50):
        """Exportar ranking a Excel"""
        try:
            rankings = Ranking.obtener_ranking_sector(sector, limite)

            if not rankings:
                return False

            data = []
            for item in rankings:
                ranking = item['ranking']
                usuario = item['usuario']
                data.append({
                    'Posición': len(data) + 1,
                    'Usuario': usuario['nombre_usuario'],
                    'Nombre': f"{usuario['nombres']} {usuario['apellidos']}",
                    'Puntaje': ranking['puntaje'],
                    'Fecha': ranking['fecha']
                })

            df = pd.DataFrame(data)

            if not ruta_archivo:
                ruta_archivo = f"ranking_{sector}.xlsx"

            df.to_excel(ruta_archivo, index=False, engine='openpyxl')

            return True

        except Exception as e:
            print(f"Error exportando ranking a Excel: {e}")
            return False
