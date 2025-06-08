import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface AddFlavorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (flavorName: string, description: string) => void;
}

const AddFlavorModal: React.FC<AddFlavorModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [flavorName, setFlavorName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flavorName.trim() && description.trim()) {
      onSubmit(flavorName.trim(), description.trim());
      setFlavorName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-800">Add New Flavor</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="flavorName" className="block text-gray-700 font-medium mb-2">
              Flavor Name
            </label>
            <input
              type="text"
              id="flavorName"
              value={flavorName}
              onChange={(e) => setFlavorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="e.g., Strawberry Swirl"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[100px]"
              placeholder="Describe the flavor..."
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 
                       transform transition-all duration-200 active:scale-95 
                       focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              Add Flavor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFlavorModal; 