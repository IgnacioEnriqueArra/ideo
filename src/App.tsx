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
  const { currentUser, isAuthReady, isAuthModalOpen, setAuthModalOpen } = useAppContext();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 640);
  const [viewCount, setViewCount] = useState(0);

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

  // Admin logic for PC
  const isAdminPath = window.location.pathname === '/agent';

  if (isDesktop && isAdminPath) {
    if (!isAuthReady) {
      return (
        <div className="h-screen w-full bg-white flex items-center justify-center">
          <div className="animate-pulse text-4xl font-black text-primary tracking-tighter">ideo.</div>
        </div>
      );
    }

    if (!currentUser || currentUser.email !== 'ignacioarra.it@gmail.com') {
      return (
        <div className="h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full">
            {!currentUser ? (
              <AuthScreen />
            ) : (
              <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 shadow-xl text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                  ✕
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Restricted Access</h2>
                <p className="text-gray-500 mb-8">This section is for authorized administrators only.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-primary text-white font-bold py-4 rounded-full hover:bg-blue-600 transition-all"
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen w-full bg-gray-50 overflow-hidden">
         <AdminDashboard onBack={() => window.location.href = '/'} />
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

  // Guest can see the feed
  // if (!currentUser) {
  //   return <AuthScreen />;
  // }

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
          onUserClick={(id) => {
            if (!currentUser) {
              setAuthModalOpen(true);
            } else {
              setSelectedUserId(id);
            }
          }}
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
      default:
        return (
          <Feed 
            key="feed" 
            onSelectIdea={(id) => {
              if (!currentUser && viewCount >= 3) {
                setAuthModalOpen(true);
              } else {
                setSelectedIdeaId(id);
                if (!currentUser) setViewCount(prev => prev + 1);
              }
            }} 
            onUserClick={(id) => {
              if (!currentUser) {
                setAuthModalOpen(true);
              } else {
                setSelectedUserId(id);
              }
            }}
            onNotificationsClick={() => {
              if (!currentUser) {
                setAuthModalOpen(true);
              } else {
                setActiveTab('notifications');
              }
            }} 
          />
        );
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        if (!currentUser && ['notifications', 'bookmarks', 'settings', 'messages', 'profile'].includes(tab)) {
          setAuthModalOpen(true);
          return;
        }
        setSelectedIdeaId(null);
        setSelectedUserId(null);
        setActiveTab(tab);
      }} 
      onCompose={() => {
        if (!currentUser) {
          setAuthModalOpen(true);
        } else {
          setIsComposeOpen(true);
        }
      }}
    >
      {!currentUser && activeTab === 'home' && !selectedIdeaId && !selectedUserId && (
        <div className="bg-primary/5 border-b border-primary/10 p-4 animate-in slide-in-from-top duration-500">
           <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-gray-700">Explore the best of <span className="font-bold text-primary">ideo.</span> Create an account to join the conversation.</p>
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="shrink-0 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm"
              >
                Join now
              </button>
           </div>
        </div>
      )}
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
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

function AuthScreen({ inModal, onDone }: { inModal?: boolean, onDone?: () => void }) {
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
      if (onDone) onDone();
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className={`${inModal ? '' : 'h-[100dvh]'} w-full bg-white dark:bg-gray-950 max-w-md mx-auto border-x border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-6 transition-colors`}>
        <div className="mb-6">
          <span className={`${inModal ? 'text-4xl' : 'text-5xl'} font-black text-primary tracking-tighter text-center`}>ideo.</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-gray-500 text-center mb-8">Write, share and build ideas together.</p>
        
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {!isLogin && (
            <>
              <input type="text" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required className="w-full p-3.5 rounded-2xl border border-gray-200 outline-none focus:border-primary transition-colors" />
              <input type="text" placeholder="Username" value={handle} onChange={e=>setHandle(e.target.value.toLowerCase().trim())} required className="w-full p-3.5 rounded-2xl border border-gray-200 outline-none focus:border-primary transition-colors" />
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full p-3.5 rounded-2xl border border-gray-200 outline-none focus:border-primary transition-colors" />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} className="w-full p-3.5 rounded-2xl border border-gray-200 outline-none focus:border-primary transition-colors dark:bg-gray-900 dark:text-white" />
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold py-4 rounded-full hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isLogin ? 'Log In' : 'Sign Up'
            )}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-gray-500 text-sm hover:underline font-medium">
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
  );
}

import { motion } from 'motion/react';
import { X } from 'lucide-react';

function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-950 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>
        <AuthScreen inModal onDone={onClose} />
      </motion.div>
    </motion.div>
  );
}




