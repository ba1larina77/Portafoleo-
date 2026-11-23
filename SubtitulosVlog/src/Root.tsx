import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { fontFamily } from "./components/estilo";
import { listarVideos } from "./lib/datos";
import { VideoVlog } from "./VideoVlog";

const SinVideos: React.FC = () => (
  <AbsoluteFill
    style={{ background: "#111", color: "white", fontFamily, justifyContent: "center", padding: 80, fontSize: 56 }}
  >
    Todavía no hay videos. Pon tu vlog en input/ y ejecuta: npm run subtitular -- nombre
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => {
  const videos = listarVideos();
  if (videos.length === 0) {
    return <Composition id="SinVideos" component={SinVideos} width={1080} height={1920} fps={30} durationInFrames={90} />;
  }
  return (
    <>
      {videos.map(({ id, nombre, base }) => (
        <Composition
          key={id}
          id={id}
          component={VideoVlog}
          defaultProps={{ nombre }}
          // Todo igual al original
          width={base.ancho}
          height={base.alto}
          fps={base.fps}
          durationInFrames={base.duracionFrames}
        />
      ))}
    </>
  );
};
