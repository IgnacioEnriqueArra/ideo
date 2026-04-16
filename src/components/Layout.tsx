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
  const { currentUser, notifications, logout, unreadMessagesCount, setAuthModalOpen } = useAppContext();
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
        <aside className="hidden sm:flex flex-col w-[80px] lg:w-[280px] sticky top-0 h-screen py-4 shrink-0 border-r border-gray-100 dark:border-gray-800">
          <div className="px-4 mb-8">
            <span className="text-3xl font-black text-primary tracking-tighter">ideo.</span>
          </div>
          
          <nav className="flex-1 space-y-2">
            {[
              { id: 'home', icon: Home, label: 'Inicio' },
              { id: 'news', icon: FileText, label: 'Noticias' },
              { id: 'notifications', icon: Bell, label: 'Notificaciones', count: unreadNotificationsCount },
              { id: 'messages', icon: MessageSquare, label: 'Mensajes', count: unreadMessagesCount },
              { id: 'profile', icon: User, label: 'Perfil' },
              { id: 'bookmarks', icon: Bookmark, label: 'Marcadores' },
              { id: 'settings', icon: Settings, label: 'Configuración' },
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
              <span className="hidden lg:block text-lg">Postear</span>
            </button>
          </nav>

          <div className="mt-auto px-2">
            {currentUser ? (
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <Avatar className="w-10 h-10 rounded-xl">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate">{currentUser.name}</p>
                  <p className="text-sm text-gray-500 truncate">@{currentUser.handle}</p>
                </div>
                <MoreHorizontal className="hidden lg:block w-5 h-5 text-gray-400" />
              </button>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gray-900 text-white hover:bg-black transition-all"
              >
                <User className="w-6 h-6 mx-auto lg:mx-0" />
                <span className="hidden lg:block font-bold">Entrar</span>
              </button>
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
             <input type="text" placeholder="Buscar en Ideo" className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none" />
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Qué está pasando</h3>
            <div className="space-y-6">
               {[
                 { category: 'Tendencia en Argentina', topic: 'Innovación', posts: '1.2K ideas' },
                 { category: 'Tecnología · Tendencia', topic: 'React 19', posts: '850 ideas' },
                 { category: 'Diseño', topic: 'Bento Grid', posts: '420 ideas' },
               ].map((trend, i) => (
                 <div key={i} className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 -mx-4 px-4 py-2 rounded-xl transition-colors">
                    <p className="text-xs text-gray-500 font-medium">{trend.category}</p>
                    <p className="font-bold text-gray-900 dark:text-white mt-0.5">{trend.topic}</p>
                    <p className="text-xs text-gray-400 mt-1">{trend.posts}</p>
                 </div>
               ))}
            </div>
            <button className="text-primary text-sm font-bold mt-6 hover:underline">Mostrar más</button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">A quién seguir</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">I</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate dark:text-white">Ideo Team</p>
                  <p className="text-xs text-gray-500 truncate">@ideo_official</p>
                </div>
                <button className="bg-gray-900 text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-black transition-colors">Seguir</button>
              </div>
            </div>
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
                  <AvatarImage src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`} />
                  <AvatarFallback>{currentUser ? currentUser.name.charAt(0) : 'G'}</AvatarFallback>
                </Avatar>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                  <div className="font-bold text-gray-900 dark:text-white text-lg">{currentUser?.name || 'Inicia sesión en Ideo'}</div>
                  {currentUser?.verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="text-gray-500 text-[15px]">@{currentUser?.handle || 'visitante'}</div>
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
                    <span>Iniciar Sesión</span>
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

