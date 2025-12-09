-- Insert your Supabase Auth user into the custom users table
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  email_verified,
  is_active
) VALUES (
  '6a1ce55b-53eb-49e3-9a58-38545ca0ef38'::uuid,
  'alonsoincarocan@gmail.com',
  'Alonso',
  'Inca Roca',
  'AGENT',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  email_verified = EXCLUDED.email_verified,
  is_active = EXCLUDED.is_active;

-- Verify the user was inserted
SELECT id, email, first_name, last_name, role FROM users WHERE id = '6a1ce55b-53eb-49e3-9a58-38545ca0ef38';
