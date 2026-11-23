import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Composition, getStaticFiles, staticFile } from "remotion";
import { fontFamily } from "./components/estilo";
import type { DatosVideo } from "./lib/types";
import { PropsVideo, VideoSubtitulado } from "./VideoSubtitulado";

const calcularMetadatos: CalculateMetadataFunction<PropsVideo> = async ({ props }) => {
  const res = await fetch(staticFile(`data/${props.id}.json`));
  const datos = (await res.json()) as DatosVideo;
  return {
    width: datos.ancho,
    height: datos.alto,
    fps: datos.fps,
    durationInFrames: datos.duracionFrames,
    props: { ...props, datos },
  };
};

const SinVideos: React.FC = () => (
  <AbsoluteFill
    style={{ background: "#111", color: "white", fontFamily, justifyContent: "center", padding: 80, fontSize: 56 }}
  >
    No hay videos procesados todavía. Pon un .mp4 en la carpeta input/ y ejecuta npm run studio.
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => {
  // Una composición por cada video procesado (public/data/<id>.json)
  const ids = getStaticFiles()
    .map((f) => f.name.match(/^data\/(.+)\.json$/)?.[1])
    .filter((x): x is string => Boolean(x));

  if (ids.length === 0) {
    return <Composition id="SinVideos" component={SinVideos} width={1080} height={1920} fps={30} durationInFrames={90} />;
  }

  return (
    <>
      {ids.map((id) => (
        <Composition
          key={id}
          id={id}
          component={VideoSubtitulado}
          defaultProps={{ id, datos: null } as PropsVideo}
          calculateMetadata={calcularMetadatos}
          // Se reemplazan en calculateMetadata con los valores del video original
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={30}
        />
      ))}
    </>
  );
};
