// correcciones.json: aplicarlas a la transcripción y aprender nuevas al aprobar.

import {
  normalizar,
  repartirProporcional,
  separarPalabras,
  type Linea,
  type Palabra,
  type PalabraCorte,
} from "../src/lib/subtitulos";
import { ARCHIVO, leerJson } from "./herramientas";
import type { PalabraCruda } from "./whisper";

type Correccion = { de: string[]; a: string[] };

export const leerCorrecciones = (): Record<string, string> => {
  const datos = leerJson<Record<string, unknown>>(ARCHIVO.correcciones, {});
  const limpio: Record<string, string> = {};
  for (const [de, a] of Object.entries(datos)) {
    if (de.startsWith("_")) continue;
    if (typeof a !== "string") throw new Error(`correcciones.json: el valor de "${de}" debe ser un texto entre comillas`);
    limpio[de] = a;
  }
  return limpio;
};

const prepararCorrecciones = (): Correccion[] =>
  Object.entries(leerCorrecciones())
    .map(([de, a]) => ({ de: normalizar(de).split(" ").filter(Boolean), a: separarPalabras(a) }))
    .filter((c) => c.de.length > 0)
    .sort((x, y) => y.de.length - x.de.length); // primero las frases más largas

/** Palabras crudas de Whisper → palabras limpias (MAYÚSCULAS, sin signos), recordando dónde había puntuación. */
export const limpiarCrudas = (crudas: PalabraCruda[]): PalabraCorte[] =>
  crudas.flatMap((c) => {
    const textos = separarPalabras(c.texto);
    if (!textos.length) return [];
    const palabras: PalabraCorte[] = repartirProporcional(textos, c.inicioMs / 1000, c.finMs / 1000);
    palabras[palabras.length - 1].corte = /[.,;:?!…]["'»”)]*$/.test(c.texto.trim());
    return palabras;
  });

/** Aplica correcciones.json. Devuelve también cuántas veces se usó cada una. */
export const aplicarCorrecciones = (palabras: PalabraCorte[]) => {
  const lista = prepararCorrecciones();
  const usos = new Map<string, number>();
  const salida: PalabraCorte[] = [];
  let i = 0;
  while (i < palabras.length) {
    const c = lista.find((c) => c.de.every((d, k) => palabras[i + k] && normalizar(palabras[i + k].texto) === d));
    if (!c) {
      salida.push(palabras[i]);
      i++;
      continue;
    }
    const tramo = palabras.slice(i, i + c.de.length);
    const nuevas: PalabraCorte[] = c.a.length
      ? repartirProporcional(c.a, tramo[0].inicio, tramo[tramo.length - 1].fin)
      : [];
    if (nuevas.length) nuevas[nuevas.length - 1].corte = tramo[tramo.length - 1].corte;
    salida.push(...nuevas);
    const clave = `${c.de.join(" ")} → ${c.a.join(" ").toLowerCase() || "(borrar)"}`;
    usos.set(clave, (usos.get(clave) ?? 0) + 1);
    i += c.de.length;
  }
  return { palabras: salida, usos };
};

/**
 * Compara lo que había en el .txt generado (base) con tu versión final
 * y devuelve las palabras que cambiaste: { antes: "haber", despues: "a ver" }.
 */
export const compararCambios = (base: Palabra[], lineas: Linea[]): { antes: string; despues: string }[] => {
  const bloques = new Map<number, Linea[]>();
  for (const l of lineas) bloques.set(l.bloque, [...(bloques.get(l.bloque) ?? []), l]);

  const cambios: { antes: string; despues: string }[] = [];
  for (const grupo of bloques.values()) {
    const inicio = Math.min(...grupo.map((l) => l.inicio));
    const fin = Math.max(...grupo.map((l) => l.fin));
    const a = base
      .filter((p) => {
        const medio = (p.inicio + p.fin) / 2;
        return medio >= inicio - 0.02 && medio <= fin + 0.02;
      })
      .map((p) => normalizar(p.texto));
    const b = grupo.flatMap((l) => l.palabras.map((p) => normalizar(p.texto)));

    // Subsecuencia común más larga para encontrar qué partes cambiaron
    const n = a.length;
    const m = b.length;
    const t = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--)
      for (let j = m - 1; j >= 0; j--) t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);

    let i = 0;
    let j = 0;
    let antes: string[] = [];
    let despues: string[] = [];
    const cerrar = () => {
      if (antes.length && despues.length) cambios.push({ antes: antes.join(" "), despues: despues.join(" ") });
      antes = [];
      despues = [];
    };
    while (i < n || j < m) {
      if (i < n && j < m && a[i] === b[j]) {
        cerrar();
        i++;
        j++;
      } else if (j < m && (i >= n || t[i][j + 1] >= t[i + 1][j])) {
        despues.push(b[j++]);
      } else {
        antes.push(a[i++]);
      }
    }
    cerrar();
  }
  return cambios;
};
