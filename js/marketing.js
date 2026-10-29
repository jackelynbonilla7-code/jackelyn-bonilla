/* =====================================================================
   marketing.js · tarjetas educativas, plan semanal y generador de ideas
   ===================================================================== */
(function () {
  'use strict';
  const { $, $$, store } = window.JB;

  const cards = [
    ['🚀', 'Qué es el marketing digital', 'Dar a conocer una persona, un negocio o un producto usando canales digitales.', ['Sirve para marcas personales, negocios y productos físicos o digitales.', 'Pilares: contenido, redes, comunidad, oferta y medición.', 'No es vender a toda costa: es ayudar a la persona correcta a encontrarte y confiar.']],
    ['✨', 'Marca personal y marca de negocio', 'Quién eres tú y qué representa lo que ofreces: ambas se construyen igual.', ['Marca personal: tu historia, tus valores y tu forma de enseñar o crear.', 'Marca de negocio: nombre, estilo visual, promesa y trato al cliente.', 'Autenticidad: cuenta lo real, sin inventar logros ni reseñas.']],
    ['🎯', 'Público y propuesta de valor', 'Si le hablas a todos, no le hablas a nadie. Define a quién ayudas y cómo.', ['Describe a tu cliente ideal: quién es, qué problema tiene y dónde está.', 'Propuesta de valor: “Ayudo a [quién] a [lograr qué] con [cómo]”.', 'Escucha preguntas reales: son tus mejores ideas de contenido.']],
    ['📦', 'Productos físicos y digitales', 'Cada tipo de producto se muestra y se explica de forma distinta.', ['Físico: fotos y videos reales, detrás de cámaras, tallas, envíos y reseñas.', 'Digital (guías, cursos, plantillas): adelanta contenido de valor y muestra el resultado.', 'En ambos: precio claro, beneficios concretos y una forma fácil de comprar o escribir.']],
    ['📱', 'Contenido para Instagram y TikTok', 'Videos cortos, carruseles e historias que enseñan, inspiran o muestran tu producto.', ['Estructura: gancho (0-3 s) → valor → llamada a la acción.', 'Subtítulos, luz natural y formato vertical 9:16.', 'Graba por lotes y reutiliza una idea en varios formatos.']],
    ['💡', 'Ideas para reels, historias y publicaciones', 'Fórmulas listas para marcas, negocios y productos.', ['Detrás de cámaras: cómo se hace o se prepara tu producto.', 'Preguntas frecuentes de clientes, errores comunes y mitos.', 'Antes y después reales, casos de uso y reseñas con permiso.']],
    ['✍️', 'Textos y llamadas a la acción', 'Las palabras convierten una visita en una conversación.', ['Fórmula AIDA: Atención, Interés, Deseo, Acción.', 'CTA clara: verbo + beneficio (“Escríbeme y te cuento cómo empezar”).', 'Evita promesas exageradas: dañan tu credibilidad.']],
    ['🤝', 'Ofertas, ventas y embudo', 'Vender sin presionar: primero valor, luego una oferta clara.', ['Embudo: te descubren → confían → preguntan → compran.', 'Una oferta clara: qué incluye, para quién es, precio y cómo comprar.', 'Prueba social honesta: reseñas y resultados reales, nunca inventados.']],
    ['🗓️', 'Calendario y herramientas', 'La constancia nace de la planificación y de buenas herramientas.', ['Define una frecuencia realista y un pilar por día.', 'Diseño y edición: Canva y CapCut. Organización: Notion o Calendar.', 'Mide cada semana: alcance, guardados, mensajes y ventas.']]
  ];
  const grid = $('#mkGrid'); let openCard = null;
  const closeCards = () => { if (openCard) { openCard.classList.remove('open'); const b = openCard.querySelector('.more-btn'); b.setAttribute('aria-expanded', 'false'); b.querySelector('.mb-t').textContent = 'Ver más'; b.querySelector('.mb-ic').textContent = '＋'; clearTimeout(openCard._t); openCard = null; } };
  cards.forEach(([ico, t, s, list], i) => {
    const c = document.createElement('article'); c.className = 'mk-card glass rv'; c.dataset.tilt = '6'; c.style.setProperty('--d', (i % 3) * .08 + 's');
    const id = 'mk' + i;
    c.innerHTML = '<span class="hud tl"></span><span class="hud br"></span><div class="mk-ico pop" aria-hidden="true">' + ico + '</div><h3 class="pop-s">' + t + '</h3><p>' + s + '</p><div class="mk-more" id="' + id + '"><ul>' + list.map(x => '<li>' + x + '</li>').join('') + '</ul></div><button class="more-btn" type="button" aria-expanded="false" aria-controls="' + id + '"><span class="mb-ic" aria-hidden="true">＋</span><span class="mb-t">Ver más</span></button>';
    const b = c.querySelector('.more-btn');
    b.addEventListener('click', e => {
      e.stopPropagation(); const wasOpen = c === openCard; closeCards();
      if (!wasOpen) { c.classList.add('open'); b.setAttribute('aria-expanded', 'true'); b.querySelector('.mb-t').textContent = 'Volver'; b.querySelector('.mb-ic').textContent = '－'; openCard = c; c._t = setTimeout(closeCards, 15000); }
      setTimeout(() => window.JB.refreshLayout && window.JB.refreshLayout(), 650);
    });
    grid.appendChild(c); window.JB.reveal(c);
  });
  document.addEventListener('click', e => { if (openCard && !e.target.closest('.mk-card')) closeCards(); });

  /* ---------- Plan semanal ---------- */
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], pilars = ['—', 'Aprendizaje', 'Detrás de cámaras', 'Mentalidad', 'Herramientas', 'Comunidad', 'Descanso'], fmts = ['—', 'Reel / TikTok', 'Carrusel', 'Historias', 'Publicación', 'En vivo'];
  const KEY = 'jb-week'; let plan = store.get(KEY, null) || days.map(() => ({ p: 0, f: 0, i: '' }));
  const wk = $('#week');
  days.forEach((d, i) => {
    const div = document.createElement('div'); div.className = 'day';
    div.innerHTML = '<b>' + d + '</b><select aria-label="Pilar del ' + d + '">' + pilars.map((x, k) => '<option value="' + k + '">' + x + '</option>').join('') + '</select><select aria-label="Formato del ' + d + '">' + fmts.map((x, k) => '<option value="' + k + '">' + x + '</option>').join('') + '</select><input type="text" maxlength="60" placeholder="Idea…" aria-label="Idea del ' + d + '">';
    const [sp, sf, inp] = div.querySelectorAll('select,input');
    sp.value = plan[i].p; sf.value = plan[i].f; inp.value = plan[i].i;
    const save = () => { plan[i] = { p: +sp.value, f: +sf.value, i: inp.value }; store.set(KEY, plan); };
    [sp, sf].forEach(x => x.addEventListener('change', save)); inp.addEventListener('input', save);
    wk.appendChild(div);
  });
  $('#calCopy').addEventListener('click', () => {
    const txt = 'Mi plan semanal de contenido\n' + days.map((d, i) => d + ': ' + (plan[i].p || plan[i].f || plan[i].i ? [pilars[plan[i].p], fmts[plan[i].f], plan[i].i].filter(x => x && x !== '—').join(' · ') : 'libre')).join('\n');
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => window.JB.toast('Plan copiado ✨'), () => {
      const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); window.JB.toast('Plan copiado ✨'); } catch (e) { window.JB.toast('No se pudo copiar'); } ta.remove();
    });
  });
  $('#calClear').addEventListener('click', () => { plan = days.map(() => ({ p: 0, f: 0, i: '' })); store.set(KEY, plan); $$('.day').forEach(d => { const [a, b, c] = d.querySelectorAll('select,input'); a.value = 0; b.value = 0; c.value = ''; }); window.JB.toast('Plan vaciado'); });

  /* ---------- Generador de ideas ---------- */
  const F = ['Reel / TikTok de 30 s', 'Carrusel de 6 diapositivas', 'Serie de historias con encuesta', 'Publicación con checklist guardable', 'Video en vivo de preguntas'];
  const P = ['Aprendizaje', 'Detrás de cámaras', 'Mentalidad y hábitos', 'Herramientas', 'Comunidad'];
  const H = ['“Así se hace (o se prepara) lo que vendo, paso a paso”', '“La pregunta que más me hacen mis clientes”', '“3 errores que cometí al empezar a aprender…”', '“Lo que haría distinto si empezara hoy”', '“Mito vs. realidad sobre…”', '“Mi rutina de estudio de 1 hora, paso a paso”', '“Una herramienta gratuita que me ahorra tiempo”', '“Responde en comentarios: ¿cuál es tu mayor duda sobre…?”', '“Resumen en 30 segundos de lo que aprendí esta semana”', '“Checklist para no perderte al empezar”'];
  const C = ['Guarda esta publicación para tu próxima sesión de estudio.', 'Cuéntame en comentarios cuál te ha pasado a ti.', 'Envíaselo a alguien que esté empezando contigo.', 'Únete a la comunidad gratuita desde el enlace de mi perfil.'];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  $('#ideaBtn').addEventListener('click', () => {
    const o = $('#ideaOut'); o.innerHTML = '';
    const t1 = document.createElement('span'); t1.className = 'tag'; t1.textContent = pick(F);
    const t2 = document.createElement('span'); t2.className = 'tag'; t2.textContent = 'Pilar: ' + pick(P);
    const p1 = document.createElement('p'); p1.style.cssText = 'margin:8px 0 6px;font-weight:700'; p1.textContent = 'Gancho: ' + pick(H);
    const p2 = document.createElement('p'); p2.style.cssText = 'margin:0;color:var(--p-300)'; p2.textContent = 'Cierre: ' + pick(C);
    o.append(t1, t2, p1, p2);
  });

  /* ---------- Sub-ventanas de marketing ---------- */
  const tabs = $$('#mkTabs button');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); $('#' + x.dataset.p).hidden = !on; });
    const p = $('#' + t.dataset.p); p.style.animation = 'none'; void p.offsetWidth; p.style.animation = '';
  }));
})();
