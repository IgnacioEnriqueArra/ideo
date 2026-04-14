import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, Search, Edit, Trash2 } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { supabase } from '../supabase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: string;
}

// ──────────────────────────────────────────────────
//  CHAT VIEW
// ──────────────────────────────────────────────────
interface ChatProps {
  conversation: Conversation;
  otherUserId: string;
  onBack: () => void;
}

const ChatView: React.FC<ChatProps> = ({ conversation, otherUserId, onBack }) => {
  const { currentUser, users, ideas } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const otherUser = users.find(u => u.id === otherUserId);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversationId', conversation.id)
        .order('createdAt', { ascending: true });
      if (data) setMessages(data);
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversationId', conversation.id)
        .neq('senderId', currentUser!.id);
    };
    fetchMessages();

    // Realtime subscription for new messages in this conversation
    const channel = supabase
      .channel(`chat-${conversation.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversationId=eq.${conversation.id}` },
        (payload) => {
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
          // If we receive a message in the active chat, mark it as read
          if (payload.new.senderId !== currentUser?.id) {
             supabase.from('messages').update({ read: true }).eq('id', payload.new.id).then();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversationId=eq.${conversation.id}` },
        (payload) => {
          setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new as Message : m));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversation.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !currentUser || isSending) return;
    const text = input.trim();
    setInput('');
    setIsSending(true);

    const newMsg: Message = {
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      senderId: currentUser.id,
      content: text,
      createdAt: new Date().toISOString(),
      read: false,
    };
    // Optimistic update
    setMessages(prev => [...prev, newMsg]);

    await supabase.from('messages').insert(newMsg);
    await supabase.from('conversations').update({
      lastMessage: text,
      lastMessageAt: newMsg.createdAt,
    }).eq('id', conversation.id);

    setIsSending(false);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="absolute inset-0 bg-white flex flex-col z-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <Avatar className="w-9 h-9 rounded-full">
          <AvatarImage src={otherUser?.avatar} />
          <AvatarFallback className="bg-primary text-white text-sm font-bold">{otherUser?.name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-[15px] truncate">{otherUser?.name || 'Usuario'}</div>
          <div className="text-gray-400 text-xs">@{otherUser?.handle}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isMine = msg.senderId === currentUser?.id;
            const sharedPostMatch = msg.content.match(/^\[SHARED_POST:(.+)\]$/);
            const sharedIdeaId = sharedPostMatch ? sharedPostMatch[1] : null;
            const sharedIdea = sharedIdeaId ? ideas.find(i => i.id === sharedIdeaId) : null;
            const isLastMine = isMine && !messages.slice(index + 1).some(m => m.senderId === currentUser?.id);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18 }}
              >
                {/* Row that pushes bubble to the correct side */}
                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} w-full`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-[20px] text-[15px] leading-snug bg-white border shadow-sm ${
                    isMine
                      ? 'border-gray-200 rounded-br-md'
                      : 'border-primary rounded-bl-md'
                  }`}>
                    {sharedIdea ? (
                      <div
                        onClick={() => window.dispatchEvent(new CustomEvent('open-post', { detail: sharedIdea.id }))}
                        className="cursor-pointer bg-gray-50 rounded-xl border border-gray-100 p-2.5 space-y-2 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5 rounded-full">
                            <AvatarImage src={sharedIdea.author.avatar} />
                            <AvatarFallback>{sharedIdea.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-[12px] text-gray-900">@{sharedIdea.author.handle}</span>
                        </div>
                        <p className="text-[13px] line-clamp-3 leading-tight text-gray-700">{sharedIdea.content}</p>
                        {sharedIdea.mediaUrl && (
                          <div className="rounded-lg overflow-hidden h-24 bg-gray-200">
                            <img src={sharedIdea.mediaUrl} className="w-full h-full object-cover" alt="" />
                          </div>
                        )}
                        <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Ver Idea ➔</div>
                      </div>
                    ) : sharedIdeaId ? (
                      <div className="text-xs italic text-gray-400">Idea no disponible</div>
                    ) : (
                      <p className="text-gray-900">{msg.content}</p>
                    )}
                  </div>
                </div>

                {/* Timestamp + Read status below bubble */}
                <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: es })}
                  </span>
                  {isLastMine && (
                    <span className={`text-[10px] font-semibold ${
                      msg.read ? 'text-primary' : 'text-gray-300'
                    }`}>
                      {msg.read ? '• Leído' : '• Enviado'}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="flex items-end gap-2 px-3 py-3 border-t border-gray-100 bg-white pb-[calc(12px+env(safe-area-inset-bottom))]">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-[15px] outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isSending}
          className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white disabled:opacity-40 hover:bg-blue-600 transition-all active:scale-90 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// ──────────────────────────────────────────────────
//  NEW MESSAGE MODAL
// ──────────────────────────────────────────────────
interface NewMessageModalProps {
  onSelectUser: (userId: string) => void;
  onClose: () => void;
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({ onSelectUser, onClose }) => {
  const { users, currentUser } = useAppContext();
  const [search, setSearch] = useState('');
  const filtered = users.filter(u =>
    u.id !== currentUser?.id &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.handle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-t-3xl max-h-[70vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Nuevo mensaje</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 rotate-[135deg] text-gray-600" />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Busca un usuario..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              autoFocus
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.map(user => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <Avatar className="w-11 h-11 rounded-full shrink-0">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary text-white font-bold">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-[15px] truncate">{user.name}</div>
                <div className="text-gray-400 text-sm">@{user.handle}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">Sin resultados</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ──────────────────────────────────────────────────
//  MAIN MESSAGES LIST
// ──────────────────────────────────────────────────
export const Messages: React.FC = () => {
  const { currentUser, users } = useAppContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<{ conv: Conversation; otherId: string } | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const fetchConversations = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .contains('participantIds', [currentUser.id])
        .order('lastMessageAt', { ascending: false });
      if (data) setConversations(data);
    };
    fetchConversations();

    // Realtime for conversations list
    const channel = supabase
      .channel(`convs-${currentUser.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, payload => {
        const conv = payload.new as Conversation;
        if (!conv.participantIds?.includes(currentUser.id)) return;
        if (payload.eventType === 'INSERT') {
          setConversations(prev => prev.find(c => c.id === conv.id) ? prev : [conv, ...prev]);
        }
        if (payload.eventType === 'UPDATE') {
          setConversations(prev => prev.map(c => c.id === conv.id ? conv : c).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id]);

  const openOrCreateConversation = async (otherUserId: string) => {
    if (!currentUser) return;
    // Check if conversation already exists
    const existing = conversations.find(c =>
      c.participantIds.includes(otherUserId) && c.participantIds.includes(currentUser.id)
    );
    if (existing) {
      setActiveConversation({ conv: existing, otherId: otherUserId });
      setShowNewMessage(false);
      return;
    }
    // Create new conversation
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      participantIds: [currentUser.id, otherUserId],
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('conversations').insert(newConv).select().single();
    if (!error && data) {
      setConversations(prev => [data, ...prev]);
      setActiveConversation({ conv: data, otherId: otherUserId });
    }
    setShowNewMessage(false);
  };

  const deleteConversation = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación?')) return;
    
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    await supabase.from('conversations').delete().eq('id', conversationId);
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Conv List */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900">Mensajes</h1>
          <button
            onClick={() => setShowNewMessage(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Edit className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Send className="w-7 h-7 text-primary" />
              </div>
              <p className="font-bold text-gray-900 text-lg">Ningún mensaje aún</p>
              <p className="text-gray-400 text-sm">Empieza una conversación con alguien.</p>
              <button
                onClick={() => setShowNewMessage(true)}
                className="bg-primary text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-blue-600 transition-all active:scale-95 mt-1"
              >
                Nuevo mensaje
              </button>
            </div>
          )}

          {conversations.map(conv => {
            const otherId = conv.participantIds.find(id => id !== currentUser?.id) || '';
            const other = users.find(u => u.id === otherId);
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversation({ conv, otherId })}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left group"
              >
                <Avatar className="w-12 h-12 rounded-full shrink-0">
                  <AvatarImage src={other?.avatar} />
                  <AvatarFallback className="bg-primary text-white font-bold">{other?.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-[15px] truncate">{other?.name || 'Usuario'}</span>
                    {conv.lastMessageAt && (
                      <span className="text-gray-400 text-xs shrink-0 ml-2">
                        {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false, locale: es })}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm truncate mt-0.5">{conv.lastMessage || 'Conversación iniciada'}</p>
                </div>
                <button 
                  onClick={(e) => deleteConversation(e, conv.id)}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat overlay */}
      <AnimatePresence>
        {activeConversation && (
          <ChatView
            conversation={activeConversation.conv}
            otherUserId={activeConversation.otherId}
            onBack={() => setActiveConversation(null)}
          />
        )}
      </AnimatePresence>

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessage && (
          <NewMessageModal
            onSelectUser={openOrCreateConversation}
            onClose={() => setShowNewMessage(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
