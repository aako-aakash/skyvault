import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ['react', 'react-dom'],
          forms:   ['react-hook-form', 'zod', '@hookform/resolvers'],
          motion:  ['framer-motion'],
          ui:      ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});
