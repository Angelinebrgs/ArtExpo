/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
  // Vitest réutilise la configuration Vite existante : pas de second
  // outillage à maintenir (voir dossier §9.1).
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // L'URL d'API des tests ne dépend d'aucun fichier .env local.
    env: { VITE_API_URL: 'http://localhost:1337/api' },
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/services/**', 'src/components/**'],
      exclude: ['src/components/ui/**', 'src/components/layout/**', 'src/**/*.test.{ts,tsx}'],
      // Objectif de qualité du dossier (§4.5) : ≥ 70 % sur les composants métier.
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
