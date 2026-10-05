import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.spec.ts",
  use: {
    baseURL: "http://localhost:4329/rehab/",
    viewport: { width: 1920, height: 1080 },
  },
  webServer: {
    command: "npm run build && npx astro preview --port 4329 --ignore-lock",
    url: "http://localhost:4329/rehab/",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
