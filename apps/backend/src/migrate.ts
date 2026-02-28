import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { runMigrations } from "graphile-worker";
import { config } from "./config";
import { pool } from "./db";
import { logger } from "./logger";

async function applyAppMigrations() {
  const migrationsDir = resolve(__dirname, "../migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sqlPath = resolve(migrationsDir, file);
    const sql = readFileSync(sqlPath, "utf8");
    await pool.query(sql);
    logger.info("Applied app migration", { file });
  }
}

async function applyWorkerMigrations() {
  await runMigrations({
    connectionString: config.databaseUrl
  });
  logger.info("Graphile Worker schema applied");
}

async function runAllMigrations() {
  await applyAppMigrations();
  await applyWorkerMigrations();
  logger.info("All migrations applied");
}

runAllMigrations()
  .catch((err) => {
    logger.error("Migration failed", {
      errorMessage: err instanceof Error ? err.message : String(err)
    });
    process.exit(1);
  })
  .finally(() => {
    void pool.end();
  });

