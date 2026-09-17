import { CalculateMetadataFunction, Composition } from "remotion";
import { PereiraIntro } from "./PereiraIntro";

type Props = {};

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  return {};
};

export const MyComposition = () => {
  return (
    <Composition
      id="MyComp"
      component={PereiraIntro}
      durationInFrames={746}
      fps={30}
      width={1920}
      height={1080}
      calculateMetadata={calculateMetadata}
    />
  );
};
