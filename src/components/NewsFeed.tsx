import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../AppContext';
import { IdeaCard } from './IdeaCard';
import { AlertCircle } from 'lucide-react';

export const NewsFeed: React.FC = () => {
  const { ideas } = useAppContext();

  // Filter ideas to only include news, leaks, global and war content
  const newsIdeas = useMemo(() => {
    const newsTags = ['news', 'alert', 'war', 'global', 'argentina', 'leak', 'cyberattack', 'scandal', 'urgente'];
    return ideas.filter(idea => 
      idea.tags.some(tag => newsTags.includes(tag.toLowerCase()))
    );
  }, [ideas]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full bg-white min-h-full"
    >
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex flex-col gap-1">
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
          Global Intel <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        </h1>
        <p className="text-[12px] text-gray-500 font-mono tracking-tight font-bold uppercase">
          Uncensored & Raw Data Streams
        </p>
      </div>

      <div className="divide-y divide-gray-100 pb-20 sm:pb-0">
        {newsIdeas.length > 0 ? (
          newsIdeas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} />
          ))
        ) : (
          <div className="p-10 flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
            <AlertCircle className="w-12 h-12 text-gray-200" />
            <p className="font-mono text-sm max-w-[200px]">Signal lost. No secure intel blocks found in the network.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
