// Configuración del subtitulador de vlogs.
// Los cambios de estilo se ven al instante en Remotion Studio.
// La sección `whisper` y `grupos` solo afectan a transcripciones / .txt nuevos.

export const config = {
  whisper: {
    // "medium" (1.5 GB, ya descargado) o "large-v3" (3 GB, más preciso y más lento)
    modelo: "medium" as "medium" | "large-v3",
    idioma: "es" as const,
    // En Windows solo funciona 1.5.5 (binario precompilado)
    version: "1.5.5",
  },

  // Cómo se arman las líneas de subtitulos/<nombre>.txt al transcribir
  grupos: {
    maxPalabras: 3, // de 1 a 3 palabras por grupo
    maxCaracteres: 18, // si el grupo pasaría de esto, se corta antes
    pausaCorteMs: 300, // una pausa más larga empieza un grupo nuevo
    cortarEnPuntuacion: true, // corta después de . , ? ! aunque luego se borren los signos
  },

  fuente: {
    // Montserrat desde @remotion/google-fonts. 800 = ExtraBold, 900 = Black
    peso: "800" as "800" | "900",
  },

  // Tamaños pensados para un video de 1080 px en su lado corto;
  // se escalan solos con otras resoluciones.
  estilo: {
    tamano: 78,
    mayusculas: true,
    colorTexto: "#FFFFFF",
    colorPalabraActiva: "#FFD83D",
    resaltarPalabraActiva: true,
    escalaPalabraActiva: 1, // 1 = sin agrandar la palabra activa
    colorBorde: "#000000",
    grosorBorde: 14, // grosor total del trazo; se ve la mitad por fuera
    sombra: "0px 5px 14px rgba(0,0,0,0.55)",
    // Tiempo extra que se queda un subtítulo tras su fin (nunca pisa al siguiente)
    permanenciaMs: 250,
  },

  animacion: {
    activa: true,
    // "pop" con spring: escala de `desde` a 1
    desde: 0.85,
    damping: 14,
    stiffness: 180,
    mass: 0.6,
  },

  posicion: {
    // Videos verticales: centro de la línea en esta fracción de la altura (0 = arriba, 1 = abajo)
    vertical: 0.735,
    // Videos horizontales: borde inferior del texto a esta fracción de la altura desde abajo
    horizontalMargenInferior: 0.08,
  },

  // Zonas donde nunca se dibuja texto (interfaz de TikTok). Solo en videos verticales.
  zonasSeguras: {
    inferior: 0.2, // 20 % de abajo
    derechaPx: 150, // últimos 150 px de la derecha (se usa igual a la izquierda para centrar)
  },

  render: {
    crf: 16, // calidad del video (menor = mejor). El audio se copia sin tocar.
  },
};

export type Config = typeof config;
