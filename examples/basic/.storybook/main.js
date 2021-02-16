module.exports = {
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    {
      name: "../../../preset.js",
      options: {
        // We uses an environmental variable to switch optimization level for benchmark.
        // You would probably hard-code the level.
        optimizationLevel: process.env.OPTIMIZATION_LEVEL
          ? parseInt(process.env.OPTIMIZATION_LEVEL)
          : 1,
      },
    },
  ],
};

console.log(process.env.OPTIMIZATION_LEVEL);
