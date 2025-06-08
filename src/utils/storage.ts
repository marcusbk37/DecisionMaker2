import { YogurtRating, YogurtHistory } from '../types/yogurt';
import { supabase } from '../lib/supabase';

export const saveRating = async (rating: YogurtRating): Promise<void> => {
  try {
    console.log('Starting saveRating with:', rating);

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Save to database for authenticated users
      console.log('User authenticated, saving to database');
      
      // First check if the record exists
      const { data: existingRecord } = await supabase
        .from('user_ratings')
        .select('id, ratings_array')
        .eq('user_id', user.id)
        .eq('flavor_name', rating.flavorName)
        .single();

      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('user_ratings')
          .update({
            user_rating: rating.rating
          })
          .eq('id', existingRecord.id)
          .select();

        if (error) {
          console.error('Error updating rating in database:', error);
          throw error;
        }

        console.log('Rating updated in database:', data);

        // Update the ratings array for this specific record
        if (data && data[0]) {
          await updateRatingsArray(data[0].id, rating.rating);
        }
      } else {
        // Insert new record - I don't know when you would have to do this
        const { data, error } = await supabase
          .from('user_ratings')
          .insert({
            user_id: user.id,
            flavor_name: rating.flavorName,
            flavor_description: rating.flavorDescription,
            user_rating: rating.rating,
            ratings_array: [1,1,1,1,1,1,1,1,1,1,1] // Initialize with 1s for new records
          })
          .select();

        if (error) {
          console.error('Error saving rating to database:', error);
          throw error;
        }

        console.log('New rating saved to database:', data);

        // Update the ratings array for this specific record
        if (data && data[0]) {
          await updateRatingsArray(data[0].id, rating.rating);
        }
      }
    } else {
      // Save to localStorage for non-authenticated users
      console.log('User not authenticated, saving to localStorage');
      const history = await getLocalHistory();
      history.push({
        flavorName: rating.flavorName,
        flavorDescription: rating.flavorDescription,
        rating: rating.rating,
        date: rating.date
      });
      localStorage.setItem('yogurt_history', JSON.stringify(history));
    }

  } catch (error) {
    console.error('Error saving rating:', error);
    throw error;
  }
};

const updateRatingsArray = async (recordId: string, rating: number): Promise<void> => {
  try {
    // Get current ratings array for this record
    const { data: currentData, error: fetchError } = await supabase
      .from('user_ratings')
      .select('ratings_array')
      .eq('id', recordId)
      .single();

    if (fetchError) {
      console.error('Error fetching current ratings:', fetchError);
      return;
    }

    // Update the ratings array
    const currentRatings = currentData?.ratings_array || [0,0,0,0,0,0,0,0,0,0,0];
    const newRatings = [...currentRatings];
    newRatings[rating] = (newRatings[rating] || 0) + 1;

    // Update the database
    const { error: updateError } = await supabase
      .from('user_ratings')
      .update({ ratings_array: newRatings })
      .eq('id', recordId);

    if (updateError) {
      console.error('Error updating ratings array:', updateError);
    } else {
      console.log('Ratings array updated successfully');
    }
  } catch (error) {
    console.error('Error updating ratings array:', error);
  }
};

export const getHistory = async (): Promise<YogurtHistory[]> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get from database for authenticated users
      const { data, error } = await supabase
        .from('user_ratings')
        .select('flavor_name, flavor_description, user_rating, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history from database:', error);
        return await getLocalHistory();
      }

      return data.map(item => ({
        flavorName: item.flavor_name,
        flavorDescription: item.flavor_description,
        rating: item.user_rating,
        date: item.created_at
      }));
    } else {
      // Get from localStorage for non-authenticated users
      return await getLocalHistory();
    }
  } catch (error) {
    console.error('Error getting history:', error);
    return await getLocalHistory();
  }
};

const getLocalHistory = async (): Promise<YogurtHistory[]> => {
  const history = localStorage.getItem('yogurt_history');
  return history ? JSON.parse(history) : [];
};

export const clearData = async (): Promise<void> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Clear from database for authenticated users
      const { error } = await supabase
        .from('user_ratings')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing database history:', error);
      }
    }
    
    // Also clear localStorage
    localStorage.removeItem('yogurt_history');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

export const addNewFlavor = async (
  flavorName: string,
  description: string
): Promise<void> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Must be authenticated to add new flavors');
    }

    // Check if flavor already exists
    const { data: existingFlavor } = await supabase
      .from('user_ratings')
      .select('id')
      .eq('flavor_name', flavorName)
      .single();

    if (existingFlavor) {
      throw new Error('This flavor already exists');
    }

    // Add the new flavor
    const { error } = await supabase
      .from('user_ratings')
      .insert({
        user_id: user.id,
        flavor_name: flavorName,
        flavor_description: description,
        user_rating: 0, // No rating yet - and can use this 0 to see that (because there is no other way to rate a 0)
        ratings_array: [1,1,1,1,1,1,1,1,1,1,1] // Initialize with 1s for new records
      });

    if (error) {
      console.error('Error adding new flavor:', error);
      throw error;
    }

    console.log('New flavor added successfully');
  } catch (error) {
    console.error('Error in addNewFlavor:', error);
    throw error;
  }
};