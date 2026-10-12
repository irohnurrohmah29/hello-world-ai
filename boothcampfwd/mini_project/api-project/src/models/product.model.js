function toProductDto(product) {
  const variants = product.variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    attributes: { sizeMl: variant.sizeMl },
    description: variant.description,
    notes: variant.notes,
    stock: variant.stock
  }));

  return {
    id: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description,
    price: { amount: product.priceAmount, currency: product.currency },
    images: product.images.map((image) => ({
      url: image.url,
      alt: image.alt,
      isPrimary: image.isPrimary
    })),
    variants,
    availability: variants.some((variant) => variant.stock > 0) ? "in_stock" : "out_of_stock",
    createdAt: new Date(product.createdAt).toISOString(),
    updatedAt: new Date(product.updatedAt).toISOString()
  };
}

module.exports = { toProductDto };
