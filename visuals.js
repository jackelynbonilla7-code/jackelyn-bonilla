/* =====================================================================
   visuals.js · gráfico simulado “en vivo” de la ventana Trading (datos inventados, solo ilustrativo)
   ===================================================================== */
(function () {
  'use strict';
  const { $ } = window.JB;
  // Reloj de la ventana Habilidades: marcas de las horas
  const ticks = $('#clkTicks');
  if (ticks) for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r1 = 116, r2 = i % 3 === 0 ? 104 : 109; const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l.setAttribute('x1', 160 + Math.cos(a) * r1); l.setAttribute('y1', 160 + Math.sin(a) * r1); l.setAttribute('x2', 160 + Math.cos(a) * r2); l.setAttribute('y2', 160 + Math.sin(a) * r2); ticks.appendChild(l); }
  const svg = $('#liveChart'); if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg', N = 22;
  let price = 50, candles = [], timer = 0;
  const mk = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  function next() { const o = price, c = o + (Math.random() - .46) * 9; price = Math.max(14, Math.min(76, c)); return { o, c: price, h: Math.max(o, price) + Math.random() * 4, l: Math.min(o, price) - Math.random() * 4 }; }
  for (let i = 0; i < N; i++) candles.push(next());
  function draw() {
    svg.replaceChildren(); const bw = 220 / N, y = v => 84 - v;
    candles.forEach((c, i) => { const x = i * bw + bw / 2, col = c.c >= c.o ? '#34d399' : '#fb7185'; mk('line', { x1: x, x2: x, y1: y(c.h), y2: y(c.l), stroke: col, 'stroke-width': 1 }, svg); mk('rect', { x: x - bw * .3, y: y(Math.max(c.o, c.c)), width: bw * .6, height: Math.max(1.2, Math.abs(c.o - c.c)), fill: col, rx: .6 }, svg); });
    const last = candles[candles.length - 1]; mk('line', { x1: 0, x2: 220, y1: y(last.c), y2: y(last.c), stroke: '#c4b5fd', 'stroke-dasharray': '2 3', opacity: .7 }, svg);
  }
  draw();
  function run() { clearInterval(timer); if (window.JB.lite || window.JB.reduced || document.hidden) return; timer = setInterval(() => { if (window.JB.view !== 'trading') return; candles.shift(); candles.push(next()); draw(); }, 1100); }
  window.addEventListener('jb:fx', run); document.addEventListener('visibilitychange', run); run();
})();
