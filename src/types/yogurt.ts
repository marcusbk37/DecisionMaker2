export interface YogurtFlavor {
  id: string;
  name: string;
  description: string;
  ratings?: number[]; // Array of 11 integers (counts for ratings 0-10)
}

export interface YogurtRating {
  flavorName: string;
  flavorDescription: string;
  rating: number;
  date: string;
}

export interface YogurtHistory {
  flavorName: string;
  flavorDescription: string;
  rating: number;
  date: string;
}

export interface RatingCount {
  rating: number;
  count: number;
}

export interface UserRatingRecord {
  id: string;
  user_id: string;
  flavor_name: string;
  flavor_description: string;
  user_rating: number;
  ratings_array: number[];
  created_at: string;
  updated_at: string;
}