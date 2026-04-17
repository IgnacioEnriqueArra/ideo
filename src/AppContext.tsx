import React, { createContext, useContext, useState, useEffect } from 'react';
import { Idea, User, Branch, Feedback, Community, CryptoOrder } from './types';
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
  clearAllNotifications: () => void;
  deleteNotification: (id: string) => void;
  toggleFollow: (userId: string) => void;
  deleteIdea: (ideaId: string) => void;
  deleteBranch: (branchId: string) => void;
  deleteFeedback: (feedbackId: string) => void;
  deleteMessage: (messageId: string) => void;
  deleteUser: (userId: string) => void;
  toggleVerified: (userId: string) => void;
  deleteAccount: () => Promise<void>;
  logout: () => void;
  login: (seedPhrase: string) => Promise<boolean>;
  signup?: (seedPhrase: string) => Promise<boolean>;
  loginRedirect: () => void;
  isAuthReady: boolean;
  unreadMessagesCount: number;
  playNotificationSound: () => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  clearAllNotifications: () => void;
  allMessages: any[];
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  communities: Community[];
  allIdeas: Idea[];
  ideas: Idea[];
  createCommunityOrder: (name: string, description: string) => Promise<CryptoOrder | null>;
  checkOrderStatus: (orderId: string) => Promise<boolean>;
  simulateSuccessOrder: (orderId: string) => Promise<boolean>;
  addIdeaToCommunity: (communityId: string, content: string, tags: string[], mediaFile?: File) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rawIdeas, setRawIdeas] = useState<any[]>([]);
  const [rawBranches, setRawBranches] = useState<any[]>([]);
  const [rawFeedbacks, setRawFeedbacks] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [rawNotifications, setRawNotifications] = useState<Notification[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [cryptoOrders, setCryptoOrders] = useState<CryptoOrder[]>([]);

  useEffect(() => {
    let authSubscription: any;
    
    const initializeData = async () => {
      const [uRes, iRes, bRes, fRes, cRes, oRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('ideas').select('*').order('createdAt', { ascending: false }),
        supabase.from('branches').select('*').order('createdAt', { ascending: true }),
        supabase.from('feedbacks').select('*').order('createdAt', { ascending: true }),
        supabase.from('communities').select('*'),
        supabase.from('crypto_orders').select('*')
      ]);
      if (uRes.data) setUsers(uRes.data);
      if (iRes.data) setRawIdeas(iRes.data);
      if (bRes.data) setRawBranches(bRes.data);
      if (fRes.data) setRawFeedbacks(fRes.data);
      if (cRes.data) setCommunities(cRes.data);
      if (oRes.data) setCryptoOrders(oRes.data);
      
      const { data: mRes } = await supabase.from('messages').select('*').order('createdAt', { ascending: false });
      if (mRes) setAllMessages(mRes);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchCurrentUser(session.user.id, session.user.email);
      } else {
        setIsAuthReady(true);
      }

      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await fetchCurrentUser(session.user.id, session.user.email);
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
        if (payload.eventType === 'UPDATE') {
           const updated = payload.new as User;
           setUsers(p => p.map(u => u.id === updated.id ? updated : u));
           if (currentUser?.id === updated.id) setCurrentUser(updated);
        }
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
        if (payload.eventType === 'INSERT') setAllMessages(p => [payload.new, ...p]);
        if (payload.eventType === 'UPDATE') setAllMessages(p => p.map(m => m.id === payload.new.id ? payload.new : m));
        if (payload.eventType === 'DELETE') setAllMessages(p => p.filter(m => m.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      authSubscription?.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCurrentUser = async (id: string, email?: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (data) {
      setCurrentUser({ ...data, email: email || '' } as User);
    } else {
      await supabase.auth.signOut();
      setCurrentUser(null);
    }
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
      const [bRes, lRes, nRes, mRes] = await Promise.all([
        supabase.from('bookmarks').select('*').eq('userId', currentUser.id),
        supabase.from('likes').select('*').eq('userId', currentUser.id),
        supabase.from('notifications').select('*').eq('recipientId', currentUser.id).order('createdAt', { ascending: false }),
        supabase.from('messages').select('id').eq('read', false).neq('senderId', currentUser.id)
      ]);
      if (bRes.data) setBookmarks(bRes.data.map((b: any) => b.ideaId));
      if (lRes.data) setUserLikes(lRes.data.map((l: any) => l.targetId));
      if (nRes.data) setRawNotifications(nRes.data);
      if (mRes.data) setUnreadMessagesCount(mRes.data.length);
    };
    fetchUserSpecific();

    const channel = supabase.channel(`user-${currentUser.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookmarks', filter: `userId=eq.${currentUser.id}` }, payload => {
         if (payload.eventType === 'INSERT') setBookmarks(prev => { const x = prev.includes((payload.new as any).ideaId); return x ? prev : [...prev, (payload.new as any).ideaId] });
         if (payload.eventType === 'DELETE') fetchUserSpecific(); 
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes', filter: `userId=eq.${currentUser.id}` }, payload => {
         if (payload.eventType === 'INSERT') setUserLikes(prev => { const x = prev.includes((payload.new as any).targetId); return x ? prev : [...prev, (payload.new as any).targetId] });
         if (payload.eventType === 'DELETE') fetchUserSpecific();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipientId=eq.${currentUser.id}` }, payload => {
         setRawNotifications(prev => [payload.new as Notification, ...prev]);
         playNotificationSound();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `recipientId=eq.${currentUser.id}` }, payload => {
         setRawNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as Notification : n));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
         // Verificamos si el mensaje es para una conversación donde participo
         const { data: conv } = await supabase.from('conversations').select('id, participantIds').eq('id', payload.new.conversationId).single();
         if (conv?.participantIds.includes(currentUser.id) && payload.new.senderId !== currentUser.id) {
            setUnreadMessagesCount(prev => prev + 1);
            // Solo suena si NO tengo el chat abierto
            if (activeConversationId !== payload.new.conversationId) {
               playNotificationSound();
            }
         }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
         // Si se marca como leido, disminuimos el contador
         if (payload.new.read && !payload.old.read && payload.new.senderId !== currentUser.id) {
            setUnreadMessagesCount(prev => Math.max(0, prev - 1));
         }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id]);

  const allIdeas: Idea[] = rawIdeas.map(rawIdea => {
    const author = users.find(u => u.id === rawIdea.authorId) || { id: rawIdea.authorId, name: 'Cargando...', handle: 'cargando', avatar: '', followers: [], following: [] };
    const community = communities.find(c => c.id === rawIdea.communityId);
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
    return { id: rawIdea.id, author, content: rawIdea.content, createdAt: rawIdea.createdAt, likes: rawIdea.likes || 0, tags: rawIdea.tags || [], branches: ideaBranches, mediaUrl: rawIdea.mediaUrl, communityId: rawIdea.communityId, community };
  });

  const ideas = allIdeas.filter(idea => !idea.communityId);

  const playNotificationSound = () => {
    // Sonido más limpio y premium (Digital Pop)
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log('Audio blocked', e));
  };

  const notifications = rawNotifications.map(n => {
    const actor = users.find(u => u.id === n.actorId) || { id: n.actorId, name: 'Usuario', handle: 'usuario', avatar: '', followers: [], following: [] };
    return { ...n, actor };
  });

  const compressImage = async (file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> => {
    if (file.type.startsWith('video/')) return file; // No comprimimos video en cliente
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob); else reject(new Error('Error al comprimir'));
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
    });
  };

  const createNotification = async (recipientId: string, type: Notification['type'], targetId: string) => {
    if (!currentUser || currentUser.id === recipientId) return;
    await supabase.from('notifications').insert({ recipientId, actorId: currentUser.id, type, targetId, createdAt: new Date().toISOString(), read: false });
  };

  const createCommunityOrder = async (name: string, description: string): Promise<CryptoOrder | null> => {
    if (!currentUser) return null;
    const basePrice = 5;
    let attempts = 0;
    while (attempts < 50) {
      // Generate a fraction between .001 and .999
      const fraction = (Math.floor(Math.random() * 999) + 1) / 1000;
      const uniqueAmount = parseFloat((basePrice + fraction).toFixed(3));
      
      const { data } = await supabase.from('crypto_orders').select('id').eq('amount', uniqueAmount).eq('status', 'pending');
      if (!data || data.length === 0) {
        const newOrder = {
          userId: currentUser.id,
          communityName: name,
          communityDescription: description,
          amount: uniqueAmount,
          status: 'pending'
        };
        const { data: inserted, error } = await supabase.from('crypto_orders').insert(newOrder).select().single();
        if (inserted && !error) return inserted as CryptoOrder;
      }
      attempts++;
    }
    return null;
  };

  const checkOrderStatus = async (orderId: string): Promise<boolean> => {
    const order = cryptoOrders.find(o => o.id === orderId);
    if (!order) return false;
    
    try {
      // TRON USDT TRC20 Contract: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
      // Receiver Wallet: TGvKKNPpoq9gTgUSF2MSDTTf5S9rKFLreP
      const url = "https://api.trongrid.io/v1/accounts/TGvKKNPpoq9gTgUSF2MSDTTf5S9rKFLreP/transactions/trc20?contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&limit=20";
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.data) {
         const expectedValue = (order.amount * 1000000).toString(); // 6 decimals
         const orderTimeMs = new Date(order.createdAt).getTime();
         
         const hasPaid = data.data.some((tx: any) => {
            return tx.to === 'TGvKKNPpoq9gTgUSF2MSDTTf5S9rKFLreP' 
                && tx.value === expectedValue 
                && tx.block_timestamp > orderTimeMs;
         });

         if (hasPaid) {
            await supabase.from('crypto_orders').update({ status: 'paid' }).eq('id', orderId);
            const { data: cData } = await supabase.from('communities').insert({
               name: order.communityName,
               description: order.communityDescription,
               ownerId: order.userId
            }).select().single();
            if (cData) {
               await supabase.from('community_members').insert({
                  communityId: cData.id,
                  userId: order.userId,
                  role: 'admin'
               });
               return true;
            }
         }
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const simulateSuccessOrder = async (orderId: string): Promise<boolean> => {
    const order = cryptoOrders.find(o => o.id === orderId);
    if (!order) return false;
    
    await supabase.from('crypto_orders').update({ status: 'paid' }).eq('id', orderId);
    const { data: cData } = await supabase.from('communities').insert({
       name: order.communityName,
       description: order.communityDescription,
       ownerId: order.userId
    }).select().single();
    
    if (cData) {
       await supabase.from('community_members').insert({
          communityId: cData.id,
          userId: order.userId,
          role: 'admin'
       });
       return true;
    }
    return false;
  };

  const addIdeaToCommunity = async (communityId: string, content: string, tags: string[], mediaFile?: File) => {
    if (!currentUser) return;
    const tempId = crypto.randomUUID();
    let mediaUrl = undefined;
    
    // ... file logic ...
    if (mediaFile) {
       const fileToUpload = await compressImage(mediaFile);
       const fileName = `${tempId}-${Math.random()}.${mediaFile.name.split('.').pop()}`;
       const { data, error } = await supabase.storage.from('media').upload(`public/${fileName}`, fileToUpload);
       if (!error && data) {
         mediaUrl = supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
       }
    }
    
    const newIdea = { id: tempId, authorId: currentUser.id, content, createdAt: new Date().toISOString(), likes: 0, tags, mediaUrl, communityId };
    setRawIdeas(prev => [newIdea, ...prev]);
    const { error } = await supabase.from('ideas').insert(newIdea);
    if (error) {
      alert("Error saving community post.");
      setRawIdeas(prev => prev.filter(i => i.id !== tempId));
    }
  };

  const addIdea = async (content: string, tags: string[], mediaFile?: File) => {
    if (!currentUser) return;
    const tempId = crypto.randomUUID();
    let mediaUrl = undefined;
    
    if (mediaFile) {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${tempId}-${Math.random()}.${fileExt}`;
      const fileToUpload = await compressImage(mediaFile);
      const { data, error } = await supabase.storage.from('media').upload(`public/${fileName}`, fileToUpload);
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
    // Opt-in UI
    setRawIdeas(prev => [newIdea, ...prev]);
    const { error } = await supabase.from('ideas').insert(newIdea);
    if (error) {
      console.error("Failed to insert idea:", error);
      alert("Error saving post to network: " + error.message);
      // Revert optimistic update
      setRawIdeas(prev => prev.filter(i => i.id !== tempId));
    }
  };

  const deleteIdea = async (ideaId: string) => {
    setRawIdeas(prev => prev.filter(i => i.id !== ideaId));
    await supabase.from('ideas').delete().eq('id', ideaId);
  };

  const deleteBranch = async (id: string) => {
    setRawBranches(prev => prev.filter(b => b.id !== id));
    await supabase.from('branches').delete().eq('id', id);
  };

  const deleteFeedback = async (id: string) => {
    setRawFeedbacks(prev => prev.filter(f => f.id !== id));
    await supabase.from('feedbacks').delete().eq('id', id);
  };

  const deleteMessage = async (id: string) => {
    setAllMessages(prev => prev.filter(m => m.id !== id));
    await supabase.from('messages').delete().eq('id', id);
  };

  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    await supabase.from('users').delete().eq('id', id);
  };

  const toggleVerified = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newVal = !user.verified;
    // Optimistic Update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: newVal } : u));
    await supabase.from('users').update({ verified: newVal }).eq('id', userId);
  };

  const addBranch = async (ideaId: string, content: string) => {
    if (!currentUser) return;
    const tempId = crypto.randomUUID();
    const newBranch = { id: tempId, ideaId, authorId: currentUser.id, content, createdAt: new Date().toISOString(), likes: 0 };
    setRawBranches(prev => [...prev, newBranch]);
    const { error } = await supabase.from('branches').insert(newBranch);
    if (error) {
      console.error("Failed to insert branch:", error);
      alert("Error saving branch to network: " + error.message);
      setRawBranches(prev => prev.filter(b => b.id !== tempId));
    }
    
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
    const unreadIds = rawNotifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
    }
  };

  const clearAllNotifications = async () => {
    if (!currentUser) return;
    setRawNotifications([]);
    await supabase.from('notifications').delete().eq('recipientId', currentUser.id);
  };

  const deleteNotification = async (id: string) => {
    setRawNotifications(prev => prev.filter(n => n.id !== id));
    await supabase.from('notifications').delete().eq('id', id);
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
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      window.location.href = '/';
    } catch (err) {
      console.error("Logout error:", err);
      setCurrentUser(null);
      window.location.href = '/';
    }
  };

  const formatSeedPhrase = (phrase: string) => phrase.trim().toLowerCase().replace(/\s+/g, '-');
  const getEmailFromSeed = (phrase: string) => `${formatSeedPhrase(phrase)}@fork.network`;

  const login = async (seedPhrase: string): Promise<boolean> => {
    if (seedPhrase) {
      const email = getEmailFromSeed(seedPhrase);
      const password = formatSeedPhrase(seedPhrase);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert("Recovery key is invalid or the account doesn't exist.");
        return false;
      }
      return true;
    }
    return false;
  };

  const signup = async (seedPhrase: string): Promise<boolean> => {
    try {
      const email = getEmailFromSeed(seedPhrase);
      const password = formatSeedPhrase(seedPhrase);
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        // Generate pseudo-anonymous details
        const tempHandle = 'user_' + data.user.id.substring(0, 8);
        const randomHex = Math.floor(Math.random()*16777215).toString(16);
        const newUserToInsert = {
          id: data.user.id,
          name: 'Anon_' + data.user.id.substring(0, 4),
          handle: tempHandle,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${data.user.id}&backgroundColor=${randomHex}`,
          bio: 'Just arrived at fork.',
          followers: [],
          following: []
        };
        const { error: insertError } = await supabase.from('users').insert(newUserToInsert);
        if (insertError) throw insertError;
        
        if (data.session) {
           await fetchCurrentUser(data.user.id, data.user.email);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      alert(error.message || "An error occurred during account creation");
      return false;
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
    <AppContext.Provider value={{ 
      currentUser, users, ideas, allIdeas, communities, bookmarks, userLikes, notifications, 
      addIdea, addBranch, addFeedback, likeIdea, likeBranch, toggleBookmark, 
      updateProfile, markNotificationsRead, deleteIdea, deleteBranch, deleteFeedback, deleteMessage, 
      deleteUser, toggleVerified, deleteAccount, logout, login, signup, loginRedirect, isAuthReady, unreadMessagesCount, 
      playNotificationSound, activeConversationId, setActiveConversationId, clearAllNotifications, deleteNotification, toggleFollow,
      rawBranches, rawFeedbacks, allMessages, isAuthModalOpen, setAuthModalOpen,
      globalSearchQuery, setGlobalSearchQuery,
      createCommunityOrder, checkOrderStatus, simulateSuccessOrder, addIdeaToCommunity
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

