# Portafolio — Ingeniero en Sistemas

Portafolio personal con estética **Arch Linux / terminal**: negros, azules, transparencias y gradientes. Construido con HTML, CSS y JavaScript puro (sin frameworks, sin build step).

## Estructura

```
portafoleo/
├── index.html          # Estructura de todas las secciones
├── css/
│   └── style.css        # Estilos y tema (colores, glass, gradientes)
├── js/
│   ├── data.js          # ← TU INFORMACIÓN VA AQUÍ
│   └── main.js           # Lógica del sitio (no hace falta tocarlo)
└── assets/
    ├── img/              # Favicon, capturas de proyectos, foto, etc.
    └── cv/               # Coloca aquí tu cv.pdf
```

## Cómo poner tu información

Edita **`js/data.js`**. Todo el sitio se genera a partir de ese archivo:

- `perfil`: nombre, rol, ubicación, descripción del hero, frases del efecto "typing".
- `sobreMi`: los dos párrafos de la sección "Sobre mí".
- `educacion`: tu formación académica.
- `datosRapidos`: disponibilidad, modalidad, idiomas, etc.
- `habilidades`: tus tecnologías agrupadas por categoría.
- `proyectos`: **está vacío a propósito**. Agrega objetos con `nombre`, `descripcion`, `tecnologias`, `repoUrl`, `demoUrl`. Mientras esté vacío se muestra un placeholder.
- `experiencia`: tu experiencia laboral en formato "git log".
- `contacto`: tu email y redes sociales (GitHub, LinkedIn, etc.).

No necesitas tocar `index.html` ni `main.js` para actualizar contenido.

## Personalizar colores

El sitio usa 4 acentos azules seleccionables desde los puntos de color en la barra superior (Arch Blue, Cyan, Indigo, Teal). Se guardan en `localStorage`. Para cambiar la paleta base, edita las variables en `css/style.css`:

```css
:root {
  --bg-0: #05070c;   /* fondo principal */
  --accent: #1793d1;  /* acento por defecto */
  --accent-2: #58c4ff;
}
```

## CV y foto

- Coloca tu currículum en `assets/cv/cv.pdf` (el botón "Descargar CV" ya apunta ahí).
- Si quieres agregar tu foto, colócala en `assets/img/` y referencia la ruta donde prefieras (por ejemplo, dentro de la tarjeta neofetch en `index.html`).

## Formulario de contacto

El formulario en la sección "Contacto" es solo de interfaz: no envía correos por sí solo (no hay backend). Opciones para activarlo sin backend propio:

1. **Formspree** (https://formspree.io): crea un formulario gratuito y cambia el `action` del `<form id="contactForm">` en `index.html` a la URL que te den.
2. **EmailJS** (https://www.emailjs.com): permite enviar emails directo desde JS con una API key.
3. Tu propio backend / función serverless (Vercel Functions, Netlify Functions, etc.).

## Ejecutar en local

No requiere instalación. Puedes:

- Abrir `index.html` directamente en el navegador, o
- Servirlo con un servidor local simple:

```bash
# Con Python
python -m http.server 8080

# Con Node (npx)
npx serve .
```

Luego visita `http://localhost:8080`.

## Desplegar

Funciona en cualquier hosting estático:

- **GitHub Pages**: sube el repo y activa Pages apuntando a la rama principal.
- **Vercel** / **Netlify**: importa el repositorio, sin comandos de build (es un sitio estático).

## Terminal interactiva

La sección "terminal" incluye una mini terminal funcional (comandos `help`, `about`, `skills`, `projects`, `contact`, `whoami`, `neofetch`, `clear`). Los datos que muestra se leen automáticamente de `js/data.js`, así que se mantiene sincronizada sin esfuerzo extra.
