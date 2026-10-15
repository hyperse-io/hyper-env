---
'@hyperse/hyper-env': minor
---

Dependency refresh, toolchain modernization, and release/CI hardening.

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
