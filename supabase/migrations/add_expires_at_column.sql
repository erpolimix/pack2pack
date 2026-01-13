-- Add expiresAt column to packs table
-- This column stores when the pack offer expires

ALTER TABLE packs 
ADD COLUMN expires_at TIMESTAMPTZ;

-- Add a comment to document the column
COMMENT ON COLUMN packs.expires_at IS 'Timestamp when the pack offer expires and should no longer be available';

-- Optional: Add an index for efficient querying of active packs
CREATE INDEX idx_packs_expires_at ON packs(expires_at) WHERE expires_at IS NOT NULL;
