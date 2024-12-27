import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    open: false,
    hmr: {
      clientPort: 443
    }
  },
  preview: {
    open: false
  }
});