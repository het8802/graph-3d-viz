import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      'graph-3d-viz': path.resolve(__dirname, '../src'),
    },
  },
}); 