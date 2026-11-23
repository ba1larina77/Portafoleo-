import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", { weights: ["800"] });

// El video fuente trae franjas negras a los lados (contenido vertical
// dentro de un lienzo 1920x1080); el contenido real va de x=656 a x=1264.
const VIDEO_LEFT = 656;
const VIDEO_RIGHT = 1264;

/**
 * Título (el gancho del video) arriba de la pantalla, en blanco, con la
 * misma fuente estilo TikTok que los subtítulos. Solo se muestra mientras
 * se está diciendo esa frase, y queda contenido dentro del ancho real del
 * video (no se extiende sobre las franjas negras de los lados).
 */
export const TitleCaption: React.FC<{
  text: string;
  fromFrame: number;
  toFrame: number;
}> = ({ text, fromFrame, toFrame }) => {
  const frame = useCurrentFrame();
  if (frame < fromFrame || frame > toFrame) return null;

  const opacity = interpolate(frame, [fromFrame, fromFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(
    frame,
    [fromFrame, fromFrame + 15],
    [-20, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        left: VIDEO_LEFT + 20,
        width: VIDEO_RIGHT - VIDEO_LEFT - 40,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          color: "white",
          textAlign: "center",
          fontFamily,
          fontWeight: 800,
          fontSize: 34,
          lineHeight: 1.25,
          WebkitTextStroke: "2px rgba(0,0,0,0.85)",
          paintOrder: "stroke fill",
          textShadow: "0 3px 10px rgba(0,0,0,0.55)",
        }}
      >
        {text}
      </span>
    </div>
  );
};
