// Rutas del proyecto, ffmpeg/ffprobe (los que trae Remotion) y utilidades comunes.

import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { idDesdeNombre } from "../src/lib/ids";
import { leerTxt, type Aprobados, type DatosBase, type ResultadoTxt } from "../src/lib/subtitulos";

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DIR = {
  input: path.join(RAIZ, "input"),
  out: path.join(RAIZ, "out"),
  captions: path.join(RAIZ, "captions"),
  subtitulos: path.join(RAIZ, "subtitulos"),
  public: path.join(RAIZ, "public"),
  cache: path.join(RAIZ, ".cache"),
  whisper: path.join(RAIZ, ".whisper"),
};
export const ARCHIVO = {
  glosario: path.join(RAIZ, "glosario.txt"),
  correcciones: path.join(RAIZ, "correcciones.json"),
  aprobados: path.join(RAIZ, "aprobados.json"),
  raw: (nombre: string) => path.join(DIR.captions, `${nombre}.raw.json`),
  base: (nombre: string) => path.join(DIR.captions, `${nombre}.base.json`),
  txt: (nombre: string) => path.join(DIR.subtitulos, `${nombre}.txt`),
  salida: (nombre: string) => path.join(DIR.out, `${nombre}.mp4`),
};

// ---------- ffmpeg / ffprobe ----------

const require = createRequire(import.meta.url);
const PAQUETES_COMPOSITOR: Record<string, string> = {
  "win32-x64": "@remotion/compositor-win32-x64-msvc",
  "darwin-arm64": "@remotion/compositor-darwin-arm64",
  "darwin-x64": "@remotion/compositor-darwin-x64",
  "linux-x64": "@remotion/compositor-linux-x64-gnu",
  "linux-arm64": "@remotion/compositor-linux-arm64-gnu",
};

const binario = (nombre: "ffmpeg" | "ffprobe"): { cmd: string; cwd?: string } => {
  const paquete = PAQUETES_COMPOSITOR[`${process.platform}-${process.arch}`];
  if (paquete) {
    try {
      const { dir } = require(paquete) as { dir: string };
      const exe = path.join(dir, process.platform === "win32" ? `${nombre}.exe` : nombre);
      if (fs.existsSync(exe)) return { cmd: exe, cwd: dir };
    } catch {
      // no instalado: usamos el del sistema
    }
  }
  return { cmd: nombre };
};

export const ejecutar = (nombre: "ffmpeg" | "ffprobe", args: string[]): Promise<string> =>
  new Promise((resolve, reject) => {
    const { cmd, cwd } = binario(nombre);
    const env = cwd ? { ...process.env, LD_LIBRARY_PATH: cwd, DYLD_LIBRARY_PATH: cwd } : process.env;
    const proc = spawn(cmd, args, { env });
    let salida = "";
    let errores = "";
    proc.stdout.on("data", (d) => (salida += d));
    proc.stderr.on("data", (d) => (errores += d));
    proc.on("error", reject);
    proc.on("close", (code) =>
      code === 0 ? resolve(salida) : reject(new Error(`${nombre} falló (código ${code}):\n${errores.slice(-2000)}`)),
    );
  });

export type InfoVideo = {
  ancho: number;
  alto: number;
  fps: number;
  duracionFrames: number;
  duracionS: number;
  tieneAudio: boolean;
};

const fraccion = (s?: string): number => {
  if (!s) return 0;
  const [a, b] = s.split("/").map(Number);
  return b ? a / b : a;
};

export const analizarVideo = async (archivo: string): Promise<InfoVideo> => {
  const json = JSON.parse(
    await ejecutar("ffprobe", [
      "-v", "error",
      "-show_entries",
      "stream=codec_type,width,height,r_frame_rate,avg_frame_rate,nb_frames,duration:stream_side_data=rotation:format=duration",
      "-of", "json",
      archivo,
    ]),
  );
  const streams: Record<string, unknown>[] = json.streams ?? [];
  const v = streams.find((s) => s.codec_type === "video") as Record<string, never> | undefined;
  if (!v) throw new Error(`${archivo} no tiene pista de video`);
  // Celulares graban a veces con fps variable: r_frame_rate puede salir 90 o 120 aunque sea ~30
  const r = fraccion(v.r_frame_rate);
  const avg = fraccion(v.avg_frame_rate);
  const bruto = r > 0 && r <= 61 ? r : avg || r || 30;
  const fps = Math.round(bruto * 1000) / 1000;
  const duracionS = Number(v.duration) || Number(json.format?.duration) || 0;
  const frames = r > 0 && r <= 61 && Number(v.nb_frames) ? Number(v.nb_frames) : Math.round(duracionS * fps);
  const rotacion = Math.abs(Number((v.side_data_list as { rotation?: number }[] | undefined)?.[0]?.rotation ?? 0));
  const girado = rotacion === 90 || rotacion === 270;
  return {
    ancho: girado ? v.height : v.width,
    alto: girado ? v.width : v.height,
    fps,
    duracionFrames: Math.max(1, frames),
    duracionS,
    tieneAudio: streams.some((s) => s.codec_type === "audio"),
  };
};

/** Audio mono 16 kHz PCM, el formato que pide whisper.cpp */
export const extraerWav = async (video: string, wav: string) => {
  fs.mkdirSync(path.dirname(wav), { recursive: true });
  await ejecutar("ffmpeg", ["-y", "-i", video, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", wav]);
};

// ---------- Archivos ----------

export const EXTENSIONES_VIDEO = [".mp4", ".mov", ".m4v"];

export const buscarVideo = (entrada: string | undefined) => {
  if (!entrada) throw new Error("Falta el nombre del video. Ejemplo: npm run subtitular -- mi-vlog");
  const nombre = path.basename(entrada, path.extname(entrada));
  const archivo = EXTENSIONES_VIDEO.map((e) => path.join(DIR.input, `${nombre}${e}`)).find((f) => fs.existsSync(f));
  if (!archivo) {
    const hay = fs.existsSync(DIR.input)
      ? fs.readdirSync(DIR.input).filter((f) => EXTENSIONES_VIDEO.includes(path.extname(f).toLowerCase()))
      : [];
    throw new Error(
      `No encontré "${nombre}" en input/.` + (hay.length ? ` Videos disponibles: ${hay.join(", ")}` : " La carpeta está vacía."),
    );
  }
  return { nombre, archivo, id: idDesdeNombre(nombre) };
};

/** Enlace duro (no ocupa espacio extra); si no se puede, copia. */
export const enlazar = (origen: string, destino: string) => {
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

export const leerJson = <T>(archivo: string, siNoExiste: T): T => {
  if (!fs.existsSync(archivo)) return siNoExiste;
  try {
    return JSON.parse(fs.readFileSync(archivo, "utf8").replace(/^﻿/, "")) as T;
  } catch (e) {
    throw new Error(`${path.relative(RAIZ, archivo)} no es JSON válido: ${(e as Error).message}`);
  }
};

export const escribirJson = (archivo: string, datos: unknown) => {
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  fs.writeFileSync(archivo, JSON.stringify(datos, null, 2) + "\n");
};

export const leerAprobados = () => leerJson<Aprobados>(ARCHIVO.aprobados, {});

export const leerGlosario = (): string[] =>
  fs.existsSync(ARCHIVO.glosario)
    ? fs
        .readFileSync(ARCHIVO.glosario, "utf8")
        .replace(/^﻿/, "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
    : [];

/** Lee y valida subtitulos/<nombre>.txt con los datos base del video. */
export const revisarTxt = (nombre: string): { txt: string; base: DatosBase; resultado: ResultadoTxt } => {
  const archivoBase = ARCHIVO.base(nombre);
  if (!fs.existsSync(archivoBase)) {
    throw new Error(`Falta captions/${nombre}.base.json. Ejecuta primero: npm run subtitular -- ${nombre}`);
  }
  const archivoTxt = ARCHIVO.txt(nombre);
  if (!fs.existsSync(archivoTxt)) {
    throw new Error(`Falta subtitulos/${nombre}.txt. Ejecuta: npm run subtitular -- ${nombre}`);
  }
  const base = leerJson<DatosBase>(archivoBase, null as never);
  const txt = fs.readFileSync(archivoTxt, "utf8");
  return { txt, base, resultado: leerTxt(txt, base.palabras, base.duracionS) };
};

export const imprimirProblemas = (nombre: string, r: ResultadoTxt) => {
  if (!r.problemas.length) return;
  for (const p of r.problemas) {
    const etiqueta = p.tipo === "error" ? "✗ Error" : "⚠ Aviso";
    console.log(`  ${etiqueta} en subtitulos/${nombre}.txt, línea ${p.numero}: ${p.mensaje}`);
    console.log(`      ${p.contenido}`);
  }
};

export const preguntar = async (pregunta: string): Promise<string | null> => {
  if (!process.stdin.isTTY) return null;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(pregunta)).trim();
  } finally {
    rl.close();
  }
};

/** npm en Windows parte "mi vlog" en dos argumentos: los unimos de nuevo. */
export const nombreDesdeArgs = (args: string[]): string | undefined =>
  args.filter((a) => !a.startsWith("--")).join(" ").trim() || undefined;
