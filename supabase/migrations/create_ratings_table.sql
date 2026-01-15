-- Create ratings table for user reviews and feedback
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Booking reference (one rating per booking)
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Rating details
    rated_by_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,  -- Buyer (always the one who rates)
    rated_to_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,   -- Seller (always rated by buyer)
    
    -- Rating content
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,  -- Optional detailed comment/review
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT different_rater_ratee CHECK (rated_by_id != rated_to_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ratings_rated_to_id ON ratings(rated_to_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated_by_id ON ratings(rated_by_id);
CREATE INDEX IF NOT EXISTS idx_ratings_booking_id ON ratings(booking_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at);

-- Enable Row Level Security
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all ratings for a user (public profile)
CREATE POLICY "Ratings are publicly visible"
    ON ratings FOR SELECT
    USING (true);

-- Policy: Only the buyer can create a rating (after they complete the booking)
CREATE POLICY "Buyers can create ratings for sellers"
    ON ratings FOR INSERT
    WITH CHECK (auth.uid() = rated_by_id);

-- Policy: Only the creator can update or delete their own rating
CREATE POLICY "Users can only update their own ratings"
    ON ratings FOR UPDATE
    USING (auth.uid() = rated_by_id);

CREATE POLICY "Users can only delete their own ratings"
    ON ratings FOR DELETE
    USING (auth.uid() = rated_by_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_ratings_timestamp ON ratings;
CREATE TRIGGER update_ratings_timestamp
    BEFORE UPDATE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_ratings_updated_at();

-- Add comments for documentation
COMMENT ON TABLE ratings IS 'User ratings and reviews for completed bookings. One rating per booking.';
COMMENT ON COLUMN ratings.rating IS 'Star rating from 1 to 5';
COMMENT ON COLUMN ratings.comment IS 'Optional detailed comment or review text';
COMMENT ON COLUMN ratings.booking_id IS 'Reference to the completed booking (UNIQUE - one rating per booking)';
