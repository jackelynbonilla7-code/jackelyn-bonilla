# Guía de edición · Sitio de Jackelyn Bonilla

Sitio estático (HTML + CSS + JS): no necesita instalar nada. Para verlo localmente:
`python3 -m http.server 8000` dentro de esta carpeta y abre http://localhost:8000
Para publicarlo, sube **toda la carpeta** a Vercel, Netlify, GitHub Pages u otro hosting estático.

## ✏️ Lo único que normalmente tienes que editar: `js/config.js`
| Qué | Dónde en `config.js` |
|---|---|
| Enlace real de la comunidad (botones ÚNETE GRATIS) | `communityUrl` |
| Número de WhatsApp (solo dígitos, con código de país) y mensaje inicial | `whatsappNumber`, `whatsappMessage` |
| Instagram / TikTok | `instagramUrl`, `tiktokUrl` |
| Otros enlaces (YouTube, Linktree, correo…) | `otherLinks` |
| Tu propia imagen del robot (PNG transparente en `assets/img/`) | `robotImage` |
| Nuevos PDF (mentalidad, hábitos, disciplina, habilidades digitales) | `library` → `available:true` + `file` |
| Imágenes públicas de la galería de resultados | `gallery` (archivos en `assets/gallery/`) |

Mientras un valor esté vacío, el botón muestra un aviso amable. **No hay enlaces inventados.**

## 🖼 Imágenes
- Fotos de "Sobre mí": `assets/img/foto-1.webp`, `foto-2.webp`, `foto-3.webp` (reemplaza los archivos o cambia los `src` en `index.html`, busca `<!-- ✏️ FOTOS`).
- Foto de la sección Comunidad: `assets/img/foto-4.webp`.
- Galería de Resultados:
  - **Modo edición** (botón en la sección Resultados): sube imágenes con título, fecha, tipo y descripción. Se guardan **solo en tu navegador** (IndexedDB), para probar.
  - **Para que todo el mundo las vea**: copia la imagen a `assets/gallery/` y añade un bloque en `gallery` de `config.js`, con `type`: `"real"`, `"sim"` o `"aprendizaje"`.

## 📖 Lector de PDF dentro de la página
Cada libro de la Biblioteca se puede **leer aquí mismo** (páginas con efecto de pasar hoja, miniaturas, zoom, teclado y deslizar en el celular) y **descargar** el PDF real.
Las páginas del lector son imágenes en `assets/read/<id>/`. Si cambias un PDF, vuelve a generarlas con `python3 tools/build_reader.py`.

## 🧠 Ventana Mentalidad (reemplaza a los juegos)
Tracker de hábitos, efecto 1 %, simulador de probabilidades, plan del día y resúmenes de *Hábitos atómicos* y *Trading en la zona*. Todo se guarda solo en el navegador de cada persona.

## 📚 PDF
Los 4 PDF ya están en `assets/pdf/` con contenido completo:
- `trading-desde-cero.pdf` (21 páginas)
- `marketing-digital-desde-cero.pdf` (18 páginas)
- `habitos-atomicos-guia.pdf` (14 páginas) · guía de estudio independiente inspirada en el libro de James Clear
- `trading-en-la-zona-guia.pdf` (13 páginas) · guía de estudio independiente inspirada en el libro de Mark Douglas

Las dos últimas **no son los libros originales** (tienen derechos de autor): son resúmenes de ideas en palabras propias. Revísalas y, si quieres, ajústalas en `tools/make_habitos.py` y `tools/make_zona.py`.

Para regenerarlos tras editar el texto: `pip install reportlab` y `python3 tools/make_trading.py` / `python3 tools/make_marketing.py`.
O reemplázalos por tus propios archivos con el mismo nombre.

## 🖼 Fotos y robot
- Foto principal del inicio: `assets/img/foto-6.webp`. Otras: `foto-7` (Habilidades), `foto-8` (Trading), `foto-9` (Sobre mí y Comunidad), `foto-1` a `foto-4`.
- Robot: `assets/img/robot.webp` (tu robot recortado y en tono morado) y `robot-head.webp` (botón del asistente). Cámbialos por tus archivos con el mismo nombre.

## 🪟 Ventanas
Cada sección es una ventana independiente (Inicio, Sobre mí, Habilidades, Trading, Marketing, Mini Games, Resultados, Biblioteca, Comunidad, Contacto) con transición 3D, botones Anterior/Siguiente y una red de conectores fija abajo (`js/network.js`). Cada una tiene su propio enlace: `tusitio.com/#trading`.

## 🧩 Estructura
```
index.html            contenido y secciones
css/styles.css        estilos, 3D, glassmorphism, modo ligero y movimiento reducido
js/main.js            núcleo: menú, efectos 3D, partículas, cargador, sonido, modales
js/network.js         conectores luminosos entre secciones
js/robot.js           robot asistente (mensajes programados, NO es un chatbot de IA)
js/trading.js         módulos interactivos de trading (datos simulados)
js/marketing.js       tarjetas, plan semanal y generador de ideas
js/mentalidad.js      ventana Mentalidad (hábitos, probabilidades, rutina)
js/visuals.js         gráfico simulado de la ventana Trading
js/gallery.js         galería de resultados
js/library.js         biblioteca de libros 3D
js/contact.js         comunidad, WhatsApp y redes
js/config.js          ← tus datos
tools/                generadores de los PDF
```

## ⚡ Rendimiento y accesibilidad
- Botón ⚡ del menú: alterna efectos completos / ligeros (se autoactiva en equipos modestos o con ahorro de datos).
- Respeta `prefers-reduced-motion`; navegación por teclado, `aria-*`, contraste alto y modales con foco controlado.
- Los juegos y gráficos de trading usan datos 100 % simulados y nunca se conectan a cuentas reales.
