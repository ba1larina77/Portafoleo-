import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { WordCaptions } from "./components/WordCaptions";
import { AYUDA_CAPTIONS } from "./ayudaCaptions";

const SRC = staticFile("ayuda-clean.mp4");

/**
 * Versión vertical con barras negras arriba/abajo (sin blur de fondo).
 * Conserva el encuadre completo del video, más simple y rápida de
 * renderizar que la variante con fondo borroso.
 */
export const AyudaVerticalBlur: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <OffthreadVideo src={SRC} style={{ width: "100%", height: "auto" }} />
      </AbsoluteFill>
      {/* El video visible ocupa solo la franja central (656px-1264px de
          1920 de alto); bottomOffset se ajusta para que el subtítulo caiga
          dentro de esa franja, no en la barra negra de abajo. */}
      <WordCaptions captions={AYUDA_CAPTIONS} bottomOffset={730} />
    </AbsoluteFill>
  );
};

/**
 * Versión vertical recortando el video al centro (zoom), llenando
 * todo el cuadro pero cortando lo que quede a los lados.
 */
export const AyudaVerticalCrop: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        src={SRC}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <WordCaptions captions={AYUDA_CAPTIONS} />
    </AbsoluteFill>
  );
};
