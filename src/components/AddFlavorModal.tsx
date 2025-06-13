import React, { useState } from 'react';
import { Plus, X, MessageSquare } from 'lucide-react';
import ChatGPT from './ChatGPT';

interface AddFlavorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (flavorName: string, description: string) => void;
  onRate?: (flavorName: string) => void;
}

const AddFlavorModal: React.FC<AddFlavorModalProps> = ({ isOpen, onClose, onSubmit, onRate }) => {
  const [flavorName, setFlavorName] = useState('');
  const [description, setDescription] = useState('');
  const [chatPrompt, setChatPrompt] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showChat, setShowChat] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flavorName.trim() && description.trim()) {
      const trimmedName = flavorName.trim();
      onSubmit(trimmedName, description.trim());
      
      if (onRate) {
        onRate(trimmedName);
      }
      
      setFlavorName('');
      setDescription('');
      setChatPrompt('');
      setCurrentPrompt('');
      onClose();
    }
  };

  const handleSuggestion = (name: string, desc: string) => {
    setFlavorName(name);
    setDescription(desc);
    setShowChat(false);
  };

  const handleChatPrompt = () => {
    if (chatPrompt.trim()) {
      setCurrentPrompt(chatPrompt);
      setShowChat(true);
      setChatPrompt('');
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

        {showChat ? (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-700">Get AI Suggestions</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                Back to Form
              </button>
            </div>
            <ChatGPT onSuggestion={handleSuggestion} initialPrompt={currentPrompt} />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="flavorName" className="block text-gray-700 font-medium">
                  Flavor Name
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPrompt('');
                    setShowChat(true);
                  }}
                  className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                >
                  <MessageSquare size={16} />
                  Get AI Suggestions
                </button>
              </div>
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

            <div className="mb-4">
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

            <div className="mb-6">
              <label htmlFor="chatPrompt" className="block text-gray-700 font-medium mb-2">
                Ask Chat for Another Suggestion
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="chatPrompt"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="e.g., Suggest a tropical flavor..."
                />
                <button
                  type="button"
                  onClick={handleChatPrompt}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 
                           transform transition-all duration-200 active:scale-95 
                           focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!chatPrompt.trim()}
                >
                  <MessageSquare size={20} />
                </button>
              </div>
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
        )}
      </div>
    </div>
  );
};

export default AddFlavorModal; 