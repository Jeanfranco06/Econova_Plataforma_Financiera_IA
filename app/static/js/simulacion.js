// JavaScript para la página de simulación financiera
// Archivo separado para evitar conflictos con Jinja2

// Cambio de tipo de simulación
document.addEventListener('DOMContentLoaded', function() {
  const typeButtons = document.querySelectorAll('.simulation-type-btn');
  const calculators = document.querySelectorAll('.simulation-calculator');

  typeButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remover clase activa de todos los botones
      typeButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-700');
      });

      // Ocultar todas las calculadoras
      calculators.forEach(calc => {
        calc.style.display = 'none';
      });

      // Agregar clase activa al botón clickeado
      this.classList.add('active');
      if (this.id === 'van-btn') {
        this.classList.add('bg-blue-600', 'text-white');
      } else if (this.id === 'tir-btn') {
        this.classList.add('bg-green-600', 'text-white');
      } else if (this.id === 'wacc-btn') {
        this.classList.add('bg-purple-600', 'text-white');
      } else if (this.id === 'portafolio-btn') {
        this.classList.add('bg-orange-600', 'text-white');
      }

      // Mostrar calculadora correspondiente
      const calcId = this.id.replace('-btn', '-calculator');
      document.getElementById(calcId).style.display = 'block';
    });
  });

  // Calculadora VAN
  document.getElementById('van-form').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateVAN();
  });

  // Calculadora TIR
  document.getElementById('tir-form').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateTIR();
  });

  // Calculadora WACC
  document.getElementById('wacc-form').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateWACC();
  });

  // Calculadora Portafolio
  const portafolioForm = document.getElementById('portafolio-form');
  if (portafolioForm) {
    portafolioForm.addEventListener('submit', function(e) {
      e.preventDefault();
      calculatePortfolio();
    });
  }

  // Funcionalidad para agregar más años
  document.getElementById('add-flujo-van').addEventListener('click', function() {
    addYearToVAN();
  });

  document.getElementById('add-flujo-tir').addEventListener('click', function() {
    addYearToTIR();
  });

  // Funcionalidad para agregar más activos al portafolio
  const addActivoBtn = document.getElementById('add-activo-portafolio');
  if (addActivoBtn) {
    addActivoBtn.addEventListener('click', function() {
      addAssetToPortfolio();
    });
  }

  // El botón de portafolio siempre existe ahora
  document.getElementById('portafolio-btn').addEventListener('click', function() {
    // Ocultar todas las calculadoras
    calculators.forEach(calc => {
      calc.style.display = 'none';
    });

    // Mostrar calculadora de portafolio
    document.getElementById('portafolio-calculator').style.display = 'block';

    // Actualizar botones activos
    typeButtons.forEach(btn => {
      btn.classList.remove('active', 'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600', 'text-white');
      btn.classList.add('bg-gray-100', 'text-gray-700');
    });

    this.classList.add('active', 'bg-orange-600', 'text-white');
  });
});

function calculateVAN() {
  // Obtener valores de inversión y tasa
  const inversion = parseFloat(document.getElementById('van-inversion').value);
  const tasa = parseFloat(document.getElementById('van-tasa').value) / 100;

  if (!inversion || !tasa) {
    alert('Por favor ingresa todos los valores requeridos');
    return;
  }

  // Obtener flujos de caja
  const flujos = [];
  const flujoInputs = document.querySelectorAll('#van-flujos input[type="number"]');
  flujoInputs.forEach(input => {
    const value = parseFloat(input.value);
    if (!isNaN(value)) {
      flujos.push(value);
    }
  });

  if (flujos.length === 0) {
    alert('Por favor ingresa al menos un flujo de caja');
    return;
  }

  // Calcular VAN
  let van = -inversion;
  for (let i = 0; i < flujos.length; i++) {
    van += flujos[i] / Math.pow(1 + tasa, i + 1);
  }

  // Calcular TIR (aproximada)
  const tir = calculateTIRFromFlows(inversion, flujos);

  // Calcular período de recuperación
  const payback = calculatePaybackPeriod(inversion, flujos);

  // Mostrar resultados
  document.getElementById('van-result').textContent = 'S/ ' + van.toLocaleString('es-PE', {maximumFractionDigits: 0});
  document.getElementById('van-tir').textContent = tir.toFixed(1) + '%';
  document.getElementById('van-payback').textContent = payback.toFixed(1) + ' años';

  // Evaluación del proyecto
  const evaluation = document.getElementById('van-evaluation');
  if (van > 0) {
    evaluation.textContent = 'Proyecto Viable';
    evaluation.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800';
  } else {
    evaluation.textContent = 'Proyecto No Viable';
    evaluation.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800';
  }

  document.getElementById('van-results').style.display = 'block';
}

function calculateTIR() {
  // Obtener inversión inicial
  const inversion = parseFloat(document.getElementById('tir-inversion').value);

  if (!inversion) {
    alert('Por favor ingresa la inversión inicial');
    return;
  }

  // Obtener flujos de caja
  const flujos = [];
  const flujoInputs = document.querySelectorAll('#tir-flujos input[type="number"]');
  flujoInputs.forEach(input => {
    const value = parseFloat(input.value);
    if (!isNaN(value)) {
      flujos.push(value);
    }
  });

  if (flujos.length === 0) {
    alert('Por favor ingresa al menos un flujo de caja');
    return;
  }

  const tir = calculateTIRFromFlows(inversion, flujos);

  document.getElementById('tir-result').textContent = tir.toFixed(1) + '%';

  const evaluation = document.getElementById('tir-evaluation');
  if (tir > 10) {
    evaluation.textContent = 'Excelente Rentabilidad';
    evaluation.className = 'bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-semibold';
  } else if (tir > 5) {
    evaluation.textContent = 'Buena Rentabilidad';
    evaluation.className = 'bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-semibold';
  } else {
    evaluation.textContent = 'Rentabilidad Baja';
    evaluation.className = 'bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-semibold';
  }

  document.getElementById('tir-results').style.display = 'block';
}

function calculateWACC() {
  // Obtener valores para cálculo WACC
  const costoDeuda = parseFloat(document.getElementById('wacc-deuda').value) / 100;
  const tasaImpuestos = parseFloat(document.getElementById('wacc-impuestos').value) / 100;
  const costoCapital = parseFloat(document.getElementById('wacc-capital').value) / 100;
  const proporcionDeuda = parseFloat(document.getElementById('wacc-proporcion').value) / 100;

  if (!costoDeuda || !tasaImpuestos || !costoCapital || proporcionDeuda === undefined) {
    alert('Por favor ingresa todos los valores requeridos');
    return;
  }

  // WACC = (E/V * Re) + (D/V * Rd * (1-Tc))
  const proporcionCapital = 1 - proporcionDeuda;
  const costoDeudaDespuesImpuestos = costoDeuda * (1 - tasaImpuestos);

  const wacc = (proporcionCapital * costoCapital) + (proporcionDeuda * costoDeudaDespuesImpuestos);

  document.getElementById('wacc-result').textContent = (wacc * 100).toFixed(1) + '%';
  document.getElementById('wacc-results').style.display = 'block';
}

function calculateTIRFromFlows(inversion, flujos) {
  // Cálculo simplificado de TIR usando aproximación
  // En una implementación real, usarías el método de Newton-Raphson
  let tir = 0.1; // Comenzar con 10%
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    let npv = -inversion;
    let dnpv = 0;

    for (let j = 0; j < flujos.length; j++) {
      npv += flujos[j] / Math.pow(1 + tir, j + 1);
      dnpv -= (j + 1) * flujos[j] / Math.pow(1 + tir, j + 2);
    }

    const newTir = tir - npv / dnpv;

    if (Math.abs(newTir - tir) < tolerance) {
      return newTir * 100;
    }

    tir = newTir;
  }

  return tir * 100;
}

function calculatePaybackPeriod(inversion, flujos) {
  // Calcular período de recuperación (payback period)
  let cumulative = 0;
  let years = 0;

  for (let i = 0; i < flujos.length; i++) {
    cumulative += flujos[i];
    years++;

    if (cumulative >= inversion) {
      // Interpolar para año parcial
      const excess = cumulative - inversion;
      const partialYear = excess / flujos[i];
      return years - 1 + (1 - partialYear);
    }
  }

  return years; // Si no se alcanza el payback
}

function addYearToVAN() {
  // Agregar un nuevo año para flujos de caja VAN
  const container = document.getElementById('van-flujos');
  const yearCount = container.children.length + 1;

  const div = document.createElement('div');
  div.className = 'flex items-center space-x-3';

  // Crear HTML para el nuevo campo de flujo de caja
  const span = document.createElement('span');
  span.className = 'text-sm text-gray-600 w-16';
  span.textContent = 'Año ' + yearCount + ':';

  const input = document.createElement('input');
  input.type = 'number';
  input.name = 'flujo' + yearCount;
  input.step = '0.01';
  input.className = 'flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  input.placeholder = '0';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'remove-flujo text-red-500 hover:text-red-700 px-2';
  button.innerHTML = '<i class="fas fa-trash"></i>';

  div.appendChild(span);
  div.appendChild(input);
  div.appendChild(button);
  container.appendChild(div);

  // Mostrar botones de eliminar para todos menos el primero
  const removeButtons = container.querySelectorAll('.remove-flujo');
  removeButtons.forEach((btn, index) => {
    if (index > 0) { // No mostrar para el primer año
      btn.style.display = 'block';
    }
  });

  // Agregar funcionalidad de eliminación
  button.addEventListener('click', function() {
    container.removeChild(div);
    updateVANYears();
  });
}

function addYearToTIR() {
  // Agregar un nuevo año para flujos de caja TIR
  const container = document.getElementById('tir-flujos');
  const yearCount = container.children.length + 1;

  const div = document.createElement('div');
  div.className = 'flex items-center space-x-3';

  // Crear HTML para el nuevo campo de flujo de caja
  const span = document.createElement('span');
  span.className = 'text-sm text-gray-600 w-16';
  span.textContent = 'Año ' + yearCount + ':';

  const input = document.createElement('input');
  input.type = 'number';
  input.name = 'flujo' + yearCount;
  input.step = '0.01';
  input.className = 'flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent';
  input.placeholder = '0';

  div.appendChild(span);
  div.appendChild(input);
  container.appendChild(div);
}

function updateVANYears() {
  // Actualizar numeración de años en VAN
  const container = document.getElementById('van-flujos');
  const years = container.children;

  for (let index = 0; index < years.length; index++) {
    const year = years[index];
    const span = year.querySelector('span');
    const input = year.querySelector('input');
    const removeBtn = year.querySelector('.remove-flujo');

    span.textContent = 'Año ' + (index + 1) + ':';
    input.name = 'flujo' + (index + 1);

    if (index === 0) {
      removeBtn.style.display = 'none';
    } else {
      removeBtn.style.display = 'block';
    }
  }
}

function calculatePortfolio() {
  // Obtener todos los activos del portafolio
  const activos = [];
  const pesos = [];
  const rendimientos = [];

  // Recopilar datos de todos los activos
  const activoInputs = document.querySelectorAll('#portafolio-activos input[name^="activo"]');
  const pesoInputs = document.querySelectorAll('#portafolio-activos input[name^="peso"]');
  const rendimientoInputs = document.querySelectorAll('#portafolio-activos input[name^="rendimiento"]');

  for (let i = 0; i < activoInputs.length; i++) {
    const activo = activoInputs[i].value.trim();
    const peso = parseFloat(pesoInputs[i].value);
    const rendimiento = parseFloat(rendimientoInputs[i].value);

    if (activo && !isNaN(peso) && !isNaN(rendimiento) && peso > 0) {
      activos.push(activo);
      pesos.push(peso / 100); // Convertir a decimal
      rendimientos.push(rendimiento / 100); // Convertir a decimal
    }
  }

  if (activos.length < 2) {
    alert('Por favor ingresa al menos 2 activos válidos para el portafolio');
    return;
  }

  // Verificar que los pesos sumen 100%
  const sumaPesos = pesos.reduce((sum, peso) => sum + peso, 0);
  if (Math.abs(sumaPesos - 1) > 0.01) {
    alert('Los pesos deben sumar exactamente 100%');
    return;
  }

  // Calcular rendimiento esperado del portafolio
  let rendimientoEsperado = 0;
  for (let i = 0; i < pesos.length; i++) {
    rendimientoEsperado += pesos[i] * rendimientos[i];
  }

  // Calcular riesgo (varianza) del portafolio
  // Para simplificar, usaremos una aproximación básica sin covarianzas
  // En un portafolio real, necesitaríamos la matriz de covarianzas
  let varianza = 0;
  for (let i = 0; i < pesos.length; i++) {
    // Asumiendo volatilidad aproximada basada en el rendimiento esperado
    // En la realidad, esto vendría de datos históricos
    const volatilidadEstimada = Math.abs(rendimientos[i]) * 0.3; // 30% de volatilidad aproximada
    varianza += pesos[i] * pesos[i] * volatilidadEstimada * volatilidadEstimada;
  }

  const riesgo = Math.sqrt(varianza);

  // Mostrar resultados
  document.getElementById('portafolio-rendimiento').textContent = (rendimientoEsperado * 100).toFixed(1) + '%';
  document.getElementById('portafolio-riesgo').textContent = (riesgo * 100).toFixed(1) + '%';

  // Mostrar distribución del portafolio
  const distribucionDiv = document.getElementById('portafolio-distribucion');
  distribucionDiv.innerHTML = '';

  for (let i = 0; i < activos.length; i++) {
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center py-1';
    div.innerHTML = `
      <span class="text-sm text-gray-700">${activos[i]}</span>
      <span class="text-sm font-medium text-orange-600">${(pesos[i] * 100).toFixed(1)}%</span>
    `;
    distribucionDiv.appendChild(div);
  }

  document.getElementById('portafolio-results').style.display = 'block';
}

function addAssetToPortfolio() {
  // Agregar un nuevo activo al portafolio
  const container = document.getElementById('portafolio-activos');
  const assetCount = Math.floor(container.children.length / 3) + 1; // Cada activo tiene 3 inputs

  const div = document.createElement('div');
  div.className = 'grid md:grid-cols-3 gap-4 items-center';

  // Nombre del activo
  const activoDiv = document.createElement('div');
  const activoInput = document.createElement('input');
  activoInput.type = 'text';
  activoInput.name = 'activo' + assetCount;
  activoInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent';
  activoInput.placeholder = 'Ej: Nuevo Activo';
  activoDiv.appendChild(activoInput);

  // Peso
  const pesoDiv = document.createElement('div');
  const pesoInput = document.createElement('input');
  pesoInput.type = 'number';
  pesoInput.name = 'peso' + assetCount;
  pesoInput.min = '0';
  pesoInput.max = '100';
  pesoInput.step = '0.01';
  pesoInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent';
  pesoInput.placeholder = '10';
  pesoDiv.appendChild(pesoInput);

  // Rendimiento
  const rendimientoDiv = document.createElement('div');
  const rendimientoInput = document.createElement('input');
  rendimientoInput.type = 'number';
  rendimientoInput.name = 'rendimiento' + assetCount;
  rendimientoInput.step = '0.01';
  rendimientoInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent';
  rendimientoInput.placeholder = '8';
  rendimientoDiv.appendChild(rendimientoInput);

  div.appendChild(activoDiv);
  div.appendChild(pesoDiv);
  div.appendChild(rendimientoDiv);
  container.appendChild(div);
}
