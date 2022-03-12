import { ESBuildMinifyPlugin } from "esbuild-loader";
import type * as webpack from "webpack";

import type { LoaderReplacer } from "./webpack";

type MinifyOptions = NonNullable<
  ConstructorParameters<typeof ESBuildMinifyPlugin>[0]
>;

/**
 * Preset options.
 * Every property is optional: this typing is for internal usage, the facade will assign default values.
 */
export interface PresetOptions {
  /**
   * 0 (no optmization) ~ 3 (aggressive optimization, may cause errors)
   */
  optimizationLevel: number;

  esbuildMinifyOptions: MinifyOptions;

  /**
   * Remove webpack's ProgressPlugin, which reports current progress to terminal.
   * Defaults to `true` when `NODE_ENV=production` otherwise `false`.
   */
  removeProgressPlugin: boolean;

  /**
   * Disable source map generation.
   * Defaults to `true` when `NODE_ENV=production` otherwise `false`.
   */
  disableSourceMap: boolean;

  /**
   * A function to replace `babel-loader` with custom webpack loader for Manager (Storybook UI, addons).
   * Return `null` to remove `babel-loader` without replacement.
   * Defaults to a function that replace with `esbuild-loader` when `optimizationLevel` >= 2, `undefined` otherwise.
   */
  managerTranspiler?: LoaderReplacer | webpack.RuleSetUseItem;

  /**
   * A function to replace babel-loader with custom webpack loader for Preview (iframe, your code)
   * Return `null` to remove `babel-loader` without replacement.
   * Defaults to a function that replace with `esbuild-loader` when `optimizationLevel` >= 3, `undefined` otherwise.
   */
  previewTranspiler?: LoaderReplacer | webpack.RuleSetUseItem;
}

export type Transformer = (
  config: webpack.Configuration,
  options: PresetOptions
) => webpack.Configuration;
