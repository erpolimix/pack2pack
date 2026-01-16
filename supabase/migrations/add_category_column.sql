-- Add category column to packs table
-- This migration adds support for automatic categorization of packs
-- Categories: Alimentos, Libros, Ropa, Juguetes, Hogar, Otro, Sin categoría (default)

ALTER TABLE packs ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Sin categoría';

-- Create an index for faster filtering by category
CREATE INDEX IF NOT EXISTS idx_packs_category ON packs(category);
