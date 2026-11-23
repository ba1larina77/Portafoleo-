import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { AyudaVideo } from "./AyudaVideo";
import { AyudaVerticalBlur, AyudaVerticalCrop } from "./AyudaVertical";
import { Colegio1Video } from "./Colegio1Video";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="Ayuda"
        component={AyudaVideo}
        durationInFrames={2670}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Ayuda-Vertical-Blur"
        component={AyudaVerticalBlur}
        durationInFrames={2670}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Ayuda-Vertical-Crop"
        component={AyudaVerticalCrop}
        durationInFrames={2670}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Colegio1"
        component={Colegio1Video}
        durationInFrames={2040}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
