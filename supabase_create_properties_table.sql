-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL,
  owner_id UUID,

  -- Property details
  address TEXT NOT NULL,
  district TEXT,
  city TEXT NOT NULL,
  region TEXT,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Property characteristics
  property_type TEXT, -- house, apartment, land, commercial
  area_sqm DECIMAL(10, 2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  parking_spaces INTEGER,

  -- Financial
  asking_price DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'PEN',

  -- Status
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, UNDER_OFFER, SOLD, WITHDRAWN

  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Foreign keys
  CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_properties_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Agents can view their own properties
CREATE POLICY "Agents can view own properties"
  ON properties
  FOR SELECT
  USING (auth.uid() = agent_id);

-- Agents can insert their own properties
CREATE POLICY "Agents can insert own properties"
  ON properties
  FOR INSERT
  WITH CHECK (auth.uid() = agent_id);

-- Agents can update their own properties
CREATE POLICY "Agents can update own properties"
  ON properties
  FOR UPDATE
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

-- Agents can delete (soft delete) their own properties
CREATE POLICY "Agents can delete own properties"
  ON properties
  FOR DELETE
  USING (auth.uid() = agent_id);
