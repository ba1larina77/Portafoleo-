// Rutas del proyecto y acceso a ffmpeg/ffprobe (se usan los que trae Remotion).

import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DIR = {
  input: path.join(RAIZ, "input"),
  captions: path.join(RAIZ, "captions"),
  overrides: path.join(RAIZ, "overrides"),
  out: path.join(RAIZ, "out"),
  sfx: path.join(RAIZ, "assets", "sfx"),
  cache: path.join(RAIZ, ".cache"),
  whisper: path.join(RAIZ, ".whisper"),
  public: path.join(RAIZ, "public"),
};

export const EXTENSIONES_VIDEO = [".mp4", ".mov", ".m4v"];

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

export type InfoVideo = { ancho: number; alto: number; fps: number; duracionFrames: number; duracionS: number };

const fraccion = (s?: string): number => {
  if (!s) return 0;
  const [a, b] = s.split("/").map(Number);
  return b ? a / b : a;
};

export const analizarVideo = async (archivo: string): Promise<InfoVideo> => {
  const json = JSON.parse(
    await ejecutar("ffprobe", [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height,r_frame_rate,avg_frame_rate,nb_frames,duration:stream_side_data=rotation:format=duration",
      "-of", "json",
      archivo,
    ]),
  );
  const v = json.streams?.[0];
  if (!v) throw new Error(`${archivo} no tiene pista de video`);
  const fpsBruto = fraccion(v.r_frame_rate) || fraccion(v.avg_frame_rate) || 30;
  const fps = Math.round(fpsBruto * 1000) / 1000;
  const duracionS = Number(v.duration) || Number(json.format?.duration) || 0;
  const frames = Number(v.nb_frames) || Math.round(duracionS * fps);
  const rotacion = Math.abs(Number(v.side_data_list?.[0]?.rotation ?? 0));
  const girado = rotacion === 90 || rotacion === 270;
  return {
    ancho: girado ? v.height : v.width,
    alto: girado ? v.width : v.height,
    fps,
    duracionFrames: Math.max(1, frames),
    duracionS,
  };
};

/** Audio mono 16 kHz PCM, el formato que pide whisper.cpp */
export const extraerWav = async (video: string, wav: string) => {
  fs.mkdirSync(path.dirname(wav), { recursive: true });
  await ejecutar("ffmpeg", ["-y", "-i", video, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", wav]);
};

export const masNuevo = (a: string, b: string): boolean =>
  fs.existsSync(a) && (!fs.existsSync(b) || fs.statSync(a).mtimeMs > fs.statSync(b).mtimeMs);

export const listarVideos = (): { nombre: string; archivo: string }[] => {
  if (!fs.existsSync(DIR.input)) return [];
  return fs
    .readdirSync(DIR.input)
    .filter((f) => EXTENSIONES_VIDEO.includes(path.extname(f).toLowerCase()))
    .map((f) => ({ nombre: path.basename(f, path.extname(f)), archivo: path.join(DIR.input, f) }));
};

export const buscarVideo = (entrada: string) => {
  const nombre = path.basename(entrada, path.extname(entrada));
  const video = listarVideos().find((v) => v.nombre === nombre);
  if (!video) throw new Error(`No encontré "${nombre}" en input/ (formatos: ${EXTENSIONES_VIDEO.join(", ")})`);
  return video;
};

export type Recorte = { x: number; y: number; ancho: number; alto: number };

/** ffmpeg con salida binaria (stdout como Buffer) */
const ejecutarBinario = (args: string[]): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const { cmd, cwd } = binario("ffmpeg");
    const env = cwd ? { ...process.env, LD_LIBRARY_PATH: cwd, DYLD_LIBRARY_PATH: cwd } : process.env;
    const proc = spawn(cmd, args, { env });
    const trozos: Buffer[] = [];
    let errores = "";
    proc.stdout.on("data", (d: Buffer) => trozos.push(d));
    proc.stderr.on("data", (d) => (errores += d));
    proc.on("error", reject);
    proc.on("close", (code) =>
      code === 0 ? resolve(Buffer.concat(trozos)) : reject(new Error(`ffmpeg falló:\n${errores.slice(-2000)}`)),
    );
  });

/**
 * Busca barras negras fijas (por ejemplo un video vertical exportado dentro de un cuadro 16:9).
 * Devuelve la zona con imagen, o null si no hay barras.
 */
export const detectarBarrasNegras = async (archivo: string, info: InfoVideo): Promise<Recorte | null> => {
  const W = 320;
  const H = Math.round((W * info.alto) / info.ancho / 2) * 2;
  const muestras = 12;
  const partes: Buffer[] = [];
  for (let i = 1; i <= muestras; i++) {
    const t = (info.duracionS * i) / (muestras + 1);
    partes.push(
      await ejecutarBinario([
        "-v", "error", "-ss", t.toFixed(2), "-i", archivo, "-frames:v", "1",
        "-vf", `scale=${W}:${H},format=gray`, "-c:v", "rawvideo", "-f", "image2pipe", "pipe:1",
      ]),
    );
  }
  const buf = Buffer.concat(partes.filter((p) => p.length === W * H));
  const frames = Math.floor(buf.length / (W * H));
  if (frames === 0) return null;
  // Brillo máximo por columna y por fila en todos los fotogramas
  const col = new Uint8Array(W);
  const fila = new Uint8Array(H);
  for (let f = 0; f < frames; f++) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const v = buf[f * W * H + y * W + x];
        if (v > col[x]) col[x] = v;
        if (v > fila[y]) fila[y] = v;
      }
    }
  }
  const UMBRAL = 28;
  const primero = (a: Uint8Array) => a.findIndex((v) => v > UMBRAL);
  const ultimo = (a: Uint8Array) => a.length - 1 - [...a].reverse().findIndex((v) => v > UMBRAL);
  const x0 = primero(col);
  const y0 = primero(fila);
  if (x0 < 0 || y0 < 0) return null;
  const x1 = ultimo(col) + 1;
  const y1 = ultimo(fila) + 1;
  // Solo si las barras ocupan una parte importante (>8 % del ancho o del alto)
  if ((W - (x1 - x0)) / W < 0.08 && (H - (y1 - y0)) / H < 0.08) return null;
  const kx = info.ancho / W;
  const ky = info.alto / H;
  // Un par de píxeles hacia adentro (solo donde hay barras) para no dejar bordes oscuros
  const mx = x1 - x0 < W ? 2 : 0;
  const my = y1 - y0 < H ? 2 : 0;
  return {
    x: Math.round(x0 * kx) + mx,
    y: Math.round(y0 * ky) + my,
    ancho: Math.round((x1 - x0) * kx) - 2 * mx,
    alto: Math.round((y1 - y0) * ky) - 2 * my,
  };
};
