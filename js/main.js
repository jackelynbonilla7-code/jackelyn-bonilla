/* =====================================================================
   main.js · núcleo: utilidades, navegación, efectos 3D, partículas, cargador
   ===================================================================== */
(function () {
  'use strict';
  const doc = document, root = doc.documentElement;
  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));
  const cfg = window.SITE_CONFIG || {};
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };

  const JB = window.JB = { $, $$, cfg, store, reduced: mqReduce.matches, lite: false, canHover: canHover.matches };

  /* ---------- Efectos: SIEMPRE activados ----------
     Solo se reducen si el dispositivo lo pide (accesibilidad) y la persona no eligió activarlos. */
  JB.reduced = mqReduce.matches && !store.get('jb-force-fx', false);
  JB.lite = false; root.classList.remove('lite'); root.classList.toggle('reduce', JB.reduced);
  try { localStorage.removeItem('jb-fx'); } catch (e) { /* sin almacenamiento */ }
  if (JB.reduced) {
    const n = $('#reduceNote'); if (n) { n.hidden = false; const b = $('#forceFx'); b && b.addEventListener('click', () => { store.set('jb-force-fx', true); location.reload(); }); }
  }

  /* ---------- Toast ---------- */
  let tt;
  JB.toast = function (msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2600);
  };

  /* ---------- Modales ---------- */
  const modalStack = [];
  JB.openModal = function (el, opener) {
    if (!el) return;
    el._opener = opener || doc.activeElement;
    el.classList.add('open'); modalStack.push(el);
    root.style.overflow = 'hidden';
    const f = el.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    setTimeout(() => f && f.focus({ preventScroll: true }), 30);
  };
  JB.closeModal = function (el) {
    el = el || modalStack[modalStack.length - 1]; if (!el) return;
    el.classList.remove('open');
    const i = modalStack.indexOf(el); if (i > -1) modalStack.splice(i, 1);
    if (!modalStack.length) root.style.overflow = '';
    el.dispatchEvent(new CustomEvent('jb:closed'));
    if (el._opener && el._opener.focus) try { el._opener.focus({ preventScroll: true }); } catch (e) { }
  };
  doc.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalStack.length) { JB.closeModal(); }
    if (e.key === 'Tab' && modalStack.length) {
      const m = modalStack[modalStack.length - 1];
      const f = $$('button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])', m).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  doc.addEventListener('click', e => {
    const m = e.target.closest('.modal,.lightbox');
    if (m && e.target === m) JB.closeModal(m);
    const c = e.target.closest('[data-close]');
    if (c) { const mm = c.closest('.modal,.lightbox'); mm && JB.closeModal(mm); }
  });
  JB.notConfigured = function (title, text, hint) {
    $('#cfgTitle').textContent = title; $('#cfgText').textContent = text; $('#cfgHint').textContent = hint;
    JB.openModal($('#cfgModal'));
  };

  /* ---------- Sonido opcional ---------- */
  JB.sound = {
    on: store.get('jb-sound', false), ctx: null,
    _ctx() { if (!this.ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) this.ctx = new A(); } if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; },
    tone(f, t0, d, type, v) {
      const c = this._ctx(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, c.currentTime + t0); g.gain.exponentialRampToValueAtTime(v || 0.12, c.currentTime + t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + d);
      o.connect(g); g.connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + d + 0.05);
    },
    play(k) {
      if (!this.on) return;
      try {
        if (k === 'ok') { this.tone(660, 0, .12, 'sine'); this.tone(880, .09, .18, 'sine'); }
        else if (k === 'bad') { this.tone(200, 0, .22, 'sawtooth', .07); this.tone(150, .1, .25, 'sawtooth', .07); }
        else if (k === 'win') { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, i * .1, .22, 'triangle')); }
        else this.tone(520, 0, .06, 'square', .05);
      } catch (e) { /* audio no disponible */ }
    },
    set(v) {
      this.on = v; store.set('jb-sound', v);
      $$('#sndToggle,#gSnd').forEach(b => { b.setAttribute('aria-pressed', String(v)); b.textContent = (v ? '🔊 Sonido: encendido' : '🔇 Sonido: apagado'); if (b.id === 'gSnd') b.textContent = v ? '🔊 Sonido' : '🔇 Sonido'; });
      if (v) this.play('click');
    }
  };
  $$('#sndToggle,#gSnd').forEach(b => b.addEventListener('click', () => JB.sound.set(!JB.sound.on)));
  JB.sound.set(JB.sound.on);

  /* ---------- Navegación ---------- */
  const nav = $('#nav'), links = $$('#navLinks a'), ind = $('#navInd'), burger = $('#burger'), menu = $('#navLinks');
  function closeMenu() { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú'); }
  burger.addEventListener('click', () => {
    const o = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Cerrar menú' : 'Abrir menú');
  });
  links.forEach(a => a.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (innerWidth > 1280) closeMenu(); moveInd(); });
  function moveInd() {
    const cur = links.find(a => a.getAttribute('aria-current') === 'true');
    if (!cur || innerWidth <= 1280) { ind.style.opacity = 0; return; }
    ind.style.opacity = 1; ind.style.left = (cur.offsetLeft + 12) + 'px'; ind.style.width = (cur.offsetWidth - 24) + 'px';
  }
  const prog = $('#scrollProg'), assist = $('#assist');
  function onScroll() {
    const y = scrollY, h = doc.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('stuck', y > 20);
    prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
  }
  function setActive(id) {
    links.forEach(a => a.getAttribute('href') === '#' + id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
    moveInd(); assist && assist.classList.toggle('show', id !== 'inicio');
  }

  /* ---------- Ventanas (una sección a la vez, con transición 3D) ---------- */
  const ORDER = ['inicio', 'sobre-mi', 'habilidades', 'trading', 'clases', 'marketing', 'mentalidad', 'resultados', 'biblioteca', 'comunidad', 'contacto'];
  const LABELS = { 'inicio': 'Inicio', 'sobre-mi': 'Sobre mí', 'trading': 'Trading', 'clases': 'Clases gratis de trading', 'marketing': 'Marketing digital', 'habilidades': 'Habilidades digitales', 'mentalidad': 'Mentalidad', 'resultados': 'Resultados', 'biblioteca': 'Biblioteca PDF', 'comunidad': 'Comunidad', 'contacto': 'Contacto' };
  const ACCENT = { 'inicio': 'violet', 'sobre-mi': 'orchid', 'trading': 'indigo', 'clases': 'violet', 'marketing': 'fuchsia', 'habilidades': 'violet', 'mentalidad': 'lilac', 'resultados': 'orchid', 'biblioteca': 'indigo', 'comunidad': 'fuchsia', 'contacto': 'orchid' };
  JB.ORDER = ORDER; JB.LABELS = LABELS; JB.view = null;
  const hashId = () => { const id = decodeURIComponent((location.hash || '').slice(1)); return ORDER.includes(id) ? id : 'inicio'; };
  function show(id) {
    if (id === JB.view) return;
    const prevId = JB.view, prev = prevId && $('#' + prevId), next = $('#' + id);
    const dir = prevId ? Math.sign(ORDER.indexOf(id) - ORDER.indexOf(prevId)) || 1 : 1;
    JB.view = id; root.dataset.accent = ACCENT[id] || 'violet'; window.scrollTo({ top: 0, behavior: 'instant' });
    if (prev) {
      prev.classList.remove('active');
      if (!JB.reduced) { prev.style.setProperty('--dir', dir); prev.classList.add('leaving'); setTimeout(() => prev.classList.remove('leaving'), 560); }
    }
    next.style.setProperty('--dir', dir); next.classList.add('active');
    if (!JB.reduced && prev) { next.classList.add('entering'); setTimeout(() => next.classList.remove('entering'), 850); }
    // la entrada de cada elemento se repite al volver a la ventana
    if (prev && !JB.reduced) {
      const els = $$('.rv.in', next); els.forEach(e => e.classList.remove('in'));
      void next.offsetWidth; setTimeout(() => els.forEach(e => e.classList.add('in')), 90);
    }
    next.focus({ preventScroll: true });
    document.title = (id === 'inicio' ? 'Jackelyn Bonilla' : LABELS[id] + ' · Jackelyn Bonilla');
    setActive(id); closeMenu(); onScroll();
    window.dispatchEvent(new CustomEvent('jb:view', { detail: { id, prev: prevId, dir } }));
  }
  JB.go = function (id) {
    if (!ORDER.includes(id)) return;
    if (location.hash !== '#' + id) location.hash = id; else show(id);
  };
  window.addEventListener('hashchange', () => show(hashId()));
  doc.addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (!g) return;
    e.preventDefault(); const id = g.dataset.go, ap = $('#assistPanel'); ap && ap.classList.remove('open');
    // desde el inicio, el robot comenta antes de cambiar de ventana
    if (JB.view === 'inicio' && JB.afterGo && !JB.reduced && g.closest('.robot-chips')) { JB.afterGo(id); setTimeout(() => JB.go(id), 1100); }
    else JB.go(id);
  });
  doc.addEventListener('click', e => { const r = e.target.closest('[data-read]'); if (r) { e.preventDefault(); JB.readBook && JB.readBook(r.dataset.read); } });
  // Botones «Siguiente» (inicio y asistente): avanzan solo a la siguiente ventana
  doc.addEventListener('click', e => { if (e.target.closest('[data-next]')) { e.preventDefault(); const i = ORDER.indexOf(JB.view); JB.go(ORDER[Math.min(ORDER.length - 1, i + 1)]); const ap = $('#assistPanel'); ap && ap.classList.remove('open'); } });
  // Botones Anterior / Siguiente al final de cada ventana
  ORDER.forEach((id, i) => {
    const w = $('#' + id + ' .wrap'); if (!w) return;
    const n = doc.createElement('div'); n.className = 'view-nav';
    const p = ORDER[i - 1], nx = ORDER[i + 1];
    n.innerHTML = (p ? '<button class="btn btn-sm" type="button" data-go="' + p + '">← ' + LABELS[p] + '</button>' : '<span></span>') + (nx ? '<button class="btn btn-primary btn-next" type="button" data-go="' + nx + '"><small>Siguiente</small><b>' + LABELS[nx] + '</b><span class="nx-arrow" aria-hidden="true">→</span></button>' : '<button class="btn btn-primary btn-next" type="button" data-go="inicio"><small>Final</small><b>Volver al inicio</b><span class="nx-arrow" aria-hidden="true">↑</span></button>');
    w.appendChild(n);
  });

  /* ---------- Descargas ----------
     En un hosting normal, <a download> funciona solo. Dentro de la vista de artifacts de claude.ai se usa
     la capacidad "downloads" (pide confirmación a la persona). */
  doc.addEventListener('click', e => {
    const a = e.target.closest('a[download]'); if (!a || !(window.claude && window.claude.use)) return;
    e.preventDefault(); const url = a.href, name = url.split('/').pop().split('?')[0] || 'archivo.pdf';
    window.claude.use('downloads').then(d => {
      if (!d) { JB.toast('La descarga no está disponible en esta vista. Usa «Leer aquí» o abre el sitio en su dirección propia.'); return null; }
      return fetch(a.getAttribute('href')).then(r => r.blob()).then(b => d.save({ filename: name, data: b })).then(r => r && JB.toast('Descarga lista ✨'));
    }).catch(err => { if (!err || err.code !== 'declined') JB.toast('No se pudo descargar. Prueba «Abrir PDF».'); });
  });

  /* ---------- Revelado ---------- */
  let revealIO = null;
  JB.reveal = function (el) {
    if (!el) return;
    if (!revealIO) { el.classList.add('in'); return; }
    revealIO.observe(el);
  };
  function initReveal() {
    const els = $$('.rv');
    if ('IntersectionObserver' in window && !JB.reduced) {
      revealIO = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    }
    els.forEach(JB.reveal);
  }

  /* ---------- Inclinación 3D + luz que sigue al cursor ---------- */
  let tiltEl = null, raf = 0, last = null;
  function resetTilt(el) { if (!el) return; el.classList.remove('tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); }
  doc.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    last = e; if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0; const ev = last, t = ev.target;
      const lit = t.closest && t.closest('.btn,.glass,.gcard,.link-card,.game-card');
      if (lit) { const r = lit.getBoundingClientRect(); lit.style.setProperty('--mx', (ev.clientX - r.left) + 'px'); lit.style.setProperty('--my', (ev.clientY - r.top) + 'px'); }
      if (JB.lite || JB.reduced || !canHover.matches) return;
      const tl = t.closest && t.closest('[data-tilt]');
      if (tiltEl && tiltEl !== tl) resetTilt(tiltEl);
      tiltEl = tl;
      if (tl) {
        const r = tl.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
        const max = parseFloat(tl.dataset.tilt) || 7;
        tl.classList.add('tilting');
        tl.style.setProperty('--rx', ((0.5 - py) * max * 2).toFixed(2) + 'deg');
        tl.style.setProperty('--ry', ((px - 0.5) * max * 2).toFixed(2) + 'deg');
      }
    });
  }, { passive: true });
  doc.addEventListener('pointerleave', () => resetTilt(tiltEl));

  /* ---------- Botones: onda al hacer clic ---------- */
  doc.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn'); if (!b || JB.reduced) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) / 4;
    const sp = doc.createElement('span'); sp.className = 'ripple';
    sp.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    b.appendChild(sp); setTimeout(() => sp.remove(), 650);
  });

  /* ---------- Paralaje (scroll + ratón) ---------- */
  const px = [];
  function initParallax() {
    $$('.shape[data-depth]').forEach(s => {
      const w = doc.createElement('div'); w.className = 'px';
      ['left', 'right', 'top', 'bottom'].forEach(k => { if (s.style[k]) { w.style[k] = s.style[k]; s.style[k] = ''; } });
      s.parentNode.insertBefore(w, s); w.appendChild(s); s.style.position = 'relative';
      px.push({ el: w, depth: parseFloat(s.dataset.depth) || 20, host: w.parentElement });
    });
  }
  let mx = 0, my = 0, pTick = 0;
  const robotEl = $('#robot'), stage = $('#stage');
  function parallax() {
    pTick = 0; if (JB.lite || JB.reduced) { px.forEach(p => p.el.style.transform = ''); return; }
    const vh = innerHeight;
    px.forEach(p => {
      const r = p.host.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const off = r.top + r.height / 2 - vh / 2;
      p.el.style.transform = 'translate3d(' + (mx * p.depth * .6).toFixed(1) + 'px,' + (-off * p.depth / 260 + my * p.depth * .5).toFixed(1) + 'px,0)';
    });
    if (robotEl && canHover.matches) robotEl.style.transform = 'translate3d(' + (mx * -14).toFixed(1) + 'px,' + (my * -10).toFixed(1) + 'px,0) rotateY(' + (mx * 6).toFixed(1) + 'deg) rotateX(' + (my * -4).toFixed(1) + 'deg)';
  }
  const reqPar = () => { if (!pTick) pTick = requestAnimationFrame(parallax); };
  window.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; reqPar(); }, { passive: true });
  window.addEventListener('scroll', () => { onScroll(); reqPar(); }, { passive: true });
  window.addEventListener('resize', () => { onScroll(); reqPar(); });

  /* ---------- Partículas discretas ---------- */
  const cv = $('#particles'), cx = cv.getContext('2d');
  let W = 0, H = 0, dots = [], running = false, pm = { x: -999, y: -999 };
  function sizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = JB.lite || JB.reduced ? 0 : (W < 700 ? 26 : Math.min(64, Math.round(W / 24)));
    dots = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22 - .05, r: Math.random() * 1.6 + .5, a: Math.random() * .5 + .25 }));
    if (!n) cx.clearRect(0, 0, W, H);
  }
  function frame() {
    if (!running) return;
    cx.clearRect(0, 0, W, H);
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i]; d.x += d.vx; d.y += d.vy;
      if (d.x < -10) d.x = W + 10; else if (d.x > W + 10) d.x = -10;
      if (d.y < -10) d.y = H + 10; else if (d.y > H + 10) d.y = -10;
      const dx = d.x - pm.x, dy = d.y - pm.y, dd = dx * dx + dy * dy;
      if (dd < 14000) { d.x += dx / 90; d.y += dy / 90; }
      cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.283); cx.fillStyle = 'rgba(196,167,255,' + d.a + ')'; cx.fill();
      if (W > 700) for (let j = i + 1; j < dots.length; j++) {
        const o = dots[j], ax = d.x - o.x, ay = d.y - o.y, q = ax * ax + ay * ay;
        if (q < 9500) { cx.strokeStyle = 'rgba(139,92,246,' + (0.16 * (1 - q / 9500)) + ')'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(d.x, d.y); cx.lineTo(o.x, o.y); cx.stroke(); }
      }
    }
    requestAnimationFrame(frame);
  }
  function startParticles() { sizeCanvas(); if (dots.length && !running && !doc.hidden) { running = true; requestAnimationFrame(frame); } }
  window.addEventListener('resize', () => { running = false; startParticles(); });
  window.addEventListener('jb:fx', () => { running = false; startParticles(); reqPar(); });
  doc.addEventListener('visibilitychange', () => { if (doc.hidden) running = false; else startParticles(); });
  window.addEventListener('pointermove', e => { pm.x = e.clientX; pm.y = e.clientY; }, { passive: true });

  /* ---------- Cargador ---------- */
  const loader = $('#loader'), bar = $('#loaderBar');
  let loaded = false, pct = 0, started = performance.now();
  function finishLoad() {
    if (loaded) return; loaded = true; bar.style.width = '100%';
    const wait = Math.max(0, 1000 - (performance.now() - started));
    setTimeout(() => {
      loader.classList.add('done'); root.classList.add('ready');
      const body = $('#robotBody'); body && body.classList.add('robot-enter');
      setTimeout(() => { loader.remove(); }, 1000);
      window.dispatchEvent(new CustomEvent('jb:ready'));
    }, wait + 120);
  }
  const tick = setInterval(() => { pct = Math.min(90, pct + 6 + Math.random() * 9); if (!loaded) bar.style.width = pct + '%'; else clearInterval(tick); }, 120);
  if (doc.readyState === 'complete') finishLoad(); else window.addEventListener('load', finishLoad);
  setTimeout(finishLoad, 3500);

  /* ---------- Init ---------- */
  $('#year').textContent = new Date().getFullYear();
  show(hashId()); initReveal(); initParallax(); onScroll(); startParticles(); reqPar();
  JB.refreshLayout = function () { window.dispatchEvent(new Event('resize')); };
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(() => { moveInd(); JB.refreshLayout(); });
})();
