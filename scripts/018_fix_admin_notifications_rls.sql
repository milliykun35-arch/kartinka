-- Fix RLS policy for admin_notifications table
-- This allows the API to insert notifications

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable insert for service role" ON admin_notifications;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON admin_notifications;

-- Enable RLS
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Allow insert for anyone (service role / anon)
CREATE POLICY "Enable insert for all"
ON admin_notifications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow read for authenticated users (admins)
CREATE POLICY "Enable read for authenticated"
ON admin_notifications
FOR SELECT
TO authenticated
USING (true);

-- Allow update for authenticated users
CREATE POLICY "Enable update for authenticated"
ON admin_notifications
FOR UPDATE
TO authenticated
USING (true);
