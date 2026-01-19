-- Migration: Add is_free column to packs table
-- Date: 2026-01-19
-- Description: Add is_free boolean column to mark packs as free/gratuitos
--              Allow users to filter and identify free packs in the feed

-- Add is_free column to packs table
ALTER TABLE packs 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE;

-- Create index for fast filtering by is_free
CREATE INDEX IF NOT EXISTS idx_packs_is_free ON packs (is_free) WHERE is_free = true;

-- Comments for documentation
COMMENT ON COLUMN packs.is_free IS 'Boolean flag to indicate if the pack is free (true) or requires payment (false)';
