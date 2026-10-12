const { z } = require("zod");

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CORS_ORIGIN: z.string().default("http://localhost:5500,http://127.0.0.1:5500")
});

function loadConfig(environment = process.env) {
  const parsed = environmentSchema.safeParse(environment);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid environment configuration: ${missing}`);
  }

  return {
    ...parsed.data,
    corsOrigins: parsed.data.CORS_ORIGIN.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  };
}

module.exports = { loadConfig };
