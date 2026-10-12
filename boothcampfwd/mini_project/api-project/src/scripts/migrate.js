require("dotenv").config();
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { loadConfig } = require("../config/env");
const { createPool } = require("../config/database");

async function migrate() {
  const config = loadConfig();
  const pool = createPool(config.DATABASE_URL);
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [742119202]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        checksum CHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const directory = path.join(__dirname, "..", "..", "db", "migrations");
    const files = (await fs.readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
    for (const name of files) {
      const sql = await fs.readFile(path.join(directory, name), "utf8");
      const checksum = crypto.createHash("sha256").update(sql).digest("hex");
      const applied = await client.query("SELECT checksum FROM schema_migrations WHERE name = $1", [name]);
      if (applied.rowCount) {
        if (applied.rows[0].checksum.trim() !== checksum) {
          throw new Error(`Applied migration was modified: ${name}`);
        }
        continue;
      }
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)", [name, checksum]);
        await client.query("COMMIT");
        console.log(`Applied migration ${name}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1)", [742119202]);
    } finally {
      client.release();
      await pool.end();
    }
  }
}

migrate().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
});
