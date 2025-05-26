import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Важно для относительных путей
  build: {
    assetsDir: 'assets',
    outDir: 'dist',
  },
});
