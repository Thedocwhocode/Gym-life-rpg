import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    globals: false,
    environment: 'jsdom',
    include: ['**/*.spec.ts', '**/*.spec.tsx'],
    setupFiles: ['./test/setup.ts'],
  },
  // vite-tsconfig-paths misses "@/" when the checkout path has non-ASCII characters (Windows).
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  plugins: [tsconfigPaths()],
});
