import React, { useState, useEffect } from 'react';
import { Home, FileText, MessageSquare, User, Plus, X, Settings, Bookmark, LogOut, Smartphone, Bell } from 'lucide-react';
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
  const { currentUser, notifications, logout, unreadMessagesCount } = useAppContext();
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleOpenMenu = () => setIsMenuOpen(true);
    window.addEventListener('open-menu', handleOpenMenu);
    return () => window.removeEventListener('open-menu', handleOpenMenu);
  }, []);

  // removed toggleDarkMode

  return (
    <div className="h-[100dvh] w-full bg-white dark:bg-gray-950 max-w-md mx-auto border-x border-gray-100 dark:border-gray-800 relative flex flex-col overflow-hidden transition-colors">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-white dark:bg-gray-950 transition-colors">
        {children}
      </main>

      {/* FAB */}
      {onCompose && activeTab === 'home' && (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCompose}
          className="absolute right-4 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors z-20"
          style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* Bottom Nav */}
      <div className="flex-none bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex justify-around items-center px-2 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-20 transition-colors">
        <button onClick={() => setActiveTab('home')} className="p-2 flex-1 flex justify-center">
          <Home className={`w-6 h-6 ${activeTab === 'home' ? 'text-primary fill-primary/10' : 'text-gray-400 dark:text-gray-500'}`} />
        </button>
        <button onClick={() => setActiveTab('news')} className="p-2 flex-1 flex justify-center">
          <FileText className={`w-6 h-6 ${activeTab === 'news' ? 'text-primary fill-primary/10' : 'text-gray-400 dark:text-gray-500'}`} />
        </button>
        <button onClick={() => setActiveTab('notifications')} className="p-2 flex-1 flex justify-center relative">
          <Bell className={`w-6 h-6 ${activeTab === 'notifications' ? 'text-primary fill-primary/10' : 'text-gray-400 dark:text-gray-500'}`} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1/2 -mr-3 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
        <button onClick={() => setActiveTab('messages')} className="p-2 flex-1 flex justify-center relative">
          <MessageSquare className={`w-6 h-6 ${activeTab === 'messages' ? 'text-primary fill-primary/10' : 'text-gray-400 dark:text-gray-500'}`} />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1.5 right-1/2 -mr-3 bg-red-500 text-white text-[10px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-gray-950">
              {unreadMessagesCount}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('profile')} className="p-2 flex-1 flex justify-center">
          <User className={`w-6 h-6 ${activeTab === 'profile' ? 'text-primary fill-primary/10' : 'text-gray-400 dark:text-gray-500'}`} />
        </button>
      </div>

      {/* Hamburger Drawer Menu */}
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
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="font-bold text-gray-900 dark:text-white text-lg">{currentUser.name}</div>
                <div className="text-gray-500 text-[15px]">@{currentUser.handle}</div>
                <div className="flex gap-4 mt-3 text-[15px]">
                  <div className="flex gap-1"><span className="font-bold text-gray-900 dark:text-white">{currentUser.following?.length || 0}</span> <span className="text-gray-500">Following</span></div>
                  <div className="flex gap-1"><span className="font-bold text-gray-900 dark:text-white">{currentUser.followers?.length || 0}</span> <span className="text-gray-500">Followers</span></div>
                </div>
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
                  <span className="font-bold text-[17px]">Configuración</span>
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
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-lg px-2 -mx-2"
                >
                  <LogOut className="w-6 h-6" />
                  <span className="font-bold text-[17px]">Log out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

