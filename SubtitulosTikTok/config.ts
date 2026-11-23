// Configuración general del subtitulador.
// Los cambios de este archivo se ven al instante en Remotion Studio
// (salvo la sección `whisper`, que solo afecta a transcripciones nuevas).

export const config = {
  whisper: {
    // "medium" (1.5 GB, rápido) o "large-v3" (3 GB, más preciso)
    modelo: "medium" as "medium" | "large-v3" | "large-v3-turbo" | "small" | "base",
    idioma: "es" as const,
    // En Windows solo funciona 1.5.5 (binario precompilado)
    version: "1.5.5",
  },

  video: {
    // Si CapCut exportó el video vertical dentro de un cuadro horizontal con barras
    // negras, se recortan las barras y la salida queda en 1080x1920.
    recortarBarrasNegras: true,
  },

  fuente: {
    // Montserrat desde @remotion/google-fonts
    peso: "900" as "800" | "900", // 900 = Black, 800 = ExtraBold
  },

  // Todos los tamaños están pensados para un video de 1080 px de ancho;
  // se escalan solos si el video tiene otra resolución.
  subtitulos: {
    tamano: 92,
    escalaPalabraActiva: 1.12,
    grosorBorde: 18, // grosor total del trazo; se ve la mitad por fuera
    sombra: "0px 8px 18px rgba(0,0,0,0.75)",
    maxPalabrasPorGrupo: 3,
    maxCaracteresPorGrupo: 20,
    // Si hay una pausa más larga que esta, se empieza un grupo nuevo
    pausaCorteGrupoMs: 250,
    // Cuánto se queda el último grupo en pantalla tras terminar de hablar
    permanenciaMaxMs: 700,
    // Centro vertical de los subtítulos (0 = arriba, 1 = abajo)
    posicionVertical: 0.6,
    // Pop de entrada: escala de `desde` a ~`pico` y luego a 1 (spring)
    pop: { desde: 0.8, pico: 1.05, damping: 9, stiffness: 220, mass: 0.55 },
  },

  zonasSeguras: {
    superior: 0.1, // 10 % de arriba
    inferior: 0.2, // 20 % de abajo
    derechaPx: 150, // últimos 150 px de la derecha
  },

  voces: {
    // Por encima de este tono medio (Hz) se considera voz de mujer
    umbralHz: 165,
    // Si en el video hay dos voces claramente distintas (una grave de hombre y otra
    // más aguda), el corte se pone automáticamente entre las dos. Si no, se usa umbralHz.
    umbralAutomatico: true,
    // Si no hay tono medible, se usa esta voz
    porDefecto: "hombre" as "hombre" | "mujer",
    // Una pausa más larga que esta separa frases al detectar voces
    pausaFraseMs: 350,
    // Frases con menos palabras que esto no pueden cambiar de voz solas...
    minPalabrasParaCambiar: 2,
    // ...salvo que su tono esté a más de estos Hz del umbral
    margenSeguroHz: 45,
    colores: {
      mujer: { base: "#FF4FA3", activa: "#FF8CC6" },
      hombre: { base: "#3DA5FF", activa: "#8CCBFF" },
    },
  },

  titulo: {
    color: "#FFD83D",
    tamano: 112,
    grosorBorde: 20,
    pausaFinMs: 400,
    maxPalabras: 18,
    fondo: "rgba(0, 0, 0, 0.45)",
    radioFondo: 40,
    duracionSalidaS: 0.3,
    duracionEntradaPalabraS: 0.2,
  },

  extras: {
    barraProgreso: {
      activa: true,
      alto: 8,
      color: "#FFD83D",
      fondo: "rgba(255, 255, 255, 0.18)",
    },
    whoosh: {
      activo: true,
      archivo: "whoosh.wav", // dentro de assets/sfx/
      volumen: 0.25,
    },
    palabrasClave: {
      activas: true,
      color: "#FFFFFF",
      escala: 1.15,
      numeros: true,
      nombresPropios: true,
      // Se comparan sin tildes y en minúsculas. Edita libremente.
      lista: [
        "muerte", "muerto", "muerta", "murió", "morir", "matar", "mató", "asesino", "asesinato",
        "sangre", "cadáver", "cuerpo", "secreto", "secretos", "nunca", "jamás", "nadie",
        "desapareció", "desaparecido", "desaparecida", "desaparición", "misterio", "verdad",
        "mentira", "miedo", "terror", "grito", "gritó", "peligro", "policía", "prisión",
        "traición", "venganza", "fantasma", "maldición", "imposible", "increíble",
        "último", "última", "encontró", "descubrió",
      ],
    },
  },

  render: {
    crf: 16,
    audioBitrate: "320k" as `${number}k`,
  },
};

export type Config = typeof config;
