/*
  # Create Authentication Logs Table

  1. New Tables
    - `auth_logs`
      - `id` (uuid, primary key)
      - `event` (text) - Type of auth event (login, registration, etc.)
      - `user_email` (text) - Email of the user involved
      - `success` (boolean) - Whether the event was successful
      - `error_message` (text, nullable) - Error message if event failed
      - `ip_address` (text) - IP address of the request
      - `user_agent` (text) - Browser/client information
      - `created_at` (timestamptz) - When the event occurred

  2. Security
    - Enable RLS on `auth_logs` table
    - Add policy for authenticated users to read their own logs
    - Add policy for inserting logs during auth events
*/

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

ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own auth logs
CREATE POLICY "Users can read own auth logs"
  ON auth_logs
  FOR SELECT
  TO authenticated
  USING (user_email = auth.jwt() ->> 'email');

-- Allow insertion of auth logs during authentication events
CREATE POLICY "Allow auth log insertion"
  ON auth_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);