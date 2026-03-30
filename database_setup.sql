-- Run this in your Supabase SQL Editor to clear old data and update schema

-- 0. Clear previous mock data to prevent foreign key collisions with real UUIDs
TRUNCATE TABLE user_roles CASCADE;
TRUNCATE TABLE platform_profiles CASCADE;
TRUNCATE TABLE grievances CASCADE;

DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        TRUNCATE TABLE profiles CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'earnings_logs') THEN
        TRUNCATE TABLE earnings_logs CASCADE;
    END IF;
END $$;

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('worker', 'platform', 'government')),
  platform_name TEXT,          
  department TEXT,             
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Create platform_profiles table
CREATE TABLE IF NOT EXISTS platform_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  base_pay_per_hour NUMERIC,
  has_insurance BOOLEAN DEFAULT false,
  has_grievance_portal BOOLEAN DEFAULT false,
  has_min_guarantee BOOLEAN DEFAULT false,
  worker_count INTEGER,
  compliance_score INTEGER DEFAULT 50,
  last_audit_at TIMESTAMPTZ,
  audit_data JSONB, -- Stores full audit details (violations, action items)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist even if table was created previously
ALTER TABLE platform_profiles ADD COLUMN IF NOT EXISTS has_insurance BOOLEAN DEFAULT false;
ALTER TABLE platform_profiles ADD COLUMN IF NOT EXISTS has_grievance_portal BOOLEAN DEFAULT false;
ALTER TABLE platform_profiles ADD COLUMN IF NOT EXISTS has_min_guarantee BOOLEAN DEFAULT false;
ALTER TABLE platform_profiles ADD COLUMN IF NOT EXISTS last_audit_at TIMESTAMPTZ;
ALTER TABLE platform_profiles ADD COLUMN IF NOT EXISTS audit_data JSONB;

-- 3. Add grievances table for formal complaints
CREATE TABLE IF NOT EXISTS grievances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_name TEXT,
  phone TEXT,
  address TEXT,
  platform TEXT NOT NULL,
  city TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  pdf_url TEXT,
  letter_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow public access for fast hackathon demo
CREATE POLICY "Allow public all user_roles" ON user_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all platform_profiles" ON platform_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all grievances" ON grievances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- 5. Earnings Logs Additions
-- Add user_id column to earnings_logs if it doesn't have one
ALTER TABLE earnings_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_earnings_user ON earnings_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_earnings_platform ON earnings_logs(platform);
