import React, { createContext, useContext, useState, useEffect } from 'react';
import { Idea, User, Branch, Feedback } from './types';
import { auth, db, signInWithGoogle, signInWithGoogleRedirect, logOut } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDoc, query, orderBy, getDocs, writeBatch, arrayUnion, arrayRemove, where } from 'firebase/firestore';

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
  logout: () => void;
  login: () => void;
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

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Anonymous',
            handle: firebaseUser.email?.split('@')[0] || `user${firebaseUser.uid.substring(0,5)}`,
            avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
            bio: 'Hello world!',
            followers: [],
            following: []
          };
          await setDoc(userRef, newUser);
          setCurrentUser(newUser);
        } else {
          setCurrentUser(userSnap.data() as User);
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!isAuthReady) return;

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    }, (error) => console.error("Error fetching users:", error));

    const unsubIdeas = onSnapshot(query(collection(db, 'ideas'), orderBy('createdAt', 'desc')), (snapshot) => {
      setRawIdeas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Error fetching ideas:", error));

    const unsubBranches = onSnapshot(query(collection(db, 'branches'), orderBy('createdAt', 'asc')), (snapshot) => {
      setRawBranches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Error fetching branches:", error));

    const unsubFeedbacks = onSnapshot(query(collection(db, 'feedbacks'), orderBy('createdAt', 'asc')), (snapshot) => {
      setRawFeedbacks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Error fetching feedbacks:", error));

    return () => {
      unsubUsers();
      unsubIdeas();
      unsubBranches();
      unsubFeedbacks();
    };
  }, [isAuthReady]);

  // User specific listeners (bookmarks, notifications)
  useEffect(() => {
    if (!currentUser) {
      setBookmarks([]);
      setUserLikes([]);
      setRawNotifications([]);
      return;
    }

    const unsubBookmarks = onSnapshot(collection(db, 'bookmarks'), (snapshot) => {
      const userBookmarks = snapshot.docs
        .map(doc => doc.data())
        .filter(b => b.userId === currentUser.id)
        .map(b => b.ideaId);
      setBookmarks(userBookmarks);
    }, (error) => console.error("Error fetching bookmarks:", error));

    const unsubLikes = onSnapshot(collection(db, 'likes'), (snapshot) => {
      const likes = snapshot.docs
        .map(doc => doc.data())
        .filter(l => l.userId === currentUser.id)
        .map(l => l.targetId);
      setUserLikes(likes);
    }, (error) => console.error("Error fetching likes:", error));

    const unsubNotifications = onSnapshot(query(collection(db, 'notifications'), where('recipientId', '==', currentUser.id)), (snapshot) => {
      const userNotifs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Notification))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRawNotifications(userNotifs);
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });

    // Also update currentUser state if their user doc changes
    const unsubCurrentUser = onSnapshot(doc(db, 'users', currentUser.id), (doc) => {
      if (doc.exists()) {
        setCurrentUser({ id: doc.id, ...doc.data() } as User);
      }
    }, (error) => console.error("Error fetching current user doc:", error));

    return () => {
      unsubBookmarks();
      unsubLikes();
      unsubNotifications();
      unsubCurrentUser();
    };
  }, [currentUser?.id]);

  // Assemble Ideas
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
            return {
              id: rawFeedback.id,
              branchId: rawFeedback.branchId,
              author: feedbackAuthor,
              content: rawFeedback.content,
              createdAt: rawFeedback.createdAt
            };
          });

        return {
          id: rawBranch.id,
          ideaId: rawBranch.ideaId,
          author: branchAuthor,
          content: rawBranch.content,
          createdAt: rawBranch.createdAt,
          likes: rawBranch.likes || 0,
          feedbacks: branchFeedbacks
        };
      });

    return {
      id: rawIdea.id,
      author,
      content: rawIdea.content,
      createdAt: rawIdea.createdAt,
      likes: rawIdea.likes || 0,
      tags: rawIdea.tags || [],
      branches: ideaBranches
    };
  });

  const notifications = rawNotifications.map(n => {
    const actor = users.find(u => u.id === n.actorId) || { id: n.actorId, name: 'Unknown', handle: 'unknown', avatar: '', followers: [], following: [] };
    return { ...n, actor };
  });

  const createNotification = async (recipientId: string, type: Notification['type'], targetId: string) => {
    if (!currentUser || currentUser.id === recipientId) return;
    const notifRef = doc(collection(db, 'notifications'));
    await setDoc(notifRef, {
      recipientId,
      actorId: currentUser.id,
      type,
      targetId,
      createdAt: new Date().toISOString(),
      read: false
    });
  };

  const deleteIdea = async (ideaId: string) => {
    if (!currentUser) return;
    const targetIdea = rawIdeas.find(i => i.id === ideaId);
    if (targetIdea && targetIdea.authorId === currentUser.id) {
      await deleteDoc(doc(db, 'ideas', ideaId));
    }
  };

  const addIdea = async (content: string, tags: string[]) => {
    if (!currentUser) return;
    const newIdeaRef = doc(collection(db, 'ideas'));
    await setDoc(newIdeaRef, {
      authorId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      tags
    });
  };

  const addBranch = async (ideaId: string, content: string) => {
    if (!currentUser) return;
    const newBranchRef = doc(collection(db, 'branches'));
    await setDoc(newBranchRef, {
      ideaId,
      authorId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      likes: 0
    });
    
    const idea = rawIdeas.find(i => i.id === ideaId);
    if (idea) {
      createNotification(idea.authorId, 'branch', ideaId);
    }
  };

  const addFeedback = async (ideaId: string, branchId: string, content: string) => {
    if (!currentUser) return;
    const newFeedbackRef = doc(collection(db, 'feedbacks'));
    await setDoc(newFeedbackRef, {
      branchId,
      authorId: currentUser.id,
      content,
      createdAt: new Date().toISOString()
    });

    const branch = rawBranches.find(b => b.id === branchId);
    if (branch) {
      createNotification(branch.authorId, 'feedback', branchId);
    }
  };

  const likeIdea = async (ideaId: string) => {
    if (!currentUser) return;
    const likeId = `${currentUser.id}_${ideaId}`;
    const likeRef = doc(db, 'likes', likeId);
    const likeSnap = await getDoc(likeRef);
    const ideaRef = doc(db, 'ideas', ideaId);
    const idea = rawIdeas.find(i => i.id === ideaId);

    if (likeSnap.exists()) {
      await deleteDoc(likeRef);
      if (idea) await updateDoc(ideaRef, { likes: Math.max(0, (idea.likes || 0) - 1) });
    } else {
      await setDoc(likeRef, { userId: currentUser.id, targetId: ideaId, type: 'idea' });
      if (idea) {
        await updateDoc(ideaRef, { likes: (idea.likes || 0) + 1 });
        createNotification(idea.authorId, 'like', ideaId);
      }
    }
  };

  const likeBranch = async (ideaId: string, branchId: string) => {
    if (!currentUser) return;
    const likeId = `${currentUser.id}_${branchId}`;
    const likeRef = doc(db, 'likes', likeId);
    const likeSnap = await getDoc(likeRef);
    const branchRef = doc(db, 'branches', branchId);
    const branch = rawBranches.find(b => b.id === branchId);

    if (likeSnap.exists()) {
      await deleteDoc(likeRef);
      if (branch) await updateDoc(branchRef, { likes: Math.max(0, (branch.likes || 0) - 1) });
    } else {
      await setDoc(likeRef, { userId: currentUser.id, targetId: branchId, type: 'branch' });
      if (branch) {
        await updateDoc(branchRef, { likes: (branch.likes || 0) + 1 });
        createNotification(branch.authorId, 'like', branchId);
      }
    }
  };

  const toggleBookmark = async (ideaId: string) => {
    if (!currentUser) return;
    const bookmarkId = `${currentUser.id}_${ideaId}`;
    const bookmarkRef = doc(db, 'bookmarks', bookmarkId);
    const bookmarkSnap = await getDoc(bookmarkRef);

    if (bookmarkSnap.exists()) {
      await deleteDoc(bookmarkRef);
    } else {
      await setDoc(bookmarkRef, { userId: currentUser.id, ideaId });
    }
  };

  const updateProfile = async (name: string, handle: string, bio: string, avatar: string) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.id);
    await updateDoc(userRef, { name, handle, bio, avatar });
  };

  const markNotificationsRead = async () => {
    if (!currentUser) return;
    const unreadNotifs = rawNotifications.filter(n => !n.read);
    const batch = writeBatch(db);
    unreadNotifs.forEach(n => {
      const ref = doc(db, 'notifications', n.id);
      batch.update(ref, { read: true });
    });
    await batch.commit();
  };

  const toggleFollow = async (userId: string) => {
    if (!currentUser) return;
    const isFollowing = currentUser.following?.includes(userId);
    const currentUserRef = doc(db, 'users', currentUser.id);
    const targetUserRef = doc(db, 'users', userId);

    if (isFollowing) {
      await updateDoc(currentUserRef, { following: arrayRemove(userId) });
      await updateDoc(targetUserRef, { followers: arrayRemove(currentUser.id) });
    } else {
      await updateDoc(currentUserRef, { following: arrayUnion(userId) });
      await updateDoc(targetUserRef, { followers: arrayUnion(currentUser.id) });
      createNotification(userId, 'follow', currentUser.id);
    }
  };

  const logout = async () => {
    await logOut();
  };

  const login = async () => {
    await signInWithGoogle();
  };

  const loginRedirect = async () => {
    await signInWithGoogleRedirect();
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      users,
      ideas, 
      bookmarks,
      userLikes,
      notifications,
      addIdea, 
      addBranch, 
      addFeedback, 
      likeIdea, 
      likeBranch,
      toggleBookmark,
      updateProfile,
      markNotificationsRead,
      toggleFollow,
      deleteIdea,
      logout,
      login,
      loginRedirect,
      isAuthReady
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
