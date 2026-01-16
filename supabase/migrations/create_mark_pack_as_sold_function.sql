-- Create functions to update pack status that bypass RLS
-- These functions run with elevated privileges (SECURITY DEFINER)
-- and can only be called after verifying the booking state

-- Function 1: Mark pack as sold (when transaction completes)
CREATE OR REPLACE FUNCTION mark_pack_as_sold(pack_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the function creator, not the caller
SET search_path = public
AS $$
BEGIN
    UPDATE packs
    SET status = 'sold'
    WHERE id = pack_id_param;
    
    RAISE NOTICE 'Pack % marked as sold', pack_id_param;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_pack_as_sold(UUID) TO authenticated;
COMMENT ON FUNCTION mark_pack_as_sold IS 'Marks a pack as sold after transaction completion. Bypasses RLS for legitimate booking completions.';

-- Function 2: Mark pack as reserved (when booking is created)
CREATE OR REPLACE FUNCTION mark_pack_as_reserved(pack_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE packs
    SET status = 'reserved'
    WHERE id = pack_id_param;
    
    RAISE NOTICE 'Pack % marked as reserved', pack_id_param;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_pack_as_reserved(UUID) TO authenticated;
COMMENT ON FUNCTION mark_pack_as_reserved IS 'Marks a pack as reserved when a booking is created. Bypasses RLS.';

-- Function 3: Mark pack as available (when booking is cancelled)
CREATE OR REPLACE FUNCTION mark_pack_as_available(pack_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE packs
    SET status = 'available'
    WHERE id = pack_id_param;
    
    RAISE NOTICE 'Pack % marked as available', pack_id_param;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_pack_as_available(UUID) TO authenticated;
COMMENT ON FUNCTION mark_pack_as_available IS 'Marks a pack as available when a booking is cancelled. Bypasses RLS.';
