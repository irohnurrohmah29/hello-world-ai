const { AppError } = require("../errors/app-error");

function notFound(req, res, next) {
  next(new AppError(404, "NOT_FOUND", "Resource not found", "The requested resource was not found."));
}

module.exports = { notFound };
