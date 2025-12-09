-- Document Signatures Schema
-- This schema enables online document signing functionality for buyers and sellers

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Document Signatures Table
-- Stores individual signatures on documents
CREATE TABLE IF NOT EXISTS document_signatures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  signer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Signature data
  signature_type TEXT NOT NULL CHECK (signature_type IN ('drawn', 'typed', 'uploaded')),
  signature_data TEXT NOT NULL, -- Base64 encoded image or typed text

  -- Signer information (captured at time of signing)
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signer_role TEXT, -- e.g., 'buyer', 'seller', 'agent', 'witness'

  -- Signature metadata
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Legal compliance
  consent_given BOOLEAN DEFAULT true,
  consent_text TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate signatures
  UNIQUE(document_id, signer_user_id)
);

-- Document Signature Requests Table
-- Tracks who needs to sign which documents
CREATE TABLE IF NOT EXISTS document_signature_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  requested_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Request details
  request_message TEXT,
  required_role TEXT, -- Role of the person who should sign
  due_date TIMESTAMPTZ,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'declined', 'expired')),
  completed_at TIMESTAMPTZ,
  declined_reason TEXT,

  -- Notifications
  email_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Signature Fields Table (Optional - for positioned signatures)
-- Defines where signatures should appear on the document
CREATE TABLE IF NOT EXISTS document_signature_fields (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

  -- Field positioning (percentage of document dimensions)
  page_number INTEGER NOT NULL DEFAULT 1,
  x_position DECIMAL(5, 2), -- Percentage 0-100
  y_position DECIMAL(5, 2), -- Percentage 0-100
  width DECIMAL(5, 2),
  height DECIMAL(5, 2),

  -- Field details
  field_type TEXT NOT NULL CHECK (field_type IN ('signature', 'initial', 'date', 'text')),
  field_label TEXT,
  required_role TEXT, -- Which role should fill this field
  is_required BOOLEAN DEFAULT true,

  -- Status
  filled_by_signature_id UUID REFERENCES document_signatures(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for document signature events
CREATE TABLE IF NOT EXISTS document_signature_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  event_type TEXT NOT NULL CHECK (event_type IN (
    'signature_requested',
    'signature_completed',
    'signature_declined',
    'document_viewed',
    'reminder_sent',
    'signature_verified'
  )),
  event_data JSONB,
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_signatures_document_id ON document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_signer_user_id ON document_signatures(signer_user_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_signed_at ON document_signatures(signed_at);

CREATE INDEX IF NOT EXISTS idx_signature_requests_document_id ON document_signature_requests(document_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_requested_from ON document_signature_requests(requested_from_user_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_status ON document_signature_requests(status);

CREATE INDEX IF NOT EXISTS idx_signature_fields_document_id ON document_signature_fields(document_id);

CREATE INDEX IF NOT EXISTS idx_signature_audit_document_id ON document_signature_audit_log(document_id);
CREATE INDEX IF NOT EXISTS idx_signature_audit_created_at ON document_signature_audit_log(created_at);

-- Enable Row Level Security
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signature_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signature_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_signatures

-- Users can view signatures on documents they have access to
CREATE POLICY "Users can view signatures on their documents"
  ON document_signatures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_signatures.document_id
      AND d.user_id = auth.uid()
    )
    OR signer_user_id = auth.uid()
  );

-- Users can create their own signatures
CREATE POLICY "Users can sign documents"
  ON document_signatures FOR INSERT
  WITH CHECK (auth.uid() = signer_user_id);

-- RLS Policies for document_signature_requests

-- Users can view signature requests they created or received
CREATE POLICY "Users can view their signature requests"
  ON document_signature_requests FOR SELECT
  USING (
    auth.uid() = requested_by_user_id
    OR auth.uid() = requested_from_user_id
  );

-- Users can create signature requests for their documents
CREATE POLICY "Users can create signature requests"
  ON document_signature_requests FOR INSERT
  WITH CHECK (
    auth.uid() = requested_by_user_id
    AND EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_signature_requests.document_id
      AND d.user_id = auth.uid()
    )
  );

-- Users can update signature requests they received
CREATE POLICY "Users can update their received requests"
  ON document_signature_requests FOR UPDATE
  USING (auth.uid() = requested_from_user_id);

-- RLS Policies for document_signature_fields

-- Users can view signature fields on documents they have access to
CREATE POLICY "Users can view signature fields"
  ON document_signature_fields FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_signature_fields.document_id
      AND d.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM document_signature_requests dsr
      WHERE dsr.document_id = document_signature_fields.document_id
      AND dsr.requested_from_user_id = auth.uid()
    )
  );

-- Document owners can manage signature fields
CREATE POLICY "Document owners can manage signature fields"
  ON document_signature_fields FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_signature_fields.document_id
      AND d.user_id = auth.uid()
    )
  );

-- RLS Policies for audit log (read-only for involved users)
CREATE POLICY "Users can view audit logs for their documents"
  ON document_signature_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_signature_audit_log.document_id
      AND d.user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_signature_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_signature_requests_updated_at
  BEFORE UPDATE ON document_signature_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_signature_request_updated_at();

-- Function to automatically create audit log entries
CREATE OR REPLACE FUNCTION log_signature_event()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO document_signature_audit_log (
      document_id,
      user_id,
      event_type,
      event_data
    ) VALUES (
      NEW.document_id,
      NEW.signer_user_id,
      'signature_completed',
      jsonb_build_object(
        'signature_id', NEW.id,
        'signature_type', NEW.signature_type,
        'signer_name', NEW.signer_name
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-log signatures
CREATE TRIGGER log_signature_completed
  AFTER INSERT ON document_signatures
  FOR EACH ROW
  EXECUTE FUNCTION log_signature_event();

-- Function to update signature request status when signed
CREATE OR REPLACE FUNCTION update_signature_request_on_sign()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE document_signature_requests
  SET
    status = 'completed',
    completed_at = NOW()
  WHERE
    document_id = NEW.document_id
    AND requested_from_user_id = NEW.signer_user_id
    AND status = 'pending';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-complete signature requests
CREATE TRIGGER complete_signature_request_on_sign
  AFTER INSERT ON document_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_signature_request_on_sign();
