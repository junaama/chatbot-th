import React, { useState } from 'react';
import AuthModal from './AuthModal';
import AboutModal from './AboutModal';

type HeaderProps ={
  isLoggedIn: boolean;
  user: any;
  logout: () => void;
  handleModeChange: () => void;
  toggleExample: () => void;
  toggleChatHistory: () => void;
  mode: string;
}

const Header = ({ 
  isLoggedIn, 
  user, 
  logout, 
  handleModeChange, 
  toggleExample, 
  toggleChatHistory, 
  mode 
}:HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openAbout, setOpenAbout] = useState(false)
  
  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <div className="z-10 w-full max-w-5xl flex items-center justify-between font-mono text-sm flex-wrap md:flex-nowrap gap-4">
      <p className="flex-shrink-0 border-b bg-amber-100 border-amber-200 bg-gradient-to-b from-amber-400 px-4 py-2 backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit rounded-xl border dark:bg-zinc-800/30">
        {mode === "vacation" ? "ChatIsland" : "ChatOffice"}
      </p>
      <div>
      <AboutModal isOpen={openAbout} onClose={setOpenAbout}/>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {!isLoggedIn ? (
          <AuthModal open={isOpen} setOpen={setIsOpen} />
        ) : (
          <div className="relative">
            <button
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 focus:outline-none"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user?.username || "Logged In"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                <button onClick={handleModeChange} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Switch to {mode === "vacation" ? `Work` : `Vacation`} Mode
                </button>
                <button onClick={toggleExample} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Toggle Examples
                </button>
                <button onClick={toggleChatHistory} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Toggle Chat History
                </button>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;