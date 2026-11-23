// Transcripción con whisper.cpp y tiempos palabra por palabra.

import type { Caption } from "@remotion/captions";
import { downloadWhisperModel, installWhisperCpp, transcribe } from "@remotion/install-whisper-cpp";
import os from "node:os";
import { config } from "../config";
import { DIR } from "./herramientas";

// Whisper a veces "inventa" estas frases en los silencios
const ALUCINACIONES = /amara\.org|subt[ií]tulos (realizados|por)|suscr[ií]bete|gracias por ver/i;
const APERTURA = /^[¿¡«“"'(]+$/;
const SOLO_SIGNOS = /^[^\p{L}\p{N}]+$/u;

export const transcribir = async (wav: string, modelo = config.whisper.modelo): Promise<Caption[]> => {
  const version = config.whisper.version;
  await installWhisperCpp({ to: DIR.whisper, version, printOutput: true });
  await downloadWhisperModel({
    model: modelo,
    folder: DIR.whisper,
    printOutput: false,
    onProgress: (bajado, total) => {
      process.stdout.write(`\r  Descargando modelo ${modelo}: ${((bajado / total) * 100).toFixed(1)}%   `);
    },
  });
  process.stdout.write("\n");

  const salida = await transcribe({
    inputPath: wav,
    whisperPath: DIR.whisper,
    whisperCppVersion: version,
    model: modelo,
    modelFolder: DIR.whisper,
    tokenLevelTimestamps: true,
    language: config.whisper.idioma,
    printOutput: false,
    // whisper.cpp usa 4 hilos por defecto: usamos todos los núcleos
    additionalArgs: [["-t", String(Math.max(4, os.cpus().length))]],
    onProgress: (p) => process.stdout.write(`\r  Transcribiendo: ${Math.round(p * 100)}%   `),
  });
  process.stdout.write("\n");

  // Unimos tokens en palabras: un token que empieza con espacio abre palabra nueva.
  const palabras: Caption[] = [];
  let prefijo = "";
  for (const segmento of salida.transcription) {
    if (ALUCINACIONES.test(segmento.text)) continue;
    for (const tok of segmento.tokens) {
      if (/^\s*\[_?[A-Z_]+.*\]\s*$/.test(tok.text) || /^<\|.*\|>$/.test(tok.text.trim())) continue;
      const limpio = tok.text.trim();
      if (!limpio) continue;
      const inicioMs = tok.t_dtw !== -1 ? tok.t_dtw * 10 : tok.offsets.from;
      const ultima = palabras[palabras.length - 1];

      if (SOLO_SIGNOS.test(limpio)) {
        // Signos sueltos: los de apertura van con la palabra siguiente, el resto con la anterior
        if (APERTURA.test(limpio) || !ultima) prefijo += limpio;
        else ultima.text += limpio;
        continue;
      }
      if (tok.text.startsWith(" ") || !ultima || prefijo) {
        palabras.push({
          text: ` ${prefijo}${limpio}`,
          startMs: inicioMs,
          endMs: tok.offsets.to,
          timestampMs: inicioMs,
          confidence: tok.p,
        });
        prefijo = "";
      } else {
        ultima.text += limpio;
        ultima.endMs = Math.max(ultima.endMs, tok.offsets.to);
      }
    }
  }

  // Etiquetas tipo [AUDIO_EN_BLANCO] o [Música]
  for (const p of palabras) p.text = p.text.replace(/\[[^\]]*\]/g, "");
  const utiles = palabras.filter((p) => p.text.trim() !== "");
  palabras.length = 0;
  palabras.push(...utiles);

  // Whisper a veces entra en bucle repitiendo la misma frase: dejamos solo la primera
  const oraciones: Caption[][] = [];
  let actual: Caption[] = [];
  for (const p of palabras) {
    actual.push(p);
    if (/[.?!…]["'»”)]*$/.test(p.text.trim())) {
      oraciones.push(actual);
      actual = [];
    }
  }
  if (actual.length) oraciones.push(actual);
  const clave = (o: Caption[]) => o.map((p) => p.text.trim().toLowerCase()).join(" ");
  const sinBucles = oraciones.filter((o, k) => k === 0 || clave(o) !== clave(oraciones[k - 1]));
  palabras.length = 0;
  palabras.push(...sinBucles.flat());

  // Tiempos coherentes: crecientes y sin solaparse
  for (let i = 0; i < palabras.length; i++) {
    const p = palabras[i];
    const previa = palabras[i - 1];
    if (previa && p.startMs < previa.startMs) p.startMs = previa.startMs;
    const sig = palabras[i + 1];
    const tope = sig ? Math.max(sig.startMs, p.startMs) : p.endMs;
    p.endMs = Math.min(Math.max(p.endMs, p.startMs + 120), sig ? tope : p.startMs + 1500);
    if (p.endMs <= p.startMs) p.endMs = p.startMs + 120;
  }
  return palabras;
};
