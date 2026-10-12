const { validateProductBody } = require("../validators/product.validator");

function validateProductRequest(req, res, next) {
  try {
    req.validatedBody = validateProductBody(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { validateProductRequest };
