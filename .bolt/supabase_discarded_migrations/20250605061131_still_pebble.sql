/*
  # Create Yogurt Rating System Tables

  1. New Tables
    - `yogurt_flavors`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, not null)
    - `yogurt_ratings`
      - `flavor_id` (uuid, foreign key to yogurt_flavors)
      - `rating` (integer, 0-10)
      - `count` (integer, default 0)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policy for authenticated users to update ratings

  3. Constraints
    - Primary key on yogurt_flavors(id)
    - Composite primary key on yogurt_ratings(flavor_id, rating)
    - Check constraint to ensure rating is between 0 and 10
    - Foreign key from yogurt_ratings.flavor_id to yogurt_flavors.id
*/

-- Create yogurt_flavors table
CREATE TABLE IF NOT EXISTS yogurt_flavors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL
);

-- Create yogurt_ratings table
CREATE TABLE IF NOT EXISTS yogurt_ratings (
    flavor_id uuid NOT NULL REFERENCES yogurt_flavors(id),
    rating integer NOT NULL,
    count integer DEFAULT 0,
    PRIMARY KEY (flavor_id, rating),
    CONSTRAINT yogurt_ratings_rating_check CHECK (rating >= 0 AND rating <= 10)
);

-- Enable Row Level Security
ALTER TABLE yogurt_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE yogurt_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for yogurt_flavors
CREATE POLICY "Allow public read access on flavors"
    ON yogurt_flavors
    FOR SELECT
    TO public
    USING (true);

-- Create policies for yogurt_ratings
CREATE POLICY "Allow public read access on ratings"
    ON yogurt_ratings
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow authenticated users to update ratings"
    ON yogurt_ratings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);