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
    // Get aggregated ratings data from the database
    const { data: ratingsData, error } = await supabase
      .from('user_ratings')
      .select('flavor_name, flavor_description, ratings_array')
      .limit(1000); // Get a good sample

    if (error) {
      console.error('Error fetching ratings data:', error);
      // Fallback to sample data
      return getRandomFlavor();
    }

    // Aggregate ratings by flavor
    const flavorMap = new Map();
    
    if (ratingsData && ratingsData.length > 0) {
      ratingsData.forEach(record => {
        const key = record.flavor_name;
        if (!flavorMap.has(key)) {
          flavorMap.set(key, {
            name: record.flavor_name,
            description: record.flavor_description,
            ratings: [...record.ratings_array]
          });
        } else {
          // Aggregate ratings arrays
          const existing = flavorMap.get(key);
          for (let i = 0; i < existing.ratings.length; i++) {
            existing.ratings[i] += record.ratings_array[i] || 0;
          }
        }
      });

      // Convert to array and add IDs
      const flavors = Array.from(flavorMap.values()).map((flavor, index) => ({
        id: (index + 1).toString(),
        ...flavor
      }));

      if (flavors.length > 0) {
        // Use thompson sampling to get the recommendation
        const thompsonSampler = new ThompsonSampler(flavors.length);
        const chosenFlavorIndex = thompsonSampler.sample();
        return flavors[chosenFlavorIndex];

        // Simple recommendation: return a random flavor
        // const randomIndex = Math.floor(Math.random() * flavors.length);
        // return flavors[randomIndex];
      }
    }

    // Fallback to sample data if no database data
    return getRandomFlavor();
  } catch (error) {
    console.error('Error in getRecommendation:', error);
    return getRandomFlavor();
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
  // Try to get from database first
  try {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('flavor_name, flavor_description, ratings_array')
      .eq('flavor_name', name)
      .limit(1)
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

  // Fallback to sample data
  return sampleFlavors.find(flavor => flavor.name === name);
};