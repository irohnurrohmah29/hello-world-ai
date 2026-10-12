function createProductController(service) {
  return {
    list: async (req, res, next) => {
      try {
        const products = await service.listProducts();
        res.json({
          success: true,
          message: "Products retrieved successfully.",
          data: products,
          meta: { count: products.length }
        });
      } catch (error) {
        next(error);
      }
    },
    get: async (req, res, next) => {
      try {
        const product = await service.getProductById(req.params.id);
        res.json({ success: true, message: "Product retrieved successfully.", data: product, meta: {} });
      } catch (error) {
        next(error);
      }
    },
    create: async (req, res, next) => {
      try {
        const product = await service.createProduct(req.validatedBody);
        res.location(`/api/v1/products/${encodeURIComponent(product.id)}`).status(201).json({
          success: true,
          message: "Product created successfully.",
          data: product,
          meta: {}
        });
      } catch (error) {
        next(error);
      }
    }
  };
}

module.exports = { createProductController };
