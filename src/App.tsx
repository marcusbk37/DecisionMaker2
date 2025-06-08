import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import RecommendationCard from './components/RecommendationCard';
import RatingComponent from './components/RatingComponent';
import YogurtHistoryComponent from './components/YogurtHistory';
import AddFlavorModal from './components/AddFlavorModal';
import { getRecommendation } from './utils/recommendationAlgorithm';
import { saveRating, getHistory, addNewFlavor } from './utils/storage';
import { YogurtFlavor, YogurtHistory } from './types/yogurt';
import { RotateCcw, Plus } from 'lucide-react';

function AppContent() {
  const [currentFlavor, setCurrentFlavor] = useState<YogurtFlavor | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [history, setHistory] = useState<YogurtHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddFlavorModal, setShowAddFlavorModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const recommendation = await getRecommendation();
      setCurrentFlavor(recommendation);
      
      const loadedHistory = await getHistory();
      setHistory(loadedHistory);
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error('Error loading initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateClick = () => {
    setIsRating(true);
  };

  const handleRated = async (rating: number) => {
    if (currentFlavor) {
      const ratingData = {
        flavorName: currentFlavor.name,
        flavorDescription: currentFlavor.description,
        rating,
        date: new Date().toISOString()
      };
      
      try {
        await saveRating(ratingData);
        
        const newFlavor = await getRecommendation();
        setCurrentFlavor(newFlavor);
        setIsRating(false);
        
        const updatedHistory = await getHistory();
        setHistory(updatedHistory);
      } catch (err) {
        setError('Failed to save rating. Please try again.');
        console.error('Error saving rating:', err);
      }
    }
  };

  const handleSkip = () => {
    setIsRating(false);
  };

  const handleNewRecommendation = async () => {
    try {
      setIsLoading(true);
      const newFlavor = await getRecommendation();
      setCurrentFlavor(newFlavor);
    } catch (err) {
      setError('Failed to get new recommendation. Please try again.');
      console.error('Error getting new recommendation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFlavor = async (flavorName: string, description: string) => {
    try {
      await addNewFlavor(flavorName, description);
      // Refresh recommendations after adding new flavor
      const newFlavor = await getRecommendation();
      setCurrentFlavor(newFlavor);
    } catch (err: any) {
      setError(err.message || 'Failed to add new flavor. Please try again.');
      console.error('Error adding new flavor:', err);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const handleAuthModalClose = async () => {
    setShowAuthModal(false);
    // Refresh history when auth modal closes (user might have signed in)
    const updatedHistory = await getHistory();
    setHistory(updatedHistory);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadInitialData();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white p-4">
      <Header onAuthClick={handleAuthClick} />
      
      <main className="container mx-auto max-w-4xl pt-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={toggleHistory}
            className="text-purple-700 hover:text-purple-800 font-medium"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddFlavorModal(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg
                       hover:bg-purple-700 transition-colors gap-2"
            >
              <Plus size={20} />
              Add Flavor
            </button>
            
            <button
              onClick={handleNewRecommendation}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-white text-purple-600 rounded-lg
                       hover:bg-purple-50 transition-colors border-2 border-purple-200 gap-2"
            >
              <RotateCcw size={20} />
              New Recommendation
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="mb-8">
            <YogurtHistoryComponent history={history} />
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : (
          currentFlavor && (
            isRating ? (
              <RatingComponent
                flavor={currentFlavor}
                onRated={handleRated}
                onSkip={handleSkip}
              />
            ) : (
              <RecommendationCard
                flavor={currentFlavor}
                onRate={handleRateClick}
              />
            )
          )
        )}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthModalClose}
      />

      <AddFlavorModal
        isOpen={showAddFlavorModal}
        onClose={() => setShowAddFlavorModal(false)}
        onSubmit={handleAddFlavor}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;