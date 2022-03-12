import {
  Configuration,
  Plugin,
  ProgressPlugin,
  RuleSetRule,
  RuleSetUseItem,
} from "webpack";

import { isRuleAppliedTo, removePlugin, replaceLoader } from "./webpack";

describe("#isRuleAppliedTo", () => {
  it("Should work with string rule", () => {
    expect(isRuleAppliedTo({ test: "foo.ts" }, "foo.ts")).toEqual(true);
  });

  it("Should return false when the input string not started with the given string", () => {
    expect(isRuleAppliedTo({ test: "/dir/foo.ts" }, "foo.ts")).toEqual(false);
  });

  it("Should work with RegExp rule", () => {
    expect(isRuleAppliedTo({ test: /\.ts$/ }, "foo.ts")).toEqual(true);
  });

  it("Should work with function rule", () => {
    expect(
      isRuleAppliedTo({ test: (name) => name === "foo.ts" }, "foo.ts")
    ).toEqual(true);
    expect(
      isRuleAppliedTo({ test: (name) => name === "bar.ts" }, "foo.ts")
    ).toEqual(false);
  });

  it("Should work with multiple rules", () => {
    const testRule: RuleSetRule = {
      test: [/\.ts$/, (path) => path.includes("foo")],
    };

    expect(isRuleAppliedTo(testRule, "bar.ts")).toEqual(true);
    expect(isRuleAppliedTo(testRule, "foo.js")).toEqual(true);
    expect(isRuleAppliedTo(testRule, "baz.rs")).toEqual(false);
  });
});

describe("#removePlugin", () => {
  class TestPlugin implements Plugin {
    apply() {}
  }

  class TestPlugin2 implements Plugin {
    apply() {}
  }

  it("Should remove a plugin", () => {
    const actual = removePlugin(
      {
        plugins: [new ProgressPlugin(), new TestPlugin(), new TestPlugin2()],
      },
      TestPlugin
    );

    expect(actual.plugins).toHaveLength(2);
    expect(actual.plugins?.[0]).toBeInstanceOf(ProgressPlugin);
    expect(actual.plugins?.[1]).toBeInstanceOf(TestPlugin2);
  });
});

describe("#replaceLoader", () => {
  const testMatcher = (useItem: RuleSetUseItem) => {
    switch (typeof useItem) {
      case "string":
        return /before-loader/.test(useItem);
      case "object":
        return !!useItem.loader && /before-loader/.test(useItem.loader);
      default:
        return false;
    }
  };

  const testConfig: Configuration = {
    module: {
      rules: [
        {
          test: ".js",
          loader: "before-loader",
        },
        {
          test: ".css",
          use: "keep-loader",
        },
        {
          test: ".html",
          loaders: ["before-loader", "keep-loader"],
        },
        {
          test: ".png",
          use: [
            {
              loader: "before-loader",
            },
            {
              loader: "keep-loader",
              options: {},
            },
          ],
        },
      ],
    },
  };

  it("Should replace loaders", () => {
    const actual = replaceLoader(testConfig, testMatcher, () => "after-loader");

    expect(actual).toEqual({
      module: {
        rules: [
          {
            test: ".js",
            loader: "after-loader",
          },
          {
            test: ".css",
            use: "keep-loader",
          },
          {
            test: ".html",
            loaders: ["after-loader", "keep-loader"],
          },
          {
            test: ".png",
            use: [
              "after-loader",
              {
                loader: "keep-loader",
                options: {},
              },
            ],
          },
        ],
      },
    });
  });

  it("Should remove loaders", () => {
    const actual = replaceLoader(testConfig, testMatcher, () => null);

    expect(actual).toEqual({
      module: {
        rules: [
          {
            test: ".js",
            loader: undefined,
          },
          {
            test: ".css",
            use: "keep-loader",
          },
          {
            test: ".html",
            loaders: "keep-loader",
          },
          {
            test: ".png",
            use: { loader: "keep-loader", options: {} },
          },
        ],
      },
    });
  });
});
