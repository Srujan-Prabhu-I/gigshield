-- Run this in your Supabase SQL Editor

-- 1. Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('worker', 'platform', 'government')),
  platform_name TEXT,          
  department TEXT,             
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Create platform_profiles table
CREATE TABLE platform_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL,
  logo_url TEXT,
  base_pay_per_hour NUMERIC,
  has_insurance BOOLEAN DEFAULT false,
  has_grievance_portal BOOLEAN DEFAULT false,
  has_min_guarantee BOOLEAN DEFAULT false,
  worker_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS and setup temporary permissive policies for Hackathon usage
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public access for fast hackathon demo
CREATE POLICY "Allow public all user_roles" ON user_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all platform_profiles" ON platform_profiles FOR ALL USING (true) WITH CHECK (true);
