import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
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
  plugins: [react(), tailwindcss(), contentSecurityPolicy()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.{test,spec}.{ts,tsx}', 'src/**/*.d.ts'],
    },
  },
}))
