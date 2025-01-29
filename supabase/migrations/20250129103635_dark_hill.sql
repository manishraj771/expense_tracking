/*
  # Fix auth_logs permissions

  1. Changes
    - Drops and recreates policies with correct permissions
    - Ensures both anonymous and authenticated users can insert logs
    - Maintains user privacy by limiting read access
  
  2. Security
    - Users can only read their own logs
    - Both authenticated and anonymous users can create logs
    - No update or delete permissions
*/

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read own auth logs" ON auth_logs;
    DROP POLICY IF EXISTS "Allow auth log insertion" ON auth_logs;
    DROP POLICY IF EXISTS "Allow auth log insertion for all" ON auth_logs;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Recreate policies with correct permissions
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