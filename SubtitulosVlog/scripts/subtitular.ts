// npm run subtitular -- <nombre>
//   Transcribe input/<nombre>.mp4, aplica correcciones.json, genera subtitulos/<nombre>.txt
//   y abre Remotion Studio para revisar. NUNCA renderiza.
//
// Opciones:
//   --regenerar       vuelve a crear el .txt (el tuyo se guarda como .txt.bak)
//   --retranscribir   vuelve a pasar Whisper (ignora captions/<nombre>.raw.json)
//   --modelo large-v3 usa otro modelo solo esta vez
//   --sin-studio      no abre Remotion Studio

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config";
import { agruparPalabras, generarTxt, type DatosBase } from "../src/lib/subtitulos";
import { aplicarCorrecciones, limpiarCrudas } from "./correcciones";
import {
  ARCHIVO,
  DIR,
  RAIZ,
  analizarVideo,
  buscarVideo,
  enlazar,
  escribirJson,
  extraerWav,
  imprimirProblemas,
  leerGlosario,
  leerJson,
  nombreDesdeArgs,
  revisarTxt,
} from "./herramientas";
import { transcribir, type PalabraCruda } from "./whisper";

const args = process.argv.slice(2);
const opcion = (n: string) => args.includes(`--${n}`);
const iModelo = args.indexOf("--modelo");
const modelo = (iModelo >= 0 ? args[iModelo + 1] : config.whisper.modelo) as typeof config.whisper.modelo;
const entrada = nombreDesdeArgs(args.filter((_, i) => iModelo < 0 || i !== iModelo + 1));

const resumen = (nombre: string) => {
  const { resultado } = revisarTxt(nombre);
  const errores = resultado.problemas.filter((p) => p.tipo === "error").length;
  imprimirProblemas(nombre, resultado);
  console.log(
    errores
      ? `  ✗ ${errores} error(es): corrígelos en el .txt (también se ven en Studio).`
      : `  ✓ ${resultado.lineas.length} subtítulos sin errores.`,
  );
};

const abrirStudio = (id: string, nombre: string) => {
  console.log("\nAbriendo Remotion Studio… (Ctrl+C para cerrar)");
  const studio = spawn("npx", ["remotion", "studio", "--no-open"], {
    cwd: RAIZ,
    stdio: ["inherit", "pipe", "inherit"],
    shell: true,
  });
  let abierto = false;
  studio.stdout.on("data", (d: Buffer) => {
    const texto = d.toString();
    process.stdout.write(texto);
    const url = texto.replace(/\x1b\[[0-9;]*m/g, "").match(/https?:\/\/localhost:\d+/)?.[0];
    if (url && !abierto) {
      abierto = true;
      const destino = `${url}/${id}`;
      console.log(`\n→ Revisa aquí: ${destino}`);
      console.log(`  Edita subtitulos/${nombre}.txt y guarda: la vista previa se actualiza sola.`);
      console.log(`  Cuando esté perfecto: npm run aprobar -- ${nombre}\n`);
      const cmd =
        process.platform === "win32"
          ? spawn("cmd", ["/c", "start", '""', destino], { shell: false, detached: true, stdio: "ignore" })
          : spawn(process.platform === "darwin" ? "open" : "xdg-open", [destino], { detached: true, stdio: "ignore" });
      cmd.unref();
    }
  });
  studio.on("close", (code) => process.exit(code ?? 0));

  // Mientras Studio está abierto, cada vez que guardas el .txt se revisa aquí también
  let espera: NodeJS.Timeout | undefined;
  fs.watch(DIR.subtitulos, (_e, archivo) => {
    if (archivo !== `${nombre}.txt`) return;
    clearTimeout(espera);
    espera = setTimeout(() => {
      try {
        console.log(`\n↻ Guardaste subtitulos/${nombre}.txt`);
        resumen(nombre);
      } catch (e) {
        console.error(`  ✗ ${(e as Error).message}`);
      }
    }, 300);
  });
};

const principal = async () => {
  const { nombre, archivo, id } = buscarVideo(entrada);
  console.log(`▶ ${nombre}`);

  const info = await analizarVideo(archivo);
  console.log(
    `  ${info.ancho}x${info.alto} (${info.alto >= info.ancho ? "vertical" : "horizontal"}), ` +
      `${info.fps} fps, ${info.duracionS.toFixed(1)} s`,
  );
  if (!info.tieneAudio) throw new Error("El video no tiene audio: no hay nada que transcribir.");
  const video = `videos/${id}.mp4`;
  enlazar(archivo, path.join(DIR.public, video));

  // 1. Transcripción cruda (solo si no existe)
  const archivoRaw = ARCHIVO.raw(nombre);
  if (!fs.existsSync(archivoRaw) || opcion("retranscribir")) {
    const glosario = leerGlosario();
    const wav = path.join(DIR.cache, `${id}.wav`);
    console.log("  Extrayendo audio…");
    await extraerWav(archivo, wav);
    console.log(`  Whisper (${modelo})${glosario.length ? ` con ${glosario.length} palabras del glosario` : ""}…`);
    const crudas = await transcribir(wav, glosario, modelo);
    escribirJson(archivoRaw, crudas);
    fs.rmSync(wav, { force: true });
    console.log(`  ✓ captions/${nombre}.raw.json (${crudas.length} palabras)`);
  } else {
    console.log(`  ✓ Uso la transcripción guardada (captions/${nombre}.raw.json)`);
  }

  // 2. Correcciones + .txt editable (sin pisar tus cambios)
  const archivoTxt = ARCHIVO.txt(nombre);
  const archivoBase = ARCHIVO.base(nombre);
  const regenerar = opcion("regenerar") || opcion("retranscribir");
  if (!fs.existsSync(archivoTxt) || !fs.existsSync(archivoBase) || regenerar) {
    const crudas = leerJson<PalabraCruda[]>(archivoRaw, []);
    const { palabras, usos } = aplicarCorrecciones(limpiarCrudas(crudas));
    for (const [c, n] of usos) console.log(`  ✎ corrección ${c} (${n}×)`);

    const base: DatosBase = {
      nombre,
      id,
      video,
      ancho: info.ancho,
      alto: info.alto,
      fps: info.fps,
      duracionFrames: info.duracionFrames,
      duracionS: info.duracionS,
      palabras: palabras.map(({ texto, inicio, fin }) => ({ texto, inicio, fin })),
    };

    if (fs.existsSync(archivoTxt) && !regenerar) {
      // Hay .txt tuyo pero faltaba el base: solo recreamos el base
      escribirJson(archivoBase, base);
      console.log(`  ✓ Conservo tu subtitulos/${nombre}.txt`);
    } else {
      if (fs.existsSync(archivoTxt)) {
        fs.copyFileSync(archivoTxt, `${archivoTxt}.bak`);
        console.log(`  (tu versión anterior quedó en subtitulos/${nombre}.txt.bak)`);
      }
      escribirJson(archivoBase, base);
      fs.mkdirSync(DIR.subtitulos, { recursive: true });
      fs.writeFileSync(archivoTxt, generarTxt(nombre, agruparPalabras(palabras, config.grupos)));
      console.log(`  ✓ subtitulos/${nombre}.txt generado`);
    }
  } else {
    console.log(`  ✓ Conservo tu subtitulos/${nombre}.txt (usa --regenerar para crearlo de nuevo)`);
  }

  resumen(nombre);
  if (!opcion("sin-studio")) abrirStudio(id, nombre);
};

principal().catch((e) => {
  console.error(`\n✗ ${(e as Error).message}`);
  process.exit(1);
});
