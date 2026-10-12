const { AppError } = require("../errors/app-error");
const { createProblemDetails } = require("../utils/problem-details");

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let appError = error;
  if (error?.type === "entity.too.large") {
    appError = new AppError(413, "PAYLOAD_TOO_LARGE", "Payload too large", "The request body exceeds the 100 KB limit.");
  } else if (error?.type === "entity.parse.failed") {
    appError = new AppError(400, "BAD_REQUEST", "Malformed JSON", "The request body contains invalid JSON.");
  } else if (!(error instanceof AppError)) {
    console.error(JSON.stringify({
      requestId: req.requestId,
      error: error?.message || "Unknown error"
    }));
    appError = new AppError(500, "INTERNAL_ERROR", "Internal server error", "An unexpected error occurred.");
  }

  res
    .status(appError.status)
    .type("application/problem+json")
    .json(createProblemDetails({
      status: appError.status,
      code: appError.code,
      title: appError.title,
      detail: appError.message,
      instance: req.originalUrl.split("?")[0],
      errors: appError.errors
    }));
}

module.exports = { errorHandler };
