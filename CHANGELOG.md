# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2023-04-15

### Changed

- Upgrade `esbuild-loader` to v3.

### Removed

- `esbuildMinifyOptions.sourcemap` option (Removed from `esbuild-loader`).

## [1.1.0] - 2022-03-13

### Added

- `managerTranspiler` and `previewTranspiler` option ([#20](https://github.com/pocka/storybook-addon-turbo-build/pull/20)).

## [1.0.1] - 2021-10-01

### Fixed

- Fix `esbuildMinifyOptions` being ignored ([#17](https://github.com/pocka/storybook-addon-turbo-build/pull/17)).
