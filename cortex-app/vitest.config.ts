import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    projects: [
      {
        test: {
          name: 'lib',
          include: ['tests/lib/**/*.test.ts', 'tests/stores/**/*.test.ts', 'tests/services/**/*.test.ts'],
          environment: 'node',
          globals: true,
        },
      },
      {
        test: {
          name: 'components',
          include: ['tests/components/**/*.test.{ts,tsx}'],
          environment: 'node',
          globals: true,
          setupFiles: ['./tests/setup.ts'],
        },
      },
    ],
  },
})
