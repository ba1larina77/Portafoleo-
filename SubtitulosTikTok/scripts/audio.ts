// Análisis del audio en Node puro (sin Python):
//  - energía por ventana, para ajustar el final de cada palabra y medir pausas reales
//  - tono (F0) con el algoritmo YIN, para saber si habla un hombre o una mujer

import fs from "node:fs";
import type { PalabraAnalizada } from "../src/lib/types";

export type Wav = { muestras: Float32Array; frecuencia: number };

export const leerWav = (archivo: string): Wav => {
  const buf = fs.readFileSync(archivo);
  let pos = 12;
  let frecuencia = 16000;
  let canales = 1;
  while (pos + 8 <= buf.length) {
    const id = buf.toString("ascii", pos, pos + 4);
    const tam = buf.readUInt32LE(pos + 4);
    if (id === "fmt ") {
      canales = buf.readUInt16LE(pos + 10);
      frecuencia = buf.readUInt32LE(pos + 12);
    } else if (id === "data") {
      const fin = Math.min(buf.length, pos + 8 + tam);
      const n = Math.floor((fin - pos - 8) / 2 / canales);
      const muestras = new Float32Array(n);
      for (let i = 0; i < n; i++) muestras[i] = buf.readInt16LE(pos + 8 + i * 2 * canales) / 32768;
      return { muestras, frecuencia };
    }
    pos += 8 + tam + (tam % 2);
  }
  throw new Error(`WAV sin datos: ${archivo}`);
};

const SALTO_S = 0.01; // 10 ms entre ventanas

const energias = (wav: Wav): Float32Array => {
  const salto = Math.round(wav.frecuencia * SALTO_S);
  const n = Math.floor(wav.muestras.length / salto);
  const e = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    let s = 0;
    for (let i = k * salto; i < (k + 1) * salto; i++) s += wav.muestras[i] * wav.muestras[i];
    e[k] = Math.sqrt(s / salto);
  }
  return e;
};

const percentil = (valores: number[], p: number) => {
  if (!valores.length) return 0;
  const v = [...valores].sort((a, b) => a - b);
  return v[Math.min(v.length - 1, Math.floor(p * v.length))];
};

/** YIN sobre una ventana que empieza en `inicio`. Devuelve Hz o null (sin voz). */
const yin = (x: Float32Array, inicio: number, ventana: number, lagMin: number, lagMax: number, sr: number) => {
  if (inicio + ventana + lagMax >= x.length) return null;
  const d = new Float32Array(lagMax + 1);
  for (let tau = 1; tau <= lagMax; tau++) {
    let s = 0;
    for (let j = 0; j < ventana; j++) {
      const dif = x[inicio + j] - x[inicio + j + tau];
      s += dif * dif;
    }
    d[tau] = s;
  }
  // Diferencia normalizada acumulada
  let acumulado = 0;
  const cmnd = new Float32Array(lagMax + 1);
  cmnd[0] = 1;
  for (let tau = 1; tau <= lagMax; tau++) {
    acumulado += d[tau];
    cmnd[tau] = acumulado > 0 ? (d[tau] * tau) / acumulado : 1;
  }
  const UMBRAL = 0.15;
  for (let tau = lagMin; tau <= lagMax; tau++) {
    if (cmnd[tau] < UMBRAL) {
      while (tau + 1 <= lagMax && cmnd[tau + 1] < cmnd[tau]) tau++;
      // Interpolación parabólica para afinar el período
      const a = cmnd[tau - 1] ?? cmnd[tau];
      const b = cmnd[tau];
      const c = cmnd[tau + 1] ?? cmnd[tau];
      const den = a - 2 * b + c;
      const ajuste = den !== 0 ? (0.5 * (a - c)) / den : 0;
      return sr / (tau + ajuste);
    }
  }
  return null;
};

type PalabraBruta = { texto: string; inicio: number; fin: number };

/**
 * Para cada palabra calcula:
 *  - la pausa real que viene después (silencio continuo medido en el audio)
 *  - el final (= donde empieza esa pausa)
 *  - el tono de cada ventana con voz (YIN)
 * Los inicios se respetan tal cual los da Whisper.
 */
export const analizarPalabras = (wav: Wav, palabras: PalabraBruta[]): PalabraAnalizada[] => {
  const e = energias(wav);
  const sr = wav.frecuencia;
  const ventana = Math.round(0.03 * sr);
  const lagMin = Math.floor(sr / 420);
  const lagMax = Math.ceil(sr / 65);
  const saltoTono = Math.round(0.015 * sr);
  const aVentana = (s: number) => Math.max(0, Math.min(e.length - 1, Math.round(s / SALTO_S)));
  const duracion = e.length * SALTO_S;

  // "Silencio" relativo a la voz: así funciona aunque haya música de fondo suave
  const todas = Array.from(e);
  const silencio = Math.max(percentil(todas, 0.9) * 0.12, percentil(todas, 0.05) * 1.5);

  /** Silencio continuo más largo dentro de [desde, hasta] */
  const silencioMasLargo = (desdeS: number, hastaS: number) => {
    let inicio = hastaS;
    let largo = 0;
    let corrida = 0;
    for (let k = aVentana(desdeS); k <= aVentana(hastaS); k++) {
      if (e[k] < silencio) {
        corrida++;
        if (corrida > largo) {
          largo = corrida;
          inicio = (k - corrida + 1) * SALTO_S;
        }
      } else corrida = 0;
    }
    return { inicio, largo: largo * SALTO_S };
  };

  // 1. Whisper suele marcar tarde la palabra que viene después de una pausa:
  //    la movemos al final real del silencio (como mucho 400 ms antes).
  const inicios = palabras.map((p) => p.inicio);
  for (let i = 0; i < inicios.length; i++) {
    const desde = i === 0 ? 0 : inicios[i - 1] + 0.08;
    if (inicios[i] - desde < 0.1) continue;
    const s = silencioMasLargo(desde, inicios[i]);
    const finSilencio = s.inicio + s.largo;
    if (s.largo >= 0.08 && finSilencio < inicios[i] && inicios[i] - finSilencio <= 0.4) {
      inicios[i] = Math.max(desde, finSilencio);
    }
  }

  // Final real de la voz: Whisper a veces "inventa" frases en el silencio del final
  let ultimaVoz = e.length - 1;
  while (ultimaVoz > 0 && e[ultimaVoz] < silencio) ultimaVoz--;
  const finVoz = (ultimaVoz + 1) * SALTO_S + 0.2;

  return palabras.flatMap((p, i) => {
    if (inicios[i] > finVoz) return [];
    const inicio = inicios[i];
    const sig = inicios[i + 1];
    const limite = sig !== undefined ? Math.max(sig, inicio + 0.05) : Math.min(duracion, Math.max(p.fin, inicio) + 2);

    // 2. Pausa real después de la palabra y final de la palabra
    const s = silencioMasLargo(inicio + 0.08, limite);
    const pausa = s.largo;
    const fin = pausa >= 0.08 ? Math.max(inicio + 0.08, s.inicio) : limite;

    // 3. Tono de cada ventana con voz
    const tramo = Array.from(e.slice(aVentana(inicio), aVentana(fin) + 1));
    const fuerte = percentil(tramo, 0.8);
    const tonos: number[] = [];
    for (let m = Math.round(inicio * sr); m < Math.round(fin * sr) - ventana; m += saltoTono) {
      if (e[aVentana(m / sr)] < Math.max(fuerte * 0.3, silencio)) continue;
      const f = yin(wav.muestras, m, ventana, lagMin, lagMax, sr);
      if (f !== null && f >= 65 && f <= 420) tonos.push(Math.round(f));
    }
    const f0 = tonos.length >= 2 ? percentil(tonos, 0.5) : null;

    return [{
      texto: p.texto,
      inicio: Math.round(inicio * 1000) / 1000,
      fin: Math.round(fin * 1000) / 1000,
      pausaDespues: Math.round(pausa * 1000) / 1000,
      f0,
      tonos,
    }];
  });
};
