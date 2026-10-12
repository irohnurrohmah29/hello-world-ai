const { randomUUID } = require("node:crypto");

function requestId(req, res, next) {
  req.requestId = randomUUID();
  res.setHeader("X-Request-ID", req.requestId);
  next();
}

module.exports = { requestId };
