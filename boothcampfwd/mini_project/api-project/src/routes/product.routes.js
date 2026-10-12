const express = require("express");
const { requireJson } = require("../middlewares/require-json");
const { validateProductRequest } = require("../middlewares/validate-request");
const { createProductController } = require("../controllers/product.controller");

function createProductRouter(service) {
  const router = express.Router();
  const controller = createProductController(service);
  router.get("/", controller.list);
  router.get("/:id", controller.get);
  router.post("/", requireJson, validateProductRequest, controller.create);
  return router;
}

module.exports = { createProductRouter };
