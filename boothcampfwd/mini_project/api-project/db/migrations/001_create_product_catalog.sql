CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL CHECK (length(btrim(name)) > 0),
  brand VARCHAR(80) NOT NULL CHECK (length(btrim(brand)) > 0),
  category VARCHAR(40) NOT NULL CHECK (category ~ '^[a-z0-9-]+$'),
  description TEXT NOT NULL CHECK (length(btrim(description)) > 0),
  price_amount BIGINT NOT NULL CHECK (price_amount BETWEEN 1 AND 100000000000),
  currency CHAR(3) NOT NULL DEFAULT 'IDR' CHECK (currency = 'IDR'),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT,
  alt_text VARCHAR(200) NOT NULL CHECK (length(btrim(alt_text)) > 0),
  sort_order SMALLINT NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT product_images_https_or_placeholder CHECK (
    image_url IS NULL OR image_url ~ '^https://[^[:space:]]+$'
  )
);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(200) NOT NULL UNIQUE CHECK (length(btrim(sku)) > 0),
  variant_name VARCHAR(80) NOT NULL CHECK (length(btrim(variant_name)) > 0),
  size_label VARCHAR(40) NOT NULL,
  size_ml INTEGER NOT NULL CHECK (size_ml BETWEEN 1 AND 10000),
  description VARCHAR(1000) NOT NULL CHECK (length(btrim(description)) > 0),
  notes JSONB NOT NULL CHECK (
    jsonb_typeof(notes) = 'object'
    AND notes - ARRAY['top', 'heart', 'base'] = '{}'::jsonb
    AND notes ?& ARRAY['top', 'heart', 'base']
    AND jsonb_typeof(notes->'top') = 'array'
    AND jsonb_typeof(notes->'heart') = 'array'
    AND jsonb_typeof(notes->'base') = 'array'
    AND jsonb_array_length(notes->'top') BETWEEN 1 AND 12
    AND jsonb_array_length(notes->'heart') BETWEEN 1 AND 12
    AND jsonb_array_length(notes->'base') BETWEEN 1 AND 12
  ),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity BETWEEN 0 AND 1000000),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX product_images_product_order_idx
  ON product_images (product_id, sort_order, id);

CREATE UNIQUE INDEX product_images_one_primary_per_product_idx
  ON product_images (product_id) WHERE is_primary = TRUE;

CREATE INDEX product_variants_product_active_idx
  ON product_variants (product_id, is_active);
