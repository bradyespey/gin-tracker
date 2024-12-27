/*
  # Update RLS policies for games table

  1. Changes
    - Remove existing policies
    - Add new policies that only check for authentication
    - Remove RPC functions since they're not needed
  
  2. Security
    - Policies now only check if the user is authenticated
    - No user_id requirement since this is a shared game tracker
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read games" ON games;
DROP POLICY IF EXISTS "Allow authenticated users to insert games" ON games;
DROP POLICY IF EXISTS "Allow authenticated users to update games" ON games;
DROP POLICY IF EXISTS "Allow authenticated users to delete games" ON games;

-- Create new simplified policies
CREATE POLICY "Allow authenticated users to read games"
ON games FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert games"
ON games FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update games"
ON games FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete games"
ON games FOR DELETE
TO authenticated
USING (true);

-- Drop RPC functions if they exist
DROP FUNCTION IF EXISTS delete_game(uuid);
DROP FUNCTION IF EXISTS update_game(uuid, jsonb);