// npm run render -- <nombre>
//   Solo funciona si el video está aprobado y el .txt no cambió desde la aprobación.
//   La salida tiene la misma resolución, fps y duración que el original, y su audio se copia sin tocar.

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config";
import { huellaTxt } from "../src/lib/subtitulos";
import { webpackOverride } from "../webpack";
import {
  ARCHIVO,
  DIR,
  RAIZ,
  analizarVideo,
  buscarVideo,
  nombreDesdeArgs,
  ejecutar,
  enlazar,
  imprimirProblemas,
  leerAprobados,
  revisarTxt,
} from "./herramientas";

const negar = (motivo: string, nombre: string): never => {
  console.error(`\n✋ No renderizo "${nombre}": ${motivo}`);
  console.error(`\n   Pasos: 1) revisa en Studio   2) npm run aprobar -- ${nombre}   3) npm run render -- ${nombre}`);
  process.exit(1);
};

const principal = async () => {
  const { nombre, archivo, id } = buscarVideo(nombreDesdeArgs(process.argv.slice(2)));

  // ---- Candado de aprobación ----
  const { txt, base, resultado } = revisarTxt(nombre);
  const aprobacion = leerAprobados()[nombre];
  if (!aprobacion) negar("todavía no está aprobado.", nombre);
  if (aprobacion.hash !== huellaTxt(txt)) {
    negar(`subtitulos/${nombre}.txt cambió después de aprobarlo (${new Date(aprobacion.fecha).toLocaleString("es")}).`, nombre);
  }
  if (resultado.problemas.some((p) => p.tipo === "error")) {
    imprimirProblemas(nombre, resultado);
    negar("el .txt tiene errores.", nombre);
  }

  const info = await analizarVideo(archivo);
  if (info.ancho !== base.ancho || info.alto !== base.alto || info.duracionFrames !== base.duracionFrames) {
    negar(`input/${path.basename(archivo)} cambió desde que se transcribió. Ejecuta npm run subtitular -- ${nombre} --regenerar`, nombre);
  }

  console.log(`✓ "${nombre}" aprobado. Empaquetando…`);
  // public/ temporal solo con este video (así no se copian todos los vlogs)
  const publico = path.join(DIR.cache, "public-render");
  fs.rmSync(publico, { recursive: true, force: true });
  enlazar(archivo, path.join(publico, base.video));

  const serveUrl = await bundle({
    entryPoint: path.join(RAIZ, "src", "index.ts"),
    publicDir: publico,
    webpackOverride,
  });
  const composition = await selectComposition({ serveUrl, id, inputProps: { nombre } });

  const soloVideo = path.join(DIR.cache, `${id}.video.mp4`);
  const destino = ARCHIVO.salida(nombre);
  fs.mkdirSync(DIR.out, { recursive: true });

  console.log(`● Renderizando ${composition.width}x${composition.height} @ ${composition.fps} fps…`);
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: soloVideo,
    inputProps: { nombre },
    crf: config.render.crf,
    muted: true, // el audio original se copia después, sin recodificar
    imageFormat: "jpeg",
    jpegQuality: 95,
    onProgress: ({ progress }) => process.stdout.write(`\r  ${Math.round(progress * 100)}%   `),
  });

  console.log("\n● Copiando el audio original…");
  await ejecutar("ffmpeg", [
    "-y",
    "-i", soloVideo,
    "-i", archivo,
    "-map", "0:v:0",
    "-map", "1:a?",
    "-c", "copy",
    "-map_metadata", "1",
    "-movflags", "+faststart",
    destino,
  ]);
  fs.rmSync(soloVideo, { force: true });
  fs.rmSync(publico, { recursive: true, force: true });

  const final = await analizarVideo(destino);
  console.log(
    `✓ ${path.relative(RAIZ, destino)}  (${final.ancho}x${final.alto}, ${final.fps} fps, ${final.duracionS.toFixed(2)} s; ` +
      `original: ${info.duracionS.toFixed(2)} s)`,
  );
};

principal().catch((e) => {
  console.error(`\n✗ ${(e as Error).message}`);
  process.exit(1);
});
