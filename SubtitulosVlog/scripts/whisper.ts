// Transcripción con whisper.cpp y tiempos palabra por palabra.

import { downloadWhisperModel, installWhisperCpp, transcribe } from "@remotion/install-whisper-cpp";
import os from "node:os";
import { config } from "../config";
import { DIR } from "./herramientas";

/** captions/<nombre>.raw.json: palabras tal cual las escribió Whisper (con signos) */
export type PalabraCruda = { texto: string; inicioMs: number; finMs: number; confianza: number };

// Whisper a veces "inventa" estas frases en los silencios
const ALUCINACIONES = /amara\.org|subt[ií]tulos (realizados|por)|suscr[ií]bete|gracias por ver/i;
const APERTURA = /^[¿¡«“"'(]+$/;
const SOLO_SIGNOS = /^[^\p{L}\p{N}]+$/u;

export const transcribir = async (wav: string, glosario: string[], modelo = config.whisper.modelo) => {
  const version = config.whisper.version;
  await installWhisperCpp({ to: DIR.whisper, version, printOutput: false });
  await downloadWhisperModel({
    model: modelo,
    folder: DIR.whisper,
    printOutput: false,
    onProgress: (bajado, total) => {
      process.stdout.write(`\r  Descargando modelo ${modelo}: ${((bajado / total) * 100).toFixed(1)}%   `);
    },
  });

  const args: [string, string][] = [["-t", String(Math.max(4, os.cpus().length))]];
  if (glosario.length) {
    // El prompt inicial "enseña" a Whisper cómo se escriben estas palabras
    args.push(["--prompt", `Vocabulario: ${glosario.join(", ")}.`]);
  }

  const salida = await transcribe({
    inputPath: wav,
    whisperPath: DIR.whisper,
    whisperCppVersion: version,
    model: modelo,
    modelFolder: DIR.whisper,
    tokenLevelTimestamps: true,
    language: config.whisper.idioma,
    printOutput: false,
    additionalArgs: args,
    onProgress: (p) => process.stdout.write(`\r  Transcribiendo: ${Math.round(p * 100)}%   `),
  });
  process.stdout.write("\n");

  // Unimos tokens en palabras: un token que empieza con espacio abre palabra nueva.
  const palabras: PalabraCruda[] = [];
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
        else ultima.texto += limpio;
        continue;
      }
      if (tok.text.startsWith(" ") || !ultima || prefijo) {
        palabras.push({ texto: `${prefijo}${limpio}`, inicioMs, finMs: tok.offsets.to, confianza: tok.p });
        prefijo = "";
      } else {
        ultima.texto += limpio;
        ultima.finMs = Math.max(ultima.finMs, tok.offsets.to);
      }
    }
  }

  // Etiquetas tipo [Música] o [AUDIO_EN_BLANCO]
  const utiles = palabras
    .map((p) => ({ ...p, texto: p.texto.replace(/\[[^\]]*\]/g, "").trim() }))
    .filter((p) => p.texto !== "");

  // Whisper a veces entra en bucle repitiendo la misma frase: dejamos solo la primera
  const oraciones: PalabraCruda[][] = [];
  let actual: PalabraCruda[] = [];
  for (const p of utiles) {
    actual.push(p);
    if (/[.?!…]["'»”)]*$/.test(p.texto)) {
      oraciones.push(actual);
      actual = [];
    }
  }
  if (actual.length) oraciones.push(actual);
  const clave = (o: PalabraCruda[]) => o.map((p) => p.texto.toLowerCase()).join(" ");
  const resultado = oraciones.filter((o, k) => k === 0 || clave(o) !== clave(oraciones[k - 1])).flat();

  // Tiempos coherentes: crecientes y sin solaparse
  for (let i = 0; i < resultado.length; i++) {
    const p = resultado[i];
    const previa = resultado[i - 1];
    if (previa && p.inicioMs < previa.inicioMs) p.inicioMs = previa.inicioMs;
    const sig = resultado[i + 1];
    const tope = sig ? Math.max(sig.inicioMs, p.inicioMs) : p.finMs;
    p.finMs = Math.min(Math.max(p.finMs, p.inicioMs + 120), sig ? tope : p.inicioMs + 1500);
    if (p.finMs <= p.inicioMs) p.finMs = p.inicioMs + 120;
  }
  return resultado;
};
