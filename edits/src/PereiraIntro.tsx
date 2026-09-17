import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Vignette } from "./components/Vignette";
import { FilmGrain } from "./components/FilmGrain";
import { LocationPin } from "./components/LocationPin";
import { RouteMap } from "./components/RouteMap";
import { SpeedHud } from "./components/SpeedHud";
import { Captions } from "./components/Captions";
import { Outro } from "./components/Outro";

const TEXT = "Algunos días bonitos en moto en Pereira";

// Nombre del archivo de video dentro de la carpeta `public/`.
const BACKGROUND_VIDEO = "atardeceres-editado.mp4";

// Pista de voz/audio viral que suena por encima del video.
const VOICE_AUDIO = "valentino-audio.mp3";

// TODO: ajustar una vez sepamos qué segundo exacto del audio original
// (dura 3:52) es el que se quiere usar. Por ahora toma desde el inicio.
const AUDIO_START_SECONDS = 0;

// --- Cronología (en frames, a 30fps) ---------------------------------
const FADE_IN_END = 15; // fundido de entrada desde negro
const TITLE_END = 100; // hasta aquí el texto de apertura está completo
const TRANSITION_END = 140; // aquí termina el "punch in" hacia el video
const PIN_IN = 150;
const PIN_OUT = 270;
const HUD_IN = 140;
const MAP_IN = 300;
const MAP_OUT = 520;

export const PereiraIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const words = TEXT.split(" ");

  const outroIn = durationInFrames - 70;
  const hudOut = outroIn - 10;

  // Fundido de entrada desde negro.
  const openingFade = interpolate(frame, [0, FADE_IN_END], [0, 1], {
    extrapolateRight: "clamp",
  });

  // El texto de apertura se desvanece al terminar el título.
  const titleOpacity = interpolate(
    frame,
    [TITLE_END - 20, TITLE_END],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Capa oscura sobre el video mientras dura el texto de apertura;
  // baja a un nivel sutil una vez termina la transición.
  const overlayDarkness = interpolate(
    frame,
    [0, TITLE_END, TRANSITION_END],
    [0.55, 0.55, 0.15],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // "Punch in": el video entra con zoom + blur y se asienta.
  const videoScale = interpolate(frame, [0, TRANSITION_END], [1.12, 1], {
    extrapolateRight: "clamp",
  });
  const videoBlur = interpolate(frame, [0, TRANSITION_END], [10, 0], {
    extrapolateRight: "clamp",
  });

  // Viñeta: un poco más marcada durante el título, sutil durante el resto.
  const vignetteIntensity = interpolate(
    frame,
    [0, TRANSITION_END],
    [0.65, 0.4],
    { extrapolateRight: "clamp" }
  );

  let letterIndex = 0;

  return (
    <AbsoluteFill style={{ opacity: openingFade, backgroundColor: "black" }}>
      {/* Audio: la voz viral, mezclada por encima del sonido ambiente del video */}
      <Audio
        src={staticFile(VOICE_AUDIO)}
        startFrom={Math.round(AUDIO_START_SECONDS * fps)}
      />

      {/* Video de fondo, con grado de color cálido/cinematográfico */}
      <OffthreadVideo
        src={staticFile(BACKGROUND_VIDEO)}
        volume={0.25}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${videoScale})`,
          filter: `contrast(1.1) saturate(1.2) brightness(1.02) sepia(0.06) blur(${videoBlur}px)`,
        }}
      />

      <Vignette intensity={vignetteIntensity} />
      <FilmGrain />

      {/* Capa oscura para el texto de apertura */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,${overlayDarkness}) 0%, rgba(0,0,0,${
            overlayDarkness + 0.15
          }) 100%)`,
        }}
      />

      {/* Texto de apertura centrado */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            opacity: titleOpacity,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 1000,
            padding: 40,
          }}
        >
          {words.map((word, wordIndex) => (
            <div
              key={wordIndex}
              style={{ display: "flex", marginRight: 20, marginBottom: 10 }}
            >
              {word.split("").map((letter, letterInWordIndex) => {
                const delay = letterIndex * 2;
                letterIndex += 1;

                const progress = spring({
                  frame: frame - delay,
                  fps,
                  config: { damping: 200 },
                });

                const translateY = interpolate(progress, [0, 1], [40, 0]);
                const letterOpacity = interpolate(progress, [0, 1], [0, 1]);

                return (
                  <span
                    key={`${wordIndex}-${letterInWordIndex}`}
                    style={{
                      display: "inline-block",
                      transform: `translateY(${translateY}px)`,
                      opacity: letterOpacity,
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: 56,
                      fontWeight: 700,
                      color: "white",
                      textShadow: "0 4px 20px rgba(0,0,0,0.35)",
                    }}
                  >
                    {letter}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </AbsoluteFill>

      {/* Overlays informativos sobre el recorrido */}
      <LocationPin inAt={PIN_IN} outAt={PIN_OUT} />
      <SpeedHud inAt={HUD_IN} outAt={hudOut} />
      <RouteMap inAt={MAP_IN} outAt={MAP_OUT} />

      {/* Subtítulos (pendiente: transcripción del audio de Valentino) */}
      <Captions />

      <Outro inAt={outroIn} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
