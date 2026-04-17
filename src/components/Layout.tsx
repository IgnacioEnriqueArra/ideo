import React, { useState, useEffect } from 'react';
import { Home, FileText, MessageSquare, User, Plus, X, Settings, Bookmark, LogOut, Smartphone, Bell, BadgeCheck, Shield, MoreHorizontal, Search, Users, Lock } from 'lucide-react';
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

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'news', icon: FileText, label: 'News' },
    { id: 'communities', icon: Users, label: 'Communities' },
    { id: 'notifications', icon: Bell, label: 'Notifications', count: unreadNotificationsCount },
    { id: 'messages', icon: MessageSquare, label: 'Messages', count: unreadMessagesCount },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: 'hsl(222,47%,5%)' }}>
      <div className="w-full max-w-[1300px] flex gap-0 sm:gap-4 lg:gap-8 px-0 sm:px-4">
        
        {/* Desktop Sidebar (Left) */}
        <aside className="hidden sm:flex flex-col w-[80px] lg:w-[280px] sticky top-0 h-screen py-6 shrink-0">
          <div className="px-4 mb-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(177,100%,44%), hsl(177,100%,30%))', boxShadow: '0 0 16px rgba(0,225,210,0.4)' }}>
                <Lock className="w-4 h-4 text-black" />
              </div>
              <span className="hidden lg:block text-2xl font-black tracking-tighter" style={{ color: 'hsl(177,100%,44%)', textShadow: '0 0 20px rgba(0,225,210,0.4)' }}>fork.</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                  activeTab === item.id 
                    ? 'font-bold' 
                    : 'hover:bg-white/5'
                }`}
                style={activeTab === item.id ? {
                  background: 'rgba(0,225,210,0.08)',
                  color: 'hsl(177,100%,44%)',
                  boxShadow: 'inset 0 0 0 1px rgba(0,225,210,0.15)'
                } : { color: 'rgba(200,220,230,0.6)' }}
              >
                <div className="relative">
                  <item.icon className="w-6 h-6" />
                  {item.count ? (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {item.count}
                    </span>
                  ) : null}
                </div>
                <span className="hidden lg:block text-[17px]">{item.label}</span>
              </button>
            ))}

            <button
              onClick={onCompose}
              className="w-full mt-4 font-black py-4 rounded-2xl lg:rounded-full transition-all flex items-center justify-center gap-3 active:scale-95"
              style={{ 
                background: 'linear-gradient(135deg, hsl(177,100%,44%), hsl(177,100%,35%))',
                color: 'hsl(222,47%,5%)',
                boxShadow: '0 0 24px rgba(0,225,210,0.3), 0 4px 16px rgba(0,225,210,0.2)'
              }}
            >
              <Plus className="w-6 h-6" />
              <span className="hidden lg:block text-lg">Post</span>
            </button>
          </nav>

          <div className="mt-auto px-2">
            {currentUser && (
              <div className="flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer" style={{ background: 'rgba(0,225,210,0.04)', border: '1px solid rgba(0,225,210,0.1)' }}>
                <Avatar className="w-10 h-10 rounded-xl" style={{ boxShadow: '0 0 8px rgba(0,225,210,0.3)' }}>
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback style={{ background: 'hsl(177,100%,44%)', color: 'black' }}>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left flex-1 min-w-0">
                  <p className="font-bold truncate" style={{ color: 'hsl(180,100%,90%)' }}>{currentUser.name}</p>
                  <p className="text-sm truncate font-mono" style={{ color: 'hsl(177,100%,44%)' }}>@{currentUser.handle}</p>
                </div>
                <MoreHorizontal className="hidden lg:block w-5 h-5" style={{ color: 'rgba(200,220,230,0.4)' }} />
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Column */}
        <main 
          className="flex-1 w-full max-w-md sm:max-w-2xl relative flex flex-col h-screen overflow-hidden"
          style={{ borderLeft: '1px solid rgba(0,225,210,0.08)', borderRight: '1px solid rgba(0,225,210,0.08)', background: 'rgba(10,16,30,0.7)' }}
        >
          <div className="flex-1 overflow-y-auto no-scrollbar relative">
            {children}
          </div>
          
          {/* Bottom Nav (Mobile Only) */}
          <div 
            className="sm:hidden flex-none flex justify-around items-center px-2 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-20"
            style={{ background: 'rgba(8,14,28,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,225,210,0.1)' }}
          >
            {[
              { id: 'home', icon: Home },
              { id: 'news', icon: FileText },
              { id: 'communities', icon: Users },
              { id: 'notifications', icon: Bell, count: unreadNotificationsCount },
              { id: 'messages', icon: MessageSquare, count: unreadMessagesCount },
              { id: 'profile', icon: User },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className="p-2 flex-1 flex justify-center relative">
                <item.icon 
                  className="w-6 h-6 transition-all" 
                  style={{ color: activeTab === item.id ? 'hsl(177,100%,44%)' : 'rgba(200,220,230,0.4)',
                    filter: activeTab === item.id ? 'drop-shadow(0 0 6px rgba(0,225,210,0.5))' : 'none'
                  }} 
                />
                {item.count ? (
                  <span className="absolute top-1.5 right-1/2 -mr-3 rounded-full flex items-center justify-center bg-red-500 text-white text-[9px] min-w-4 h-4 font-bold px-1">
                    {item.count || ''}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </main>

        {/* Widgets Sidebar (Right) - Desktop Only */}
        <aside className="hidden xl:flex flex-col w-[350px] sticky top-0 h-screen py-6 gap-6">
          <div className="rounded-2xl px-4 py-2.5 flex items-center gap-3" style={{ background: 'rgba(0,225,210,0.06)', border: '1px solid rgba(0,225,210,0.12)' }}>
             <Search className="w-4 h-4" style={{ color: 'rgba(0,225,210,0.5)' }} />
             <input 
               type="text" 
               placeholder="Search fork." 
               className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
               style={{ color: 'hsl(180,100%,90%)', caretColor: 'hsl(177,100%,44%)' }}
               value={globalSearchQuery}
               onChange={(e) => setGlobalSearchQuery(e.target.value)}
             />
          </div>
          
          {/* Shield badge */}
          <div className="flex items-center gap-2 px-1">
            <Shield className="w-4 h-4" style={{ color: 'hsl(177,100%,44%)' }} />
            <span className="text-xs font-mono" style={{ color: 'rgba(0,225,210,0.6)' }}>end-to-end anonymous · decentralized</span>
          </div>

          <div className="rounded-3xl p-6" style={{ background: 'rgba(16,24,45,0.9)', border: '1px solid rgba(0,225,210,0.1)', boxShadow: '0 0 30px rgba(0,225,210,0.04)' }}>
            <h3 className="text-lg font-black mb-4" style={{ color: 'hsl(177,100%,44%)' }}>What's happening</h3>
            <div className="space-y-5">
               {ideas.slice(0, 3).map((idea) => (
                 <div 
                   key={idea.id} 
                   onClick={() => window.dispatchEvent(new CustomEvent('open-post', { detail: idea.id }))}
                   className="cursor-pointer -mx-2 px-2 py-2 rounded-xl transition-all hover:bg-white/5 group"
                 >
                    <p className="text-xs font-mono mb-0.5" style={{ color: 'rgba(0,225,210,0.5)' }}>Trending · {idea.author.handle}</p>
                    <p className="font-bold line-clamp-2 group-hover:text-primary transition-colors" style={{ color: 'hsl(180,100%,90%)' }}>{idea.content}</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(200,220,230,0.35)' }}>{idea.likes} likes · {idea.branches.length} forks</p>
                 </div>
               ))}
               {ideas.length === 0 && (
                 <p className="text-sm italic font-mono" style={{ color: 'rgba(200,220,230,0.3)' }}>No activity yet...</p>
               )}
            </div>
            <button onClick={() => setActiveTab('news')} className="text-sm font-bold mt-6 hover:underline text-left transition-colors" style={{ color: 'hsl(177,100%,44%)' }}>Show more</button>
          </div>

          <div className="rounded-3xl p-6" style={{ background: 'rgba(16,24,45,0.9)', border: '1px solid rgba(0,225,210,0.1)', boxShadow: '0 0 30px rgba(0,225,210,0.04)' }}>
            <h3 className="text-lg font-black mb-4" style={{ color: 'hsl(177,100%,44%)' }}>Who to follow</h3>
            <div className="space-y-4">
              {users.filter(u => u.id !== currentUser?.id).slice(0, 4).map((su) => (
                <div key={su.id} className="flex items-center gap-3">
                  <Avatar 
                    className="w-10 h-10 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ boxShadow: '0 0 6px rgba(0,225,210,0.2)' }}
                    onClick={() => window.dispatchEvent(new CustomEvent('open-user', { detail: su.id }))}
                  >
                    <AvatarImage src={su.avatar} />
                    <AvatarFallback style={{ background: 'rgba(0,225,210,0.2)', color: 'hsl(177,100%,44%)' }}>{su.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('open-user', { detail: su.id }))}>
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-sm truncate hover:underline" style={{ color: 'hsl(180,100%,90%)' }}>{su.name}</p>
                      {su.verified && <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: 'hsl(177,100%,44%)' }} />}
                    </div>
                    <p className="text-xs font-mono truncate" style={{ color: 'rgba(0,225,210,0.5)' }}>@{su.handle}</p>
                  </div>
                  <button 
                    onClick={() => { if (!currentUser) { setAuthModalOpen(true); } else { toggleFollow(su.id); } }}
                    className="text-xs font-bold px-4 py-1.5 rounded-full transition-all"
                    style={currentUser?.following?.includes(su.id) ? {
                      background: 'transparent',
                      color: 'rgba(200,220,230,0.6)',
                      border: '1px solid rgba(0,225,210,0.2)',
                    } : {
                      background: 'hsl(177,100%,44%)',
                      color: 'hsl(222,47%,5%)',
                      boxShadow: '0 0 12px rgba(0,225,210,0.3)',
                    }}
                  >
                    {currentUser?.following?.includes(su.id) ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
              {users.length <= 1 && (
                <p className="text-sm italic font-mono" style={{ color: 'rgba(200,220,230,0.3)' }}>Finding creators...</p>
              )}
            </div>
            <button className="text-sm font-bold mt-6 hover:underline text-left" style={{ color: 'hsl(177,100%,44%)' }}>Show more</button>
          </div>
        </aside>
      </div>

      {/* FAB (Mobile Only) */}
      {onCompose && activeTab === 'home' && (
        <motion.button 
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onCompose}
          className="sm:hidden absolute right-4 w-14 h-14 rounded-full flex items-center justify-center z-20"
          style={{ 
            bottom: 'calc(5rem + env(safe-area-inset-bottom))',
            background: 'linear-gradient(135deg, hsl(177,100%,44%), hsl(177,100%,35%))',
            color: 'hsl(222,47%,5%)',
            boxShadow: '0 0 24px rgba(0,225,210,0.4), 0 4px 20px rgba(0,225,210,0.2)',
          }}
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
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] z-50 flex flex-col"
              style={{ background: 'rgba(8,14,30,0.98)', borderRight: '1px solid rgba(0,225,210,0.15)', boxShadow: '4px 0 40px rgba(0,225,210,0.1)' }}
            >
              <div className="p-4 flex justify-between items-start" style={{ borderBottom: '1px solid rgba(0,225,210,0.1)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(177,100%,44%), hsl(177,100%,30%))' }}>
                    <Lock className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-xl font-black" style={{ color: 'hsl(177,100%,44%)' }}>fork.</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-white/5">
                  <X className="w-5 h-5" style={{ color: 'rgba(200,220,230,0.5)' }} />
                </button>
              </div>
              
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,225,210,0.08)' }}>
                <Avatar className="w-12 h-12 rounded-xl mb-3" style={{ boxShadow: '0 0 12px rgba(0,225,210,0.3)' }}>
                  <AvatarImage src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`} />
                  <AvatarFallback style={{ background: 'rgba(0,225,210,0.2)', color: 'hsl(177,100%,44%)' }}>{currentUser ? currentUser.name.charAt(0) : 'G'}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5">
                  <div className="font-bold text-lg" style={{ color: 'hsl(180,100%,90%)' }}>{currentUser?.name || 'Guest'}</div>
                  {currentUser?.verified && <BadgeCheck className="w-4 h-4" style={{ color: 'hsl(177,100%,44%)' }} />}
                </div>
                <div className="text-sm font-mono" style={{ color: 'hsl(177,100%,44%)' }}>@{currentUser?.handle || 'visitor'}</div>
                {currentUser && (
                  <div className="flex gap-4 mt-3 text-sm">
                    <div className="flex gap-1"><span className="font-bold" style={{ color: 'hsl(180,100%,90%)' }}>{currentUser.following?.length || 0}</span> <span style={{ color: 'rgba(200,220,230,0.4)' }}>Following</span></div>
                    <div className="flex gap-1"><span className="font-bold" style={{ color: 'hsl(180,100%,90%)' }}>{currentUser.followers?.length || 0}</span> <span style={{ color: 'rgba(200,220,230,0.4)' }}>Followers</span></div>
                  </div>
                )}
              </div>

              <div className="flex-1 py-2 overflow-y-auto">
                {[
                  { id: 'profile', icon: User, label: 'Profile' },
                  { id: 'communities', icon: Users, label: 'Communities' },
                  { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
                  { id: 'settings', icon: Settings, label: 'Settings' },
                ].map(item => (
                  <button 
                    key={item.id}
                    className="w-full flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/5"
                    onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                    style={{ color: 'rgba(200,220,230,0.7)' }}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-bold text-[17px]">{item.label}</span>
                  </button>
                ))}
                <button 
                  className="w-full flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/5"
                  onClick={() => { alert("Para instalar fork. en tu dispositivo:\n\niOS: Toca el botón de Compartir y elige 'Agregar a inicio'.\n\nAndroid: En el menú del navegador, selecciona 'Instalar aplicación'."); setIsMenuOpen(false); }}
                  style={{ color: 'rgba(200,220,230,0.7)' }}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="font-bold text-[17px]">Instalar App</span>
                </button>
              </div>

              <div className="p-4" style={{ borderTop: '1px solid rgba(0,225,210,0.08)' }}>
                {currentUser ? (
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-4 py-2 rounded-lg px-2 -mx-2 transition-colors"
                    style={{ color: 'rgb(239,68,68)' }}
                  >
                    <LogOut className="w-6 h-6" />
                    <span className="font-bold text-[17px]">Log out</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => { setAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="w-full font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
                    style={{ background: 'hsl(177,100%,44%)', color: 'hsl(222,47%,5%)', boxShadow: '0 0 20px rgba(0,225,210,0.3)' }}
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
