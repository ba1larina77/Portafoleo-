// npm run aprobar -- <nombre>
//   Marca el video como aprobado (guarda un hash del .txt en aprobados.json)
//   y te PROPONE correcciones y palabras de glosario a partir de lo que corregiste.
//   No agrega nada sin que tú lo elijas.

import fs from "node:fs";
import { huellaTxt, normalizar } from "../src/lib/subtitulos";
import { compararCambios, leerCorrecciones } from "./correcciones";
import {
  ARCHIVO,
  buscarVideo,
  nombreDesdeArgs,
  escribirJson,
  imprimirProblemas,
  leerAprobados,
  leerGlosario,
  leerJson,
  preguntar,
  revisarTxt,
} from "./herramientas";

const elegir = async <T>(titulo: string, opciones: T[], mostrar: (o: T) => string): Promise<T[]> => {
  if (!opciones.length) return [];
  console.log(`\n${titulo}`);
  opciones.forEach((o, i) => console.log(`  ${String(i + 1).padStart(2)}. ${mostrar(o)}`));
  const r = await preguntar("  ¿Cuáles agrego? (números separados por coma, 'todas', o Enter para ninguna): ");
  if (r === null) {
    console.log("  (terminal no interactiva: no agrego nada; puedes copiarlas a mano)");
    return [];
  }
  if (!r) return [];
  if (/^tod[ao]s?$/i.test(r)) return opciones;
  const numeros = r.split(/[\s,;]+/).map(Number).filter((n) => n >= 1 && n <= opciones.length);
  return [...new Set(numeros)].map((n) => opciones[n - 1]);
};

const principal = async () => {
  const { nombre } = buscarVideo(nombreDesdeArgs(process.argv.slice(2)));
  const { txt, base, resultado } = revisarTxt(nombre);
  const errores = resultado.problemas.filter((p) => p.tipo === "error");

  imprimirProblemas(nombre, resultado);
  if (errores.length) {
    console.error(`\n✗ No se puede aprobar: subtitulos/${nombre}.txt tiene ${errores.length} error(es). Corrígelos y vuelve a intentarlo.`);
    process.exit(1);
  }
  if (!resultado.lineas.length) {
    console.error(`\n✗ No se puede aprobar: subtitulos/${nombre}.txt no tiene ningún subtítulo.`);
    process.exit(1);
  }

  const cambios = compararCambios(base.palabras, resultado.lineas);
  const aprobados = leerAprobados();
  aprobados[nombre] = { hash: huellaTxt(txt), fecha: new Date().toISOString(), cambios };
  escribirJson(ARCHIVO.aprobados, aprobados);
  console.log(`\n✓ "${nombre}" aprobado (${resultado.lineas.length} subtítulos, ${cambios.length} correcciones tuyas).`);
  console.log(`  Si vuelves a editar el .txt tendrás que aprobarlo de nuevo.`);
  console.log(`  Para renderizar: npm run render -- ${nombre}`);

  // ---- Aprendizaje: lo que corregiste en este y en otros videos aprobados ----
  const existentes = new Set(Object.keys(leerCorrecciones()).map(normalizar));
  const conteo = new Map<string, { antes: string; despues: string; veces: number; videos: Set<string> }>();
  for (const [video, a] of Object.entries(aprobados)) {
    for (const c of a.cambios ?? []) {
      if (existentes.has(c.antes)) continue;
      const clave = `${c.antes}→${c.despues}`;
      const e = conteo.get(clave) ?? { ...c, veces: 0, videos: new Set<string>() };
      e.veces++;
      e.videos.add(video);
      conteo.set(clave, e);
    }
  }
  // Solo lo que aparece en este video, ordenado por cuántas veces se repite en total
  const propuestas = [...conteo.values()]
    .filter((c) => cambios.some((x) => x.antes === c.antes && x.despues === c.despues))
    .sort((a, b) => b.veces - a.veces);

  if (!propuestas.length) {
    console.log("\nNo hay correcciones nuevas para sugerir.");
    return;
  }

  const nuevasCorrecciones = await elegir(
    "Correcciones sugeridas para correcciones.json (Whisper escribió → tú pusiste):",
    propuestas,
    (c) =>
      `"${c.antes}" → "${c.despues}"   ${c.veces > 1 ? `★ se repite ${c.veces} veces` : "1 vez"}` +
      (c.videos.size > 1 ? ` en ${c.videos.size} videos` : ""),
  );
  if (nuevasCorrecciones.length) {
    const datos = leerJson<Record<string, unknown>>(ARCHIVO.correcciones, {});
    for (const c of nuevasCorrecciones) datos[c.antes] = c.despues;
    escribirJson(ARCHIVO.correcciones, datos);
    console.log(`  ✓ ${nuevasCorrecciones.length} agregada(s) a correcciones.json`);
  }

  // Para el glosario sirven palabras mal reconocidas (nombres, lugares…), no simples tildes
  const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ñ/g, "n");
  const enGlosario = new Set(leerGlosario().map(normalizar));
  const candidatas = [
    ...new Set(
      propuestas.flatMap((c) => {
        const antes = new Set(c.antes.split(" ").map(sinTildes));
        return c.despues.split(" ").filter((p) => p.length >= 3 && !enGlosario.has(p) && !antes.has(sinTildes(p)));
      }),
    ),
  ];
  const nuevasGlosario = await elegir(
    "Palabras sugeridas para glosario.txt (ayudan a Whisper a escribirlas bien la próxima vez):",
    candidatas,
    (p) => p,
  );
  if (nuevasGlosario.length) {
    const actual = fs.existsSync(ARCHIVO.glosario) ? fs.readFileSync(ARCHIVO.glosario, "utf8") : "";
    const bonitas = nuevasGlosario.map((p) => p.charAt(0).toLocaleUpperCase("es") + p.slice(1));
    fs.writeFileSync(ARCHIVO.glosario, `${actual.replace(/\s*$/, "\n")}${bonitas.join("\n")}\n`);
    console.log(`  ✓ ${nuevasGlosario.length} agregada(s) a glosario.txt (revisa mayúsculas si hace falta)`);
  }
};

principal().catch((e) => {
  console.error(`\n✗ ${(e as Error).message}`);
  process.exit(1);
});
