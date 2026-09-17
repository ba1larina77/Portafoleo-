import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * Grano de película sutil usando ruido SVG (feTurbulence).
 * La "seed" cambia cada frame para que el grano parpadee como
 * en cámara real, en vez de verse como una textura fija.
 */
export const FilmGrain: React.FC<{ opacity?: number }> = ({
  opacity = 0.05,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%" style={{ opacity }}>
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed={frame % 30}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
