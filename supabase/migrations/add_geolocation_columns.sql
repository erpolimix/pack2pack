-- Migration: Add geolocation columns to packs table
-- Date: 2024
-- Description: Add latitude, longitude, city, postal_code, and neighborhood columns
--              to enable distance-based pack filtering using OpenStreetMap Nominatim API

-- Add geolocation columns to packs table
ALTER TABLE packs 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100);

-- Create index for geolocation queries (improves performance on distance calculations)
CREATE INDEX IF NOT EXISTS idx_packs_location ON packs (latitude, longitude);

-- Add geolocation columns to profiles table (optional - for user location persistence)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Comments for documentation
COMMENT ON COLUMN packs.latitude IS 'Pack seller location latitude (WGS84)';
COMMENT ON COLUMN packs.longitude IS 'Pack seller location longitude (WGS84)';
COMMENT ON COLUMN packs.city IS 'Pack seller city (e.g., Madrid, Barcelona)';
COMMENT ON COLUMN packs.postal_code IS 'Pack seller postal code (e.g., 28001)';
COMMENT ON COLUMN packs.neighborhood IS 'Pack seller neighborhood (e.g., Malasaña, Eixample)';

COMMENT ON COLUMN profiles.latitude IS 'User preferred location latitude';
COMMENT ON COLUMN profiles.longitude IS 'User preferred location longitude';
COMMENT ON COLUMN profiles.city IS 'User preferred city';
