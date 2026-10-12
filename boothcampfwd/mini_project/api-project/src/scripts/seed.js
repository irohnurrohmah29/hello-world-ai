require("dotenv").config();
const { loadConfig } = require("../config/env");
const { createPool } = require("../config/database");
const { ProductRepository } = require("../repositories/product.repository");
const { toProductDto } = require("../models/product.model");
const { product, slug } = require("../../data/products.seed");

async function seed() {
  const config = loadConfig();
  const pool = createPool(config.DATABASE_URL);
  const repository = new ProductRepository(pool);
  try {
    if (await repository.hasSlug(slug)) {
      console.log(`Seed skipped; ${slug} already exists.`);
      return;
    }
    const created = await repository.create(product, slug);
    console.log(`Seeded ${toProductDto(created).id}. Price and stock are simulated values.`);
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
});
