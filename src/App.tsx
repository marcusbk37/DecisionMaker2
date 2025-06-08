import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import RecommendationCard from './components/RecommendationCard';
import RatingComponent from './components/RatingComponent';
import YogurtHistoryComponent from './components/YogurtHistory';
import { getRecommendation } from './utils/recommendationAlgorithm';
import { saveRating, getHistory } from './utils/storage';
import { YogurtFlavor, YogurtHistory } from './types/yogurt';
import { RotateCcw } from 'lucide-react';

function AppContent() {
  const [currentFlavor, setCurrentFlavor] = useState<YogurtFlavor | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [history, setHistory] = useState<YogurtHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
            onClick={loadInitialData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      <div className="container mx-auto px-4 py-8">
        <Header onAuthClick={handleAuthClick} />
        
        <div className="mt-8 mb-12">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            currentFlavor && (
              <>
                {isRating ? (
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
                )}
              </>
            )
          )}
          
          {!isRating && !isLoading && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleNewRecommendation}
                className="flex items-center px-4 py-2 text-sm text-purple-700 
                         hover:text-purple-900 transition-colors duration-200
                         focus:outline-none"
              >
                <RotateCcw size={16} className="mr-1" />
                Get another recommendation
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-purple-800">Your Flavor Journey</h2>
            <button
              onClick={toggleHistory}
              className="px-4 py-2 text-sm bg-purple-200 text-purple-800 rounded-lg
                       hover:bg-purple-300 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>
          
          {showHistory && (
            <YogurtHistoryComponent history={history} />
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose} 
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