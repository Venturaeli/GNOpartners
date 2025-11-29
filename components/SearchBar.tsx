import React, { useState, KeyboardEvent } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(value);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative group">
      {/* Updated gradient to Gold/Amber */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
      <div className="relative flex items-center bg-white rounded-xl shadow-lg">
        <div className="pl-4 text-gray-400">
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          ) : (
            <Search className="w-6 h-6" />
          )}
        </div>
        <input
          type="text"
          className="w-full p-4 pl-3 pr-16 text-lg text-gray-900 bg-transparent border-none rounded-xl focus:ring-0 focus:outline-none placeholder-gray-400"
          placeholder="Describe what you need help with..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <div className="absolute right-2">
          <button
            onClick={() => onSearch(value)}
            disabled={isLoading || !value.trim()}
            className={`p-2 rounded-lg transition-all duration-200 ${
              value.trim() && !isLoading
                ? 'bg-gray-900 text-amber-400 shadow-md hover:bg-black'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-amber-500 rounded-full animate-spin" />
            ) : (
               <Sparkles className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;