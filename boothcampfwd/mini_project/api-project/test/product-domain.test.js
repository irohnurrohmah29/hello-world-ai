const assert = require("node:assert/strict");
const { test } = require("node:test");
const { toProductDto } = require("../src/models/product.model");
const { productSchema } = require("../src/validators/product.validator");
const { ProductRepository } = require("../src/repositories/product.repository");
const { ProductService } = require("../src/services/product.service");
const { product } = require("../data/products.seed");

test("product validation rejects insecure images, missing primary images and duplicate variant IDs", () => {
  assert.equal(productSchema.safeParse(product).success, true);

  const insecureImage = structuredClone(product);
  insecureImage.images[0].url = "http://example.com/image.jpg";
  assert.equal(productSchema.safeParse(insecureImage).success, false);

  const credentialUrl = structuredClone(product);
  credentialUrl.images[0].url = "https://user:password@example.com/image.jpg";
  assert.equal(productSchema.safeParse(credentialUrl).success, false);

  const noPrimary = structuredClone(product);
  noPrimary.images[0].isPrimary = false;
  assert.equal(productSchema.safeParse(noPrimary).success, false);

  const duplicateVariant = structuredClone(product);
  duplicateVariant.variants[1].id = duplicateVariant.variants[0].id;
  assert.equal(productSchema.safeParse(duplicateVariant).success, false);
});

test("availability is derived from active variant stock", () => {
  const dto = toProductDto({
    slug: "sold-out",
    name: "Sold Out",
    brand: "Brand",
    category: "fragrance",
    description: "Description",
    priceAmount: 1000,
    currency: "IDR",
    images: [],
    variants: [{ id: "size-50", name: "Size", sizeMl: 50, description: "Variant", notes: {}, stock: 0 }],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  });
  assert.equal(dto.availability, "out_of_stock");
});

test("a failed variant insert rolls back the complete create transaction", async () => {
  const statements = [];
  let released = false;
  const client = {
    async query(sql) {
      statements.push(sql);
      if (sql.includes("INSERT INTO products")) {
        return { rows: [{
          id: "00000000-0000-0000-0000-000000000001",
          slug: "iqlifar",
          name: product.name,
          brand: product.brand,
          category: product.category,
          description: product.description,
          price_amount: "99000",
          currency: "IDR",
          created_at: new Date("2026-01-01T00:00:00.000Z"),
          updated_at: new Date("2026-01-01T00:00:00.000Z")
        }] };
      }
      if (sql.includes("INSERT INTO product_variants")) throw new Error("simulated insert failure");
      return { rows: [] };
    },
    release() { released = true; }
  };
  const repository = new ProductRepository({ async connect() { return client; } });

  await assert.rejects(repository.create(product, "iqlifar"), /simulated insert failure/);
  assert.equal(statements.includes("BEGIN"), true);
  assert.equal(statements.includes("ROLLBACK"), true);
  assert.equal(statements.includes("COMMIT"), false);
  assert.equal(released, true);
});

test("duplicate product slugs become a stable conflict error", async () => {
  const service = new ProductService({
    async create() {
      const error = new Error("duplicate");
      error.code = "23505";
      throw error;
    }
  });
  await assert.rejects(service.createProduct(product), {
    status: 409,
    code: "PRODUCT_ALREADY_EXISTS"
  });
});
