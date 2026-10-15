# @hyperse/hyper-env

## 1.1.0

### Minor Changes

- [`a082243`](https://github.com/hyperse-io/hyper-env/commit/a082243ce402677269b898bcad43e2da02eff982) Thanks [@tianyingchun](https://github.com/tianyingchun)! - Dependency refresh, toolchain modernization, and release/CI hardening.

  **Breaking**
  - Raised the minimum supported runtime to Node.js `>=22.11.0` (`engines.node`). Node.js 18 is EOL and is no longer supported either in CI or at runtime.
  - Bumped `@vercel/nft` from `^0.30.1` to `^1.11.0`. This is a major jump in the file-tracing engine used to resolve which files get copied into the Next.js standalone output, so traced dependency trees may now differ slightly (generally more accurate, but review your standalone bundle contents after upgrading).
  - Bumped `globby` from `^14.1.0` to `^16.2.4` (major), which changes the glob result ordering/absolute-path defaults used when scanning `.env*` files. If you relied on a specific file iteration order, re-verify your load order.
  - Bumped `dotenv-expand` from `^12.0.2` to `^1000.0.0`, which follows `dotenv@18`'s new versioning line and behavior.

  **Changed**
  - `dotenv` upgraded from `^17.2.1` to `^18.0.8`.
  - Dev toolchain upgrades: `vitest` `^3.2.4` → `^5.0.4` (now on Vite 8, added as an explicit dev dependency), `next` `^15.5.2` → `^16.4.1`, `react`/`react-dom` `^19.1.x` → `^19.3.1`, `eslint` `^9.34.0` → `^10.12.0`, `tsup` `^8.5.0` → `^9.0.0`.
  - Lint/commit tooling upgrades: `@commitlint/cli` and `@commitlint/config-conventional` `^19.8.1` → `^21.2.3`, `@hyperse/eslint-config-hyperse` `^1.4.8` → `^1.7.5`, `lint-staged` `^16.1.6` → `^17.6.0`, `commitizen` `^4.3.1` → `^4.3.2`, `@types/node` `^24.3.0` → `^26.6.5`, `@types/react`/`@types/react-dom` → `^19.3.0`.
  - `typescript` is pinned to `6.x` via both `devDependencies` and `resolutions.typescript` so that the compiler and all transitive consumers (e.g. `eslint-plugin-sonarjs`) resolve to the same version.
  - Bumped the package manager from `yarn@4.9.4` to `yarn@4.18.1` (`.yarn/releases/yarn-4.18.1.cjs`, `packageManager`, and `yarnPath` updated together).

  **Fixed**
  - Release workflow (`.github/workflows/release-or-version-pr.yml`) now also exports `YARN_NPM_AUTH_TOKEN` alongside `NPM_TOKEN`. Yarn Berry ignores `NPM_TOKEN`, so publishing previously failed with `YN0033: No authentication configured for request` when the registry token was only provided through the legacy variable.
  - CI test matrix (`.github/workflows/ci-integrity.yml`) moved from the EOL Node.js `18.x` to the current LTS `24.x`, matching the release workflow.
  - Corrected the stale `Use Node.js 18.x` step label in the release workflow so it reflects the actual `node-version: 24.x`.
  - `setupDotenv` now passes `quiet: true` to `dotenv.config()`. `dotenv@18` began writing a `◇ injected env (n) from <path>` line to stderr on every load, which polluted the CLI's output and broke stderr assertions for consumers; passing `quiet: false` still re-enables the message.
  - `tsconfig.json` keeps `baseUrl`/`paths` and sets `ignoreDeprecations: "6.0"`. `baseUrl` is deprecated in TypeScript 6/7, but `@hyperse/ts-node` requires `baseUrl`/`rootDir`/`outDir` to be present and throws `TsConfigFieldsNotFoundError` without them, so removing it was not an option.
  - Removed the `eslint.ignoreDuringBuilds` key from `next.config.mjs`; Next.js 16 dropped that option and emitted "Unrecognized key(s) in object: 'eslint'" warnings on every build.
  - `tests/dotenv.spec.ts` now reads the server-rendered `.next/server/pages/index.html` instead of a client chunk looked up via `build-manifest.json`, whose last entry is the Turbopack runtime rather than the page chunk under Next.js 16.
  - `tests/next-standalone.spec.ts` assertions were updated for the new artifact locations (`node_modules/dotenv/dist/index.cjs` and `node_modules/dotenv-expand/dist/lib/main.js`), replacing the stale `lib/main.js` paths.
  - Serialized Vitest spec-file execution (`fileParallelism: false`). `tests/dotenv.spec.ts` and `tests/next-standalone.spec.ts` both build into and inspect the shared `.next` directory, so running them in parallel caused nondeterministic failures unrelated to the code under test.

  **Internal**
  - Yarn configuration (`.yarnrc.yml`) added `approvedGitRepositories: ["**"]`, `enableScripts: true`, `npmMinimalAgeGate: 0`, keeping `nodeLinker: node-modules` and `enableGlobalCache: false` unchanged.
  - VS Code workspace settings (`.vscode/settings.json`) migrated the deprecated `typescript.*` keys to the new `js/ts.*` keys and enabled `json.schemaDownload.enable`.
  - `yarn.lock` regenerated for the upgrades above.

## 1.0.18

### Patch Changes

- [#27](https://github.com/hyperse-io/hyper-env/pull/27) [`3836611`](https://github.com/hyperse-io/hyper-env/commit/38366119a50ee88fbf6770682af0089dc0498051) Thanks [@tclxshunquan-wang](https://github.com/tclxshunquan-wang)! - feat: update environment variable load order

## 1.0.17

### Patch Changes

- [#25](https://github.com/hyperse-io/hyper-env/pull/25) [`fcfdaf2`](https://github.com/hyperse-io/hyper-env/commit/fcfdaf278714820ba7b8fc297e59568abde1740e) Thanks [@tclxshunquan-wang](https://github.com/tclxshunquan-wang)! - feat: expose setup-env entry and improve dotenv setup
  - Add `setupEnv` entrypoint (`@hyperse/hyper-env/setup-env`) and unit tests
  - Pass `dotenvOptions` through to `dotenv` for finer configuration
  - Guard dotenv loading with file existence check to avoid errors

## 1.0.16

### Patch Changes

- [`c387f88`](https://github.com/hyperse-io/hyper-env/commit/c387f8896ff0e274b8af2f6fc8f69d5f55cac931) Thanks [@tyc15129](https://github.com/tyc15129)! - bump version

## 1.0.15

### Patch Changes

- [#22](https://github.com/hyperse-io/hyper-env/pull/22) [`08f5577`](https://github.com/hyperse-io/hyper-env/commit/08f557747cbd47865079746af3d1b6a4bdac9f6a) Thanks [@tclxshunquan-wang](https://github.com/tclxshunquan-wang)! - feat: add setup-env functionality and refactor helpers

- [`762ef02`](https://github.com/hyperse-io/hyper-env/commit/762ef0230ad5c15058ac8d1ccde95ef6d912a1d6) Thanks [@tianyingchun](https://github.com/tianyingchun)! - bump version

## 1.0.14

### Patch Changes

- [`a4ee9fc`](https://github.com/hyperse-io/hyper-env/commit/a4ee9fc7b4a53ff224d4d3fd54763dfc1b13ae78) Thanks [@tianyingchun](https://github.com/tianyingchun)! - bump version

## 1.0.13

### Patch Changes

- [`67539ad`](https://github.com/hyperse-io/hyper-env/commit/67539ad9020339a6318acf0a3b1818331c0aaf75) Thanks [@tianyingchun](https://github.com/tianyingchun)! - refactor `next-standalone`

## 1.0.12

### Patch Changes

- [`2a752da`](https://github.com/hyperse-io/hyper-env/commit/2a752daa7b5765bcc69aa4ae5c2cd5da8ff648be) Thanks [@tianyingchun](https://github.com/tianyingchun)! - bump version & eslint

## 1.0.11

### Patch Changes

- [`651345a`](https://github.com/hyperse-io/hyper-env/commit/651345afa80d9868c21611eb1561cf4030a3c612) Thanks [@tianyingchun](https://github.com/tianyingchun)! - add `.env.*` copy support

## 1.0.10

### Patch Changes

- [`265c000`](https://github.com/hyperse-io/hyper-env/commit/265c0008fb3fa42a11323b6b05a77c870c1d590a) Thanks [@tianyingchun](https://github.com/tianyingchun)! - add more testcases, fix bug

## 1.0.9

### Patch Changes

- [`8d7ddba`](https://github.com/hyperse-io/hyper-env/commit/8d7ddbaebef7944989fe9153cd40da596b825168) Thanks [@tianyingchun](https://github.com/tianyingchun)! - fix next-standalone-defaults

## 1.0.8

### Patch Changes

- [`9577358`](https://github.com/hyperse-io/hyper-env/commit/957735895a37c015aff6eaa1ccc8989016d699be) Thanks [@tianyingchun](https://github.com/tianyingchun)! - add `next-standalone`

## 1.0.7

### Patch Changes

- [`3197846`](https://github.com/hyperse-io/hyper-env/commit/3197846121837a73706743a92d2a614cd0c66f6d) Thanks [@tianyingchun](https://github.com/tianyingchun)! - change `cross-spawn` to `child_process`

## 1.0.6

### Patch Changes

- [`7246a4c`](https://github.com/hyperse-io/hyper-env/commit/7246a4c921cbdfdc13c50033b47a4d7c09e98073) Thanks [@tianyingchun](https://github.com/tianyingchun)! - bump version

## 1.0.5

### Patch Changes

- [`be4e63d`](https://github.com/hyperse-io/hyper-env/commit/be4e63d27d3699062054ac1037839e4f536d6b18) Thanks [@tianyingchun](https://github.com/tianyingchun)! - bump version

## 1.0.4

### Patch Changes

- [`84ce68b`](https://github.com/hyperse-io/hyper-env/commit/84ce68b0b657401bbff12a4a713d2b899a6cca9d) Thanks [@tianyingchun](https://github.com/tianyingchun)! - refactor migration paths-alias to `exec-program`

## 1.0.3

### Patch Changes

- [`7605bf3`](https://github.com/hyperse-io/hyper-env/commit/7605bf30779cf552d2ca239a5b3b700af36d21e3) Thanks [@tianyingchun](https://github.com/tianyingchun)! - bump version

- [`08b11fe`](https://github.com/hyperse-io/hyper-env/commit/08b11fe4db1e06397e3ac66e6414a6c05780b3ba) Thanks [@tianyingchun](https://github.com/tianyingchun)! - rename `hyperse-io` to `hyperse`

## 1.0.2

### Patch Changes

- [`2dcef29`](https://github.com/hyperse-io/hyper-env/commit/2dcef29509c0287643994ce9d859a72841a738c1) Thanks [@tianyingchun](https://github.com/tianyingchun)! - add missed `index.js`

## 1.0.1

### Patch Changes

- [`d542a09`](https://github.com/hyperse-io/hyper-env/commit/d542a093eb84addf8051eecb981ba50437e6be1a) Thanks [@tianyingchun](https://github.com/tianyingchun)! - improved test cases
