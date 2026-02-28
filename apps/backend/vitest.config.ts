import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgres://user:password@localhost:5432/test",
      PORT: "4000",
      NODE_ENV: "test"
    }
  }
});

