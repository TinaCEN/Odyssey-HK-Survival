import { defineConfig } from 'vite';

// Vite defaults are enough for most TS + asset projects.
// base: './' makes the built site work when served from a subpath (e.g. GitHub Pages).
export default defineConfig({
  base: './',
  optimizeDeps: {
    // This package's published bundle references a non-existent split chunk.
    // Excluding it prevents Vite's pre-bundler from choking on the missing file.
    exclude: ['agent-gamedev-plugins']
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
