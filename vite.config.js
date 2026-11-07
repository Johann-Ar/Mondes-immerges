// Mondes Immergés : site multi-pages publié sur GitHub Pages
// (https://johann-ar.github.io/Mondes-immerges/)
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const page = (path) => resolve(import.meta.dirname, path);

export default defineConfig(({ command }) => ({
  // Le dépôt s'appelle « Mondes-immerges » : GitHub Pages respecte la casse.
  base: command === 'build' ? '/Mondes-immerges/' : '/',

  server: { port: 3000, open: true },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    chunkSizeWarningLimit: 800, // three.js pèse ~600 ko minifié
    rollupOptions: {
      input: {
        accueil: page('index.html'),
        interface: page('interface/index.html'),
        ombres: page('interface/les-ombres-de-la-mer/index.html'),
        okavango: page('interface/into-the-okavango/index.html'),
      },
      output: {
        manualChunks: { three: ['three'], gsap: ['gsap'] },
      },
    },
  },
}));
