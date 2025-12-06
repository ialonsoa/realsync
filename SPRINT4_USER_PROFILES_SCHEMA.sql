-- Sprint 4: Enhanced User Profiles Schema
-- This migration enhances the existing user_profiles table and adds role-specific tables

-- First, let's enhance the existing user_profiles table
ALTER TABLE user_profiles
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name,
  ADD COLUMN IF NOT EXISTS full_name TEXT NOT NULL DEFAULT 'User Name',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'es' CHECK (preferred_language IN ('es', 'en')),
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Create ENUM types
DO $$ BEGIN
  CREATE TYPE role_type AS ENUM ('OWNER', 'BUYER', 'AGENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE visibility_level AS ENUM ('PUBLIC', 'CONTACTS_ONLY', 'AGENTS_ONLY', 'HIDDEN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE financing_status AS ENUM ('PRE_APPROVED', 'CASH', 'SEEKING_FINANCING', 'NOT_SPECIFIED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE urgency_level AS ENUM ('ACTIVELY_LOOKING', 'RESEARCHING', 'FUTURE_PLANNING');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE selling_timeline AS ENUM ('IMMEDIATE', 'WITHIN_3_MONTHS', 'WITHIN_6_MONTHS', 'WITHIN_YEAR', 'EXPLORING');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE preferred_contact_method AS ENUM ('PHONE', 'EMAIL', 'WHATSAPP', 'SMS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Role Profiles Table (supports multi-role functionality)
CREATE TABLE IF NOT EXISTS role_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_type role_type NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_profile_id, role_type)
);

-- Agent Profiles Table
CREATE TABLE IF NOT EXISTS agent_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role_profile_id UUID NOT NULL UNIQUE REFERENCES role_profiles(id) ON DELETE CASCADE,
  license_number TEXT,
  brokerage_name TEXT,
  service_regions TEXT[] DEFAULT '{}',
  expertise_areas TEXT[] DEFAULT '{}',
  years_experience INTEGER,
  verification_status verification_status DEFAULT 'UNVERIFIED',
  verified_at TIMESTAMPTZ,
  verified_by_admin_id UUID,
  bio TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buyer Profiles Table
CREATE TABLE IF NOT EXISTS buyer_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role_profile_id UUID NOT NULL UNIQUE REFERENCES role_profiles(id) ON DELETE CASCADE,
  property_types_interested TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),
  financing_status financing_status DEFAULT 'NOT_SPECIFIED',
  urgency_level urgency_level DEFAULT 'RESEARCHING',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Owner Profiles Table
CREATE TABLE IF NOT EXISTS owner_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role_profile_id UUID NOT NULL UNIQUE REFERENCES role_profiles(id) ON DELETE CASCADE,
  properties_count INTEGER DEFAULT 0,
  property_types_owned TEXT[] DEFAULT '{}',
  selling_timeline selling_timeline DEFAULT 'EXPLORING',
  preferred_contact_method preferred_contact_method DEFAULT 'EMAIL',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile Privacy Settings Table
CREATE TABLE IF NOT EXISTS profile_privacy_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_profile_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  phone_visibility visibility_level DEFAULT 'AGENTS_ONLY',
  email_visibility visibility_level DEFAULT 'HIDDEN',
  activity_visibility BOOLEAN DEFAULT false,
  show_on_search BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile Access Logs Table (for audit compliance)
CREATE TABLE IF NOT EXISTS profile_access_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  accessor_user_id UUID,
  accessed_fields TEXT[] DEFAULT '{}',
  access_timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_profiles_user ON role_profiles(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_role_profiles_type ON role_profiles(role_type);
CREATE INDEX IF NOT EXISTS idx_role_profiles_primary ON role_profiles(user_profile_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_verification ON agent_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_license ON agent_profiles(license_number);
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_budget ON buyer_profiles(budget_min, budget_max);
CREATE INDEX IF NOT EXISTS idx_access_logs_profile ON profile_access_logs(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessor ON profile_access_logs(accessor_user_id);

-- Enable RLS on new tables
ALTER TABLE role_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for role_profiles
CREATE POLICY "Users can view their own roles"
  ON role_profiles FOR SELECT
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own roles"
  ON role_profiles FOR INSERT
  WITH CHECK (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own roles"
  ON role_profiles FOR UPDATE
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for agent_profiles
CREATE POLICY "Anyone can view verified agent profiles"
  ON agent_profiles FOR SELECT
  USING (
    verification_status = 'VERIFIED' OR
    role_profile_id IN (
      SELECT rp.id FROM role_profiles rp
      JOIN user_profiles up ON rp.user_profile_id = up.id
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "Agents can insert their own profile"
  ON agent_profiles FOR INSERT
  WITH CHECK (
    role_profile_id IN (
      SELECT rp.id FROM role_profiles rp
      JOIN user_profiles up ON rp.user_profile_id = up.id
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "Agents can update their own profile"
  ON agent_profiles FOR UPDATE
  USING (
    role_profile_id IN (
      SELECT rp.id FROM role_profiles rp
      JOIN user_profiles up ON rp.user_profile_id = up.id
      WHERE up.id = auth.uid()
    )
  );

-- RLS Policies for buyer_profiles
CREATE POLICY "Buyers can manage their own profile"
  ON buyer_profiles FOR ALL
  USING (
    role_profile_id IN (
      SELECT rp.id FROM role_profiles rp
      JOIN user_profiles up ON rp.user_profile_id = up.id
      WHERE up.id = auth.uid()
    )
  );

-- RLS Policies for owner_profiles
CREATE POLICY "Owners can manage their own profile"
  ON owner_profiles FOR ALL
  USING (
    role_profile_id IN (
      SELECT rp.id FROM role_profiles rp
      JOIN user_profiles up ON rp.user_profile_id = up.id
      WHERE up.id = auth.uid()
    )
  );

-- RLS Policies for profile_privacy_settings
CREATE POLICY "Users can manage their own privacy settings"
  ON profile_privacy_settings FOR ALL
  USING (auth.uid() = user_profile_id);

-- RLS Policies for profile_access_logs
CREATE POLICY "Users can view their own access logs"
  ON profile_access_logs FOR SELECT
  USING (auth.uid() = profile_user_id);

CREATE POLICY "System can insert access logs"
  ON profile_access_logs FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_role_profiles_updated_at
  BEFORE UPDATE ON role_profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_updated_at();

CREATE TRIGGER update_agent_profiles_updated_at
  BEFORE UPDATE ON agent_profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_updated_at();

CREATE TRIGGER update_buyer_profiles_updated_at
  BEFORE UPDATE ON buyer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_updated_at();

CREATE TRIGGER update_owner_profiles_updated_at
  BEFORE UPDATE ON owner_profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_updated_at();

CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON profile_privacy_settings
  FOR EACH ROW EXECUTE FUNCTION update_profile_updated_at();

-- Function to automatically create privacy settings when user profile is created
CREATE OR REPLACE FUNCTION create_default_privacy_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profile_privacy_settings (user_profile_id)
  VALUES (NEW.id)
  ON CONFLICT (user_profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create privacy settings on profile creation
DROP TRIGGER IF EXISTS on_user_profile_created ON user_profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_privacy_settings();

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile photos
CREATE POLICY "Anyone can view profile photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile photo"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile photo"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update the handle_new_user function to work with enhanced schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create/update user profile
  INSERT INTO public.user_profiles (
    id,
    full_name,
    role,
    phone,
    preferred_language
  )
  VALUES (
    NEW.id,
    COALESCE(
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      ),
      'User Name'
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'AGENT'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'es')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
