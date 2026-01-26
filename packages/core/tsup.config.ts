import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ['axios', 'crypto-js', 'zod', 'fast-xml-parser'],
  outDir: 'dist',
  treeshake: true,
  splitting: false,
  loader: {
    '.json': 'copy',
  },
});
