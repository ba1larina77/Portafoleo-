// Solo se ve en Remotion Studio (nunca sale en el video renderizado).
import React from "react";
import { useVideoConfig } from "remotion";
import type { Problema } from "../lib/subtitulos";

type Props = { nombre: string; problemas: Problema[]; aprobado: boolean; subtitulos: number; sinTxt: boolean };

export const PanelRevision: React.FC<Props> = ({ nombre, problemas, aprobado, subtitulos, sinTxt }) => {
  const { width, height } = useVideoConfig();
  const k = Math.min(width, height) / 1080;
  const errores = problemas.filter((p) => p.tipo === "error");
  const avisos = problemas.filter((p) => p.tipo === "aviso");

  const estado = sinTxt
    ? { texto: `Falta subtitulos/${nombre}.txt`, color: "#E5484D" }
    : errores.length
      ? { texto: `${errores.length} error${errores.length > 1 ? "es" : ""} en el .txt`, color: "#E5484D" }
      : aprobado
        ? { texto: `✓ Aprobado · ${subtitulos} subtítulos`, color: "#30A46C" }
        : { texto: `Sin aprobar · ${subtitulos} subtítulos`, color: "#6E56CF" };

  return (
    <div style={{ position: "absolute", top: 24 * k, left: 24 * k, right: 24 * k, fontFamily: "system-ui, sans-serif" }}>
      <div
        style={{
          display: "inline-block",
          background: estado.color,
          color: "white",
          fontSize: 26 * k,
          fontWeight: 700,
          padding: `${8 * k}px ${16 * k}px`,
          borderRadius: 12 * k,
          opacity: 0.92,
        }}
      >
        {estado.texto}
      </div>
      {problemas.length > 0 && (
        <div
          style={{
            marginTop: 12 * k,
            background: "rgba(20,20,20,0.9)",
            color: "white",
            fontSize: 24 * k,
            lineHeight: 1.35,
            padding: 18 * k,
            borderRadius: 14 * k,
            maxHeight: height * 0.5,
            overflow: "hidden",
          }}
        >
          {[...errores, ...avisos].slice(0, 8).map((p, i) => (
            <div key={i} style={{ marginBottom: 12 * k }}>
              <b style={{ color: p.tipo === "error" ? "#FF6B6B" : "#FFD83D" }}>
                {p.tipo === "error" ? "Error" : "Aviso"} · línea {p.numero}:
              </b>{" "}
              {p.mensaje}
              <div style={{ opacity: 0.7, fontFamily: "monospace", fontSize: 21 * k, whiteSpace: "pre-wrap" }}>
                {p.contenido}
              </div>
            </div>
          ))}
          {problemas.length > 8 && (
            <div style={{ opacity: 0.7 }}>…y {problemas.length - 8} más (míralos en la terminal)</div>
          )}
        </div>
      )}
    </div>
  );
};
