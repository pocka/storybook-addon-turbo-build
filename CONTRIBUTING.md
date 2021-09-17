# Submit a bug report or a feature request

Create an issue via our Issue Templates.

# Ask a question or you're not sure it's a bug or not

Use [GitHub Discussion feature](https://github.com/pocka/storybook-addon-turbo-build/discussions) on our repository.
We'll convert to an issue if needed.

# Code Contribution

## Development guide

Before start writing code, I recommend you to check these things:

- Editorconfig ... This project uses Editorconfig to prevent text styles from being chaos. Please use supported editor/plugin or follow the rule written in [config file](./.editorconfig).
- Prettier ... This project uses Prettier for consistent code formatting.

### Basic workflow

At first, you need to install dev dependencies. (These commands may not work on Windows.)

```sh
$ yarn install
$ cd examples/basic
$ yarn install
$ cd ../..
```

Then build the addon's source code with TypeScript compiler to make sure the current branch is okay.

```sh
$ yarn build
```

You can directly add `--watch` flag to enable watch mode.

```sh
$ yarn build --watch
```

To test your change works with actual Storybook, run the below command and start an example Storybook.
It will start at http://localhost:6006 by default.

```sh
$ cd examples/basic
$ yarn storybook
```

### Format source code with Prettier

Format files under the `src/`:

```sh
$ yarn prettier --write src
```

### Run unit tests

We use Jest for unit testing.

```sh
$ yarn test
```

You can also run Jest with watch mode with `--watch` flag.

```sh
$ yarn test --watch
```

## Open a Pull Request

Before submit a Pull Request, make sure following:

- `yarn test` does not emit an error
- `yarn lint` does not emit an error

Please make sure to fill our Pull Request template.
