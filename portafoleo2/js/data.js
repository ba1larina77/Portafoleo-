/* =========================================================
   DATA.JS — Toda tu información va aquí.
   Edita estos objetos/arreglos con tus datos reales.
   El sitio se genera automáticamente a partir de este archivo.
   ========================================================= */

const PORTFOLIO_DATA = {

  /* ---------- Datos generales (usados en el hero / neofetch) ---------- */
  perfil: {
    nombreCompleto: "Tu Nombre Completo",
    nombreCorto: "Tu Nombre",
    rol: "Ingeniero en Sistemas",
    ubicacion: "Tu Ciudad, País",
    aniosExperiencia: "X años programando",
    editor: "Neovim / VS Code",
    stackCorto: "JS · Python · SQL · Docker",
    descripcionCorta:
      "Escribe aquí una breve descripción sobre ti: qué te apasiona de la ingeniería " +
      "en sistemas, en qué te especializas y qué tipo de problemas te gusta resolver.",
    // Frases que se escriben en efecto "typing" debajo del título principal
    fraseTyping: [
      "Ingeniero en Sistemas",
      "Desarrollador Full Stack",
      "Entusiasta de Linux & Open Source",
      "Resolviendo problemas con código"
    ],
    disponibilidad: "Disponible para nuevas oportunidades. Edita este texto en js/data.js"
  },

  /* ---------- Sobre mí ---------- */
  sobreMi: {
    parrafo1:
      "Aquí va el primer párrafo sobre tu trayectoria: cómo empezaste en la programación, " +
      "qué te motivó a estudiar Ingeniería en Sistemas y qué áreas te interesan más " +
      "(backend, frontend, DevOps, ciberseguridad, datos, etc.).",
    parrafo2:
      "Segundo párrafo: cuenta sobre tu forma de trabajar, tus valores como desarrollador, " +
      "y qué buscas actualmente (empleo, freelance, proyectos open source, etc.)."
  },

  /* ---------- Educación ---------- */
  educacion: [
    {
      titulo: "Ingeniería en Sistemas",
      institucion: "Nombre de tu universidad",
      fecha: "20XX — 20XX"
    },
    // Agrega más entradas copiando el bloque de arriba
  ],

  /* ---------- Datos rápidos (tarjeta lateral en "Sobre mí") ---------- */
  datosRapidos: [
    { etiqueta: "Disponibilidad", valor: "Tiempo completo" },
    { etiqueta: "Modalidad", valor: "Remoto / Híbrido" },
    { etiqueta: "Idiomas", valor: "Español, Inglés" },
    { etiqueta: "Años de experiencia", valor: "X" },
  ],

  /* ---------- Habilidades (agrupadas como "paquetes" pacman -Q) ---------- */
  habilidades: [
    {
      categoria: "Lenguajes",
      items: [
        { nombre: "JavaScript", nivel: "avanzado" },
        { nombre: "Python", nivel: "avanzado" },
        { nombre: "Java", nivel: "intermedio" },
        { nombre: "C", nivel: "intermedio" },
      ]
    },
    {
      categoria: "Frontend",
      items: [
        { nombre: "HTML / CSS", nivel: "avanzado" },
        { nombre: "React", nivel: "intermedio" },
        { nombre: "Tailwind CSS", nivel: "intermedio" },
      ]
    },
    {
      categoria: "Backend",
      items: [
        { nombre: "Node.js", nivel: "intermedio" },
        { nombre: "Express", nivel: "intermedio" },
        { nombre: "REST APIs", nivel: "avanzado" },
      ]
    },
    {
      categoria: "Bases de datos",
      items: [
        { nombre: "PostgreSQL", nivel: "intermedio" },
        { nombre: "MySQL", nivel: "intermedio" },
        { nombre: "MongoDB", nivel: "básico" },
      ]
    },
    {
      categoria: "DevOps / Herramientas",
      items: [
        { nombre: "Git & GitHub", nivel: "avanzado" },
        { nombre: "Docker", nivel: "intermedio" },
        { nombre: "Linux (Arch/Debian)", nivel: "avanzado" },
        { nombre: "CI/CD", nivel: "básico" },
      ]
    },
    {
      categoria: "Otros",
      items: [
        { nombre: "Metodologías ágiles", nivel: "intermedio" },
        { nombre: "Redes y sistemas", nivel: "intermedio" },
      ]
    },
  ],

  /* ---------- Proyectos ----------
     Deja el arreglo vacío ([]) y se mostrará un placeholder automáticamente.
     Ejemplo de cómo agregar un proyecto (descomenta y edita):

     {
       nombre: "Nombre del proyecto",
       descripcion: "Breve descripción de qué hace el proyecto y qué problema resuelve.",
       tecnologias: ["React", "Node.js", "PostgreSQL"],
       icono: "⌘",              // emoji o caracter para la miniatura
       repoUrl: "https://github.com/tu-usuario/tu-repo",
       demoUrl: "https://tu-demo.com"
     }
  ------------------------------------------------------------------ */
  proyectos: [
    // Agrega tus proyectos aquí
  ],

  /* ---------- Experiencia (estilo "git log") ---------- */
  experiencia: [
    // Ejemplo — descomenta y edita:
    // {
    //   hash: "a1b2c3d",
    //   puesto: "Desarrollador Junior",
    //   empresa: "Nombre de la empresa",
    //   fecha: "Ene 2024 — Presente",
    //   descripcion: "Breve descripción de tus responsabilidades y logros."
    // },
  ],

  /* ---------- Contacto / redes sociales ---------- */
  contacto: {
    email: "tu-email@ejemplo.com",
    telefono: "", // opcional
    redes: [
      { nombre: "GitHub", url: "https://github.com/tu-usuario", icono: "github" },
      { nombre: "LinkedIn", url: "https://linkedin.com/in/tu-usuario", icono: "linkedin" },
      { nombre: "Email", url: "mailto:tu-email@ejemplo.com", icono: "mail" },
      // { nombre: "Twitter/X", url: "https://x.com/tu-usuario", icono: "twitter" },
    ]
  },
};
