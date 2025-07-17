-- First, drop the table if it exists to recreate it properly
DROP TABLE IF EXISTS schools CASCADE;

-- Create schools table with proper structure
CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  website TEXT,
  logo TEXT,
  student_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  principal_name TEXT,
  contact_person TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint to users table
-- First check if school_id column exists in users table
DO $$
BEGIN
  -- Add school_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE users ADD COLUMN school_id TEXT;
  END IF;
  
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_users_school' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT fk_users_school 
      FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can manage schools" ON schools;
DROP POLICY IF EXISTS "Users can read active schools" ON schools;
DROP POLICY IF EXISTS "Users can read their own school" ON schools;
DROP POLICY IF EXISTS "Enable all access for service role" ON schools;
DROP POLICY IF EXISTS "Temporary full access" ON schools;
DROP POLICY IF EXISTS "Allow all operations on schools" ON schools;
DROP POLICY IF EXISTS "Allow read for anonymous" ON schools;

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all operations
CREATE POLICY "Allow all operations on schools" ON schools
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow read for anonymous" ON schools
FOR SELECT
TO anon
USING (true);

-- Grant necessary permissions
GRANT ALL ON schools TO authenticated;
GRANT ALL ON schools TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Ensure the updated_at trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
