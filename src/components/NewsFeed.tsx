import React from 'react';
import { useAppContext } from '../AppContext';
import { motion } from 'motion/react';
import { BadgeCheck, Zap } from 'lucide-react';

export const NewsFeed: React.FC = () => {
  const { globalNews, isAuthModalOpen } = useAppContext();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col w-full min-h-screen pb-20 sm:pb-0 bg-gray-50/30"
    >
      <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-20">
         <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-primary fill-primary/20" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest font-mono">Net Intel</span>
         </div>
         <h1 className="text-2xl font-black text-gray-900 tracking-tight">Verified Signals</h1>
      </div>

      <div className="divide-y divide-gray-100">
        {globalNews.length === 0 ? (
          <div className="py-20 text-center px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-gray-300" />
            </div>
            <p className="font-bold text-gray-900">Scanning for signals...</p>
            <p className="text-sm text-gray-500 font-mono mt-1">Establishing secure connection to global nodes.</p>
          </div>
        ) : (
          globalNews.map((news, idx) => (
            <motion.div 
              key={news.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 bg-white hover:bg-gray-50/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                   <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded-md uppercase tracking-tighter">
                      {news.category || 'INTEL'}
                   </span>
                   <span className="text-[11px] text-gray-400 font-mono uppercase">{news.time}</span>
                </div>
                <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/10" />
              </div>
              
              <h3 className="text-[18px] font-black text-gray-900 leading-tight mb-3 group-hover:text-primary transition-colors">
                {news.title}
              </h3>
              
              <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 font-medium">
                {news.content}
              </p>

              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-gray-400 font-mono">SOURCE: {news.source}</span>
                 <button className="text-[12px] font-black text-primary hover:underline">ACCESS FULL DATA →</button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
