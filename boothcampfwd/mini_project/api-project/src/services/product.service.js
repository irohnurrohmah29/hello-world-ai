const { AppError } = require("../errors/app-error");
const { toProductDto } = require("../models/product.model");
const { slugify } = require("../utils/slug");

class ProductService {
  constructor(repository) {
    this.repository = repository;
  }

  async listProducts() {
    const products = await this.repository.findAll();
    return products.map(toProductDto);
  }

  async getProductById(slug) {
    const product = await this.repository.findBySlug(slug);
    if (!product) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found", "The requested product was not found.");
    }
    return toProductDto(product);
  }

  async createProduct(product) {
    const slug = slugify(product.name);
    try {
      return toProductDto(await this.repository.create(product, slug));
    } catch (error) {
      if (error.code === "23505") {
        throw new AppError(
          409,
          "PRODUCT_ALREADY_EXISTS",
          "Product already exists",
          "A product with this name or variant identifier already exists."
        );
      }
      throw error;
    }
  }
}

module.exports = { ProductService };
