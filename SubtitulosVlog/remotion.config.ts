import { Config } from "@remotion/cli/config";
import { config } from "./config";
import { webpackOverride } from "./webpack";

Config.setEntryPoint("src/index.ts");
Config.overrideWebpackConfig(webpackOverride);
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(config.render.crf);
