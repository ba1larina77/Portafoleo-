import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { config } from "../../config";

export const BarraProgreso: React.FC<{ escala: number }> = ({ escala }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const b = config.extras.barraProgreso;
  const progreso = durationInFrames > 1 ? frame / (durationInFrames - 1) : 1;

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: b.alto * escala, background: b.fondo }}>
      <div style={{ width: `${progreso * 100}%`, height: "100%", background: b.color }} />
    </div>
  );
};
