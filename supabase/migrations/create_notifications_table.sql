-- Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata for different notification types
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT valid_notification_type CHECK (
        type IN (
            'booking_created',
            'booking_validated_seller',
            'booking_validated_buyer',
            'booking_completed',
            'booking_cancelled',
            'rating_received',
            'pack_sold'
        )
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read, created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Add comments
COMMENT ON TABLE notifications IS 'In-app notifications for users about bookings, ratings, and transactions';
COMMENT ON COLUMN notifications.type IS 'Type of notification: booking_created, booking_validated_seller, booking_validated_buyer, booking_completed, booking_cancelled, rating_received, pack_sold';
COMMENT ON COLUMN notifications.metadata IS 'Additional data like pack_id, booking_id, rating_id in JSON format';
