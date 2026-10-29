/* =====================================================================
   library.js · biblioteca digital: libros 3D, ficha y LECTOR de PDF dentro de la página
   - Lector: muestra las páginas (imágenes generadas con tools/build_reader.py) con efecto de pasar página.
   - Descargar: enlace directo al PDF real (assets/pdf/…).
   Los libros salen de js/config.js → library. Nunca se inventan enlaces.
   ===================================================================== */
(function () {
  'use strict';
  const { $, $$, cfg } = window.JB;
  const shelf = $('#shelf'), modal = $('#bookModal'), box = $('#bookBox'), reader = $('#reader');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const books = cfg.library || [];

  /* ---------- Ilustraciones de portada (SVG) ---------- */
  const ART = {
    candles: '<svg viewBox="0 0 200 120" aria-hidden="true"><g stroke-linecap="round"><path d="M20 90V40M20 70v25" stroke="#34d399" stroke-width="2"/><rect x="14" y="52" width="12" height="28" rx="2" fill="#34d399"/><path d="M52 85V35" stroke="#fb7185" stroke-width="2"/><rect x="46" y="45" width="12" height="30" rx="2" fill="#fb7185"/><path d="M84 70V22" stroke="#34d399" stroke-width="2"/><rect x="78" y="30" width="12" height="34" rx="2" fill="#34d399"/><path d="M116 60V18" stroke="#34d399" stroke-width="2"/><rect x="110" y="24" width="12" height="28" rx="2" fill="#34d399"/><path d="M148 50V10" stroke="#fb7185" stroke-width="2"/><rect x="142" y="16" width="12" height="22" rx="2" fill="#fb7185"/><path d="M180 38V6" stroke="#34d399" stroke-width="2"/><rect x="174" y="10" width="12" height="20" rx="2" fill="#34d399"/></g><path d="M0 100 C40 80,70 90,100 60 S160 20,200 10" fill="none" stroke="#e9d5ff" stroke-width="2" opacity=".8"/></svg>',
    phone: '<svg viewBox="0 0 200 120" aria-hidden="true"><rect x="62" y="6" width="76" height="130" rx="14" fill="rgba(255,255,255,.12)" stroke="#fff" stroke-width="2" opacity=".9"/><rect x="72" y="20" width="56" height="62" rx="8" fill="rgba(255,255,255,.2)"/><path d="M92 40l16 11-16 11z" fill="#fff"/><circle cx="76" cy="96" r="4" fill="#fff"/><rect x="86" y="93" width="38" height="5" rx="2.5" fill="#fff" opacity=".7"/><rect x="86" y="103" width="26" height="4" rx="2" fill="#fff" opacity=".4"/><g fill="#fff" opacity=".85"><path d="M30 44c0-6 9-6 9 0 0 5-9 10-9 10s-9-5-9-10c0-6 9-6 9 0z"/><circle cx="168" cy="52" r="9" fill="none" stroke="#fff" stroke-width="2"/><path d="M20 80h22M158 80h22" stroke="#fff" stroke-width="2"/></g></svg>',
    steps: '<svg viewBox="0 0 200 120" aria-hidden="true"><g fill="#fff"><rect x="12" y="92" width="30" height="16" rx="3" opacity=".35"/><rect x="48" y="80" width="30" height="28" rx="3" opacity=".5"/><rect x="84" y="64" width="30" height="44" rx="3" opacity=".65"/><rect x="120" y="44" width="30" height="64" rx="3" opacity=".8"/><rect x="156" y="18" width="30" height="90" rx="3"/></g><path d="M20 84C60 74,110 52,168 12" fill="none" stroke="#e9d5ff" stroke-width="2.5" stroke-dasharray="4 5"/><circle cx="168" cy="12" r="5" fill="#fff"/></svg>',
    zone: '<svg viewBox="0 0 200 120" aria-hidden="true"><path d="M10 104C50 104,70 16,100 16S150 104,190 104" fill="rgba(255,255,255,.14)" stroke="#fff" stroke-width="2.4"/><path d="M100 16V108" stroke="#e9d5ff" stroke-dasharray="3 4"/><circle cx="100" cy="64" r="34" fill="none" stroke="#fff" stroke-width="1.5" opacity=".6"/><circle cx="100" cy="64" r="20" fill="none" stroke="#fff" stroke-width="1.5" opacity=".8"/><circle cx="100" cy="64" r="6" fill="#fff"/></svg>',
    spark: '<svg viewBox="0 0 200 120" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="2" opacity=".6"><circle cx="100" cy="60" r="18"/><circle cx="100" cy="60" r="34"/><circle cx="100" cy="60" r="50"/></g><circle cx="100" cy="60" r="5" fill="#fff"/></svg>'
  };
  const coverSrc = b => b.cover ? b.cover : ((b.available && b.reader && b.reader.dir) ? b.reader.dir + '/p01.webp' : '');
  const bookHTML = b => {
    const pic = coverSrc(b), st = '--c1:' + esc(b.color[0]) + ';--c2:' + esc(b.color[1]);
    if (pic) return '<div class="book has-pic" style="' + st + '"><span class="pages"></span><div class="cover pic"><img src="' + esc(pic) + '" alt="Portada de ' + esc(b.title) + '" loading="lazy" decoding="async"><span class="sheen"></span><span class="bj" aria-hidden="true">J</span></div></div>';
    return '<div class="book' + (b.available ? '' : ' soon') + '" style="' + st + '"><span class="pages"></span>' +
      '<div class="cover"><span class="bk">' + esc(b.tag || 'Guía') + '</span><span class="art">' + (ART[b.art] || ART.spark) + '</span><span class="bt">' + esc(b.short || b.title) + '</span>' +
      (b.available ? '<span class="bj" aria-hidden="true">J</span>' : '<span class="lock" aria-hidden="true">🔒</span>') + '</div></div>';
  };

  const av = books.filter(b => b.available && b.file); const lc = $('#libCount'), lp = $('#libPages'); if (lc) lc.textContent = av.length; if (lp) lp.textContent = av.reduce((a, b) => a + (b.pages || 0), 0);

  /* ---------- Estantería ---------- */
  books.forEach((b, i) => {
    const w = document.createElement('button'); w.type = 'button'; w.className = 'book-wrap rv'; w.style.setProperty('--d', (i % 3) * .1 + 's');
    w.setAttribute('aria-label', (b.available ? 'Abrir ficha: ' : 'Próximamente: ') + b.title);
    w.innerHTML = bookHTML(b) + '<div class="book-shadow" aria-hidden="true"></div><div class="book-info"><b>' + esc(b.short || b.title) + '</b><small>' + esc(b.kicker || '') + '</small></div>';
    w.addEventListener('click', () => openBook(b)); shelf.appendChild(w); window.JB.reveal(w);
  });

  /* ---------- Libros en cada ventana (data-books="trading,zona") ---------- */
  $$('.books-strip[data-books]').forEach(strip => {
    const row = $('.bs-row', strip);
    strip.dataset.books.split(',').map(id => books.find(b => b.id === id)).filter(Boolean).forEach(b => {
      const c = document.createElement('div'); c.className = 'bs-item';
      c.innerHTML = '<button type="button" class="book-wrap" aria-label="' + (b.available ? 'Abrir ficha: ' : 'Próximamente: ') + esc(b.title) + '">' + bookHTML(b) + '<div class="book-shadow" aria-hidden="true"></div></button>' +
        '<div class="bs-info"><b>' + esc(b.short || b.title) + '</b><small>' + esc(b.kicker || '') + '</small><div class="acts">' +
        (b.externalUrl ? '<a class="btn btn-join btn-sm" href="' + esc(b.externalUrl) + '" target="_blank" rel="noopener noreferrer">📘 ' + esc(b.externalLabel || 'Abrir el libro') + '</a>' : '') + (b.available ? '<button class="btn btn-primary btn-sm" type="button" data-read="' + esc(b.id) + '">📖 Leer</button><a class="btn btn-sm" href="' + esc(b.file) + '" download>⬇ Descargar</a>' : '<span class="badge aprendizaje">Próximamente</span>') + '</div></div>';
      $('button.book-wrap', c).addEventListener('click', () => openBook(b)); row.appendChild(c);
    });
    window.JB.reveal(strip);
  });

  /* ---------- Ficha del libro ---------- */
  function openBook(b) {
    const ready = b.available && b.file, canRead = ready && b.reader && b.reader.count;
    box.innerHTML = '<button class="icon-btn xbtn" type="button" data-close aria-label="Cerrar ficha">✕</button><div class="stage">' + bookHTML(b) + '</div><div><span class="eyebrow">' + esc(b.kicker || 'Biblioteca') + '</span><h3 id="bmTitle">' + esc(b.title) + '</h3><p>' + esc(b.description || '') + '</p>' +
      (b.pages ? '<p style="color:var(--muted);font-size:.9rem">📄 ' + b.pages + ' páginas · PDF gratuito</p>' : '') +
      (b.chapters && b.chapters.length ? '<h4 style="color:var(--p-300);margin:10px 0 6px">Contenido</h4><ol>' + b.chapters.map(c => '<li>' + esc(c) + '</li>').join('') + '</ol>' : '') +
      '<div class="acts">' + (b.externalUrl ? '<a class="btn btn-join btn-xl" href="' + esc(b.externalUrl) + '" target="_blank" rel="noopener noreferrer">' + (b.externalOnly ? '💬 ' : '📘 ') + esc(b.externalLabel || 'Abrir el libro') + '</a>' : '') + (b.externalOnly ? '' : ready
        ? (canRead ? '<button class="btn btn-primary" type="button" id="bmRead">📖 Leer la guía aquí</button>' : '<a class="btn btn-primary" href="' + esc(b.file) + '" target="_blank" rel="noopener">📖 Abrir PDF</a>') + '<a class="btn" href="' + esc(b.file) + '" download>⬇ Descargar la guía</a>'
        : '<button class="btn" type="button" disabled aria-disabled="true">Próximamente</button>') + '</div>' +
      ((!ready && !b.externalOnly) ? '<p style="font-size:.84rem;color:var(--muted);margin-top:14px">✏️ Para activar este espacio, copia tu PDF a <code>assets/pdf/</code> y edítalo en <code>js/config.js</code>.</p>' : '<p style="font-size:.8rem;color:var(--muted);margin-top:14px">Contenido educativo. No es asesoría financiera ni garantiza resultados.' + (b.id === 'habitos' || b.id === 'zona' ? ' Guía independiente inspirada en el libro original; no lo reemplaza.' : '') + '</p>') + '</div>';
    window.JB.openModal(modal);
    const r = $('#bmRead'); r && r.addEventListener('click', () => { window.JB.closeModal(modal); openReader(b); });
  }

  /* ---------- Lector de PDF con efecto de pasar página ---------- */
  let cur = 1, total = 0, pv = 0, book = null, zoom = 1, busy = false;
  const stage = $('#rdStage'), thumbs = $('#rdThumbs'), cnt = $('#rdCount');
  const src = n => book.reader.dir + '/p' + String(n).padStart(2, '0') + '.webp';
  const pre = n => { if (n >= 1 && n <= (pv || total)) { const i = new Image(); i.src = src(n); } };

  function lockEl() {
    const d = document.createElement('div'); d.className = 'rd-page rd-lock';
    d.innerHTML = '<div class="rd-lock-in"><span class="rd-lock-ic" aria-hidden="true">🔒</span><h3>Sigue leyendo gratis</h3><p>Esta es una vista previa de las primeras ' + pv + ' páginas. Descarga el PDF completo, <b>gratis</b>, para leer las ' + (book.pages || book.reader.count) + ' páginas.</p><a class="btn btn-join btn-xl" href="' + esc(book.file) + '" download>⬇ Descargar PDF gratis</a><a class="btn btn-wa" href="' + esc((window.SITE_CONFIG || {}).communityUrl || '#') + '" target="_blank" rel="noopener noreferrer">ÚNETE GRATIS a la comunidad</a></div>';
    return d;
  }
  function pageEl(n) {
    if (pv && n > pv) return lockEl();
    const img = document.createElement('img'); img.className = 'rd-page'; img.alt = 'Página ' + n + ' de ' + total + ' · ' + book.title; img.decoding = 'async'; img.draggable = false; img.src = src(n); return img;
  }
  function setThumbs() { $$('.rd-th', thumbs).forEach((t, i) => { const on = i + 1 === cur; t.classList.toggle('on', on); on ? t.setAttribute('aria-current', 'true') : t.removeAttribute('aria-current'); if (on) t.scrollIntoView({ block: 'nearest', inline: 'center' }); }); }
  function update() {
    cnt.textContent = pv ? (cur > pv ? 'Vista previa · ' + pv + ' de ' + (book.pages || book.reader.count) + ' páginas' : 'Vista previa · página ' + cur + ' de ' + pv) : 'Página ' + cur + ' de ' + total; $('#rdPrev').disabled = cur <= 1; $('#rdNext').disabled = cur >= total;
    $('#rdBar').style.width = (cur / total * 100) + '%'; setThumbs(); pre(cur + 1); pre(cur - 1);
  }
  function goto(n, instant) {
    n = Math.max(1, Math.min(total, n)); if (n === cur && stage.firstChild) return;
    const dir = n > cur ? 1 : -1, old = stage.querySelector('.rd-page'); cur = n;
    const next = pageEl(n); next.style.setProperty('--z', zoom);
    if (instant || window.JB.reduced || !old) { stage.replaceChildren(next); update(); return; }
    if (busy) { stage.replaceChildren(next); update(); return; }
    busy = true; update();
    // pasar página: la hoja saliente gira alrededor del lomo (izquierda) al avanzar; al retroceder, la nueva gira de vuelta
    stage.append(next);
    if (dir > 0) { old.classList.add('turn-out'); next.classList.add('under'); }
    else { next.classList.add('turn-in'); old.classList.add('under'); }
    setTimeout(() => { stage.replaceChildren(next); next.classList.remove('under', 'turn-in'); busy = false; }, 620);
  }
  function openReader(b) {
    book = b; pv = b.reader.preview || 0; total = pv ? pv + 1 : b.reader.count; cur = 1; zoom = 1; busy = false;
    $('#rdTitle').textContent = b.title;
    const dl = $('#rdDl'); dl.href = b.file; dl.setAttribute('download', '');
    thumbs.replaceChildren(...Array.from({ length: total }, (_, i) => { const t = document.createElement('button'); t.type = 'button'; t.className = 'rd-th'; t.setAttribute('aria-label', 'Ir a la página ' + (i + 1)); t.innerHTML = (pv && i + 1 > pv) ? '<span class="lk">🔒</span>' : '<img loading="lazy" alt="" src="' + src(i + 1) + '"><span>' + (i + 1) + '</span>'; t.addEventListener('click', () => goto(i + 1)); return t; }));
    stage.replaceChildren(pageEl(1)); stage.classList.remove('zoomed'); update();
    window.JB.openModal(reader, document.activeElement);
  }
  $('#rdPrev').addEventListener('click', () => goto(cur - 1)); $('#rdNext').addEventListener('click', () => goto(cur + 1));
  $('#rdZoom').addEventListener('click', () => { zoom = zoom === 1 ? 1.7 : 1; stage.classList.toggle('zoomed', zoom > 1); const p = stage.querySelector('.rd-page'); p && p.style.setProperty('--z', zoom); $('#rdZoom').setAttribute('aria-pressed', zoom > 1); });
  document.addEventListener('keydown', e => {
    if (!reader.classList.contains('open')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goto(cur + 1); } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goto(cur - 1); }
    else if (e.key === 'Home') goto(1); else if (e.key === 'End') goto(total);
  });
  // gesto de deslizar en pantallas táctiles
  let sx = null; stage.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => { if (sx === null || zoom > 1) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) goto(cur + (dx < 0 ? 1 : -1)); sx = null; }, { passive: true });
  reader.addEventListener('jb:closed', () => { stage.replaceChildren(); });
  // permite abrir el lector desde otras ventanas (p. ej. Mentalidad): JB.readBook('habitos')
  window.JB.readBook = id => { const b = books.find(x => x.id === id); if (b && b.available && b.reader) openReader(b); };
  window.JB.bookInfo = id => books.find(x => x.id === id);
})();
