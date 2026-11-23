import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { WordCaptions } from "./components/WordCaptions";
import { TitleCaption } from "./components/TitleCaption";
import { PartTwoCallout } from "./components/PartTwoCallout";
import { COLEGIO1_CAPTIONS, COLEGIO1_TITLE } from "./colegio1Captions";

// Frames en los que se dice la frase del título ("Me acusaron, pero
// tengo pruebas.") y la pregunta final ("¿Quieren la parte 2?").
const TITLE_FROM = 0;
const TITLE_TO = 56;
const PART_TWO_FROM = 1976;
const PART_TWO_TO = 2008;

export const Colegio1Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        src={staticFile("colegio1.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <TitleCaption
        text={COLEGIO1_TITLE}
        fromFrame={TITLE_FROM}
        toFrame={TITLE_TO}
      />
      <WordCaptions captions={COLEGIO1_CAPTIONS} />
      <PartTwoCallout fromFrame={PART_TWO_FROM} toFrame={PART_TWO_TO} />
    </AbsoluteFill>
  );
};
