import React from 'react';
import { YogurtFlavor } from '../types/yogurt';
import { Sparkles } from 'lucide-react';

interface RecommendationCardProps {
  flavor: YogurtFlavor;
  onRate: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ flavor, onRate }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto 
                    border-2 border-purple-200 transition-all duration-300
                    hover:shadow-xl transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-purple-800">{flavor.name}</h2>
        <Sparkles className="text-purple-500" size={20} />
      </div>
      
      <p className="text-gray-700 mb-6">{flavor.description}</p>
      
      <div className="text-center">
        <button
          onClick={onRate}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow
                     hover:bg-purple-700 transform transition-all duration-200
                     active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          Rate This Flavor
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard