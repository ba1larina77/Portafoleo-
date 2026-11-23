import { loadFont } from "@remotion/google-fonts/Montserrat";
import type { CSSProperties } from "react";
import { config } from "../../config";

export const { fontFamily } = loadFont("normal", {
  weights: ["800", "900"],
  subsets: ["latin", "latin-ext"],
});

/** Texto grueso con borde por fuera y sombra suave. */
export const textoConBorde = (tamano: number, grosor: number): CSSProperties => ({
  fontFamily,
  fontWeight: Number(config.fuente.peso),
  fontSize: tamano,
  lineHeight: 1.1,
  letterSpacing: "0.01em",
  WebkitTextStroke: `${grosor}px ${config.estilo.colorBorde}`,
  paintOrder: "stroke fill",
  textShadow: config.estilo.sombra,
});
