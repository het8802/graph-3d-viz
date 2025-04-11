import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Graph3DViz',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['three', 'd3'],
      output: {
        globals: {
          three: 'THREE',
          d3: 'd3',
        },
      },
    },
  },
  plugins: [dts()],
});
