import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

type Props = {
  inAt: number;
  outAt: number;
};

/**
 * HUD decorativo estilo velocímetro digital. IMPORTANTE: el número
 * es un adorno visual (una ligera oscilación tipo "en vivo"), no viene
 * de datos reales de velocidad/GPS del video — no tenemos esa telemetría
 * extraída del clip.
 */
export const SpeedHud: React.FC<Props> = ({ inAt, outAt }) => {
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

  // Oscilación decorativa alrededor de 45 km/h.
  const speed = Math.round(45 + Math.sin(frame / 14) * 8);

  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        top: 40,
        opacity: visibility,
        display: "flex",
        alignItems: "baseline",
        gap: 6,
        padding: "10px 16px",
        borderRadius: 12,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
        color: "#9fffb0",
        fontFamily: "'Courier New', monospace",
      }}
    >
      <span style={{ fontSize: 34, fontWeight: 700 }}>{speed}</span>
      <span style={{ fontSize: 14, opacity: 0.8 }}>km/h</span>
    </div>
  );
};
