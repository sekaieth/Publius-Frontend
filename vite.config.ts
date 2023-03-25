import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    glabl: 'globalThis',
  },
  resolve: {
    alias: {
      process: 'process/browser',
      util: 'util',
    },
  },
  plugins: [react()],
  server: {
    host: true,
    strictPort: true,
     watch: {
      usePolling: true,
    }
  }
});
