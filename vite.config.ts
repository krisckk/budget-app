import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // optional: manualChunks for fine-tuned splitting
        manualChunks: {
          chart: ['chart.js', 'react-chartjs-2'],
          dexie: ['dexie'],
        },
      },
    },
  },
});