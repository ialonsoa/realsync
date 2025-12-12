-- MANUAL FIX: Create missing timeline events for "alfonso ugarte" property
-- Run this directly in your Supabase SQL Editor

-- Step 1: Check current state (see what's missing)
SELECT
  p.id,
  p.title,
  p.address,
  p.created_at,
  COUNT(te.id) as event_count,
  COUNT(CASE WHEN te.event_type = 'property_listed' THEN 1 END) as has_listed_event
FROM properties p
LEFT JOIN timeline_events te ON te.property_id = p.id
WHERE p.title ILIKE '%alfonso ugarte%'
GROUP BY p.id, p.title, p.address, p.created_at;

-- Step 2: Create the missing "Propiedad publicada" event
-- This will create the event for alfonso ugarte property
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
  'La propiedad "' || p.title || '" ha sido publicada en el sistema',
  'property_listed',
  'completed',
  COALESCE(up.full_name, 'Usuario'),
  p.created_at  -- Use property's creation date
FROM properties p
LEFT JOIN user_profiles up ON up.id = p.owner_id
WHERE p.title ILIKE '%alfonso ugarte%'
AND NOT EXISTS (
  SELECT 1 FROM timeline_events te
  WHERE te.property_id = p.id
  AND te.event_type = 'property_listed'
);

-- Step 3: Verify the fix
SELECT
  p.title,
  p.address,
  te.title as event_title,
  te.event_type,
  te.status,
  te.created_at
FROM properties p
LEFT JOIN timeline_events te ON te.property_id = p.id
WHERE p.title ILIKE '%alfonso ugarte%'
ORDER BY te.created_at DESC;

-- Step 4: Check the progress calculation
SELECT
  p.title,
  (SELECT current_stage FROM get_property_timeline_progress(p.id)) as current_stage,
  (SELECT completed_stages FROM get_property_timeline_progress(p.id)) as completed_stages,
  (SELECT progress_percentage FROM get_property_timeline_progress(p.id)) as progress_percentage
FROM properties p
WHERE p.title ILIKE '%alfonso ugarte%';
