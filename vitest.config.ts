import { resolve } from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'app/src'),
      '@payload-config': resolve(__dirname, 'app/src/payload.config.ts'),
    },
  },
  test: {
    coverage: {
      exclude: [
        'app/src/lib/catalog-actions.ts',
        'app/src/lib/payload-client.ts',
      ],
      include: ['app/src/access.ts', 'app/src/lib/**', 'app/src/utils/**'],
      provider: 'v8',
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    environment: 'node',
    restoreMocks: true,
    setupFiles: ['./vitest.setup.ts'],
    unstubEnvs: true,
    unstubGlobals: true,
  },
})
