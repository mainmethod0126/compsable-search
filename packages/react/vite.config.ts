import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const packageDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@compsable-search/core',
        replacement: path.resolve(packageDir, '../core/src/index.ts'),
      },
    ],
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: path.resolve(packageDir, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['@compsable-search/core', 'react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
