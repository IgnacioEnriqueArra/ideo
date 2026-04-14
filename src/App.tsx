import React, { useState } from 'react';
import { AppProvider, useAppContext } from './AppContext';
import { Feed } from './components/Feed';
import { IdeaDetail } from './components/IdeaDetail';
import { Profile } from './components/Profile';
import { NewsFeed } from './components/NewsFeed';
import { Notifications } from './components/Notifications';
import { Bookmarks } from './components/Bookmarks';
import { Layout } from './components/Layout';
import { ComposeModal } from './components/ComposeModal';
import { Settings } from './components/Settings';
import { AnimatePresence } from 'motion/react';

function AppContent() {
  const { currentUser, isAuthReady } = useAppContext();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 640);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isDesktop) {
    return (
      <div className="h-[100dvh] w-full bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-xl shadow-primary/20">
            <span className="text-white font-bold text-4xl">i.</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Ideo está en camino.</h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Actualmente solo tenemos disponible la <span className="text-primary font-bold">versión móvil</span>. La experiencia para PC llegará próximamente.
          </p>
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm inline-block">
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-2">Escanea o abre en tu móvil</p>
            <div className="text-primary font-mono font-bold">ideo-social.app</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthReady) {
    return (
      <div className="h-[100dvh] w-full bg-white dark:bg-gray-950 max-w-md mx-auto border-x border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-6 transition-colors">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <span className="text-white font-bold text-3xl">i.</span>
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
    >
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (login) login(email, password);
    } else {
      if (signup) signup(email, password, name, handle);
    }
  };

  return (
      <div className="h-[100dvh] w-full bg-white dark:bg-gray-950 max-w-md mx-auto border-x border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-6 transition-colors">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
          <span className="text-white font-bold text-3xl">i.</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Welcome to Ideo.</h1>
        <p className="text-gray-500 text-center mb-8">Escribe, comparte y construye ideas.</p>
        
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {!isLogin && (
            <>
              <input type="text" placeholder="Nombre completo" value={name} onChange={e=>setName(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-200" />
              <input type="text" placeholder="Nombre de usuario (sin espacios)" value={handle} onChange={e=>setHandle(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-200" />
            </>
          )}
          <input type="email" placeholder="Correo electrónico" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-200" />
          <input type="password" placeholder="Contraseña (mínimo 6 caracteres)" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} className="w-full p-3 rounded-lg border border-gray-200 dark:bg-gray-900 dark:text-white" />
          
          <button type="submit" className="w-full bg-primary text-white font-bold py-3.5 rounded-full hover:bg-blue-600 transition-colors">
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-gray-500 text-sm hover:underline">
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
  );
}




