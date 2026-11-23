// Carga los datos de cada video dentro del bundle de Remotion.
// Usa require.context: cuando guardas un .txt, Studio se actualiza solo (recarga en caliente).

import { idDesdeNombre } from "./ids";
import type { Aprobados, DatosBase } from "./subtitulos";

const bases = require.context("../../captions", false, /\.base\.json$/);
const textos = require.context("../../subtitulos", false, /\.txt$/);
const aprobados = require.context("../..", false, /^\.\/aprobados\.json$/);

export type VideoCargado = { base: DatosBase; txt: string | null; aprobacion: Aprobados[string] | null };

const nombreDe = (clave: string, extension: string) => clave.replace(/^\.\//, "").slice(0, -extension.length);

export const listarVideos = (): { id: string; nombre: string; base: DatosBase }[] => {
  const usados = new Set<string>();
  return bases
    .keys()
    .filter((k) => k.startsWith("./"))
    .map((k) => {
      const base = bases(k) as DatosBase;
      const nombre = nombreDe(k, ".base.json");
      let id = idDesdeNombre(nombre);
      for (let n = 2; usados.has(id); n++) id = `${idDesdeNombre(nombre)}-${n}`;
      usados.add(id);
      return { id, nombre, base };
    });
};

export const cargarVideo = (nombre: string): VideoCargado | null => {
  const claveBase = `./${nombre}.base.json`;
  if (!bases.keys().includes(claveBase)) return null;
  const claveTxt = `./${nombre}.txt`;
  const txt = textos.keys().includes(claveTxt) ? String(textos(claveTxt)) : null;
  const lista = aprobados.keys().includes("./aprobados.json") ? (aprobados("./aprobados.json") as Aprobados) : {};
  return { base: bases(claveBase) as DatosBase, txt, aprobacion: lista[nombre] ?? null };
};
