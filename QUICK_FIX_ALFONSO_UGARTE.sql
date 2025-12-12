-- QUICK FIX: Create timeline event for alfonso ugarte property
-- This uses the correct column names from your actual properties table

-- Step 1: Check current state
SELECT
  p.id,
  p.address,
  p.district,
  p.city,
  p.created_at,
  COUNT(te.id) as event_count,
  COUNT(CASE WHEN te.event_type = 'property_listed' THEN 1 END) as has_listed_event
FROM properties p
LEFT JOIN timeline_events te ON te.property_id = p.id
WHERE p.address ILIKE '%alfonso%ugarte%' OR p.address ILIKE '%ugarte%'
GROUP BY p.id, p.address, p.district, p.city, p.created_at;

-- Step 2: Create the missing "Propiedad publicada" event
INSERT INTO timeline_events (
  user_id,
  property_id,
  title,
  description,
  event_type,
  status,
  created_by_name,
  created_at
)
SELECT
  p.owner_id,
  p.id,
  'Propiedad publicada',
  'La propiedad "' || p.address || ', ' || p.district || '" ha sido publicada en el sistema',
  'property_listed',
  'completed',
  COALESCE(up.full_name, 'Usuario'),
  p.created_at
FROM properties p
LEFT JOIN user_profiles up ON up.id = p.owner_id
WHERE (p.address ILIKE '%alfonso%ugarte%' OR p.address ILIKE '%ugarte%')
AND NOT EXISTS (
  SELECT 1 FROM timeline_events te
  WHERE te.property_id = p.id
  AND te.event_type = 'property_listed'
);

-- Step 3: Verify the fix
SELECT
  p.address,
  p.district,
  p.city,
  te.title as event_title,
  te.event_type,
  te.status,
  te.created_at
FROM properties p
LEFT JOIN timeline_events te ON te.property_id = p.id
WHERE p.address ILIKE '%alfonso%ugarte%' OR p.address ILIKE '%ugarte%'
ORDER BY te.created_at DESC;
