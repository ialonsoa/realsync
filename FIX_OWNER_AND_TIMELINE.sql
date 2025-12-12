-- Complete Fix: Set owner_id and create timeline events
-- This fixes properties that have NULL owner_id and creates their timeline events

-- Step 1: Check which properties have NULL owner_id
SELECT
  p.id,
  p.address,
  p.district,
  p.agent_id,
  p.owner_id,
  p.created_at
FROM properties p
WHERE p.owner_id IS NULL;

-- Step 2: Set owner_id = agent_id for properties where owner_id is NULL
-- (Assuming the agent is also the owner for these properties)
UPDATE properties
SET owner_id = agent_id
WHERE owner_id IS NULL;

-- Step 3: Verify the update
SELECT
  p.id,
  p.address,
  p.district,
  p.agent_id,
  p.owner_id,
  p.created_at
FROM properties p
WHERE p.address ILIKE '%alfonso%ugarte%' OR p.address ILIKE '%ugarte%';

-- Step 4: Now create the missing timeline events
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
  'La propiedad "' || p.address || COALESCE(', ' || p.district, '') || '" ha sido publicada en el sistema',
  'property_listed',
  'completed',
  COALESCE(up.full_name, 'Usuario'),
  p.created_at
FROM properties p
LEFT JOIN user_profiles up ON up.id = p.owner_id
WHERE p.owner_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM timeline_events te
  WHERE te.property_id = p.id
  AND te.event_type = 'property_listed'
);

-- Step 5: Verify all timeline events were created
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
ORDER BY p.created_at DESC, te.created_at DESC;
