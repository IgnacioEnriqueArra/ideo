import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { IdeaCard } from './IdeaCard';

interface BookmarksProps {
  onBack: () => void;
  onUserClick?: (userId: string) => void;
}

export const Bookmarks: React.FC<BookmarksProps> = ({ onBack, onUserClick }) => {
  const { ideas, bookmarks } = useAppContext();
  
  const bookmarkedIdeas = ideas.filter(idea => bookmarks.includes(idea.id));

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col w-full bg-white min-h-full"
    >
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-6">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Bookmarks</h1>
      </div>

      <div className="divide-y divide-gray-100">
        {bookmarkedIdeas.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-[15px]">
            You haven't bookmarked any ideas yet.
          </div>
        ) : (
          bookmarkedIdeas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} onUserClick={onUserClick} />
          ))
        )}
      </div>
    </motion.div>
  );
};
