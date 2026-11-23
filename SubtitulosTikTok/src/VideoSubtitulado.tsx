import React, { useMemo } from "react";
import { AbsoluteFill, Html5Audio, OffthreadVideo, Sequence, getStaticFiles, staticFile, useVideoConfig } from "remotion";
import { config } from "../config";
import { BarraProgreso } from "./components/BarraProgreso";
import { Subtitulos } from "./components/Subtitulos";
import { Titulo } from "./components/Titulo";
import { analizar } from "./lib/analisis";
import type { DatosVideo } from "./lib/types";

export type PropsVideo = { id: string; datos: DatosVideo | null };

export const VideoSubtitulado: React.FC<PropsVideo> = ({ datos }) => {
  const { width, height, fps } = useVideoConfig();
  const analisis = useMemo(() => (datos ? analizar(datos, config) : null), [datos]);
  if (!datos || !analisis) return null;

  const escala = Math.min(width, height) / 1080;
  const whoosh = config.extras.whoosh;
  const rutaWhoosh = `sfx/${whoosh.archivo}`;
  const hayWhoosh =
    whoosh.activo && analisis.titulo.length > 0 && getStaticFiles().some((f) => f.name === rutaWhoosh);
  const frameWhoosh = analisis.titulo.length ? Math.max(0, Math.round(analisis.titulo[0].inicio * fps) - 3) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {datos.recorte ? (
        <VideoRecortado datos={datos} ancho={width} alto={height} />
      ) : (
        <OffthreadVideo src={staticFile(datos.video)} />
      )}
      {hayWhoosh ? (
        <Sequence from={frameWhoosh} layout="none">
          <Html5Audio src={staticFile(rutaWhoosh)} volume={whoosh.volumen} />
        </Sequence>
      ) : null}
      <Subtitulos grupos={analisis.grupos} inicioSubtitulos={analisis.inicioSubtitulos} escala={escala} />
      <Titulo palabras={analisis.titulo} inicioHistoria={analisis.inicioHistoria} escala={escala} />
      {config.extras.barraProgreso.activa ? <BarraProgreso escala={escala} /> : null}
    </AbsoluteFill>
  );
};

/** Escala el video para que la zona sin barras llene toda la pantalla (tipo "cover"). */
const VideoRecortado: React.FC<{ datos: DatosVideo; ancho: number; alto: number }> = ({ datos, ancho, alto }) => {
  const r = datos.recorte!;
  const k = Math.max(ancho / r.ancho, alto / r.alto);
  const izquierda = -r.x * k + (ancho - r.ancho * k) / 2;
  const arriba = -r.y * k + (alto - r.alto * k) / 2;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(datos.video)}
        style={{
          position: "absolute",
          left: izquierda,
          top: arriba,
          width: datos.anchoOriginal * k,
          height: datos.altoOriginal * k,
          maxWidth: "none",
        }}
      />
    </AbsoluteFill>
  );
};
