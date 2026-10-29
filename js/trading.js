/* =====================================================================
   trading.js · sección educativa de trading (todo con datos SIMULADOS)
   ===================================================================== */
(function () {
  'use strict';
  const { $, $$ } = window.JB;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (n, a, p, t) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; p && p.appendChild(e); return e; };
  const rng = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const GREEN = '#34d399', RED = '#fb7185';

  /* ---------- Pestañas accesibles ---------- */
  const tabs = $$('#tradeTabs .tab'), panels = tabs.map(t => $('#' + t.getAttribute('aria-controls')));
  function select(i, focus) {
    tabs.forEach((t, k) => { const on = k === i; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; panels[k].hidden = !on; });
    if (focus) tabs[i].focus();
    const p = panels[i]; p.style.animation = 'none'; void p.offsetWidth; p.style.animation = '';
    if (window.innerWidth <= 900) tabs[i].scrollIntoView({ inline: 'center', block: 'nearest', behavior: window.JB.reduced ? 'auto' : 'smooth' });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', e => {
      const k = e.key; let n = null;
      if (k === 'ArrowDown' || k === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (k === 'ArrowUp' || k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      else if (k === 'Home') n = 0; else if (k === 'End') n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); select(n, true); }
    });
  });

  /* ---------- Tarjetas que giran (una a la vez, vuelven solas a su estado normal) ---------- */
  const unflipAll = (root, except) => $$('.flip[aria-pressed="true"]', root || document).forEach(f => { if (f !== except) { f.setAttribute('aria-pressed', 'false'); clearTimeout(f._t); } });
  $$('[data-flips]').forEach(box => {
    JSON.parse(box.dataset.flips).forEach(([a, b]) => {
      const f = document.createElement('button'); f.type = 'button'; f.className = 'flip'; f.setAttribute('aria-pressed', 'false');
      f.innerHTML = '<span class="flip-in"><span class="flip-f"><strong></strong><em class="flip-btn">Ver más <i>↻</i></em></span><span class="flip-b"><span class="fb-text"></span><em class="flip-btn alt">Volver <i>↺</i></em></span></span>';
      f.querySelector('strong').textContent = a; f.querySelector('.fb-text').textContent = b;
      f.addEventListener('click', () => {
        const on = f.getAttribute('aria-pressed') === 'true'; clearTimeout(f._t);
        if (on) { f.setAttribute('aria-pressed', 'false'); return; }
        unflipAll(box, f); f.setAttribute('aria-pressed', 'true');
        f._t = setTimeout(() => f.setAttribute('aria-pressed', 'false'), 7000);
      });
      box.appendChild(f);
    });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.flip')) unflipAll(); });
  tabs.forEach(t => t.addEventListener('click', () => unflipAll()));

  /* ---------- Datos simulados ---------- */
  function gen(seed, n, o) {
    const r = rng(seed); let p = o.start || 100; const out = [];
    for (let i = 0; i < n; i++) {
      let c;
      if (o.mode === 'range') c = o.center + Math.sin(i / o.period * Math.PI * 2) * o.amp + (r() - .5) * o.vol * 1.2;
      else c = p + o.drift + (r() - .5) * o.vol * 2;
      const op = p, hi = Math.max(op, c) + r() * o.vol * .8, lo = Math.min(op, c) - r() * o.vol * .8;
      out.push({ o: op, h: hi, l: lo, c }); p = c;
    }
    return out;
  }
  function frame(svg, data, W, H, pad) {
    const hi = Math.max(...data.map(d => d.h)), lo = Math.min(...data.map(d => d.l)), m = (hi - lo) * .08;
    const y = v => pad.t + (1 - (v - (lo - m)) / (hi - lo + 2 * m)) * (H - pad.t - pad.b);
    const x = i => pad.l + (i + .5) * ((W - pad.l - pad.r) / data.length);
    for (let g = 0; g <= 4; g++) {
      const v = lo - m + (hi - lo + 2 * m) * g / 4, yy = y(v);
      el('line', { x1: pad.l, x2: W - pad.r, y1: yy, y2: yy, stroke: 'rgba(167,139,250,.12)' }, svg);
      el('text', { x: W - pad.r + 6, y: yy + 4, fill: '#8f82b3', 'font-size': 11 }, svg, v.toFixed(2));
    }
    return { x, y, hi, lo, bw: Math.max(3, ((W - pad.l - pad.r) / data.length) * .62) };
  }

  /* ---------- 3) Gráfico de precios ---------- */
  const pc = $('#priceChart'); let ptype = 'candles', ptf = 'H1';
  const tfInfo = { M15: [11, 44, 'Cada vela = 15 minutos: mucho detalle y más “ruido”.'], H1: [27, 40, 'Cada vela = 1 hora: equilibrio entre detalle y claridad.'], D1: [52, 32, 'Cada vela = 1 día: muestra la tendencia de fondo.'] };
  function drawPrice() {
    pc.innerHTML = ''; const [seed, n, cap] = tfInfo[ptf];
    const data = gen(seed, n, { start: 1.0800, drift: .0003, vol: ptf === 'D1' ? .0045 : ptf === 'H1' ? .0028 : .0016 });
    const f = frame(pc, data, 640, 300, { l: 12, r: 52, t: 14, b: 24 });
    if (ptype === 'line') {
      const d = data.map((c, i) => (i ? 'L' : 'M') + f.x(i).toFixed(1) + ' ' + f.y(c.c).toFixed(1)).join('');
      el('path', { d: d + 'L' + f.x(data.length - 1) + ' 276 L' + f.x(0) + ' 276Z', fill: 'rgba(139,92,246,.18)' }, pc);
      el('path', { d, fill: 'none', stroke: '#c4b5fd', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, pc);
    } else data.forEach((c, i) => {
      const col = c.c >= c.o ? GREEN : RED, xx = f.x(i);
      if (ptype === 'candles') {
        el('line', { x1: xx, x2: xx, y1: f.y(c.h), y2: f.y(c.l), stroke: col, 'stroke-width': 1.4 }, pc);
        el('rect', { x: xx - f.bw / 2, y: Math.min(f.y(c.o), f.y(c.c)), width: f.bw, height: Math.max(1.5, Math.abs(f.y(c.o) - f.y(c.c))), fill: col, rx: 1 }, pc);
      } else {
        el('line', { x1: xx, x2: xx, y1: f.y(c.h), y2: f.y(c.l), stroke: col, 'stroke-width': 1.6 }, pc);
        el('line', { x1: xx - f.bw / 2, x2: xx, y1: f.y(c.o), y2: f.y(c.o), stroke: col, 'stroke-width': 1.6 }, pc);
        el('line', { x1: xx, x2: xx + f.bw / 2, y1: f.y(c.c), y2: f.y(c.c), stroke: col, 'stroke-width': 1.6 }, pc);
      }
    });
    el('text', { x: 14, y: 292, fill: '#8f82b3', 'font-size': 11 }, pc, 'Tiempo →');
    el('text', { x: 626, y: 292, fill: '#8f82b3', 'font-size': 11, 'text-anchor': 'end' }, pc, 'EUR/USD simulado · ' + ptf);
    $('#chartCap').textContent = cap + ' (datos inventados para practicar)';
  }
  function seg(id, cb) {
    const g = $(id); g.addEventListener('click', e => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      $$('button', g).forEach(x => x.setAttribute('aria-pressed', String(x === b))); cb(b.dataset.v);
    });
  }
  seg('#chartType', v => { ptype = v; drawPrice(); }); seg('#chartTf', v => { ptf = v; drawPrice(); }); drawPrice();

  /* ---------- 4) Constructor de velas ---------- */
  const cb = $('#candleBuilder'), S = { o: $('#cOpen'), c: $('#cClose'), h: $('#cHigh'), l: $('#cLow') };
  function drawCandle(chg) {
    let o = +S.o.value, c = +S.c.value, h = +S.h.value, l = +S.l.value;
    h = Math.max(h, o, c); l = Math.min(l, o, c); S.h.value = h; S.l.value = l;
    $('#oOpen').textContent = o; $('#oClose').textContent = c; $('#oHigh').textContent = h; $('#oLow').textContent = l;
    cb.innerHTML = ''; const y = v => 270 - v * 2.5, col = c >= o ? GREEN : RED;
    for (let g = 0; g <= 4; g++) el('line', { x1: 10, x2: 290, y1: 270 - g * 62.5, y2: 270 - g * 62.5, stroke: 'rgba(167,139,250,.12)' }, cb);
    el('line', { x1: 150, x2: 150, y1: y(h), y2: y(l), stroke: col, 'stroke-width': 4, 'stroke-linecap': 'round' }, cb);
    el('rect', { x: 118, y: y(Math.max(o, c)), width: 64, height: Math.max(3, Math.abs(y(o) - y(c))), fill: col, rx: 4, filter: 'url(#glowF)' }, cb);
    const lab = (v, t, side) => { const yy = y(v); el('line', { x1: side ? 188 : 112, x2: side ? 212 : 88, y1: yy, y2: yy, stroke: '#c4b5fd', 'stroke-dasharray': '3 3' }, cb); el('text', { x: side ? 216 : 84, y: yy + 4, fill: '#e9d5ff', 'font-size': 12, 'text-anchor': side ? 'start' : 'end' }, cb, t); };
    lab(h, 'Máximo', 1); lab(l, 'Mínimo', 1); lab(o, 'Apertura', 0); lab(c, 'Cierre', 0);
    const range = h - l, body = Math.abs(c - o), up = h - Math.max(o, c), lo = Math.min(o, c) - l;
    let name = 'vela común';
    if (range <= 0) name = '—';
    else if (body / range < .1) name = 'Doji (indecisión)';
    else if (lo >= 2 * body && up <= body * .6) name = 'forma de Martillo (si aparece tras una caída)';
    else if (up >= 2 * body && lo <= body * .6) name = 'forma de Estrella fugaz (si aparece tras una subida)';
    else if (body / range > .85) name = 'cuerpo muy grande: un lado dominó el periodo';
    $('#candleCap').textContent = (c >= o ? 'Vela ALCISTA (verde)' : 'Vela BAJISTA (roja)') + ' · Parece: ' + name;
  }
  Object.values(S).forEach(s => s.addEventListener('input', drawCandle)); drawCandle();

  /* ---------- 5) Tendencias, soportes y resistencias ---------- */
  const tc = $('#trendChart'); let ttype = 'up', showSR = true, showTL = false;
  const trendCfg = {
    up: [[5, 36, { start: 100, drift: 1.8, vol: 4 }], 'Tendencia ALCISTA: los máximos y mínimos son cada vez más altos.'],
    down: [[9, 36, { start: 160, drift: -1.8, vol: 4 }], 'Tendencia BAJISTA: los máximos y mínimos son cada vez más bajos.'],
    range: [[3, 40, { mode: 'range', center: 130, amp: 12, period: 13, vol: 3 }], 'Mercado LATERAL: el precio rebota entre un soporte (piso) y una resistencia (techo).']
  };
  function drawTrend() {
    tc.innerHTML = ''; const [[seed, n, o], cap] = trendCfg[ttype]; const data = gen(seed, n, o);
    const f = frame(tc, data, 640, 300, { l: 12, r: 52, t: 14, b: 14 });
    data.forEach((c, i) => {
      const col = c.c >= c.o ? GREEN : RED, xx = f.x(i);
      el('line', { x1: xx, x2: xx, y1: f.y(c.h), y2: f.y(c.l), stroke: col, 'stroke-width': 1.3 }, tc);
      el('rect', { x: xx - f.bw / 2, y: Math.min(f.y(c.o), f.y(c.c)), width: f.bw, height: Math.max(1.5, Math.abs(f.y(c.o) - f.y(c.c))), fill: col, rx: 1 }, tc);
    });
    const note = $('#trendCap');
    if (showSR) {
      const sorted = data.map(d => d.h).sort((a, b) => b - a), low = data.map(d => d.l).sort((a, b) => a - b);
      const res = ttype === 'range' ? sorted[2] : sorted[0], sup = ttype === 'range' ? low[2] : low[0];
      const band = (v, c, t, dy) => { el('rect', { x: 12, width: 576, y: f.y(v) - 6, height: 12, fill: c, opacity: .16 }, tc); el('line', { x1: 12, x2: 588, y1: f.y(v), y2: f.y(v), stroke: c, 'stroke-dasharray': '6 4', 'stroke-width': 1.6 }, tc); el('text', { x: 20, y: f.y(v) + dy, fill: c, 'font-size': 12, 'font-weight': 700 }, tc, t); };
      band(res, '#fbbf24', 'Resistencia (techo)', -9); band(sup, '#a78bfa', 'Soporte (piso)', 20);
    }
    let extra = '';
    if (showTL) {
      if (ttype === 'range') extra = ' · En un rango no hay línea de tendencia clara.';
      else {
        const key = ttype === 'up' ? 'l' : 'h', xs = data.map((_, i) => f.x(i)), ys = data.map(d => f.y(d[key]));
        const nn = xs.length, mx = xs.reduce((a, b) => a + b) / nn, my = ys.reduce((a, b) => a + b) / nn;
        const m = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0);
        let b0 = my - m * mx; const res = ys.map((yy, i) => yy - (m * xs[i] + b0));
        b0 += ttype === 'up' ? Math.max(...res) : Math.min(...res); // la línea toca los extremos sin cortarlos
        el('line', { x1: xs[0], y1: m * xs[0] + b0, x2: xs[nn - 1], y2: m * xs[nn - 1] + b0, stroke: '#fff', 'stroke-width': 2.2, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round' }, tc);
        extra = ' · Línea de tendencia: une ' + (ttype === 'up' ? 'los mínimos' : 'los máximos') + '.';
      }
    }
    note.textContent = cap + extra;
  }
  seg('#trendType', v => { ttype = v; drawTrend(); });
  const srB = $('#srToggle'), tlB = $('#tlToggle');
  srB.addEventListener('click', () => { showSR = !showSR; srB.setAttribute('aria-pressed', showSR); drawTrend(); });
  tlB.addEventListener('click', () => { showTL = !showTL; tlB.setAttribute('aria-pressed', showTL); drawTrend(); });
  drawTrend();

  /* ---------- 6) Calculadora de riesgo (educativa) ---------- */
  const dc = $('#drawChart'), money = v => '$' + v.toLocaleString('es', { maximumFractionDigits: 2, minimumFractionDigits: v < 100 ? 2 : 0 });
  function risk() {
    const C = Math.max(1, +$('#rCap').value || 0), p = +$('#rPct').value, S = Math.max(1, +$('#rSl').value || 1), R = +$('#rRr').value;
    const r = C * p / 100;
    $('#oPct').textContent = p + ' %'; $('#oRr').textContent = '1 : ' + R;
    $('#sRisk').textContent = money(r); $('#sPip').textContent = money(r / S); $('#sTp').textContent = money(r * R); $('#sBe').textContent = (100 / (1 + R)).toFixed(0) + ' %';
    const m = $('#rMsg');
    if (p <= 2) m.innerHTML = '✅ <b>Riesgo prudente (≤ 2 %).</b> Una racha mala no destruiría tu cuenta. Aun así, no hay garantías de ganar.';
    else if (p <= 5) m.innerHTML = '⚠️ <b>Riesgo alto para principiantes.</b> Pocas pérdidas seguidas harían mucho daño a tu capital.';
    else m.innerHTML = '🚫 <b>Riesgo extremo.</b> Con este porcentaje, una racha corta de pérdidas podría acabar con gran parte de tu cuenta.';
    m.className = 'callout' + (p > 2 ? ' warn' : '');
    dc.innerHTML = ''; const vals = Array.from({ length: 6 }, (_, k) => C * Math.pow(1 - p / 100, k));
    const bw = 70, gap = 24;
    vals.forEach((v, k) => {
      const h = (v / C) * 150, x = 30 + k * (bw + gap), y = 180 - h, pct = (v / C) * 100;
      el('rect', { x, y, width: bw, height: h, rx: 8, fill: pct > 80 ? '#8b5cf6' : pct > 60 ? '#f59e0b' : '#fb7185', opacity: .9 }, dc);
      el('text', { x: x + bw / 2, y: y - 8, fill: '#fff', 'font-size': 12, 'text-anchor': 'middle', 'font-weight': 700 }, dc, money(v));
      el('text', { x: x + bw / 2, y: 202, fill: '#b9acd6', 'font-size': 11, 'text-anchor': 'middle' }, dc, k === 0 ? 'Inicio' : k + (k === 1 ? ' pérdida' : ' pérdidas'));
    });
  }
  ['rCap', 'rPct', 'rSl', 'rRr'].forEach(id => $('#' + id).addEventListener('input', risk)); risk();

  /* ---------- 8) Lista de verificación ---------- */
  const chks = $$('#planList input');
  chks.forEach(c => c.addEventListener('change', () => {
    c.closest('label').classList.toggle('on', c.checked);
    const n = chks.filter(x => x.checked).length; $('#planBar').style.width = (n / chks.length * 100) + '%';
    $('#planMsg').textContent = n === chks.length ? '¡Plan completo! Si algún punto falla, la mejor decisión es esperar. 💜' : n === 0 ? 'Marca los puntos que se cumplan.' : n + ' de ' + chks.length + ' puntos cumplidos. Si falta alguno, espera.';
  }));
})();
