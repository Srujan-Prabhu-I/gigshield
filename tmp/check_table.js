const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTable() {
  console.log('Attempting to create platform_certifications table...')
  
  // Note: Most anon keys don't have permission to create tables.
  // This is primarily for local dev or if service key is available.
  const { data, error } = await supabase.rpc('create_platform_certifications_table')
  
  if (error) {
    console.log('RPC failed (expected if not exists). Trying raw query if possible or just skipping as it might require manual setup.')
    console.error(error)
  } else {
    console.log('Table created successfully via RPC.')
  }
}

// Alternatively, just check if we can insert into it.
async function checkTable() {
  const { error } = await supabase.from('platform_certifications').select('id').limit(1)
  if (error && error.code === '42P01') {
     console.log('Table does not exist. Please run this SQL in your Supabase SQL Editor:')
     console.log(`
CREATE TABLE platform_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE platform_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON platform_certifications FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON platform_certifications FOR INSERT WITH CHECK (true);
     `)
  } else if (error) {
    console.error('Error checking table:', error)
  } else {
    console.log('Table platform_certifications already exists.')
  }
}

checkTable()
