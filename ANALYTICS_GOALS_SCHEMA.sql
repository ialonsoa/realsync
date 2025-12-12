-- Analytics Goals Schema
-- Allows users to set and track their business goals/targets

CREATE TABLE IF NOT EXISTS analytics_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Monthly goals
  monthly_sales_target INTEGER DEFAULT 5,
  monthly_revenue_target DECIMAL(12, 2) DEFAULT 1000000, -- S/ 1M default

  -- Performance goals
  conversion_rate_target INTEGER DEFAULT 65, -- percentage
  verification_rate_target INTEGER DEFAULT 80, -- percentage
  timeline_activity_target DECIMAL(4, 1) DEFAULT 5.0, -- events per property
  active_properties_target INTEGER DEFAULT 10,

  -- Time goals
  average_days_to_sell_target INTEGER DEFAULT 45,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_analytics_goals_user_id ON analytics_goals(user_id);

-- Enable RLS
ALTER TABLE analytics_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own goals"
  ON analytics_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
  ON analytics_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON analytics_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON analytics_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION update_analytics_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS analytics_goals_updated_at ON analytics_goals;
CREATE TRIGGER analytics_goals_updated_at
  BEFORE UPDATE ON analytics_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_goals_updated_at();

-- Helper function to get or create default goals for a user
CREATE OR REPLACE FUNCTION get_or_create_user_goals(p_user_id UUID)
RETURNS analytics_goals AS $$
DECLARE
  user_goals analytics_goals;
BEGIN
  -- Try to get existing goals
  SELECT * INTO user_goals
  FROM analytics_goals
  WHERE user_id = p_user_id
  LIMIT 1;

  -- If not found, create default goals
  IF NOT FOUND THEN
    INSERT INTO analytics_goals (user_id)
    VALUES (p_user_id)
    RETURNING * INTO user_goals;
  END IF;

  RETURN user_goals;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
