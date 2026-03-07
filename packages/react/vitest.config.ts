import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

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
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
  },
})
