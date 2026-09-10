import { resolve } from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'app/src'),
      '@payload-config': resolve(
        import.meta.dirname,
        'app/src/payload.config.ts'
      ),
    },
  },
  test: {
    coverage: {
      exclude: [
        'app/src/lib/catalog-actions.ts',
        'app/src/lib/payload-client.ts',
        // Talks to Payload directly; exercised end to end, not in unit tests.
        'app/src/lib/vin/payload/**',
        // Test data, not production code.
        'app/src/lib/vin/__fixtures__/**',
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
