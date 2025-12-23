/**
 * Mensajes contextuales minimalistas para chatbot Econova
 * Maneja contextos de análisis financiero con preguntas seleccionables
 */

(function() {
  console.log('🚀 Inicializando mensajes contextuales...');

  // Función para procesar contexto
  function processContext() {
    // Obtener parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const context = urlParams.get('context');
    const data = urlParams.get('data');

    console.log('📋 Contexto detectado:', context);
    console.log('📊 Datos detectados:', data);

    if (context) {
      // Esperar a que el chatbot esté completamente inicializado
      const waitForChatbot = () => {
        const chatMessages = document.getElementById('chat-messages');
        const sendButton = document.getElementById('send-button');

        console.log('🔍 Verificando elementos del DOM:');
        console.log('- chat-messages:', !!chatMessages);
        console.log('- send-button:', !!sendButton);

        if (chatMessages && sendButton) {
          console.log('✅ Chatbot completamente inicializado, agregando mensaje contextual');

          // Verificar que no haya mensajes contextuales existentes para evitar duplicados
          // Buscar tanto mensajes con clase contextual-message como mensajes que contengan "Has completado tu análisis"
          const existingContextualMessages = chatMessages.querySelectorAll('.message-container .contextual-message');
          const existingVANMessages = chatMessages.querySelectorAll('.message-container');
          let hasVANMessage = false;

          for (let msg of existingVANMessages) {
            const textContent = msg.textContent || '';
            if (textContent.includes('Has completado tu análisis') || textContent.includes('VAN calculado')) {
              hasVANMessage = true;
              break;
            }
          }

          console.log('📊 Mensajes contextuales existentes:', existingContextualMessages.length);
          console.log('📊 Mensajes VAN existentes:', hasVANMessage ? 1 : 0);

          if (existingContextualMessages.length === 0 && !hasVANMessage) {
            console.log('📝 No hay mensajes contextuales existentes, agregando mensaje contextual');
            // Agregar mensaje contextual después de un pequeño delay para que aparezca después del mensaje de bienvenida
            setTimeout(() => {
              addContextualMessage(context, data);
            }, 500);
          } else {
            console.log('📝 Ya hay mensajes contextuales en el chat, limpiando y re-agregando');
            // Limpiar mensajes contextuales existentes antes de agregar uno nuevo
            existingContextualMessages.forEach(msg => msg.closest('.message-container').remove());
            // También limpiar mensajes VAN existentes
            const allMessages = chatMessages.querySelectorAll('.message-container');
            allMessages.forEach(msg => {
              const textContent = msg.textContent || '';
              if (textContent.includes('Has completado tu análisis') || textContent.includes('VAN calculado')) {
                msg.remove();
              }
            });
            // Agregar mensaje contextual después de un pequeño delay
            setTimeout(() => {
              addContextualMessage(context, data);
            }, 500);
          }
        } else {
          console.log('⏳ Esperando a que el chatbot esté completamente listo...');
          setTimeout(waitForChatbot, 500); // Aumentar el intervalo de espera
        }
      };

      // Iniciar la espera inmediatamente
      waitForChatbot();
    } else {
      console.log('❌ No se detectó contexto en la URL');
    }
  }

  // Esperar a que el DOM esté completamente cargado antes de procesar el contexto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('📄 DOM cargado, procesando contexto...');
      setTimeout(processContext, 1000); // Esperar 1 segundo adicional después de DOMContentLoaded
    });
  } else {
    console.log('📄 DOM ya cargado, procesando contexto...');
    setTimeout(processContext, 1000); // Esperar 1 segundo
  }

  // También procesar si hay cambios en la URL (por si acaso)
  window.addEventListener('popstate', processContext);

  console.log('🏁 Mensajes contextuales inicializados');
})();

function addContextualMessage(context, data) {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) {
    console.log('❌ Elemento chat-messages no encontrado');
    return;
  }

  let messageContent = '';
  let suggestedQuestions = [];

  // Procesar diferentes tipos de contexto
  if (context.startsWith('ml_') || ['predicciones', 'montecarlo', 'tornado', 'escenarios'].includes(context)) {
    // Contextos de Machine Learning
    let mlType = context;
    if (context.startsWith('ml_')) {
      mlType = context.replace('ml_', '');
    }

    // Intentar obtener datos del contexto o de la URL
    let contextData = {};
    const urlParams = new URLSearchParams(window.location.search);

    // Debug: mostrar todos los parámetros de la URL
    console.log('🔍 Parámetros de URL para ML:', Object.fromEntries(urlParams.entries()));

    if (data) {
      try {
        // Intentar decodeURIComponent primero, si falla usar data directamente
        let decodedData;
        try {
          decodedData = decodeURIComponent(data);
        } catch (uriError) {
          console.log('⚠️ decodeURIComponent falló, usando data directamente:', uriError);
          decodedData = data;
        }

        contextData = JSON.parse(decodedData);
        console.log('✅ Datos ML parseados desde JSON:', contextData);

        // Mapear los campos del JSON a la estructura esperada
        if (contextData.resultados) {
          const resultados = contextData.resultados;

          // PRESERVAR datos importantes antes del mapeo
          const recomendacionOriginal = resultados.recomendacion || contextData.recomendacion;
          const escenariosOriginales = {
            pesimista: resultados.pesimista,
            base: resultados.base,
            optimista: resultados.optimista
          };

          // Convertir valores formateados a números
          let variableMasSensible = null;
          let impactoMaximo = null;

          // Para tornado, encontrar la variable más crítica (con mayor rango)
          if (resultados.variables && Array.isArray(resultados.variables)) {
            let maxRango = 0;
            resultados.variables.forEach(variable => {
              const rangoValue = parseFloat(variable.rango.replace(/[^\d.-]/g, ''));
              if (rangoValue > maxRango) {
                maxRango = rangoValue;
                variableMasSensible = variable.nombre;
              }
            });
            // Calcular impacto máximo como el rango de la variable más crítica
            impactoMaximo = maxRango;
          }

          // Buscar impacto máximo si existe
          if (resultados.impacto_maximo) {
            impactoMaximo = parseFloat(resultados.impacto_maximo.replace('%', ''));
          }

          contextData.resultados = {
            van_medio: resultados.van_medio ? parseFloat(resultados.van_medio.replace(/[^\d.-]/g, '')) : null,
            probabilidad_van_positivo: resultados.probabilidad_exito ? parseFloat(resultados.probabilidad_exito.replace('%', '')) / 100 : null,
            desviacion: resultados.desviacion ? parseFloat(resultados.desviacion.replace(/[^\d.-]/g, '')) : null,
            variable_mas_sensible: resultados.var_95 || variableMasSensible || null,
            impacto_maximo: impactoMaximo,
            recomendacion: recomendacionOriginal || null,
            // Mantener otros campos si existen - usar nombres correctos del JSON
            ingresos_predichos: resultados.ingresos_predichos ? parseFloat(resultados.ingresos_predichos.replace(/[^\d.-]/g, '')) : null,
            crecimiento_porcentaje: resultados.crecimiento ? parseFloat(resultados.crecimiento.replace('%', '')) : null,
            nivel_riesgo: resultados.riesgo || null,
            // Mantener el array de variables para tornado
            variables: resultados.variables || null,
            // PRESERVAR los valores originales de escenarios
            escenarios_originales: escenariosOriginales
          };
        }

        console.log('🔄 Datos ML mapeados:', contextData);

      } catch (e) {
        console.log('❌ Error parsing ML context data JSON:', e);
        // Si falla el parseo JSON, intentar obtener parámetros individuales de la URL
        contextData = {
          parametros: {
            inversion_inicial: urlParams.get('inversion_inicial') ? parseFloat(urlParams.get('inversion_inicial')) : null,
            tasa_descuento: urlParams.get('tasa_descuento') ? parseFloat(urlParams.get('tasa_descuento')) : null,
            horizonte: urlParams.get('horizonte') ? parseInt(urlParams.get('horizonte')) : null
          },
          resultados: {
            ingresos_predichos: urlParams.get('ingresos_predichos') ? parseFloat(urlParams.get('ingresos_predichos')) : null,
            crecimiento_porcentaje: urlParams.get('crecimiento_porcentaje') ? parseFloat(urlParams.get('crecimiento_porcentaje')) : null,
            nivel_riesgo: urlParams.get('nivel_riesgo') || null,
            van_medio: urlParams.get('van_medio') ? parseFloat(urlParams.get('van_medio')) : null,
            probabilidad_van_positivo: urlParams.get('probabilidad_van_positivo') ? parseFloat(urlParams.get('probabilidad_van_positivo')) : null,
            variable_mas_sensible: urlParams.get('variable_mas_sensible') || null,
            recomendacion: urlParams.get('recomendacion') || null
          }
        };
        console.log('📊 Datos ML obtenidos desde parámetros URL:', contextData);
      }
    } else {
      // Si no hay data JSON, intentar obtener parámetros individuales de la URL
      contextData = {
        parametros: {
          inversion_inicial: urlParams.get('inversion_inicial') ? parseFloat(urlParams.get('inversion_inicial')) : null,
          tasa_descuento: urlParams.get('tasa_descuento') ? parseFloat(urlParams.get('tasa_descuento')) : null,
          horizonte: urlParams.get('horizonte') ? parseInt(urlParams.get('horizonte')) : null
        },
        resultados: {
          ingresos_predichos: urlParams.get('ingresos_predichos') ? parseFloat(urlParams.get('ingresos_predichos')) : null,
          crecimiento_porcentaje: urlParams.get('crecimiento_porcentaje') ? parseFloat(urlParams.get('crecimiento_porcentaje')) : null,
          nivel_riesgo: urlParams.get('nivel_riesgo') || null,
          van_medio: urlParams.get('van_medio') ? parseFloat(urlParams.get('van_medio')) : null,
          probabilidad_van_positivo: urlParams.get('probabilidad_van_positivo') ? parseFloat(urlParams.get('probabilidad_van_positivo')) : null,
          variable_mas_sensible: urlParams.get('variable_mas_sensible') || null,
          recomendacion: urlParams.get('recomendacion') || null
        }
      };
      console.log('📊 Datos ML obtenidos desde parámetros URL (sin JSON):', contextData);
    }

    messageContent = getMLContextMessage(mlType, contextData);
    suggestedQuestions = contextData.preguntas_sugeridas || getDefaultMLQuestions(mlType);

    // Almacenar contexto para que esté disponible en mensajes posteriores
    const mlAnalysisContext = {
      tipo_analisis: mlType,
      resultados: contextData.resultados || {},
      descripcion: contextData.descripcion || getMLAnalysisDescription(mlType)
    };

    // Almacenar en window para acceso global
    window.currentAnalysisContext = mlAnalysisContext;
    console.log('📊 Contexto ML almacenado para mensajes posteriores:', mlAnalysisContext);

  } else if (context === 'van') {
    // Contexto VAN tradicional
    // Intentar obtener datos del contexto o de la URL
    let contextData = {};
    if (data) {
      try {
        contextData = JSON.parse(decodeURIComponent(data));
      } catch (e) {
        console.log('Error parsing VAN context data:', e);
        // Si falla el parseo JSON, intentar obtener parámetros individuales
        const urlParams = new URLSearchParams(window.location.search);
        contextData = {
          resultados: {
            van: urlParams.get('van') ? parseFloat(urlParams.get('van')) : null,
            tir: urlParams.get('tir') ? parseFloat(urlParams.get('tir')) : null,
            payback: urlParams.get('payback') || null
          }
        };
      }
    } else {
      // Si no hay data JSON, intentar obtener parámetros individuales de la URL
      const urlParams = new URLSearchParams(window.location.search);
      contextData = {
        resultados: {
          van: urlParams.get('van') ? parseFloat(urlParams.get('van')) : null,
          tir: urlParams.get('tir') ? parseFloat(urlParams.get('tir')) : null,
          payback: urlParams.get('payback') || null
        }
      };
    }

    messageContent = getVANContextMessage(contextData);
    suggestedQuestions = [
      '¿Cómo interpretar este VAN?',
      '¿Es rentable el proyecto?',
      '¿Qué factores afectan el VAN?'
    ];

    // Almacenar contexto para que esté disponible en mensajes posteriores
    const vanAnalysisContext = {
      tipo_analisis: 'van',
      resultados: contextData.resultados || {},
      descripcion: 'Análisis de Valor Actual Neto (VAN)'
    };

    // Almacenar en window para acceso global
    window.currentAnalysisContext = vanAnalysisContext;
    console.log('📊 Contexto VAN almacenado para mensajes posteriores:', vanAnalysisContext);
  } else if (context === 'tir') {
    // Contexto TIR
    const urlParams = new URLSearchParams(window.location.search);
    const tir = urlParams.get('tir') ? parseFloat(urlParams.get('tir')) : null;
    const van = urlParams.get('van') ? parseFloat(urlParams.get('van')) : null;

    // Crear contexto de datos para que el chatbot pueda usar estos valores
    const tirContextData = {
      tipo_analisis: 'tir',
      resultados: {
        tir: tir,
        van: van
      }
    };

    messageContent = `¡Excelente! Has completado tu cálculo de TIR. `;
    if (tir !== null) {
      messageContent += `Tu Tasa Interna de Retorno calculada es del ${tir.toFixed(2)}%`;
      if (van !== null) {
        messageContent += ` con un VAN de S/ ${van.toLocaleString('es-PE')}`;
      }
      messageContent += '. ';
    }
    messageContent += '¿Te gustaría que te explique qué significa esta TIR y cómo interpretarla?';

    suggestedQuestions = [
      '¿Qué significa esta TIR?',
      '¿Es buena esta tasa de retorno?',
      '¿Cómo se compara con otras inversiones?',
      '¿Qué factores afectan la TIR?'
    ];

    // Almacenar contexto para que esté disponible en mensajes posteriores
    window.currentAnalysisContext = tirContextData;
    console.log('📊 Contexto TIR almacenado para mensajes posteriores:', tirContextData);

    // Pasar el contexto de datos al chatbot
    if (window.chatbotMain && window.chatbotMain.setAnalysisContext) {
      window.chatbotMain.setAnalysisContext(tirContextData);
    }
  } else if (context === 'wacc') {
    // Contexto WACC
    const urlParams = new URLSearchParams(window.location.search);
    const wacc = urlParams.get('wacc') ? parseFloat(urlParams.get('wacc')) : null;
    const costo_equity = urlParams.get('costo_equity') ? parseFloat(urlParams.get('costo_equity')) : null;
    const costo_deuda = urlParams.get('costo_deuda') ? parseFloat(urlParams.get('costo_deuda')) : null;

    console.log('🔍 WACC - Valores obtenidos de URL:', { wacc, costo_equity, costo_deuda });

    // Crear contexto de datos para que el chatbot pueda usar estos valores
    const waccContextData = {
      tipo_analisis: 'wacc',
      resultados: {
        wacc: wacc,
        costo_equity: costo_equity,
        costo_deuda: costo_deuda
      }
    };

    messageContent = `¡Perfecto! Has calculado tu Costo Promedio Ponderado de Capital (WACC). `;
    if (wacc !== null) {
      messageContent += `Tu WACC es del ${wacc.toFixed(2)}%`;
      if (costo_equity !== null && costo_deuda !== null) {
        messageContent += ` (costo de equity: ${costo_equity.toFixed(2)}%, costo de deuda: ${costo_deuda.toFixed(2)}%)`;
      }
      messageContent += '. ';
    }
    messageContent += '¿Te gustaría que te ayude a interpretar este costo de capital para tus decisiones de inversión?';

    suggestedQuestions = [
      '¿Qué significa este WACC?',
      '¿Cómo usar este costo en mis evaluaciones?',
      '¿Es alto o bajo este costo?',
      '¿Cómo afecta mis decisiones de inversión?'
    ];

    // Pasar el contexto de datos al chatbot
    console.log('🔄 Pasando contexto WACC al chatbot:', waccContextData);
    if (window.chatbotMain && window.chatbotMain.setAnalysisContext) {
      window.chatbotMain.setAnalysisContext(waccContextData);
      console.log('✅ Contexto WACC pasado exitosamente');
    } else {
      console.log('❌ Función setAnalysisContext no disponible');
    }

    // También almacenar en window para acceso global
    window.currentAnalysisContext = waccContextData;
  } else if (context === 'portafolio' || context === 'portfolio') {
    // Contexto de análisis de portafolio
    const urlParams = new URLSearchParams(window.location.search);
    const rendimiento = urlParams.get('rendimiento') ? parseFloat(urlParams.get('rendimiento')) : null;
    const riesgo = urlParams.get('riesgo') ? parseFloat(urlParams.get('riesgo')) : null;
    const sharpe = urlParams.get('sharpe') ? parseFloat(urlParams.get('sharpe')) : null;

    // Crear contexto de datos para que el chatbot pueda usar estos valores
    const portfolioContextData = {
      tipo_analisis: 'portafolio',
      resultados: {
        rendimiento: rendimiento,
        riesgo: riesgo,
        sharpe: sharpe
      }
    };

    messageContent = `¡Excelente! Has completado tu análisis de portafolio. `;
    if (rendimiento !== null || riesgo !== null || sharpe !== null) {
      messageContent += 'Tus resultados son: ';
      if (rendimiento !== null) messageContent += `rendimiento esperado del ${rendimiento.toFixed(2)}%`;
      if (riesgo !== null) messageContent += `, volatilidad del ${riesgo.toFixed(2)}%`;
      if (sharpe !== null) messageContent += ` y ratio Sharpe de ${sharpe.toFixed(2)}`;
      messageContent += '. ';
    }
    messageContent += '¿Te gustaría que te ayude a interpretar estos resultados o tienes alguna pregunta específica sobre tu inversión?';

    suggestedQuestions = [
      '¿Cómo está diversificado mi portafolio?',
      '¿Cuál es el riesgo de mi portafolio?',
      '¿Qué recomendaciones tienes para optimizarlo?',
      '¿Cómo ha performado mi portafolio?'
    ];

    // Almacenar contexto para que esté disponible en mensajes posteriores
    window.currentAnalysisContext = portfolioContextData;
    console.log('📊 Contexto portafolio almacenado para mensajes posteriores:', portfolioContextData);

    // Pasar el contexto de datos al chatbot
    if (window.chatbotMain && window.chatbotMain.setAnalysisContext) {
      window.chatbotMain.setAnalysisContext(portfolioContextData);
    }
  } else {
    // Contexto genérico
    messageContent = 'Hola, veo que vienes de un análisis financiero. ¿En qué puedo ayudarte?';
    suggestedQuestions = [
      '¿Qué significa este resultado?',
      '¿Cómo mejorar el análisis?',
      '¿Qué recomendaciones tienes?'
    ];
  }

  // Para mensajes contextuales, usar directamente createContextualMessage para evitar
  // que el chatbot los interprete como entradas del usuario
  const messageDiv = createContextualMessage(messageContent, suggestedQuestions);
  chatMessages.appendChild(messageDiv);

  // Force layout recalculation and smooth scroll
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  console.log('✅ Mensaje contextual agregado');
}

function createContextualMessage(content, questions) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-container message-bot';

  const timestamp = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Procesar preguntas sugeridas como enlaces clickeables
  let finalContent = content;

  // Check if the message already contains suggested questions
  const hasSuggestions = /preguntas sugeridas/i.test(content) ||
    content.includes('¿Puedes explicarme mejor?') ||
    content.includes('¿Tienes un ejemplo práctico?') ||
    content.includes('¿Cuáles son las limitaciones?') ||
    content.includes('¿Cómo se aplica esto en Perú?');

  if (!hasSuggestions && questions && questions.length > 0) {
    // Crear HTML para preguntas sugeridas clickeables
    const suggestionsHTML = '\n\n**Preguntas sugeridas:**\n' +
      questions.map(q => `<button class="suggestion-link" onclick="selectQuestion('${q.replace(/'/g, "\\'").replace(/"/g, '\\"')}')" style="background: none; border: none; color: #3b82f6; text-decoration: underline; cursor: pointer; padding: 0; margin: 2px 0; display: block;">${q}</button>`).join('\n');
    finalContent = content + suggestionsHTML;
  }

  // Crear mensaje con la misma estructura que addAdvancedMessage
  const uniqueId = 'chatbotAvatar_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  messageDiv.innerHTML = `
  <div style="display: flex; justify-content: flex-start; width: 100%; margin-bottom: 8px;">
    <div style="display: flex; align-items: flex-start; max-width: 70%; gap: 8px;">
      <div class="chatbot-avatar" style="width: 48px; height: 48px; flex-shrink: 0;">
        <div class="chatbot-avatar-circle"></div>
        <div class="avatar-container" style="width: 48px; height: 48px;">
          <canvas id="${uniqueId}" width="48" height: 48" style="border-radius: 50%;"></canvas>
        </div>
      </div>
      <div style="background: white; color: #212529; padding: 12px 16px; border-radius: 16px; border-bottom-left-radius: 4px; border: 1px solid #e9ecef; max-width: 100%; word-wrap: break-word;">
        <div class="whitespace-pre-line">${window.chatbotUtils ? window.chatbotUtils.renderMarkdown(finalContent) : finalContent}</div>
        <div style="font-size: 10px; opacity: 0.7; margin-top: 4px; text-align: left;">${timestamp}</div>
      </div>
    </div>
  </div>
  `;

  // Iniciar animación del avatar
  setTimeout(() => {
    const canvas = document.getElementById(uniqueId);
    if (canvas && window.animateAvatarCanvas) {
      window.animateAvatarCanvas(canvas);
    }
  }, 50);

  return messageDiv;
}

function getMLContextMessage(type, data) {
    const descriptions = {
        'prediccion': 'predicciones con IA',
        'montecarlo': 'simulación Monte Carlo',
        'tornado': 'un análisis de sensibilidad tornado',
        'escenarios': 'un análisis de escenarios'
    };

    const description = descriptions[type] || 'análisis ML';

    // Crear mensaje conversacional directo con más detalles
    let contextMessage = `¡Excelente! Acabas de completar ${description}. `;

    // Agregar parámetros de la simulación si están disponibles
    if (data.parametros) {
        const params = data.parametros;
        if (params.inversion_inicial) {
            contextMessage += `Con una inversión inicial de S/ ${params.inversion_inicial.toLocaleString('es-PE')}`;
        }
        if (params.tasa_descuento) {
            contextMessage += ` y tasa de descuento del ${params.tasa_descuento}%`;
        }
        if (params.flujos_caja && params.flujos_caja.length > 0) {
            contextMessage += `, considerando ${params.flujos_caja.length} años de proyección`;
        }
        contextMessage += '. ';
    }

    // Agregar resultados específicos de manera natural
    if (type === 'prediccion' && data.resultados) {
        console.log('🔍 Datos de predicción disponibles:', data.resultados);
        const ingresos = data.resultados.ingresos_predichos;
        const crecimiento = data.resultados.crecimiento_porcentaje;
        const riesgo = data.resultados.nivel_riesgo;

        contextMessage += 'Tus resultados de predicción son: ';
        if (ingresos !== null && ingresos !== undefined) {
            contextMessage += `ingresos predichos S/ ${ingresos.toLocaleString('es-PE')}`;
        }
        if (crecimiento !== null && crecimiento !== undefined) {
            contextMessage += ` con crecimiento del ${crecimiento}%`;
        }
        if (riesgo) {
            contextMessage += ` y nivel de riesgo ${riesgo.toLowerCase()}`;
        }
        contextMessage += '. ';
    } else if (type === 'montecarlo' && data.resultados) {
        const vanMedio = data.resultados.van_medio;
        const probExito = data.resultados.probabilidad_van_positivo;
        const desviacion = data.resultados.desviacion;
        const var95 = data.resultados.variable_mas_sensible;

        contextMessage += 'Los resultados de tu simulación Monte Carlo son: ';
        if (vanMedio !== null && vanMedio !== undefined) {
            contextMessage += `VAN medio S/ ${vanMedio.toLocaleString('es-PE')}`;
        }
        if (probExito !== null && probExito !== undefined) {
            contextMessage += ` con ${(probExito * 100).toFixed(1)}% de probabilidad de éxito`;
        }
        if (desviacion !== null && desviacion !== undefined) {
            contextMessage += ` y desviación estándar de S/ ${desviacion.toLocaleString('es-PE')}`;
        }
        if (var95) {
            contextMessage += `. El VaR al 95% es ${var95}`;
        }
        contextMessage += '. ';
    } else if (type === 'tornado' && data.resultados) {
        console.log('🔍 Datos de tornado disponibles:', data.resultados);
        const variableCritica = data.resultados.variable_mas_sensible;
        const impactoMaximo = data.resultados.impacto_maximo;

        if (variableCritica) {
            contextMessage += `El análisis de sensibilidad revela que "${variableCritica}" es la variable más crítica que impacta tus resultados`;
            if (impactoMaximo !== null && impactoMaximo !== undefined) {
                contextMessage += ` con un rango de variación de S/ ${impactoMaximo.toLocaleString('es-PE')}. `;
            } else {
                contextMessage += '. ';
            }
        } else {
            contextMessage += 'El análisis de sensibilidad tornado ha sido completado exitosamente. ';
        }
    } else if (type === 'escenarios' && data.resultados) {
        console.log('🔍 Datos de escenarios disponibles:', data.resultados);
        console.log('🔍 data.recomendacion:', data.recomendacion);
        console.log('🔍 data.resultados.recomendacion:', data.resultados.recomendacion);
        // La recomendación puede estar en diferentes lugares según el JSON
        const recomendacion = data.recomendacion || data.resultados.recomendacion;
        console.log('🔍 recomendacion final:', recomendacion);

        // Mostrar los valores de los escenarios (usando los valores preservados)
        const escenariosOriginales = data.resultados.escenarios_originales || {};
        const pesimista = escenariosOriginales.pesimista;
        const base = escenariosOriginales.base;
        const optimista = escenariosOriginales.optimista;

        if (pesimista || base || optimista) {
            contextMessage += 'Los resultados de tu análisis de escenarios son: ';
            if (pesimista) contextMessage += `escenario pesimista S/ ${parseFloat(pesimista.replace(/[^\d.-]/g, '')).toLocaleString('es-PE')}`;
            if (base) contextMessage += `, escenario base S/ ${parseFloat(base.replace(/[^\d.-]/g, '')).toLocaleString('es-PE')}`;
            if (optimista) contextMessage += ` y escenario optimista S/ ${parseFloat(optimista.replace(/[^\d.-]/g, '')).toLocaleString('es-PE')}`;
            contextMessage += '. ';
        }

        if (recomendacion) {
            contextMessage += `El análisis de escenarios recomienda: ${recomendacion.toLowerCase()}. `;
        } else {
            contextMessage += 'El análisis de escenarios ha sido completado exitosamente. ';
        }
    }

    contextMessage += '¿Te gustaría que te explique estos resultados en más detalle o tienes alguna pregunta específica?';

    return contextMessage;
}

function getDefaultMLQuestions(type) {
  const questions = {
    'prediccion': [
      '¿Cómo mejorar los resultados?',
      '¿Qué factores son más importantes?',
      '¿Cómo reducir riesgos?'
    ],
    'montecarlo': [
      '¿Qué significa la probabilidad?',
      '¿Cómo reducir la volatilidad?',
      '¿Es viable el proyecto?'
    ],
    'tornado': [
      '¿Por qué esta variable es crítica?',
      '¿Cómo mitigar riesgos?',
      '¿Qué variables optimizar?'
    ],
    'escenarios': [
      '¿Cuál escenario recomiendas?',
      '¿Cómo mejorar el peor caso?',
      '¿Qué estrategia seguir?'
    ]
  };

  return questions[type] || [
    '¿Cómo interpretar estos resultados?',
    '¿Qué recomendaciones tienes?',
    '¿Qué debo hacer ahora?'
  ];
}

function getMLAnalysisDescription(type) {
  const descriptions = {
    'prediccion': 'Análisis predictivo de ingresos, crecimiento y riesgo financiero usando Machine Learning',
    'montecarlo': 'Simulación Monte Carlo para análisis de riesgo probabilístico del VAN',
    'tornado': 'Análisis de sensibilidad tornado para identificar variables críticas',
    'escenarios': 'Análisis de escenarios (pesimista, base, optimista) para evaluación de riesgos'
  };

  return descriptions[type] || 'Análisis de Machine Learning';
}

function getVANContextMessage(contextData) {
  let message = `¡Perfecto! Has completado tu análisis de VAN. `;

  // Obtener todos los parámetros de la URL para mostrar información completa
  const urlParams = new URLSearchParams(window.location.search);

  // Agregar información completa del análisis
  const van = urlParams.get('van');
  const tir = urlParams.get('tir');
  const payback = urlParams.get('payback');
  const wacc = urlParams.get('wacc');

  // Construir mensaje con toda la información disponible
  if (van !== null) {
    const vanValue = parseFloat(van);
    message += `Tu VAN calculado es S/ ${vanValue.toLocaleString('es-PE')}`;
  }

  if (tir !== null) {
    const tirValue = parseFloat(tir);
    message += ` y la TIR es del ${tirValue.toFixed(1)}%`;
  }

  if (payback) {
    message += `. ${payback}`;
  }

  if (wacc) {
    const waccValue = parseFloat(wacc);
    message += `. El WACC utilizado fue del ${waccValue.toFixed(1)}%`;
  }

  message += '. ';

  // Agregar contexto adicional si está disponible
  const inversion = urlParams.get('inversion_inicial');
  const tasa = urlParams.get('tasa_descuento');
  const horizonte = urlParams.get('horizonte');

  if (inversion || tasa || horizonte) {
    message += '\n\n**Parámetros del análisis:**\n';
    if (inversion) message += `• Inversión inicial: S/ ${parseFloat(inversion).toLocaleString('es-PE')}\n`;
    if (tasa) message += `• Tasa de descuento: ${parseFloat(tasa).toFixed(1)}%\n`;
    if (horizonte) message += `• Horizonte: ${horizonte} años\n`;
  }

  message += '\n¿Te gustaría que profundice en la interpretación de estos resultados?';

  return message;
}

function handleContextualConciseMode(messageDiv, content, questions) {
  try {
    const main = window.chatbotMain;
    const responseText = String(content || '');
    const lengthThreshold = 200; // Character threshold for truncation
    const isConcise = main ? main.chatPreferences().concise : true;

    console.log('📏 Checking contextual concise mode:', {
      responseLength: responseText.length,
      threshold: lengthThreshold,
      isConcise: isConcise,
      shouldTrigger: isConcise && responseText.length > lengthThreshold
    });

    if (isConcise && responseText.length > lengthThreshold) {
      // Store full text on bubble for later
      messageDiv.setAttribute('data-fulltext', encodeURIComponent(responseText));

      // Create truncated version (first 150 characters + ...)
      const truncatedText = responseText.length > 150
        ? responseText.substring(0, 150) + '...'
        : responseText;

      // Find the content div - use the same selector as normal messages
      const contentDiv = messageDiv.querySelector('div > div[style*="background: white"]') ||
                        messageDiv.querySelector('div > div[style*="background:white"]');

      if (contentDiv && window.chatbotUtils && window.chatbotUtils.renderMarkdown) {
        // Add suggestions to the truncated content
        const defaultSuggestions = [
          '¿Puedes explicarme mejor?',
          '¿Tienes un ejemplo práctico?',
          '¿Cuáles son las limitaciones?',
          '¿Cómo se aplica esto en Perú?'
        ];
        const suggestionsText = '\n\n**Preguntas sugeridas:**\n' +
          defaultSuggestions.map(s => `[${s}]()`).join('\n');
        const truncatedWithSuggestions = truncatedText + suggestionsText;

        contentDiv.innerHTML = window.chatbotUtils.renderMarkdown(truncatedWithSuggestions);

        // Add expand button
        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginTop = '8px';
        buttonContainer.style.textAlign = 'left';
        buttonContainer.innerHTML = `<button type="button" class="expand-btn" onclick="toggleExpand(this)" style="display: inline-block; background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Ver más</button>`;

        // Remove existing button if present
        const existingButton = contentDiv.querySelector('.expand-btn');
        if (existingButton) {
          existingButton.remove();
        }

        contentDiv.appendChild(buttonContainer);

        // Set initial state as collapsed
        messageDiv.setAttribute('data-expanded', 'false');

        console.log('✅ Expand button added to contextual message');
      }
    }
  } catch (e) {
    console.error('Error in contextual concise mode handling:', e);
  }
}

function selectQuestion(question) {
  console.log('Pregunta seleccionada:', question);

  // Encontrar el input del chat
  const chatInput = document.querySelector('input[type="text"], textarea');
  if (chatInput) {
    chatInput.value = question;
    chatInput.focus();

    // Simular envío si hay un botón
    const sendButton = document.querySelector('button[type="submit"], button:has(.fa-paper-plane)');
    if (sendButton) {
      setTimeout(() => sendButton.click(), 100);
    }
  }
}

// Función global para acceso desde otros scripts
window.addContextualMessage = addContextualMessage;
window.selectQuestion = selectQuestion;

// Función para obtener el contexto de análisis actual
window.getCurrentAnalysisContext = function() {
  return window.currentAnalysisContext || null;
};

// Función para establecer contexto de análisis (para compatibilidad futura)
window.setAnalysisContext = function(context) {
  window.currentAnalysisContext = context;
  console.log('📊 Contexto de análisis establecido:', context);
};

console.log('🏁 Mensajes contextuales inicializados');
