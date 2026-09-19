import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: 'tests/browser',
  use: {
    baseURL: 'http://127.0.0.1:9877',
    headless: true,
    launchOptions: process.env.ORO_BROWSER_EXECUTABLE
      ? { executablePath: process.env.ORO_BROWSER_EXECUTABLE }
      : {},
  },
  webServer: {
    command: 'node tools/serve-output.ts',
    url: 'http://127.0.0.1:9877',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
})
