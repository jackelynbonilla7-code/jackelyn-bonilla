/* =====================================================================
   ✏️  CONFIGURACIÓN DEL SITIO  ·  Jackelyn Bonilla
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas editar para poner tus datos.
   Mientras un valor esté vacío (""), el botón correspondiente mostrará
   un aviso amable en lugar de abrir un enlace falso.
   ===================================================================== */
window.SITE_CONFIG = {

  /* ✏️ 1) COMUNIDAD GRATUITA — pega aquí el enlace real (WhatsApp, Telegram, Discord, Skool, etc.)
     Ejemplo: "https://chat.whatsapp.com/XXXXXXXX" */
  communityUrl: "https://chat.whatsapp.com/DC9s8w0CxK4F76jOUMNNHV",
  /* Botón «QUIERO ACCEDER A LAS CLASES GRATIS»: pega aquí tu enlace real. Si lo dejas vacío, usa la comunidad. */
  freeClassesUrl: "",
  /* Libro Premium ARC: enlace directo a tu WhatsApp */
  premiumArcUrl: "https://wa.link/4cbbty",
  /* Portal de herramientas con IA para analizar el mercado (WhatsApp) */
  aiToolsUrl: "https://wa.link/8s9050",

  /* ✏️ 2) WHATSAPP — número con código de país, SOLO dígitos (sin +, espacios ni guiones).
     Ejemplo México: "5215512345678"  ·  Ejemplo Colombia: "573001234567" */
  whatsappNumber: "",
  /* Mensaje inicial (la persona puede editarlo antes de enviarlo) */
  whatsappMessage: "¡Hola Jackelyn! Vi tu página web y me gustaría saber más sobre tu comunidad.",

  /* ✏️ 3) REDES SOCIALES — pega la URL completa de tu perfil */
  instagramUrl: "https://www.instagram.com/soyjackelyn.bonilla?mdxt=Z29jYzVzMnNvbTIz",
  tiktokUrl: "https://www.tiktok.com/@jackelyn.networke?_r=1&_t=ZS-9Atf61fcow1",
  facebookUrl: "https://www.facebook.com/share/19odMCa4XA/",

  /* ✏️ 3b) ENLACES DE WHATSAPP POR TEMA (botones en cada ventana) */
  nicheLinks: {
    trading: "https://wa.link/vmo7ij",
    marketing: "https://wa.link/2t1z6w",
    habilidades: "https://wa.link/w5k7v0",
    general: "https://wa.link/oc2qlu"   // WhatsApp general (contacto directo)
  },

  /* ✏️ 4) OTROS ENLACES DE INTERÉS (YouTube, Linktree, correo, etc.). Agrega los que quieras.
     Ejemplo: { label: "YouTube", url: "https://youtube.com/@tu_canal", icon: "▶" } */
  otherLinks: [
    // { label: "YouTube", url: "", icon: "▶" },
    // { label: "Correo",  url: "mailto:tucorreo@ejemplo.com", icon: "✉" },
  ],

  /* ✏️ 5) ROBOT — por defecto se usa el robot animado incluido (SVG).
     Si quieres usar tu propia imagen del robot (PNG con fondo transparente),
     guárdala en assets/img/ y escribe aquí su ruta. Ejemplo: "assets/img/robot.png" */
  robotImage: "assets/img/robot.webp",

  /* ✏️ 6) BIBLIOTECA PDF
     Los 4 PDF ya están generados en assets/pdf/ y se pueden LEER dentro de la página (lector con páginas)
     y DESCARGAR. Para AÑADIR otro PDF (disciplina, habilidades digitales…):
       1. Copia tu archivo a assets/pdf/  (ej. assets/pdf/disciplina.pdf)
       (Opcional: externalUrl: "https://…" añade un botón que abre un enlace externo, p. ej. Canva)
       2. Ejecuta:  python3 tools/build_reader.py  (agrega tu PDF en la lista "books" del script)
          para crear las imágenes del lector en assets/read/<id>/
       3. Cambia en el libro correspondiente:  available:true, file:"assets/pdf/disciplina.pdf",
          reader:{ dir:"assets/read/disciplina", count: NÚMERO_DE_PÁGINAS }
     art = ilustración de la portada: "candles" | "phone" | "steps" | "zone" | "spark" */
  library: [
    {
      id: "trading", art: "candles",
      title: "Trading desde cero", kicker: "PDF 1 · Guía educativa", tag: "Educación",
      description: "Guía completa para principiantes: mercados, gráficos, velas, riesgo y psicología, más plan de trading, bitácora, backtesting en demo, uso responsable de IA y copy trading y una ruta de 90 días. Todo con ejemplos simulados, ejercicios y glosario.",
      color: ["#7c3aed", "#2e1065"],
      available: true, file: "assets/pdf/trading-desde-cero.pdf", pages: 19, reader: { dir: "assets/read/trading", count: 19, preview: 4 },
      chapters: ["Qué es el trading (y qué no)", "Vocabulario esencial", "Mercados y pares de divisas", "Cómo leer un gráfico", "Velas japonesas", "Tendencias, soportes y resistencias", "Ejemplos de análisis", "Gestión del riesgo", "Psicología y disciplina", "Tu plan y tu bitácora", "Práctica y backtesting en demo", "IA y copy trading con criterio", "Errores comunes de principiantes", "Ruta de 90 días"]
    },
    {
      id: "marketing", art: "phone",
      title: "Marketing digital: domina Instagram y TikTok", short: "Marketing digital", kicker: "PDF 2 · Guía práctica", tag: "Contenido",
      description: "Ebook de 20 páginas: domina Instagram y TikTok, crea contenido que conecte y aprende a vender en redes sociales. Incluye propósito y mentalidad, equipos, errores comunes, audiencia, pilares, ganchos, CTA, textos, audios, estructura de videos, SEO, marca personal, productos y servicios, negocio digital, estrategias para vender, calendario y medición.",
      color: ["#a855f7", "#3b0764"],
      available: true, file: "assets/pdf/marketing-digital-desde-cero.pdf", pages: 20, reader: { dir: "assets/read/marketing", count: 20, preview: 4 },
      chapters: ["Propósito, mentalidad y fe", "Equipos para crear contenido", "Errores comunes", "Encuentra a tu audiencia", "Los cuatro pilares del contenido", "Ganchos que captan la atención", "Llamadas a la acción", "Textos y pies de publicación", "Audios en tendencia y voz en off", "Cómo estructurar tus videos", "Cuándo publicar", "SEO y palabras clave", "Creación de marca personal", "Productos y servicios", "Cómo crear un negocio digital", "Estrategias de contenido para vender", "Calendario y frecuencia", "Medición y mejora de resultados"]
    },
    {
      id: "habitos", art: "steps",
      externalUrl: "https://canva.link/nzagejae7ub2osf", externalLabel: "Abrir el libro",
      title: "Hábitos atómicos: guía de ideas clave", short: "Hábitos atómicos", kicker: "PDF 3 · Lectura recomendada", tag: "Hábitos",
      description: "Guía de estudio independiente inspirada en el libro «Hábitos atómicos» de James Clear: identidad, el bucle del hábito, las cuatro leyes del cambio y un plan de acción de 4 semanas con plantillas. No reemplaza al libro original.",
      color: ["#8b5cf6", "#1e1b4b"],
      available: true, file: "assets/pdf/habitos-atomicos-guia.pdf", pages: 13, reader: { dir: "assets/read/habitos", count: 13, preview: 4 },
      chapters: ["La idea central: pequeños cambios, grandes resultados", "Identidad: quién quieres ser", "El bucle del hábito y las cuatro leyes", "Primera ley: hazlo obvio", "Segunda ley: hazlo atractivo", "Tercera ley: hazlo fácil", "Cuarta ley: hazlo satisfactorio", "La zona justa de dificultad", "Hábitos para traders y creadoras", "Plan de 4 semanas y plantillas"]
    },
    {
      id: "zona", art: "zone",
      externalUrl: "https://canva.link/sdz6ja1vb2zqesq", externalLabel: "Abrir el libro",
      title: "Trading en la zona: guía de ideas clave", short: "Trading en la zona", kicker: "PDF 4 · Lectura recomendada", tag: "Psicología",
      description: "Guía de estudio independiente inspirada en «Trading en la zona» de Mark Douglas: mentalidad de probabilidades, manejo del miedo, aceptación del riesgo y consistencia. Incluye ejercicios y diario de emociones. No reemplaza al libro original. Contenido educativo, sin garantías de ganancias.",
      color: ["#6d28d9", "#0f0a2e"],
      available: true, file: "assets/pdf/trading-en-la-zona-guia.pdf", pages: 12, reader: { dir: "assets/read/zona", count: 12, preview: 4 },
      chapters: ["La idea central: el mayor reto es mental", "Por qué fallan tantos traders", "Las cinco verdades fundamentales", "Pensar en probabilidades", "El miedo en el trading", "Aceptar el riesgo antes de entrar", "Creencias y entrenamiento mental", "Consistencia: ejecutar el plan", "Ejercicios y plantillas"]
    },
    {
      id: "premium-arc", art: "spark", cover: "assets/img/cover-premium-arc.webp",
      title: "Premium ARC", short: "Premium ARC", kicker: "Libro Premium · Sistema ARC", tag: "Premium",
      description: "El libro Premium del sistema ARC: Aprende, Resultados y Constancia. Escríbeme por WhatsApp y te cuento qué incluye y cómo conseguirlo.",
      color: ["#ef4444", "#450a0a"],
      available: true, externalOnly: true, externalUrl: "https://wa.link/4cbbty", externalLabel: "Quiero el Premium ARC por WhatsApp",
      chapters: ["Aprende: estudia con método", "Resultados: mide y ajusta", "Constancia: sigue cada día"]
    },
    /* ----- ESPACIOS PARA FUTUROS PDF (aún no disponibles) ----- */
    { id: "disciplina", art: "spark", title: "Disciplina", kicker: "Próximamente", tag: "Pronto", description: "Espacio reservado para un futuro PDF sobre disciplina.", color: ["#5b21b6", "#1e1b4b"], available: false, file: "", chapters: [] },
    { id: "habilidades", art: "spark", title: "Habilidades digitales", kicker: "Próximamente", tag: "Pronto", description: "Espacio reservado para un futuro PDF sobre desarrollo de habilidades digitales.", color: ["#7e22ce", "#1e1b4b"], available: false, file: "", chapters: [] }
  ],

  /* ✏️ 7) GALERÍA DE RESULTADOS — imágenes PÚBLICAS (visibles para todas las personas)
     1. Copia tu imagen a assets/gallery/  (ej. assets/gallery/captura-1.jpg)
     2. Añade un bloque aquí. type puede ser: "real" (resultado real), "sim" (simulación) o "aprendizaje".
     Ejemplo:
       { src: "assets/gallery/captura-1.jpg", title: "Práctica en demo", date: "2026-03-14", type: "sim",
         desc: "Operación en cuenta demo para practicar gestión del riesgo." }
     (Las imágenes que subas desde el botón "Modo edición" de la página solo se guardan en TU navegador.) */
  gallery: [
    { src: "assets/gallery/resultado-1.webp", title: "Operaciones en oro (XAU/USD)", type: "real",
      desc: "Captura compartida en el grupo de la comunidad: «+$200 antes de empezar la semana»." },
    { src: "assets/gallery/resultado-2.webp", title: "Resumen de operaciones en oro", type: "real",
      desc: "Captura compartida en el grupo de la comunidad: «Es domingo y ya con más de 180»." },
    { src: "assets/gallery/resultado-3.webp", title: "Resumen de balance", type: "real",
      desc: "Captura de resumen de cuenta compartida en la comunidad." },
    { src: "assets/gallery/resultado-4.webp", title: "Historial de posiciones en oro", type: "real",
      desc: "Captura del historial de la plataforma compartida en la comunidad." },
    { src: "assets/gallery/resultado-5.webp", title: "Posiciones abiertas en BTC/USD", type: "real",
      desc: "Captura de posiciones y estado de cuenta compartida en la comunidad." },
    { src: "assets/gallery/analisis-btc.webp", title: "Análisis en TradingView (BTC/USD)", type: "aprendizaje",
      desc: "Ejemplo de análisis con zonas, stop y objetivo. Es material educativo, no una recomendación de operación." },
    { src: "assets/img/foto-8.webp", title: "Estudiando gráficas en la cafetería", type: "aprendizaje", desc: "Foto de mi día a día: repasando una gráfica en el celular. Es una imagen de aprendizaje, no un resultado." },
    { src: "assets/img/foto-6.webp", title: "Mi espacio de aprendizaje", type: "aprendizaje", desc: "Foto con mi laptop y mi celular mientras estudio y practico." }
  ]
};
