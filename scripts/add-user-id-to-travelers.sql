-- Add user_id column to travelers table to link with auth.users
ALTER TABLE travelers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_travelers_user_id ON travelers(user_id);

-- Update existing travelers: link the trip owner to their traveler entry if names match
-- This is a one-time migration to connect existing data
UPDATE travelers t
SET user_id = trips.owner_id
FROM trips
WHERE t.trip_id = trips.id
  AND t.user_id IS NULL
  AND LOWER(t.name) = (
    SELECT LOWER(COALESCE(raw_user_meta_data->>'name', email))
    FROM auth.users
    WHERE id = trips.owner_id
  );
