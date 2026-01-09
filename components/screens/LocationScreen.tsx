import React, { useState } from 'react';

interface LocationScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const LocationScreen: React.FC<LocationScreenProps> = ({ onNext, onBack }) => {
  const [radius, setRadius] = useState(5);

  return (
    <div className="flex-grow flex flex-col lg:flex-row h-full overflow-hidden animate-fade-in relative">
      {/* Sidebar Controls */}
      <aside className="w-full lg:w-1/3 xl:w-1/4 bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-700 shadow-xl z-20 overflow-y-auto">
        <div className="p-6 space-y-8 h-full flex flex-col">
          <div>
            <div className="flex items-center gap-2 mb-4 cursor-pointer text-gray-400 hover:text-primary transition-colors" onClick={onBack}>
               <span className="material-icons-round text-sm">arrow_back</span>
               <span className="text-xs font-bold uppercase">Back to Group</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Where are we eating?</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Set the search area for your group to start finding matches.</p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Central Location</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons-round text-gray-400">search</span>
              </div>
              <input 
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl leading-5 bg-gray-50 dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-shadow shadow-sm dark:text-white" 
                placeholder="Enter city, neighborhood, or zip" 
                type="text"
                defaultValue="Downtown"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                <span className="material-icons-round text-primary hover:text-orange-600" title="Use current location">my_location</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 cursor-pointer hover:bg-blue-200 transition">
                 Downtown
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 cursor-pointer hover:bg-green-200 transition">
                 Current Location
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Search Radius</label>
              <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg">{radius} mi</span>
            </div>
            <input 
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary" 
              type="range" 
              min="1" 
              max="50" 
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              <span>Walking (1mi)</span>
              <span>Driving (50mi)</span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Quick Filters</label>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-primary bg-primary/5 text-primary rounded-xl font-bold text-sm transition-transform active:scale-95">
                <span className="material-icons-round text-sm">attach_money</span>
                <span>$$ - $$$</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium text-sm transition-colors">
                <span className="material-icons-round text-sm">star</span>
                <span>4.0+ Stars</span>
              </button>
            </div>
          </div>

          <div className="pt-6 mt-auto pb-6">
            <button 
              onClick={onNext}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-lg shadow-primary/30 transform transition hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <span>Find Restaurants</span>
              <span className="material-icons-round">arrow_forward</span>
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">All group members will search in this area.</p>
          </div>
        </div>
      </aside>

      {/* Map Section (Mock) */}
      <section className="relative w-full lg:w-2/3 xl:w-3/4 h-[50vh] lg:h-auto bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {/* CSS Pattern to simulate map */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-10"
          style={{
            backgroundColor: '#e5e5f7',
            backgroundImage: 'repeating-radial-gradient( circle at 0 0, transparent 0, #e5e5f7 40px ), repeating-linear-gradient( #444cf755, #444cf755 )'
          }}
        ></div>
        
        {/* Map UI Elements */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-md flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <span className="material-icons-round">add</span>
          </button>
          <button className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-md flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <span className="material-icons-round">remove</span>
          </button>
        </div>

        {/* Center Marker Area */}
        <div className="absolute inset-0 flex items-center justify-center">
            {/* Radius Circle */}
            <div className="w-64 h-64 md:w-96 md:h-96 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center animate-pulse-slow relative backdrop-blur-sm">
                
                {/* Random Restaurant Dots */}
                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-secondary rounded-full shadow-sm animate-bounce" style={{ animationDelay: '0.1s' }} title="Burger Joint"></div>
                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-secondary rounded-full shadow-sm animate-bounce" style={{ animationDelay: '0.3s' }} title="Pizza Place"></div>
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-secondary rounded-full shadow-sm animate-bounce" style={{ animationDelay: '0.5s' }} title="Sushi Bar"></div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-secondary rounded-full shadow-sm animate-bounce" style={{ animationDelay: '0.7s' }} title="Taco Stand"></div>
                
                {/* Center Pin */}
                <div className="relative z-10 transform -translate-y-1/2">
                    <div className="text-primary drop-shadow-2xl filter transform hover:scale-110 transition-transform cursor-pointer">
                         <span className="material-icons-round text-6xl drop-shadow-lg">location_on</span>
                    </div>
                    <div className="w-4 h-2 bg-black/20 rounded-full blur-sm mx-auto mt-[-4px]"></div>
                    
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold text-gray-700 dark:text-gray-200">
                        Search Center
                        <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 rotate-45"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* User Heads on Map */}
        <div className="absolute top-12 left-12 animate-bounce-slow" style={{ animationDuration: '4s' }}>
           <img alt="User 1" className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=64&h=64" />
        </div>
         <div className="absolute bottom-24 right-32 animate-bounce-slow" style={{ animationDuration: '5s' }}>
           <img alt="User 2" className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64" />
        </div>

      </section>
    </div>
  );
};

export default LocationScreen;
