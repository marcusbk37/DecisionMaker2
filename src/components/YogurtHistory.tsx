import React from 'react';
import { YogurtHistory } from '../types/yogurt';
import { Clock } from 'lucide-react';

interface YogurtHistoryProps {
  history: YogurtHistory[];
}

const HistoryItem: React.FC<{ item: YogurtHistory }> = ({ item }) => {
  const date = new Date(item.date);
  const formattedDate = date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric' 
  });
  
  return (
    <div className="flex items-center justify-between p-3 border-b border-purple-100 
                    hover:bg-purple-50 transition-colors duration-200">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center
                        text-purple-800 font-bold mr-3">
          {item.flavorName.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-purple-800">{item.flavorName}</p>
          <p className="text-xs text-gray-600 mb-1">{item.flavorDescription}</p>
          <div className="flex items-center text-xs text-gray-500">
            <Clock size={12} className="mr-1" />
            {formattedDate}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <span className="text-purple-800 font-medium">{item.rating}/10</span>
      </div>
    </div>
  );
};

const YogurtHistoryComponent: React.FC<YogurtHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        <p>No history yet. Start rating flavors!</p>
      </div>
    );
  }

  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-purple-100 p-3">
        <h3 className="font-bold text-purple-800">Your Flavor History</h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {sortedHistory.map((item, index) => (
          <HistoryItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

export default YogurtHistoryComponent;