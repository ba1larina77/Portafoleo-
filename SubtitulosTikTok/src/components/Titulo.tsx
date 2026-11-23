import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { config } from "../../config";
import type { Palabra } from "../lib/analisis";
import { textoConBorde } from "./estilo";

type Props = { palabras: Palabra[]; inicioHistoria: number | null; escala: number };

export const Titulo: React.FC<Props> = ({ palabras, inicioHistoria, escala }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const c = config.titulo;
  const zonas = config.zonasSeguras;

  if (palabras.length === 0) return null;

  // Salida: fade + escala hacia afuera en cuanto empieza la historia
  const salida =
    inicioHistoria === null
      ? 0
      : interpolate(t, [inicioHistoria, inicioHistoria + c.duracionSalidaS], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.cubic),
        });
  if (salida >= 1) return null;

  const entradaCaja = interpolate(t, [Math.max(0, palabras[0].inicio - 0.15), palabras[0].inicio + 0.1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const margen = zonas.derechaPx;
  const arriba = zonas.superior * height;
  const abajo = height - zonas.inferior * height;

  return (
    <div
      style={{
        position: "absolute",
        left: margen,
        right: margen,
        top: arriba,
        height: abajo - arriba,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: width - 2 * margen,
          padding: `${40 * escala}px ${48 * escala}px`,
          borderRadius: c.radioFondo * escala,
          background: c.fondo,
          opacity: entradaCaja * (1 - salida),
          transform: `scale(${1 + 0.15 * salida})`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 0.32 * c.tamano * escala,
          rowGap: 0.04 * c.tamano * escala,
          textAlign: "center",
        }}
      >
        {palabras.map((p, i) => {
          // Cada palabra entra con fade + slide justo cuando se pronuncia.
          // Todas ocupan su lugar desde el inicio para que la caja no salte.
          const aparicion = interpolate(t, [p.inicio, p.inicio + c.duracionEntradaPalabraS], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          return (
            <span
              key={`${p.inicio}-${i}`}
              style={{
                ...textoConBorde(c.tamano * escala, c.grosorBorde * escala, "0px 8px 20px rgba(0,0,0,0.6)"),
                color: c.color,
                display: "inline-block",
                opacity: aparicion,
                transform: `translateY(${(1 - aparicion) * 36 * escala}px)`,
              }}
            >
              {p.texto}
            </span>
          );
        })}
      </div>
    </div>
  );
};
