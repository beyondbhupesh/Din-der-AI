import React, { useState } from 'react';
import { User } from '../../types';

interface LobbyScreenProps {
  onNext: () => void;
  onCancel: () => void;
  users: User[];
  sessionCode: string;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onNext, onCancel, users, sessionCode }) => {
  const [copyFeedback, setCopyFeedback] = useState<'idle' | 'copied_code' | 'copied_link'>('idle');
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

  const handleShareLink = async () => {
    const shareData = {
      title: 'Join my Dinder AI Group!',
      text: `Let's decide where to eat! Join my session with code: ${sessionCode}`,
      url: joinUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(joinUrl);
        setCopyFeedback('copied_link');
        setTimeout(() => setCopyFeedback('idle'), 2000);
      } catch (err) {
         console.error('Failed to copy link', err);
      }
    }
  };

  const canStart = users.length >= 2;

  return (
    <main className="flex-grow flex items-center justify-center p-4 sm:p-6 animate-fade-in relative">
      
      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowQR(false)}>
           <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-gray-100 dark:border-gray-700 transform transition-all scale-100" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Scan to Join</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Point your camera at the code below</p>
              
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 inline-block mb-6 shadow-inner">
                <img src={qrImageUrl} alt="QR Code" className="w-48 h-48 object-contain rounded-lg" />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-mono mb-6 bg-gray-50 dark:bg-gray-900 py-2 px-4 rounded-full">
                 <span className="material-icons-round text-sm">link</span>
                 <span className="truncate max-w-[200px]">{joinUrl}</span>
              </div>
              
              <button 
                onClick={() => setShowQR(false)} 
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-bold rounded-xl text-gray-800 dark:text-white transition-colors"
              >
                Close
              </button>
           </div>
        </div>
      )}

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Invite Info */}
        <div className="space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-primary font-bold text-sm tracking-wide">
            <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            HOST CONTROL PANEL
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Invite your <span className="text-primary">foodie squad</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              You are the host. Share the code, wait for friends, then set the location to start.
            </p>
          </div>

          {/* Session Code Card */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500"></div>
            <div className="text-center space-y-4 relative z-10">
              <p className="uppercase tracking-widest text-xs font-bold text-gray-400 dark:text-gray-500">SESSION ID</p>
              
              <div 
                className="flex items-center justify-center space-x-3 cursor-pointer select-none transition-transform active:scale-95" 
                onClick={handleCopyCode}
                title="Click to copy code"
              >
                <span className="text-5xl font-black text-gray-800 dark:text-white tracking-widest group-hover:text-primary transition-colors">{sessionCode}</span>
                <span className={`material-icons-round text-3xl transition-colors ${copyFeedback === 'copied_code' ? 'text-green-500' : 'text-gray-400 group-hover:text-primary'}`}>
                  {copyFeedback === 'copied_code' ? 'check_circle' : 'content_copy'}
                </span>
              </div>
              
              {copyFeedback === 'copied_code' && (
                 <p className="text-xs text-green-500 font-bold animate-pulse">Code Copied!</p>
              )}
              
              <div className="pt-4 flex justify-center gap-3">
                <button 
                  onClick={handleShareLink}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg transition-all text-sm font-semibold border ${
                    copyFeedback === 'copied_link' 
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border-transparent'
                  }`}
                >
                  <span className="material-icons-round text-base">
                    {copyFeedback === 'copied_link' ? 'check' : 'ios_share'}
                  </span>
                  <span>{copyFeedback === 'copied_link' ? 'Link Copied' : 'Share Link'}</span>
                </button>
                <button 
                  onClick={() => setShowQR(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-semibold text-gray-700 dark:text-gray-200 border border-transparent"
                >
                  <span className="material-icons-round text-base">qr_code</span>
                  <span>Show QR</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: User List */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-xl p-8 h-full min-h-[500px] flex flex-col justify-between relative border border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Who's In?</h2>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                {users.length} Joined
              </span>
            </div>

            <div className="space-y-4">
              {users.map((user) => (
                <div 
                  key={user.id}
                  className={`flex items-center space-x-4 p-3 rounded-xl transition-colors ${
                    user.isHost 
                      ? 'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
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
                      {user.name} {user.isHost && '(You)'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.isHost ? 'Host' : 'Ready'}</p>
                  </div>
                </div>
              ))}
              
              {!canStart && (
                <div className="flex items-center space-x-4 p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 opacity-60 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="material-icons-round text-gray-400">person_add</span>
                    </div>
                    <div className="flex-1">
                    <h4 className="font-bold text-gray-500 dark:text-gray-400 italic">Waiting for friends...</h4>
                    </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            {!canStart && (
                 <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex items-start gap-2">
                    <span className="material-icons-round text-lg mt-0.5">info</span>
                    <div>
                        <strong>Testing this?</strong> Open a new tab and join with code <span className="font-mono font-bold bg-white dark:bg-gray-800 px-1 rounded">{sessionCode}</span> to simulate a guest.
                    </div>
                 </div>
            )}
            
            <button 
              onClick={onNext}
              disabled={!canStart}
              className="w-full py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <span>{canStart ? 'Set Location' : 'Waiting for Guest'}</span>
              <span className="material-icons-round">arrow_forward</span>
            </button>
            <button 
              onClick={onCancel}
              className="w-full mt-3 py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm font-semibold transition-colors"
            >
              Disband Group
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LobbyScreen;