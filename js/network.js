/* =====================================================================
   network.js · red de conectores (dock fijo)
   Une visualmente Inicio, Trading, Marketing, Juegos, Biblioteca y Comunidad con una
   línea luminosa. La línea se enciende hasta tu ventana actual y una chispa de energía
   viaja entre nodos al cambiar de ventana. Cada nodo es un botón accesible.
   ===================================================================== */
(function () {
  'use strict';
  const { $ } = window.JB;
  const dock = $('#dock'); if (!dock) return;
  const NS = 'http://www.w3.org/2000/svg';
  const NODES = [['inicio', 'Inicio'], ['habilidades', 'Habilidades'], ['trading', 'Trading'], ['marketing', 'Marketing'], ['mentalidad', 'Mentalidad'], ['biblioteca', 'Biblioteca'], ['comunidad', 'Comunidad']];
  const mk = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
  let svg, base, glow, len = 0, nodeLen = [], nodeEls = [], btns = [], sparks = [], litIdx = 0, curId = null, running = false, travel = null;

  function build() {
    dock.replaceChildren();
    const W = dock.clientWidth, H = dock.clientHeight, pad = Math.max(30, W * .075), step = (W - pad * 2) / (NODES.length - 1);
    svg = mk('svg', { viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true' }); dock.appendChild(svg);
    const pts = NODES.map((_, i) => ({ x: pad + i * step, y: H * (i % 2 ? .62 : .34) - 3 }));
    let d = 'M' + (pts[0].x - 14) + ' ' + pts[0].y + ' L' + pts[0].x + ' ' + pts[0].y;
    for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], mx = (a.x + b.x) / 2; d += ' C' + mx + ' ' + a.y + ',' + mx + ' ' + b.y + ',' + b.x + ' ' + b.y; }
    d += ' L' + (pts[pts.length - 1].x + 14) + ' ' + pts[pts.length - 1].y;
    base = mk('path', { class: 'd-base', d }, svg); glow = mk('path', { class: 'd-glow', d }, svg);
    len = base.getTotalLength(); glow.style.strokeDasharray = len;
    // longitud acumulada hasta cada nodo (x crece a lo largo de la curva)
    nodeLen = pts.map(p => { let lo = 0, hi = len; for (let i = 0; i < 16; i++) { const m = (lo + hi) / 2; if (base.getPointAtLength(m).x < p.x) lo = m; else hi = m; } return lo; });
    nodeEls = pts.map(p => { const g = mk('g', { class: 'd-node', transform: 'translate(' + p.x + ' ' + p.y + ')' }, svg); mk('circle', { class: 'd-ring', r: 8 }, g); mk('circle', { class: 'd-dot', r: 5.5 }, g); return g; });
    sparks = [0, 1].map(i => ({ el: mk('circle', { class: 'spark', r: i ? 2 : 3, opacity: 0 }, svg), t: i * .5 }));
    btns = NODES.map(([id, label], i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'dnode'; b.style.left = (pts[i].x / W * 100) + '%'; b.dataset.go = id;
      b.setAttribute('aria-label', 'Ir a ' + (window.JB.LABELS[id] || label)); b.innerHTML = '<span>' + label + '</span>'; dock.appendChild(b); return b;
    });
    paint(false);
  }

  // Último nodo de la red alcanzado por la ventana actual (p. ej. Resultados → Games)
  function litFor(id) {
    const o = window.JB.ORDER.indexOf(id); let k = 0;
    NODES.forEach(([nid], i) => { if (window.JB.ORDER.indexOf(nid) <= o) k = i; });
    return k;
  }
  function paint(animate) {
    if (!glow) return;
    const target = nodeLen[litIdx] + (litIdx === NODES.length - 1 ? 14 : 0);
    if (!animate) glow.style.transition = 'none';
    glow.style.strokeDashoffset = len - target;
    if (!animate) { void glow.getBoundingClientRect(); glow.style.transition = ''; }
    nodeEls.forEach((g, i) => { g.classList.toggle('on', i <= litIdx); g.classList.toggle('cur', NODES[i][0] === curId); });
    btns.forEach((b, i) => NODES[i][0] === curId ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'));
    // Etiqueta de progreso (solo se muestra en teléfono): n/total · nombre de la ventana
    let pill = dock.querySelector('.dock-cur');
    if (!pill) { pill = document.createElement('div'); pill.className = 'dock-cur'; pill.setAttribute('aria-hidden', 'true'); dock.appendChild(pill); }
    const o = window.JB.ORDER.indexOf(curId);
    if (o >= 0) pill.innerHTML = '<b>' + (o + 1) + '/' + window.JB.ORDER.length + '</b> ' + (window.JB.LABELS[curId] || curId);
  }

  // Chispa que viaja entre el nodo anterior y el nuevo
  function fly(from, to) {
    if (window.JB.lite || window.JB.reduced || from === to) return;
    const a = nodeLen[from], b = nodeLen[to], t0 = performance.now(), dur = 700 + Math.abs(to - from) * 120;
    travel = { a, b, t0, dur };
  }
  let last = 0;
  function loop(t) {
    if (!running) return; requestAnimationFrame(loop);
    const dt = Math.min(.05, (t - last) / 1000 || 0); last = t;
    const lit = nodeLen[litIdx] || 0;
    sparks.forEach((s, i) => {
      if (i === 0 && travel) {
        const k = Math.min(1, (t - travel.t0) / travel.dur), e = 1 - Math.pow(1 - k, 3), p = base.getPointAtLength(travel.a + (travel.b - travel.a) * e);
        s.el.setAttribute('cx', p.x); s.el.setAttribute('cy', p.y); s.el.setAttribute('opacity', k < 1 ? 1 : 0); s.el.setAttribute('r', 3 + Math.sin(k * Math.PI) * 2);
        if (k >= 1) travel = null; return;
      }
      if (lit < 30) { s.el.setAttribute('opacity', 0); return; }
      s.t += dt * (i ? .13 : .1); if (s.t > 1) s.t = 0;
      const p = base.getPointAtLength(s.t * lit);
      s.el.setAttribute('cx', p.x.toFixed(1)); s.el.setAttribute('cy', p.y.toFixed(1)); s.el.setAttribute('r', i ? 2 : 3); s.el.setAttribute('opacity', Math.min(1, s.t * 6, (1 - s.t) * 6).toFixed(2));
    });
  }
  function setRun() {
    const should = !window.JB.lite && !window.JB.reduced && !document.hidden;
    if (should && !running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
    else if (!should) { running = false; sparks.forEach(s => s.el.setAttribute('opacity', 0)); }
  }
  window.addEventListener('jb:view', e => {
    const old = litIdx, was = curId; curId = e.detail.id; litIdx = litFor(curId);
    const from = was ? NODES.findIndex(n => n[0] === was) : -1;
    paint(true); fly(from >= 0 ? from : Math.min(old, litIdx), NODES.findIndex(n => n[0] === curId) >= 0 ? NODES.findIndex(n => n[0] === curId) : litIdx);
  });
  window.addEventListener('jb:fx', setRun); document.addEventListener('visibilitychange', setRun);
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); }, 150); });
  curId = window.JB.view; litIdx = curId ? litFor(curId) : 0;
  build(); setRun();
})();
