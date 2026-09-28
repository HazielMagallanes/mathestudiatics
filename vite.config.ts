import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'
import type { Plugin } from 'vite'

/**
 * GitHub Pages serves this project from https://<user>.github.io/<repo>/.
 * Local dev runs from the root path; preview simulates the deployed base.
 */
const GITHUB_PAGES_BASE = '/mathestudiatics/'

/**
 * Computes CSP hashes for inline scripts so the theme bootstrap can run
 * before first paint without weakening `script-src`.
 */
function inlineScriptHashes(html: string): string[] {
  const hashes: string[] = []
  const scriptPattern = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi

  for (const match of html.matchAll(scriptPattern)) {
    const code = match[1] ?? ''
    hashes.push(`'sha256-${createHash('sha256').update(code).digest('base64')}'`)
  }

  return hashes
}

/**
 * Injects a Content-Security-Policy meta tag into production builds only.
 *
 * Dev builds are intentionally excluded: Vite and React inject inline scripts
 * for HMR, which a strict `script-src` policy would block.
 *
 * `style-src` allows inline styles because KaTeX renders with style attributes.
 * No third-party origins are allowed anywhere (the app is fully self-hosted).
 */
function contentSecurityPolicy(): Plugin {
  return {
    name: 'inject-csp',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html) {
      const scriptSrc = ["'self'", ...inlineScriptHashes(html)].join(' ')
      const policy = [
        "default-src 'self'",
        `script-src ${scriptSrc}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
      ].join('; ')

      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: policy },
          injectTo: 'head-prepend',
        },
      ]
    },
  }
}

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? GITHUB_PAGES_BASE : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Mathestudiatics',
        short_name: 'Mathestudiatics',
        description:
          'Plataforma bilingüe para estudiar matemática: teoría, ejercicios, pizarra y calculadora. / Bilingual platform to study math: theory, exercises, whiteboard and calculator.',
        lang: 'es',
        start_url: './',
        scope: './',
        display: 'standalone',
        theme_color: '#1e2a44',
        background_color: '#fbf9f4',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: `${GITHUB_PAGES_BASE}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
    contentSecurityPolicy(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    testTimeout: 20_000,
    hookTimeout: 20_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.{test,spec}.{ts,tsx}', 'src/**/*.d.ts'],
    },
  },
}))
