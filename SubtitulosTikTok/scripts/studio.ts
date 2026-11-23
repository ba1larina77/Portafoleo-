// npm run studio → prepara los videos de input/ y abre Remotion Studio.
// Mientras está abierto, vigila overrides/ y captions/ para reflejar tus correcciones.

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { DIR, RAIZ, listarVideos } from "./herramientas";
import { prepararTodo, prepararVideo } from "./preparar";

const principal = async () => {
  await prepararTodo({ transcribirSiFalta: true });

  const studio = spawn("npx", ["remotion", "studio"], { cwd: RAIZ, stdio: "inherit", shell: true });
  studio.on("close", (code) => process.exit(code ?? 0));

  const pendientes = new Map<string, NodeJS.Timeout>();
  for (const dir of [DIR.overrides, DIR.captions]) {
    fs.mkdirSync(dir, { recursive: true });
    fs.watch(dir, (_evento, archivo) => {
      if (!archivo || !archivo.endsWith(".json")) return;
      const nombre = path.basename(archivo, ".json");
      clearTimeout(pendientes.get(nombre));
      pendientes.set(
        nombre,
        setTimeout(() => {
          const video = listarVideos().find((v) => v.nombre === nombre);
          if (!video) return;
          prepararVideo(nombre, video.archivo)
            .then(() => console.log(`↻ ${nombre} actualizado (recarga Studio si no se ve el cambio)`))
            .catch((e) => console.error(`✗ ${nombre}: ${(e as Error).message}`));
        }, 400),
      );
    });
  }
};

principal().catch((e) => {
  console.error(e);
  process.exit(1);
});
