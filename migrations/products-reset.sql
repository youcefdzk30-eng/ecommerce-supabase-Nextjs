-- Rebuild products catalog from scratch.
-- IMPORTANT: this will delete current products and categories data.
-- Backup first if you need to preserve existing inventory.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

CREATE TABLE public.categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  parent_id integer REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  product_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  sku text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  price_before numeric(12,2),
  image text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  colors text[] NOT NULL DEFAULT ARRAY[]::text[],
  stock integer NOT NULL DEFAULT 0,
  category_id integer REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_title ON public.products (title);
CREATE INDEX idx_products_category_id ON public.products (category_id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access for storefront
CREATE POLICY "categories_read_public"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "products_read_public"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage products (simple immediate setup)
CREATE POLICY "categories_manage_authenticated"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "products_manage_authenticated"
  ON public.products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO public.categories (name, slug, description) VALUES
('Clothing', 'clothing', 'Apparel and garments'),
('Accessories', 'accessories', 'Bags, belts, hats'),
('Footwear', 'footwear', 'Shoes and sandals');

INSERT INTO public.products (
  title,
  description,
  sku,
  price,
  price_before,
  image,
  images,
  colors,
  stock,
  category_id
)
VALUES
(
  'Classic Tee',
  'Comfortable cotton tee designed for everyday wear. Soft texture, breathable fabric, and modern fit.',
  'TEE-001',
  19.99,
  29.99,
  'https://placehold.co/600x600?text=Classic+Tee',
  '["https://placehold.co/1200x1200?text=Classic+Tee+1","https://placehold.co/1200x1200?text=Classic+Tee+2","https://placehold.co/1200x1200?text=Classic+Tee+3"]',
  ARRAY['Red', 'Blue', 'Black', 'White'],
  120,
  1
),
(
  'Everyday Backpack',
  'Durable backpack with multiple compartments and padded straps for daily commuting.',
  'BAG-001',
  59.99,
  79.99,
  'https://placehold.co/600x600?text=Backpack',
  '["https://placehold.co/1200x1200?text=Backpack+1","https://placehold.co/1200x1200?text=Backpack+2"]',
  ARRAY['Black', 'Olive'],
  45,
  2
),
(
  'Urban Runner',
  'Lightweight sneaker built for comfort, cushion, and everyday movement.',
  'SHOE-001',
  89.99,
  119.99,
  'https://placehold.co/600x600?text=Urban+Runner',
  '["https://placehold.co/1200x1200?text=Urban+Runner+1","https://placehold.co/1200x1200?text=Urban+Runner+2"]',
  ARRAY['White', 'Gray', 'Navy'],
  60,
  3
);

GRANT SELECT ON public.products TO public;
GRANT SELECT ON public.categories TO public;
