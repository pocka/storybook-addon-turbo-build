import { exec } from "child_process";

const BENCHMARK_ATTEMPTS = 3;
const OPTIMIZATION_LEVEL_MAX = 3;

function buildStorybook(optimizationLevel, cold) {
  return new Promise((resolve, reject) => {
    const removeCache = "rm -rf node_modules/.cache";
    const buildStorybook = "yarn build-storybook";

    const commands = cold ? [removeCache, buildStorybook] : [buildStorybook];

    exec(
      commands.join(" && "),
      {
        env: {
          // We need to pass $PATH otherwise the shell cannot find node-related
          // stuffs in environments with Node's version manager (e.g. nvm, asdf)
          PATH: process.env.PATH,
          OPTIMIZATION_LEVEL: optimizationLevel.toString(10),
        },
      },
      (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      }
    );
  });
}

async function measure(optimizationLevel, cold) {
  // A list of processed time (nanoseconds)
  const results = [];

  if (!cold) {
    await buildStorybook(optimizationLevel, false);
  }

  for (let i = 0; i < BENCHMARK_ATTEMPTS; i++) {
    const start = process.hrtime.bigint();

    await buildStorybook(optimizationLevel, cold);

    const end = process.hrtime.bigint();

    results.push(Number(end - start));
  }

  return results;
}

async function suite(cold) {
  const results = [];

  // Cold build (without cache)
  for (let level = 0; level <= OPTIMIZATION_LEVEL_MAX; level++) {
    const elapsed = await measure(level, cold);

    if (elapsed.length > 0) {
      results.push({
        level,
        average: elapsed.reduce((a, b) => a + b, 0) / elapsed.length,
        results: elapsed,
      });
    }
  }

  return results;
}

async function main() {
  try {
    console.log(
      JSON.stringify(
        {
          cold: await suite(true),
          hot: await suite(false),
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
