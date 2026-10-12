function mapProduct(row, images, variants) {
  return {
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    description: row.description,
    priceAmount: Number(row.price_amount),
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images: images.map((image) => ({
      url: image.image_url,
      alt: image.alt_text,
      isPrimary: image.is_primary
    })),
    variants: variants.map((variant) => ({
      id: variant.sku.startsWith(`${row.slug}-`) ? variant.sku.slice(row.slug.length + 1) : variant.sku,
      name: variant.variant_name,
      sizeMl: variant.size_ml,
      description: variant.description,
      notes: variant.notes,
      stock: variant.stock_quantity
    }))
  };
}

class ProductRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll() {
    const { rows } = await this.pool.query(
      `SELECT id, slug, name, brand, category, description, price_amount,
              currency, created_at, updated_at
       FROM products WHERE is_active = TRUE ORDER BY name, slug`
    );
    return this.loadRelations(rows);
  }

  async findBySlug(slug) {
    const { rows } = await this.pool.query(
      `SELECT id, slug, name, brand, category, description, price_amount,
              currency, created_at, updated_at
       FROM products WHERE slug = $1 AND is_active = TRUE`,
      [slug]
    );
    const [product] = await this.loadRelations(rows);
    return product || null;
  }

  async hasSlug(slug) {
    const { rowCount } = await this.pool.query("SELECT 1 FROM products WHERE slug = $1", [slug]);
    return rowCount > 0;
  }

  async loadRelations(rows) {
    if (!rows.length) return [];
    const ids = rows.map((row) => row.id);
    const [imageResult, variantResult] = await Promise.all([
      this.pool.query(
        `SELECT product_id, image_url, alt_text, is_primary
         FROM product_images WHERE product_id = ANY($1::uuid[])
         ORDER BY product_id, sort_order, id`,
        [ids]
      ),
      this.pool.query(
        `SELECT product_id, sku, variant_name, size_ml, description, notes, stock_quantity
         FROM product_variants WHERE product_id = ANY($1::uuid[]) AND is_active = TRUE
         ORDER BY product_id, variant_name, size_ml`,
        [ids]
      )
    ]);
    return rows.map((row) => mapProduct(
      row,
      imageResult.rows.filter((image) => image.product_id === row.id),
      variantResult.rows
        .filter((variant) => variant.product_id === row.id)
        .map((variant) => ({ ...variant, stock_quantity: Number(variant.stock_quantity) }))
    ));
  }

  async create(product, slug) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const inserted = await client.query(
        `INSERT INTO products (slug, name, brand, category, description, price_amount, currency)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, slug, name, brand, category, description, price_amount,
                   currency, created_at, updated_at`,
        [slug, product.name, product.brand, product.category, product.description,
          product.price.amount, product.price.currency]
      );
      const row = inserted.rows[0];

      for (const [sortOrder, image] of product.images.entries()) {
        await client.query(
          `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
           VALUES ($1, $2, $3, $4, $5)`,
          [row.id, image.url, image.alt, sortOrder, image.isPrimary]
        );
      }
      for (const variant of product.variants) {
        await client.query(
          `INSERT INTO product_variants
             (product_id, sku, variant_name, size_label, size_ml, description, notes, stock_quantity)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)`,
          [row.id, `${slug}-${variant.id}`, variant.name, `${variant.attributes.sizeMl} ml`,
            variant.attributes.sizeMl, variant.description, JSON.stringify(variant.notes), variant.stock]
        );
      }

      await client.query("COMMIT");
      const images = product.images.map((image) => ({
        image_url: image.url, alt_text: image.alt, is_primary: image.isPrimary
      }));
      const variants = product.variants.map((variant) => ({
        sku: `${slug}-${variant.id}`, variant_name: variant.name, size_ml: variant.attributes.sizeMl,
        description: variant.description, notes: variant.notes, stock_quantity: variant.stock
      }));
      return mapProduct(row, images, variants);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = { ProductRepository };
