/*
  # Initial Schema Setup for Gin Rummy Tracker

  1. New Tables
    - `games`
      - `id` (uuid, primary key)
      - `date` (date, when the game was played)
      - `winner` (text, either 'Brady' or 'Jenny')
      - `score` (integer, game score)
      - `went_first` (text, either 'Brady' or 'Jenny')
      - `knock` (boolean, if someone knocked)
      - `undercut_by` (text, optional, who undercut)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `games` table
    - Add policies for authenticated users to read/write data
*/

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  winner text NOT NULL CHECK (winner IN ('Brady', 'Jenny')),
  score integer NOT NULL,
  went_first text NOT NULL CHECK (went_first IN ('Brady', 'Jenny')),
  knock boolean NOT NULL DEFAULT false,
  undercut_by text CHECK (undercut_by IN ('Brady', 'Jenny')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();