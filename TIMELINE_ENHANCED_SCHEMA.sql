-- Enhanced Timeline Events Schema for Peru Real Estate Transactions
-- This updates the existing timeline_events table to support all Peru-specific transaction stages

-- Drop the existing constraint on event_type
ALTER TABLE timeline_events DROP CONSTRAINT IF EXISTS timeline_events_event_type_check;

-- Add new event_type constraint with all Peru-specific types
ALTER TABLE timeline_events ADD CONSTRAINT timeline_events_event_type_check CHECK (event_type IN (
  -- Property Listing Stage
  'property_listed',
  'property_updated',
  'property_photos_added',

  -- Initial Interest Stage
  'visit_scheduled',
  'visit_completed',
  'inquiry_received',

  -- Offer/Negotiation Stage
  'offer_made',
  'offer_accepted',
  'offer_rejected',
  'counter_offer_made',

  -- Arras/Deposit Stage (Peru-specific)
  'arras_contract_signed',
  'arras_payment_received',
  'arras_payment_confirmed',

  -- Document Verification Stage
  'documents_uploaded',
  'documents_verified',
  'documents_rejected',
  'document_signed',

  -- Due Diligence Stage
  'inspection_scheduled',
  'inspection_completed',
  'valuation_ordered',
  'valuation_completed',

  -- Financing Stage
  'financing_applied',
  'financing_approved',
  'financing_rejected',

  -- Escritura Pública Stage (Peru Public Deed)
  'notary_scheduled',
  'escritura_signed',
  'escritura_completed',

  -- SUNARP Registration Stage
  'sunarp_submission',
  'sunarp_in_progress',
  'sunarp_completed',

  -- Final Stage
  'keys_delivered',
  'transaction_completed',

  -- Other
  'note_added',
  'status_changed'
));

-- Add metadata column if it doesn't exist (for storing additional event data)
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add created_by_name column for better display (stores user's name at time of creation)
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS created_by_name TEXT;

-- Create index on metadata for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_timeline_metadata ON timeline_events USING GIN (metadata);

-- Create index on event_type for filtering
CREATE INDEX IF NOT EXISTS idx_timeline_event_type ON timeline_events(event_type);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_timeline_status ON timeline_events(status);

-- Add cancelled status to the status constraint
ALTER TABLE timeline_events DROP CONSTRAINT IF EXISTS timeline_events_status_check;
ALTER TABLE timeline_events ADD CONSTRAINT timeline_events_status_check CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'));

-- Update RLS policies to allow viewing related events

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can insert their own timeline events" ON timeline_events;

-- Create new policies with broader access

-- Users can view events for:
-- 1. Their own properties
-- 2. Properties they're involved with (through documents or signatures)
CREATE POLICY "Users can view timeline events"
  ON timeline_events FOR SELECT
  USING (
    -- Own events
    auth.uid() = user_id
    OR
    -- Events for properties they own
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = timeline_events.property_id
      AND p.user_id = auth.uid()
    )
    OR
    -- Events for properties they have documents for
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.property_id = timeline_events.property_id
      AND d.user_id = auth.uid()
    )
    OR
    -- Events for properties they have signed documents for
    EXISTS (
      SELECT 1 FROM document_signatures ds
      JOIN documents d ON d.id = ds.document_id
      WHERE d.property_id = timeline_events.property_id
      AND ds.signer_user_id = auth.uid()
    )
  );

-- Users can create timeline events for their own properties
CREATE POLICY "Users can create timeline events"
  ON timeline_events FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      property_id IS NULL
      OR EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = timeline_events.property_id
        AND p.user_id = auth.uid()
      )
    )
  );

-- Users can update their own timeline events
CREATE POLICY "Users can update timeline events"
  ON timeline_events FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own timeline events
CREATE POLICY "Users can delete timeline events"
  ON timeline_events FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-create timeline event when property is created
CREATE OR REPLACE FUNCTION create_property_listed_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO timeline_events (
    user_id,
    property_id,
    title,
    description,
    event_type,
    status,
    created_by_name
  )
  SELECT
    NEW.user_id,
    NEW.id,
    'Propiedad publicada',
    'La propiedad ' || NEW.title || ' ha sido publicada en el sistema',
    'property_listed',
    'completed',
    up.full_name
  FROM user_profiles up
  WHERE up.id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create timeline event on property creation
DROP TRIGGER IF EXISTS auto_create_property_listed_event ON properties;
CREATE TRIGGER auto_create_property_listed_event
  AFTER INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION create_property_listed_event();

-- Function to auto-create timeline event when document is uploaded
CREATE OR REPLACE FUNCTION create_document_uploaded_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO timeline_events (
    user_id,
    property_id,
    title,
    description,
    event_type,
    status,
    created_by_name,
    metadata
  ) VALUES (
    NEW.user_id,
    NEW.property_id,
    'Documento subido',
    'Documento "' || NEW.name || '" subido al sistema',
    'documents_uploaded',
    'completed',
    NEW.uploaded_by,
    jsonb_build_object('document_id', NEW.id, 'document_name', NEW.name)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create timeline event on document upload
DROP TRIGGER IF EXISTS auto_create_document_uploaded_event ON documents;
CREATE TRIGGER auto_create_document_uploaded_event
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION create_document_uploaded_event();

-- Function to auto-create timeline event when document is signed
CREATE OR REPLACE FUNCTION create_document_signed_event()
RETURNS TRIGGER AS $$
DECLARE
  doc_record RECORD;
BEGIN
  -- Get document info
  SELECT d.*, d.property_id INTO doc_record
  FROM documents d
  WHERE d.id = NEW.document_id;

  IF doc_record.property_id IS NOT NULL THEN
    INSERT INTO timeline_events (
      user_id,
      property_id,
      title,
      description,
      event_type,
      status,
      created_by_name,
      metadata
    ) VALUES (
      NEW.signer_user_id,
      doc_record.property_id,
      'Documento firmado',
      NEW.signer_name || ' firmó el documento "' || doc_record.name || '"',
      'document_signed',
      'completed',
      NEW.signer_name,
      jsonb_build_object(
        'document_id', NEW.document_id,
        'signature_id', NEW.id,
        'signer_role', NEW.signer_role
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create timeline event on document signature
DROP TRIGGER IF EXISTS auto_create_document_signed_event ON document_signatures;
CREATE TRIGGER auto_create_document_signed_event
  AFTER INSERT ON document_signatures
  FOR EACH ROW
  EXECUTE FUNCTION create_document_signed_event();

-- Helper function to get timeline progress for a property
CREATE OR REPLACE FUNCTION get_property_timeline_progress(prop_id UUID)
RETURNS TABLE (
  current_stage TEXT,
  completed_stages TEXT[],
  progress_percentage INTEGER,
  total_events INTEGER
) AS $$
DECLARE
  stages_completed TEXT[];
  latest_stage TEXT;
  stage_count INTEGER;
BEGIN
  -- Get unique stages from completed events
  SELECT ARRAY_AGG(DISTINCT
    CASE event_type
      WHEN 'property_listed' THEN 'listing'
      WHEN 'offer_accepted' THEN 'negotiation'
      WHEN 'arras_contract_signed' THEN 'arras'
      WHEN 'documents_verified' THEN 'due_diligence'
      WHEN 'financing_approved' THEN 'financing'
      WHEN 'escritura_completed' THEN 'escritura'
      WHEN 'sunarp_completed' THEN 'sunarp'
      WHEN 'transaction_completed' THEN 'completion'
    END
  ) INTO stages_completed
  FROM timeline_events
  WHERE property_id = prop_id
    AND status = 'completed'
    AND event_type IN (
      'property_listed', 'offer_accepted', 'arras_contract_signed',
      'documents_verified', 'financing_approved', 'escritura_completed',
      'sunarp_completed', 'transaction_completed'
    );

  -- Get latest event's stage
  SELECT CASE event_type
    WHEN 'property_listed' THEN 'listing'
    WHEN 'visit_scheduled' THEN 'prospecting'
    WHEN 'offer_made' THEN 'negotiation'
    WHEN 'arras_contract_signed' THEN 'arras'
    WHEN 'documents_verified' THEN 'due_diligence'
    WHEN 'financing_approved' THEN 'financing'
    WHEN 'escritura_completed' THEN 'escritura'
    WHEN 'sunarp_completed' THEN 'sunarp'
    WHEN 'transaction_completed' THEN 'completion'
    ELSE 'listing'
  END INTO latest_stage
  FROM timeline_events
  WHERE property_id = prop_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Calculate stage count
  stage_count := COALESCE(array_length(stages_completed, 1), 0);

  -- Return results
  RETURN QUERY SELECT
    COALESCE(latest_stage, 'listing'),
    COALESCE(stages_completed, ARRAY[]::TEXT[]),
    COALESCE(ROUND((stage_count::DECIMAL / 9) * 100), 0)::INTEGER,
    (SELECT COUNT(*)::INTEGER FROM timeline_events WHERE property_id = prop_id);
END;
$$ LANGUAGE plpgsql;
