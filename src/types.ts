import { ESBuildMinifyPlugin } from "esbuild-loader";
import type * as webpack from "webpack";

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
}

export type Transformer = (
  config: webpack.Configuration,
  options: PresetOptions
) => webpack.Configuration;
