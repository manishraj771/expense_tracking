/*
  # Update auth_logs table and policies

  1. Changes
    - Creates auth_logs table if it doesn't exist
    - Safely adds RLS policies by checking existence first
  
  2. Security
    - Enables RLS on auth_logs table
    - Allows users to read their own logs
    - Allows both authenticated and anonymous users to insert logs
*/

-- Create auth_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  user_email text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  error_message text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read own auth logs" ON auth_logs;
    DROP POLICY IF EXISTS "Allow auth log insertion for all" ON auth_logs;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create new policies
CREATE POLICY "Users can read own auth logs"
  ON auth_logs
  FOR SELECT
  TO authenticated
  USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Allow auth log insertion for all"
  ON auth_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);