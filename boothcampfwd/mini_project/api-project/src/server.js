require("dotenv").config();
const { loadConfig } = require("./config/env");
const { createPool } = require("./config/database");
const { createApp } = require("./app");

async function start() {
  const config = loadConfig();
  const pool = createPool(config.DATABASE_URL);
  await pool.query("SELECT 1");
  const server = createApp({ pool, config }).listen(config.PORT, () => {
    console.log(`Product Catalog API listening on port ${config.PORT}`);
  });

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`Received ${signal}; shutting down.`);
    server.close(async (error) => {
      try {
        await pool.end();
      } catch (closeError) {
        console.error("Failed to close database pool.", closeError.message);
        process.exitCode = 1;
      }
      if (error) {
        console.error("Failed to close HTTP server.", error.message);
        process.exitCode = 1;
      }
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error) => {
  console.error("API startup failed:", error.message);
  process.exitCode = 1;
});
