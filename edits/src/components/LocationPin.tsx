import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

type Props = {
  // Frame en el que empieza a entrar / a salir, relativo a la composición.
  inAt: number;
  outAt: number;
  label?: string;
};

/**
 * Etiqueta de ubicación estilo Reels/TikTok: "📍 Pereira, Colombia"
 * entra deslizándose desde la izquierda y se desvanece al salir.
 */
export const LocationPin: React.FC<Props> = ({
  inAt,
  outAt,
  label = "Pereira, Colombia",
}) => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [inAt, inAt + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(frame, [outAt, outAt + 15], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const progress = Math.min(enter, exit);

  const translateX = interpolate(progress, [0, 1], [-30, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        bottom: 40,
        opacity: progress,
        transform: `translateX(${translateX}px)`,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        borderRadius: 999,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
        color: "white",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 24,
        fontWeight: 700,
        textShadow: "0 2px 8px rgba(0,0,0,0.4)",
      }}
    >
      <span>📍</span>
      <span>{label}</span>
    </div>
  );
};
