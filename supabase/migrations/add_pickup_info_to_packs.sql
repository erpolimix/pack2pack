-- Add pickup location and time windows to packs table
ALTER TABLE packs 
ADD COLUMN IF NOT EXISTS pickup_location TEXT,
ADD COLUMN IF NOT EXISTS pickup_windows JSONB DEFAULT '[]';

-- Update existing packs with default values
UPDATE packs 
SET pickup_location = location,
    pickup_windows = '["Hoy 18:00-20:00", "Mañana 10:00-12:00"]'
WHERE pickup_location IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN packs.pickup_location IS 'Dirección o punto de encuentro específico para la recogida (ej: "Calle Mayor 15, portal izquierdo")';
COMMENT ON COLUMN packs.pickup_windows IS 'Array de franjas horarias disponibles para recoger el pack (ej: ["Hoy 18:00-20:00", "Mañana 10:00-12:00", "Sábado 11:00-13:00"])';
