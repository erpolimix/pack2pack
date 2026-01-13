-- ============================================
-- Fix missing columns and tables in Pack2Pack
-- ============================================

-- Step 1: Add missing columns to packs table
ALTER TABLE packs 
ADD COLUMN IF NOT EXISTS pickup_location TEXT,
ADD COLUMN IF NOT EXISTS pickup_windows JSONB DEFAULT '[]';

-- Step 2: Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Pickup details (from pack's predefined options)
    pickup_code VARCHAR(4) NOT NULL,
    selected_time_window TEXT NOT NULL,
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    
    -- Validation
    validated_by_seller BOOLEAN DEFAULT FALSE,
    validated_by_buyer BOOLEAN DEFAULT FALSE,
    validated_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_active_booking_per_pack UNIQUE (pack_id, buyer_id),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    CONSTRAINT different_buyer_seller CHECK (buyer_id != seller_id)
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_buyer_id ON bookings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_seller_id ON bookings(seller_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pack_id ON bookings(pack_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Step 4: Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Buyers can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their bookings" ON bookings;
DROP POLICY IF EXISTS "Buyers can cancel bookings" ON bookings;

-- Step 6: Create RLS Policies
CREATE POLICY "Users can view their own bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their bookings"
    ON bookings FOR UPDATE
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can cancel bookings"
    ON bookings FOR DELETE
    USING (auth.uid() = buyer_id AND status = 'pending');

-- Step 7: Create or replace trigger function
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_bookings_timestamp ON bookings;
CREATE TRIGGER update_bookings_timestamp
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_bookings_updated_at();

-- Step 9: Add comments for documentation
COMMENT ON COLUMN packs.pickup_location IS 'Dirección o punto de encuentro específico para la recogida (ej: "Calle Mayor 15, portal izquierdo")';
COMMENT ON COLUMN packs.pickup_windows IS 'Array de franjas horarias disponibles para recoger el pack (ej: ["Hoy 18:00-20:00", "Mañana 10:00-12:00", "Sábado 11:00-13:00"])';
COMMENT ON COLUMN bookings.pickup_code IS 'Código de 4 dígitos generado aleatoriamente para validación en la recogida';
COMMENT ON COLUMN bookings.selected_time_window IS 'Franja horaria seleccionada por el comprador (ej: "Hoy 18:00-20:00")';

-- ✅ Schema fix complete!
