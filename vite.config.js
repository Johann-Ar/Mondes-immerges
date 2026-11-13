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
        target: 'es2022', // await au premier niveau (chargement différé du globe)
        chunkSizeWarningLimit: 700, // three.js pèse ~600 ko minifié
        rollupOptions: {
            input: {
                accueil: page('index.html'),
                globe: page('globe/index.html'),
                documentaire: page('documentaire/index.html'),
            },
            output: {
                manualChunks: { three: ['three'] },
            },
        },
    },
}));
