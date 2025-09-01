import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  dts: true,
  entry: ['src/index.ts', 'src/next-standalone.ts', 'src/setup-env.ts'],
  splitting: false,
  sourcemap: !options.watch,
  clean: true,
  minify: false,
  treeshake: true,
  tsconfig: './tsconfig.build.json',
  format: ['esm'],
}));
