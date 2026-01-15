-- Add status field to packs table
ALTER TABLE packs 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available' 
CHECK (status IN ('available', 'sold', 'expired', 'archived'));

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_packs_status ON packs(status);
CREATE INDEX IF NOT EXISTS idx_packs_seller_status ON packs(seller_id, status);

-- Comment for documentation
COMMENT ON COLUMN packs.status IS 'Estado del pack: available (disponible), sold (vendido/comprado), expired (expirado), archived (archivado)';
