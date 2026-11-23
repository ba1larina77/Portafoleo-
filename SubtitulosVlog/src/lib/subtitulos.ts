// Formato del archivo editable subtitulos/<nombre>.txt: generarlo y leerlo.
// Sin dependencias de Node: lo usan tanto Remotion Studio como los scripts.

/** Tiempos en segundos */
export type Palabra = { texto: string; inicio: number; fin: number };

export type Linea = {
  inicio: number;
  fin: number;
  palabras: Palabra[];
  /** Número de línea en el .txt (desde 1) */
  numero: number;
  /** Líneas divididas a partir de un mismo tiempo comparten bloque */
  bloque: number;
};

export type Problema = {
  tipo: "error" | "aviso";
  numero: number;
  mensaje: string;
  contenido: string;
};

export type ResultadoTxt = { lineas: Linea[]; problemas: Problema[] };

// ---------- Texto ----------

// Signos que se quitan. Guiones y apóstrofos se pegan ("e-mail" → "EMAIL"); el resto separa.
const SIGNOS_PEGAR = /[-–—'‘’]/g;
const SIGNOS_SEPARAR = /[.,;:!¡?¿"…()«»“”[\]]/g;

export const limpiarTexto = (texto: string, mayusculas = true): string => {
  const limpio = texto.replace(SIGNOS_PEGAR, "").replace(SIGNOS_SEPARAR, " ").replace(/\s+/g, " ").trim();
  return mayusculas ? limpio.toLocaleUpperCase("es") : limpio;
};

export const separarPalabras = (texto: string): string[] => {
  const limpio = limpiarTexto(texto);
  return limpio ? limpio.split(" ") : [];
};

/** Para comparar palabras: minúsculas y sin signos (conserva tildes y ñ). */
export const normalizar = (texto: string): string => limpiarTexto(texto, false).toLocaleLowerCase("es");

// ---------- Tiempos ----------

export const formatearTiempo = (segundos: number): string => {
  const cs = Math.max(0, Math.round(segundos * 100));
  const h = Math.floor(cs / 360000);
  const m = Math.floor((cs % 360000) / 6000);
  const s = Math.floor((cs % 6000) / 100);
  const c = cs % 100;
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${h > 0 ? `${h}:` : ""}${dos(m)}:${dos(s)}.${dos(c)}`;
};

/** Acepta mm:ss, mm:ss.cc, mm:ss,cc y h:mm:ss.cc */
export const leerTiempo = (texto: string): number | null => {
  const m = texto.trim().match(/^(?:(\d+):)?(\d{1,3}):(\d{1,2})(?:[.,](\d{1,3}))?$/);
  if (!m) return null;
  const h = m[1] ? Number(m[1]) : 0;
  const min = Number(m[2]);
  const s = Number(m[3]);
  if (s >= 60 || (m[1] && min >= 60)) return null;
  const fraccion = m[4] ? Number(`0.${m[4]}`) : 0;
  return h * 3600 + min * 60 + s + fraccion;
};

// ---------- Reparto de tiempos ----------

/** Reparte [inicio, fin] entre las palabras según su longitud. */
export const repartirProporcional = (textos: string[], inicio: number, fin: number): Palabra[] => {
  const pesos = textos.map((t) => Math.max(1, t.length));
  const total = pesos.reduce((a, b) => a + b, 0);
  let cursor = inicio;
  return textos.map((texto, i) => {
    const dur = ((fin - inicio) * pesos[i]) / total;
    const p = { texto, inicio: cursor, fin: i === textos.length - 1 ? fin : cursor + dur };
    cursor += dur;
    return p;
  });
};

/** Usa los tiempos de Whisper palabra por palabra, llevados al rango [inicio, fin]. */
const reescalar = (textos: string[], base: Palabra[], inicio: number, fin: number): Palabra[] => {
  const bi = base[0].inicio;
  const bf = base[base.length - 1].fin;
  if (bf - bi < 0.01) return repartirProporcional(textos, inicio, fin);
  const k = (fin - inicio) / (bf - bi);
  const llevar = (t: number) => Math.min(fin, Math.max(inicio, inicio + (t - bi) * k));
  return textos.map((texto, i) => ({ texto, inicio: llevar(base[i].inicio), fin: llevar(base[i].fin) }));
};

// ---------- Generar el .txt ----------

export type PalabraCorte = Palabra & { corte?: boolean };

export type OpcionesGrupos = {
  maxPalabras: number;
  maxCaracteres: number;
  pausaCorteMs: number;
  cortarEnPuntuacion: boolean;
};

export const agruparPalabras = (palabras: PalabraCorte[], o: OpcionesGrupos): Palabra[][] => {
  const grupos: Palabra[][] = [];
  let actual: PalabraCorte[] = [];
  for (const p of palabras) {
    const previa = actual[actual.length - 1];
    const largo = [...actual, p].map((x) => x.texto).join(" ").length;
    const cortar =
      previa &&
      (actual.length >= Math.max(1, o.maxPalabras) ||
        largo > o.maxCaracteres ||
        (p.inicio - previa.fin) * 1000 > o.pausaCorteMs ||
        (o.cortarEnPuntuacion && previa.corte));
    if (cortar) {
      grupos.push(actual);
      actual = [];
    }
    actual.push(p);
  }
  if (actual.length) grupos.push(actual);
  return grupos.map((g) => g.map(({ texto, inicio, fin }) => ({ texto, inicio, fin })));
};

export const generarTxt = (nombre: string, grupos: Palabra[][]): string => {
  const cabecera = [
    `# Subtítulos de: ${nombre}`,
    "# Formato:   inicio - fin | TEXTO     (minutos:segundos.centésimas)",
    "# - Cambia, agrega o borra palabras dentro de una línea.",
    "# - DIVIDIR: pasa parte del texto a una línea nueva justo debajo, SIN tiempos.",
    "# - UNIR: deja una sola línea con el inicio de la primera y el fin de la segunda.",
    "# - QUITAR un subtítulo: borra la línea entera.",
    "# - Puedes corregir los tiempos a mano. Las líneas con # se ignoran.",
    "",
  ];
  const lineas = grupos.map((g, i) => {
    // Nunca termina después de que empieza el siguiente (Whisper a veces solapa palabras)
    const siguiente = grupos[i + 1]?.[0].inicio ?? Infinity;
    const fin = Math.max(g[0].inicio + 0.05, Math.min(g[g.length - 1].fin, siguiente));
    return `${formatearTiempo(g[0].inicio)} - ${formatearTiempo(fin)} | ${g.map((p) => p.texto).join(" ")}`;
  });
  return [...cabecera, ...lineas, ""].join("\n");
};

// ---------- Leer el .txt editado ----------

type Entrada = { numero: number; contenido: string; textos: string[] };
type Bloque = { inicio: number; fin: number; entradas: Entrada[] };

/**
 * @param base palabras con tiempos de Whisper (ya corregidas) con las que se generó el .txt
 * @param duracion duración del video en segundos (para validar)
 */
export const leerTxt = (txt: string, base: Palabra[], duracion?: number): ResultadoTxt => {
  const problemas: Problema[] = [];
  const bloques: Bloque[] = [];
  const renglones = txt.replace(/^﻿/, "").split(/\r?\n/);

  renglones.forEach((renglon, i) => {
    const numero = i + 1;
    const contenido = renglon.trim();
    if (!contenido || contenido.startsWith("#")) return;
    const error = (mensaje: string) => problemas.push({ tipo: "error", numero, mensaje, contenido });
    const aviso = (mensaje: string) => problemas.push({ tipo: "aviso", numero, mensaje, contenido });

    let izquierda = "";
    let texto = contenido;
    const barra = contenido.indexOf("|");
    if (barra >= 0) {
      izquierda = contenido.slice(0, barra).trim();
      texto = contenido.slice(barra + 1);
    } else if (/^\d{1,3}:\d/.test(contenido)) {
      error('Falta la barra "|" entre los tiempos y el texto.');
      return;
    }
    const textos = separarPalabras(texto);

    // Línea sin tiempos: continúa (divide) la línea con tiempos anterior
    if (!izquierda) {
      const ultimo = bloques[bloques.length - 1];
      if (!ultimo) {
        error("Esta línea no tiene tiempos y no hay una línea con tiempos antes para repartir el tiempo.");
        return;
      }
      if (textos.length) ultimo.entradas.push({ numero, contenido, textos });
      return;
    }

    const partes = izquierda.split(/\s*[-–—]\s*/);
    if (partes.length !== 2) {
      error('Los tiempos deben ir así: "00:12.40 - 00:13.85 | TEXTO".');
      return;
    }
    const inicio = leerTiempo(partes[0]);
    const finLeido = leerTiempo(partes[1]);
    if (inicio === null || finLeido === null) {
      const malo = inicio === null ? partes[0] : partes[1];
      error(`"${malo}" no es un tiempo válido. Usa minutos:segundos.centésimas, por ejemplo 01:05.30.`);
      return;
    }
    let fin = finLeido;
    if (fin <= inicio) {
      error(`El fin (${partes[1]}) tiene que ser mayor que el inicio (${partes[0]}).`);
      return;
    }
    if (duracion !== undefined) {
      if (inicio >= duracion) {
        error(`Empieza después del final del video (${formatearTiempo(duracion)}).`);
        return;
      }
      if (fin > duracion + 0.05) {
        aviso(`Termina después del final del video; se corta en ${formatearTiempo(duracion)}.`);
        fin = duracion;
      }
    }
    if (!textos.length) aviso("No tiene texto: se ignora. Para quitar un subtítulo borra la línea entera.");

    const ultimo = bloques[bloques.length - 1];
    const entrada = { numero, contenido, textos };
    // Mismos tiempos que la línea anterior = es una división de esa línea
    if (ultimo && Math.abs(ultimo.inicio - inicio) < 0.005 && Math.abs(ultimo.fin - fin) < 0.005) {
      if (textos.length) ultimo.entradas.push(entrada);
    } else {
      bloques.push({ inicio, fin, entradas: textos.length ? [entrada] : [] });
    }
  });

  // Tiempos por palabra de cada bloque
  const lineas: Linea[] = [];
  bloques.forEach((b, indice) => {
    const textos = b.entradas.flatMap((e) => e.textos);
    if (!textos.length) return;
    const enRango = base.filter((p) => {
      const medio = (p.inicio + p.fin) / 2;
      return medio >= b.inicio - 0.02 && medio <= b.fin + 0.02;
    });
    // Misma cantidad de palabras que Whisper → se respetan sus tiempos; si no, reparto proporcional
    const palabras =
      enRango.length === textos.length
        ? reescalar(textos, enRango, b.inicio, b.fin)
        : repartirProporcional(textos, b.inicio, b.fin);
    let k = 0;
    b.entradas.forEach((e, j) => {
      const propias = palabras.slice(k, k + e.textos.length);
      k += e.textos.length;
      lineas.push({
        inicio: j === 0 ? b.inicio : propias[0].inicio,
        fin: j === b.entradas.length - 1 ? b.fin : propias[propias.length - 1].fin,
        palabras: propias,
        numero: e.numero,
        bloque: indice,
      });
    });
  });

  // Orden y solapes
  const ordenadas = [...lineas].sort((a, b) => a.inicio - b.inicio || a.numero - b.numero);
  ordenadas.forEach((l, i) => {
    const previa = ordenadas[i - 1];
    if (!previa) return;
    const contenido = renglones[l.numero - 1].trim();
    if (l.numero < previa.numero) {
      problemas.push({
        tipo: "aviso",
        numero: l.numero,
        mensaje: `Está antes que la línea ${previa.numero} pero empieza después; se ordena por tiempo.`,
        contenido,
      });
    }
    if (l.inicio < previa.fin - 0.01 && l.bloque !== previa.bloque) {
      problemas.push({
        tipo: "aviso",
        numero: l.numero,
        mensaje: `Se solapa con la línea ${previa.numero}; esa se corta cuando empieza esta.`,
        contenido,
      });
      previa.fin = Math.max(previa.inicio + 0.01, l.inicio);
      for (const p of previa.palabras) {
        p.fin = Math.min(p.fin, previa.fin);
        p.inicio = Math.min(p.inicio, p.fin);
      }
    }
  });

  problemas.sort((a, b) => a.numero - b.numero);
  return { lineas: ordenadas, problemas };
};

// ---------- Huella para la aprobación ----------

/** Hash (cyrb53) del contenido, ignorando BOM y tipo de salto de línea. */
export const huellaTxt = (txt: string): string => {
  const s = txt.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, "0");
};

// ---------- Tipos de los archivos generados ----------

/** captions/<nombre>.base.json */
export type DatosBase = {
  nombre: string;
  id: string;
  video: string; // ruta dentro de public/
  ancho: number;
  alto: number;
  fps: number;
  duracionFrames: number;
  duracionS: number;
  palabras: Palabra[];
};

/** aprobados.json */
export type Aprobados = Record<
  string,
  { hash: string; fecha: string; cambios: { antes: string; despues: string }[] }
>;
