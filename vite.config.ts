//vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5179,
    host: true,
    open: false
  },
  preview: {
    open: false
  }
});