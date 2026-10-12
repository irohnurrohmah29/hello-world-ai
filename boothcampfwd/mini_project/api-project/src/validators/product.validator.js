const { z } = require("zod");
const { AppError } = require("../errors/app-error");

const trimmedString = (min, max) => z.string().trim().min(min).max(max);

const productSchema = z.object({
  name: trimmedString(1, 120),
  brand: trimmedString(1, 80),
  category: z.string().trim().min(1).max(40).regex(/^[a-z0-9-]+$/),
  description: trimmedString(1, 2000),
  price: z.object({
    amount: z.number().int().safe().min(1).max(100_000_000_000),
    currency: z.literal("IDR")
  }).strict(),
  images: z.array(z.object({
    url: z.union([
      z.null(),
      z.string().max(2048).url().refine((value) => {
        try {
          const url = new URL(value);
          return url.protocol === "https:" && !url.username && !url.password;
        } catch {
          return false;
        }
      })
    ]),
    alt: trimmedString(1, 200),
    isPrimary: z.boolean()
  }).strict()).min(1).max(8).refine(
    (images) => images.filter((image) => image.isPrimary).length === 1,
    "Exactly one image must be primary."
  ),
  variants: z.array(z.object({
    id: z.string().min(1).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: trimmedString(1, 80),
    attributes: z.object({
      sizeMl: z.number().int().min(1).max(10_000)
    }).strict(),
    description: trimmedString(1, 1000),
    notes: z.object({
      top: z.array(trimmedString(1, 60)).min(1).max(12),
      heart: z.array(trimmedString(1, 60)).min(1).max(12),
      base: z.array(trimmedString(1, 60)).min(1).max(12)
    }).strict(),
    stock: z.number().int().min(0).max(1_000_000)
  }).strict()).min(1).max(20)
}).strict().superRefine((product, context) => {
  const ids = new Set();
  product.variants.forEach((variant, index) => {
    if (ids.has(variant.id)) {
      context.addIssue({
        code: "custom",
        path: ["variants", index, "id"],
        message: "Variant IDs must be unique."
      });
    }
    ids.add(variant.id);
  });
});

function validateProductBody(body) {
  const result = productSchema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join(".") || "body",
      code: issue.code,
      message: issue.message
    }));
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Request validation failed",
      "One or more fields are invalid.",
      errors
    );
  }
  return result.data;
}

module.exports = { productSchema, validateProductBody };
