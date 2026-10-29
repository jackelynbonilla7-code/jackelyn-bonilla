/* =====================================================================
   trading-ia.js · ventana «Trading con IA»
   Gráfico SIMULADO (datos de ejemplo generados aquí, no son del mercado) con capas que muestran
   cómo una herramienta de IA ayuda a leer un gráfico. Es material educativo, no una señal.
   ===================================================================== */
(function () {
  'use strict';
  const { $, $$ } = window.JB;
  const svg = $('#iaChart'); if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg', W = 640, H = 320, N = 38, L = 18, R = 622, T = 22, B = 296;
  const mk = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
  // datos de ejemplo con semilla fija (siempre el mismo dibujo)
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const data = []; let px = 100;
  for (let i = 0; i < N; i++) {
    const o = px, drift = Math.sin(i / 5) * 1.4 + .55, c = o + drift + (rnd() - .5) * 4.2, hi = Math.max(o, c) + rnd() * 2.2, lo = Math.min(o, c) - rnd() * 2.2;
    data.push({ o, c, hi, lo }); px = c;
  }
  const min = Math.min(...data.map(d => d.lo)) - 3, max = Math.max(...data.map(d => d.hi)) + 9;
  const y = v => B - (v - min) / (max - min) * (B - T), step = (R - 120 - L) / N, x = i => L + step * (i + .5);

  mk('g', { class: 'iax-grid' }, svg);
  const grid = svg.lastChild; for (let k = 0; k <= 4; k++) mk('line', { x1: L, x2: R, y1: T + (B - T) * k / 4, y2: T + (B - T) * k / 4 }, grid);
  const gc = mk('g', { class: 'iax-candles' }, svg);
  data.forEach((d, i) => {
    const g = mk('g', { class: d.c >= d.o ? 'cu' : 'cd', style: '--i:' + i }, gc);
    mk('line', { x1: x(i), x2: x(i), y1: y(d.hi), y2: y(d.lo) }, g);
    mk('rect', { x: x(i) - step * .3, y: y(Math.max(d.o, d.c)), width: step * .6, height: Math.max(2, Math.abs(y(d.o) - y(d.c))) }, g);
  });
  // capas de la IA
  const layers = {};
  const hi = Math.max(...data.map(d => d.hi)), lo = Math.min(...data.map(d => d.lo)), last = data[N - 1];
  // 1) tendencia (regresión simple sobre los cierres)
  { const g = mk('g', { class: 'iax-layer', 'data-l': 'tendencia' }, svg); let sx = 0, sy = 0, sxy = 0, sxx = 0; data.forEach((d, i) => { sx += i; sy += d.c; sxy += i * d.c; sxx += i * i; });
    const m = (N * sxy - sx * sy) / (N * sxx - sx * sx), b = (sy - m * sx) / N;
    mk('line', { class: 'iax-trend', x1: x(0), y1: y(b), x2: R - 6, y2: y(b + m * (N + 10)) }, g);
    const t = mk('text', { x: R - 8, y: y(b + m * (N + 10)) - 12, 'text-anchor': 'end' }, g); t.textContent = 'Tendencia alcista (ejemplo)'; layers.tendencia = g; }
  // 2) soporte / resistencia
  { const g = mk('g', { class: 'iax-layer', 'data-l': 'niveles' }, svg); const rs = hi - 1, su = lo + 3;
    mk('line', { class: 'iax-lvl', x1: L, x2: R, y1: y(rs), y2: y(rs) }, g); mk('line', { class: 'iax-lvl', x1: L, x2: R, y1: y(su), y2: y(su) }, g);
    const a = mk('text', { x: L + 6, y: y(rs) - 6 }, g); a.textContent = 'Resistencia'; const b2 = mk('text', { x: L + 6, y: y(su) + 14 }, g); b2.textContent = 'Soporte'; layers.niveles = g; }
  // 3) escenarios
  { const g = mk('g', { class: 'iax-layer', 'data-l': 'escenarios' }, svg), x0 = x(N - 1), y0 = y(last.c);
    mk('path', { class: 'iax-sc up', d: 'M' + x0 + ' ' + y0 + ' C' + (x0 + 24) + ' ' + (y0 - 8) + ',' + (x0 + 36) + ' ' + (y0 - 30) + ',' + (R - 4) + ' ' + (y0 - 44) }, g);
    mk('path', { class: 'iax-sc dn', d: 'M' + x0 + ' ' + y0 + ' C' + (x0 + 22) + ' ' + (y0 + 6) + ',' + (x0 + 36) + ' ' + (y0 + 26) + ',' + (R - 4) + ' ' + (y0 + 40) }, g);
    const a = mk('text', { x: R - 8, y: y0 - 52, 'text-anchor': 'end' }, g); a.textContent = 'Escenario A'; const b3 = mk('text', { x: R - 8, y: y0 + 58, 'text-anchor': 'end' }, g); b3.textContent = 'Escenario B'; layers.escenarios = g; }
  // 4) riesgo
  { const g = mk('g', { class: 'iax-layer', 'data-l': 'riesgo' }, svg), e = last.c, st = e - 5.5, tp = e + 11, xs = x(N - 1) + 14, w = R - xs;
    mk('rect', { class: 'iax-zr', x: xs, y: y(e), width: w, height: y(st) - y(e) }, g); mk('rect', { class: 'iax-zg', x: xs, y: y(tp), width: w, height: y(e) - y(tp) }, g);
    mk('line', { class: 'iax-lvl', x1: xs, x2: R, y1: y(e), y2: y(e) }, g);
    const a = mk('text', { x: R - 8, y: y(st) - 6, 'text-anchor': 'end' }, g); a.textContent = 'Riesgo: 1'; const b4 = mk('text', { x: R - 8, y: y(tp) + 15, 'text-anchor': 'end' }, g); b4.textContent = 'Objetivo: 2'; layers.riesgo = g; }

  const TEXT = {
    tendencia: ['Tendencia', 'La IA ordena los precios y marca hacia dónde se inclina el gráfico. Es una descripción de lo que ya pasó, no una promesa de lo que pasará.'],
    niveles: ['Soportes y resistencias', 'Detecta zonas donde el precio ha rebotado antes. Sirven para planear dónde esperar y dónde cuidarte.'],
    escenarios: ['Escenarios', 'En vez de adivinar, plantea caminos posibles (A y B). Tú decides qué hacer con cada uno y cuál es tu límite.'],
    riesgo: ['Riesgo', 'Ayuda a calcular cuánto estás dispuesta a perder y cuánto buscas ganar antes de entrar. El riesgo siempre va primero.']
  };
  const tabs = $$('.iax-tabs button'), tt = $('#iaTitle'), tx = $('#iaText');
  function pick(id, animate) {
    tabs.forEach(t => { const on = t.dataset.l === id; t.setAttribute('aria-pressed', on); });
    Object.keys(layers).forEach(k => layers[k].classList.toggle('on', k === id));
    tt.textContent = TEXT[id][0]; tx.textContent = TEXT[id][1];
    if (animate !== false) { const g = layers[id]; g.classList.remove('draw'); void g.getBoundingClientRect(); g.classList.add('draw'); }
  }
  tabs.forEach(t => t.addEventListener('click', () => pick(t.dataset.l)));
  pick('tendencia', false); layers.tendencia.classList.add('draw');
})();
