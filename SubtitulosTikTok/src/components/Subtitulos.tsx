import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { config } from "../../config";
import type { Grupo } from "../lib/analisis";
import { textoConBorde } from "./estilo";

type Props = { grupos: Grupo[]; inicioSubtitulos: number; escala: number };

export const Subtitulos: React.FC<Props> = ({ grupos, inicioSubtitulos, escala }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const s = config.subtitulos;
  const zonas = config.zonasSeguras;

  const grupo = grupos.find((g) => t >= Math.max(g.inicio, inicioSubtitulos) && t < g.fin);
  if (!grupo) return null;

  // Pop de entrada con spring: desde → pico → 1
  const frameEntrada = Math.round(Math.max(grupo.inicio, inicioSubtitulos) * fps);
  const resorte = spring({
    frame: frame - frameEntrada,
    fps,
    config: { damping: s.pop.damping, stiffness: s.pop.stiffness, mass: s.pop.mass },
  });
  const escalaPop = interpolate(resorte, [0, 1, 1.25], [s.pop.desde, 1, s.pop.pico], {
    extrapolateRight: "clamp",
  });

  // Palabra activa = la última que ya empezó a decirse
  let activa = -1;
  grupo.palabras.forEach((p, i) => {
    if (t >= p.inicio) activa = i;
  });

  // Caja centrada en `posicionVertical`, sin salirse de las zonas seguras
  const arriba = zonas.superior * height;
  const abajo = height - zonas.inferior * height;
  const centro = Math.min(Math.max(s.posicionVertical * height, arriba), abajo);
  const mitad = Math.min(centro - arriba, abajo - centro);
  const margenLateral = zonas.derechaPx; // igual a ambos lados para que quede centrado

  const colores = config.voces.colores[grupo.voz];
  const clave = config.extras.palabrasClave;

  return (
    <div
      style={{
        position: "absolute",
        left: margenLateral,
        right: margenLateral,
        top: centro - mitad,
        height: mitad * 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          columnGap: 0.34 * s.tamano * escala,
          rowGap: 0.05 * s.tamano * escala,
          maxWidth: width - 2 * margenLateral,
          transform: `scale(${escalaPop})`,
          textAlign: "center",
        }}
      >
        {grupo.palabras.map((p, i) => {
          const esActiva = i === activa;
          const color = p.clave ? clave.color : esActiva ? colores.activa : colores.base;
          // Las palabras clave son más grandes de verdad (ocupan su espacio).
          const tamano = s.tamano * escala * (p.clave ? clave.escala : 1);
          // La activa crece con transform; le reservamos siempre ese espacio extra
          // a cada palabra para que el grupo no "salte" cuando cambia la activa.
          const anchoEstimado = p.texto.length * tamano * 0.78;
          const margen = ((s.escalaPalabraActiva - 1) * anchoEstimado) / 2;
          return (
            <span
              key={`${p.inicio}-${i}`}
              style={{
                ...textoConBorde(tamano, s.grosorBorde * escala, s.sombra),
                color,
                display: "inline-block",
                transform: `scale(${esActiva ? s.escalaPalabraActiva : 1})`,
                transformOrigin: "center",
                margin: `0 ${margen}px`,
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
