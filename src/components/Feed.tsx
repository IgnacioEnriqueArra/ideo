import React, { useState } from 'react';
import { Menu, Bell, Search, BadgeCheck, Zap } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { IdeaCard } from './IdeaCard';
import { motion, AnimatePresence } from 'motion/react';

interface FeedProps {
  onSelectIdea: (ideaId: string) => void;
  onUserClick?: (userId: string) => void;
  onNotificationsClick?: () => void;
}

export const Feed: React.FC<FeedProps> = ({ onSelectIdea, onUserClick, onNotificationsClick }) => {
  const { ideas, currentUser, users, notifications, globalSearchQuery, setGlobalSearchQuery, globalNews } = useAppContext();
  const unreadCount = notifications.filter(n => !n.read).length;
  const [activeTab, setActiveTab] = useState<'foryou' | 'trending'>('foryou');

  const filteredIdeas = ideas.filter(idea => 
    idea.content.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    idea.author.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    idea.author.handle.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    idea.tags.some(tag => tag.toLowerCase().includes(globalSearchQuery.toLowerCase()))
  );

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    user.handle.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const feedItems = React.useMemo(() => {
    const baseIdeas = globalSearchQuery ? filteredIdeas : ideas;
    const merged: any[] = [];
    let newsIndex = 0;
    
    baseIdeas.forEach((idea, idx) => {
       merged.push({ type: 'idea', data: idea, id: `idea-${idea.id}` });
       
       // Every 4 posts, inject 1 verified news item (if available)
       if (idx > 0 && idx % 4 === 0 && globalNews && newsIndex < globalNews.length) {
           merged.push({ type: 'news', data: globalNews[newsIndex], id: `news-${globalNews[newsIndex].id}` });
           newsIndex++;
       }
    });

    // If feed is totally empty but we have news, show some news
    if (merged.length === 0 && globalNews && globalNews.length > 0 && !globalSearchQuery) {
       globalNews.slice(0, 3).forEach(news => merged.push({ type: 'news', data: news, id: `news-${news.id}` }));
    }

    return merged;
  }, [ideas, filteredIdeas, globalSearchQuery, globalNews]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full min-h-full pb-20 sm:pb-0"
    >
      {/* Top Bar (Mobile Only) */}
      <div className="sm:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-4 py-3 flex items-center justify-between shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <button 
          className="p-2 -ml-2 hover:bg-gray-100/80 rounded-full transition-colors"
          onClick={() => window.dispatchEvent(new CustomEvent('open-menu'))}
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex items-center gap-1">
          <span className="text-[22px] font-black text-gray-900 tracking-tighter">fork.</span>
        </div>
        <button 
          className="p-2 -mr-2 hover:bg-gray-100/80 rounded-full transition-colors relative"
          onClick={onNotificationsClick}
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 border-2 border-white bg-red-500 rounded-full shadow-sm" />
          )}
        </button>
      </div>

      {/* Search Bar (Mobile Only) */}
      <div className="sm:hidden px-4 py-3 border-b border-gray-100/50 bg-gray-50/30">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search network..." 
            className="w-full bg-white border border-gray-200/80 rounded-2xl py-2.5 pl-10 pr-4 text-[15px] focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all shadow-sm font-medium"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {!globalSearchQuery && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-100/80 sticky sm:relative top-[61px] sm:top-0 z-20 bg-white/95 backdrop-blur-md">
            <button 
              className={`flex-1 py-3.5 text-[15px] font-bold relative transition-colors ${activeTab === 'foryou' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setActiveTab('foryou')}
            >
              For You
              {activeTab === 'foryou' && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgb(var(--color-primary)/0.5)]" />
              )}
            </button>
            <button 
              className={`flex-1 py-3.5 text-[15px] font-bold relative transition-colors ${activeTab === 'trending' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setActiveTab('trending')}
            >
              Trending
              {activeTab === 'trending' && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgb(var(--color-primary)/0.5)]" />
              )}
            </button>
          </div>

          {/* CTA post */}
          <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col items-center justify-center bg-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-400/5 opacity-50 block" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 transition-colors duration-700" />
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 relative z-10">
              <Zap className="w-6 h-6 text-primary fill-primary/20" />
            </div>
            <h2 className="text-[22px] font-black text-gray-900 mb-2 tracking-tight relative z-10 text-center">Join the conversation anonymously</h2>
            <p className="text-gray-500 text-[15px] mb-6 text-center max-w-[400px] font-medium leading-relaxed relative z-10">
              Share your thoughts, connect with others, and explore the network with 100% anonymity. No tracks, no limits.
            </p>
            <button 
              className="bg-black text-white font-black py-3 px-8 rounded-full relative z-10"
              onClick={() => {
                const composeBtn = document.querySelector('svg.lucide-pen-line')?.closest('button') as HTMLButtonElement | null;
                const desktopBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Post'));
                if (composeBtn) composeBtn.click();
                else if (desktopBtn) desktopBtn.click();
              }}
            >
              Post Now
            </button>
          </div>
        </>
      )}

      {/* Feed List */}
      <div className="flex-1 bg-gray-50/30">
        {globalSearchQuery && filteredUsers.length > 0 && (
          <div className="p-5 border-b border-gray-100 bg-white">
            <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest font-mono">Discovered Peers</h3>
            <div className="space-y-4">
              {filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2.5 -mx-2.5 rounded-2xl transition-colors border border-transparent hover:border-gray-100"
                  onClick={() => onUserClick && onUserClick(user.id)}
                >
                  <Avatar className="w-11 h-11 rounded-xl shadow-sm border border-gray-100">
                     <AvatarImage src={user.avatar} />
                     <AvatarFallback className="bg-primary/5 text-primary">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-[15px] text-gray-900 flex items-center gap-1 tracking-tight">
                      {user.name}
                      {user.verified && <BadgeCheck className="w-[15px] h-[15px] text-blue-500 fill-blue-500/10" />}
                    </div>
                    <div className="text-[13px] text-gray-500 font-mono tracking-tight">@{user.handle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {globalSearchQuery && filteredIdeas.length === 0 && filteredUsers.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-white">
            <Search className="w-12 h-12 text-gray-200 mb-3" />
            <p className="font-bold text-gray-900">No signals found</p>
            <p className="text-gray-500 font-mono text-sm mt-1">Try a different search query for "{globalSearchQuery}"</p>
          </div>
        ) : (
          <div className="pb-10">
            <AnimatePresence>
              {feedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                  className="bg-white border-b border-gray-100/80 hover:bg-gray-50/50 transition-colors"
                >
                  {item.type === 'idea' ? (
                    <IdeaCard 
                      idea={item.data} 
                      onClick={() => onSelectIdea(item.data.id)} 
                      onUserClick={onUserClick}
                    />
                  ) : (
                    <div className="p-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3">
                         <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">{item.data.category || 'GLOBAL'}</span>
                        <span className="text-[11px] text-gray-400 font-medium">{item.data.time}</span>
                      </div>
                      <h4 className="text-[17px] font-black text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors cursor-pointer" onClick={() => onSelectIdea(item.id)}>
                        {item.data.title}
                      </h4>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-mono text-gray-400">SOURCE: {item.data.source}</span>
                        <button className="text-xs font-bold text-gray-400 hover:text-primary">Read Intel →</button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};
