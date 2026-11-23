// Prepara un video para Remotion:
//   input/<nombre>.mp4 → audio → captions/<nombre>.json (solo si no existe)
//   → tono por palabra → public/data/<id>.json + public/videos/<id>.mp4

import type { Caption } from "@remotion/captions";
import fs from "node:fs";
import path from "node:path";
import { idDesdeNombre } from "../src/lib/ids";
import type { DatosVideo, Overrides } from "../src/lib/types";
import { analizarPalabras, leerWav } from "./audio";
import { config } from "../config";
import { DIR, analizarVideo, detectarBarrasNegras, extraerWav, listarVideos, masNuevo } from "./herramientas";
import { transcribir } from "./whisper";

const leerOverrides = (nombre: string): Overrides => {
  const archivo = path.join(DIR.overrides, `${nombre}.json`);
  if (!fs.existsSync(archivo)) return {};
  try {
    return JSON.parse(fs.readFileSync(archivo, "utf8")) as Overrides;
  } catch (e) {
    console.warn(`  ⚠ overrides/${nombre}.json no es JSON válido, lo ignoro: ${(e as Error).message}`);
    return {};
  }
};

/** Enlace duro (no ocupa espacio extra); si no se puede, copia. */
const enlazar = (origen: string, destino: string) => {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  if (fs.existsSync(destino)) {
    const a = fs.statSync(origen);
    const b = fs.statSync(destino);
    if (a.ino === b.ino && a.ino !== 0) return;
    if (a.size === b.size && b.mtimeMs >= a.mtimeMs) return;
    fs.rmSync(destino);
  }
  try {
    fs.linkSync(origen, destino);
  } catch {
    fs.copyFileSync(origen, destino);
  }
};

export const copiarSfx = () => {
  if (!fs.existsSync(DIR.sfx)) return;
  const destino = path.join(DIR.public, "sfx");
  fs.mkdirSync(destino, { recursive: true });
  for (const f of fs.readdirSync(DIR.sfx)) {
    const origen = path.join(DIR.sfx, f);
    if (fs.statSync(origen).isFile() && masNuevo(origen, path.join(destino, f))) {
      fs.copyFileSync(origen, path.join(destino, f));
    }
  }
};

type Opciones = { transcribirSiFalta?: boolean; modelo?: string };

export const prepararVideo = async (nombre: string, archivo: string, opciones: Opciones = {}) => {
  const id = idDesdeNombre(nombre);
  const wav = path.join(DIR.cache, `${id}.wav`);
  const captions = path.join(DIR.captions, `${nombre}.json`);
  const overrides = path.join(DIR.overrides, `${nombre}.json`);
  const datos = path.join(DIR.public, "data", `${id}.json`);
  const videoPublico = path.join(DIR.public, "videos", `${id}.mp4`);

  console.log(`▶ ${nombre}`);
  enlazar(archivo, videoPublico);

  const alDia =
    fs.existsSync(datos) &&
    fs.existsSync(captions) &&
    !masNuevo(archivo, datos) &&
    !masNuevo(captions, datos) &&
    !masNuevo(overrides, datos);
  if (alDia) {
    console.log("  ✓ ya estaba procesado");
    return { id, listo: true };
  }

  if (!fs.existsSync(wav) || masNuevo(archivo, wav)) {
    console.log("  Extrayendo audio…");
    await extraerWav(archivo, wav);
  }

  if (!fs.existsSync(captions)) {
    if (!opciones.transcribirSiFalta) {
      console.log(`  (sin transcripción; ejecuta npm run render -- ${nombre})`);
      return { id, listo: false };
    }
    const lista = await transcribir(wav, (opciones.modelo as never) ?? undefined);
    fs.mkdirSync(DIR.captions, { recursive: true });
    fs.writeFileSync(captions, JSON.stringify(lista, null, 2));
    console.log(`  ✓ transcripción guardada en captions/${nombre}.json (${lista.length} palabras)`);
  }

  const lista = JSON.parse(fs.readFileSync(captions, "utf8")) as Caption[];
  const info = await analizarVideo(archivo);
  console.log(`  Analizando voces… (${info.ancho}x${info.alto}, ${info.fps} fps, ${info.duracionS.toFixed(1)} s)`);
  const palabras = analizarPalabras(
    leerWav(wav),
    lista
      .map((c) => ({ texto: c.text.replace(/\[[^\]]*\]/g, "").trim(), inicio: c.startMs / 1000, fin: c.endMs / 1000 }))
      .filter((c) => c.texto !== ""),
  );

  let recorte = config.video.recortarBarrasNegras ? await detectarBarrasNegras(archivo, info) : null;
  let ancho = info.ancho;
  let alto = info.alto;
  if (recorte && recorte.alto > recorte.ancho && info.ancho > info.alto) {
    ancho = 1080;
    alto = 1920;
    console.log(`  Barras negras detectadas: se recorta ${recorte.ancho}x${recorte.alto} y la salida queda en 1080x1920`);
  } else {
    recorte = null;
  }

  const salida: DatosVideo = {
    id,
    nombre,
    video: `videos/${id}.mp4`,
    ancho,
    alto,
    anchoOriginal: info.ancho,
    altoOriginal: info.alto,
    recorte,
    fps: info.fps,
    duracionFrames: info.duracionFrames,
    palabras,
    overrides: leerOverrides(nombre),
  };
  fs.mkdirSync(path.dirname(datos), { recursive: true });
  fs.writeFileSync(datos, JSON.stringify(salida, null, 1));
  console.log("  ✓ listo");
  return { id, listo: true };
};

/** Prepara todo input/ y borra de public/ lo que ya no existe. */
export const prepararTodo = async (opciones: Opciones = {}) => {
  copiarSfx();
  const videos = listarVideos();
  const ids = new Map<string, string>();
  for (const v of videos) {
    const id = idDesdeNombre(v.nombre);
    if (ids.has(id)) console.warn(`⚠ "${v.nombre}" y "${ids.get(id)}" chocan (mismo id "${id}"). Renombra uno.`);
    ids.set(id, v.nombre);
  }
  for (const carpeta of ["data", "videos"]) {
    const dir = path.join(DIR.public, carpeta);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!ids.has(path.basename(f, path.extname(f)))) fs.rmSync(path.join(dir, f));
    }
  }
  const resultados = [];
  for (const v of videos) {
    try {
      resultados.push({ ...v, ...(await prepararVideo(v.nombre, v.archivo, opciones)) });
    } catch (e) {
      console.error(`  ✗ ${v.nombre}: ${(e as Error).message}`);
    }
  }
  return resultados;
};

// Uso directo: npm run preparar
if (process.argv[1] && path.resolve(process.argv[1]).includes(`${path.sep}preparar.`)) {
  prepararTodo({ transcribirSiFalta: true }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
