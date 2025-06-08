/*
  # Simplify database schema to use only user_ratings table

  1. Changes Made
    - Drop existing tables: user_ratings, profiles, yogurt_flavors
    - Drop trigger function: handle_new_user
    - Create new user_ratings table with embedded flavor information
    - Add RLS policies for authenticated users and public read access
    - Add updated_at trigger functionality

  2. New Table Structure
    - `user_ratings` table contains all flavor info and ratings data
    - Direct reference to auth.users without intermediate profiles table
    - Aggregated ratings stored as integer array in each record

  3. Security
    - Enable RLS on user_ratings table
    - Users can only manage their own ratings
    - Public can read aggregated rating data for recommendations
*/

-- Drop existing tables and their dependencies
DROP TABLE IF EXISTS user_ratings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS yogurt_flavors CASCADE;

-- Drop the trigger function if it exists
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create the new simplified user_ratings table
CREATE TABLE IF NOT EXISTS user_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  flavor_name text NOT NULL,
  flavor_description text NOT NULL,
  user_rating integer NOT NULL CHECK (user_rating >= 0 AND user_rating <= 10),
  ratings_array integer[] DEFAULT '{0,0,0,0,0,0,0,0,0,0,0}'::integer[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one rating per user per flavor
  UNIQUE(user_id, flavor_name)
);

-- Enable RLS
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert own ratings"
  ON user_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own ratings"
  ON user_ratings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON user_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON user_ratings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow public to read aggregated rating data (for recommendations)
CREATE POLICY "Public can view aggregated ratings"
  ON user_ratings
  FOR SELECT
  TO public
  USING (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_ratings_updated_at
  BEFORE UPDATE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();