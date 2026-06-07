/* ============================================================
   CrisisCalc — Script principal
   Programación Web I — UMSA 2025
   Todos los simuladores, DOM, validaciones y eventos
   ============================================================ */

/* ===================================================
   INICIALIZACIÓN
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  inicializarNav();
  inicializarTabs();
  inicializarProductos();
  inicializarItems();
  inicializarProductosPA();
  animarContadores();
  animarScrollFadeIn();
});

/* ===================================================
   NAVEGACIÓN Y MENÚ HAMBURGUESA
   =================================================== */
function inicializarNav() {
  // Menú hamburguesa (mobile)
  const ham = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');

  if (ham && nav) {
    ham.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  // Marcar enlace activo al hacer scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Cerrar menú al hacer clic en un enlace
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  });
}

/* ===================================================
   TABS DE ESCENARIOS
   =================================================== */
function inicializarTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.sim-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      // Activar botón
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Mostrar panel correcto
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `tab-${target}`) {
          panel.classList.add('active');
        }
      });
    });
  });
}

/* ===================================================
   ANIMACIÓN DE CONTADORES
   =================================================== */
function animarContadores() {
  const nums = document.querySelectorAll('.stat-num[data-target]');
  nums.forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + (target === 100 ? '' : '');
      if (current >= target) clearInterval(interval);
    }, 40);
  });
}

/* ===================================================
   SCROLL FADE-IN
   =================================================== */
function animarScrollFadeIn() {
  const elements = document.querySelectorAll('.context-card, .caso-card, .conclusion-main, .conclusion-list');
  elements.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

/* ===================================================
   UTILIDADES COMUNES
   =================================================== */

/**
 * Valida que un input tenga un número mayor a 0.
 * Agrega clase CSS de error si está vacío.
 * @param {string} id - ID del elemento input
 * @returns {number|null} - El valor numérico o null si es inválido
 */
function validar(id) {
  const el = document.getElementById(id);
  const val = parseFloat(el.value);
  if (isNaN(val) || val < 0) {
    el.classList.add('invalid');
    setTimeout(() => el.classList.remove('invalid'), 2000);
    return null;
  }
  return val;
}

/**
 * Formatea un número con dos decimales y símbolo Bs.
 */
function fmtBs(n) {
  return `${n.toFixed(2)} Bs`;
}

/**
 * Formatea un número con dos decimales.
 */
function fmt(n, dec = 2) {
  return parseFloat(n.toFixed(dec)).toLocaleString('es-BO');
}

/**
 * Devuelve la clase de alerta según el nivel de criticidad.
 */
function nivelAlerta(porcentaje) {
  if (porcentaje <= 30) return 'alert-danger';
  if (porcentaje <= 60) return 'alert-warn';
  return 'alert-ok';
}

/* ===================================================
   ESCENARIO A — CARBURANTE
   =================================================== */
function calcularCarburante() {
  // Capturar y validar datos del formulario
  const reserva   = validar('c-reserva');
  const consumo   = validar('c-consumo');
  const reabasto  = validar('c-reabasto');
  const critico   = validar('c-critico');

  if (reserva === null || consumo === null || reabasto === null || critico === null) {
    mostrarAlertaError('result-carburante', 'Por favor completa todos los campos correctamente.');
    return;
  }
  if (consumo === 0) {
    mostrarAlertaError('result-carburante', 'El consumo diario no puede ser 0.');
    return;
  }

  // Calcular día a día hasta nivel crítico o agotamiento
  const DIAS_MAX = 365;
  let reservaActual = reserva;
  let diaCritico    = null;
  let diaAgotado    = null;
  const filas       = [];

  for (let dia = 1; dia <= DIAS_MAX; dia++) {
    reservaActual = reservaActual + reabasto - consumo;
    const estadoDia = reservaActual <= 0 ? 'Agotado' : reservaActual <= critico ? '⚠ Crítico' : 'Normal';
    filas.push({ dia, reserva: Math.max(reservaActual, 0), estado: estadoDia });

    if (diaAgotado === null && reservaActual <= 0) {
      diaAgotado = dia;
      break;
    }
    if (diaCritico === null && reservaActual <= critico) {
      diaCritico = dia;
    }
  }

  // Neto diario: si es negativo, la reserva se reduce; si positivo, crece
  const netoDiario   = reabasto - consumo;
  const diasTabla    = filas.slice(0, Math.min(10, filas.length));
  const porcentaje   = Math.min(100, Math.max(0, (reserva / (reserva + Math.abs(netoDiario) * 30)) * 100));

  // Construir HTML del resultado
  let alertaHtml = '';
  if (diaAgotado) {
    alertaHtml = `<div class="result-alert alert-danger">🚨 La reserva se AGOTA completamente en el día ${diaAgotado}.</div>`;
  } else if (diaCritico) {
    alertaHtml = `<div class="result-alert alert-warn">⚠️ La reserva llega al nivel crítico en el día ${diaCritico}.</div>`;
  } else {
    alertaHtml = `<div class="result-alert alert-ok">✅ El reabastecimiento supera al consumo. La reserva se mantiene estable.</div>`;
  }

  // Tabla de primeros 10 días
  const filasHtml = diasTabla.map(f => `
    <tr>
      <td>Día ${f.dia}</td>
      <td>${fmt(f.reserva, 0)} L</td>
      <td style="color: ${f.estado.includes('Agotado') ? 'var(--rojo)' : f.estado.includes('Crítico') ? 'var(--naranja)' : 'var(--verde)'}">${f.estado}</td>
    </tr>
  `).join('');

  const html = `
    <div class="result-title">⛽ Resultado — Carburante</div>
    <div class="result-metric"><span class="label">Reserva inicial</span><span class="value">${fmt(reserva, 0)} L</span></div>
    <div class="result-metric"><span class="label">Consumo neto diario</span><span class="value">${fmt(netoDiario, 0)} L/día</span></div>
    ${diaCritico ? `<div class="result-metric"><span class="label">Día nivel crítico</span><span class="value" style="color:var(--naranja)">Día ${diaCritico}</span></div>` : ''}
    ${diaAgotado ? `<div class="result-metric"><span class="label">Día de agotamiento</span><span class="value" style="color:var(--rojo)">Día ${diaAgotado}</span></div>` : ''}
    ${alertaHtml}
    <table class="result-table" style="margin-top:1rem">
      <thead><tr><th>Período</th><th>Reserva restante</th><th>Estado</th></tr></thead>
      <tbody>${filasHtml}</tbody>
    </table>
    <p style="font-size:0.75rem;color:var(--gris-texto);margin-top:0.5rem">Mostrando los primeros ${diasTabla.length} días de la simulación.</p>
  `;

  document.getElementById('result-carburante').innerHTML = html;
}

function limpiarCarburante() {
  ['c-reserva','c-consumo','c-reabasto','c-critico'].forEach(id => {
    document.getElementById(id).value = '';
  });
  resetResultado('result-carburante', '⛽');
}

/* ===================================================
   ESCENARIO B — PRECIOS DE ALIMENTOS
   =================================================== */
let contadorProducto = 0;

function inicializarProductos() {
  // Agregar 2 productos por defecto al inicio
  agregarProducto('Arroz', 8, 11, 10);
  agregarProducto('Papa',  7, 10, 8);
}

function agregarProducto(nombre='', precioAnt=0, precioAct=0, cantidad=0) {
  const id = ++contadorProducto;
  const lista = document.getElementById('productos-lista');
  const div = document.createElement('div');
  div.className = 'producto-row';
  div.id = `prod-${id}`;
  div.innerHTML = `
    <div class="form-group">
      <label>Producto</label>
      <input type="text" id="prod-nombre-${id}" value="${nombre}" placeholder="Ej: Arroz" />
    </div>
    <div class="form-group">
      <label>Precio ant. (Bs)</label>
      <input type="number" id="prod-ant-${id}" value="${precioAnt || ''}" placeholder="0" min="0" step="0.1" />
    </div>
    <div class="form-group">
      <label>Precio act. (Bs)</label>
      <input type="number" id="prod-act-${id}" value="${precioAct || ''}" placeholder="0" min="0" step="0.1" />
    </div>
    <div class="form-group">
      <label>Cant/semana</label>
      <input type="number" id="prod-cant-${id}" value="${cantidad || ''}" placeholder="0" min="0" />
    </div>
    <button class="btn-remove" onclick="eliminarElemento('prod-${id}')" title="Eliminar">✕</button>
  `;
  lista.appendChild(div);
}

function calcularPrecios() {
  const semanas = parseFloat(document.getElementById('p-semanas').value) || 4;
  const rows = document.querySelectorAll('#productos-lista .producto-row');

  if (rows.length === 0) {
    mostrarAlertaError('result-precios', 'Agrega al menos un producto.');
    return;
  }

  let totalAnterior = 0, totalActual = 0;
  const detalles = [];
  let hayError = false;

  rows.forEach(row => {
    const id = row.id.replace('prod-', '');
    const nombre   = document.getElementById(`prod-nombre-${id}`).value.trim() || 'Producto';
    const precioAnt = parseFloat(document.getElementById(`prod-ant-${id}`).value);
    const precioAct = parseFloat(document.getElementById(`prod-act-${id}`).value);
    const cantidad  = parseFloat(document.getElementById(`prod-cant-${id}`).value);

    if (isNaN(precioAnt) || isNaN(precioAct) || isNaN(cantidad) || cantidad < 0) {
      hayError = true;
      return;
    }

    // Calcular por semana y escalar a las semanas dadas
    const gastoAnt  = precioAnt * cantidad * semanas;
    const gastoAct  = precioAct * cantidad * semanas;
    const diferencia = gastoAct - gastoAnt;
    const porcAumento = precioAnt > 0 ? ((precioAct - precioAnt) / precioAnt) * 100 : 0;

    totalAnterior += gastoAnt;
    totalActual   += gastoAct;
    detalles.push({ nombre, precioAnt, precioAct, cantidad, gastoAnt, gastoAct, diferencia, porcAumento });
  });

  if (hayError) {
    mostrarAlertaError('result-precios', 'Verifica que todos los campos tengan valores válidos.');
    return;
  }

  const diferencia   = totalActual - totalAnterior;
  const porcTotal    = totalAnterior > 0 ? (diferencia / totalAnterior) * 100 : 0;
  const nivelImpacto = porcTotal > 30 ? 'ALTO' : porcTotal > 15 ? 'MODERADO' : 'BAJO';
  const claseAlerta  = porcTotal > 30 ? 'alert-danger' : porcTotal > 15 ? 'alert-warn' : 'alert-ok';

  const filasHtml = detalles.map(d => `
    <tr>
      <td>${d.nombre}</td>
      <td>${fmtBs(d.precioAnt)}</td>
      <td>${fmtBs(d.precioAct)}</td>
      <td style="color:${d.porcAumento>0?'var(--rojo)':'var(--verde)'}">+${d.porcAumento.toFixed(1)}%</td>
      <td>${fmtBs(d.gastoAnt)}</td>
      <td style="color:var(--naranja)">${fmtBs(d.gastoAct)}</td>
    </tr>
  `).join('');

  const html = `
    <div class="result-title">🍚 Resultado — Precios de Alimentos</div>
    <div class="result-metric"><span class="label">Período simulado</span><span class="value">${semanas} semanas</span></div>
    <div class="result-metric"><span class="label">Gasto anterior total</span><span class="value">${fmtBs(totalAnterior)}</span></div>
    <div class="result-metric"><span class="label">Gasto actual total</span><span class="value" style="color:var(--naranja)">${fmtBs(totalActual)}</span></div>
    <div class="result-metric"><span class="label">Diferencia de gasto</span><span class="value" style="color:var(--rojo)">+${fmtBs(diferencia)}</span></div>
    <div class="result-metric"><span class="label">Aumento promedio</span><span class="value" style="color:var(--rojo)">${porcTotal.toFixed(1)}%</span></div>
    <div class="result-alert ${claseAlerta}">📊 Nivel de impacto: <strong>${nivelImpacto}</strong> — La familia gasta ${fmtBs(diferencia)} más en ${semanas} semanas.</div>
    <table class="result-table" style="margin-top:1rem">
      <thead><tr><th>Producto</th><th>Ant.</th><th>Act.</th><th>Aumento</th><th>Gasto ant.</th><th>Gasto act.</th></tr></thead>
      <tbody>${filasHtml}</tbody>
    </table>
  `;

  document.getElementById('result-precios').innerHTML = html;
}

function limpiarPrecios() {
  document.getElementById('productos-lista').innerHTML = '';
  contadorProducto = 0;
  inicializarProductos();
  document.getElementById('p-semanas').value = '4';
  resetResultado('result-precios', '🍚');
}

/* ===================================================
   ESCENARIO C — TRANSPORTE
   =================================================== */
function calcularTransporte() {
  const distNormal = validar('t-dist-normal');
  const distDesvio = validar('t-dist-desvio');
  const costoPorKm = validar('t-costo-km');
  const viajes     = validar('t-viajes');

  if (distNormal === null || distDesvio === null || costoPorKm === null || viajes === null) {
    mostrarAlertaError('result-transporte', 'Por favor completa todos los campos correctamente.');
    return;
  }

  // Cálculos del simulador de transporte
  const costoNormal      = distNormal * costoPorKm * viajes;
  const costoDesvio      = distDesvio * costoPorKm * viajes;
  const diferenciaSem    = costoDesvio - costoNormal;
  const diferenciaMes    = diferenciaSem * 4;
  const diferenciaTrimestre = diferenciaSem * 12;
  const kmExtra          = distDesvio - distNormal;
  const porcAumento      = distNormal > 0 ? (kmExtra / distNormal) * 100 : 0;
  const claseAlerta      = porcAumento > 50 ? 'alert-danger' : porcAumento > 25 ? 'alert-warn' : 'alert-ok';

  // Barra de progreso para visualizar el aumento
  const porcBarra = Math.min(100, porcAumento);

  const html = `
    <div class="result-title">🚌 Resultado — Transporte</div>
    <div class="result-metric"><span class="label">Distancia extra por viaje</span><span class="value">+${fmt(kmExtra, 1)} km</span></div>
    <div class="result-metric"><span class="label">Aumento de distancia</span><span class="value" style="color:var(--naranja)">+${porcAumento.toFixed(1)}%</span></div>
    <div class="result-metric"><span class="label">Costo semanal normal</span><span class="value">${fmtBs(costoNormal)}</span></div>
    <div class="result-metric"><span class="label">Costo semanal con desvío</span><span class="value" style="color:var(--naranja)">${fmtBs(costoDesvio)}</span></div>
    <div class="result-metric"><span class="label">Gasto extra / semana</span><span class="value" style="color:var(--rojo)">+${fmtBs(diferenciaSem)}</span></div>
    <div class="result-metric"><span class="label">Gasto extra / mes</span><span class="value" style="color:var(--rojo)">+${fmtBs(diferenciaMes)}</span></div>
    <div class="result-metric"><span class="label">Gasto extra / trimestre</span><span class="value" style="color:var(--rojo)">+${fmtBs(diferenciaTrimestre)}</span></div>
    <div class="progress-wrap">
      <div class="progress-label"><span>Impacto del desvío</span><span>${porcAumento.toFixed(1)}%</span></div>
      <div class="progress-bar">
        <div class="progress-fill ${porcAumento>50?'fill-danger':porcAumento>25?'fill-warn':'fill-ok'}" style="width:${porcBarra}%"></div>
      </div>
    </div>
    <div class="result-alert ${claseAlerta}">🛣️ El desvío representa un <strong>aumento del ${porcAumento.toFixed(1)}%</strong> en el costo de transporte.</div>
  `;

  document.getElementById('result-transporte').innerHTML = html;
}

function limpiarTransporte() {
  ['t-dist-normal','t-dist-desvio','t-costo-km','t-viajes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  resetResultado('result-transporte', '🚌');
}

/* ===================================================
   ESCENARIO D — COMPRAS FAMILIARES
   =================================================== */
let contadorItem = 0;

function inicializarItems() {
  // Productos de ejemplo basados en el caso de estudio
  agregarItem('Arroz', 11, 5);
  agregarItem('Papa', 10, 4);
  agregarItem('Aceite', 18, 2);
}

function agregarItem(nombre='', precio=0, cantidad=1) {
  const id = ++contadorItem;
  const lista = document.getElementById('items-lista');
  const div = document.createElement('div');
  div.className = 'item-row';
  div.id = `item-${id}`;
  div.innerHTML = `
    <div class="form-group">
      <label>Producto</label>
      <input type="text" id="item-nombre-${id}" value="${nombre}" placeholder="Ej: Pan" />
    </div>
    <div class="form-group">
      <label>Precio (Bs)</label>
      <input type="number" id="item-precio-${id}" value="${precio||''}" placeholder="0.00" min="0" step="0.1" />
    </div>
    <div class="form-group">
      <label>Cantidad</label>
      <input type="number" id="item-cant-${id}" value="${cantidad||1}" placeholder="1" min="1" />
    </div>
    <div></div>
    <button class="btn-remove" onclick="eliminarElemento('item-${id}')" title="Eliminar">✕</button>
  `;
  lista.appendChild(div);
}

function calcularCompras() {
  const presupuesto = validar('comp-presupuesto');
  if (presupuesto === null) {
    mostrarAlertaError('result-compras', 'Ingresa el presupuesto disponible.');
    return;
  }

  const rows = document.querySelectorAll('#items-lista .item-row');
  if (rows.length === 0) {
    mostrarAlertaError('result-compras', 'Agrega al menos un ítem a la lista de compras.');
    return;
  }

  let total = 0;
  const detalles = [];
  let hayError = false;

  rows.forEach(row => {
    const id = row.id.replace('item-', '');
    const nombre   = document.getElementById(`item-nombre-${id}`).value.trim() || 'Producto';
    const precio   = parseFloat(document.getElementById(`item-precio-${id}`).value);
    const cantidad = parseFloat(document.getElementById(`item-cant-${id}`).value);

    if (isNaN(precio) || isNaN(cantidad) || precio < 0 || cantidad < 0) {
      hayError = true;
      return;
    }
    const subtotal = precio * cantidad;
    total += subtotal;
    detalles.push({ nombre, precio, cantidad, subtotal });
  });

  if (hayError) {
    mostrarAlertaError('result-compras', 'Verifica que todos los campos tengan valores válidos.');
    return;
  }

  const saldo    = presupuesto - total;
  const alcanza  = saldo >= 0;
  const porcUso  = Math.min(100, (total / presupuesto) * 100);
  const nivel    = porcUso < 70 ? 'BAJO' : porcUso < 90 ? 'MODERADO' : 'ALTO';
  const claseBarra = porcUso > 100 ? 'fill-danger' : porcUso > 85 ? 'fill-warn' : 'fill-ok';

  const filasHtml = detalles.map(d => `
    <tr>
      <td>${d.nombre}</td>
      <td>${fmtBs(d.precio)}</td>
      <td>${fmt(d.cantidad, 0)}</td>
      <td>${fmtBs(d.subtotal)}</td>
    </tr>
  `).join('');

  const alertaHtml = alcanza
    ? `<div class="result-alert alert-ok">✅ El presupuesto ALCANZA. Te sobran <strong>${fmtBs(saldo)}</strong>.</div>`
    : `<div class="result-alert alert-danger">❌ El presupuesto NO ALCANZA. Faltan <strong>${fmtBs(Math.abs(saldo))}</strong>.</div>`;

  const html = `
    <div class="result-title">🛒 Resultado — Compras</div>
    <div class="result-metric"><span class="label">Presupuesto disponible</span><span class="value">${fmtBs(presupuesto)}</span></div>
    <div class="result-metric"><span class="label">Total de compra</span><span class="value" style="color:${alcanza?'var(--verde)':'var(--rojo)'}">${fmtBs(total)}</span></div>
    <div class="result-metric"><span class="label">Saldo ${alcanza?'restante':'faltante'}</span><span class="value" style="color:${alcanza?'var(--verde)':'var(--rojo)'}">${alcanza?'+':''}${fmtBs(saldo)}</span></div>
    <div class="result-metric"><span class="label">Nivel de gasto</span><span class="value">${nivel} (${porcUso.toFixed(1)}%)</span></div>
    <div class="progress-wrap">
      <div class="progress-label"><span>Uso del presupuesto</span><span>${porcUso.toFixed(1)}%</span></div>
      <div class="progress-bar">
        <div class="progress-fill ${claseBarra}" style="width:${Math.min(porcUso,100)}%"></div>
      </div>
    </div>
    ${alertaHtml}
    <table class="result-table" style="margin-top:1rem">
      <thead><tr><th>Producto</th><th>Precio</th><th>Cant.</th><th>Subtotal</th></tr></thead>
      <tbody>${filasHtml}</tbody>
      <tfoot><tr class="total-row"><td colspan="3">TOTAL</td><td>${fmtBs(total)}</td></tr></tfoot>
    </table>
  `;

  document.getElementById('result-compras').innerHTML = html;
}

function limpiarCompras() {
  document.getElementById('items-lista').innerHTML = '';
  document.getElementById('comp-presupuesto').value = '';
  contadorItem = 0;
  inicializarItems();
  resetResultado('result-compras', '🛒');
}

/* ===================================================
   ESCENARIO E — ESCASEZ / COMPRAS POR PÁNICO
   =================================================== */
function calcularEscasez() {
  const demandaNormal = validar('e-demanda');
  const aumento       = validar('e-aumento');
  const stock         = validar('e-stock');
  const familias      = validar('e-familias');

  if (demandaNormal === null || aumento === null || stock === null || familias === null) {
    mostrarAlertaError('result-escasez', 'Por favor completa todos los campos correctamente.');
    return;
  }

  // Modelo matemático: Nueva demanda = demanda + demanda × (porcentaje / 100)
  const nuevaDemanda      = demandaNormal + demandaNormal * (aumento / 100);
  const diferenciaDemanda = nuevaDemanda - demandaNormal;
  const stockRestante     = stock - nuevaDemanda;
  const alcanzaStock      = stockRestante >= 0;
  const unidadesPorFam    = nuevaDemanda / familias;
  const porcConsumo       = Math.min(100, (nuevaDemanda / stock) * 100);

  const alertaHtml = alcanzaStock
    ? `<div class="result-alert alert-ok">✅ El stock es SUFICIENTE. Quedan <strong>${fmt(stockRestante, 0)} unidades</strong> tras la demanda aumentada.</div>`
    : `<div class="result-alert alert-danger">🚨 DESABASTECIMIENTO. El stock NO alcanza. Faltan <strong>${fmt(Math.abs(stockRestante), 0)} unidades</strong>.</div>`;

  const claseBarra = porcConsumo > 100 ? 'fill-danger' : porcConsumo > 80 ? 'fill-warn' : 'fill-ok';

  const html = `
    <div class="result-title">📢 Resultado — Escasez</div>
    <div class="result-metric"><span class="label">Demanda normal</span><span class="value">${fmt(demandaNormal, 0)} unidades</span></div>
    <div class="result-metric"><span class="label">Aumento por pánico</span><span class="value" style="color:var(--naranja)">+${aumento}%</span></div>
    <div class="result-metric"><span class="label">Nueva demanda total</span><span class="value" style="color:var(--rojo)">${fmt(nuevaDemanda, 0)} unidades</span></div>
    <div class="result-metric"><span class="label">Demanda adicional</span><span class="value">+${fmt(diferenciaDemanda, 0)} unidades</span></div>
    <div class="result-metric"><span class="label">Stock disponible</span><span class="value">${fmt(stock, 0)} unidades</span></div>
    <div class="result-metric"><span class="label">Stock ${alcanzaStock?'restante':'faltante'}</span><span class="value" style="color:${alcanzaStock?'var(--verde)':'var(--rojo)'}">${alcanzaStock?'+':''}${fmt(stockRestante, 0)} unidades</span></div>
    <div class="result-metric"><span class="label">Unidades por familia</span><span class="value">${fmt(unidadesPorFam, 1)} u/familia</span></div>
    <div class="progress-wrap">
      <div class="progress-label"><span>Presión sobre el stock</span><span>${porcConsumo.toFixed(1)}%</span></div>
      <div class="progress-bar">
        <div class="progress-fill ${claseBarra}" style="width:${Math.min(porcConsumo,100)}%"></div>
      </div>
    </div>
    ${alertaHtml}
  `;

  document.getElementById('result-escasez').innerHTML = html;
}

function limpiarEscasez() {
  ['e-demanda','e-aumento','e-stock','e-familias'].forEach(id => {
    document.getElementById(id).value = '';
  });
  resetResultado('result-escasez', '📢');
}

/* ===================================================
   ESCENARIO F — PODER ADQUISITIVO
   =================================================== */
let contadorPA = 0;

function inicializarProductosPA() {
  // Sin productos por defecto — el usuario los agrega
}

function agregarProductoPA(nombre='', precioAnt=0, precioAct=0) {
  const id = ++contadorPA;
  const lista = document.getElementById('productos-pa-lista');
  const div = document.createElement('div');
  div.className = 'producto-pa-row';
  div.id = `pa-${id}`;
  div.innerHTML = `
    <div class="form-group">
      <label>Producto básico</label>
      <input type="text" id="pa-nombre-${id}" value="${nombre}" placeholder="Ej: Aceite" />
    </div>
    <div class="form-group">
      <label>Precio anterior (Bs)</label>
      <input type="number" id="pa-ant-${id}" value="${precioAnt||''}" placeholder="0" min="0" step="0.1" />
    </div>
    <div class="form-group">
      <label>Precio actual (Bs)</label>
      <input type="number" id="pa-act-${id}" value="${precioAct||''}" placeholder="0" min="0" step="0.1" />
    </div>
    <div></div>
    <button class="btn-remove" onclick="eliminarElemento('pa-${id}')" title="Eliminar">✕</button>
  `;
  lista.appendChild(div);
}

function calcularPoderAdquisitivo() {
  const ingreso  = validar('pa-ingreso');
  const gastoAnt = validar('pa-gasto-ant');
  const gastoAct = validar('pa-gasto-act');

  if (ingreso === null || gastoAnt === null || gastoAct === null) {
    mostrarAlertaError('result-poder', 'Por favor completa todos los campos principales.');
    return;
  }

  // Cálculos principales de poder adquisitivo
  const aumentoGasto       = gastoAct - gastoAnt;
  const saldoAnterior      = ingreso - gastoAnt;
  const saldoActual        = ingreso - gastoAct;
  const porcPerdida        = gastoAnt > 0 ? (aumentoGasto / gastoAnt) * 100 : 0;
  const porcGastoActual    = ingreso > 0 ? (gastoAct / ingreso) * 100 : 0;
  const nivelAfectacion    = porcPerdida > 30 ? 'GRAVE' : porcPerdida > 15 ? 'MODERADA' : 'LEVE';
  const claseAfectacion    = porcPerdida > 30 ? 'alert-danger' : porcPerdida > 15 ? 'alert-warn' : 'alert-ok';

  // Análisis de productos básicos (opcional)
  const rowsPA = document.querySelectorAll('#productos-pa-lista .producto-pa-row');
  let tablaProductos = '';
  if (rowsPA.length > 0) {
    const filasPA = [];
    rowsPA.forEach(row => {
      const id = row.id.replace('pa-', '');
      const nombre   = document.getElementById(`pa-nombre-${id}`).value.trim() || 'Producto';
      const pAnt     = parseFloat(document.getElementById(`pa-ant-${id}`).value);
      const pAct     = parseFloat(document.getElementById(`pa-act-${id}`).value);
      if (!isNaN(pAnt) && !isNaN(pAct)) {
        const cantAnt = ingreso > 0 ? saldoAnterior / pAnt : 0;
        const cantAct = ingreso > 0 ? saldoActual / pAct : 0;
        filasPA.push({ nombre, pAnt, pAct, cantAnt: Math.max(0, cantAnt), cantAct: Math.max(0, cantAct) });
      }
    });

    if (filasPA.length > 0) {
      const filasHtml = filasPA.map(f => `
        <tr>
          <td>${f.nombre}</td>
          <td>${fmtBs(f.pAnt)}</td>
          <td>${fmtBs(f.pAct)}</td>
          <td>${fmt(f.cantAnt, 1)}</td>
          <td style="color:${f.cantAct<f.cantAnt?'var(--rojo)':'var(--verde)'}">${fmt(f.cantAct, 1)}</td>
        </tr>
      `).join('');
      tablaProductos = `
        <p style="font-size:0.8rem;color:var(--gris-texto);margin-top:1rem">Unidades que se podían comprar con el saldo disponible:</p>
        <table class="result-table" style="margin-top:0.4rem">
          <thead><tr><th>Producto</th><th>P. ant.</th><th>P. act.</th><th>Cant. antes</th><th>Cant. ahora</th></tr></thead>
          <tbody>${filasHtml}</tbody>
        </table>
      `;
    }
  }

  const html = `
    <div class="result-title">💰 Resultado — Poder Adquisitivo</div>
    <div class="result-metric"><span class="label">Ingreso familiar mensual</span><span class="value">${fmtBs(ingreso)}</span></div>
    <div class="result-metric"><span class="label">Gasto anterior</span><span class="value">${fmtBs(gastoAnt)}</span></div>
    <div class="result-metric"><span class="label">Gasto actual</span><span class="value" style="color:var(--naranja)">${fmtBs(gastoAct)}</span></div>
    <div class="result-metric"><span class="label">Aumento del gasto</span><span class="value" style="color:var(--rojo)">+${fmtBs(aumentoGasto)}</span></div>
    <div class="result-metric"><span class="label">Saldo anterior (ahorro)</span><span class="value">${fmtBs(saldoAnterior)}</span></div>
    <div class="result-metric"><span class="label">Saldo actual (ahorro)</span><span class="value" style="color:${saldoActual>=0?'var(--verde)':'var(--rojo)'}">${fmtBs(saldoActual)}</span></div>
    <div class="result-metric"><span class="label">Pérdida de poder adquisitivo</span><span class="value" style="color:var(--rojo)">-${porcPerdida.toFixed(1)}%</span></div>
    <div class="progress-wrap">
      <div class="progress-label"><span>Gasto sobre ingreso</span><span>${porcGastoActual.toFixed(1)}%</span></div>
      <div class="progress-bar">
        <div class="progress-fill ${porcGastoActual>90?'fill-danger':porcGastoActual>70?'fill-warn':'fill-ok'}" style="width:${Math.min(porcGastoActual,100)}%"></div>
      </div>
    </div>
    <div class="result-alert ${claseAfectacion}">📉 Nivel de afectación: <strong>${nivelAfectacion}</strong> — La familia perdió el ${porcPerdida.toFixed(1)}% de su capacidad de compra.</div>
    ${tablaProductos}
  `;

  document.getElementById('result-poder').innerHTML = html;
}

function limpiarPoderAdquisitivo() {
  ['pa-ingreso','pa-gasto-ant','pa-gasto-act'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('productos-pa-lista').innerHTML = '';
  contadorPA = 0;
  resetResultado('result-poder', '💰');
}

/* ===================================================
   CASOS DE ESTUDIO — CARGA AUTOMÁTICA
   =================================================== */

/** Caso 1: Reserva de carburante */
function cargarCaso1() {
  activarTab('carburante');
  document.getElementById('c-reserva').value   = 10000;
  document.getElementById('c-consumo').value   = 1200;
  document.getElementById('c-reabasto').value  = 300;
  document.getElementById('c-critico').value   = 2000;
  window.scrollTo({ top: document.getElementById('simuladores').offsetTop - 80, behavior: 'smooth' });
  setTimeout(calcularCarburante, 400);
}

/** Caso 2: Aumento de precios */
function cargarCaso2() {
  activarTab('precios');
  document.getElementById('productos-lista').innerHTML = '';
  contadorProducto = 0;
  agregarProducto('Arroz', 8, 11, 10);
  agregarProducto('Papa',  7, 10, 8);
  agregarProducto('Aceite',12, 18, 4);
  document.getElementById('p-semanas').value = 4;
  window.scrollTo({ top: document.getElementById('simuladores').offsetTop - 80, behavior: 'smooth' });
  setTimeout(calcularPrecios, 400);
}

/** Caso 3: Transporte con desvío */
function cargarCaso3() {
  activarTab('transporte');
  document.getElementById('t-dist-normal').value = 10;
  document.getElementById('t-dist-desvio').value = 16;
  document.getElementById('t-costo-km').value    = 2;
  document.getElementById('t-viajes').value      = 5;
  window.scrollTo({ top: document.getElementById('simuladores').offsetTop - 80, behavior: 'smooth' });
  setTimeout(calcularTransporte, 400);
}

/** Caso 4: Presupuesto familiar */
function cargarCaso4() {
  activarTab('compras');
  document.getElementById('comp-presupuesto').value = 500;
  document.getElementById('items-lista').innerHTML = '';
  contadorItem = 0;
  // Cargamos ítems que sumen 580 Bs
  agregarItem('Arroz',  11, 10);
  agregarItem('Papa',   10, 8);
  agregarItem('Aceite', 18, 4);
  agregarItem('Azúcar', 12, 5);
  agregarItem('Fideo',  8,  6);
  window.scrollTo({ top: document.getElementById('simuladores').offsetTop - 80, behavior: 'smooth' });
  setTimeout(calcularCompras, 400);
}

/** Caso 5: Rumor de escasez */
function cargarCaso5() {
  activarTab('escasez');
  document.getElementById('e-demanda').value   = 100;
  document.getElementById('e-aumento').value   = 40;
  document.getElementById('e-stock').value     = 120;
  document.getElementById('e-familias').value  = 50;
  window.scrollTo({ top: document.getElementById('simuladores').offsetTop - 80, behavior: 'smooth' });
  setTimeout(calcularEscasez, 400);
}

/* ===================================================
   UTILIDADES AUXILIARES
   =================================================== */

/** Activa una pestaña por nombre */
function activarTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.sim-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabName}`);
  });
}

/** Elimina un elemento dinámico de la lista */
function eliminarElemento(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/** Muestra error en la caja de resultados */
function mostrarAlertaError(resultId, mensaje) {
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:200px;gap:1rem;text-align:center">
      <span style="font-size:2.5rem">⚠️</span>
      <div class="result-alert alert-warn" style="width:100%">${mensaje}</div>
    </div>
  `;
  document.getElementById(resultId).innerHTML = html;
}

/** Resetea la caja de resultados al estado inicial */
function resetResultado(resultId, emoji) {
  document.getElementById(resultId).innerHTML = `
    <div class="result-placeholder">
      <span>${emoji}</span>
      <p>Ingresa los datos y presiona <strong>Calcular</strong></p>
    </div>
  `;
}
