import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export type Caption = {
  text: string;
  fromFrame: number;
  toFrame: number;
};

// TODO: Llenar con la transcripción real del audio de Valentino y sus
// tiempos (en frames, a 30fps). No pude transcribir el audio yo mismo
// porque no tengo una herramienta de reconocimiento de voz disponible.
// Ejemplo de formato:
// { text: "así se ve un día bonito", fromFrame: 140, toFrame: 200 }
export const CAPTIONS: Caption[] = [];

/**
 * Subtítulos estilo TikTok: una frase corta centrada abajo, con
 * fundido de entrada/salida por cada bloque de `CAPTIONS`.
 */
export const Captions: React.FC<{ captions?: Caption[] }> = ({
  captions = CAPTIONS,
}) => {
  const frame = useCurrentFrame();

  const active = captions.find(
    (c) => frame >= c.fromFrame && frame <= c.toFrame
  );

  if (!active) return null;

  const opacity = interpolate(
    frame,
    [active.fromFrame, active.fromFrame + 6, active.toFrame - 6, active.toFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 130,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <span
        style={{
          maxWidth: 900,
          textAlign: "center",
          padding: "10px 22px",
          borderRadius: 12,
          background: "rgba(0,0,0,0.55)",
          color: "white",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 34,
          fontWeight: 700,
          textShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        {active.text}
      </span>
    </div>
  );
};
