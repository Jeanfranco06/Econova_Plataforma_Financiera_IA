/**
 * API Service - Funciones para consumir endpoints de Econova
 * Maneja todas las llamadas HTTP a la API REST
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

/**
 * Clase para manejar las llamadas a la API
 */
class APIService {
  /**
   * Realizar una petición HTTP genérica
   */
  static async request(method, endpoint, data = null) {
    try {
      mostrarLoading(true);

      const url = `${API_BASE_URL}${endpoint}`;
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const responseData = await response.json();

      mostrarLoading(false);

      if (!response.ok) {
        throw new Error(responseData.error || 'Error en la solicitud');
      }

      return responseData;
    } catch (error) {
      mostrarLoading(false);
      console.error('Error en API:', error);
      mostrarAlerta(error.message, 'danger');
      throw error;
    }
  }

  // ==================== USUARIOS ====================

  /**
   * Obtener información del usuario
   */
  static async obtenerUsuario(usuarioId) {
    return this.request('GET', `/usuarios/${usuarioId}`);
  }

  /**
   * Obtener estadísticas del usuario
   */
  static async obtenerEstadisticas(usuarioId) {
    return this.request('GET', `/usuarios/${usuarioId}/estadisticas`);
  }

  /**
   * Obtener logros del usuario
   */
  static async obtenerLogros(usuarioId) {
    return this.request('GET', `/usuarios/${usuarioId}/logros`);
  }

  /**
   * Crear nuevo usuario
   */
  static async crearUsuario(datos) {
    return this.request('POST', '/usuarios', datos);
  }

  // ==================== VAN ====================

  /**
   * Calcular VAN (Valor Actual Neto)
   * @param {Object} datos - {inversion_inicial, flujos_caja, tasa_descuento, usuario_id, nombre_simulacion}
   */
  static async calcularVAN(datos) {
    return this.request('POST', '/financiero/van', datos);
  }

  // ==================== TIR ====================

  /**
   * Calcular TIR (Tasa Interna de Retorno)
   * @param {Object} datos - {inversion_inicial, flujos_caja, tasa_referencia, usuario_id, nombre_simulacion}
   */
  static async calcularTIR(datos) {
    return this.request('POST', '/financiero/tir', datos);
  }

  // ==================== WACC ====================

  /**
   * Calcular WACC (Costo Promedio Ponderado de Capital)
   * @param {Object} datos - {costo_deuda, costo_patrimonio, tasa_impuestos, proporcion_deuda, usuario_id}
   */
  static async calcularWACC(datos) {
    return this.request('POST', '/financiero/wacc', datos);
  }

  // ==================== PORTAFOLIO ====================

  /**
   * Analizar Portafolio
   * @param {Object} datos - {activos, proporciones, usuario_id}
   */
  static async analizarPortafolio(datos) {
    return this.request('POST', '/financiero/portafolio', datos);
  }

  // ==================== REEMPLAZO ====================

  /**
   * Analizar Reemplazo de Activos
   * @param {Object} datos - {inversion_inicial, valor_salvamento_actual, flujos_nuevo, flujos_actual, tasa_descuento, usuario_id}
   */
  static async analizarReemplazo(datos) {
    return this.request('POST', '/financiero/reemplazo-activo', datos);
  }

  // ==================== PERIOD RECUPERACION ====================

  /**
   * Calcular Periodo de Recuperación
   * @param {Object} datos - {inversion_inicial, flujos_caja, usuario_id}
   */
  static async calcularPeriodoRecuperacion(datos) {
    return this.request('POST', '/financiero/periodo-recuperacion', datos);
  }

  // ==================== SIMULACIONES ====================

  /**
   * Obtener una simulación
   */
  static async obtenerSimulacion(simulacionId) {
    return this.request('GET', `/financiero/simulaciones/${simulacionId}`);
  }

  /**
   * Listar simulaciones del usuario
   */
  static async listarSimulacionesUsuario(usuarioId, tipo = null, limite = 50) {
    let endpoint = `/financiero/simulaciones/usuario/${usuarioId}?limit=${limite}`;
    if (tipo) {
      endpoint += `&tipo=${tipo}`;
    }
    return this.request('GET', endpoint);
  }

  // ==================== CHATBOT ====================

  /**
   * Enviar mensaje al chatbot
   */
  static async enviarMensajeChatbot(mensaje) {
    return this.request('POST', '/chatbot/mensaje', {
      mensaje: mensaje,
      usuario_id: usuarioActual.usuario_id
    });
  }
}

/**
 * Utilidades para formateo de datos
 */
class FormatoUtil {
  /**
   * Formatear número como moneda
   */
  static formatoMoneda(valor, moneda = 'USD') {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: moneda
    }).format(valor);
  }

  /**
   * Formatear número con decimales
   */
  static formatoNumero(valor, decimales = 2) {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    }).format(valor);
  }

  /**
   * Formatear porcentaje
   */
  static formatoPorcentaje(valor, decimales = 2) {
    return (valor * 100).toFixed(decimales) + '%';
  }

  /**
   * Formatear fecha
   */
  static formatoFecha(fecha) {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(fecha));
  }
}

/**
 * Validadores de entrada
 */
class Validador {
  /**
   * Validar que sea un número positivo
   */
  static esNumeroPositivo(valor) {
    const num = parseFloat(valor);
    return !isNaN(num) && num > 0;
  }

  /**
   * Validar que sea un número
   */
  static esNumero(valor) {
    return !isNaN(parseFloat(valor)) && isFinite(valor);
  }

  /**
   * Validar array de números
   */
  static esArrayNumeros(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    return arr.every(item => Validador.esNumero(item));
  }

  /**
   * Validar email
   */
  static esEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validar que no esté vacío
   */
  static noEstaVacio(valor) {
    return valor && valor.trim().length > 0;
  }
}

/**
 * Gráficos con Plotly
 */
class GraficoUtil {
  /**
   * Crear gráfico de líneas
   */
  static crearGraficoLineas(elementId, xData, yData, titulo, labelY = 'Valor') {
    const trace = {
      x: xData,
      y: yData,
      type: 'scatter',
      mode: 'lines+markers',
      name: labelY,
      line: {
        color: '#2563eb',
        width: 2
      },
      marker: {
        size: 6
      }
    };

    const layout = {
      title: titulo,
      xaxis: { title: 'Período' },
      yaxis: { title: labelY },
      hovermode: 'x unified',
      margin: { t: 40, b: 40, l: 60, r: 40 }
    };

    Plotly.newPlot(elementId, [trace], layout, { responsive: true });
  }

  /**
   * Crear gráfico de barras
   */
  static crearGraficoBarras(elementId, xData, yData, titulo, labelY = 'Valor') {
    const trace = {
      x: xData,
      y: yData,
      type: 'bar',
      marker: { color: '#2563eb' }
    };

    const layout = {
      title: titulo,
      xaxis: { title: 'Categoría' },
      yaxis: { title: labelY },
      margin: { t: 40, b: 40, l: 60, r: 40 }
    };

    Plotly.newPlot(elementId, [trace], layout, { responsive: true });
  }

  /**
   * Crear gráfico de pastel
   */
  static crearGraficoPastel(elementId, labels, valores, titulo) {
    const trace = {
      labels: labels,
      values: valores,
      type: 'pie',
      marker: { colors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'] }
    };

    const layout = {
      title: titulo,
      margin: { t: 40, b: 40, l: 40, r: 40 }
    };

    Plotly.newPlot(elementId, [trace], layout, { responsive: true });
  }

  /**
   * Crear gráfico de comparación
   */
  static crearGraficoComparacion(elementId, categorias, series, titulo) {
    const traces = series.map((serie, index) => ({
      x: categorias,
      y: serie.datos,
      name: serie.nombre,
      type: 'bar'
    }));

    const layout = {
      title: titulo,
      barmode: 'group',
      xaxis: { title: 'Categoría' },
      yaxis: { title: 'Valor' },
      margin: { t: 40, b: 40, l: 60, r: 40 }
    };

    Plotly.newPlot(elementId, traces, layout, { responsive: true });
  }
}
