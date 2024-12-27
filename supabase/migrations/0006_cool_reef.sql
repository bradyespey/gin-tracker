/*
  # Add game number column
  
  1. Changes
    - Add game_number column to games table
    - Add trigger to auto-increment game number
    
  2. Notes
    - game_number will be automatically assigned based on creation order
    - Existing games will be numbered based on their created_at timestamp
*/

-- Add game_number column
ALTER TABLE games ADD COLUMN IF NOT EXISTS game_number SERIAL;

-- Update existing records based on created_at order
WITH numbered_games AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_number
  FROM games
)
UPDATE games
SET game_number = numbered_games.new_number
FROM numbered_games
WHERE games.id = numbered_games.id;

-- Create function to handle game number assignment
CREATE OR REPLACE FUNCTION handle_new_game_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.game_number IS NULL THEN
    SELECT COALESCE(MAX(game_number), 0) + 1
    INTO NEW.game_number
    FROM games;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new games
DROP TRIGGER IF EXISTS set_new_game_number ON games;
CREATE TRIGGER set_new_game_number
  BEFORE INSERT ON games
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_game_number();