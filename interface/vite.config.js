// Configuration de Vite pour Mondes Immergés - GitHub Pages - VERSION OPTIMISÉE WEBGL
import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // Répertoire racine du projet
  root: './',

  // IMPORTANT: Pour GitHub Pages - Chemin complet avec le dossier interface
  base: process.env.NODE_ENV === 'production'
    ? '/Mondes-immerges/interface/'
    : '/',
  
  // Configuration du serveur de développement
  server: {
    port: 3000,
    open: true,
    cors: true,
    // Headers pour WebGL et CORS
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  
  // Configuration de la construction - OPTIMISÉE POUR WEBGL
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false, // Désactivé pour réduire la taille
    
    // NOUVEAU: Optimisations spécifiques pour WebGL et Three.js
    target: 'es2018', // Compatibilité élargie tout en gardant les performances
    minify: 'esbuild', // Utiliser esbuild au lieu de terser pour plus de simplicité
    
    // Options de rollup pour optimiser le bundling
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      
      // Séparer les gros modules en chunks séparés pour améliorer le cache
      output: {
        manualChunks: {
          // Three.js dans son propre chunk
          'three': ['three'],
          // GSAP dans son propre chunk
          'gsap': ['gsap'],
          // Autres dépendances
          'vendor': ['ldrs']
        },
        // Optimiser les noms de fichiers pour le cache
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      
      // Configuration pour éviter les warnings avec Three.js
      external: [],
      
      // Plugins pour optimiser Three.js
      plugins: []
    },
    
    // Limite des chunks pour éviter les warnings - augmentée pour Three.js
    chunkSizeWarningLimit: 2000, // Three.js est volumineux
    
    // NOUVEAU: Configuration pour les assets WebGL
    assetsInlineLimit: 4096, // Inline les petits assets
    
    // Optimisation des CSS
    cssCodeSplit: true,
    cssMinify: true
  },
  
  // Résolution des alias de chemin
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    },
    // NOUVEAU: Extensions pour une meilleure résolution
    extensions: ['.js', '.ts', '.json', '.vue', '.glsl', '.frag', '.vert']
  },
  
  // Optimisations - Pré-bundler les dépendances - OPTIMISÉ POUR WEBGL
  optimizeDeps: {
    include: [
      'three', 
      'gsap', 
      'ldrs'
    ],
    exclude: [
      // Exclure les modules qui peuvent poser problème avec WebGL
    ],
    force: true, // Forcer le re-bundling
    // NOUVEAU: Configuration ESBuild pour Three.js
    esbuildOptions: {
      target: 'es2018',
      // Préserver les noms importants pour WebGL
      keepNames: true,
      // Optimisations pour Three.js
      define: {
        // Variables globales pour Three.js si nécessaire
      }
    }
  },
  
  // NOUVEAU: Configuration pour les types d'assets WebGL
  assetsInclude: [
    '**/*.mp4', 
    '**/*.webm', 
    '**/*.ogg', 
    '**/*.glb', 
    '**/*.gltf',
    '**/*.hdr',
    '**/*.exr',
    '**/*.ktx',
    '**/*.ktx2',
    '**/*.basis',
    // Shaders
    '**/*.glsl',
    '**/*.frag',
    '**/*.vert',
    // Textures
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.png',
    '**/*.webp',
    '**/*.avif',
    // Audio
    '**/*.wav',
    '**/*.mp3',
    '**/*.ogg'
  ],
  
  // NOUVEAU: Variables d'environnement pour le debug WebGL
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __PROD__: process.env.NODE_ENV === 'production',
    // Activer les logs WebGL seulement en développement
    __WEBGL_DEBUG__: process.env.NODE_ENV === 'development'
  },
  
  // NOUVEAU: Configuration pour les Web Workers si nécessaire
  worker: {
    format: 'es',
    plugins: () => []
  },
  
  // Configuration CSS
  css: {
    // Préprocesseur CSS si nécessaire
    preprocessorOptions: {},
    // PostCSS pour l'optimisation
    postcss: {},
    // Minification CSS
    devSourcemap: false
  },
  
  // NOUVEAU: Configuration pour PWA si nécessaire plus tard
  // plugins: [
  //   // Ici on pourrait ajouter des plugins pour PWA, etc.
  // ],
  
  // NOUVEAU: Configuration des logs pour debug WebGL
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
  
  // NOUVEAU: Configuration pour le cache
  cacheDir: 'node_modules/.vite',
  
  // NOUVEAU: Configuration pour les tests si nécessaire
  test: {
    environment: 'jsdom', // Pour tester les composants WebGL
    globals: true
  }
});