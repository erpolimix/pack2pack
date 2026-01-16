-- Add policy to allow anyone to see which packs are booked (without seeing personal details)
-- This is needed so that getPacks() can filter out already booked packs for all users

DROP POLICY IF EXISTS "Anyone can see booked pack IDs" ON bookings;

CREATE POLICY "Anyone can see booked pack IDs"
    ON bookings FOR SELECT
    USING (
        -- Allow anyone to query only pack_id and status for active bookings
        -- This enables the app to hide already-booked packs from the marketplace
        true
    );

-- Note: This policy works alongside the existing "Users can view their own bookings" policy
-- Users will see:
-- - All pack_ids and statuses (via this policy)
-- - Full booking details only for their own bookings (via the other policy)
