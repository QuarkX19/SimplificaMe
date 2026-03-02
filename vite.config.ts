// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@':         path.resolve(__dirname, './src'),
      '@core':     path.resolve(__dirname, './src/core'),
      '@services': path.resolve(__dirname, './src/services'),
      '@ui':       path.resolve(__dirname, './src/ui'),
      '@utils':    path.resolve(__dirname, './src/utils'), // ✅ agregado
    },
  },

  server: {
    port: 5173,
    open: true, // ✅ abre el browser automáticamente
  },

  build: {
    outDir: 'dist',
    sourcemap: false, // ✅ false en producción
  },
});