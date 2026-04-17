import React from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../AppContext';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, AlertTriangle, ShieldAlert, Globe } from 'lucide-react';

export const NewsFeed: React.FC = () => {
  const { globalNews } = useAppContext();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full bg-white min-h-full"
    >
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex flex-col justify-center px-4 py-3 min-h-[60px]">
        <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          Global Intel <ShieldAlert className="w-5 h-5 text-red-600" />
        </h1>
        <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Verified external sources</p>
      </div>

      <div className="divide-y divide-gray-100 pb-20 sm:pb-0">
        {globalNews.length > 0 ? (
          globalNews.map((news, i) => (
            <motion.a 
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              key={news.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group block p-4 bg-white hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-sm ${news.category === 'Argentina' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                      {news.category}
                    </span>
                    <span className="text-xs font-mono text-gray-400 capitalize">{news.source}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs font-mono text-gray-400">{formatDistanceToNow(new Date(news.createdAt), { addSuffix: true })}</span>
                  </div>
                  
                  <h2 className="text-sm sm:text-[15px] font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors pr-4">
                    {news.title}
                  </h2>
                  
                  <div className="flex items-center gap-1 mt-3">
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    <span className="text-[11px] font-bold text-gray-400 group-hover:text-red-500 transition-colors uppercase">Read Report</span>
                  </div>
                </div>
                
                {news.thumbnail && (
                  <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                    <img 
                      src={news.thumbnail} 
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.a>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
             <Globe className="w-12 h-12 text-gray-200 mb-4 animate-pulse" />
             <p className="text-sm font-bold text-gray-900">Establishing secure connection...</p>
             <p className="text-xs text-gray-500 mt-1 font-mono">Intercepting global signals, please wait.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
