// Tipos compartidos entre el pipeline (scripts/) y los componentes (src/).

export type Voz = "hombre" | "mujer";

/** Palabra tal como la deja el pipeline en public/data/<id>.json */
export type PalabraAnalizada = {
  /** Texto de Whisper, con puntuación (se usa para detectar frases) */
  texto: string;
  /** Segundos */
  inicio: number;
  fin: number;
  /** Silencio real (s) entre esta palabra y la siguiente, medido en el audio */
  pausaDespues: number;
  /** Tono medio (mediana de F0) en Hz, o null si no se pudo medir */
  f0: number | null;
  /** Tono (Hz) de cada ventana de 15 ms con voz */
  tonos: number[];
};

export type TramoVoz = { desde: number; hasta: number; voz: Voz };

export type Overrides = {
  /** Fuerza la cantidad de palabras del título */
  palabrasTitulo?: number;
  /** Tramos (en segundos) con la voz forzada */
  voces?: TramoVoz[];
  /** Cambia el umbral de tono solo para este video */
  umbralHz?: number;
};

export type DatosVideo = {
  id: string;
  nombre: string;
  video: string; // ruta dentro de public/
  /** Tamaño de salida */
  ancho: number;
  alto: number;
  /** Tamaño del video original */
  anchoOriginal: number;
  altoOriginal: number;
  /** Zona con imagen si el original traía barras negras (se recorta y se llena la pantalla) */
  recorte: { x: number; y: number; ancho: number; alto: number } | null;
  fps: number;
  duracionFrames: number;
  palabras: PalabraAnalizada[];
  overrides: Overrides;
};
