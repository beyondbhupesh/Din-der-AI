import React, { useState, useEffect } from 'react';

interface LandingScreenProps {
  onJoin: (name: string, code: string) => void;
  onHost: (name: string) => void;
  initialCode?: string;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onJoin, onHost, initialCode }) => {
  const [name, setName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [mode, setMode] = useState<'start' | 'join' | null>(null);

  useEffect(() => {
    if (initialCode) {
      setSessionCode(initialCode);
      setMode('join');
    }
  }, [initialCode]);

  const handleStart = () => {
    if (!name.trim()) return;
    onHost(name);
  };

  const handleJoin = () => {
    if (!name.trim() || !sessionCode.trim()) return;
    onJoin(name, sessionCode);
  };

  return (
    <main className="relative flex-grow flex flex-col items-center justify-center px-4 transition-all duration-500 ease-out">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md mx-auto text-center space-y-12 animate-fade-in-up">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-block p-4 rounded-3xl bg-white dark:bg-gray-800 shadow-xl shadow-primary/10 mb-4 transform hover:scale-105 transition-transform duration-300">
             <span className="text-6xl">🍕</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            No more <br/>
            <span className="text-primary">food fights.</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xs mx-auto">
            Swipe on local restaurants with friends and find a perfect match.
          </p>
        </div>

        {/* Interaction Card */}
        <div className="bg-white dark:bg-card-dark p-2 rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Name Input */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Your Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Foodie Phil"
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl px-4 py-3.5 text-lg font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all"
              />
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {!mode ? (
                // Initial State: Choose Mode
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setMode('start')}
                    disabled={!name.trim()}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all transform active:scale-95 group"
                  >
                    <span className="material-icons-round text-2xl group-hover:animate-bounce">add_circle</span>
                    <span className="font-bold text-sm">Host Group</span>
                  </button>
                  <button 
                    onClick={() => setMode('join')}
                    disabled={!name.trim()}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-white transition-all transform active:scale-95"
                  >
                    <span className="material-icons-round text-2xl">login</span>
                    <span className="font-bold text-sm">Join Friend</span>
                  </button>
                </div>
              ) : mode === 'start' ? (
                // Host Mode Confirmation
                <div className="space-y-3 animate-fade-in">
                  <button 
                    onClick={handleStart}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Generate Code</span>
                    <span className="material-icons-round">vpn_key</span>
                  </button>
                  <button onClick={() => setMode(null)} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 py-2">
                    Cancel
                  </button>
                </div>
              ) : (
                // Join Mode Input
                <div className="space-y-4 animate-fade-in">
                  <div className="relative">
                     <input 
                      type="text" 
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                      placeholder="Enter Code (e.g. DIN-4004)"
                      className="w-full text-center tracking-widest bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 focus:border-secondary rounded-xl px-4 py-3 text-lg font-bold text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all uppercase"
                      maxLength={8}
                    />
                  </div>
                  <button 
                    onClick={handleJoin}
                    disabled={!sessionCode.trim() || !name.trim()}
                    className="w-full py-4 bg-secondary hover:bg-teal-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-secondary/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{initialCode ? 'Join Session' : 'Enter Lobby'}</span>
                    <span className="material-icons-round">meeting_room</span>
                  </button>
                   <button onClick={() => setMode(null)} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 py-2">
                    Back
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="text-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-full text-xs font-medium">
                <span className="material-icons-round text-sm">info</span>
                <span>To test multiplayer: Open a new tab to join your own session.</span>
             </div>
        </div>

      </div>
    </main>
  );
};

export default LandingScreen;