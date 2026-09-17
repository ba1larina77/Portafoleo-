import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

type Props = {
  inAt: number;
  outAt: number;
};

// Trazo de una ruta estilizada (no es GPS real — es un adorno visual,
// no datos de ubicación reales del recorrido).
const ROUTE_PATH =
  "M 10 90 C 40 70, 30 40, 60 35 S 100 10, 130 20 S 170 45, 190 15";
// Longitud aproximada del path de arriba, usada para animar el trazo.
const PATH_LENGTH = 260;

/**
 * Tarjeta con un mini-mapa estilizado y una línea de ruta que se va
 * dibujando. Es decorativo: no representa el recorrido GPS real.
 */
export const RouteMap: React.FC<Props> = ({ inAt, outAt }) => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [inAt, inAt + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(frame, [outAt, outAt + 20], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const visibility = Math.min(enter, exit);

  // La línea se dibuja durante los primeros ~90 frames después de entrar.
  const drawProgress = interpolate(frame, [inAt + 10, inAt + 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashOffset = PATH_LENGTH * (1 - drawProgress);

  return (
    <div
      style={{
        position: "absolute",
        right: 40,
        bottom: 40,
        opacity: visibility,
        transform: `scale(${interpolate(visibility, [0, 1], [0.9, 1])})`,
        width: 220,
        padding: 16,
        borderRadius: 16,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
        color: "white",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <svg viewBox="0 0 200 110" width="100%" height="70">
        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="#feb47b"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={PATH_LENGTH}
          strokeDashoffset={dashOffset}
        />
        {drawProgress > 0.98 && (
          <circle cx={190} cy={15} r={5} fill="#ff7e5f" />
        )}
      </svg>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
        Pereira 🏍️
      </div>
    </div>
  );
};
