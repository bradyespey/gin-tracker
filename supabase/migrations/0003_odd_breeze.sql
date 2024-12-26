/*
  # Add DELETE policy for games table

  1. Changes
    - Add policy to allow authenticated users to delete games
*/

CREATE POLICY "Allow authenticated users to delete games"
  ON games FOR DELETE
  TO authenticated
  USING (true);