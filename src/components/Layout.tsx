import React, { useState, useEffect } from 'react';
import { Home, FileText, MessageSquare, User, Plus, X, Settings, Bookmark, LogOut, Smartphone, Bell, BadgeCheck, Shield, MoreHorizontal, Search } from 'lucide-react';
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

  // removed toggleDarkMode

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-950 transition-colors flex justify-center">
      <div className="w-full max-w-[1300px] flex gap-0 sm:gap-4 lg:gap-8 px-0 sm:px-4">
        
        {/* Desktop Sidebar (Left) */}
        <aside className="hidden sm:flex flex-col w-[80px] lg:w-[280px] sticky top-0 h-screen py-4 shrink-0">
          <div className="px-4 mb-8">
            <span className="text-3xl font-black text-primary tracking-tighter">ideo.</span>
          </div>
          
          <nav className="flex-1 space-y-2">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'news', icon: FileText, label: 'News' },
              { id: 'notifications', icon: Bell, label: 'Notifications', count: unreadNotificationsCount },
              { id: 'messages', icon: MessageSquare, label: 'Messages', count: unreadMessagesCount },
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                  activeTab === item.id 
                    ? 'text-primary bg-primary/5 font-bold' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-7 h-7 ${activeTab === item.id ? 'fill-primary/10' : ''}`} />
                  {item.count ? (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-gray-950">
                      {item.count}
                    </span>
                  ) : null}
                </div>
                <span className="hidden lg:block text-lg">{item.label}</span>
              </button>
            ))}

            <button
              onClick={onCompose}
              className="w-full mt-4 bg-primary text-white font-black py-4 rounded-2xl lg:rounded-full shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Plus className="w-7 h-7" />
              <span className="hidden lg:block text-lg">Post</span>
            </button>
          </nav>

          <div className="mt-auto px-2">
            {currentUser && (
              <div className="relative group">
                {/* Desktop Profile Card / Popover trigger */}
                <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer">
                  <Avatar className="w-10 h-10 rounded-xl">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{currentUser.name}</p>
                    <p className="text-sm text-gray-500 truncate">@{currentUser.handle}</p>
                  </div>
                  <MoreHorizontal className="hidden lg:block w-5 h-5 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Column */}
        <main className="flex-1 w-full max-w-md sm:max-w-2xl border-x border-gray-100 dark:border-gray-800 relative bg-white dark:bg-gray-950 transition-colors flex flex-col h-screen overflow-hidden">
          <div className="flex-1 overflow-y-auto no-scrollbar relative">
            {children}
          </div>
          
          {/* Bottom Nav (Mobile Only) */}
          <div className="sm:hidden flex-none bg-white/90 backdrop-blur-md border-t border-gray-100 flex justify-around items-center px-2 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-20">
            {[
              { id: 'home', icon: Home },
              { id: 'news', icon: FileText },
              { id: 'notifications', icon: Bell, count: unreadNotificationsCount },
              { id: 'messages', icon: MessageSquare, count: unreadMessagesCount },
              { id: 'profile', icon: User },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className="p-2 flex-1 flex justify-center relative">
                <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'text-primary fill-primary/10' : 'text-gray-400'}`} />
                {item.count ? (
                  <span className={`absolute top-1.5 right-1/2 -mr-3 rounded-full flex items-center justify-center border-2 border-white ${item.id === 'messages' ? 'bg-red-500 text-white text-[10px] min-w-4 h-4 font-bold px-1' : 'w-2 h-2 bg-red-500'}`}>
                    {item.id === 'messages' ? item.count : ''}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </main>

        {/* Widgets Sidebar (Right) - Desktop Only */}
        <aside className="hidden xl:flex flex-col w-[350px] sticky top-0 h-screen py-4 gap-6">
          <div className="bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2.5 flex items-center gap-3">
             <Search className="w-5 h-5 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search Ideo" 
               className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none" 
               value={globalSearchQuery}
               onChange={(e) => setGlobalSearchQuery(e.target.value)}
             />
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">What's happening</h3>
            <div className="space-y-6">
               {ideas.slice(0, 3).map((idea) => (
                 <div 
                   key={idea.id} 
                   onClick={() => window.dispatchEvent(new CustomEvent('open-post', { detail: idea.id }))}
                   className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 -mx-4 px-4 py-2 rounded-xl transition-colors"
                 >
                    <p className="text-xs text-gray-500 font-medium">Trending · {idea.author.name}</p>
                    <p className="font-bold text-gray-900 dark:text-white mt-0.5 line-clamp-2">{idea.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{idea.likes} likes · {idea.branches.length} branches</p>
                 </div>
               ))}
               {ideas.length === 0 && (
                 <p className="text-sm text-gray-400 italic">No recent activity.</p>
               )}
            </div>
            <button onClick={() => setActiveTab('news')} className="text-primary text-sm font-bold mt-6 hover:underline text-left">Show more</button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Who to follow</h3>
            <div className="space-y-4">
              {users
                .filter(u => u.id !== currentUser?.id)
                .slice(0, 4)
                .map((suggestedUser) => (
                  <div key={suggestedUser.id} className="flex items-center gap-3">
                    <Avatar 
                      className="w-10 h-10 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-user', { detail: suggestedUser.id }))}
                    >
                      <AvatarImage src={suggestedUser.avatar} />
                      <AvatarFallback>{suggestedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-user', { detail: suggestedUser.id }))}
                    >
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-sm truncate dark:text-white hover:underline">{suggestedUser.name}</p>
                        {suggestedUser.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate">@{suggestedUser.handle}</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (!currentUser) {
                          setAuthModalOpen(true);
                        } else {
                          toggleFollow(suggestedUser.id);
                        }
                      }}
                      className={`${
                        currentUser?.following?.includes(suggestedUser.id)
                          ? 'bg-white text-gray-900 border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100'
                          : 'bg-gray-900 text-white hover:bg-black'
                      } text-xs font-bold px-4 py-1.5 rounded-full transition-all`}
                    >
                      {currentUser?.following?.includes(suggestedUser.id) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              {users.length <= 1 && (
                <p className="text-sm text-gray-400 italic">Finding creative minds...</p>
              )}
            </div>
            <button className="text-primary text-sm font-bold mt-6 hover:underline text-left">Show more</button>
          </div>
        </aside>

      </div>

      {/* FAB (Mobile Only) */}
      {onCompose && activeTab === 'home' && (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCompose}
          className="sm:hidden absolute right-4 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors z-20"
          style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
        >
          <Plus className="w-6 h-6" />
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
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col transition-colors"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
                <Avatar className="w-12 h-12 rounded-lg">
                  <AvatarImage src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`} />
                  <AvatarFallback>{currentUser ? currentUser.name.charAt(0) : 'G'}</AvatarFallback>
                </Avatar>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                  <div className="font-bold text-gray-900 dark:text-white text-lg">{currentUser?.name || 'Log in to Ideo'}</div>
                  {currentUser?.verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="text-gray-500 text-[15px]">@{currentUser?.handle || 'visitor'}</div>
                {currentUser && (
                  <div className="flex gap-4 mt-3 text-[15px]">
                    <div className="flex gap-1"><span className="font-bold text-gray-900 dark:text-white">{currentUser.following?.length || 0}</span> <span className="text-gray-500">Following</span></div>
                    <div className="flex gap-1"><span className="font-bold text-gray-900 dark:text-white">{currentUser.followers?.length || 0}</span> <span className="text-gray-500">Followers</span></div>
                  </div>
                )}
              </div>

              <div className="flex-1 py-2 overflow-y-auto">
                <button 
                  className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }}
                >
                  <User className="w-6 h-6" />
                  <span className="font-bold text-[17px]">Profile</span>
                </button>
                <button 
                  className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => { setActiveTab('bookmarks'); setIsMenuOpen(false); }}
                >
                  <Bookmark className="w-6 h-6" />
                  <span className="font-bold text-[17px]">Bookmarks</span>
                </button>
                <button 
                  className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => { setActiveTab('settings'); setIsMenuOpen(false); }}
                >
                  <Settings className="w-6 h-6" />
                  <span className="font-bold text-[17px]">Settings</span>
                </button>
                <button 
                  className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    alert("Para instalar Ideo en tu dispositivo:\n\niOS: Toca el botón de Compartir y elige 'Agregar a inicio'.\n\nAndroid: En el menú del navegador, selecciona 'Instalar aplicación'.");
                    setIsMenuOpen(false);
                  }}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="font-bold text-[17px]">Instalar App</span>
                </button>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                {currentUser ? (
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-lg px-2 -mx-2"
                  >
                    <LogOut className="w-6 h-6" />
                    <span className="font-bold text-[17px]">Log out</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => { setAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="w-full bg-primary text-white font-bold py-3 rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Log in</span>
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

