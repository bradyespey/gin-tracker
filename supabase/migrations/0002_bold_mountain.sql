/*
  # Add deadwood_difference column to games table

  1. Changes
    - Add `deadwood_difference` column to `games` table as nullable integer
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'deadwood_difference'
  ) THEN
    ALTER TABLE games ADD COLUMN deadwood_difference integer;
  END IF;
END $$;