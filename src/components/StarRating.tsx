import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  initialRating?: number;
  onChange: (rating: number) => void;
  size?: number;
  maxRating?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  initialRating = 0, 
  onChange,
  size = 24,
  maxRating = 10
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  
  const handleClick = (value: number) => {
    setRating(value);
    onChange(value);
  };

  return (
    <div className="flex items-center">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          className={`transition-transform hover:scale-110 focus:outline-none ${
            hover > 0 
              ? hover >= star 
                ? 'text-yellow-400 transform scale-105' 
                : 'text-gray-300'
              : rating >= star 
                ? 'text-yellow-400' 
                : 'text-gray-300'
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          <Star 
            size={size}
            fill={
              hover > 0 
                ? hover >= star ? 'currentColor' : 'none'
                : rating >= star ? 'currentColor' : 'none'
            }
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;