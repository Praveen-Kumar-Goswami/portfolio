import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/portfolio/' : '/',
  server: { host: '127.0.0.1', port: 5173 },
  build: { target: 'es2020' },
});
