/*
  # Fix game numbering system
  
  1. Changes
    - Add created_order column to track original creation order
    - Update game_number to be based on date and created_order
    - Add function to maintain game numbers when games are added/updated
*/

-- Add created_order column
ALTER TABLE games ADD COLUMN IF NOT EXISTS created_order SERIAL;

-- Function to update game numbers based on date and created_order
CREATE OR REPLACE FUNCTION update_game_numbers()
RETURNS TRIGGER AS $$
BEGIN
  -- Update game numbers for all games
  WITH numbered_games AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        ORDER BY date ASC,  -- First by date
        created_order ASC   -- Then by creation order within same date
      ) as new_number
    FROM games
  )
  UPDATE games
  SET game_number = numbered_games.new_number
  FROM numbered_games
  WHERE games.id = numbered_games.id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_new_game_number ON games;
DROP TRIGGER IF EXISTS update_game_numbers ON games;

-- Create triggers to maintain game numbers
CREATE TRIGGER update_game_numbers
  AFTER INSERT OR UPDATE OF date ON games
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_game_numbers();