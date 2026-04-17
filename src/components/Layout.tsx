import React, { useState, useEffect } from 'react';
import { Home, FileText, MessageSquare, User, Plus, X, Settings, Bookmark, LogOut, Smartphone, Bell, BadgeCheck, Shield, MoreHorizontal, Search, Users, PenLine } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../AppContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCompose?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onCompose }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, ideas, users, notifications, logout, unreadMessagesCount, setAuthModalOpen, globalSearchQuery, setGlobalSearchQuery, toggleFollow } = useAppContext();
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleOpenMenu = () => setIsMenuOpen(true);
    window.addEventListener('open-menu', handleOpenMenu);
    return () => window.removeEventListener('open-menu', handleOpenMenu);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white transition-colors flex justify-center relative">
      {/* Background glowing blobs for Web3 effect */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[1340px] flex gap-0 lg:gap-8 px-0 sm:px-6 relative z-10">
        
        {/* Desktop Sidebar (Left) */}
        <aside className="hidden sm:flex flex-col w-[88px] xl:w-[280px] sticky top-0 h-screen py-6 shrink-0 z-20">
          <div className="px-4 xl:px-5 mb-10 mt-2 cursor-pointer flex justify-center xl:justify-start">
            <span className="text-3xl font-black text-gray-900 tracking-tighter hidden xl:block">fork.</span>
            <span className="text-3xl font-black text-gray-900 tracking-tighter block xl:hidden">f.</span>
          </div>
          
          <nav className="flex-1 space-y-2.5">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'communities', icon: Users, label: 'Communities' },
              { id: 'notifications', icon: Bell, label: 'Notifications', count: unreadNotificationsCount },
              { id: 'messages', icon: MessageSquare, label: 'Messages', count: unreadMessagesCount },
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  activeTab === item.id 
                    ? 'text-primary bg-primary/10 font-bold shadow-[inset_4px_0_0_0_rgb(var(--color-primary))]' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 font-medium'
                }`}
              >
                <div className="relative flex justify-center w-8">
                  <item.icon className={`w-6 h-6 transition-transform duration-300 ${activeTab === item.id ? 'fill-primary/20 scale-110' : 'group-hover:scale-110'}`} />
                  {item.count ? (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                      {item.count}
                    </span>
                  ) : null}
                </div>
                <span className="hidden xl:block text-[17px] tracking-tight">{item.label}</span>
              </button>
            ))}

            <button
              onClick={onCompose}
              className="w-full mt-6 bg-black text-white font-black py-4 rounded-full flex items-center justify-center gap-3"
            >
              <span className="text-[17px]">Post</span>
            </button>
          </nav>

          <div className="mt-auto pt-6">
            {currentUser && (
              <div className="relative group">
                <div className="flex items-center justify-center xl:justify-start gap-3 p-3 rounded-2xl hover:bg-gray-100/80 transition-all cursor-pointer backdrop-blur-sm border border-transparent hover:border-gray-200/50">
                  <Avatar className="w-11 h-11 rounded-[14px] shadow-sm border border-white">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden xl:block text-left flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate text-[15px] tracking-tight">{currentUser.name}</p>
                    <p className="text-sm font-mono text-gray-500 truncate tracking-tight pr-2">@{currentUser.handle}</p>
                  </div>
                  <MoreHorizontal className="hidden xl:block w-5 h-5 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Column */}
        <main className="flex-1 w-full max-w-none sm:max-w-[600px] bg-white border-x-0 sm:border-x sm:border-gray-100 relative flex flex-col min-h-screen">
          <div className="flex-1 relative">
            {children}
          </div>
          
          {/* Bottom Nav (Mobile Only) */}
          <div className="sm:hidden flex-none bg-white/95 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center px-2 pt-3 pb-[calc(14px+env(safe-area-inset-bottom))] z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            {[
              { id: 'home', icon: Home },
              { id: 'news', icon: FileText },
              { id: 'communities', icon: Users },
              { id: 'notifications', icon: Bell, count: unreadNotificationsCount },
              { id: 'messages', icon: MessageSquare, count: unreadMessagesCount },
              { id: 'profile', icon: User },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className="p-2 flex-1 flex justify-center relative">
                <item.icon className={`w-6 h-6 transition-all ${activeTab === item.id ? 'text-primary fill-primary/20 scale-110' : 'text-gray-400'}`} />
                {item.count ? (
                  <span className={`absolute top-1 right-1/2 -mr-3 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${item.id === 'messages' ? 'bg-red-500 text-white text-[10px] min-w-[16px] h-4 font-bold px-1' : 'w-2.5 h-2.5 bg-red-500'}`}>
                    {item.id === 'messages' ? item.count : ''}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </main>

        {/* Widgets Sidebar (Right) - Desktop Only */}
        <aside className="hidden lg:flex flex-col w-[350px] sticky top-0 h-screen py-6 gap-6 shrink-0 z-20">
          <div className="bg-gray-100/80 backdrop-blur-md rounded-2xl px-5 py-3.5 flex items-center gap-3 border border-gray-200/50 shadow-sm focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all">
             <Search className="w-5 h-5 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search network..." 
               className="bg-transparent border-none focus:ring-0 text-[15px] w-full outline-none placeholder:text-gray-400 font-medium" 
               value={globalSearchQuery}
               onChange={(e) => setGlobalSearchQuery(e.target.value)}
             />
          </div>
          
          <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl -z-10 group-hover:bg-primary/10 transition-colors" />
            <h3 className="text-[20px] font-black text-gray-900 mb-5 tracking-tight">Trending</h3>
            <div className="space-y-5">
               {ideas.slice(0, 3).map((idea) => (
                 <div 
                   key={idea.id} 
                   onClick={() => window.dispatchEvent(new CustomEvent('open-post', { detail: idea.id }))}
                   className="cursor-pointer group flex flex-col gap-1"
                 >
                    <div className="flex items-center gap-2">
                       <span className="text-[12px] text-gray-400 font-mono">Trending</span>
                       <span className="w-1 h-1 bg-gray-300 rounded-full" />
                       <span className="text-[12px] font-bold text-gray-600 truncate">{idea.author.name}</span>
                    </div>
                    <p className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 text-[15px] leading-snug">{idea.content}</p>
                    <p className="text-[12px] text-gray-500 font-mono mt-0.5">{idea.likes} likes · {idea.branches.length} forks</p>
                 </div>
               ))}
               {ideas.length === 0 && (
                 <p className="text-sm text-gray-400 font-mono">No recent activity.</p>
               )}
            </div>
            <button onClick={() => setActiveTab('news')} className="text-primary text-[14px] font-bold mt-5 hover:underline text-left block w-full">View all trends</button>
          </div>

          <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
            <h3 className="text-[20px] font-black text-gray-900 mb-5 tracking-tight">Connect</h3>
            <div className="space-y-5">
              {users
                .filter(u => u.id !== currentUser?.id)
                .slice(0, 4)
                .map((suggestedUser) => (
                  <div key={suggestedUser.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                      <Avatar 
                        className="w-10 h-10 rounded-[12px] cursor-pointer hover:opacity-80 transition-opacity border border-gray-100 shadow-sm shrink-0"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-user', { detail: suggestedUser.id }))}
                      >
                        <AvatarImage src={suggestedUser.avatar} />
                        <AvatarFallback className="bg-primary/5 text-primary">{suggestedUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-user', { detail: suggestedUser.id }))}
                      >
                        <div className="flex items-center gap-1">
                          <p className="font-bold text-[14px] truncate text-gray-900 hover:underline tracking-tight">{suggestedUser.name}</p>
                          {suggestedUser.verified && <BadgeCheck className="w-[14px] h-[14px] text-blue-500 fill-blue-500/10 shrink-0" />}
                        </div>
                        <p className="text-[12px] text-gray-500 font-mono truncate">@{suggestedUser.handle}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (!currentUser) setAuthModalOpen(true);
                        else toggleFollow(suggestedUser.id);
                      }}
                      className={`shrink-0 ${
                        currentUser?.following?.includes(suggestedUser.id)
                          ? 'bg-white text-gray-900 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                          : 'bg-black text-white shadow-md'
                      } text-[13px] font-bold px-4 py-1.5 rounded-xl transition-all`}
                    >
                      {currentUser?.following?.includes(suggestedUser.id) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              {users.length <= 1 && (
                <p className="text-sm text-gray-400 font-mono italic">Syncing nodes...</p>
              )}
            </div>
            <button className="text-primary text-[14px] font-bold mt-5 hover:underline text-left block w-full">Find more peers</button>
          </div>
        </aside>

      </div>

      {/* FAB (Mobile Only) */}
      {onCompose && activeTab === 'home' && (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCompose}
          className="sm:hidden fixed right-5 w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-md z-30"
          style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
        >
          <PenLine className="w-5 h-5" />
        </motion.button>
      )}

      {/* Hamburger Drawer Menu (Mobile Only) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <Avatar className="w-12 h-12 rounded-2xl shadow-sm border border-white">
                  <AvatarImage src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`} />
                  <AvatarFallback className="bg-primary text-white font-bold">{currentUser ? currentUser.name.charAt(0) : 'G'}</AvatarFallback>
                </Avatar>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white hover:bg-gray-100 rounded-full shadow-sm border border-gray-100 transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="font-bold text-gray-900 text-lg tracking-tight">{currentUser?.name || 'Anonymous User'}</div>
                  {currentUser?.verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="text-gray-500 font-mono text-[14px]">@{currentUser?.handle || 'visitor'}</div>
                {currentUser && (
                  <div className="flex gap-4 mt-4 mb-2 text-[15px] font-mono">
                    <div className="flex gap-1.5 items-center"><span className="font-bold text-gray-900 text-[16px]">{currentUser.following?.length || 0}</span> <span className="text-gray-500">Following</span></div>
                    <div className="flex gap-1.5 items-center"><span className="font-bold text-gray-900 text-[16px]">{currentUser.followers?.length || 0}</span> <span className="text-gray-500">Followers</span></div>
                  </div>
                )}
              </div>

              <div className="flex-1 py-3 overflow-y-auto">
                {[
                  { icon: User, label: 'Profile', tab: 'profile' },
                  { icon: Users, label: 'Communities', tab: 'communities' },
                  { icon: Bookmark, label: 'Bookmarks', tab: 'bookmarks' },
                  { icon: Settings, label: 'Settings', tab: 'settings' }
                ].map(item => (
                  <button 
                    key={item.tab}
                    className="w-full flex items-center gap-4 px-5 py-3.5 text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors focus:bg-primary/5"
                    onClick={() => { setActiveTab(item.tab); setIsMenuOpen(false); }}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-bold text-[17px] tracking-tight">{item.label}</span>
                  </button>
                ))}
                
                <button 
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors mt-2"
                  onClick={() => {
                    alert("To install fork.:\n\niOS: Tap Share and 'Add to Home Screen'.\n\nAndroid: Tap browser menu and 'Install App'.");
                    setIsMenuOpen(false);
                  }}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="font-bold text-[17px] tracking-tight">Install Web App</span>
                </button>
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                {currentUser ? (
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-red-500 bg-white hover:bg-red-50 border border-red-100 shadow-sm transition-colors rounded-2xl"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold text-[16px]">Log out from node</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => { setAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="w-full bg-black text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="text-[16px]">Connect Wallet</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

