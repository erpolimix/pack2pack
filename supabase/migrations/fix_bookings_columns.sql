-- Fix bookings table structure to match application expectations

-- Step 1: Rename pickup_time to selected_time_window 
ALTER TABLE bookings 
RENAME COLUMN pickup_time TO selected_time_window;

-- Step 2: Alter the column type to TEXT if it's not already
ALTER TABLE bookings 
ALTER COLUMN selected_time_window TYPE TEXT;

-- Step 3: Remove pickup_location from bookings (it belongs in packs table)
ALTER TABLE bookings 
DROP COLUMN IF EXISTS pickup_location;

-- Step 4: Ensure packs table has the pickup fields
ALTER TABLE packs 
ADD COLUMN IF NOT EXISTS pickup_location TEXT,
ADD COLUMN IF NOT EXISTS pickup_windows JSONB DEFAULT '[]';

-- Step 5: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_bookings_buyer_id ON bookings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_seller_id ON bookings(seller_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pack_id ON bookings(pack_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN packs.pickup_location IS 'Dirección o punto de encuentro específico para la recogida (ej: "Calle Mayor 15, portal izquierdo")';
COMMENT ON COLUMN packs.pickup_windows IS 'Array de franjas horarias disponibles (ej: ["Hoy 18:00-20:00", "Mañana 10:00-12:00"])';
COMMENT ON COLUMN bookings.pickup_code IS 'Código de 4 dígitos para validación';
COMMENT ON COLUMN bookings.selected_time_window IS 'Franja horaria seleccionada por el comprador (ej: "Hoy 18:00-20:00")';

-- ✅ Schema fixes applied!
