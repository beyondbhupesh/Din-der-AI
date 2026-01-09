import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Restaurant, User } from '../../types';

interface SwipeScreenProps {
  restaurants: Restaurant[];
  users: User[];
  onSwipeRight: (restaurantId: string) => void;
}

// Fisher-Yates Shuffle
const shuffleArray = (array: Restaurant[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const SwipeScreen: React.FC<SwipeScreenProps> = ({ restaurants, users, onSwipeRight }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Gesture State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [swipeResult, setSwipeResult] = useState<'left' | 'right' | null>(null);
  
  // Local state just for UI feedback (Your Likes sidebar)
  const [likedRestaurants, setLikedRestaurants] = useState<Set<string>>(new Set());

  // Refs
  const cardRef = useRef<HTMLDivElement>(null);

  const deck = useMemo(() => {
    const limit = restaurants.slice(0, 25);
    return shuffleArray(limit);
  }, [restaurants]);

  const currentRestaurant = deck[currentIndex];
  const nextRestaurant = deck[currentIndex + 1];
  const isFinished = currentIndex >= deck.length;

  const completeSwipe = (direction: 'left' | 'right') => {
    setSwipeResult(direction);
    
    setTimeout(() => {
        handleSwipeAction(direction);
        setSwipeResult(null);
        setDragOffset({ x: 0, y: 0 });
        setIsDragging(false);
        setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const handleSwipeAction = (direction: 'left' | 'right') => {
      if (direction === 'right') {
          const newLikes = new Set(likedRestaurants);
          newLikes.add(currentRestaurant.id);
          setLikedRestaurants(newLikes);
          onSwipeRight(currentRestaurant.id);
      }
  };

  const handleStart = (clientX: number, clientY: number) => {
      if (isFinished) return;
      setIsDragging(true);
      setDragStart({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging || isFinished) return;
      const x = clientX - dragStart.x;
      const y = clientY - dragStart.y;
      setDragOffset({ x, y });
  };

  const handleEnd = () => {
      if (!isDragging) return;
      const threshold = 120;
      if (dragOffset.x > threshold) {
          completeSwipe('right');
      } else if (dragOffset.x < -threshold) {
          completeSwipe('left');
      } else {
          setIsDragging(false);
          setDragOffset({ x: 0, y: 0 });
      }
  };

  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY);
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => { if(isDragging) handleEnd(); };

  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => handleEnd();

  const manualSwipe = (dir: 'left' | 'right') => {
      if (swipeResult || isFinished) return; 
      completeSwipe(dir);
  };

  const getCardStyle = () => {
      if (swipeResult) {
          const x = swipeResult === 'right' ? window.innerWidth : -window.innerWidth;
          const rotation = swipeResult === 'right' ? 45 : -45;
          return {
              transform: `translate(${x}px, 0px) rotate(${rotation}deg)`,
              transition: 'transform 0.4s ease-out',
              opacity: 0,
          };
      }
      if (isDragging) {
          const rotation = dragOffset.x * 0.05; 
          return {
              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
              transition: 'none',
              cursor: 'grabbing',
          };
      }
      return {
          transform: 'translate(0px, 0px) rotate(0deg)',
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
          cursor: 'grab',
      };
  };

  const likeOpacity = Math.max(0, Math.min(dragOffset.x / 100, 1));
  const nopeOpacity = Math.max(0, Math.min(-dragOffset.x / 100, 1));

  const getBorderColor = () => {
      if (likeOpacity > 0.5) return 'border-green-400';
      if (nopeOpacity > 0.5) return 'border-red-400';
      return 'border-gray-100 dark:border-gray-700';
  };

  return (
    <div 
        className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 md:p-6 gap-6 h-[calc(100vh-80px)] overflow-hidden select-none"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
        
      {/* Sidebar: Group Status */}
      <aside className="hidden lg:flex flex-col w-80 bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden h-full z-10">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <h2 className="text-lg font-bold mb-1">Your Group</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Everyone must swipe right to match!</p>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar">
            {users.map(user => (
                <div key={user.id} className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${user.isHost ? 'bg-primary/10 dark:bg-primary/20 border border-primary/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                    <div className="relative">
                        <img alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800" src={user.avatar} />
                        {user.status === 'active' && (
                             <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <span className="material-icons-round text-[10px] text-white">check</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name} {user.isHost && '(Host)'}</p>
                        <p className={`text-xs font-medium ${user.status === 'active' ? 'text-green-500' : user.isHost ? 'text-primary' : 'text-gray-400'}`}>
                            {user.status === 'active' ? 'Swiping' : 'Idle'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-grow flex flex-col h-full relative z-0">
        
        <div className="flex-none flex justify-center py-2 z-20">
            <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-sm rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700">
                <span className="material-icons-round text-primary text-sm">place</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    {deck.length} Places Found
                </span>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    {currentIndex + 1} / {deck.length}
                </span>
            </div>
        </div>

        <div className="flex-grow relative flex items-center justify-center perspective-1000 z-10">
            
            {/* Finished State */}
            {isFinished && (
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in-up max-w-sm mx-auto">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-icons-round text-4xl text-gray-400">done_all</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">That's everyone!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Waiting for your friends to finish swiping...</p>
                    <div className="animate-pulse flex justify-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animation-delay-200"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animation-delay-400"></div>
                    </div>
                </div>
            )}

            {/* Background Card (Next) */}
            {!isFinished && nextRestaurant && (
                 <div className="absolute w-full max-w-sm md:max-w-md h-[400px] md:h-[450px] bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 transform scale-95 translate-y-4 opacity-40 -z-10 overflow-hidden transition-transform duration-300 flex items-center justify-center p-8">
                    <div className="text-center space-y-4 opacity-20">
                        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                    </div>
                 </div>
            )}

            {/* Active Card */}
            {!isFinished && currentRestaurant && (
            <div 
                ref={cardRef}
                className={`absolute w-full max-w-sm md:max-w-md h-[400px] md:h-[450px] bg-white dark:bg-card-dark rounded-3xl shadow-2xl border-2 overflow-hidden flex flex-col z-20 touch-none items-center justify-center p-8 text-center ${getBorderColor()}`}
                style={getCardStyle()}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
            >
                {/* Visual Feedback Stamps */}
                <div 
                    className="absolute top-12 left-12 border-4 border-green-500 text-green-500 rounded-lg px-4 py-2 transform -rotate-12 z-30 font-black text-4xl uppercase tracking-widest pointer-events-none transition-opacity duration-200"
                    style={{ opacity: likeOpacity }}
                >
                    LIKE
                </div>
                <div 
                    className="absolute top-12 right-12 border-4 border-red-500 text-red-500 rounded-lg px-4 py-2 transform rotate-12 z-30 font-black text-4xl uppercase tracking-widest pointer-events-none transition-opacity duration-200"
                    style={{ opacity: nopeOpacity }}
                >
                    NOPE
                </div>

                <div className="flex-grow flex flex-col items-center justify-center pointer-events-none space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-center items-center gap-2 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">
                            <span>{currentRestaurant.cuisine}</span>
                            <span>•</span>
                            <span>{currentRestaurant.price}</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tight px-4 break-words">
                            {currentRestaurant.name}
                        </h2>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                            <span className="material-icons-round text-sm">star</span>
                            {currentRestaurant.rating}
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                            <span className="material-icons-round text-sm">near_me</span>
                            {currentRestaurant.distance}
                        </span>
                    </div>

                    <div className="flex gap-2 flex-wrap justify-center max-w-xs">
                        {currentRestaurant.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-3 py-1 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wide rounded-lg border border-gray-100 dark:border-gray-700">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-6 flex flex-col items-center gap-4 w-full opacity-30">
                    <div className="h-px w-12 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex justify-center items-center gap-8 text-gray-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest pointer-events-none">
                        <div className="flex items-center gap-1"><span className="material-icons-round text-xs">west</span> Swipe Nope</div>
                        <div className="flex items-center gap-1">Swipe Like <span className="material-icons-round text-xs">east</span></div>
                    </div>
                </div>
            </div>
            )}
        </div>

        {!isFinished && (
            <div className="flex-none h-28 flex justify-center items-center gap-6 pb-2 z-30">
                <button 
                    onClick={() => manualSwipe('left')}
                    className="group w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer transform"
                    title="Nope"
                >
                    <span className="material-icons-round text-3xl group-hover:-rotate-12 transition-transform">close</span>
                </button>
                
                <button 
                    className="group w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer transform"
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    title="Undo"
                >
                    <span className={`material-icons-round text-2xl ${currentIndex === 0 ? 'opacity-30' : ''}`}>undo</span>
                </button>
                
                <button 
                    onClick={() => manualSwipe('right')}
                    className="group w-16 h-16 rounded-full bg-gradient-to-tr from-secondary to-teal-300 shadow-lg shadow-teal-200 dark:shadow-teal-900/30 text-white hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer transform"
                    title="Like"
                >
                    <span className="material-icons-round text-3xl font-bold group-hover:scale-125 transition-transform">favorite</span>
                </button>
            </div>
        )}
      </section>

      {/* Right Sidebar: Matches */}
      <aside className="hidden xl:flex flex-col w-72 bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden h-full z-10">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold flex items-center gap-2">
                You Liked
                <span className="bg-primary text-white text-xs py-0.5 px-2 rounded-full">{likedRestaurants.size}</span>
            </h2>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar">
            {likedRestaurants.size === 0 ? (
                <div className="text-center text-gray-400 mt-10">
                    <span className="material-icons-round text-4xl mb-2">favorite_border</span>
                    <p className="text-sm">Swipe right to save restaurants!</p>
                </div>
            ) : (
                deck.filter(r => likedRestaurants.has(r.id)).map(r => (
                    <div key={r.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative group cursor-pointer hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-1">{r.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">{r.cuisine} • {r.price}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                <span className="material-icons-round text-[10px] text-yellow-500">star</span>
                                {r.rating}
                            </span>
                            <span className="material-icons-round text-primary text-sm">favorite</span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </aside>

    </div>
  );
};

export default SwipeScreen;