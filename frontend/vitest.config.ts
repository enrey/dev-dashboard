import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        'src/index.tsx',
        'src/reportWebVitals.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'shared': path.resolve(__dirname, './src/shared'),
      'contexts': path.resolve(__dirname, './src/contexts'),
      'pages': path.resolve(__dirname, './src/pages'),
      'lib': path.resolve(__dirname, './src/lib'),
      'icons': path.resolve(__dirname, './src/icons'),
      'assets': path.resolve(__dirname, './src/assets'),
      'environments': path.resolve(__dirname, './src/environments'),
      'routing': path.resolve(__dirname, './src/routing'),
    },
  },
});

