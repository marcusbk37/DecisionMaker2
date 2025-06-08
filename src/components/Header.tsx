import React from 'react';
import { Sparkles, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onAuthClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAuthClick }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="py-6 px-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center">
          <Sparkles className="text-purple-600 mr-2" size={24} />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-purple-800">
              Yogurt Flavor Advisor
            </h1>
            <p className="text-purple-700 text-sm md:text-base">
              Discover your perfect yogurt flavor for today
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-purple-800">
                  Welcome back!
                </p>
                <p className="text-xs text-purple-600">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-sm bg-purple-100 text-purple-700 
                         rounded-lg hover:bg-purple-200 transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <LogOut size={16} className="mr-1" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg
                       hover:bg-purple-700 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <User size={16} className="mr-2" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;