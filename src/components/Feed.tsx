import React, { useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { IdeaCard } from './IdeaCard';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion, AnimatePresence } from 'motion/react';

interface FeedProps {
  onSelectIdea: (ideaId: string) => void;
  onUserClick?: (userId: string) => void;
  onNotificationsClick?: () => void;
}

export const Feed: React.FC<FeedProps> = ({ onSelectIdea, onUserClick, onNotificationsClick }) => {
  const { ideas, currentUser, users, notifications } = useAppContext();
  const unreadCount = notifications.filter(n => !n.read).length;
  const [activeTab, setActiveTab] = useState<'foryou' | 'trending'>('foryou');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIdeas = ideas.filter(idea => 
    idea.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.author.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full min-h-full"
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button 
          className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
          onClick={() => window.dispatchEvent(new CustomEvent('open-menu'))}
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-primary tracking-tight flex items-center">
          ideo<span className="text-primary text-2xl leading-none">.</span>
        </h1>
        <button 
          className="p-2 -mr-2 hover:bg-gray-50 rounded-full transition-colors relative"
          onClick={onNotificationsClick}
        >
          <Bell className="w-5 h-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search ideas, users, or tags..." 
            className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {!searchQuery && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button 
              className="flex-1 py-3 text-sm font-semibold relative text-gray-900"
              onClick={() => setActiveTab('foryou')}
            >
              For You
              {activeTab === 'foryou' && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />
              )}
            </button>
            <button 
              className="flex-1 py-3 text-sm font-medium relative text-gray-500 hover:text-gray-900 transition-colors"
              onClick={() => setActiveTab('trending')}
            >
              Trending
              {activeTab === 'trending' && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          </div>

          {/* Inline Composer (Visual only, could open modal) */}
          <div 
            className="p-4 border-b border-gray-100 flex gap-3 items-center cursor-text hover:bg-gray-50 transition-colors"
            onClick={() => {
              // Find the compose button and click it to open the modal
              const composeBtn = document.querySelector('button[aria-label="Compose"]') || document.querySelector('.fixed.bottom-20');
              if (composeBtn) (composeBtn as HTMLButtonElement).click();
            }}
          >
            <Avatar className="w-10 h-10 rounded-lg">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-gray-400 text-[15px]">
              What's your idea?
            </div>
          </div>
        </>
      )}

      {/* Feed List */}
      <div className="divide-y divide-gray-100 flex-1">
        {searchQuery && filteredUsers.length > 0 && (
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Users</h3>
            <div className="space-y-3">
              {filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 -mx-2 rounded-lg transition-colors"
                  onClick={() => onUserClick && onUserClick(user.id)}
                >
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-lg bg-white" />
                  <div>
                    <div className="font-bold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">@{user.handle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && filteredIdeas.length === 0 && filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No results found for "{searchQuery}"
          </div>
        ) : (
          <AnimatePresence>
            {(searchQuery ? filteredIdeas : ideas).map(idea => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <IdeaCard 
                  idea={idea} 
                  onClick={() => onSelectIdea(idea.id)} 
                  onUserClick={onUserClick}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};
