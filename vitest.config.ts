import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 100000,
    // `tests/dotenv.spec.ts` and `tests/next-standalone.spec.ts` both build into
    // and inspect the shared `.next` directory, so running spec files in
    // parallel makes them race and fail nondeterministically.
    fileParallelism: false,
    exclude: [...configDefaults.exclude],
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    },
    include: ['**/?(*.){test,spec}.?(c|m)[jt]s?(x)'],
  },
});
