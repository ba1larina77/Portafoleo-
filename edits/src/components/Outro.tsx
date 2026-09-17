import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

type Props = {
  inAt: number;
  durationInFrames: number;
};

/**
 * Cierre: oscurece la toma final y sobrepone un texto de marca.
 */
export const Outro: React.FC<Props> = ({ inAt, durationInFrames }) => {
  const frame = useCurrentFrame();

  const darken = interpolate(frame, [inAt, durationInFrames], [0, 0.75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(frame, [inAt + 15, inAt + 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${darken})` }} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "white",
            fontFamily: "Georgia, 'Times New Roman', serif",
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: 4 }}>
            PEREIRA
          </div>
          <div style={{ fontSize: 22, marginTop: 8, opacity: 0.9 }}>
            Días bonitos en moto 🏍️
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
