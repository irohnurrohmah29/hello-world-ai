const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { createApp } = require("../src/app");

const validProduct = {
  name: "Example Fragrance",
  brand: "Example Brand",
  category: "fragrance",
  description: "A plain-text fragrance description.",
  price: { amount: 99000, currency: "IDR" },
  images: [{ url: null, alt: "Concept placeholder", isPrimary: true }],
  variants: [{
    id: "example-50",
    name: "Example",
    attributes: { sizeMl: 50 },
    description: "A variant description.",
    notes: { top: ["Bergamot"], heart: ["Jasmine"], base: ["Musk"] },
    stock: 10
  }]
};

let server;
let baseUrl;
let createCalls = 0;

before(async () => {
  const product = {
    id: "example-fragrance",
    name: validProduct.name,
    brand: validProduct.brand,
    category: validProduct.category,
    description: validProduct.description,
    price: validProduct.price,
    images: validProduct.images,
    variants: validProduct.variants,
    availability: "in_stock",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
  const app = createApp({
    config: { corsOrigins: ["http://localhost:5500"] },
    productService: {
      async listProducts() { return [product]; },
      async getProductById(id) {
        if (id !== product.id) {
          const { AppError } = require("../src/errors/app-error");
          throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found", "The requested product was not found.");
        }
        return product;
      },
      async createProduct(input) {
        createCalls += 1;
        assert.equal(input.name, "Example Fragrance");
        return product;
      }
    }
  });
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("list and detail return product envelopes and slug lookup", async () => {
  const listResponse = await fetch(`${baseUrl}/api/v1/products`);
  const list = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.equal(list.meta.count, 1);
  assert.equal(list.data[0].id, "example-fragrance");

  const detailResponse = await fetch(`${baseUrl}/api/v1/products/example-fragrance`);
  assert.equal(detailResponse.status, 200);
  assert.equal((await detailResponse.json()).data.id, "example-fragrance");
});

test("valid create returns 201 and Location", async () => {
  const response = await fetch(`${baseUrl}/api/v1/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validProduct)
  });
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("location"), "/api/v1/products/example-fragrance");
  assert.equal((await response.json()).data.id, "example-fragrance");
  assert.equal(createCalls, 1);
});

test("invalid payload is rejected before the service and uses Problem Details", async () => {
  const response = await fetch(`${baseUrl}/api/v1/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validProduct, admin: true })
  });
  const problem = await response.json();
  assert.equal(response.status, 400);
  assert.match(response.headers.get("content-type"), /application\/problem\+json/);
  assert.equal(problem.code, "VALIDATION_ERROR");
  assert.equal(problem.status, response.status);
  assert.equal(createCalls, 1);
});

test("malformed JSON, unsupported media type, oversized body and missing slug are handled", async () => {
  const malformed = await fetch(`${baseUrl}/api/v1/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{"
  });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).code, "BAD_REQUEST");

  for (const body of ["", "null", "[]"]) {
    const nonObject = await fetch(`${baseUrl}/api/v1/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    });
    assert.equal(nonObject.status, 400);
    assert.equal((await nonObject.json()).code, "VALIDATION_ERROR");
  }

  const unsupported = await fetch(`${baseUrl}/api/v1/products`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "not json"
  });
  assert.equal(unsupported.status, 415);
  assert.equal((await unsupported.json()).code, "UNSUPPORTED_MEDIA_TYPE");

  const oversized = await fetch(`${baseUrl}/api/v1/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: "x".repeat(110 * 1024) })
  });
  assert.equal(oversized.status, 413);
  assert.equal((await oversized.json()).code, "PAYLOAD_TOO_LARGE");

  const missing = await fetch(`${baseUrl}/api/v1/products/not-found`);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).code, "PRODUCT_NOT_FOUND");
});

test("health and OpenAPI are served", async () => {
  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200);
  const swagger = await fetch(`${baseUrl}/api-docs`);
  assert.equal(swagger.status, 200);
  assert.match(swagger.headers.get("content-type"), /text\/html/);
  const spec = await fetch(`${baseUrl}/api-docs/openapi.yaml`);
  assert.equal(spec.status, 200);
  assert.match(await spec.text(), /openapi: 3\.1\.0/);
});

test("CORS rejects origins outside the allowlist with Problem Details", async () => {
  const response = await fetch(`${baseUrl}/api/v1/products`, {
    headers: { Origin: "https://untrusted.example" }
  });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, "CORS_ORIGIN_DENIED");
});
