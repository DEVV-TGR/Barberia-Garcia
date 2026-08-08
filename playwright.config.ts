import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./testes",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Os problemas de layout apareceram no Safari do iPhone e os testes só
    // corriam em Chromium — foi a lacuna que os deixou passar.
    { name: "safari-iphone", use: { ...devices["iPhone 14"] } }
  ],
  webServer: {
    command: "npm run build && npx next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
});
