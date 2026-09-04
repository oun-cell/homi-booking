import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4173/homi-booking/', trace: 'retain-on-failure', channel: 'chrome' },
  webServer: { command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173/homi-booking/', reuseExistingServer: false },
  projects: [
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
  ],
})
