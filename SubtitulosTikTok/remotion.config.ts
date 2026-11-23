import { Config } from "@remotion/cli/config";
import { config } from "./config";

Config.setEntryPoint("src/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(config.render.crf);
Config.setAudioBitrate(config.render.audioBitrate);
