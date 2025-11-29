import React from 'react';
import { SearchResult } from '../types';
import { ExternalLink, BookOpen, Tag } from 'lucide-react';

interface GuideCardProps {
  result: SearchResult;
}

const GuideCard: React.FC<GuideCardProps> = ({ result }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full group">
      {/* Gold gradient top border */}
      <div className="p-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20" />
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-3">
          {/* Gold badge for category */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">
            {result.category}
          </span>
          {result.relevanceScore > 0 && (
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              result.relevanceScore > 85 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {result.relevanceScore}% Match
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
          {result.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow text-sm">
          {result.description}
        </p>

        {result.reasoning && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 italic border border-gray-100">
            <span className="font-semibold text-amber-600 not-italic">AI Insight: </span>
            {result.reasoning}
          </div>
        )}

        {result.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
                {result.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center text-xs text-gray-400">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                    </span>
                ))}
            </div>
        )}

        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-black transition-colors gap-2 group-hover:ring-2 group-hover:ring-amber-500/20"
        >
          <BookOpen className="w-4 h-4" />
          Read Guide
          <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
        </a>
      </div>
    </div>
  );
};

export default GuideCard;