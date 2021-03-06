# storybook-addon-turbo-build

[![npm](https://img.shields.io/npm/v/storybook-addon-turbo-build)](https://www.npmjs.com/package/storybook-addon-turbo-build)
[![npm (alpha)](https://img.shields.io/npm/v/storybook-addon-turbo-build/alpha)](https://www.npmjs.com/package/storybook-addon-turbo-build)
[![npm (beta)](https://img.shields.io/npm/v/storybook-addon-turbo-build/beta)](https://www.npmjs.com/package/storybook-addon-turbo-build)
[![license](https://img.shields.io/github/license/pocka/storybook-addon-turbo-build)](https://github.com/pocka/storybook-addon-turbo-build/blob/master/LICENSE)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

This Storybook addon improves your Storybook's build time by tweaking webpack configuration.

Improvements such as replacing Terser with ESBuild or disabling source map generation reduces your build time, so you can save your CI time or operate development cycle more quickly.

**Important**

Storybook already does various build performance improvements. This addon mainly improves cold build (building Storybook without cache under `node_modules/.cache`), you probably won't see noticable differences in cache enabled build.
You should evaluate the build time before addin this addon into your workflow.

## Installation

```sh
$ npm i -D storybook-addon-turbo-build

# or
$ yarn add -D storybook-addon-turbo-build
```

## Getting Started

Add this line to your `.storybook/main.js`.

```diff
 module.exports = {
   stories: [
     "../stories/**/*.stories.mdx",
     "../stories/**/*.stories.@(js|jsx|ts|tsx)",
   ],
   addons: [
     "@storybook/addon-links",
     "@storybook/addon-essentials",
+    "storybook-addon-turbo-build"
   ],
 };
```

## Configurations

You can customize modifications to webpack config through [preset options](https://storybook.js.org/docs/react/addons/install-addons#optional-configuration).

```js
// .storybook/main.js
module.exports = {
  // ...
  addons: [
    // ...
    {
      name: "storybook-addon-turbo-build",
      options: {
        // Please refer below tables for available options
        optimizationLevel: 2,
      },
    },
  ],
};
```

### Available Options

| Option Name            | Description                                                                         | Available Values                                                              | Default Value                           |
| ---------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------- |
| `optimizationLevel`    | Level of build speed optimization (See [Optimization Levels](#optimization-levels)) | `0` ~ `3`                                                                     | `1`                                     |
| `esbuildMinifyOptions` | Options for esbuild via `ESBuildMinifyPlugin`                                       | object ([Docs](https://github.com/privatenumber/esbuild-loader#minifyplugin)) | `{ target: "es2015" }`                  |
| `removeProgressPlugin` | Whether to remove `ProgressPlugin`                                                  | boolean                                                                       | `process.env.NODE_ENV === "production"` |
| `disableSourceMap`     | Whether to disable source map generation                                            | boolean                                                                       | `process.env.NODE_ENV === "production"` |

### Optimization Levels

#### `0`

No optimization. The preset just returns given webpack configuration.

#### `1`

Safe optimizations. You'll get enough build performance boost with this level.

- Use ESBuild for minification instead of Terser
- Disables source map generation when `NODE_ENV=production`
- Disables webpack's ProgressPlugin when `NODE_ENV=production`

#### `2`

Aggressive optimizations. This would improve build speed slightly (probably about 1s, depends on machine) but might bring errors if you're using community addons.

- Replace `babel-loader` with ESBuild in Manager (Storybook UI, Addons)

#### `3`

Dangerous optimizations. If your project is relying on Babel, this probably will break the build. But will dramatically increases build performance especially when the project has a lot of files (stories).

- Replace `babel-loader` with ESBuild in Preview (Canvas, Docs Addon)

### Limitations

#### ES5 Transpilation

Currently ESBuild does not fully support transpilation to ES5 (yet). If you set optimization level to higher than 1, your bundle might not work on browsers support only up to ES5.

#### Bundle size

Since the preset replaces Terser with ESBuild, you may observe some file size differences. But it should be very small and does not bring noticable loading performance impact.
