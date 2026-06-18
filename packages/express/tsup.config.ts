import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: false,
  minify: false,
  clean: true,
  treeshake: true,
  tsconfig: 'tsconfig.build.json',
  external: ['guardian-risk', 'express'],
});
