import React, { createContext, useContext, useState, useEffect } from 'react';
import { Idea, User, Branch, Feedback } from './types';
import { supabase } from './supabase';

export interface Notification {
  id: string;
  type: 'like' | 'branch' | 'feedback' | 'follow';
  actorId: string;
  recipientId: string;
  targetId: string;
  createdAt: string;
  read: boolean;
}

type AppContextType = {
  currentUser: User | null;
  users: User[];
  ideas: Idea[];
  bookmarks: string[];
  userLikes: string[];
  notifications: (Notification & { actor: User })[];
  addIdea: (content: string, tags: string[]) => void;
  addBranch: (ideaId: string, content: string) => void;
  addFeedback: (ideaId: string, branchId: string, content: string) => void;
  likeIdea: (ideaId: string) => void;
  likeBranch: (ideaId: string, branchId: string) => void;
  toggleBookmark: (ideaId: string) => void;
  updateProfile: (name: string, handle: string, bio: string, avatar: string) => void;
  markNotificationsRead: () => void;
  toggleFollow: (userId: string) => void;
  deleteIdea: (ideaId: string) => void;
  deleteAccount: () => Promise<void>;
  logout: () => void;
  login: (email?: string, password?: string) => Promise<void>;
  signup?: (email: string, password: string, name: string, handle: string) => Promise<void>;
  loginRedirect: () => void;
  isAuthReady: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rawIdeas, setRawIdeas] = useState<any[]>([]);
  const [rawBranches, setRawBranches] = useState<any[]>([]);
  const [rawFeedbacks, setRawFeedbacks] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [rawNotifications, setRawNotifications] = useState<Notification[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Initial Auth & Data Fetching
  useEffect(() => {
    let authSubscription: any;
    
    const initializeData = async () => {
      // Fetch public data
      const [uRes, iRes, bRes, fRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('ideas').select('*').order('createdAt', { ascending: false }),
        supabase.from('branches').select('*').order('createdAt', { ascending: true }),
        supabase.from('feedbacks').select('*').order('createdAt', { ascending: true })
      ]);
      if (uRes.data) setUsers(uRes.data);
      if (iRes.data) setRawIdeas(iRes.data);
      if (bRes.data) setRawBranches(bRes.data);
      if (fRes.data) setRawFeedbacks(fRes.data);
      
      // Auth
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchCurrentUser(session.user.id);
      } else {
        setIsAuthReady(true);
      }

      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await fetchCurrentUser(session.user.id);
        } else {
          setCurrentUser(null);
        }
      });
      authSubscription = data.subscription;
    };

    initializeData();

    // Supabase Realtime for public tables
    const channel = supabase.channel('public-db')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, payload => {
        supabase.from('users').select('*').then(res => res.data && setUsers(res.data));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, () => {
        supabase.from('ideas').select('*').order('createdAt', { ascending: false }).then(res => res.data && setRawIdeas(res.data));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'branches' }, () => {
        supabase.from('branches').select('*').order('createdAt', { ascending: true }).then(res => res.data && setRawBranches(res.data));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedbacks' }, () => {
        supabase.from('feedbacks').select('*').order('createdAt', { ascending: true }).then(res => res.data && setRawFeedbacks(res.data));
      })
      .subscribe();

    return () => {
      authSubscription?.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCurrentUser = async (id: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    if (data) setCurrentUser(data as User);
    setIsAuthReady(true);
  };

  // User specific fetching
  useEffect(() => {
    if (!currentUser) {
      setBookmarks([]);
      setUserLikes([]);
      setRawNotifications([]);
      return;
    }

    const fetchUserSpecific = async () => {
      const [bRes, lRes, nRes] = await Promise.all([
        supabase.from('bookmarks').select('*').eq('userId', currentUser.id),
        supabase.from('likes').select('*').eq('userId', currentUser.id),
        supabase.from('notifications').select('*').eq('recipientId', currentUser.id).order('createdAt', { ascending: false })
      ]);
      if (bRes.data) setBookmarks(bRes.data.map((b: any) => b.ideaId));
      if (lRes.data) setUserLikes(lRes.data.map((l: any) => l.targetId));
      if (nRes.data) setRawNotifications(nRes.data);
    };
    fetchUserSpecific();

    // Realtime for private tables
    const channel = supabase.channel(`user-${currentUser.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookmarks', filter: `userId=eq.${currentUser.id}` }, fetchUserSpecific)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes', filter: `userId=eq.${currentUser.id}` }, fetchUserSpecific)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `recipientId=eq.${currentUser.id}` }, fetchUserSpecific)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id]);

  const ideas: Idea[] = rawIdeas.map(rawIdea => {
    const author = users.find(u => u.id === rawIdea.authorId) || { id: rawIdea.authorId, name: 'Unknown', handle: 'unknown', avatar: '', followers: [], following: [] };
    const ideaBranches: Branch[] = rawBranches
      .filter(b => b.ideaId === rawIdea.id)
      .map(rawBranch => {
        const branchAuthor = users.find(u => u.id === rawBranch.authorId) || { id: rawBranch.authorId, name: 'Unknown', handle: 'unknown', avatar: '', followers: [], following: [] };
        const branchFeedbacks: Feedback[] = rawFeedbacks
          .filter(f => f.branchId === rawBranch.id)
          .map(rawFeedback => {
            const feedbackAuthor = users.find(u => u.id === rawFeedback.authorId) || { id: rawFeedback.authorId, name: 'Unknown', handle: 'unknown', avatar: '', followers: [], following: [] };
            return { id: rawFeedback.id, branchId: rawFeedback.branchId, author: feedbackAuthor, content: rawFeedback.content, createdAt: rawFeedback.createdAt };
          });
        return { id: rawBranch.id, ideaId: rawBranch.ideaId, author: branchAuthor, content: rawBranch.content, createdAt: rawBranch.createdAt, likes: rawBranch.likes || 0, feedbacks: branchFeedbacks };
      });
    return { id: rawIdea.id, author, content: rawIdea.content, createdAt: rawIdea.createdAt, likes: rawIdea.likes || 0, tags: rawIdea.tags || [], branches: ideaBranches };
  });

  const notifications = rawNotifications.map(n => {
    const actor = users.find(u => u.id === n.actorId) || { id: n.actorId, name: 'Unknown', handle: 'unknown', avatar: '', followers: [], following: [] };
    return { ...n, actor };
  });

  const createNotification = async (recipientId: string, type: Notification['type'], targetId: string) => {
    if (!currentUser || currentUser.id === recipientId) return;
    await supabase.from('notifications').insert({ recipientId, actorId: currentUser.id, type, targetId, createdAt: new Date().toISOString(), read: false });
  };

  const addIdea = async (content: string, tags: string[]) => {
    if (!currentUser) return;
    await supabase.from('ideas').insert({ authorId: currentUser.id, content, createdAt: new Date().toISOString(), likes: 0, tags });
  };

  const deleteIdea = async (ideaId: string) => {
    if (!currentUser) return;
    const targetIdea = rawIdeas.find(i => i.id === ideaId);
    if (targetIdea && targetIdea.authorId === currentUser.id) {
      await supabase.from('ideas').delete().eq('id', ideaId);
    }
  };

  const addBranch = async (ideaId: string, content: string) => {
    if (!currentUser) return;
    await supabase.from('branches').insert({ ideaId, authorId: currentUser.id, content, createdAt: new Date().toISOString(), likes: 0 });
    const idea = rawIdeas.find(i => i.id === ideaId);
    if (idea) createNotification(idea.authorId, 'branch', ideaId);
  };

  const addFeedback = async (ideaId: string, branchId: string, content: string) => {
    if (!currentUser) return;
    await supabase.from('feedbacks').insert({ branchId, authorId: currentUser.id, content, createdAt: new Date().toISOString() });
    const branch = rawBranches.find(b => b.id === branchId);
    if (branch) createNotification(branch.authorId, 'feedback', branchId);
  };

  const likeIdea = async (ideaId: string) => {
    if (!currentUser) return;
    const { data: likeSnap } = await supabase.from('likes').select('*').eq('userId', currentUser.id).eq('targetId', ideaId).single();
    const idea = rawIdeas.find(i => i.id === ideaId);

    if (likeSnap) {
      await supabase.from('likes').delete().eq('id', likeSnap.id);
      if (idea) await supabase.from('ideas').update({ likes: Math.max(0, (idea.likes || 0) - 1) }).eq('id', ideaId);
    } else {
      await supabase.from('likes').insert({ userId: currentUser.id, targetId: ideaId, type: 'idea' });
      if (idea) {
        await supabase.from('ideas').update({ likes: (idea.likes || 0) + 1 }).eq('id', ideaId);
        createNotification(idea.authorId, 'like', ideaId);
      }
    }
  };

  const likeBranch = async (ideaId: string, branchId: string) => {
    if (!currentUser) return;
    const { data: likeSnap } = await supabase.from('likes').select('*').eq('userId', currentUser.id).eq('targetId', branchId).single();
    const branch = rawBranches.find(b => b.id === branchId);

    if (likeSnap) {
      await supabase.from('likes').delete().eq('id', likeSnap.id);
      if (branch) await supabase.from('branches').update({ likes: Math.max(0, (branch.likes || 0) - 1) }).eq('id', branchId);
    } else {
      await supabase.from('likes').insert({ userId: currentUser.id, targetId: branchId, type: 'branch' });
      if (branch) {
        await supabase.from('branches').update({ likes: (branch.likes || 0) + 1 }).eq('id', branchId);
        createNotification(branch.authorId, 'like', branchId);
      }
    }
  };

  const toggleBookmark = async (ideaId: string) => {
    if (!currentUser) return;
    const { data: bookmarkSnap } = await supabase.from('bookmarks').select('*').eq('userId', currentUser.id).eq('ideaId', ideaId).single();

    if (bookmarkSnap) {
      await supabase.from('bookmarks').delete().eq('id', bookmarkSnap.id);
    } else {
      await supabase.from('bookmarks').insert({ userId: currentUser.id, ideaId });
    }
  };

  const updateProfile = async (name: string, handle: string, bio: string, avatar: string) => {
    if (!currentUser) return;
    await supabase.from('users').update({ name, handle, bio, avatar }).eq('id', currentUser.id);
  };

  const markNotificationsRead = async () => {
    if (!currentUser) return;
    const unreadNotifs = rawNotifications.filter(n => !n.read);
    const updates = unreadNotifs.map(n => supabase.from('notifications').update({ read: true }).eq('id', n.id));
    await Promise.all(updates);
  };

  const toggleFollow = async (userId: string) => {
    if (!currentUser) return;
    const isFollowing = currentUser.following?.includes(userId);
    const targetUser = users.find(u => u.id === userId);
    
    if (isFollowing) {
      await supabase.from('users').update({ following: (currentUser.following || []).filter(id => id !== userId) }).eq('id', currentUser.id);
      if (targetUser) await supabase.from('users').update({ followers: (targetUser.followers || []).filter(id => id !== currentUser.id) }).eq('id', userId);
    } else {
      await supabase.from('users').update({ following: [...(currentUser.following || []), userId] }).eq('id', currentUser.id);
      if (targetUser) await supabase.from('users').update({ followers: [...(targetUser.followers || []), currentUser.id] }).eq('id', userId);
      createNotification(userId, 'follow', currentUser.id);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const login = async (email?: string, password?: string) => {
    if (email && password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
  };

  const signup = async (email: string, password: string, name: string, handle: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
      return;
    }
    if (data.user) {
      const newUser: User = {
        id: data.user.id,
        name,
        handle,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
        bio: '¡Hola a todos!',
        followers: [],
        following: []
      };
      await supabase.from('users').insert(newUser);
    }
  };

  const loginRedirect = async () => {
    // Deprecated
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    try {
      await supabase.from('users').delete().eq('id', currentUser.id);
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error deleting user account:", error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{ currentUser, users, ideas, bookmarks, userLikes, notifications, addIdea, addBranch, addFeedback, likeIdea, likeBranch, toggleBookmark, updateProfile, markNotificationsRead, toggleFollow, deleteIdea, deleteAccount, logout, login, signup, loginRedirect, isAuthReady }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
