import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { WordCaptions } from "./components/WordCaptions";
import { AYUDA_CAPTIONS } from "./ayudaCaptions";

export const AyudaVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        src={staticFile("ayuda-clean.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <WordCaptions captions={AYUDA_CAPTIONS} />
    </AbsoluteFill>
  );
};
