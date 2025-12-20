// JavaScript para Simulador de Préstamos

document.addEventListener('DOMContentLoaded', function() {
  const loanForm = document.getElementById('loan-form');
  const loanSensibilidadForm = document.getElementById('loan-sensibilidad-form');
  const loanCompararForm = document.getElementById('loan-comparar-form');
  
  // Tab switching
  document.querySelectorAll('.loan-tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      switchLoanTab(tabName);
    });
  });

  // Main loan calculation
  if (loanForm) {
    loanForm.addEventListener('submit', function(e) {
      e.preventDefault();
      calculateLoan();
    });
  }

  // Sensibilidad calculation
  if (loanSensibilidadForm) {
    loanSensibilidadForm.addEventListener('submit', function(e) {
      e.preventDefault();
      calculateLoanSensibilidad();
    });
  }

  // Comparar plazos
  if (loanCompararForm) {
    loanCompararForm.addEventListener('submit', function(e) {
      e.preventDefault();
      calculateCompararPlazos();
    });
  }
});

function switchLoanTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.loan-tab-content').forEach(tab => {
    tab.classList.add('hidden');
  });

  // Remove active state from all buttons
  document.querySelectorAll('.loan-tab-btn').forEach(btn => {
    btn.classList.remove('border-blue-600', 'text-gray-800');
    btn.classList.add('text-gray-600');
  });

  // Show selected tab
  document.getElementById(tabName + '-tab').classList.remove('hidden');

  // Activate button
  document.querySelector(`[data-tab="${tabName}"]`).classList.remove('text-gray-600');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('border-blue-600', 'text-gray-800');
}

function calculateLoan() {
  const monto = parseFloat(document.getElementById('loan-monto').value);
  const tasaAnual = parseFloat(document.getElementById('loan-tasa').value);
  const plazoMeses = parseInt(document.getElementById('loan-plazo').value);
  const comisionInicial = parseFloat(document.getElementById('loan-comision').value) || 0;
  const tasaImpuesto = parseFloat(document.getElementById('loan-impuesto').value) || 0;
  const nombreSimulacion = document.getElementById('loan-nombre').value;
  const usuarioId = document.body.getAttribute('data-usuario-id');

  // Validate inputs
  if (!monto || !tasaAnual || !plazoMeses) {
    alert('Por favor completa todos los campos requeridos');
    return;
  }

  // Prepare data for API
  const data = {
    monto: monto,
    tasa_anual: tasaAnual,
    plazo_meses: plazoMeses,
    comision_inicial: comisionInicial,
    tasa_impuesto: tasaImpuesto,
    nombre_simulacion: nombreSimulacion
  };

  if (usuarioId && usuarioId !== 'None') {
    data.usuario_id = parseInt(usuarioId);
  }

  // Call API
  fetch('/api/v1/financiero/prestamo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      displayLoanResults(result.data);
    } else {
      alert('Error: ' + result.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error al calcular el préstamo');
  });
}

function displayLoanResults(resultado) {
  const resultsDiv = document.getElementById('loan-results');
  const resumen = resultado.resumen;
  const costos = resultado.costos;
  const tabla = resultado.tabla_amortizacion;

  // Update summary cards
  document.getElementById('result-cuota').textContent = 'S/ ' + resumen.cuota_mensual.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  document.getElementById('result-interes').textContent = 'S/ ' + costos.costo_interes.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  document.getElementById('result-ted').textContent = resumen.ted_tasa_efectiva + '%';

  document.getElementById('result-total').textContent = 'S/ ' + costos.costo_total_desembolsado.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Cost summary
  const costSummaryHtml = `
    <div class="flex justify-between py-2 border-b">
      <span class="text-gray-700">Monto Solicitado:</span>
      <span class="font-semibold">S/ ${resumen.monto_solicitado.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-gray-700">Monto Neto Desembolsado:</span>
      <span class="font-semibold">S/ ${resumen.monto_neto_desembolsado.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-gray-700">Cuota Mensual:</span>
      <span class="font-semibold">S/ ${resumen.cuota_mensual.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
    </div>
    <div class="flex justify-between py-2 border-b text-orange-600">
      <span>Comisión Inicial:</span>
      <span class="font-semibold">S/ ${costos.comision_inicial.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
    </div>
    <div class="flex justify-between py-2 border-b text-red-600">
      <span>Costo de Intereses (${resumen.plazo_meses} meses):</span>
      <span class="font-semibold">S/ ${costos.costo_interes.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
    </div>
    <div class="flex justify-between py-2 border-b">
      <span class="text-gray-700">Impuestos:</span>
      <span class="font-semibold">S/ ${costos.impuestos.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
    </div>
    <div class="flex justify-between py-3 bg-blue-50 p-3 rounded text-lg font-bold text-blue-700">
      <span>COSTO TOTAL:</span>
      <span>S/ ${costos.costo_total_desembolsado.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
    </div>
  `;

  document.getElementById('loan-cost-summary').innerHTML = costSummaryHtml;

  // Fill amortization table (showing first 12 months or all if less)
  const tableBody = document.getElementById('loan-table-body');
  tableBody.innerHTML = '';

  const mostrarMeses = Math.min(12, tabla.length);
  for (let i = 0; i < mostrarMeses; i++) {
    const row = tabla[i];
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50';
    tr.innerHTML = `
      <td class="px-4 py-3 text-left">${row.mes}</td>
      <td class="px-4 py-3 text-right">S/ ${row.cuota.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
      <td class="px-4 py-3 text-right">S/ ${row.capital.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
      <td class="px-4 py-3 text-right">S/ ${row.interes.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
      <td class="px-4 py-3 text-right">S/ ${row.saldo_restante.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
    `;
    tableBody.appendChild(tr);
  }

  // Show results
  resultsDiv.classList.remove('hidden');
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function calculateLoanSensibilidad() {
  const formData = new FormData(document.getElementById('loan-sensibilidad-form'));
  const data = {
    monto: parseFloat(formData.get('monto')),
    tasa_anual: parseFloat(formData.get('tasa_anual')),
    plazo_meses: parseInt(formData.get('plazo_meses')),
    variacion_tasa: 0.5
  };

  fetch('/api/v1/financiero/prestamo/sensibilidad', {
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
  const tableBody = document.getElementById('sensibilidad-table');
  tableBody.innerHTML = '';

  resultado.escenarios.forEach(escenario => {
    const tr = document.createElement('tr');
    const isBase = escenario.escenario === 'Base';
    tr.className = isBase ? 'bg-blue-50 font-semibold' : '';
    
    tr.innerHTML = `
      <td class="px-4 py-3">${escenario.tasa.toFixed(2)}%</td>
      <td class="px-4 py-3 text-right">S/ ${escenario.cuota_mensual.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
      <td class="px-4 py-3 text-right">S/ ${escenario.costo_total.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
      <td class="px-4 py-3 text-right ${escenario.variacion_cuota_porcentaje > 0 ? 'text-red-600' : 'text-green-600'}">
        ${escenario.variacion_cuota_porcentaje > 0 ? '+' : ''}${escenario.variacion_cuota_porcentaje.toFixed(2)}%
      </td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded text-xs font-semibold ${
          escenario.escenario === 'Base' ? 'bg-blue-200 text-blue-800' :
          escenario.escenario === 'Optimista' ? 'bg-green-200 text-green-800' :
          'bg-red-200 text-red-800'
        }">${escenario.escenario}</span>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  document.getElementById('sensibilidad-results').classList.remove('hidden');
}

function calculateCompararPlazos() {
  const formData = new FormData(document.getElementById('loan-comparar-form'));
  const plazosText = document.getElementById('plazos-input').value;
  const plazos = plazosText.split(',').map(p => parseInt(p.trim())).filter(p => p > 0);

  const data = {
    monto: parseFloat(formData.get('monto')),
    tasa_anual: parseFloat(formData.get('tasa_anual')),
    plazos: plazos.length > 0 ? plazos : [24, 36, 48, 60]
  };

  fetch('/api/v1/financiero/prestamo/comparar-plazos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      displayCompararResults(result.data);
    } else {
      alert('Error: ' + result.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error al comparar plazos');
  });
}

function displayCompararResults(resultado) {
  const tableBody = document.getElementById('comparar-table');
  tableBody.innerHTML = '';

  resultado.comparativa_plazos.forEach((comparativa, index) => {
    const tr = document.createElement('tr');
    if (index === 0) tr.className = 'bg-green-50 font-semibold'; // Highlight shortest
    
    tr.innerHTML = `
      <td class="px-4 py-3 text-center">${comparativa.plazo_anos} años</td>
      <td class="px-4 py-3 text-right">S/ ${comparativa.cuota_mensual.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
      <td class="px-4 py-3 text-right">S/ ${comparativa.costo_interes.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
      <td class="px-4 py-3 text-right">S/ ${comparativa.costo_total.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
    `;
    tableBody.appendChild(tr);
  });

  document.getElementById('comparar-results').classList.remove('hidden');
}
