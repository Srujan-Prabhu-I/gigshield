-- GigShield Auth Lock Fix - Database Cleanup
-- Run these commands in Supabase SQL Editor

-- Step 1: Check current user_roles table
SELECT * FROM user_roles LIMIT 10;

-- Step 2: Remove all existing roles (fresh start)
TRUNCATE TABLE user_roles CASCADE;

-- Step 3: Ensure unique constraint on user_roles
-- First drop existing constraint if it exists
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS unique_user_role;

-- Add unique constraint to prevent duplicates
ALTER TABLE user_roles ADD CONSTRAINT unique_user_role UNIQUE(user_id);

-- Step 4: Verify table is clean
SELECT COUNT(*) as role_count FROM user_roles;

-- Step 5: Optional - If you want to see the table structure
-- \d user_roles
