class AppError extends Error {
  constructor(status, code, title, detail, errors) {
    super(detail);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.title = title;
    this.errors = errors;
  }
}

module.exports = { AppError };
