const { AppError } = require("../errors/app-error");

function requireJson(req, res, next) {
  if (!req.is("application/json")) {
    return next(new AppError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Unsupported media type",
      "Content-Type must be application/json."
    ));
  }
  next();
}

module.exports = { requireJson };
