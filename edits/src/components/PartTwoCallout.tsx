import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", { weights: ["800"] });

const VIDEO_LEFT = 656;
const VIDEO_RIGHT = 1264;

/**
 * Texto amarillo "¿Parte 2?" que aparece con un rebote sobre el video,
 * pensado para el cierre (mientras se dice esa misma frase).
 */
export const PartTwoCallout: React.FC<{
  fromFrame: number;
  toFrame: number;
}> = ({ fromFrame, toFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < fromFrame || frame > toFrame) return null;

  const progress = spring({
    frame: frame - fromFrame,
    fps,
    config: { damping: 10, stiffness: 120 },
  });
  const scale = interpolate(progress, [0, 1], [0.5, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: 380,
        left: VIDEO_LEFT,
        width: VIDEO_RIGHT - VIDEO_LEFT,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          transform: `scale(${scale})`,
          color: "#ffd400",
          textAlign: "center",
          fontFamily,
          fontWeight: 800,
          fontSize: 72,
          WebkitTextStroke: "4px rgba(0,0,0,0.85)",
          paintOrder: "stroke fill",
          textShadow: "0 6px 18px rgba(0,0,0,0.55)",
        }}
      >
        ¿Parte 2?
      </span>
    </div>
  );
};
