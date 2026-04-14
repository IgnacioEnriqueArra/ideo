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
  addIdea: (content: string, tags: string[], mediaFile?: File) => void;
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

  useEffect(() => {
    let authSubscription: any;
    
    const initializeData = async () => {
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

    // Tiempo Real SIN Fetch Completos (Instantáneo)
    const channel = supabase.channel('public-db')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, payload => {
        if (payload.eventType === 'INSERT') setUsers(p => { const x = p.find(u => u.id === payload.new.id); return x ? p : [...p, payload.new as User] });
        if (payload.eventType === 'UPDATE') setUsers(p => p.map(u => u.id === payload.new.id ? payload.new as User : u));
        if (payload.eventType === 'DELETE') setUsers(p => p.filter(u => u.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, payload => {
        if (payload.eventType === 'INSERT') setRawIdeas(p => { const x = p.find(i => i.id === payload.new.id); return x ? p : [payload.new, ...p] });
        if (payload.eventType === 'UPDATE') setRawIdeas(p => p.map(i => i.id === payload.new.id ? payload.new : i));
        if (payload.eventType === 'DELETE') setRawIdeas(p => p.filter(i => i.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'branches' }, payload => {
        if (payload.eventType === 'INSERT') setRawBranches(p => { const x = p.find(i => i.id === payload.new.id); return x ? p : [...p, payload.new] });
        if (payload.eventType === 'UPDATE') setRawBranches(p => p.map(b => b.id === payload.new.id ? payload.new : b));
        if (payload.eventType === 'DELETE') setRawBranches(p => p.filter(b => b.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedbacks' }, payload => {
        if (payload.eventType === 'INSERT') setRawFeedbacks(p => { const x = p.find(i => i.id === payload.new.id); return x ? p : [...p, payload.new] });
        if (payload.eventType === 'UPDATE') setRawFeedbacks(p => p.map(f => f.id === payload.new.id ? payload.new : f));
        if (payload.eventType === 'DELETE') setRawFeedbacks(p => p.filter(f => f.id !== payload.old.id));
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

    const channel = supabase.channel(`user-${currentUser.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookmarks', filter: `userId=eq.${currentUser.id}` }, payload => {
         if (payload.eventType === 'INSERT') setBookmarks(prev => { const x = prev.includes((payload.new as any).ideaId); return x ? prev : [...prev, (payload.new as any).ideaId] });
         if (payload.eventType === 'DELETE') fetchUserSpecific(); // IDs missing in old
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes', filter: `userId=eq.${currentUser.id}` }, payload => {
         if (payload.eventType === 'INSERT') setUserLikes(prev => { const x = prev.includes((payload.new as any).targetId); return x ? prev : [...prev, (payload.new as any).targetId] });
         if (payload.eventType === 'DELETE') fetchUserSpecific();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `recipientId=eq.${currentUser.id}` }, payload => {
         if (payload.eventType === 'INSERT') setRawNotifications(prev => { const x = prev.find(n => n.id === payload.new.id); return x ? prev : [payload.new as Notification, ...prev] });
         if (payload.eventType === 'UPDATE') setRawNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as Notification : n));
         if (payload.eventType === 'DELETE') setRawNotifications(prev => prev.filter(n => n.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id]);

  const ideas: Idea[] = rawIdeas.map(rawIdea => {
    const author = users.find(u => u.id === rawIdea.authorId) || { id: rawIdea.authorId, name: 'Cargando...', handle: 'cargando', avatar: '', followers: [], following: [] };
    const ideaBranches: Branch[] = rawBranches
      .filter(b => b.ideaId === rawIdea.id)
      .map(rawBranch => {
        const branchAuthor = users.find(u => u.id === rawBranch.authorId) || { id: rawBranch.authorId, name: 'Cargando...', handle: 'cargando', avatar: '', followers: [], following: [] };
        const branchFeedbacks: Feedback[] = rawFeedbacks
          .filter(f => f.branchId === rawBranch.id)
          .map(rawFeedback => {
            const feedbackAuthor = users.find(u => u.id === rawFeedback.authorId) || { id: rawFeedback.authorId, name: 'Cargando...', handle: 'cargando', avatar: '', followers: [], following: [] };
            return { id: rawFeedback.id, branchId: rawFeedback.branchId, author: feedbackAuthor, content: rawFeedback.content, createdAt: rawFeedback.createdAt };
          });
        return { id: rawBranch.id, ideaId: rawBranch.ideaId, author: branchAuthor, content: rawBranch.content, createdAt: rawBranch.createdAt, likes: rawBranch.likes || 0, feedbacks: branchFeedbacks };
      });
    return { id: rawIdea.id, author, content: rawIdea.content, createdAt: rawIdea.createdAt, likes: rawIdea.likes || 0, tags: rawIdea.tags || [], branches: ideaBranches, mediaUrl: rawIdea.mediaUrl };
  });

  const notifications = rawNotifications.map(n => {
    const actor = users.find(u => u.id === n.actorId) || { id: n.actorId, name: 'Usuario', handle: 'usuario', avatar: '', followers: [], following: [] };
    return { ...n, actor };
  });

  const createNotification = async (recipientId: string, type: Notification['type'], targetId: string) => {
    if (!currentUser || currentUser.id === recipientId) return;
    await supabase.from('notifications').insert({ recipientId, actorId: currentUser.id, type, targetId, createdAt: new Date().toISOString(), read: false });
  };

  const addIdea = async (content: string, tags: string[], mediaFile?: File) => {
    if (!currentUser) return;
    const tempId = crypto.randomUUID();
    let mediaUrl = undefined;
    
    if (mediaFile) {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${tempId}-${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('media').upload(`public/${fileName}`, mediaFile);
      if (!error && data) {
         mediaUrl = supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
      }
    } else {
      // Detección automática de links para captura de pantalla
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const match = content.match(urlRegex);
      if (match && match[0]) {
        const detectedUrl = match[0];
        // Usamos Microlink para generar una captura de pantalla de la URL detectada
        mediaUrl = `https://api.microlink.io/?url=${encodeURIComponent(detectedUrl)}&screenshot=true&embed=screenshot.url`;
      }
    }

    const newIdea = { id: tempId, authorId: currentUser.id, content, createdAt: new Date().toISOString(), likes: 0, tags, mediaUrl };
    setRawIdeas(prev => [newIdea, ...prev]);
    await supabase.from('ideas').insert(newIdea);
  };

  const deleteIdea = async (ideaId: string) => {
    if (!currentUser) return;
    setRawIdeas(prev => prev.filter(i => i.id !== ideaId));
    await supabase.from('ideas').delete().eq('id', ideaId);
  };

  const addBranch = async (ideaId: string, content: string) => {
    if (!currentUser) return;
    const tempId = crypto.randomUUID();
    const newBranch = { id: tempId, ideaId, authorId: currentUser.id, content, createdAt: new Date().toISOString(), likes: 0 };
    setRawBranches(prev => [...prev, newBranch]);
    await supabase.from('branches').insert(newBranch);
    
    const idea = rawIdeas.find(i => i.id === ideaId);
    if (idea) createNotification(idea.authorId, 'branch', ideaId);
  };

  const addFeedback = async (ideaId: string, branchId: string, content: string) => {
    if (!currentUser) return;
    const tempId = crypto.randomUUID();
    const newFeedback = { id: tempId, branchId, authorId: currentUser.id, content, createdAt: new Date().toISOString() };
    setRawFeedbacks(prev => [...prev, newFeedback]);
    await supabase.from('feedbacks').insert(newFeedback);
    
    const branch = rawBranches.find(b => b.id === branchId);
    if (branch) createNotification(branch.authorId, 'feedback', branchId);
  };

  const likeIdea = async (ideaId: string) => {
    if (!currentUser) return;
    const isLiked = userLikes.includes(ideaId);
    const idea = rawIdeas.find(i => i.id === ideaId);

    // Actualización Optimizada para no esperar la red de regreso
    if (isLiked) {
      setUserLikes(prev => prev.filter(id => id !== ideaId));
      setRawIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, likes: Math.max(0, (i.likes || 0) - 1) } : i));
    } else {
      setUserLikes(prev => [...prev, ideaId]);
      setRawIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, likes: (i.likes || 0) + 1 } : i));
    }

    const { data: likeSnap } = await supabase.from('likes').select('*').eq('userId', currentUser.id).eq('targetId', ideaId).single();

    if (likeSnap && isLiked) {
      await supabase.from('likes').delete().eq('id', likeSnap.id);
      if (idea) await supabase.from('ideas').update({ likes: Math.max(0, (idea.likes || 0) - 1) }).eq('id', ideaId);
    } else if (!likeSnap && !isLiked) {
      await supabase.from('likes').insert({ userId: currentUser.id, targetId: ideaId, type: 'idea' });
      if (idea) {
        await supabase.from('ideas').update({ likes: (idea.likes || 0) + 1 }).eq('id', ideaId);
        createNotification(idea.authorId, 'like', ideaId);
      }
    }
  };

  const likeBranch = async (ideaId: string, branchId: string) => {
    if (!currentUser) return;
    const isLiked = userLikes.includes(branchId);
    const branch = rawBranches.find(b => b.id === branchId);

    if (isLiked) {
      setUserLikes(prev => prev.filter(id => id !== branchId));
      setRawBranches(prev => prev.map(b => b.id === branchId ? { ...b, likes: Math.max(0, (b.likes || 0) - 1) } : b));
    } else {
      setUserLikes(prev => [...prev, branchId]);
      setRawBranches(prev => prev.map(b => b.id === branchId ? { ...b, likes: (b.likes || 0) + 1 } : b));
    }

    const { data: likeSnap } = await supabase.from('likes').select('*').eq('userId', currentUser.id).eq('targetId', branchId).single();

    if (likeSnap && isLiked) {
      await supabase.from('likes').delete().eq('id', likeSnap.id);
      if (branch) await supabase.from('branches').update({ likes: Math.max(0, (branch.likes || 0) - 1) }).eq('id', branchId);
    } else if (!likeSnap && !isLiked) {
      await supabase.from('likes').insert({ userId: currentUser.id, targetId: branchId, type: 'branch' });
      if (branch) {
        await supabase.from('branches').update({ likes: (branch.likes || 0) + 1 }).eq('id', branchId);
        createNotification(branch.authorId, 'like', branchId);
      }
    }
  };

  const toggleBookmark = async (ideaId: string) => {
    if (!currentUser) return;
    const isBookmarked = bookmarks.includes(ideaId);

    if (isBookmarked) {
      setBookmarks(prev => prev.filter(id => id !== ideaId));
      const { data: bookmarkSnap } = await supabase.from('bookmarks').select('*').eq('userId', currentUser.id).eq('ideaId', ideaId).single();
      if (bookmarkSnap) await supabase.from('bookmarks').delete().eq('id', bookmarkSnap.id);
    } else {
      setBookmarks(prev => [...prev, ideaId]);
      const { data: bookmarkSnap } = await supabase.from('bookmarks').select('*').eq('userId', currentUser.id).eq('ideaId', ideaId).single();
      if (!bookmarkSnap) await supabase.from('bookmarks').insert({ userId: currentUser.id, ideaId });
    }
  };

  const updateProfile = async (name: string, handle: string, bio: string, avatar: string) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, name, handle, bio, avatar } : null);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, name, handle, bio, avatar } : u));
    await supabase.from('users').update({ name, handle, bio, avatar }).eq('id', currentUser.id);
  };

  const markNotificationsRead = async () => {
    if (!currentUser) return;
    setRawNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const unreadNotifs = rawNotifications.filter(n => !n.read);
    const updates = unreadNotifs.map(n => supabase.from('notifications').update({ read: true }).eq('id', n.id));
    await Promise.all(updates);
  };

  const toggleFollow = async (userId: string) => {
    if (!currentUser) return;
    const isFollowing = currentUser.following?.includes(userId);
    const targetUser = users.find(u => u.id === userId);
    
    // Optimizacion en Cliente Primero
    if (isFollowing) {
       setCurrentUser(p => p ? { ...p, following: (p.following || []).filter(id => id !== userId) } : null);
       setUsers(p => p.map(u => {
         if (u.id === currentUser.id) return { ...u, following: (u.following || []).filter(id => id !== userId) };
         if (u.id === userId) return { ...u, followers: (u.followers || []).filter(id => id !== currentUser.id) };
         return u;
       }));
       await supabase.from('users').update({ following: (currentUser.following || []).filter(id => id !== userId) }).eq('id', currentUser.id);
       if (targetUser) await supabase.from('users').update({ followers: (targetUser.followers || []).filter(id => id !== currentUser.id) }).eq('id', userId);
    } else {
       setCurrentUser(p => p ? { ...p, following: [...(p.following || []), userId] } : null);
       setUsers(p => p.map(u => {
         if (u.id === currentUser.id) return { ...u, following: [...(u.following || []), userId] };
         if (u.id === userId) return { ...u, followers: [...(u.followers || []), currentUser.id] };
         return u;
       }));
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
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

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
        const { error: insertError } = await supabase.from('users').insert(newUser);
        if (insertError) throw insertError;
        
        // Si Supabase tiene desactivado "Confirm email", data.session tendrá valor
        // y onAuthStateChange se activará solo. Pero para asegurar mayor velocidad:
        if (data.session) {
           await fetchCurrentUser(data.user.id);
        } else {
           alert("Registro exitoso. Si no se inicia sesión automáticamente, por favor confirma tu correo electrónico.");
        }
      }
    } catch (error: any) {
      alert(error.message || "Ocurrió un error en el registro");
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

