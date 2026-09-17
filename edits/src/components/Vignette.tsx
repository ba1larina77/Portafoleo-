import React from "react";
import { AbsoluteFill } from "remotion";

type Props = {
  // 0 = sin viñeta, 1 = bordes casi negros. Se puede animar por frame.
  intensity: number;
};

/**
 * Oscurece los bordes del cuadro para dar look más cinematográfico
 * y ayudar a que el texto/overlays se lean sobre el video.
 */
export const Vignette: React.FC<Props> = ({ intensity }) => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,${intensity}) 100%)`,
      }}
    />
  );
};
