-- Fix Timeline Events for Existing Properties
-- This script creates missing "property_listed" timeline events for properties
-- that were created before the auto-trigger was installed

-- Step 1: Check which properties are missing timeline events
SELECT
  p.id,
  p.title,
  p.user_id,
  p.created_at,
  COUNT(te.id) as event_count
FROM properties p
LEFT JOIN timeline_events te ON te.property_id = p.id AND te.event_type = 'property_listed'
GROUP BY p.id, p.title, p.user_id, p.created_at
HAVING COUNT(te.id) = 0
ORDER BY p.created_at DESC;

-- Step 2: Create missing "property_listed" events for all properties without them
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
  p.user_id,
  p.id,
  'Propiedad publicada',
  'La propiedad "' || p.title || '" ha sido publicada en el sistema',
  'property_listed',
  'completed',
  COALESCE(up.full_name, 'Usuario'),
  p.created_at  -- Use the property's creation date for the event
FROM properties p
LEFT JOIN user_profiles up ON up.id = p.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_events te
  WHERE te.property_id = p.id
  AND te.event_type = 'property_listed'
);

-- Step 3: Verify the fix - show all properties with their timeline event counts
SELECT
  p.id,
  p.title,
  p.address,
  p.created_at as property_created,
  COUNT(te.id) as total_events,
  COUNT(CASE WHEN te.event_type = 'property_listed' THEN 1 END) as listed_events
FROM properties p
LEFT JOIN timeline_events te ON te.property_id = p.id
GROUP BY p.id, p.title, p.address, p.created_at
ORDER BY p.created_at DESC;

-- Step 4: Show the timeline progress for each property
SELECT
  p.id,
  p.title,
  p.address,
  (SELECT current_stage FROM get_property_timeline_progress(p.id)) as current_stage,
  (SELECT completed_stages FROM get_property_timeline_progress(p.id)) as completed_stages,
  (SELECT progress_percentage FROM get_property_timeline_progress(p.id)) as progress_percentage,
  (SELECT total_events FROM get_property_timeline_progress(p.id)) as total_events
FROM properties p
ORDER BY p.created_at DESC;
