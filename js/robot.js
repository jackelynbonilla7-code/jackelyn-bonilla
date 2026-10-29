/* =====================================================================
   robot.js · asistente visual
   IMPORTANTE: el robot muestra mensajes PROGRAMADOS para guiar a la persona.
   No es un chatbot de inteligencia artificial y no procesa preguntas.
   ===================================================================== */
(function () {
  'use strict';
  const { $, $$, cfg } = window.JB;
  const robot = $('#robot'), bubble = $('#bubble'), text = $('#bubbleText'), body = $('#robotBody');
  if (!robot) return;

  // Imagen propia del robot (opcional, ver config.js)
  if (cfg.robotImage) {
    body.innerHTML = '<img class="robot-img" src="' + cfg.robotImage + '" alt="JACK, el robot asistente de Jackelyn" style="width:100%;height:auto">';
  }

  const welcome = [
    '¡Hola! Soy JACK, el robot de Jackelyn 💜',
    'Aquí aprendes habilidades digitales, trading y marketing desde cero.',
    '¿Listo? Pulsa «Comenzar» y recorre la página ventana por ventana 👇'
  ];
  const tips = {
    'trading': 'Perfecto: en Trading practicas con gráficos y ejemplos simulados. ¡Sin riesgo real!',
    'marketing': '¡Genial! Te espera un generador de ideas y un plan semanal de contenido.',
    'mentalidad': 'Hábitos y psicología del trader: ¡entrena tu mente con herramientas visuales! 🧠',
    'habilidades': 'El mundo cambia rápido. Con el sistema ARC: Aprende, Resultados y Constancia 🔁',
    'biblioteca': 'Dos guías PDF completas, con ejercicios y glosario. 📚',
    'comunidad': 'La comunidad es gratuita. ¡Aprendemos mejor en equipo!'
  };
  let typing = 0, idleT = 0, step = 0;

  function say(msg, hold) {
    clearTimeout(typing); clearTimeout(idleT);
    bubble.classList.remove('hide', 'typed'); text.textContent = '';
    if (window.JB.reduced) { text.textContent = msg; bubble.classList.add('typed'); }
    else {
      let i = 0;
      (function type() { text.textContent = msg.slice(0, ++i); if (i < msg.length) typing = setTimeout(type, 22); else bubble.classList.add('typed'); })();
    }
    if (hold !== true) idleT = setTimeout(() => bubble.classList.add('hide'), 6500 + msg.length * 40);
  }
  function intro() {
    say(welcome[0], true);
    setTimeout(() => say(welcome[1], true), 2800);
    setTimeout(() => say(welcome[2]), 5700);
  }
  window.addEventListener('jb:ready', () => setTimeout(intro, 900));

  // Tras clic en un chip del robot o del asistente flotante
  window.JB.afterGo = id => { if (tips[id]) say(tips[id], true); };

  // Ojos que siguen el cursor (o el dedo al tocar)
  let ex = 0, ey = 0, eTick = 0;
  function eyes(cx, cy) {
    const r = robot.getBoundingClientRect(), x = (cx - (r.left + r.width / 2)) / innerWidth, y = (cy - (r.top + r.height * .4)) / innerHeight;
    ex = Math.max(-1, Math.min(1, x * 3)) * 7; ey = Math.max(-1, Math.min(1, y * 3)) * 5;
    if (!eTick) eTick = requestAnimationFrame(() => { eTick = 0; robot.style.setProperty('--eye-x', ex.toFixed(1) + 'px'); robot.style.setProperty('--eye-y', ey.toFixed(1) + 'px'); });
  }
  if (!window.JB.reduced) {
    window.addEventListener('pointermove', e => eyes(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchstart', e => { const t = e.touches[0]; if (t) eyes(t.clientX, t.clientY); }, { passive: true });
  }

  // Al hacer clic en el robot, responde con un mensaje programado
  const lines = ['¡Hola de nuevo! 👋', 'Recuerda: el trading siempre tiene riesgo. Aprende primero, practica en demo.', 'Tip: la constancia gana a la perfección ✨', 'Prueba el tracker de hábitos en Mentalidad 🧠', 'Soy JACK, un asistente visual con mensajes programados, ¡no un chatbot!'];
  robot.addEventListener('click', () => { say(lines[step++ % lines.length]); body.style.animationPlayState = 'running'; });
  robot.style.cursor = 'pointer';

  // Panel flotante (visible tras pasar el inicio)
  const btn = $('#assistBtn'), panel = $('#assistPanel');
  btn.addEventListener('click', () => { const o = panel.classList.toggle('open'); btn.setAttribute('aria-expanded', String(o)); });
  document.addEventListener('click', e => { if (!e.target.closest('#assist')) { panel.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) { panel.classList.remove('open'); btn.focus(); } });

  // Mensaje programado del asistente flotante según la ventana (no es un chatbot)
  const byView = {
    'inicio': '¡Soy JACK! Pulsa «Comenzar» para recorrer la página ventana por ventana.',
    'sobre-mi': 'Esta es mi historia: ¿por qué elegí el mundo digital?',
    'habilidades': 'El mundo cambia rápido. Con el sistema ARC: Aprende, Resultados y Constancia 🔁',
    'trading': 'Trading educativo: practica en demo y cuida siempre tu capital.',
    'clases': 'Aquí están las clases gratis de trading: fundamentos, gráficos, riesgo y psicología. ¡Pulsa el botón morado!',
    'marketing': 'Marketing digital: del gancho a la llamada a la acción.',
    'mentalidad': 'Hábitos y probabilidades: entrena tu mente cada día 🧠',
    'resultados': 'Aquí verás mis avances. Cada imagen indica si es real, simulada o de aprendizaje.',
    'biblioteca': 'Cuatro guías para leer aquí mismo o descargar gratis 📚',
    'comunidad': 'La comunidad es gratuita. ¡Aprendamos juntos! 💜',
    'contacto': 'Escríbeme por WhatsApp o sígueme en mis redes.'
  };
  window.addEventListener('jb:view', e => { const m = $('#assistMsg'); if (m && byView[e.detail.id]) m.textContent = byView[e.detail.id]; });
})();
