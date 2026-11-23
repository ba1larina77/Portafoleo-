// Convierte las palabras del pipeline en: título, voces y grupos de subtítulos.
// Corre dentro de Remotion, así que cualquier cambio en config.ts se ve al
// instante en Studio sin volver a procesar el audio.

import type { Config } from "../../config";
import {
  aMayusculas,
  cierraClausula,
  cierraOracion,
  esNombrePropio,
  esNumero,
  normalizar,
  PALABRAS_FUNCION,
} from "./texto";
import type { DatosVideo, PalabraAnalizada, Voz } from "./types";

export type Palabra = {
  texto: string; // lo que se muestra: MAYÚSCULAS y sin puntuación
  raw: string;
  inicio: number;
  fin: number;
  pausaDespues: number;
  voz: Voz;
  clave: boolean;
};

export type Grupo = {
  palabras: Palabra[];
  inicio: number; // cuando aparece
  fin: number; // cuando desaparece
  voz: Voz;
};

export type Analisis = {
  titulo: Palabra[];
  /** Segundo en que empieza la primera palabra de la historia */
  inicioHistoria: number | null;
  /** Desde este segundo se pueden ver subtítulos normales */
  inicioSubtitulos: number;
  grupos: Grupo[];
};

// ---------------------------------------------------------------- voces

const mediana = (valores: number[]): number | null => {
  if (!valores.length) return null;
  const v = [...valores].sort((x, y) => x - y);
  return v[Math.floor(v.length / 2)];
};

/** Frases = tramos separados por puntuación fuerte o pausas reales. */
const partirEnFrases = (palabras: PalabraAnalizada[], pausaS: number): number[][] => {
  const frases: number[][] = [];
  let actual: number[] = [];
  palabras.forEach((p, i) => {
    actual.push(i);
    if (i === palabras.length - 1 || /[.?!…;:]["'»”)]*$/.test(p.texto.trim()) || p.pausaDespues > pausaS) {
      frases.push(actual);
      actual = [];
    }
  });
  return frases;
};

/**
 * Si hay dos grupos de tono bien separados (uno de hombre y otro más agudo),
 * devuelve un umbral entre ambos. Si no, null.
 */
const umbralEntreVoces = (tonos: { f0: number; peso: number }[]): number | null => {
  const datos = tonos.filter((t) => t.peso > 0).map((t) => ({ x: Math.log(t.f0), peso: t.peso }));
  if (datos.length < 2) return null;
  const xs = datos.map((d) => d.x);
  let bajo = Math.min(...xs);
  let alto = Math.max(...xs);
  for (let iter = 0; iter < 30; iter++) {
    const corte = (bajo + alto) / 2;
    const g1 = datos.filter((d) => d.x < corte);
    const g2 = datos.filter((d) => d.x >= corte);
    const media = (g: typeof datos) => g.reduce((s, d) => s + d.x * d.peso, 0) / g.reduce((s, d) => s + d.peso, 0);
    if (!g1.length || !g2.length) return null;
    bajo = media(g1);
    alto = media(g2);
  }
  const fBajo = Math.exp(bajo);
  const fAlto = Math.exp(alto);
  // Tiene que haber una voz grave de verdad y una clara diferencia entre ambas
  if (fAlto / fBajo < 1.3 || fBajo > 150 || fAlto < 140) return null;
  return Math.sqrt(fBajo * fAlto);
};

export const detectarVoces = (
  palabras: PalabraAnalizada[],
  datos: DatosVideo,
  cfg: Config,
): { voces: Voz[]; umbral: number } => {
  const frases = partirEnFrases(palabras, cfg.voces.pausaFraseMs / 1000);
  // Tono de cada frase = mediana de todas sus ventanas con voz
  const todos = frases.map((f) => f.flatMap((i) => palabras[i].tonos));
  const tonos = todos.map(mediana);

  let umbral = datos.overrides.umbralHz ?? cfg.voces.umbralHz;
  let unaSolaVoz: Voz | null = null;
  if (datos.overrides.umbralHz === undefined && cfg.voces.umbralAutomatico) {
    const auto = umbralEntreVoces(
      tonos.map((t, k) => ({ f0: t ?? 0, peso: t === null ? 0 : todos[k].length })),
    );
    if (auto !== null) {
      umbral = auto;
    } else {
      // No hay dos voces distintas: todo el video es una sola voz,
      // decidida por el tono mediano global (así una frase más grave no cambia el color)
      const global = mediana(todos.flat());
      if (global !== null) unaSolaVoz = global >= umbral ? "mujer" : "hombre";
    }
  }

  let voces: (Voz | null)[] = tonos.map((t) =>
    unaSolaVoz ?? (t === null ? null : t >= umbral ? "mujer" : "hombre"),
  );

  // Frases sin tono medible: heredan la voz de la frase más cercana en el tiempo
  const conocidas = voces.map((v, k) => (v === null ? -1 : k)).filter((k) => k >= 0);
  voces = voces.map((v, k) => {
    if (v !== null) return v;
    const antes = [...conocidas].reverse().find((j) => j < k);
    const despues = conocidas.find((j) => j > k);
    if (antes === undefined && despues === undefined) return cfg.voces.porDefecto;
    if (antes === undefined) return voces[despues as number];
    if (despues === undefined) return voces[antes];
    const inicioK = palabras[frases[k][0]].inicio;
    const finK = palabras[frases[k][frases[k].length - 1]].fin;
    const distAntes = inicioK - palabras[frases[antes][frases[antes].length - 1]].fin;
    const distDespues = palabras[frases[despues][0]].inicio - finK;
    return distAntes <= distDespues ? voces[antes] : voces[despues];
  });

  // Suavizado: una frase corta y de tono dudoso no cambia la voz por sí sola
  const final = voces as Voz[];
  for (let k = 0; k < frases.length; k++) {
    const vecina = k > 0 ? final[k - 1] : final[k + 1];
    if (vecina === undefined || final[k] === vecina) continue;
    const corta = frases[k].length < cfg.voces.minPalabrasParaCambiar;
    const tono = tonos[k];
    const dudosa = tono === null || Math.abs(tono - umbral) < cfg.voces.margenSeguroHz;
    if (corta && dudosa) final[k] = vecina;
  }

  const porPalabra: Voz[] = new Array(palabras.length);
  frases.forEach((f, k) => f.forEach((i) => (porPalabra[i] = final[k])));

  // Correcciones manuales: siempre ganan
  for (const tramo of datos.overrides.voces ?? []) {
    palabras.forEach((p, i) => {
      const medio = (p.inicio + p.fin) / 2;
      if (medio >= tramo.desde && medio < tramo.hasta) porPalabra[i] = tramo.voz;
    });
  }
  return { voces: porPalabra, umbral };
};

// ---------------------------------------------------------------- título

const contarPalabrasTitulo = (palabras: PalabraAnalizada[], datos: DatosVideo, cfg: Config): number => {
  const forzado = datos.overrides.palabrasTitulo;
  if (typeof forzado === "number") return Math.max(0, Math.min(forzado, palabras.length));
  const pausa = cfg.titulo.pausaFinMs / 1000;
  const cierra = (t: string) => /[.?!…]["'»”)]*$/.test(t.trim());
  // Si Whisper no puso ningún punto al inicio (solo comas), una coma con pausa también cierra el título
  const sinPuntos = !palabras.slice(0, cfg.titulo.maxPalabras).some((p) => cierra(p.texto));
  for (let i = 0; i < palabras.length && i < cfg.titulo.maxPalabras; i++) {
    if (sinPuntos && /,["'»”)]*$/.test(palabras[i].texto.trim()) && palabras[i].pausaDespues >= 0.3) return i + 1;
    if (/[.?!…]["'»”)]*$/.test(palabras[i].texto.trim())) return i + 1;
    if (i < palabras.length - 1 && palabras[i].pausaDespues > pausa) {
      // Pausa dramática justo antes del final de la frase ("viéndome ... dormir."):
      // si la oración cierra en las 2 palabras siguientes, esas también son del título.
      for (let j = i + 1; j <= i + 2 && j < palabras.length; j++) {
        if (/[.?!…]["'»”)]*$/.test(palabras[j].texto.trim())) return j + 1;
      }
      return i + 1;
    }
  }
  return Math.min(palabras.length, cfg.titulo.maxPalabras);
};

// ---------------------------------------------------------------- grupos

/** Costo de mostrar estas palabras juntas (más bajo = mejor). */
const costoGrupo = (ps: Palabra[], esUltimoDelSegmento: boolean, cfg: Config): number => {
  const s = cfg.subtitulos;
  let costo = 1; // cada grupo cuesta: así se prefieren grupos llenos
  const largo = ps.map((p) => p.texto).join(" ").length;
  if (ps.length > 1 && largo > s.maxCaracteresPorGrupo) costo += 10;
  if (ps.length === 1 && ps[0].texto.length <= 4) costo += 1; // "Y", "PERO" solos
  if (!esUltimoDelSegmento && PALABRAS_FUNCION.has(normalizar(ps[ps.length - 1].raw))) costo += 4;
  return costo;
};

/** Divide un segmento en grupos de 1..N palabras con el menor costo total. */
const dividirSegmento = (seg: Palabra[], cfg: Config): Palabra[][] => {
  const max = cfg.subtitulos.maxPalabrasPorGrupo;
  const mejor: number[] = [0];
  const corte: number[] = [0];
  for (let i = 1; i <= seg.length; i++) {
    mejor[i] = Number.POSITIVE_INFINITY;
    for (let j = Math.max(0, i - max); j < i; j++) {
      const c = mejor[j] + costoGrupo(seg.slice(j, i), i === seg.length, cfg);
      if (c < mejor[i]) {
        mejor[i] = c;
        corte[i] = j;
      }
    }
  }
  const grupos: Palabra[][] = [];
  for (let i = seg.length; i > 0; i = corte[i]) grupos.unshift(seg.slice(corte[i], i));
  return grupos;
};

const armarGrupos = (palabras: Palabra[], cfg: Config): Palabra[][] => {
  const s = cfg.subtitulos;
  // Segmentos: nunca se juntan palabras separadas por coma/punto, pausa o cambio de voz
  const segmentos: Palabra[][] = [];
  let actual: Palabra[] = [];
  palabras.forEach((p, i) => {
    actual.push(p);
    const sig = palabras[i + 1];
    if (!sig || cierraClausula(p.raw) || p.pausaDespues > s.pausaCorteGrupoMs / 1000 || sig.voz !== p.voz) {
      segmentos.push(actual);
      actual = [];
    }
  });
  return segmentos.flatMap((seg) => dividirSegmento(seg, cfg));
};

// ---------------------------------------------------------------- principal

export const analizar = (datos: DatosVideo, cfg: Config): Analisis => {
  const base = datos.palabras.filter((p) => aMayusculas(p.texto) !== "");
  const { voces } = detectarVoces(base, datos, cfg);
  const clavesCfg = cfg.extras.palabrasClave;
  const lista = new Set(clavesCfg.lista.map(normalizar));

  const palabras: Palabra[] = base.map((p, i) => {
    const empiezaOracion = i === 0 || cierraOracion(base[i - 1].texto);
    const clave =
      clavesCfg.activas &&
      (lista.has(normalizar(p.texto)) ||
        (clavesCfg.numeros && esNumero(p.texto)) ||
        (clavesCfg.nombresPropios && esNombrePropio(p.texto, empiezaOracion)));
    return {
      texto: aMayusculas(p.texto),
      raw: p.texto,
      inicio: p.inicio,
      fin: p.fin,
      pausaDespues: p.pausaDespues,
      voz: voces[i],
      clave,
    };
  });

  const nTitulo = contarPalabrasTitulo(base, datos, cfg);
  const titulo = palabras.slice(0, nTitulo);
  const historia = palabras.slice(nTitulo);
  const inicioHistoria = historia.length ? historia[0].inicio : null;
  const inicioSubtitulos =
    nTitulo === 0 ? 0 : (inicioHistoria ?? Number.POSITIVE_INFINITY) + cfg.titulo.duracionSalidaS;

  const trozos = armarGrupos(historia, cfg);
  const permanencia = cfg.subtitulos.permanenciaMaxMs / 1000;
  const grupos: Grupo[] = trozos.map((ps, k) => {
    const sig = trozos[k + 1];
    const finHablado = ps[ps.length - 1].fin;
    const fin = sig ? Math.min(sig[0].inicio, finHablado + permanencia) : finHablado + permanencia;
    return { palabras: ps, inicio: ps[0].inicio, fin: Math.max(fin, ps[0].inicio + 0.1), voz: ps[0].voz };
  });

  return { titulo, inicioHistoria, inicioSubtitulos, grupos };
};
