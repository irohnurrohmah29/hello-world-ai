function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();
  const requestPath = req.path;
  res.once("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    console.log(JSON.stringify({
      requestId: req.requestId,
      method: req.method,
      route: requestPath,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2))
    }));
  });
  next();
}

module.exports = { requestLogger };
