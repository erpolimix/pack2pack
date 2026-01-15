-- Fix dietary_preference check constraint to accept all valid values
-- Drop the existing check constraint if it exists and recreate it with proper values

-- First drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_dietary_preference_check;

-- Add the new check constraint that accepts all dietary preference values
ALTER TABLE profiles 
ADD CONSTRAINT profiles_dietary_preference_check 
CHECK (dietary_preference IN ('omnivore', 'vegetarian', 'vegan', 'gluten-free', 'unspecified') OR dietary_preference IS NULL);
