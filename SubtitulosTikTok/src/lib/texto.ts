// Limpieza de texto y detección de palabras clave.

// Signos que NO se muestran nunca (tildes y ñ se conservan).
const PUNTUACION = /[.,;:!¡?¿"'…\-()«»“”‘’—–[\]{}]/g;

export const limpiar = (texto: string): string =>
  texto.replace(PUNTUACION, "").replace(/\s+/g, " ").trim();

export const aMayusculas = (texto: string): string => limpiar(texto).toLocaleUpperCase("es");

/** minúsculas y sin tildes, para comparar */
export const normalizar = (texto: string): string =>
  limpiar(texto)
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .normalize("NFC");

/** ¿La palabra (con la puntuación de Whisper) cierra una oración? */
export const cierraOracion = (raw: string): boolean => /[.?!…]["'»”)]*\s*$/.test(raw.trim());

/** ¿Cierra una frase o cláusula? (incluye comas, punto y coma, dos puntos) */
export const cierraClausula = (raw: string): boolean => /[.?!…,;:]["'»”)]*\s*$/.test(raw.trim());

const NUMEROS_ESCRITOS = new Set(
  [
    "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce",
    "trece", "catorce", "quince", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta",
    "setenta", "ochenta", "noventa", "cien", "ciento", "cientos", "doscientos", "trescientos",
    "quinientos", "mil", "miles", "millon", "millones", "primero", "primera", "segundo",
    "segunda", "tercero", "tercera",
  ].map(normalizar),
);

export const esNumero = (raw: string): boolean => {
  const n = normalizar(raw);
  return /\d/.test(n) || NUMEROS_ESCRITOS.has(n);
};

/** Mayúscula inicial que no se debe a empezar oración. */
export const esNombrePropio = (raw: string, empiezaOracion: boolean): boolean => {
  if (empiezaOracion) return false;
  const sinSignos = raw.trim().replace(/^[¿¡"'«“‘(\-—–]+/, "");
  const primera = sinSignos.charAt(0);
  if (!primera) return false;
  return primera !== primera.toLocaleLowerCase("es") && primera === primera.toLocaleUpperCase("es");
};

// Palabras que quedan mal al final de un grupo ("EL", "DE", "QUE"...).
export const PALABRAS_FUNCION = new Set(
  [
    "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "al", "a", "en", "y", "e",
    "o", "u", "que", "con", "por", "para", "sin", "su", "sus", "mi", "mis", "tu", "tus", "se",
    "lo", "le", "les", "me", "te", "nos", "no", "ni", "muy", "mas", "pero", "como", "cuando",
    "donde", "si", "porque", "este", "esta", "ese", "esa", "aquel", "aquella",
  ].map(normalizar),
);
