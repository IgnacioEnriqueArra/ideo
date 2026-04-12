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
  const { currentUser, login, loginRedirect, isAuthReady } = useAppContext();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

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
    return (
      <div className="h-[100dvh] w-full bg-white dark:bg-gray-950 max-w-md mx-auto border-x border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-6 transition-colors">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
          <span className="text-white font-bold text-3xl">i.</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Welcome to ideo.</h1>
        <p className="text-gray-500 text-center mb-8">The place where developers share, branch, and build ideas together.</p>
        <button 
          onClick={login}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-full hover:bg-blue-600 transition-colors"
        >
          Sign in with Google
        </button>
        <button 
          onClick={loginRedirect}
          className="w-full mt-4 text-gray-500 text-sm hover:underline"
        >
          ¿Problemas con la ventana emergente? Usa el redireccionamiento
        </button>
      </div>
    );
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
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onCompose={() => setIsComposeOpen(true)}>
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




