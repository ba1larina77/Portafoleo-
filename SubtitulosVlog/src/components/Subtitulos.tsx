import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { config } from "../../config";
import type { Linea } from "../lib/subtitulos";
import { textoConBorde } from "./estilo";

export const Subtitulos: React.FC<{ lineas: Linea[] }> = ({ lineas }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const e = config.estilo;
  const a = config.animacion;

  // Línea visible: la que empezó y no terminó (con un poco de permanencia, sin pisar a la siguiente)
  const i = lineas.findIndex((l, k) => {
    const siguiente = lineas[k + 1];
    const fin = Math.min(l.fin + e.permanenciaMs / 1000, siguiente ? siguiente.inicio : Infinity);
    return t >= l.inicio && t < Math.max(fin, l.fin);
  });
  if (i < 0) return null;
  const linea = lineas[i];

  const vertical = height >= width;
  const escala = Math.min(width, height) / 1080;
  const tamano = e.tamano * escala;

  const resorte = spring({
    frame: frame - Math.round(linea.inicio * fps),
    fps,
    config: { damping: a.damping, stiffness: a.stiffness, mass: a.mass },
  });
  const pop = a.activa ? interpolate(resorte, [0, 1], [a.desde, 1]) : 1;

  // Palabra que se está diciendo = la última que ya empezó
  let activa = -1;
  linea.palabras.forEach((p, k) => {
    if (t >= p.inicio) activa = k;
  });

  // Caja donde va el texto
  let caja: React.CSSProperties;
  if (vertical) {
    const limiteInferior = height * (1 - config.zonasSeguras.inferior);
    const centro = Math.min(config.posicion.vertical * height, limiteInferior - tamano * 0.6);
    const mitad = limiteInferior - centro;
    const margen = config.zonasSeguras.derechaPx * (width / 1080); // igual a ambos lados → centrado
    caja = { left: margen, right: margen, top: centro - mitad, height: mitad * 2, alignItems: "center" };
  } else {
    caja = {
      left: width * 0.08,
      right: width * 0.08,
      bottom: height * config.posicion.horizontalMargenInferior,
      height: height * 0.35,
      alignItems: "flex-end",
    };
  }

  return (
    <div style={{ position: "absolute", display: "flex", justifyContent: "center", pointerEvents: "none", ...caja }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          columnGap: 0.3 * tamano,
          rowGap: 0.04 * tamano,
          transform: `scale(${pop})`,
          textAlign: "center",
        }}
      >
        {linea.palabras.map((p, k) => {
          const esActiva = e.resaltarPalabraActiva && k === activa;
          return (
            <span
              key={`${linea.numero}-${k}`}
              style={{
                ...textoConBorde(tamano, e.grosorBorde * escala),
                color: esActiva ? e.colorPalabraActiva : e.colorTexto,
                display: "inline-block",
                transform: esActiva && e.escalaPalabraActiva !== 1 ? `scale(${e.escalaPalabraActiva})` : undefined,
              }}
            >
              {e.mayusculas ? p.texto.toLocaleUpperCase("es") : p.texto.toLocaleLowerCase("es")}
            </span>
          );
        })}
      </div>
    </div>
  );
};
