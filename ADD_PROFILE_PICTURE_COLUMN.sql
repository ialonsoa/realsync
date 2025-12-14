-- Add profile_picture_url column to user_profiles table
-- Run this in Supabase SQL Editor

-- Add column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'profile_picture_url'
  ) THEN
    ALTER TABLE user_profiles
    ADD COLUMN profile_picture_url TEXT;
  END IF;
END $$;

-- Success message
SELECT 'Profile picture column added successfully!' as message;
