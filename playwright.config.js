// @ts-check
const { defineConfig } = require('@playwright/test');
const path = require('path');

/**
 * WebKit: ein Playwright-Browser, kein Firefox-/Chromium-Headless-Shell-Pfad-Chaos.
 * Nach `npm install` läuft postinstall und lädt WebKit passend zur Version.
 *
 * Alternativ System-Chrome (wenn installiert):
 *   PW_CHANNEL=chrome npm run test:e2e
 */
const channel = process.env.PW_CHANNEL;

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  webServer: {
    command: 'node scripts/static-server.mjs',
    cwd: path.dirname(__filename),
    url: 'http://127.0.0.1:8765/index.html',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://127.0.0.1:8765',
    /** Sonst matchMedia('reduce') → video-scrub.js bricht ab, E2E sieht kein Scrub. */
    contextOptions: {
      reducedMotion: 'no-preference',
    },
    ...(channel === 'chrome' ? { channel: 'chrome' } : { browserName: 'webkit' }),
  },
});
