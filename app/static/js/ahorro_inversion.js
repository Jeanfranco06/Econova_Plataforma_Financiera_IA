// JavaScript para Simulador de Ahorro e Inversión

let savingsChart = null;

document.addEventListener('DOMContentLoaded', function () {
  const savingsForm = document.getElementById('savings-form');
  const metaForm = document.getElementById('meta-form');
  const comparadorForm = document.getElementById('comparador-form');
  const sensibilidadForm = document.getElementById('sensibilidad-form');

  // Tab switching
  document.querySelectorAll('.savings-tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const tabName = this.getAttribute('data-tab');
      switchSavingsTab(tabName);
    });
  });

  // Main savings calculation
  if (savingsForm) {
    savingsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      calculateSavings();
    });
  }

  // Meta calculation
  if (metaForm) {
    metaForm.addEventListener('submit', function (e) {
      e.preventDefault();
      calculateMeta();
    });
  }

  // Comparador
  if (comparadorForm) {
    comparadorForm.addEventListener('submit', function (e) {
      e.preventDefault();
      calculateComparador();
    });
  }

  // Sensibilidad
  if (sensibilidadForm) {
    sensibilidadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      calculateSensibilidad();
    });
  }
});

function switchSavingsTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.savings-tab-content').forEach(tab => {
    tab.classList.add('hidden');
  });

  // Remove active state from all buttons
  document.querySelectorAll('.savings-tab-btn').forEach(btn => {
    btn.classList.remove('border-green-600', 'text-gray-800');
    btn.classList.add('text-gray-600');
  });

  // Show selected tab
  document.getElementById(tabName + '-tab').classList.remove('hidden');

  // Activate button
  document.querySelector(`[data-tab="${tabName}"]`).classList.remove('text-gray-600');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('border-green-600', 'text-gray-800');
}

function calculateSavings() {
  const montoInicial = parseFloat(document.getElementById('savings-monto-inicial').value);
  const aporteMensual = parseFloat(document.getElementById('savings-aporte').value);
  const tasaAnual = parseFloat(document.getElementById('savings-tasa').value);
  const meses = parseInt(document.getElementById('savings-meses').value);
  const tasaImpuesto = parseFloat(document.getElementById('savings-impuesto').value) || 0;
  const inflacionAnual = parseFloat(document.getElementById('savings-inflacion').value) || 0;
  const usuarioId = document.body.getAttribute('data-usuario-id');

  // Validate inputs
  if (!montoInicial && !aporteMensual || !tasaAnual || !meses) {
    alert('Por favor completa todos los campos requeridos');
    return;
  }

  const data = {
    monto_inicial: montoInicial,
    aporte_mensual: aporteMensual,
    tasa_anual: tasaAnual,
    meses: meses,
    tasa_impuesto: tasaImpuesto,
    inflacion_anual: inflacionAnual
  };

  if (usuarioId && usuarioId !== 'None') {
    data.usuario_id = parseInt(usuarioId);
  }

  // Call API
  fetch('/api/v1/financiero/ahorro', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        displaySavingsResults(result.data);
      } else {
        alert('Error: ' + result.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al calcular el ahorro');
    });
}

function displaySavingsResults(resultado) {
  const resultsDiv = document.getElementById('savings-results');
  const resumen = resultado.resumen;
  const indicadores = resultado.indicadores;
  const proyeccion = resultado.proyeccion;

  // Update summary cards
  document.getElementById('result-saldo-final').textContent = 'S/ ' + resumen.saldo_final.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  document.getElementById('result-ganancia-neta').textContent = 'S/ ' + resumen.ganancia_neta.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  document.getElementById('result-rendimiento').textContent = indicadores.rendimiento_porcentaje + '%';

  document.getElementById('poder-adquisitivo').textContent = 'S/ ' + indicadores.saldo_poder_adquisitivo_real.toLocaleString('es-PE', {
    minimumFractionDigits: 2
  });

  // Summary information
  const summaryHtml = `
    <div class="flex justify-between py-2 border-b">
      <span class="text-gray-700">Monto Inicial:</span>
      <span class="font-semibold">S/ ${resumen.monto_inicial.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-gray-700">Aportes Totales:</span>
      <span class="font-semibold">S/ ${resumen.aporte_total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-gray-700">Capital Invertido:</span>
      <span class="font-semibold">S/ ${(resumen.monto_inicial + resumen.aporte_total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="flex justify-between py-2 border-b text-green-600">
      <span>Intereses Ganados:</span>
      <span class="font-semibold">S/ ${resumen.interes_ganado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="flex justify-between py-2 border-b text-orange-600">
      <span>Impuestos Pagados:</span>
      <span class="font-semibold">S/ ${resumen.impuestos_pagados.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="flex justify-between py-3 bg-green-50 p-3 rounded text-lg font-bold text-green-700">
      <span>SALDO FINAL:</span>
      <span>S/ ${resumen.saldo_final.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="flex justify-between py-2 mt-3 text-sm text-gray-600">
      <span>Período:</span>
      <span>${resumen.periodo_anos} años (${resumen.periodo_meses} meses)</span>
    </div>
    <div class="flex justify-between py-2 text-sm text-gray-600">
      <span>TEA (Tasa Efectiva Anual):</span>
      <span class="font-semibold">${indicadores.tasa_efectiva_anual.toFixed(2)}%</span>
    </div>
  `;

  document.getElementById('savings-summary').innerHTML = summaryHtml;

  // Create chart
  createSavingsChart(proyeccion);

  // Show results
  resultsDiv.classList.remove('hidden');
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createSavingsChart(proyeccion) {
  const ctx = document.getElementById('savings-chart');

  if (savingsChart) {
    savingsChart.destroy();
  }

  const labels = proyeccion.map(p => 'Año ' + p.ano);
  const saldobData = proyeccion.map(p => p.saldo);
  const aportesData = proyeccion.map(p => p.aporte_acumulado);

  savingsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Saldo Total',
          data: saldobData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#10b981',
          pointHoverRadius: 6
        },
        {
          label: 'Aportes Acumulados',
          data: aportesData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: false,
          pointRadius: 3,
          pointBackgroundColor: '#3b82f6',
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return 'S/ ' + value.toLocaleString('es-PE', { maximumFractionDigits: 0 });
            }
          }
        }
      }
    }
  });
}

function calculateMeta() {
  const formData = new FormData(document.getElementById('meta-form'));
  const data = {
    monto_objetivo: parseFloat(formData.get('monto_objetivo')),
    monto_inicial: parseFloat(formData.get('monto_inicial')),
    tasa_anual: parseFloat(formData.get('tasa_anual')),
    aporte_mensual: parseFloat(formData.get('aporte_mensual'))
  };

  fetch('/api/v1/financiero/ahorro/meta', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        displayMetaResults(result.data);
      } else {
        alert('Error: ' + result.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al calcular meta');
    });
}

function displayMetaResults(resultado) {
  const resultsDiv = document.getElementById('meta-results');

  if (!resultado.meta_alcanzada) {
    resultsDiv.innerHTML = `
      <div class="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
        <div class="text-red-700 font-semibold text-lg">${resultado.mensaje}</div>
      </div>
    `;
  } else {
    document.getElementById('meta-meses').textContent = resultado.meses_necesarios;
    document.getElementById('meta-anos').textContent = '(' + resultado.anos_necesarios + ' años)';

    const infoHtml = `
      <div class="flex justify-between py-2 border-b">
        <span class="text-gray-700">Meta Objetivo:</span>
        <span class="font-semibold">S/ ${resultado.saldo_objetivo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="flex justify-between py-2 border-b">
        <span class="text-gray-700">Saldo Alcanzado:</span>
        <span class="font-semibold text-green-600">S/ ${resultado.saldo_final.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="flex justify-between py-2 border-b">
        <span class="text-gray-700">Diferencia:</span>
        <span class="font-semibold">S/ ${resultado.diferencia.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="flex justify-between py-2 border-b">
        <span class="text-gray-700">Aporte Total a Realizar:</span>
        <span class="font-semibold">S/ ${resultado.aporte_total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="flex justify-between py-2 bg-green-50 p-2 rounded">
        <span class="text-gray-700">Intereses Ganados:</span>
        <span class="font-semibold text-green-600">S/ ${resultado.interes_ganado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
      </div>
    `;

    document.getElementById('meta-info').innerHTML = infoHtml;
  }

  resultsDiv.classList.remove('hidden');
}

function calculateComparador() {
  const formData = new FormData(document.getElementById('comparador-form'));
  const montoInicial = parseFloat(formData.get('monto_inicial'));
  const aporteMensual = parseFloat(formData.get('aporte_mensual'));
  const meses = parseInt(formData.get('meses'));

  // Get selected instruments
  const instrumentsMap = {
    'plazo_fijo': { nombre: 'Plazo Fijo', tasa_anual: 5.0, tasa_impuesto: 0, descripcion: 'Depósito a plazo fijo bancario' },
    'fondo_mutuo': { nombre: 'Fondo Mutuo', tasa_anual: 8.5, tasa_impuesto: 0.05, descripcion: 'Fondo de inversión diversificado' },
    'renta_fija': { nombre: 'Renta Fija', tasa_anual: 6.5, tasa_impuesto: 0.03, descripcion: 'Bonos y valores de renta fija' }
  };

  const selectedInstruments = Array.from(document.querySelectorAll('input[name="instrument"]:checked'))
    .map(checkbox => instrumentsMap[checkbox.value]);

  if (selectedInstruments.length === 0) {
    alert('Por favor selecciona al menos un instrumento');
    return;
  }

  const data = {
    monto_inicial: montoInicial,
    aporte_mensual: aporteMensual,
    meses: meses,
    instrumentos: selectedInstruments
  };

  const usuarioId = document.body.getAttribute('data-usuario-id');
  if (usuarioId && usuarioId !== 'None') {
    data.usuario_id = parseInt(usuarioId);
  }

  fetch('/api/v1/financiero/ahorro/comparar-instrumentos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        displayComparadorResults(result.data);
      } else {
        alert('Error: ' + result.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al comparar instrumentos');
    });
}

function displayComparadorResults(resultado) {
  const resultsDiv = document.getElementById('comparador-results');
  const mejorOpcion = resultado.mejor_opcion;

  // Display best option
  const mejorHtml = `
    <div class="space-y-2">
      <h4 class="font-semibold text-lg text-green-700">${mejorOpcion.nombre}</h4>
      <p class="text-gray-600 text-sm">${mejorOpcion.descripcion}</p>
      <div class="grid md:grid-cols-3 gap-3 mt-3">
        <div class="bg-green-100 p-3 rounded">
          <div class="text-xs text-green-700">Saldo Final</div>
          <div class="font-bold text-green-900">S/ ${mejorOpcion.saldo_final.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
        </div>
        <div class="bg-blue-100 p-3 rounded">
          <div class="text-xs text-blue-700">Ganancia Neta</div>
          <div class="font-bold text-blue-900">S/ ${mejorOpcion.ganancia_neta.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
        </div>
        <div class="bg-orange-100 p-3 rounded">
          <div class="text-xs text-orange-700">Rendimiento</div>
          <div class="font-bold text-orange-900">${mejorOpcion.rendimiento_porcentaje.toFixed(2)}%</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('mejor-opcion').innerHTML = mejorHtml;

  // Display comparison table
  const tableBody = document.getElementById('comparador-table');
  tableBody.innerHTML = '';

  resultado.comparativa.forEach((instrumento, index) => {
    const tr = document.createElement('tr');
    if (index === 0) tr.className = 'bg-green-50 font-semibold';

    tr.innerHTML = `
      <td class="px-4 py-3">${instrumento.nombre}</td>
      <td class="px-4 py-3 text-right">${instrumento.tasa_anual.toFixed(2)}%</td>
      <td class="px-4 py-3 text-right">S/ ${instrumento.saldo_final.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
      <td class="px-4 py-3 text-right text-green-600">S/ ${instrumento.ganancia_neta.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
      <td class="px-4 py-3 text-right">${instrumento.rendimiento_porcentaje.toFixed(2)}%</td>
    `;
    tableBody.appendChild(tr);
  });

  resultsDiv.classList.remove('hidden');
}

function calculateSensibilidad() {
  const formData = new FormData(document.getElementById('sensibilidad-form'));
  const data = {
    monto_inicial: parseFloat(formData.get('monto_inicial')),
    aporte_mensual: parseFloat(formData.get('aporte_mensual')),
    tasa_anual: parseFloat(formData.get('tasa_anual')),
    meses: parseInt(formData.get('meses')),
    variacion_tasa: 1.0
  };

  fetch('/api/v1/financiero/ahorro/sensibilidad', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        displaySensibilidadResults(result.data);
      } else {
        alert('Error: ' + result.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al calcular sensibilidad');
    });
}

function displaySensibilidadResults(resultado) {
  const resultsDiv = document.getElementById('sensibilidad-results');
  const tableBody = document.getElementById('sensibilidad-table');
  tableBody.innerHTML = '';

  resultado.escenarios.forEach(escenario => {
    const tr = document.createElement('tr');
    const isBase = escenario.escenario === 'Base';
    tr.className = isBase ? 'bg-green-50 font-semibold' : '';

    tr.innerHTML = `
      <td class="px-4 py-3">${escenario.tasa.toFixed(2)}%</td>
      <td class="px-4 py-3 text-right">S/ ${escenario.saldo_final.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
      <td class="px-4 py-3 text-right ${escenario.variacion_porcentaje > 0 ? 'text-green-600' : 'text-red-600'}">
        ${escenario.variacion_porcentaje > 0 ? '+' : ''}${escenario.variacion_porcentaje.toFixed(2)}%
      </td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded text-xs font-semibold ${escenario.escenario === 'Base' ? 'bg-green-200 text-green-800' :
        escenario.escenario === 'Optimista' ? 'bg-blue-200 text-blue-800' :
          'bg-red-200 text-red-800'
      }">${escenario.escenario}</span>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  resultsDiv.classList.remove('hidden');
}
