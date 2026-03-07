import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const demoRoot = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(demoRoot, '../..')

const resolveWorkspacePath = (...segments: string[]) =>
  path.resolve(workspaceRoot, ...segments)

export default defineConfig({
  root: demoRoot,
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@compsable-search/react/style.css',
        replacement: resolveWorkspacePath('packages/react/src/style.css'),
      },
      {
        find: '@compsable-search/react',
        replacement: resolveWorkspacePath('packages/react/src/index.ts'),
      },
      {
        find: '@compsable-search/selector-region',
        replacement: resolveWorkspacePath('packages/selector-region/src/index.ts'),
      },
      {
        find: '@compsable-search/selector-keyword',
        replacement: resolveWorkspacePath('packages/selector-keyword/src/index.ts'),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
