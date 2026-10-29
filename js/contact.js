/* =====================================================================
   contact.js · comunidad, WhatsApp por tema y redes (todo viene de js/config.js)
   Si un valor está vacío se muestra un aviso: nunca se inventan enlaces.
   ===================================================================== */
(function () {
  'use strict';
  const { $, $$, cfg } = window.JB;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const validUrl = u => /^(https?:\/\/|mailto:|tel:)/i.test(u || '');
  const external = a => { a.target = '_blank'; a.rel = 'noopener noreferrer'; };

  /* Comunidad (todos los botones ÚNETE GRATIS) */
  $$('[data-join]').forEach(a => {
    if (validUrl(cfg.communityUrl)) { a.href = cfg.communityUrl; external(a); }
    else if (a.dataset.join === 'main') a.addEventListener('click', e => { e.preventDefault(); window.JB.notConfigured('¡La comunidad abre muy pronto!', 'Estamos terminando de preparar el enlace de la comunidad gratuita. Vuelve en unos días o escríbeme por mis redes.', 'abre js/config.js y pega tu enlace en communityUrl.'); });
  });

  /* Clases gratis de trading: enlace propio o, si está vacío, la comunidad */
  $$('[data-classes]').forEach(a => { const u = validUrl(cfg.freeClassesUrl) ? cfg.freeClassesUrl : cfg.communityUrl; if (validUrl(u)) { a.href = u; external(a); } else a.addEventListener('click', e => { e.preventDefault(); window.JB.notConfigured('Las clases abren muy pronto', 'Estamos preparando el enlace. Escríbeme por WhatsApp y te cuento.', 'pega tu enlace en freeClassesUrl o communityUrl.'); }); });
  /* Portal de herramientas con IA */
  $$('[data-ai]').forEach(a => { if (validUrl(cfg.aiToolsUrl)) { a.href = cfg.aiToolsUrl; external(a); } else a.addEventListener('click', e => { e.preventDefault(); window.JB.notConfigured('Muy pronto', 'Estamos preparando este enlace. Escríbeme por WhatsApp y te cuento.', 'pega tu enlace en aiToolsUrl dentro de js/config.js.'); }); });
  /* Libro Premium ARC */
  $$('[data-premium]').forEach(a => { if (validUrl(cfg.premiumArcUrl)) { a.href = cfg.premiumArcUrl; external(a); } });

  /* WhatsApp por tema (Trading, Marketing, Habilidades digitales) */
  $$('[data-niche]').forEach(a => {
    const u = (cfg.nicheLinks || {})[a.dataset.niche];
    if (validUrl(u)) { a.href = u; external(a); }
    else a.addEventListener('click', e => { e.preventDefault(); window.JB.notConfigured('WhatsApp aún no está disponible', 'Muy pronto podrás escribirme directamente desde aquí.', 'pega el enlace en nicheLinks dentro de js/config.js.'); });
  });

  /* WhatsApp directo con mensaje editable (solo si hay número configurado) */
  const num = String(cfg.whatsappNumber || '').replace(/\D/g, '');
  if (num.length >= 8) {
    const box = $('#waBox'), msg = $('#waMsg'), wa = $('#waBtn'); box.hidden = false; msg.value = cfg.whatsappMessage || '';
    const set = () => { wa.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg.value.trim()); }; set(); msg.addEventListener('input', set);
  }

  /* Redes sociales (barra fija, pie, comunidad y contacto) */
  const social = { instagram: cfg.instagramUrl, tiktok: cfg.tiktokUrl, facebook: cfg.facebookUrl }, names = { instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook' };
  $$('[data-social]').forEach(a => {
    const k = a.dataset.social, u = social[k];
    if (validUrl(u)) { a.href = u; external(a); }
    else { a.classList.add('empty'); a.addEventListener('click', e => { e.preventDefault(); window.JB.notConfigured(names[k] + ' aún no está disponible', 'Pronto compartiré aquí mi perfil de ' + names[k] + '.', 'pega tu enlace en ' + k + 'Url dentro de js/config.js.'); }); }
  });
  $$('[data-link]').forEach(a => {
    const k = a.dataset.link, u = social[k]; if (!u && !validUrl(u)) { }
    if (validUrl(u)) { a.href = u; external(a); const s = a.querySelector('[data-small]'); if (s) s.textContent = 'Sígueme en ' + names[k]; }
    else { a.classList.add('empty'); a.addEventListener('click', e => { e.preventDefault(); window.JB.notConfigured(names[k] + ' aún no está disponible', 'Pronto compartiré aquí mi perfil de ' + names[k] + '.', 'pega tu enlace en ' + k + 'Url dentro de js/config.js.'); }); }
  });
  const other = $('#otherLinks');
  (cfg.otherLinks || []).filter(l => l && validUrl(l.url)).forEach(l => {
    const a = document.createElement('a'); a.className = 'link-card'; a.href = l.url; external(a);
    a.innerHTML = '<span class="li">' + esc(l.icon || '🔗') + '</span><span>' + esc(l.label) + '<small>Abrir enlace</small></span>'; other.appendChild(a);
  });
  if (!other.children.length) {
    const s = document.createElement('div'); s.className = 'link-card empty'; s.style.cursor = 'default';
    s.innerHTML = '<span class="li">🔗</span><span>Otros enlaces<small>Espacio para YouTube, Linktree, correo… (js/config.js → otherLinks)</small></span>'; other.appendChild(s);
  }
})();
