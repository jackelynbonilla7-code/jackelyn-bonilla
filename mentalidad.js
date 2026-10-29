/* =====================================================================
   mentalidad.js · ventana “Mentalidad” (inspirada en las ideas de Hábitos atómicos y
   Trading en la zona). Todo es educativo y simulado; los datos se guardan solo en tu navegador.
   ===================================================================== */
(function () {
  'use strict';
  const { $, $$, store } = window.JB;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (n, a, p, t) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; p && p.appendChild(e); return e; };
  const pad = n => String(n).padStart(2, '0');
  const dk = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const fmt = (v, dec) => v.toLocaleString('es', { maximumFractionDigits: dec == null ? 2 : dec });
  const RING = 2 * Math.PI * 32;
  function ring(id, pct) { const c = $('#' + id); c.style.strokeDasharray = RING; c.style.strokeDashoffset = RING * (1 - pct); }

  /* ---------- Pestañas ---------- */
  const tabs = $$('#mindTabs button');
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', e => { let n = null; if (e.key === 'ArrowRight') n = (i + 1) % tabs.length; if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length; if (n !== null) { e.preventDefault(); select(n); tabs[n].focus(); } });
  });
  function select(i) {
    tabs.forEach((x, k) => { const on = k === i; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.dataset.p).hidden = !on; });
    const p = $('#' + tabs[i].dataset.p); p.style.animation = 'none'; void p.offsetWidth; p.style.animation = '';
    if (i === 0) drawEff(); if (i === 2 && !ran) runSim();
  }

  /* ---------- 1) Efecto 1 % ---------- */
  const eff = $('#effChart'), days = $('#effDays');
  function drawEff() {
    const d = +days.value, up = Math.pow(1.01, d), dn = Math.pow(0.99, d);
    $('#effDaysOut').textContent = d; $('#effUp').textContent = '×' + fmt(up, up < 10 ? 2 : 1); $('#effDn').textContent = '×' + fmt(dn, 3);
    eff.replaceChildren(); const L = 44, R = 14, T = 16, B = 30, W = 520, H = 320, half = (H - T - B) / 2, mid = T + half, sc = half / 3.75;
    const X = i => L + (W - L - R) * i / 365, Y = v => mid - Math.log(v) * sc;
    [-3, -2, -1, 0, 1, 2, 3].forEach(k => { const y = mid - k * sc; el('line', { x1: L, x2: W - R, y1: y, y2: y, stroke: k === 0 ? 'rgba(196,181,253,.5)' : 'rgba(167,139,250,.12)', 'stroke-dasharray': k === 0 ? '4 4' : '' }, eff); const v = Math.exp(k); el('text', { x: L - 6, y: y + 4, fill: '#8f82b3', 'font-size': 10.5, 'text-anchor': 'end' }, eff, '×' + (v >= 1 ? fmt(v, v < 10 ? 1 : 0) : fmt(v, 2))); });
    [0, 90, 180, 270, 365].forEach(i => el('text', { x: X(i), y: H - 8, fill: '#8f82b3', 'font-size': 10.5, 'text-anchor': 'middle' }, eff, i === 0 ? 'Día 0' : i));
    const path = f => { let s = ''; for (let i = 0; i <= 365; i += 5) s += (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(f(i)).toFixed(1); return s; };
    const area = el('path', { d: path(i => Math.pow(1.01, i)) + 'L' + X(365) + ' ' + mid + 'L' + X(0) + ' ' + mid + 'Z', fill: 'rgba(168,85,247,.14)' }, eff);
    el('path', { d: path(i => Math.pow(0.99, i)), fill: 'none', stroke: '#fb7185', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, eff);
    el('path', { d: path(i => Math.pow(1.01, i)), fill: 'none', stroke: '#c4b5fd', 'stroke-width': 3, 'stroke-linecap': 'round', filter: 'url(#glowF)' }, eff);
    el('line', { x1: X(d), x2: X(d), y1: T, y2: H - B, stroke: '#fff', 'stroke-dasharray': '3 4', opacity: .5 }, eff);
    el('circle', { cx: X(d), cy: Y(up), r: 6, fill: '#fff', filter: 'url(#glowF)' }, eff); el('circle', { cx: X(d), cy: Y(dn), r: 5, fill: '#fb7185' }, eff);
  }
  days.addEventListener('input', drawEff); drawEff();

  /* ---------- 2) Hábitos ---------- */
  const HK = 'jb-habits';
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() - (6 - i)); return d; });
  const DN = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  let hs = store.get(HK, null) || { identity: '', list: [
    { id: 'h1', name: 'Leer 2 páginas', two: 'Abrir el libro', done: {}, example: true },
    { id: 'h2', name: 'Estudiar 25 minutos', two: 'Abrir mi cuaderno y leer una página', done: {}, example: true },
    { id: 'h3', name: 'Moverme 10 minutos', two: 'Ponerme la ropa deportiva', done: {}, example: true }] };
  const saveH = () => store.set(HK, hs);
  function streak(h) { let s = 0, d = new Date(today); if (!h.done[dk(d)]) d.setDate(d.getDate() - 1); while (h.done[dk(d)]) { s++; d.setDate(d.getDate() - 1); } return s; }
  function renderHabits() {
    const box = $('#habList'); box.replaceChildren();
    const head = document.createElement('div'); head.className = 'hab-row hab-hd'; head.setAttribute('role', 'row');
    head.innerHTML = '<span role="columnheader">Hábito</span>' + last7.map(d => '<span role="columnheader" class="' + (dk(d) === dk(today) ? 'tod' : '') + '">' + DN[d.getDay()] + '<small>' + d.getDate() + '</small></span>').join('') + '<span role="columnheader">Racha</span><span></span>';
    box.appendChild(head); let done = 0, tot = 0;
    hs.list.forEach(h => {
      const row = document.createElement('div'); row.className = 'hab-row'; row.setAttribute('role', 'row');
      const nm = document.createElement('div'); nm.className = 'hab-name'; nm.setAttribute('role', 'cell'); nm.innerHTML = '<b></b><small></small>'; nm.firstChild.textContent = h.name + (h.example ? ' (ejemplo)' : ''); nm.lastChild.textContent = '2 min: ' + (h.two || '—'); row.appendChild(nm);
      last7.forEach(d => {
        const k = dk(d), b = document.createElement('button'); b.type = 'button'; b.className = 'hab-cell' + (h.done[k] ? ' on' : ''); b.setAttribute('role', 'cell'); b.setAttribute('aria-pressed', !!h.done[k]);
        b.setAttribute('aria-label', h.name + ', ' + d.toLocaleDateString('es', { weekday: 'long', day: 'numeric' }) + (h.done[k] ? ', hecho' : ', pendiente')); b.textContent = h.done[k] ? '✓' : '';
        b.addEventListener('click', () => { if (h.done[k]) delete h.done[k]; else h.done[k] = 1; saveH(); renderHabits(); }); row.appendChild(b); tot++; if (h.done[k]) done++;
      });
      const s = streak(h), st = document.createElement('div'); st.className = 'hab-streak'; st.setAttribute('role', 'cell'); st.textContent = s ? '🔥 ' + s : '—'; row.appendChild(st);
      const del = document.createElement('button'); del.type = 'button'; del.className = 'hab-del'; del.setAttribute('aria-label', 'Eliminar hábito ' + h.name); del.textContent = '✕'; del.addEventListener('click', () => { hs.list = hs.list.filter(x => x !== h); saveH(); renderHabits(); }); row.appendChild(del);
      box.appendChild(row);
    });
    if (!hs.list.length) { const e = document.createElement('p'); e.className = 'hint'; e.textContent = 'No tienes hábitos todavía. Añade uno pequeño: la versión de 2 minutos es la clave.'; box.appendChild(e); }
    const pct = tot ? done / tot : 0; $('#habPct').textContent = Math.round(pct * 100) + '%'; ring('habRing', pct);
  }
  const idn = $('#identity'); idn.value = hs.identity || ''; idn.addEventListener('input', () => { hs.identity = idn.value; saveH(); });
  $('#habForm').addEventListener('submit', e => {
    e.preventDefault(); const n = $('#habName').value.trim(); if (!n) { window.JB.toast('Escribe el nombre del hábito'); $('#habName').focus(); return; }
    hs.list.push({ id: 'h' + Date.now(), name: n, two: $('#habTwo').value.trim(), done: {} }); saveH(); $('#habName').value = ''; $('#habTwo').value = ''; renderHabits(); window.JB.toast('Hábito añadido ✨');
  });
  renderHabits();

  /* ---------- 3) Zona de probabilidades ---------- */
  const zc = $('#zChart'), COLORS = ['#c4b5fd', '#f0abfc', '#a78bfa', '#e879f9', '#8b5cf6', '#d8b4fe', '#c084fc', '#f5d0fe'];
  let zN = 50, ran = false;
  const zWin = $('#zWin'); const upd = () => { $('#zWinOut').textContent = zWin.value + ' %'; }; zWin.addEventListener('input', upd); upd();
  $('#zN').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (!b) return; zN = +b.dataset.v; $$('#zN button').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  function runSim() {
    ran = true; const p = +zWin.value / 100, rr = +$('#zRr').value, n = zN, runs = [];
    for (let r = 0; r < 8; r++) { let eq = 0, streak = 0, ms = 0; const pts = [0]; for (let i = 0; i < n; i++) { if (Math.random() < p) { eq += rr; streak = 0; } else { eq -= 1; streak++; ms = Math.max(ms, streak); } pts.push(eq); } runs.push({ pts, ms, end: eq }); }
    const exp = p * rr - (1 - p); $('#zExp').textContent = (exp >= 0 ? '+' : '') + fmt(exp, 2) + ' R'; $('#zExp').style.color = exp > 0 ? 'var(--ok)' : exp < 0 ? 'var(--bad)' : '#fff';
    const ws = Math.max(...runs.map(r => r.ms)); $('#zStreak').textContent = ws + ' seguidas';
    const all = runs.flatMap(r => r.pts), lo = Math.min(0, ...all), hi = Math.max(0, ...all), W = 520, H = 300, L = 44, R = 12, T = 14, B = 26, span = (hi - lo) || 1;
    const X = i => L + (W - L - R) * i / n, Y = v => T + (1 - (v - lo) / span) * (H - T - B);
    zc.replaceChildren();
    for (let g = 0; g <= 4; g++) { const v = lo + span * g / 4, y = Y(v); el('line', { x1: L, x2: W - R, y1: y, y2: y, stroke: 'rgba(167,139,250,.12)' }, zc); el('text', { x: L - 6, y: y + 4, fill: '#8f82b3', 'font-size': 10.5, 'text-anchor': 'end' }, zc, fmt(v, 0) + ' R'); }
    el('line', { x1: L, x2: W - R, y1: Y(0), y2: Y(0), stroke: 'rgba(196,181,253,.6)', 'stroke-dasharray': '4 4' }, zc);
    el('text', { x: W - R, y: H - 6, fill: '#8f82b3', 'font-size': 10.5, 'text-anchor': 'end' }, zc, 'Operación nº →');
    runs.forEach((r, k) => {
      const d = r.pts.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join('');
      const path = el('path', { d, fill: 'none', stroke: COLORS[k], 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: .9 }, zc);
      if (!window.JB.reduced) { const len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = len; path.getBoundingClientRect(); path.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(.22,.8,.22,1) ' + (k * .06) + 's'; requestAnimationFrame(() => path.style.strokeDashoffset = 0); }
      el('circle', { cx: X(n), cy: Y(r.end), r: 3.5, fill: COLORS[k] }, zc);
    });
    const ends = runs.map(r => r.end).sort((a, b) => a - b), pos = ends.filter(v => v > 0).length;
    $('#zCap').textContent = 'Mismas reglas, 8 caminos: final entre ' + fmt(ends[0], 1) + ' R y ' + fmt(ends[7], 1) + ' R · ' + pos + ' de 8 terminan en positivo.';
    $('#zMsg').innerHTML = exp > 0
      ? '✅ Con esta ventaja (<b>+' + fmt(exp, 2) + ' R por operación</b>) la tendencia es ascendente, pero mira cuánto se separan los caminos y cuántas pérdidas seguidas aparecen (hasta <b>' + ws + '</b>). <b>Mismo plan, resultados distintos:</b> por eso no se juzga una sola operación.'
      : exp === 0 ? '⚖️ Sin ventaja (<b>0 R</b>), los caminos se reparten alrededor de cero. Operar más no crea una ventaja.'
      : '⚠️ Con esta combinación la expectativa es <b>negativa</b> (' + fmt(exp, 2) + ' R): a la larga la mayoría de caminos termina por debajo de cero. Operar mucho no arregla una mala expectativa.';
  }
  $('#zRun').addEventListener('click', runSim);

  /* ---------- 4) Rutina ---------- */
  const RK = 'jb-routine', DEF = ['Análisis del mercado (en demo)', 'Practicar entrada (en demo)', 'Estudiar / tomar clase', 'Planificar mi día', 'Visualizar mis metas', 'Tomar notas', 'Crear contenido', 'Hacer ejercicio', 'Leer', 'Meditar'];
  let rt = store.get(RK, null); if (!rt || rt.date !== dk(today)) rt = { date: dk(today), items: (rt && rt.items ? rt.items.map(i => ({ t: i.t, d: false })) : DEF.map(t => ({ t, d: false }))) };
  const saveR = () => store.set(RK, rt);
  function renderRut() {
    const box = $('#rutList'); box.replaceChildren();
    rt.items.forEach((it, i) => {
      const lb = document.createElement('label'); lb.className = it.d ? 'on' : ''; const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = it.d;
      cb.addEventListener('change', () => { it.d = cb.checked; saveR(); renderRut(); });
      const sp = document.createElement('span'); sp.style.flex = '1'; sp.textContent = it.t;
      const del = document.createElement('button'); del.type = 'button'; del.className = 'hab-del'; del.setAttribute('aria-label', 'Quitar ' + it.t); del.textContent = '✕'; del.addEventListener('click', e => { e.preventDefault(); rt.items.splice(i, 1); saveR(); renderRut(); });
      lb.append(cb, sp, del); box.appendChild(lb);
    });
    const n = rt.items.filter(i => i.d).length, pct = rt.items.length ? n / rt.items.length : 0; $('#rutPct').textContent = Math.round(pct * 100) + '%'; ring('rutRing', pct);
  }
  $('#rutForm').addEventListener('submit', e => { e.preventDefault(); const v = $('#rutName').value.trim(); if (!v) return; rt.items.push({ t: v, d: false }); $('#rutName').value = ''; saveR(); renderRut(); });
  $('#rutReset').addEventListener('click', () => { rt.items.forEach(i => i.d = false); saveR(); renderRut(); window.JB.toast('Día reiniciado'); });
  renderRut();

  // Animar el anillo al abrir la ventana
  window.addEventListener('jb:view', e => { if (e.detail.id === 'mentalidad') { drawEff(); renderHabits(); renderRut(); } });
})();
