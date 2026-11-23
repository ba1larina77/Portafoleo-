import React, { useMemo } from "react";
import { AbsoluteFill, OffthreadVideo, getRemotionEnvironment, staticFile } from "remotion";
import { PanelRevision } from "./components/PanelRevision";
import { Subtitulos } from "./components/Subtitulos";
import { cargarVideo } from "./lib/datos";
import { huellaTxt, leerTxt } from "./lib/subtitulos";

export type PropsVlog = { nombre: string };

export const VideoVlog: React.FC<PropsVlog> = ({ nombre }) => {
  const datos = cargarVideo(nombre);
  const txt = datos?.txt ?? null;
  const base = datos?.base;
  const { lineas, problemas } = useMemo(
    () => (txt != null && base ? leerTxt(txt, base.palabras, base.duracionS) : { lineas: [], problemas: [] }),
    [txt, base],
  );
  if (!datos) throw new Error(`No hay datos para "${nombre}". Ejecuta npm run subtitular -- ${nombre}`);

  const aprobado = txt != null && datos.aprobacion?.hash === huellaTxt(txt);
  const entorno = getRemotionEnvironment();

  // Candado: nada se renderiza sin tu visto bueno
  if (entorno.isRendering) {
    if (!aprobado) {
      throw new Error(
        `"${nombre}" no está aprobado o el .txt cambió después de aprobarlo. Ejecuta: npm run aprobar -- ${nombre}`,
      );
    }
    if (problemas.some((p) => p.tipo === "error")) throw new Error(`subtitulos/${nombre}.txt tiene errores.`);
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo src={staticFile(datos.base.video)} />
      <Subtitulos lineas={lineas} />
      {entorno.isStudio && (
        <PanelRevision
          nombre={nombre}
          problemas={problemas}
          aprobado={aprobado}
          subtitulos={lineas.length}
          sinTxt={txt == null}
        />
      )}
    </AbsoluteFill>
  );
};
