import { loadFont } from "@remotion/google-fonts/Montserrat";
import type { CSSProperties } from "react";
import { config } from "../../config";

export const { fontFamily } = loadFont("normal", {
  weights: ["800", "900"],
  subsets: ["latin", "latin-ext"],
});

/** Texto grueso con borde negro por fuera y sombra. */
export const textoConBorde = (tamano: number, grosor: number, sombra?: string): CSSProperties => ({
  fontFamily,
  fontWeight: Number(config.fuente.peso),
  fontSize: tamano,
  lineHeight: 1.1,
  letterSpacing: "0.01em",
  WebkitTextStroke: `${grosor}px #000`,
  paintOrder: "stroke fill",
  textShadow: sombra,
});
