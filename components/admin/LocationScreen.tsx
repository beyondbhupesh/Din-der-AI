import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface LocationScreenProps {
  onNext: (location: string, radius: number, filters: { prices: string[], rating: number | null }) => void;
  onBack: () => void;
}

// Curated list of major cities in America, Europe, and India
const MAJOR_CITIES = [
  // USA
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", 
  "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA", 
  "Austin, TX", "San Francisco, CA", "Seattle, WA", "Denver, CO", "Boston, MA", 
  "Miami, FL", "Atlanta, GA", "Las Vegas, NV", "Washington, D.C.",
  // Europe
  "London, UK", "Paris, France", "Berlin, Germany", "Madrid, Spain", "Rome, Italy", 
  "Amsterdam, Netherlands", "Dublin, Ireland", "Brussels, Belgium", "Vienna, Austria", 
  "Lisbon, Portugal", "Stockholm, Sweden", "Prague, Czech Republic", "Barcelona, Spain",
  // India
  "Mumbai, India", "Delhi, India", "Bangalore, India", "Hyderabad, India", 
  "Chennai, India", "Kolkata, India", "Pune, India", "Ahmedabad, India", 
  "Jaipur, India", "Surat, India", "Lucknow, India"
];

const LocationScreen: React.FC<LocationScreenProps> = ({ onNext, onBack }) => {
  const [radius, setRadius] = useState(5);
  const [locationInput, setLocationInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Filter States (Sliders)
  const [priceLevel, setPriceLevel] = useState<number>(2); // Default $$ (2)
  const [ratingLevel, setRatingLevel] = useState<number>(4.0); // Default 4.0 stars
  
  // Typeahead state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Trigger geolocation immediately on mount
  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);
    
    if (locationStatus === 'success' && value !== 'Current Location') {
        setLocationStatus('idle');
    }

    if (value.length > 0) {
        const filtered = MAJOR_CITIES.filter(city => 
            city.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 5)); // Limit to top 5 matches
        setShowSuggestions(true);
    } else {
        setSuggestions([]);
        setShowSuggestions(false);
    }
  };

  const handleSelectCity = (city: string) => {
    setLocationInput(city);
    setShowSuggestions(false);
    setLocationStatus('idle');
  };

  const getSelectedPrices = (level: number) => {
    const allPrices = ['$', '$$', '$$$', '$$$$'];
    return allPrices.slice(0, level);
  };

  const handleNext = () => {
    onNext(
        locationInput, 
        radius, 
        { 
            prices: getSelectedPrices(priceLevel), 
            rating: ratingLevel 
        }
    );
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('idle');
    setErrorMessage('');
    setLocationInput('Finding you...');
    setShowSuggestions(false);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `What is the specific city and neighborhood at latitude ${latitude} and longitude ${longitude}? Return a short, concise location name (e.g. "Downtown, San Francisco").`,
            config: {
              tools: [{ googleMaps: {} }]
            }
          });

          const locationText = response.text?.trim();
          if (locationText) {
            setLocationInput(locationText);
          } else {
            setLocationInput(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
          }
          setLocationStatus('success');
        } catch (error: any) {
          setLocationInput(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
          setLocationStatus('success');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        setLocationStatus('error');
        setLocationInput('');
        const code = error.code || 0;
        switch(code) {
            case 1: setErrorMessage("Location permission denied. Please enter manually."); break;
            case 2: setErrorMessage("Location unavailable. Please enter manually."); break;
            case 3: setErrorMessage("Location request timed out. Please enter manually."); break;
            default: setErrorMessage("We couldn't get your location. Please enter manually.");
        }
        setTimeout(() => inputRef.current?.focus(), 100);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 md:p-8 animate-fade-in relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      
      {/* Centered Configuration Card */}
      <div className="w-full max-w-xl bg-card-light dark:bg-card-dark rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-8 md:p-10 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4 cursor-pointer text-gray-400 hover:text-primary transition-colors inline-flex" onClick={onBack}>
               <span className="material-icons-round text-sm">arrow_back</span>
               <span className="text-xs font-bold uppercase tracking-widest">Back to Lobby</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Setup Search Area</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Fine-tune where and what we'll be looking for.</p>
          </div>

          {/* 1. Location Input Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
                1. Central Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {isLocating ? (
                    <span className="material-icons-round text-primary animate-spin text-xl">refresh</span>
                ) : (
                    <span className={`material-icons-round text-xl ${locationStatus === 'success' ? 'text-green-500' : 'text-gray-400'}`}>
                        {locationStatus === 'success' ? 'check_circle' : 'place'}
                    </span>
                )}
              </div>
              <input 
                ref={inputRef}
                className={`block w-full pl-12 pr-12 py-4 border rounded-2xl leading-5 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-4 sm:text-base transition-all shadow-sm dark:text-white
                    ${locationStatus === 'error' 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100 placeholder-red-300' 
                        : 'border-gray-200 dark:border-gray-600 focus:ring-primary/10 focus:border-primary placeholder-gray-400'
                    }`} 
                placeholder={locationStatus === 'error' ? "Permission denied. Enter manually." : "Search city or neighborhood..."}
                type="text"
                value={locationInput}
                onChange={handleInputChange}
                onFocus={() => {
                    if(locationInput.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
              
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
                 {locationInput && !isLocating && (
                    <button 
                        onClick={() => { setLocationInput(''); setSuggestions([]); }}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
                    >
                        <span className="material-icons-round text-sm">close</span>
                    </button>
                 )}
                 <button 
                    onClick={handleGetLocation}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors group"
                    title="Use Current Location"
                 >
                    <span className="material-icons-round text-primary group-hover:scale-110 transition-transform">my_location</span>
                 </button>
              </div>

              {/* Typeahead Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl mt-2 shadow-2xl max-h-60 overflow-y-auto animate-fade-in-up">
                    {suggestions.map((city, index) => (
                        <li 
                            key={index} 
                            onClick={() => handleSelectCity(city)}
                            className="px-5 py-4 hover:bg-primary/5 dark:hover:bg-gray-700 cursor-pointer text-sm font-medium border-b border-gray-50 dark:border-gray-700 last:border-0 flex items-center gap-3 transition-colors"
                        >
                            <span className="material-icons-round text-gray-400 text-lg">location_city</span>
                            <span className="text-gray-700 dark:text-gray-200">{city}</span>
                        </li>
                    ))}
                </ul>
              )}
            </div>
            
            {locationStatus === 'error' && (
                <p className="text-xs text-red-500 font-medium px-1">
                    <span className="font-bold">Error:</span> {errorMessage}
                </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 2. Distance Slider Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
                  2. Max Distance
                </label>
                <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg text-xs font-mono">{radius} mi</span>
              </div>
              <input 
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary" 
                type="range" 
                min="1" 
                max="50" 
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                <span>Walking</span>
                <span>Driving</span>
              </div>
            </div>

            {/* 3. Price Filter Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
                      3. Max Price
                  </label>
                  <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg text-xs font-mono">
                      {'$'.repeat(priceLevel)}
                  </span>
              </div>
              <input 
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary" 
                type="range" 
                min="1" 
                max="4" 
                step="1"
                value={priceLevel}
                onChange={(e) => setPriceLevel(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                <span>Budget</span>
                <span>Fancy</span>
              </div>
            </div>
          </div>

          {/* 4. Rating Filter Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
                    4. Min Rating
                </label>
                <div className="flex items-center gap-1 text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg text-xs font-mono">
                    <span>{ratingLevel}</span>
                    <span className="material-icons-round text-xs">star</span>
                </div>
            </div>
            <input 
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary" 
                type="range" 
                min="3.0" 
                max="5.0" 
                step="0.5"
                value={ratingLevel}
                onChange={(e) => setRatingLevel(parseFloat(e.target.value))}
            />
          </div>

          <div className="pt-4">
            <button 
              onClick={handleNext}
              disabled={!locationInput || isLocating}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-5 px-6 rounded-2xl shadow-xl shadow-primary/20 transform transition hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
            >
              <span>Find Restaurants</span>
              <span className="material-icons-round">restaurant</span>
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-widest">
                This will start the session for all {MAJOR_CITIES.length > 0 ? 'connected' : ''} friends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationScreen;