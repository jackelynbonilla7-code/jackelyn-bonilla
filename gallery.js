/* =====================================================================
   gallery.js · galería de resultados
   - Imágenes PÚBLICAS: las que añadas en js/config.js → gallery (carpeta assets/gallery/)
   - Imágenes del MODO EDICIÓN: se guardan en IndexedDB, solo en este navegador.
   No se genera ningún resultado ni cifra: solo se muestran las imágenes que tú subas.
   ===================================================================== */
(function () {
  'use strict';
  const { $, $$, cfg } = window.JB;
  const grid = $('#gallery'), TYPES = { real: 'Resultado real', sim: 'Simulación', aprendizaje: 'Aprendizaje' };
  let local = [], items = [], cur = 0, editing = false;

  /* ---------- IndexedDB ---------- */
  const DB = { db: null,
    open() { return new Promise(res => { try { const r = indexedDB.open('jb-gallery', 1); r.onupgradeneeded = () => r.result.createObjectStore('imgs', { keyPath: 'id' }); r.onsuccess = () => { this.db = r.result; res(true); }; r.onerror = () => res(false); } catch (e) { res(false); } }); },
    tx(mode) { return this.db.transaction('imgs', mode).objectStore('imgs'); },
    all() { return new Promise(res => { if (!this.db) return res([]); const q = this.tx('readonly').getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => res([]); }); },
    put(o) { return new Promise(res => { if (!this.db) return res(false); const q = this.tx('readwrite').put(o); q.onsuccess = () => res(true); q.onerror = () => res(false); }); },
    del(id) { return new Promise(res => { if (!this.db) return res(false); const q = this.tx('readwrite').delete(id); q.onsuccess = () => res(true); q.onerror = () => res(false); }); }
  };

  const fmtDate = d => { if (!d) return ''; const t = new Date(d + 'T12:00:00'); return isNaN(t) ? d : t.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' }); };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function collect() {
    const pub = (cfg.gallery || []).map((g, i) => ({ id: 'pub' + i, src: g.src, title: g.title || 'Imagen', date: '', type: TYPES[g.type] ? g.type : 'aprendizaje', desc: g.desc || '', local: false }));
    const loc = local.map(l => ({ id: l.id, src: l._url || (l._url = URL.createObjectURL(l.blob)), title: l.title, date: '', type: l.type, desc: l.desc, local: true }));
    items = [...pub, ...loc];
  }

  function render() {
    collect(); grid.replaceChildren();
    items.forEach((it, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'gcard rv'; b.dataset.tilt = '6'; b.style.setProperty('--d', (i % 4) * .06 + 's');
      b.setAttribute('aria-label', 'Abrir imagen: ' + it.title);
      b.innerHTML = '<img loading="lazy" decoding="async" alt="' + esc(it.title) + (it.desc ? '. ' + esc(it.desc) : '') + '" src="' + esc(it.src) + '"><span class="badge gc-b ' + it.type + '">' + TYPES[it.type] + '</span>' + (it.local ? '<span class="gc-local">Solo en tu navegador</span>' : '') + '<span class="gc-info"><b>' + esc(it.title) + '</b></span>';
      b.addEventListener('click', () => open(i)); grid.appendChild(b); window.JB.reveal(b);
    });
    // Espacios reservados para tus futuras imágenes
    const need = Math.max(0, (items.length ? 0 : 6) );
    for (let k = 0; k < need; k++) {
      const s = document.createElement('div'); s.className = 'slot rv'; s.style.setProperty('--d', k * .06 + 's');
      s.innerHTML = '<div><div class="plus">+</div><b>Espacio para tu imagen</b>Aquí aparecerán tus capturas y avances. Actívalas con el <i>Modo edición</i> o desde <code>js/config.js</code>.</div>';
      grid.appendChild(s); window.JB.reveal(s);
    }
  }

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox'), card = $('#lbCard');
  function open(i) {
    cur = (i + items.length) % items.length; const it = items[cur];
    card.innerHTML = '<div class="lb-img"><img alt="' + esc(it.title) + '" src="' + esc(it.src) + '"></div><div class="lb-side"><span class="badge ' + it.type + '" style="align-self:flex-start">' + TYPES[it.type] + '</span><h3>' + esc(it.title) + '</h3>' + '<p style="margin:0">' + (it.desc ? esc(it.desc) : '<span style="color:var(--muted)">Sin descripción.</span>') + '</p>' + (it.type === 'sim' ? '<div class="callout warn" style="margin:0">Esto es una <b>simulación</b>, no un resultado real.</div>' : '') + (it.type === 'real' ? '<div class="callout warn" style="margin:0">Los resultados pasados no garantizan resultados futuros. No es asesoría financiera.</div>' : '') +
      '<div class="lb-nav"><button class="btn btn-sm" type="button" data-a="prev" aria-label="Imagen anterior">←</button><button class="btn btn-sm" type="button" data-a="next" aria-label="Imagen siguiente">→</button>' + (it.local && editing ? '<button class="btn btn-sm" type="button" data-a="del">🗑 Eliminar</button>' : '') + '<button class="btn btn-sm btn-primary" type="button" data-close>Cerrar</button></div></div>';
    if (!lb.classList.contains('open')) window.JB.openModal(lb);
    else { card.style.animation = 'none'; void card.offsetWidth; card.style.animation = ''; }
  }
  card.addEventListener('click', async e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    if (b.dataset.a === 'prev') open(cur - 1); else if (b.dataset.a === 'next') open(cur + 1);
    else if (b.dataset.a === 'del') {
      const it = items[cur]; if (!confirm('¿Eliminar esta imagen de tu navegador?')) return;
      await DB.del(it.id); local = local.filter(l => l.id !== it.id); window.JB.closeModal(lb); render(); window.JB.toast('Imagen eliminada');
    }
  });
  document.addEventListener('keydown', e => { if (!lb.classList.contains('open')) return; if (e.key === 'ArrowLeft') open(cur - 1); if (e.key === 'ArrowRight') open(cur + 1); });

  /* ---------- Modo edición ---------- */
  const panel = $('#editPanel'), tgl = $('#editToggle'), drop = $('#drop'), fileIn = $('#fileIn');
  tgl.addEventListener('click', () => { editing = !editing; panel.hidden = !editing; tgl.setAttribute('aria-pressed', editing); tgl.textContent = editing ? '✅ Salir del modo edición' : '✏️ Modo edición (solo yo)'; setTimeout(() => window.JB.refreshLayout && window.JB.refreshLayout(), 50); });

  function shrink(file, max) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob(b => b ? res(b) : rej(new Error('blob')), 'image/jpeg', .86);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); }; img.src = url;
    });
  }
  async function addFiles(files) {
    files = Array.from(files).filter(f => f.type.startsWith('image/')); if (!files.length) return window.JB.toast('Elige archivos de imagen');
    if (!DB.db) return window.JB.toast('Tu navegador no permite guardar imágenes aquí (¿modo privado?)');
    const title = $('#upTitle').value.trim(), date = '', type = $('#upType').value, desc = $('#upDesc').value.trim(); let n = 0;
    for (const f of files) {
      try {
        const blob = await shrink(f, 1600), rec = { id: 'l' + Date.now() + Math.random().toString(36).slice(2, 6), blob, title: title || f.name.replace(/\.[^.]+$/, ''), date, type, desc };
        if (await DB.put(rec)) { local.push(rec); n++; }
      } catch (e) { /* imagen no válida */ }
    }
    render(); window.JB.toast(n ? n + (n === 1 ? ' imagen añadida' : ' imágenes añadidas') : 'No se pudo añadir');
    fileIn.value = ''; $('#upTitle').value = ''; $('#upDesc').value = '';
  }
  fileIn.addEventListener('change', () => addFiles(fileIn.files));
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => addFiles(e.dataTransfer.files));

  render();
  DB.open().then(async ok => { if (ok) { local = await DB.all(); render(); } });
})();
