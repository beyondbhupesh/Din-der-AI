
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import LandingScreen from './components/screens/LandingScreen';
// Admin Imports
import AdminLobbyScreen from './components/admin/LobbyScreen';
import AdminLocationScreen from './components/admin/LocationScreen';
// Guest Imports
import GuestLobbyScreen from './components/guest/LobbyScreen';
// Shared Screens
import SwipeScreen from './components/screens/SwipeScreen';
import MatchScreen from './components/screens/MatchScreen';
import { AppScreen, User, Restaurant } from './types';
import { GoogleGenAI } from "@google/genai";

// Enhanced Image Selector using Unsplash high-quality source
const getHighQualityImage = (vibe: string, cuisine: string) => {
  const query = encodeURIComponent(`${vibe} restaurant ${cuisine}`);
  return `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80&sig=${Math.random()}&keywords=${query}`;
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.LANDING);
  const [matchedRestaurant, setMatchedRestaurant] = useState<Restaurant | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sessionCode, setSessionCode] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [myUserId, setMyUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  
  const likesRegistryRef = useRef<Record<string, Set<string>>>({});
  const channelRef = useRef<BroadcastChannel | null>(null);

  const [initialCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('code') || undefined;
  });

  const processLikeAction = useCallback((userId: string, restaurantId: string, currentUsers: User[], currentRestaurants: Restaurant[]) => {
      const currentLikes = likesRegistryRef.current[restaurantId] || new Set();
      currentLikes.add(userId);
      likesRegistryRef.current[restaurantId] = currentLikes;

      if (currentLikes.size >= currentUsers.length && currentUsers.length > 0) {
          const match = currentRestaurants.find(r => r.id === restaurantId);
          if (match) {
              if (channelRef.current) {
                  channelRef.current.postMessage({
                      type: 'MATCH_FOUND',
                      payload: { restaurant: match }
                  });
              }
              setMatchedRestaurant(match);
              setCurrentScreen(AppScreen.MATCH);
          }
      }
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel('dinder_session_channel');
    channelRef.current = channel;

    const handleMessage = (event: MessageEvent) => {
        const { type, payload } = event.data;
        if (type === 'JOIN_REQUEST') {
            if (isHost) {
                const newUser = payload.user;
                setUsers(prev => {
                    if (prev.find(u => u.id === newUser.id)) return prev;
                    const newUsers = [...prev, newUser];
                    channel.postMessage({
                        type: 'SYNC_STATE',
                        payload: { users: newUsers, screen: currentScreen, restaurants: restaurants }
                    });
                    return newUsers;
                });
            }
        } else if (type === 'SYNC_STATE') {
            if (!isHost) {
                if (payload.users) setUsers(payload.users);
                if (payload.restaurants) setRestaurants(payload.restaurants);
                if (payload.screen) setCurrentScreen(payload.screen);
            }
        } else if (type === 'LIKE_ACTION') {
            if (isHost) {
                processLikeAction(payload.userId, payload.restaurantId, users, restaurants);
            }
        } else if (type === 'MATCH_FOUND') {
            setMatchedRestaurant(payload.restaurant);
            setCurrentScreen(AppScreen.MATCH);
        }
    };

    channel.onmessage = handleMessage;
    return () => channel.close();
  }, [isHost, currentScreen, restaurants, users, processLikeAction]);

  const goToScreen = (screen: AppScreen, overrideData?: { restaurants?: Restaurant[] }) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
    if (isHost && channelRef.current) {
        channelRef.current.postMessage({
            type: 'SYNC_STATE',
            payload: {
                users: users,
                screen: screen,
                restaurants: overrideData?.restaurants || restaurants
            }
        });
    }
  };

  const handleHost = (name: string) => {
    const code = 'DIN-' + Math.floor(1000 + Math.random() * 9000).toString();
    setSessionCode(code);
    setIsHost(true);
    const hostId = Date.now().toString();
    const hostUser: User = {
      id: hostId,
      name,
      avatar: `https://api.dicebear.com/9.x/micah/svg?seed=${name}`,
      isHost: true,
      status: 'active'
    };
    setMyUserId(hostId);
    setUsers([hostUser]);
    goToScreen(AppScreen.LOBBY);
  };

  const handleJoin = (name: string, code: string) => {
    setSessionCode(code);
    setIsHost(false);
    const guestId = Date.now().toString();
    const guestUser: User = {
      id: guestId,
      name,
      avatar: `https://api.dicebear.com/9.x/micah/svg?seed=${name}`,
      isHost: false,
      status: 'active'
    };
    setMyUserId(guestId);
    setUsers([guestUser]);
    if (channelRef.current) {
        channelRef.current.postMessage({ type: 'JOIN_REQUEST', payload: { user: guestUser } });
    }
    goToScreen(AppScreen.LOBBY);
  };

  const handleFetchRestaurants = async (location: string, radius: number, filters: { prices: string[], rating: number | null }) => {
    setIsLoading(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        let constraints = [];
        if (filters.prices.length > 0) constraints.push(`prices ${filters.prices.join('/')}`);
        if (filters.rating) constraints.push(`minimum ${filters.rating} stars`);

        const prompt = `
        Use your internal knowledge and the Google Search tool to find the 20 best-rated and most distinct restaurants currently open in ${location} within ${radius} miles. 
        Apply filters: ${constraints.join(', ')}.
        
        CRITICAL RULES:
        1. Ensure exactly 20 unique restaurants. No repetitions.
        2. If filters are extremely strict, return as many as possible (minimum 1).
        3. For each restaurant, provide a unique "visualVibe" keyword (e.g., "industrial loft bakery", "moody candlelit italian bistro", "neon rooftop bar").
        
        Return ONLY a raw JSON array of objects with keys: 
        "id", "name", "cuisine", "price", "rating", "distance", "tags", "reviews", "visualVibe", "googleMapsUri".
        Do not include markdown formatting.
        `;

        const response = await ai.models.generateContent({
             model: 'gemini-3-pro-preview',
             contents: prompt,
             config: { 
                 tools: [{ googleSearch: {} }],
                 thinkingConfig: { thinkingBudget: 32768 }
             }
        });

        const text = response.text || '';
        const jsonString = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonString);
        
        if (Array.isArray(data)) {
            const finalRestaurants: Restaurant[] = data.map((item: any, index: number) => ({
                id: item.id || `ai-${index}-${Date.now()}`,
                name: item.name || 'Unknown',
                cuisine: item.cuisine || 'Eatery',
                price: item.price || '$$',
                rating: item.rating || 4.0,
                distance: item.distance || 'nearby',
                image: getHighQualityImage(item.visualVibe || item.cuisine, item.cuisine),
                tags: item.tags || [],
                reviews: item.reviews || 0,
                googleMapsUri: item.googleMapsUri
            }));

            setRestaurants(finalRestaurants);
            likesRegistryRef.current = {};
            goToScreen(AppScreen.SWIPE, { restaurants: finalRestaurants });
        }
    } catch (e) {
        console.error("Gemini Error:", e);
        // We do not pad with mock data anymore, per instructions. 
        // We revert if needed but generally rely on Gemini's success.
        goToScreen(AppScreen.LOBBY);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSwipeRight = (restaurantId: string) => {
      if (isHost) {
          processLikeAction(myUserId, restaurantId, users, restaurants);
      } else if (channelRef.current) {
          channelRef.current.postMessage({
              type: 'LIKE_ACTION',
              payload: { userId: myUserId, restaurantId }
          });
      }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar currentScreen={currentScreen} goToScreen={goToScreen} sessionCode={sessionCode} />
      
      {isLoading && (
        <div className="fixed inset-0 z-[60] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
            <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">🍕</div>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-gray-800 dark:text-white">Curating Top 20 Spots...</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-xs">Using advanced reasoning to find high-quality, unique options for your squad.</p>
        </div>
      )}

      {currentScreen === AppScreen.LANDING && (
        <LandingScreen onHost={handleHost} onJoin={handleJoin} initialCode={initialCode} />
      )}

      {currentScreen === AppScreen.LOBBY && (
        isHost ? (
          <AdminLobbyScreen onNext={() => goToScreen(AppScreen.LOCATION)} onCancel={() => goToScreen(AppScreen.LANDING)} users={users} sessionCode={sessionCode} />
        ) : (
          <GuestLobbyScreen onCancel={() => goToScreen(AppScreen.LANDING)} users={users} sessionCode={sessionCode} isHostPicking={false} />
        )
      )}

      {currentScreen === AppScreen.LOCATION && (
        isHost ? (
          <AdminLocationScreen onNext={handleFetchRestaurants} onBack={() => goToScreen(AppScreen.LOBBY)} />
        ) : (
          <GuestLobbyScreen onCancel={() => goToScreen(AppScreen.LANDING)} users={users} sessionCode={sessionCode} isHostPicking={true} />
        )
      )}

      {(currentScreen === AppScreen.SWIPE || currentScreen === AppScreen.MATCH) && (
        <>
            <SwipeScreen restaurants={restaurants} users={users} onSwipeRight={handleSwipeRight} />
            {currentScreen === AppScreen.MATCH && matchedRestaurant && (
                <MatchScreen 
                    restaurant={matchedRestaurant} 
                    users={users} 
                    onReset={() => {
                        setMatchedRestaurant(null);
                        goToScreen(AppScreen.SWIPE);
                    }} 
                />
            )}
        </>
      )}
    </div>
  );
};

export default App;
