-- Enable Row Level Security on packs table
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Packs are publicly visible" ON packs;
DROP POLICY IF EXISTS "Users can insert packs" ON packs;
DROP POLICY IF EXISTS "Users can update their own packs" ON packs;
DROP POLICY IF EXISTS "Users can delete their own packs" ON packs;

-- Policy 1: Anyone can read/view packs
CREATE POLICY "Packs are publicly visible"
    ON packs FOR SELECT
    USING (true);

-- Policy 2: Authenticated users can create packs
CREATE POLICY "Users can insert packs"
    ON packs FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

-- Policy 3: Users can only update their own packs
CREATE POLICY "Users can update their own packs"
    ON packs FOR UPDATE
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

-- Policy 4: Users can only delete their own packs
CREATE POLICY "Users can delete their own packs"
    ON packs FOR DELETE
    USING (auth.uid() = seller_id);
