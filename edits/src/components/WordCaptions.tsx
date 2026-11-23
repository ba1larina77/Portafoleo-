import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

// Montserrat ExtraBold: la alternativa gratuita (Google Fonts) más cercana
// a "Proxima Nova", que es la fuente que usa TikTok en sus subtítulos
// automáticos ("Classic"). Proxima Nova es de pago, por eso este sustituto.
const { fontFamily } = loadFont("normal", { weights: ["800"] });

export type CaptionWord = {
  word: string;
  fromFrame: number;
  toFrame: number;
};

export type WordCaption = {
  text: string;
  fromFrame: number;
  toFrame: number;
  // Color de la palabra mientras se dice, según quién habla.
  color: "blue" | "pink";
  words: CaptionWord[];
};

const HIGHLIGHT_COLORS: Record<WordCaption["color"], string> = {
  blue: "#4da3ff",
  pink: "#ff6fb0",
};

/**
 * Subtítulos estilo "una palabra a la vez": no hay caja de fondo, cada
 * palabra aparece sola, centrada, en el color de quien habla, con un
 * pequeño rebote de entrada. Fuera del rango de una palabra no se
 * muestra nada (silencios = pantalla limpia).
 */
export const WordCaptions: React.FC<{
  captions: WordCaption[];
  // Distancia en px desde abajo del lienzo hasta el subtítulo. Por defecto
  // sirve para un video que llena todo el cuadro; si el video queda
  // encajonado (p.ej. versión vertical con relleno borroso), hay que pasar
  // un valor mayor para que el texto quede dentro del video visible.
  bottomOffset?: number;
}> = ({ captions, bottomOffset = 140 }) => {
  const frame = useCurrentFrame();

  const activeCaption = captions.find(
    (c) => frame >= c.fromFrame && frame <= c.toFrame
  );
  if (!activeCaption) return null;

  const activeWord = activeCaption.words.find(
    (w) => frame >= w.fromFrame && frame <= w.toFrame
  );
  if (!activeWord) return null;

  // Pequeño "pop" de entrada al empezar cada palabra.
  const age = frame - activeWord.fromFrame;
  const scale = interpolate(age, [0, 4], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const color = HIGHLIGHT_COLORS[activeCaption.color];

  // Al mostrarse de a una palabra, las comas ya no cumplen ninguna función.
  const displayWord = activeWord.word.replace(/,/g, "");

  return (
    <div
      style={{
        position: "absolute",
        bottom: bottomOffset,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          transform: `scale(${scale})`,
          color,
          fontFamily,
          fontSize: 84,
          fontWeight: 800,
          WebkitTextStroke: "4px rgba(0,0,0,0.85)",
          paintOrder: "stroke fill",
          textShadow: "0 6px 18px rgba(0,0,0,0.55)",
        }}
      >
        {displayWord}
      </span>
    </div>
  );
};
