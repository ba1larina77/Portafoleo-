// npm run render -- <nombre>      → procesa y renderiza un video
// npm run render:all              → todos los de input/ que no estén en out/

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config";
import { DIR, RAIZ, buscarVideo, listarVideos } from "./herramientas";
import { copiarSfx, prepararTodo, prepararVideo } from "./preparar";

const args = process.argv.slice(2);
const todos = args.includes("--all");
const iModelo = args.indexOf("--modelo");
const modelo = iModelo >= 0 ? args[iModelo + 1] : undefined;
const nombres = args.filter((a, i) => !a.startsWith("--") && (iModelo < 0 || i !== iModelo + 1));

const principal = async () => {
  let pendientes: { nombre: string; id: string }[] = [];

  if (todos) {
    const faltan = new Set(
      listarVideos()
        .filter((v) => !fs.existsSync(path.join(DIR.out, `${v.nombre}.mp4`)))
        .map((v) => v.nombre),
    );
    if (faltan.size === 0) {
      console.log("Nada que hacer: todos los videos de input/ ya están en out/.");
      return;
    }
    const preparados = await prepararTodo({ transcribirSiFalta: true, modelo });
    pendientes = preparados.filter((p) => p.listo && faltan.has(p.nombre));
  } else {
    if (nombres.length === 0) {
      console.log("Uso: npm run render -- <nombre>   (el archivo debe estar en input/)");
      process.exit(1);
    }
    copiarSfx();
    for (const n of nombres) {
      const v = buscarVideo(n);
      const r = await prepararVideo(v.nombre, v.archivo, { transcribirSiFalta: true, modelo });
      pendientes.push({ nombre: v.nombre, id: r.id });
    }
  }

  console.log("\nEmpaquetando proyecto de Remotion…");
  const serveUrl = await bundle({
    entryPoint: path.join(RAIZ, "src", "index.ts"),
    publicDir: DIR.public,
  });

  fs.mkdirSync(DIR.out, { recursive: true });
  const fallidos: string[] = [];
  for (const { nombre, id } of pendientes) {
    const destino = path.join(DIR.out, `${nombre}.mp4`);
    let listo = false;
    // A veces el extractor de fotogramas de Remotion falla de forma puntual: reintentamos
    for (let intento = 1; intento <= 3 && !listo; intento++) {
      try {
        const composition = await selectComposition({ serveUrl, id, inputProps: { id } });
        console.log(`
● Renderizando ${nombre} → out/${nombre}.mp4${intento > 1 ? ` (intento ${intento})` : ""}`);
        await renderMedia({
          composition,
          serveUrl,
          codec: "h264",
          outputLocation: destino,
          inputProps: { id },
          crf: config.render.crf,
          audioCodec: "aac",
          audioBitrate: config.render.audioBitrate,
          imageFormat: "jpeg",
          jpegQuality: 95,
          onProgress: ({ progress }) => process.stdout.write(`
  ${Math.round(progress * 100)}%   `),
        });
        console.log(`
  ✓ ${path.relative(RAIZ, destino)}`);
        listo = true;
      } catch (e) {
        console.error(`
  ⚠ falló el intento ${intento}: ${(e as Error).message.split(String.fromCharCode(10))[0]}`);
        fs.rmSync(destino, { force: true });
      }
    }
    if (!listo) fallidos.push(nombre);
  }
  if (fallidos.length) {
    console.error(`
✗ No se pudieron renderizar: ${fallidos.join(", ")}`);
    process.exit(1);
  }
};

principal().catch((e) => {
  console.error(`\n✗ ${(e as Error).message}`);
  process.exit(1);
});
