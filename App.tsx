import React, { useEffect, useState, useCallback } from 'react';
import { Guide, SearchResult, LoadingState } from './types';
import { fetchAndParseGuides } from './services/csvParser';
import { searchGuidesWithAI } from './services/geminiService';
import SearchBar from './components/SearchBar';
import GuideCard from './components/GuideCard';
import { Database, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [allGuides, setAllGuides] = useState<Guide[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [lastQuery, setLastQuery] = useState('');

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      setLoadingState(LoadingState.LOADING_DATA);
      try {
        const guides = await fetchAndParseGuides();
        setAllGuides(guides);
        setResults(guides.map(g => ({ ...g, relevanceScore: 0, reasoning: '' })));
        setLoadingState(LoadingState.IDLE);
      } catch (e) {
        console.error("Failed to load guides", e);
        setLoadingState(LoadingState.ERROR);
      }
    };
    loadData();
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      // Reset to show all guides (or empty, depending on preference)
      setResults(allGuides.map(g => ({ ...g, relevanceScore: 0, reasoning: '' })));
      setLastQuery('');
      return;
    }

    setLoadingState(LoadingState.SEARCHING);
    setLastQuery(query);

    try {
      const searchResults = await searchGuidesWithAI(query, allGuides);
      setResults(searchResults);
      setLoadingState(LoadingState.SUCCESS);
    } catch (e) {
      console.error("Search failed", e);
      setLoadingState(LoadingState.ERROR);
    }
  }, [allGuides]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Header / Hero Section */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => window.location.reload()}>
            {/* Logo Image - Make sure logo.png is in the public folder */}
            <img 
              src="/logo.png" 
              alt="GNO Partners" 
              className="h-12 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('logo-fallback');
                if (fallback) fallback.style.display = 'block';
              }}
            />
            {/* Text Fallback */}
            <span id="logo-fallback" className="hidden font-bold text-2xl tracking-tight text-gray-900">
              GNO<span className="text-amber-600">PARTNERS</span>
            </span>
          </div>
          <div className="text-sm text-gray-500 hidden sm:flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500" />
            {allGuides.length} Guides Indexed
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        {/* Search Section */}
        <div className="bg-white pb-12 pt-16 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              <span className="block">Find exactly what you need.</span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
              Describe your problem or what you're looking for, and our AI will find the most relevant guides from the <span className="font-semibold text-gray-900">GNO Partners</span> knowledge base.
            </p>
            <SearchBar 
              onSearch={handleSearch} 
              isLoading={loadingState === LoadingState.SEARCHING} 
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          
          {loadingState === LoadingState.LOADING_DATA && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Initializing Knowledge Base...</p>
            </div>
          )}

          {loadingState === LoadingState.SEARCHING && (
            <div className="text-center py-20">
               <div className="inline-block p-4 rounded-full bg-amber-50 animate-pulse mb-4">
                  <Sparkles className="w-8 h-8 text-amber-500" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">Searching...</h3>
               <p className="text-gray-500">Analyzing your request against {allGuides.length} guides</p>
            </div>
          )}

          {loadingState === LoadingState.SUCCESS && results.length === 0 && (
             <div className="text-center py-20">
                <p className="text-xl text-gray-600 mb-2">No relevant guides found.</p>
                <p className="text-gray-400">Try adjusting your search terms.</p>
             </div>
          )}

          {(loadingState === LoadingState.SUCCESS || loadingState === LoadingState.IDLE) && results.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">
                  {lastQuery ? 'Top Recommended Guides' : 'All Available Guides'}
                </h2>
                {lastQuery && (
                   <button 
                    onClick={() => handleSearch('')}
                    className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                   >
                     Clear Search
                   </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.map((guide) => (
                  <GuideCard key={guide.id} result={guide} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} GNO Partners. Powered by Google Gemini.
        </div>
      </footer>
    </div>
  );
};

export default App;