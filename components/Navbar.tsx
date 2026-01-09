import React from 'react';
import { AppScreen } from '../types';

interface NavbarProps {
  currentScreen: AppScreen;
  goToScreen: (screen: AppScreen) => void;
  sessionCode?: string;
}

const Navbar: React.FC<NavbarProps> = ({ currentScreen, goToScreen, sessionCode }) => {
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="relative z-50 w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto transition-all">
      <div 
        className="flex items-center gap-2 cursor-pointer group" 
        onClick={() => goToScreen(AppScreen.LANDING)}
      >
        <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
          <span className="material-icons-round text-primary text-2xl">restaurant_menu</span>
        </div>
        <span className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
          Dinder <span className="text-primary">AI</span>
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        {currentScreen !== AppScreen.LANDING && sessionCode && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 tracking-wider">{sessionCode}</span>
          </div>
        )}

        <button 
          onClick={toggleDarkMode}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
        >
          <span className="material-icons-round dark:hidden">dark_mode</span>
          <span className="material-icons-round hidden dark:block">light_mode</span>
        </button>
        
        {currentScreen !== AppScreen.LANDING && (
           <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-white dark:border-gray-700 shadow-sm overflow-hidden">
            <img 
              src="https://api.dicebear.com/9.x/micah/svg?seed=Felix" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;