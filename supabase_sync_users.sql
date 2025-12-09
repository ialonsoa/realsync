-- First, let's see what users exist in Supabase Auth
SELECT
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users;

-- After running the above query, you'll see your user ID and email
-- Then use that information in the INSERT below

-- Insert your auth user into the custom users table
-- REPLACE 'your-user-id-here' with your actual user ID from the query above
-- REPLACE 'your-email@example.com' with your actual email
-- REPLACE 'Your First Name' and 'Your Last Name' with your actual name

/*
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  email_verified,
  is_active
) VALUES (
  'your-user-id-here'::uuid,  -- Replace with your actual user ID
  'your-email@example.com',    -- Replace with your actual email
  'Your First Name',           -- Replace with your first name
  'Your Last Name',            -- Replace with your last name
  'AGENT',                     -- Your role (AGENT, OWNER, BUYER, etc.)
  true,
  true
) ON CONFLICT (id) DO NOTHING;
*/
