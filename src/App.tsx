import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './AppContext';
import { Feed } from './components/Feed';
import { IdeaDetail } from './components/IdeaDetail';
import { Profile } from './components/Profile';
import { NewsFeed } from './components/NewsFeed';
import { Notifications } from './components/Notifications';
import { Bookmarks } from './components/Bookmarks';
import { Messages } from './components/Messages';
import { Layout } from './components/Layout';
import { ComposeModal } from './components/ComposeModal';
import { Settings } from './components/Settings';
import { AdminDashboard } from './components/AdminDashboard';
import { AnimatePresence } from 'motion/react';

function AppContent() {
  const { currentUser, isAuthReady } = useAppContext();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 640);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Secret admin trigger: tap the title 5 times quickly
  const [titleTaps, setTitleTaps] = useState(0);
  const handleTitleTap = () => {
    const next = titleTaps + 1;
    setTitleTaps(next);
    if (next >= 5) { setIsAdminOpen(true); setTitleTaps(0); }
    setTimeout(() => setTitleTaps(0), 2000);
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 640);
    const handleOpenPost = (e: any) => {
      setSelectedIdeaId(e.detail);
      setActiveTab('home'); // Ensure we are on home to see the detail
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('open-post', handleOpenPost);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('open-post', handleOpenPost);
    };
  }, []);

  if (isDesktop) {
    return (
      <div className="h-[100dvh] w-full bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <div className="mb-8">
            <span className="text-6xl font-black text-primary tracking-tighter">ideo.</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Ideo está en camino.</h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-10">
            Nuestra experiencia completa para escritorio está siendo construida. Por ahora, disfruta de la <span className="text-primary font-bold">versión móvil</span>.
          </p>
          
          <div className="flex flex-col items-center gap-4 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://ideonetwork.vercel.app" 
                alt="QR Code" 
                className="w-40 h-40"
              />
            </div>
            <div className="mt-2">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-3">Escanea para abrir en tu móvil</p>
              <div className="px-4 py-2 bg-white rounded-full border border-slate-200 text-primary font-mono font-bold text-sm shadow-sm inline-block">
                ideonetwork.vercel.app
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthReady) {
    return (
      <div className="h-[100dvh] w-full bg-white dark:bg-gray-950 max-w-md mx-auto border-x border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-6 transition-colors">
        <div className="mb-6 animate-pulse">
          <span className="text-4xl font-black text-primary tracking-tighter">ideo.</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  const renderContent = () => {
    if (selectedUserId) {
      return (
        <Profile 
          key="profile-view" 
          userId={selectedUserId} 
          onBack={() => setSelectedUserId(null)} 
        />
      );
    }

    if (selectedIdeaId) {
      return (
        <IdeaDetail 
          key="detail"
          ideaId={selectedIdeaId} 
          onBack={() => setSelectedIdeaId(null)} 
          onUserClick={setSelectedUserId}
        />
      );
    }
    
    switch (activeTab) {
      case 'profile':
        return <Profile key="profile" onBack={() => setActiveTab('home')} />;
      case 'news':
        return <NewsFeed key="news" />;
      case 'notifications':
        return <Notifications key="notifications" onUserClick={setSelectedUserId} />;
      case 'bookmarks':
        return <Bookmarks key="bookmarks" onBack={() => setActiveTab('home')} onUserClick={setSelectedUserId} />;
      case 'settings':
        return <Settings key="settings" onBack={() => setActiveTab('home')} />;
      case 'messages':
        return <Messages key="messages" />;
      case 'home':
      default:
        return <Feed key="feed" onSelectIdea={setSelectedIdeaId} onUserClick={setSelectedUserId} onNotificationsClick={() => setActiveTab('notifications')} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={(tab) => {
        setSelectedIdeaId(null);
        setSelectedUserId(null);
        setActiveTab(tab);
      }}
      onCompose={() => setIsComposeOpen(true)}
      onTitleTap={handleTitleTap}
    >
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
      <AnimatePresence>
        {isAdminOpen && <AdminDashboard onBack={() => setIsAdminOpen(false)} />}
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AuthScreen() {
  const { login, signup } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        if (login) await login(email, password);
      } else {
        if (signup) await signup(email, password, name, handle);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="h-[100dvh] w-full bg-white dark:bg-gray-950 max-w-md mx-auto border-x border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-6 transition-colors">
        <div className="mb-6">
          <span className="text-5xl font-black text-primary tracking-tighter text-center">ideo.</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
        </h1>
        <p className="text-gray-500 text-center mb-8">Escribe, comparte y construye ideas.</p>
        
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {!isLogin && (
            <>
              <input type="text" placeholder="Nombre completo" value={name} onChange={e=>setName(e.target.value)} required className="w-full p-3.5 rounded-2xl border border-gray-200 outline-none focus:border-primary transition-colors" />
              <input type="text" placeholder="Nombre de usuario" value={handle} onChange={e=>setHandle(e.target.value.toLowerCase().trim())} required className="w-full p-3.5 rounded-2xl border border-gray-200 outline-none focus:border-primary transition-colors" />
            </>
          )}
          <input type="email" placeholder="Correo electrónico" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full p-3.5 rounded-2xl border border-gray-200 outline-none focus:border-primary transition-colors" />
          <input type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} className="w-full p-3.5 rounded-2xl border border-gray-200 outline-none focus:border-primary transition-colors dark:bg-gray-900 dark:text-white" />
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold py-4 rounded-full hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isLogin ? 'Iniciar Sesión' : 'Registrarse'
            )}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-gray-500 text-sm hover:underline font-medium">
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
  );
}




