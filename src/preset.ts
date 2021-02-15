import type * as webpack from "webpack";

import {
  disableSourceMap,
  replaceBabelLoader,
  removeProgressPlugin,
  useESBuildAsMinifier,
  appendESBuildPlugin,
} from "./transformers";
import type { PresetOptions, Transformer } from "./types";

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
    esbuildMinifyOptions: {},
  };
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

    const safeTransformers = compose(
      appendESBuildPlugin,
      useESBuildAsMinifier,
      removeProgressPlugin,
      disableSourceMap
    );

    const aggressiveTransformers =
      finalOptions.optimizationLevel >= 2 ? compose(replaceBabelLoader) : id;

    const transformers = compose(safeTransformers, aggressiveTransformers);

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

    const safeTransformers = compose(
      appendESBuildPlugin,
      useESBuildAsMinifier,
      removeProgressPlugin,
      disableSourceMap
    );

    // Preview webpack config compiles users' codes. We can't make sure it
    // works with ESBuild loader, it's dangerous.
    const dangerousTransformers =
      finalOptions.optimizationLevel >= 3 ? compose(replaceBabelLoader) : id;

    const transformers = compose(safeTransformers, dangerousTransformers);

    return transformers(config, finalOptions);
  },
};
