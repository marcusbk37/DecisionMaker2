/*
  # User Ratings and Profiles

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `created_at` (timestamp)
    - `user_ratings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `flavor_id` (uuid, references yogurt_flavors)
      - `rating` (integer, 0-10)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own data
    - Profiles are automatically created on signup

  3. Functions
    - Trigger to create profile on user signup
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Create user_ratings table
CREATE TABLE IF NOT EXISTS user_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  flavor_id uuid REFERENCES yogurt_flavors(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 0 AND rating <= 10),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, flavor_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- User ratings policies
CREATE POLICY "Users can view own ratings"
  ON user_ratings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ratings"
  ON user_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON user_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();