import React, { useState } from 'react';
import { User } from '../../types';

interface LobbyScreenProps {
  onCancel: () => void;
  users: User[];
  sessionCode: string;
  isHostPicking: boolean;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onCancel, users, sessionCode, isHostPicking }) => {
  const [copyFeedback, setCopyFeedback] = useState<'idle' | 'copied_code'>('idle');
  const [showQR, setShowQR] = useState(false);

  const joinUrl = `${window.location.origin}?code=${sessionCode}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(joinUrl)}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopyFeedback('copied_code');
      setTimeout(() => setCopyFeedback('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center p-4 sm:p-6 animate-fade-in relative">
      
       {/* QR Code Modal (Guests can invite too) */}
       {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowQR(false)}>
           <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Scan to Join</h3>
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 inline-block mb-6 shadow-inner">
                <img src={qrImageUrl} alt="QR Code" className="w-48 h-48 object-contain rounded-lg" />
              </div>
              <button onClick={() => setShowQR(false)} className="w-full py-3 bg-gray-100 dark:bg-gray-700 font-bold rounded-xl text-gray-800 dark:text-white">Close</button>
           </div>
        </div>
      )}

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Status Info */}
        <div className="space-y-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full font-bold text-sm tracking-wide ${isHostPicking ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${isHostPicking ? 'bg-yellow-500 animate-bounce' : 'bg-gray-400'}`}></span>
            {isHostPicking ? 'HOST IS CHOOSING LOCATION...' : 'WAITING FOR HOST'}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Hang tight, <br/><span className="text-primary">foodie!</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isHostPicking 
                ? "The host is currently selecting the search area. The swiping game will start shortly!" 
                : "Waiting for the host to start the session. You can invite more friends while you wait."}
            </p>
          </div>

          {/* Session Code Card */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Session Code</p>
                   <p className="text-3xl font-black text-gray-800 dark:text-white tracking-widest">{sessionCode}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleCopyCode} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <span className="material-icons-round text-gray-600 dark:text-gray-200">{copyFeedback === 'copied_code' ? 'check' : 'content_copy'}</span>
                    </button>
                    <button onClick={() => setShowQR(true)} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <span className="material-icons-round text-gray-600 dark:text-gray-200">qr_code</span>
                    </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: User List */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-xl p-8 h-full min-h-[500px] flex flex-col justify-between relative border border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Who's Here</h2>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                {users.length} Joined
              </span>
            </div>

            <div className="space-y-4">
              {users.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${user.isHost ? 'border-yellow-400' : 'border-transparent'}`}>
                      <img alt={user.name} className="w-full h-full object-cover" src={user.avatar} />
                    </div>
                    {user.isHost && (
                      <div className="absolute -top-2 -right-1 bg-yellow-400 text-white rounded-full p-0.5 shadow-sm">
                        <span className="material-icons-round text-xs block">star</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {user.name} {user.isHost && '(Host)'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.isHost ? 'Configuring...' : 'Ready'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <button 
              onClick={onCancel}
              className="w-full py-3 text-red-400 hover:text-red-600 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-icons-round">logout</span>
              Leave Group
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LobbyScreen;