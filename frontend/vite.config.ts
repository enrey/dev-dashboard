import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  resolve: {
    alias: {
      // Соответствует baseUrl: "src" из tsconfig.json
      // Поддержка импортов без префикса (как в tsconfig baseUrl: "src")
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
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
