/* =====================================================================
   nextbtn.js · botón «Siguiente» al final de cada módulo (Trading, Marketing, Mentalidad)
   Abre la siguiente pestaña y vuelve al inicio del módulo; en el último pasa a la siguiente ventana.
   ===================================================================== */
(function () {
  'use strict';
  const { $, $$ } = window.JB;
  const groups = [
    { tabs: '#tradeTabs .tab', panel: t => t.getAttribute('aria-controls'), label: t => t.textContent.replace(/^\d+/, '').trim(), after: 'trading' },
    { tabs: '.mk-tabs [role="tab"], #mkTabs [role="tab"]', panel: t => t.dataset.p, label: t => t.textContent.trim(), after: 'marketing' },
    { tabs: '#mindTabs [role="tab"]', panel: t => t.dataset.p, label: t => t.textContent.trim(), after: 'mentalidad' }
  ];
  groups.forEach(g => {
    const tabs = $$(g.tabs); if (tabs.length < 2) return;
    const nextView = id => { const o = window.JB.ORDER, i = o.indexOf(id); return o[i + 1]; };
    tabs.forEach((t, i) => {
      const p = $('#' + g.panel(t)); if (!p) return;
      const last = i === tabs.length - 1, nv = nextView(g.after);
      if (last && !nv) return;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-primary next-mod';
      const name = last ? (window.JB.LABELS[nv] || nv) : g.label(tabs[i + 1]);
      b.innerHTML = '<span><small>Siguiente</small>' + name.replace(/</g, '&lt;') + '</span><i aria-hidden="true">→</i>';
      b.addEventListener('click', () => {
        if (last) { window.JB.go(nv); return; }
        tabs[i + 1].click();
        // sube al inicio del módulo que sigue (en teléfono, a la fila de pestañas; en pantalla grande, al panel)
        requestAnimationFrame(() => {
          const np = $('#' + g.panel(tabs[i + 1])), list = tabs[i + 1].closest('[role="tablist"]');
          const el = (window.innerWidth <= 900 && list) ? list : np;
          const nav = $('#nav'), off = (nav ? nav.offsetHeight : 70) + 12;
          window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - off), behavior: window.JB.reduced ? 'auto' : 'smooth' });
        });
      });
      const wrap = document.createElement('div'); wrap.className = 'next-mod-wrap'; wrap.appendChild(b); p.appendChild(wrap);
    });
  });
})();
