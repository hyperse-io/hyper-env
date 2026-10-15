---
'@hyperse/hyper-env': patch
---

Fix CI failure caused by an obsolete Vitest snapshot.

- Removed the stale `tests/__snapshots__/dotenv.spec.ts.snap` file. Its only entry (`parses safe env vars and 1`) belonged to a test that no longer exists, and no test in the repo uses snapshot assertions. Under `CI=true` Vitest treats obsolete snapshots as an error (`Obsolete snapshots found when no snapshot update is expected`), which failed the `ci-integrity` job even though all tests passed.
- Serialized Vitest spec-file execution (`fileParallelism: false`). `tests/dotenv.spec.ts` and `tests/next-standalone.spec.ts` both build into and inspect the shared `.next` directory, which made them race and fail nondeterministically.
- Updated `tests/next-standalone.spec.ts` expectations for the new dependency artifact locations (`node_modules/dotenv/dist/index.cjs`, `node_modules/dotenv-expand/dist/lib/main.js`).
