/**
 * @module
 * Helper functions for modifying webpack config.
 */

import {
  Configuration,
  Plugin,
  RuleSetRule,
  RuleSetUse,
  RuleSetUseItem,
} from "webpack";

/**
 * Replace minimizer library.
 * @param config webpack config
 * @param minimizer new minimizer
 * @returns modified webpack config
 */
export function replaceMinimizer(
  config: Configuration,
  minimizer: Plugin
): Configuration {
  return {
    ...config,
    optimization: {
      // Use provided optimization configuration other than minimizer
      ...(config.optimization ?? {
        // In case where config.optimization is empty (probably never happen)
        minimize: true,
      }),
      minimizer: [minimizer],
    },
  };
}

type AnyConstructor = new (...args: any) => any;

/**
 * Append a plugin if not added to the plugins list yet.
 * @param config webpack config
 * @param ctor constructor of the plugin (function plugins are not supported)
 * @param item factory function returns an item to append
 * @returns modified webpack config
 */
export function safeAppendPlugin(
  config: Configuration,
  ctor: AnyConstructor,
  item: () => Plugin
): Configuration {
  // Do not append if there is already the plugin
  if (
    config.plugins &&
    config.plugins.some((plugin) => plugin instanceof ctor)
  ) {
    return config;
  }

  return {
    ...config,
    plugins: [...(config.plugins ?? []), item()],
  };
}

/**
 * Remove a plugin from a plugin list in a given webpack config.
 * @param config webpack config
 * @param ctor constructor of the plugin to remove
 * @returns modified webpack config
 */
export function removePlugin(
  config: Configuration,
  ctor: AnyConstructor
): Configuration {
  if (!config.plugins || !config.plugins.length) {
    return config;
  }

  return {
    ...config,
    plugins: config.plugins.filter((plugin) => !(plugin instanceof ctor)),
  };
}

type LoaderTester = (loader: RuleSetUseItem, rule: RuleSetRule) => boolean;
type LoaderReplacer = (
  loader: RuleSetUseItem,
  rule: RuleSetRule
) => RuleSetUseItem | null;

/**
 * Replace or Remove loader matching to `test` with a value returned from `replaceWith`.
 * @param config webpack config
 * @param test decides whether the loader is replaced (removed). think as 1st parameter of Array.prototype.filter
 * @param replaceWith a factory function returns a rule which takes place in. return null to remove the loader
 * @returns modified webpack config
 */
export function replaceLoader(
  config: Configuration,
  test: LoaderTester,
  replaceWith: LoaderReplacer
): Configuration {
  if (!config.module?.rules) {
    return config;
  }

  return {
    ...config,
    module: {
      ...config.module,
      rules: replaceLoaderInternal(config.module.rules, test, replaceWith),
    },
  };
}

function replaceLoaderInternal(
  rules: readonly RuleSetRule[],
  test: LoaderTester,
  replaceWith: LoaderReplacer
): RuleSetRule[] {
  if (!rules) {
    return rules;
  }

  const replaceRuleSetUse = (
    use: RuleSetUse,
    rule: RuleSetRule
  ): RuleSetUse | undefined => {
    // NOTE: Function Use needs compiler information to call.
    if (typeof use === "function") {
      return use;
    }

    if (use instanceof Array) {
      const transformed = use
        .map((item) => {
          if (test(item, rule)) {
            return replaceWith(item, rule);
          }

          return item;
        })
        .filter((item): item is NonNullable<typeof item> => !!item);

      switch (transformed.length) {
        case 0:
          return undefined;
        case 1:
          return transformed[0];
        default:
          return transformed;
      }
    }

    return test(use, rule) ? replaceWith(use, rule) ?? undefined : use;
  };

  return rules.map((rule) => {
    if (rule.oneOf) {
      return {
        ...rule,
        oneOf: replaceLoaderInternal(rule.oneOf, test, replaceWith),
      };
    }

    if (rule.loader) {
      return {
        ...rule,
        loader: replaceRuleSetUse(rule.loader, rule),
      };
    }

    if (rule.loaders) {
      return {
        ...rule,
        loaders: replaceRuleSetUse(rule.loaders, rule),
      };
    }

    if (rule.use) {
      return {
        ...rule,
        use: replaceRuleSetUse(rule.use, rule),
      };
    }

    return rule;
  });
}
