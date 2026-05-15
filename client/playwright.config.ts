import { defineConfig, devices } from '@playwright/test'

const FRONTEND_PORT = 4173
const BACKEND_PORT = 3000
const reuseExistingServer = !process.env.CI

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${FRONTEND_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'yarn start',
      cwd: '..',
      url: `http://127.0.0.1:${BACKEND_PORT}/portfolio`,
      reuseExistingServer,
      timeout: 120 * 1000,
      name: 'backend',
    },
    {
      command: `yarn vite --host 127.0.0.1 --port ${FRONTEND_PORT}`,
      url: `http://127.0.0.1:${FRONTEND_PORT}`,
      reuseExistingServer,
      timeout: 120 * 1000,
      name: 'frontend',
    },
  ],
})
