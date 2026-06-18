import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: false,
  minify: false,
  clean: true,
  treeshake: true,
  splitting: false,
  tsconfig: 'tsconfig.build.json',
});
