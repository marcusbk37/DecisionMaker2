import React, { useState } from 'react';
import { YogurtFlavor } from '../types/yogurt';
import StarRating from './StarRating';
import { ThumbsUp } from 'lucide-react';

interface RatingComponentProps {
  flavor: YogurtFlavor;
  onRated: (rating: number) => void;
  onSkip: () => void;
}

const RatingComponent: React.FC<RatingComponentProps> = ({ 
  flavor, 
  onRated,
  onSkip
}) => {
  const [rating, setRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRatingChange = (value: number) => {
    setRating(value);
  };

  const handleSubmit = () => {
    if (rating > 0) {
      setIsSubmitted(true);
      setTimeout(() => {
        onRated(rating);
      }, 1500);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto 
                      border-2 border-purple-200 text-center">
        <div className="flex flex-col items-center justify-center h-40">
          <ThumbsUp className="text-purple-600 mb-4\" size={48} />
          <h3 className="text-xl font-bold text-purple-800 mb-2">Thanks for rating!</h3>
          <p className="text-purple-600">
            Your feedback helps us make better recommendations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto 
                    border-2 border-purple-200">
      <h2 className="text-xl font-bold text-purple-800 mb-4">
        Rate {flavor.name} Yogurt
      </h2>
      
      <p className="text-gray-700 mb-6">
        How much did you enjoy this flavor?
      </p>
      
      <div className="flex justify-center mb-6">
        <StarRating
          initialRating={rating}
          onChange={handleRatingChange}
          size={32}
        />
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onSkip}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg
                     hover:bg-gray-300 transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Skip
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className={`px-6 py-2 rounded-lg shadow transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-purple-400
                    ${rating > 0 
                      ? 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Submit Rating
        </button>
      </div>
    </div>
  );
};

export default RatingComponent;