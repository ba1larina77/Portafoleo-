// Los .txt de subtitulos/ se cargan como texto (lo usan Studio y el render).
import type { WebpackOverrideFn } from "@remotion/bundler";

export const webpackOverride: WebpackOverrideFn = (actual) => ({
  ...actual,
  module: {
    ...actual.module,
    rules: [...(actual.module?.rules ?? []), { test: /\.txt$/, type: "asset/source" }],
  },
});
