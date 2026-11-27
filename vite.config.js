import { defineConfig } from 'vite';
import { offlineBuild } from './scripts/offline-build.mjs';

export default defineConfig({
  plugins: [offlineBuild()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase';
          }
          if (id.includes('CustomVectorArt') || id.includes('CratePresentation')) {
            return 'vector-art';
          }
          if (id.includes('/src/data/') || id.includes('\\src\\data\\') || id.includes('/src/rendering/') || id.includes('\\src\\rendering\\')) {
            return 'game-world';
          }
        },
      },
    },
  },
});
