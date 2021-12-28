import type * as webpack from "webpack";

import {
  disableSourceMap,
  esbuildLoaderReplacer,
  replaceBabelLoader,
  removeProgressPlugin,
  useESBuildAsMinifier,
} from "./transformers";
import type { PresetOptions, Transformer } from "./types";
import type { LoaderReplacer } from "./webpack";

function compose(...fns: Transformer[]): Transformer {
  return function (config, options) {
    return fns.reduce((c, transformer) => transformer(c, options), config);
  };
}

function id<T>(t: T): T {
  return t;
}

function normalizeOptions(options: Partial<PresetOptions> = {}): PresetOptions {
  const isProd = process.env.NODE_ENV === "production";

  return {
    optimizationLevel: Math.max(
      Math.min(Math.round(options.optimizationLevel ?? 1), 3),
      0
    ),
    removeProgressPlugin: options.removeProgressPlugin ?? isProd,
    disableSourceMap: options.disableSourceMap ?? isProd,
    esbuildMinifyOptions: options.esbuildMinifyOptions ?? {},
    managerTranspiler: options.managerTranspiler,
    previewTranspiler: options.previewTranspiler,
  };
}

function normalizeReplacer(
  replacer: LoaderReplacer | webpack.RuleSetUseItem
): LoaderReplacer {
  if (typeof replacer === "function") {
    return replacer;
  }

  return () => replacer;
}

export default {
  // Extends Storybook manager webpack (manager is the non-preview UIs, written in React)
  async managerWebpack(
    config: webpack.Configuration,
    options: Partial<PresetOptions>
  ): Promise<webpack.Configuration> {
    const finalOptions = normalizeOptions(options);

    if (finalOptions.optimizationLevel === 0) {
      return config;
    }

    const transpiler =
      typeof finalOptions.managerTranspiler !== "undefined"
        ? replaceBabelLoader(normalizeReplacer(finalOptions.managerTranspiler))
        : finalOptions.optimizationLevel >= 2
        ? replaceBabelLoader(esbuildLoaderReplacer)
        : id;

    const transformers = compose(
      useESBuildAsMinifier,
      removeProgressPlugin,
      disableSourceMap,
      transpiler
    );

    return transformers(config, finalOptions);
  },
  async webpack(
    config: webpack.Configuration,
    options: Partial<PresetOptions>
  ): Promise<webpack.Configuration> {
    const finalOptions = normalizeOptions(options);

    if (finalOptions.optimizationLevel === 0) {
      return config;
    }

    const transpiler =
      typeof finalOptions.previewTranspiler !== "undefined"
        ? replaceBabelLoader(normalizeReplacer(finalOptions.previewTranspiler))
        : finalOptions.optimizationLevel >= 3
        ? replaceBabelLoader(esbuildLoaderReplacer)
        : id;

    const transformers = compose(
      useESBuildAsMinifier,
      removeProgressPlugin,
      disableSourceMap,
      transpiler
    );

    return transformers(config, finalOptions);
  },
};
