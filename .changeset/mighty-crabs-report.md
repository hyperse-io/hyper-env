---
"@hyperse/hyper-env": patch
---

feat: expose setup-env entry and improve dotenv setup

- Add `setupEnv` entrypoint (`@hyperse/hyper-env/setup-env`) and unit tests
- Pass `dotenvOptions` through to `dotenv` for finer configuration
- Guard dotenv loading with file existence check to avoid errors