/**
 * Chatbot Messaging Module - Handles message sending, receiving, and display
 * Handles advanced messaging with context processing and ML analysis
 */

(function () {
  'use strict';

  console.log('💬 Initializing Chatbot Messaging Module...');

  try {
    console.log('📝 Messaging module starting execution...');

    // Message sending functionality
    function sendMessage(elements) {
      const message = elements.chatInput.value.trim();
      if (!message) return;

      // Add user message
      addAdvancedMessage(message, 'user');
      elements.chatInput.value = '';

      // Update stats
      if (window.chatbotUtils && window.chatbotUtils.updateLiveStats) {
        window.chatbotUtils.updateLiveStats();
      }

      // Show typing indicator
      if (window.chatbotUtils && window.chatbotUtils.showTypingIndicator) {
        window.chatbotUtils.showTypingIndicator(elements);
      }

      // Prepare request (include concise preference)
      const main = window.chatbotMain;
      const requestData = {
        message: message,
        concise: main ? main.chatPreferences().concise : true
      };

      // Add analysis context if available (from simulations)
      let analysisContext = window.getCurrentAnalysisContext();

      // Check if we have stored analysis context from previous messages
      console.log('🔍 Checking for stored analysis context...');
      console.log('📊 window.storedAnalysisContext:', window.storedAnalysisContext);
      console.log('📊 current analysisContext:', analysisContext);

      if (!analysisContext && window.storedAnalysisContext) {
        analysisContext = window.storedAnalysisContext;
        console.log('✅ Using stored analysis context:', analysisContext);
      } else if (!analysisContext) {
        console.log('❌ No analysis context available');
      }

      // If no analysis context from window or storage, try to extract from URL parameters (legacy support)
      if (!analysisContext) {
        const urlParams = new URLSearchParams(window.location.search);
        const contextType = urlParams.get('context');
        const dataParam = urlParams.get('data');
        const contextoParam = urlParams.get('contexto');

        // Check for calculator consultation context first
        console.log('🔍 Checking contextoParam:', contextoParam);
        if (contextoParam) {
          try {
            console.log('🔄 Decoding contextoParam...');
            const decodedParam = decodeURIComponent(contextoParam);
            console.log('📄 Decoded contextoParam:', decodedParam.substring(0, 200) + '...');

            console.log('🔄 Parsing JSON...');
            const contextoData = JSON.parse(decodedParam);
            console.log('📊 Parsed contextoData:', contextoData);

            if (contextoData.tipo_simulacion && contextoData.datos_simulacion) {
              analysisContext = {
                tipo_analisis: contextoData.tipo_simulacion,
                resultados: contextoData.datos_simulacion
              };
              // Store for future messages
              window.storedAnalysisContext = analysisContext;
              console.log('✅ Calculator consultation context extracted and stored:', analysisContext);
            } else {
              console.log('❌ contextoData missing required fields');
            }
          } catch (e) {
            console.error('❌ Error parsing calculator context:', e);
            console.error('❌ contextoParam was:', contextoParam);
          }
        } else {
          console.log('❌ No contextoParam found in URL');
        }

        // Fallback to legacy context extraction
        if (!analysisContext && contextType) {
          // Handle ML contexts with JSON data parameter
          if (contextType.startsWith('ml_') && dataParam) {
            try {
              const decodedData = decodeURIComponent(dataParam);
              const contextData = JSON.parse(decodedData);

              // Extract ML type from context (ml_prediccion -> prediccion)
              const mlType = contextType.replace('ml_', '');

              // Map the data to the expected format
              if (contextData.resultados) {
                const resultados = contextData.resultados;

                // Convert formatted values to numbers
                let mappedResultados = {};

                // Helper function to extract numbers from formatted strings
                const extractNumber = (str) => {
                  if (typeof str !== 'string') return str;
                  // Remove currency symbols, commas, and percentage signs, then parse
                  const cleaned = str.replace(/[S$\/\s,]/g, '').replace('%', '');
                  const num = parseFloat(cleaned);
                  return isNaN(num) ? str : num; // Return original string if not a valid number
                };

                // Map all possible ML result fields
                Object.keys(resultados).forEach(key => {
                  const value = resultados[key];
                  if (key === 'ingresos_predichos' || key === 'van_medio' || key === 'desviacion') {
                    mappedResultados[key] = extractNumber(value);
                  } else if (key === 'crecimiento') {
                    mappedResultados.crecimiento_porcentaje = extractNumber(value);
                  } else if (key === 'probabilidad_exito') {
                    const num = extractNumber(value);
                    mappedResultados.probabilidad_van_positivo = typeof num === 'number' ? num / 100 : num;
                  } else if (key === 'riesgo') {
                    mappedResultados.nivel_riesgo = value;
                  } else if (key === 'variable_mas_sensible' || key === 'recomendacion') {
                    mappedResultados[key] = value;
                  } else if (key === 'variables' && Array.isArray(value)) {
                    // Handle tornado variables array
                    mappedResultados.variables = value.map(v => ({
                      nombre: v.nombre || v.variable,
                      rango: extractNumber(v.rango)
                    }));
                  } else if (key === 'pesimista' || key === 'base' || key === 'optimista') {
                    // Handle scenario results
                    mappedResultados[key] = extractNumber(value);
                  } else {
                    // Keep other fields as-is
                    mappedResultados[key] = value;
                  }
                });

                analysisContext = {
                  tipo_analisis: mlType,
                  resultados: mappedResultados,
                  descripcion: contextData.descripcion || `Análisis de ${mlType}`
                };

                console.log('📊 ML context extracted from URL data parameter:', analysisContext);
              }
            } catch (e) {
              console.error('❌ Error parsing ML context data from URL:', e);
            }
          }
          // Extract traditional parameters based on context type
          else if (contextType === 'van') {
            const van = urlParams.get('van') ? parseFloat(urlParams.get('van')) : null;
            const tir = urlParams.get('tir') ? parseFloat(urlParams.get('tir')) : null;
            const payback = urlParams.get('payback') || null;

            if (van !== null || tir !== null) {
              analysisContext = {
                tipo_analisis: 'van',
                resultados: {
                  van: van,
                  tir: tir,
                  payback: payback
                }
              };
            }
          } else if (contextType === 'tir') {
            const tir = urlParams.get('tir') ? parseFloat(urlParams.get('tir')) : null;
            const van = urlParams.get('van') ? parseFloat(urlParams.get('van')) : null;

            if (tir !== null) {
              analysisContext = {
                tipo_analisis: 'tir',
                resultados: {
                  tir: tir,
                  van: van
                }
              };
            }
          } else if (contextType === 'wacc') {
            const wacc = urlParams.get('wacc') ? parseFloat(urlParams.get('wacc')) : null;
            const costo_equity = urlParams.get('costo_equity') ? parseFloat(urlParams.get('costo_equity')) : null;
            const costo_deuda = urlParams.get('costo_deuda') ? parseFloat(urlParams.get('costo_deuda')) : null;

            if (wacc !== null) {
              analysisContext = {
                tipo_analisis: 'wacc',
                resultados: {
                  wacc: wacc,
                  costo_equity: costo_equity,
                  costo_deuda: costo_deuda
                }
              };
            }
          } else if (contextType === 'portafolio' || contextType === 'portfolio') {
            const rendimiento = urlParams.get('rendimiento') ? parseFloat(urlParams.get('rendimiento')) : null;
            const riesgo = urlParams.get('riesgo') ? parseFloat(urlParams.get('riesgo')) : null;
            const sharpe = urlParams.get('sharpe') ? parseFloat(urlParams.get('sharpe')) : null;

            if (rendimiento !== null || riesgo !== null) {
              analysisContext = {
                tipo_analisis: 'portafolio',
                resultados: {
                  rendimiento: rendimiento,
                  riesgo: riesgo,
                  sharpe: sharpe
                }
              };
            }
          }
        }
      }

      if (analysisContext) {
        requestData.analysis_context = analysisContext;
        console.log('📊 Including analysis context in request:', analysisContext);
      }

      // Add simulation context if available (legacy)
      if (main && main.simulationContext()) {
        requestData.context = main.simulationContext();
      }

      // Send to backend
      console.log('📤 Sending request to backend:', requestData);
      fetch('/api/v1/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })
        .then(response => {
          console.log('📥 Response received:', response.status, response.statusText);
          return response.json();
        })
        .then(data => {
          console.log('📦 Response data:', data);
          if (window.chatbotUtils && window.chatbotUtils.hideTypingIndicator) {
            window.chatbotUtils.hideTypingIndicator(elements);
          }

          if (data.success && data.response) {
            console.log('🤖 Adding bot message:', data.response.substring(0, 100) + '...');
            addAdvancedMessage(data.response, 'bot');

            // Handle concise mode with automatic summary
            console.log('🔄 Calling handleConciseModeResponse');
            handleConciseModeResponse(data.response, elements);
          } else {
            console.log('❌ Response not successful or no response data');
            addAdvancedMessage('Lo siento, hubo un error. Inténtalo de nuevo.', 'bot');
          }
        })
        .catch(error => {
          console.log('❌ Fetch error:', error);
          if (window.chatbotUtils && window.chatbotUtils.hideTypingIndicator) {
            window.chatbotUtils.hideTypingIndicator(elements);
          }
          addAdvancedMessage('Error de conexión. Verifica tu internet.', 'bot');
          console.error('Message send error:', error);
        })
        .finally(() => {
          // Ensure input remains enabled and functional after any response
          if (elements.chatInput) {
            elements.chatInput.disabled = false;
            elements.chatInput.focus();
            elements.chatInput.style.opacity = '1';
          }
          if (elements.sendButton) {
            elements.sendButton.disabled = false;
            elements.sendButton.style.opacity = '1';
          }
        });
    }

    // Handle concise mode response - now shows complete responses
    function handleConciseModeResponse(response, elements) {
      try {
        console.log('📏 Concise mode disabled - showing complete responses');

        // The concise mode logic has been disabled to show complete responses
        // All messages will now be displayed in full without truncation

        // Find the last message bubble just added
        const chatMessagesEl = document.getElementById('chat-messages');
        const lastBubble = chatMessagesEl ? chatMessagesEl.lastElementChild : null;

        if (lastBubble) {
          // Find the content div
          const contentDiv = lastBubble.querySelector('div > div[style*="background: white"]') ||
                            lastBubble.querySelector('div > div[style*="background:white"]') ||
                            lastBubble.querySelector('.message-bot div div');

          if (contentDiv && window.chatbotUtils && window.chatbotUtils.renderMarkdown) {
            // Render the complete response with markdown support
            contentDiv.innerHTML = window.chatbotUtils.renderMarkdown(response);

            console.log('✅ Complete response rendered with markdown support');
          }
        }
      } catch (e) {
        console.error('Error in concise mode handling:', e);
      }
    }

    // Add message to chat
    function addAdvancedMessage(data, sender) {
      const chatMessages = document.getElementById('chat-messages');
      if (!chatMessages) return;

      const messageDiv = document.createElement('div');
      messageDiv.className = `message-container fade-in ${sender === 'user' ? 'message-user' : 'message-bot'}`;

      const timestamp = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      if (sender === 'user') {
        // User message - force right alignment
        // Check if user has profile picture
        let avatarHTML = '';
        if (window.currentUser && window.currentUser.foto_perfil) {
          avatarHTML = `
            <div class="user-avatar" style="width: 48px; height: 48px; flex-shrink: 0;">
              <div class="user-avatar-circle"></div>
              <img src="${window.currentUser.foto_perfil}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" alt="Avatar">
            </div>
          `;
        } else {
          avatarHTML = `
            <div class="user-avatar" style="width: 48px; height: 48px; flex-shrink: 0;">
              <div class="user-avatar-circle"></div>
              <div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; background: #2563eb; color: white;"><i class="fas fa-user"></i></div>
            </div>
          `;
        }

        messageDiv.innerHTML = `
        <div style="display: flex; justify-content: flex-end; width: 100%; margin-bottom: 8px;">
          <div style="display: flex; align-items: flex-start; max-width: 70%; gap: 8px;">
            ${avatarHTML}
            <div style="background: #2563eb; color: white; padding: 12px 16px; border-radius: 16px; border-bottom-right-radius: 4px; max-width: 100%; word-wrap: break-word;">
              <p style="margin: 0; line-height: 1.4;">${data}</p>
              <div style="font-size: 10px; opacity: 0.7; margin-top: 4px; text-align: right;">${timestamp}</div>
            </div>
          </div>
        </div>
      `;
      } else {
        // Bot Message with Clean Design
        let contentHTML = '';

        if (data.type === 'welcome') {
          contentHTML = `
            <div class="font-semibold mb-2">${data.title}</div>
            <div class="whitespace-pre-line">${window.chatbotUtils ? window.chatbotUtils.renderMarkdown(data.content) : data.content}</div>
            <div class="quick-actions">
              ${data.quickActions.map(action => `
                <button class="quick-action-btn" onclick="sendQuickMessage('${action.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}')">${action}</button>
              `).join('')}
            </div>
          `;
        } else if (data.type === 'contextual') {
          // Contextual message with specific suggested questions
          let finalContent = data.content;

          // Check if the message already contains suggested questions
          const hasSuggestions = /preguntas sugeridas/i.test(data.content) ||
            data.content.includes('¿Puedes explicarme mejor?') ||
            data.content.includes('¿Tienes un ejemplo práctico?') ||
            data.content.includes('¿Cuáles son las limitaciones?') ||
            data.content.includes('¿Cómo se aplica esto en Perú?');

          if (!hasSuggestions && data.suggestedQuestions && data.suggestedQuestions.length > 0) {
            const suggestionsText = '\n\n**Preguntas sugeridas:**\n' +
              data.suggestedQuestions.map(q => `[${q}]()`).join('\n');

            finalContent = data.content + suggestionsText;
          }

          contentHTML = `<div class="whitespace-pre-line contextual-message">${window.chatbotUtils ? window.chatbotUtils.renderMarkdown(finalContent) : finalContent}</div>`;
        } else {
          // Regular bot message - use backend-generated questions if available, otherwise add defaults
          let finalContent = data;

          // Check if the message already contains suggested questions from backend
          // Backend generates questions in format: [¿Question 1?|¿Question 2?|¿Question 3?]
          const hasBackendSuggestions = /\[([¿\?][^\[\]]*[|][^\[\]]*(?:[|][^\[\]]*)*)\]/g.test(data);

          if (!hasBackendSuggestions) {
            // Check if message already has any suggested questions (legacy check)
            const hasSuggestions = /preguntas sugeridas/i.test(data) ||
              data.includes('¿Puedes explicarme mejor?') ||
              data.includes('¿Tienes un ejemplo práctico?') ||
              data.includes('¿Cuáles son las limitaciones?') ||
              data.includes('¿Cómo se aplica esto en Perú?');

            if (!hasSuggestions) {
              const defaultSuggestions = [
                '¿Puedes explicarme mejor?',
                '¿Tienes un ejemplo práctico?',
                '¿Cuáles son las limitaciones?',
                '¿Cómo se aplica esto en Perú?'
              ];

              const suggestionsText = '\n\n**Preguntas sugeridas:**\n' +
                defaultSuggestions.map(s => `[${s}]()`).join('\n');

              finalContent = data + suggestionsText;
            }
          }

          contentHTML = `<div class="whitespace-pre-line">${window.chatbotUtils ? window.chatbotUtils.renderMarkdown(finalContent) : finalContent}</div>`;
        }

        // Wrap long messages
        if (window.chatbotUtils && window.chatbotUtils.wrapLongMessageHtml) {
          contentHTML = window.chatbotUtils.wrapLongMessageHtml(contentHTML);
        }

        // Bot message - force left alignment
        const uniqueId = 'chatbotAvatar_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        messageDiv.innerHTML = `
        <div style="display: flex; justify-content: flex-start; width: 100%; margin-bottom: 8px;">
          <div style="display: flex; align-items: flex-start; max-width: 70%; gap: 8px;">
            <div class="chatbot-avatar" style="width: 48px; height: 48px; flex-shrink: 0;">
              <div class="chatbot-avatar-circle"></div>
              <div class="avatar-container" style="width: 48px; height: 48px;">
                <canvas id="${uniqueId}" width="48" height="48" style="border-radius: 50%;"></canvas>
              </div>
            </div>
            <div style="background: white; color: #212529; padding: 12px 16px; border-radius: 16px; border-bottom-left-radius: 4px; border: 1px solid #e9ecef; max-width: 100%; word-wrap: break-word;">
              ${contentHTML}
              <div style="font-size: 10px; opacity: 0.7; margin-top: 4px; text-align: left;">${timestamp}</div>
            </div>
          </div>
        </div>
      `;

        // Start avatar animation
        setTimeout(() => {
          const canvas = document.getElementById(uniqueId);
          if (canvas && window.animateAvatarCanvas) {
            window.animateAvatarCanvas(canvas);
          }
        }, 50);

      }

      // Add message to chat (for both user and bot messages)
      chatMessages.appendChild(messageDiv);

      // Force layout recalculation and smooth scroll
      requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });

      console.log('✅ Message added to chat successfully');

      // Ensure input remains enabled and functional
      const chatInput = document.getElementById('chat-input');
      const sendButton = document.getElementById('send-button');
      if (chatInput) {
        chatInput.disabled = false;
        chatInput.focus();
        chatInput.style.opacity = '1';
      }
      if (sendButton) {
        sendButton.disabled = false;
        sendButton.style.opacity = '1';
      }

      // Global quick message sender
      window.sendQuickMessage = function (message) {
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        const chatMessages = document.getElementById('chat-messages');
        const typingIndicator = document.getElementById('typing-indicator');

        if (chatInput) {
          chatInput.value = message;
          sendMessage({
            chatInput: chatInput,
            sendButton: sendButton,
            chatMessages: chatMessages,
            typingIndicator: typingIndicator
          });
        }
      };

      console.log('🔗 About to expose messaging functions globally...');
      console.log('window before assignment:', window.chatbotMessaging);

      // Expose functions globally
      window.chatbotMessaging = {
        sendMessage,
        addAdvancedMessage,
        handleConciseModeResponse
      };

      console.log('✅ Chatbot Messaging Module loaded and exposed globally');
      console.log('window.chatbotMessaging after assignment:', window.chatbotMessaging);
      console.log('typeof window.chatbotMessaging:', typeof window.chatbotMessaging);
    }

    console.log('🔗 About to expose messaging functions globally...');
    console.log('window before assignment:', window.chatbotMessaging);

    // Expose functions globally
    window.chatbotMessaging = {
      sendMessage,
      addAdvancedMessage,
      handleConciseModeResponse
    };

    console.log('✅ Chatbot Messaging Module loaded and exposed globally');
    console.log('window.chatbotMessaging after assignment:', window.chatbotMessaging);
    console.log('typeof window.chatbotMessaging:', typeof window.chatbotMessaging);

    // Simple expand/collapse function within the message
    window.toggleExpand = function(buttonElement) {
      console.log('🔄 toggleExpand called!');
      console.log('Button element:', buttonElement);

      // Find the message container
      let messageContainer = buttonElement.closest('.message-container');
      console.log('📦 Message container found:', !!messageContainer);

      if (!messageContainer) {
        console.log('🔍 Trying alternative search...');
        let element = buttonElement;
        for (let i = 0; i < 10 && element; i++) {
          element = element.parentElement;
          console.log('Checking element:', element, 'classes:', element.className);
          if (element && element.classList && element.classList.contains('message-container')) {
            messageContainer = element;
            console.log('✅ Found via alternative search');
            break;
          }
        }
      }

      if (!messageContainer) {
        console.error('❌ Message container not found');
        return;
      }

      const fullText = messageContainer.getAttribute('data-fulltext');
      console.log('📄 Full text attribute:', fullText ? 'present' : 'missing');

      if (!fullText) {
        console.error('❌ No data-fulltext attribute found');
        return;
      }

      try {
        // Find the content div
        const contentDiv = messageContainer.querySelector('div > div[style*="background: white"]') ||
                          messageContainer.querySelector('div > div[style*="background:white"]') ||
                          messageContainer.querySelector('.message-bot div div');

        console.log('💬 Content div found:', !!contentDiv);

        if (contentDiv) {
          // Get the timestamp element
          const timestamp = messageContainer.querySelector('.message-time');
          const timestampHTML = timestamp ? timestamp.outerHTML : '';

          // Check if currently expanded
          const isExpanded = messageContainer.getAttribute('data-expanded') === 'true';

          if (isExpanded) {
            // Currently expanded, collapse to truncated version
            console.log('🔽 Collapsing to truncated...');
            const decodedText = decodeURIComponent(fullText);
            const truncatedText = decodedText.length > 150
              ? decodedText.substring(0, 150) + '...'
              : decodedText;

            // Add suggestions back
            const defaultSuggestions = [
              '¿Puedes explicarme mejor?',
              '¿Tienes un ejemplo práctico?',
              '¿Cuáles son las limitaciones?',
              '¿Cómo se aplica esto en Perú?'
            ];
            const suggestionsText = '\n\n**Preguntas sugeridas:**\n' +
              defaultSuggestions.map(s => `[${s}]()`).join('\n');
            const truncatedWithSuggestions = truncatedText + suggestionsText;

            if (window.chatbotUtils && window.chatbotUtils.renderMarkdown) {
              contentDiv.innerHTML = window.chatbotUtils.renderMarkdown(truncatedWithSuggestions);
            } else {
              contentDiv.innerHTML = truncatedWithSuggestions.replace(/\n/g, '<br>');
            }

            // Add expand button back
            const buttonContainer = document.createElement('div');
            buttonContainer.style.marginTop = '8px';
            buttonContainer.style.textAlign = 'left';
            buttonContainer.innerHTML = `<button type="button" class="expand-btn" onclick="toggleExpand(this)" style="display: inline-block; background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Ver más</button>`;
            contentDiv.appendChild(buttonContainer);

            messageContainer.setAttribute('data-expanded', 'false');
            console.log('✅ Collapsed to truncated');
          } else {
            // Currently collapsed, expand to full content
            console.log('🔼 Expanding to full content...');
            const decodedText = decodeURIComponent(fullText);

            // Add suggestions to full content
            const defaultSuggestions = [
              '¿Puedes explicarme mejor?',
              '¿Tienes un ejemplo práctico?',
              '¿Cuáles son las limitaciones?',
              '¿Cómo se aplica esto en Perú?'
            ];
            const suggestionsText = '\n\n**Preguntas sugeridas:**\n' +
              defaultSuggestions.map(s => `[${s}]()`).join('\n');
            const fullWithSuggestions = decodedText + suggestionsText;

            if (window.chatbotUtils && window.chatbotUtils.renderMarkdown) {
              contentDiv.innerHTML = window.chatbotUtils.renderMarkdown(fullWithSuggestions);
            } else {
              contentDiv.innerHTML = fullWithSuggestions.replace(/\n/g, '<br>');
            }

            // Add collapse button
            const buttonContainer = document.createElement('div');
            buttonContainer.style.marginTop = '8px';
            buttonContainer.style.textAlign = 'left';
            buttonContainer.innerHTML = `<button type="button" class="expand-btn" onclick="toggleExpand(this)" style="display: inline-block; background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Ver menos</button>`;
            contentDiv.appendChild(buttonContainer);

            messageContainer.setAttribute('data-expanded', 'true');
            console.log('✅ Expanded to full content');
          }
        } else {
          console.error('❌ Content div not found');
          console.log('Message container HTML:', messageContainer.outerHTML);
        }
      } catch (error) {
        console.error('❌ Error toggling content:', error);
      }
    };

    // Test function to verify button creation
    window.testShowFullButton = function() {
      console.log('🧪 Testing show full button creation...');
      const buttons = document.querySelectorAll('.show-full-btn');
      console.log('🔢 Found buttons:', buttons.length);
      buttons.forEach((btn, index) => {
        console.log(`Button ${index}:`, btn, 'onclick:', btn.onclick, 'text:', btn.textContent);
        console.log('Parent element:', btn.parentElement);
        console.log('Closest message-container:', btn.closest('.message-container'));
      });
    };

    // Force create a test button for debugging
    window.createTestShowFullButton = function(messageIndex = -1) {
      console.log('🛠️ Creating test show full button...');

      // Find messages
      const chatMessages = document.getElementById('chat-messages');
      if (!chatMessages) {
        console.error('❌ Chat messages container not found');
        return;
      }

      const messages = chatMessages.querySelectorAll('.message-container');
      if (messages.length === 0) {
        console.error('❌ No messages found');
        return;
      }

      // Get target message (last one by default, or by index)
      const targetMessage = messageIndex >= 0 && messageIndex < messages.length
        ? messages[messageIndex]
        : messages[messages.length - 1];

      console.log('🎯 Target message:', targetMessage, 'index:', messageIndex);

      // Add test data
      targetMessage.setAttribute('data-fulltext', encodeURIComponent('Este es el contenido completo de prueba. ¡El botón funciona correctamente! 🎉\n\nEsta es una respuesta más larga para verificar que el scroll y el formato funcionan bien.\n\n**Características probadas:**\n- Decodificación de texto\n- Renderizado Markdown\n- Eliminación del botón\n- Actualización del contenido'));

      // Create button
      const messageBubble = targetMessage.querySelector('.message-bubble');
      if (messageBubble) {
        // Remove existing button if any
        const existingButton = messageBubble.querySelector('.show-full-btn');
        if (existingButton) {
          existingButton.parentElement.remove();
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginTop = '8px';
        buttonContainer.style.textAlign = 'left';
        buttonContainer.innerHTML = `<button type="button" class="show-full-btn" onclick="showFullContent(this)" style="display: inline-block; background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Mostrar completo (TEST)</button>`;

        messageBubble.appendChild(buttonContainer);
        console.log('✅ Test button created on message');
        alert('✅ Botón de prueba creado. Haz click en "Mostrar completo (TEST)"');
      } else {
        console.error('❌ Message bubble not found');
      }
    };

    // Create button on ANY message (even short ones)
    window.forceShowFullButton = function() {
      console.log('🔧 Forcing show full button on last message...');

      const chatMessages = document.getElementById('chat-messages');
      console.log('📨 Chat messages element:', chatMessages);
      if (!chatMessages) {
        console.error('❌ Chat messages not found');
        return;
      }

      const messages = chatMessages.querySelectorAll('.message-container');
      console.log('📝 Messages found:', messages.length);
      if (messages.length === 0) {
        console.error('❌ No messages found');
        return;
      }

      const lastMessage = messages[messages.length - 1];
      console.log('🎯 Last message:', lastMessage);
      console.log('🎯 Adding button to last message');

      // Add dummy full text
      lastMessage.setAttribute('data-fulltext', encodeURIComponent('Contenido completo forzado para testing. ¡Funciona! 🎉\n\n**Esto demuestra que:**\n- El botón se crea correctamente\n- La función showFullContent funciona\n- El contenido se reemplaza\n- El botón se elimina'));
      console.log('💾 Data attribute set');

      // Create button directly - find the content div inside the message
      // The structure is: .message-container > div > div (with background white)
      const contentDiv = lastMessage.querySelector('div > div[style*="background: white"]') ||
                        lastMessage.querySelector('div > div[style*="background:white"]') ||
                        lastMessage.querySelector('.message-bot div div');
      console.log('💬 Content div found:', !!contentDiv);

      if (contentDiv) {
        console.log('🔨 Creating button element...');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'show-full-btn';
        button.id = 'test-show-full-btn'; // Add unique ID for testing
        button.onclick = function() {
          console.log('🖱️ Button clicked directly!');
          alert('🖱️ Botón clickeado! Ahora probando showFullContent...');
          if (window.showFullContent) {
            window.showFullContent(this);
          } else {
            alert('❌ Función showFullContent no encontrada en window');
            console.error('showFullContent function not found in window object');
          }
        };
        button.style.cssText = 'display: inline-block; background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-top: 8px;';
        button.textContent = 'Mostrar completo (FORZADO)';

        console.log('📎 Appending button to content div...');
        contentDiv.appendChild(button);
        console.log('✅ Forced button created');
        alert('✅ Botón forzado creado. Haz click en "Mostrar completo (FORZADO)"\n\nSi no funciona, revisa la consola para ver el error.');
      } else {
        console.error('❌ Content div not found in last message');
        console.log('Last message structure:');
        console.log('Full HTML:', lastMessage.outerHTML);
        console.log('Child elements:', lastMessage.children);
        for (let i = 0; i < lastMessage.children.length; i++) {
          console.log(`Child ${i}:`, lastMessage.children[i], 'HTML:', lastMessage.children[i].outerHTML.substring(0, 200));
        }
      }
    };

    // Force enable concise mode for testing
    window.forceConciseMode = function() {
      console.log('🔧 Forcing concise mode for testing...');
      if (window.chatbotMain && window.chatbotMain.chatPreferences) {
        // Override the concise preference
        const originalConcise = window.chatbotMain.chatPreferences().concise;
        window.chatbotMain.chatPreferences = function() {
          return { concise: true };
        };
        console.log('✅ Concise mode forced (was:', originalConcise, ')');
      } else {
        console.error('❌ chatbotMain not available');
      }
    };

    // Test the complete concise flow
    window.testConciseFlow = function() {
      console.log('🧪 Testing complete concise flow...');

      // Send a long message to trigger concise mode
      const testMessage = 'Explicame detalladamente todos los conceptos básicos de finanzas, incluyendo VAN, TIR, flujo de caja, riesgo, diversificación, tipos de inversión, análisis fundamental, análisis técnico, y cómo se aplican en el contexto peruano. Dame ejemplos prácticos y explica las fórmulas matemáticas.';

      const elements = {
        chatInput: document.getElementById('chat-input'),
        sendButton: document.getElementById('send-button'),
        chatMessages: document.getElementById('chat-messages'),
        typingIndicator: document.getElementById('typing-indicator')
      };

      if (elements.chatInput) {
        elements.chatInput.value = testMessage;
        console.log('📤 Sending long test message to trigger concise mode...');
        sendMessage(elements);
      } else {
        console.error('❌ Chat input not found');
      }
    };

    // Add event listeners for expand buttons and suggestion buttons
    document.addEventListener('click', function(e) {
      if (e.target && e.target.classList.contains('expand-btn')) {
        e.preventDefault();
        window.toggleExpand(e.target);
      }

      // Handle suggestion buttons with data-question attribute
      if (e.target && e.target.classList.contains('quick-suggestion-btn') && e.target.hasAttribute('data-question')) {
        e.preventDefault();
        const question = e.target.getAttribute('data-question');
        if (question && window.sendQuickMessage) {
          window.sendQuickMessage(question);
        }
      }
    });

    console.log('✅ Messaging module completed successfully');

    console.log('✅ Messaging module completed successfully');
  } catch (error) {
    console.error('❌ Error in messaging module:', error);
  }
})();
