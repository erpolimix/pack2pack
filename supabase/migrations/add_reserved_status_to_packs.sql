-- Update pack status constraint to include 'reserved' state
-- This allows packs to have an intermediate state when they have an active booking

ALTER TABLE packs 
DROP CONSTRAINT IF EXISTS packs_status_check;

ALTER TABLE packs
ADD CONSTRAINT packs_status_check 
CHECK (status IN ('available', 'reserved', 'sold', 'expired', 'archived'));

COMMENT ON COLUMN packs.status IS 'Estado del pack: available (disponible), reserved (reservado), sold (vendido), expired (expirado), archived (archivado)';

-- Update getPacks filter to exclude reserved packs as well
-- (This is just documentation - the actual filter is in the application code)
