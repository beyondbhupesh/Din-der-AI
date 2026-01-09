import React, { useEffect } from 'react';
import { Restaurant, User } from '../../types';

interface MatchScreenProps {
  restaurant: Restaurant;
  users: User[];
  onReset: () => void;
}

const MatchScreen: React.FC<MatchScreenProps> = ({ restaurant, users, onReset }) => {
  
  // Celebration items: Pizzas and Hearts
  const items = ['🍕', '❤️', '🍕', '💖', '🍕', '💘', '🍕', '💝'];
  
  const confettiPieces = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    char: items[i % items.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1}s`,
    duration: `${2 + Math.random() * 3}s`,
    fontSize: `${1.5 + Math.random()}rem`
  }));

  const handleOpenMaps = () => {
    if (restaurant.googleMapsUri) {
        window.open(restaurant.googleMapsUri, '_blank');
    } else {
        // Fallback to search query
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.distance)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Falling Elements Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces.map((piece) => (
             <div 
                key={piece.id}
                className="absolute animate-fall"
                style={{
                    left: piece.left,
                    top: '-10%',
                    fontSize: piece.fontSize,
                    animation: `fall ${piece.duration} linear forwards ${piece.delay}`
                }}
             >
               {piece.char}
             </div>
        ))}
      </div>

      <div className="relative w-full max-w-lg mx-4 transform transition-all animate-bounce-slow">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-yellow-500 to-primary rounded-3xl blur-lg opacity-75 animate-pulse"></div>
        
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          
          {/* Header */}
          <div className="bg-primary/10 p-6 text-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500 drop-shadow-sm mb-1">
              It's a Match!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 font-medium">
               Everyone wants to eat here! 🍕
            </p>
          </div>

          {/* Restaurant Image */}
          <div className="relative h-56 group">
            <img 
                alt={restaurant.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                src={restaurant.image} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-6 text-white">
              <div className="flex justify-between items-end">
                <div>
                   <h2 className="text-3xl font-bold leading-tight mb-1">{restaurant.name}</h2>
                   <p className="text-sm font-medium opacity-90 flex items-center gap-1">
                     <span className="material-icons-round text-sm">location_on</span> {restaurant.distance} • {restaurant.cuisine}
                   </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg flex flex-col items-center">
                   <span className="text-xs font-bold uppercase tracking-wider opacity-80">Rating</span>
                   <div className="flex items-center gap-1">
                      <span className="font-bold text-lg">{restaurant.rating}</span>
                      <span className="material-icons-round text-yellow-400 text-sm">star</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 space-y-6">
            
            {/* Avatars */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
               <span className="text-sm font-bold text-gray-500 dark:text-gray-400">The Squad</span>
               <div className="flex -space-x-2">
                {users.map(u => (
                    <img key={u.id} alt={u.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" src={u.avatar} title={u.name} />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">
                   <span className="material-icons-round text-sm">check</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button 
                onClick={handleOpenMaps}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transform transition hover:-translate-y-1 active:translate-y-0 flex justify-center items-center gap-2 text-lg"
              >
                <span className="material-icons-round">map</span>
                <span>Open in Google Maps</span>
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl text-gray-700 dark:text-gray-200 font-semibold transition-colors">
                  <span className="material-icons-round text-sm">directions</span>
                  Directions
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl text-gray-700 dark:text-gray-200 font-semibold transition-colors">
                  <span className="material-icons-round text-sm">share</span>
                  Share
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
                <button 
                    onClick={onReset}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm font-medium underline transition-colors"
                >
                    Keep Swiping (Find more options)
                </button>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
            will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
};

export default MatchScreen;