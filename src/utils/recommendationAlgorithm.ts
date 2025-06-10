import { YogurtFlavor } from '../types/yogurt';
import { supabase } from '../lib/supabase';
import { ThompsonSampler } from './thompsonsampling';

// Sample flavors data for recommendations
const sampleFlavors = [
  {
    id: '1',
    name: 'Strawberry',
    description: 'Sweet and tangy with real strawberry pieces.',
    ratings: [2,1,3,5,8,12,15,20,18,10,6]
  },
  {
    id: '2',
    name: 'Blueberry',
    description: 'Rich in antioxidants with a bold berry flavor.',
    ratings: [1,2,2,4,6,10,18,22,15,12,8]
  },
  {
    id: '3',
    name: 'Vanilla',
    description: 'Smooth and creamy with classic vanilla bean.',
    ratings: [1,1,2,3,5,8,12,25,20,15,8]
  },
  {
    id: '4',
    name: 'Greek Honey',
    description: 'Thick Greek yogurt swirled with natural honey.',
    ratings: [2,1,1,3,4,9,14,18,22,16,10]
  },
  {
    id: '5',
    name: 'Peach',
    description: 'Summer peaches blended into creamy yogurt.',
    ratings: [1,2,3,4,7,11,16,19,17,13,7]
  },
  {
    id: '6',
    name: 'Coconut',
    description: 'Tropical coconut flakes in a creamy base.',
    ratings: [3,2,4,6,8,12,15,18,14,11,7]
  },
  {
    id: '7',
    name: 'Mixed Berry',
    description: 'A medley of strawberries, blueberries, and raspberries.',
    ratings: [1,1,2,4,6,10,15,21,19,14,7]
  },
  {
    id: '8',
    name: 'Lemon',
    description: 'Zesty lemon flavor with a refreshing tang.',
    ratings: [2,3,4,7,9,13,16,17,15,10,4]
  },
  {
    id: '9',
    name: 'Mango',
    description: 'Sweet tropical mango with a smooth finish.',
    ratings: [1,1,1,2,4,7,11,20,23,18,12]
  },
  {
    id: '10',
    name: 'Plain',
    description: 'Simple, versatile yogurt with no added flavors.',
    ratings: [4,3,5,8,12,15,18,16,12,5,2]
  },
  {
    id: '11',
    name: 'Cherry',
    description: 'Sweet black cherries in a creamy yogurt base.',
    ratings: [2,2,3,5,7,12,17,20,16,11,5]
  },
  {
    id: '12',
    name: 'Coffee',
    description: 'Rich coffee flavor perfect for mornings.',
    ratings: [3,4,5,8,10,14,16,18,13,7,2]
  }
];

export const getRecommendation = async (): Promise<YogurtFlavor> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Must be authenticated to get recommendations');
    }

    // Get user's created flavors from the database
    const { data: ratingsData, error } = await supabase
      .from('user_ratings')
      .select('flavor_name, flavor_description, ratings_array, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }); // Order by creation time

    if (error) {
      console.error('Error fetching ratings data:', error);
      throw new Error('Failed to fetch your flavors');
    }

    if (!ratingsData || ratingsData.length === 0) {
      throw new Error('No flavors found. Try adding some flavors first!');
    }

    // Convert to array and add IDs - no need for Map since we're not aggregating anymore
    const flavors = ratingsData.map((record, index) => ({
      id: (index + 1).toString(),
      name: record.flavor_name,
      description: record.flavor_description,
      ratings: record.ratings_array
    }));

    // Use thompson sampling to get the recommendation
    const thompsonSampler = new ThompsonSampler(flavors.length);
    const chosenFlavorIndex = thompsonSampler.sample();
    return flavors[chosenFlavorIndex];

  } catch (error: any) {
    console.error('Error in getRecommendation:', error);
    throw error;
  }
};

const getRandomFlavor = (): YogurtFlavor => {
  const randomIndex = Math.floor(Math.random() * sampleFlavors.length);
  return sampleFlavors[randomIndex];
};

export const getFlavorById = async (id: string): Promise<YogurtFlavor | undefined> => {
  // Since we don't have a flavors table anymore, we'll use the sample data
  return sampleFlavors.find(flavor => flavor.id === id);
};

export const getFlavorByName = async (name: string): Promise<YogurtFlavor | undefined> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Must be authenticated to view flavors');
  }

  // Try to get from database - only user's own flavors
  try {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('flavor_name, flavor_description, ratings_array')
      .eq('user_id', user.id)
      .eq('flavor_name', name)
      .single();

    if (!error && data) {
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: data.flavor_name,
        description: data.flavor_description,
        ratings: data.ratings_array
      };
    }
  } catch (error) {
    console.error('Error fetching flavor by name:', error);
  }

  return undefined;
};