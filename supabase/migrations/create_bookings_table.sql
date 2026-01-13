-- Create bookings table for managing pack reservations
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Pickup details (from pack's predefined options)
    pickup_code VARCHAR(4) NOT NULL,
    selected_time_window TEXT NOT NULL,
    -- Example: "Hoy 18:00-20:00" or "Sábado 11:00-13:00"
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Status values: 'pending', 'confirmed', 'completed', 'cancelled'
    
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

-- Create indexes for performance
CREATE INDEX idx_bookings_buyer_id ON bookings(buyer_id);
CREATE INDEX idx_bookings_seller_id ON bookings(seller_id);
CREATE INDEX idx_bookings_pack_id ON bookings(pack_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own bookings (as buyer or seller)
CREATE POLICY "Users can view their own bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Policy: Buyers can create bookings
CREATE POLICY "Buyers can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

-- Policy: Buyers and sellers can update their own bookings
CREATE POLICY "Users can update their bookings"
    ON bookings FOR UPDATE
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Policy: Buyers can cancel their bookings
CREATE POLICY "Buyers can cancel bookings"
    ON bookings FOR DELETE
    USING (auth.uid() = buyer_id AND status = 'pending');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_bookings_timestamp
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_bookings_updated_at();
