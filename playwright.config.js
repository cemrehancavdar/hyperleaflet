import { defineConfig } from '@playwright/test';

const PORT = 4173;
const isDebug = !!process.env.PWDEBUG;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: !isDebug,
    trace: 'on',
    video: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: `npx serve . -l ${PORT}`,
    port: PORT,
    reuseExistingServer: true,
  },
});
