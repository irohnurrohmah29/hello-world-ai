const path = require("node:path");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("node:fs");
const { createProductRouter } = require("./routes/product.routes");
const { requestId } = require("./middlewares/request-id");
const { requestLogger } = require("./middlewares/request-logger");
const { notFound } = require("./middlewares/not-found");
const { errorHandler } = require("./middlewares/error-handler");
const { AppError } = require("./errors/app-error");
const { ProductRepository } = require("./repositories/product.repository");
const { ProductService } = require("./services/product.service");

function createApp({ pool, config, productService }) {
  const app = express();
  app.disable("x-powered-by");
  app.use(requestId);
  app.use(requestLogger);
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new AppError(403, "CORS_ORIGIN_DENIED", "Origin not allowed", "This origin is not allowed."));
    }
  }));
  app.use(express.json({ limit: "100kb", strict: false }));
  app.get("/health", (req, res) => res.json({ success: true, message: "API is healthy.", data: { status: "ok" }, meta: {} }));

  const openApiPath = path.join(__dirname, "..", "docs", "openapi.yaml");
  const openApi = YAML.parse(fs.readFileSync(openApiPath, "utf8"));
  app.get("/api-docs/openapi.yaml", (req, res) => res.type("application/yaml").sendFile(openApiPath));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApi, {
    swaggerOptions: { url: "/api-docs/openapi.yaml" }
  }));
  const service = productService || new ProductService(new ProductRepository(pool));
  app.use("/api/v1/products", createProductRouter(service));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
