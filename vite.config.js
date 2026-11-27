import { defineConfig } from 'vite';

export default defineConfig({
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
