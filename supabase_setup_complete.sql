-- Drop existing tables if they exist
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Create user_role enum
CREATE TYPE user_role AS ENUM ('OWNER', 'BUYER', 'AGENT', 'CO_AGENT', 'ADMIN_AGENCY');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL,
  agency_id UUID,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_agency_id ON users(agency_id);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Create properties table
CREATE TABLE properties (
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
  property_type TEXT,
  area_sqm DECIMAL(10, 2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  parking_spaces INTEGER,

  -- Financial
  asking_price DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'PEN',

  -- Status
  status TEXT DEFAULT 'ACTIVE',

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

-- Create indexes for properties
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_location ON properties(latitude, longitude);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for properties
CREATE POLICY "Agents can view own properties"
  ON properties
  FOR SELECT
  USING (auth.uid()::text = agent_id::text);

CREATE POLICY "Agents can insert own properties"
  ON properties
  FOR INSERT
  WITH CHECK (auth.uid()::text = agent_id::text);

CREATE POLICY "Agents can update own properties"
  ON properties
  FOR UPDATE
  USING (auth.uid()::text = agent_id::text)
  WITH CHECK (auth.uid()::text = agent_id::text);

CREATE POLICY "Agents can delete own properties"
  ON properties
  FOR DELETE
  USING (auth.uid()::text = agent_id::text);
