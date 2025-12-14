-- ================================================
-- CHAT FEATURE MIGRATIONS FOR SUPABASE
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Create conversation_type enum
CREATE TYPE conversation_type AS ENUM (
  'PROPERTY_CHAT',
  'DIRECT_MESSAGE',
  'CLIENT_NOTE'
);

-- 2. Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type conversation_type NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  name TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  last_message_id UUID,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_archived BOOLEAN DEFAULT false,
  pinned_by JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create indexes on conversations
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_property_id ON conversations(property_id);
CREATE INDEX idx_conversations_transaction_id ON conversations(transaction_id);
CREATE INDEX idx_conversations_last_activity_at ON conversations(last_activity_at);
CREATE INDEX idx_conversations_is_archived ON conversations(is_archived);
CREATE INDEX idx_conversations_participants_gin ON conversations USING GIN(participants);

-- 4. Extend messages table
ALTER TABLE messages
  ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  ADD COLUMN is_pinned BOOLEAN DEFAULT false,
  ADD COLUMN pinned_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN pinned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN voice_note_url TEXT,
  ADD COLUMN voice_note_duration INTEGER,
  ADD COLUMN linked_timeline_event_id UUID REFERENCES timeline_events(id) ON DELETE SET NULL;

-- Make transaction_id nullable
ALTER TABLE messages ALTER COLUMN transaction_id DROP NOT NULL;

-- Create indexes on new message columns
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_is_pinned ON messages(is_pinned);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);

-- 5. Create message_templates table
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_shared BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes on message_templates
CREATE INDEX idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX idx_message_templates_agency_id ON message_templates(agency_id);
CREATE INDEX idx_message_templates_category ON message_templates(category);
CREATE INDEX idx_message_templates_is_shared ON message_templates(is_shared);

-- 6. Create typing_indicators table
CREATE TABLE typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(conversation_id, user_id)
);

-- Create index on typing_indicators
CREATE INDEX idx_typing_indicators_conversation_expires ON typing_indicators(conversation_id, expires_at);

-- 7. Extend documents table
ALTER TABLE documents
  ADD COLUMN message_id UUID REFERENCES messages(id) ON DELETE CASCADE;

-- Make transaction_id nullable for chat attachments
ALTER TABLE documents ALTER COLUMN transaction_id DROP NOT NULL;

-- Create index on message_id
CREATE INDEX idx_documents_message_id ON documents(message_id);

-- Add new document types (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
    CREATE TYPE document_type AS ENUM ('DNI', 'CONTRACT', 'DEED', 'TAX_FORM', 'BANK_STATEMENT', 'SUNARP_DOCUMENT', 'OTHER');
  END IF;

  -- Add new values if type exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
    ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'CHAT_ATTACHMENT';
    ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'VOICE_NOTE';
    ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'CHAT_IMAGE';
  END IF;
END $$;

-- 8. Add foreign key for last_message_id (after messages table is updated)
ALTER TABLE conversations
  ADD CONSTRAINT fk_conversations_last_message
  FOREIGN KEY (last_message_id)
  REFERENCES messages(id) ON DELETE SET NULL;

-- ================================================
-- DATA MIGRATION: Create conversations for existing transaction messages
-- ================================================

DO $$
DECLARE
  transaction_record RECORD;
  property_record RECORD;
  conversation_uuid UUID;
  participants_array JSONB;
  last_msg RECORD;
  msg_count INTEGER;
BEGIN
  -- Loop through all transactions that have messages
  FOR transaction_record IN
    SELECT DISTINCT transaction_id
    FROM messages
    WHERE transaction_id IS NOT NULL
  LOOP
    -- Get transaction details
    SELECT * INTO transaction_record
    FROM transactions
    WHERE id = transaction_record.transaction_id;

    IF transaction_record.id IS NOT NULL THEN
      -- Get property details
      SELECT * INTO property_record
      FROM properties
      WHERE id = transaction_record.property_id;

      -- Build participants array
      participants_array := '[]'::jsonb;

      IF transaction_record.agent_id IS NOT NULL THEN
        participants_array := participants_array || jsonb_build_array(transaction_record.agent_id);
      END IF;

      IF transaction_record.buyer_id IS NOT NULL THEN
        participants_array := participants_array || jsonb_build_array(transaction_record.buyer_id);
      END IF;

      IF property_record.owner_id IS NOT NULL THEN
        participants_array := participants_array || jsonb_build_array(property_record.owner_id);
      END IF;

      -- Create conversation
      INSERT INTO conversations (type, property_id, transaction_id, participants)
      VALUES ('PROPERTY_CHAT', transaction_record.property_id, transaction_record.transaction_id, participants_array)
      RETURNING id INTO conversation_uuid;

      -- Update messages with conversation_id
      UPDATE messages
      SET conversation_id = conversation_uuid
      WHERE transaction_id = transaction_record.transaction_id;

      GET DIAGNOSTICS msg_count = ROW_COUNT;

      -- Update conversation with last message
      SELECT * INTO last_msg
      FROM messages
      WHERE conversation_id = conversation_uuid
      ORDER BY created_at DESC
      LIMIT 1;

      IF last_msg.id IS NOT NULL THEN
        UPDATE conversations
        SET last_message_id = last_msg.id,
            last_activity_at = last_msg.created_at
        WHERE id = conversation_uuid;
      END IF;

      RAISE NOTICE 'Migrated % messages for transaction % to conversation %',
        msg_count, transaction_record.transaction_id, conversation_uuid;
    END IF;
  END LOOP;
END $$;

-- ================================================
-- SUCCESS! Chat feature tables created and data migrated
-- ================================================
