import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Send, Check, Copy } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { supabase } from '../supabase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Idea } from '../types';

interface ShareModalProps {
  idea: Idea;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ idea, isOpen, onClose }) => {
  const { currentUser, users } = useAppContext();
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!currentUser || !isOpen) return;
    const fetchRecent = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .contains('participantIds', [currentUser.id])
        .order('lastMessageAt', { ascending: false })
        .limit(5);
      if (data) setConversations(data);
    };
    fetchRecent();
  }, [currentUser?.id, isOpen]);

  const handleCopyLink = () => {
    const text = `Check out this idea from ${idea.author.name}:\n\n"${idea.content}"\n\n${window.location.origin}/`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sendToUser = async (otherUserId: string) => {
    if (!currentUser) return;
    setSendingId(otherUserId);
    
    try {
      // 1. Get or Create conversation
      let convId;
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .contains('participantIds', [currentUser.id, otherUserId])
        .single();
      
      if (existing) {
        convId = existing.id;
      } else {
        const newConvId = crypto.randomUUID();
        await supabase.from('conversations').insert({
          id: newConvId,
          participantIds: [currentUser.id, otherUserId],
          lastMessageAt: new Date().toISOString()
        });
        convId = newConvId;
      }

      // 2. Send Message with structured post ID
      const shareText = `[SHARED_POST:${idea.id}]`;
      
      await supabase.from('messages').insert({
        id: crypto.randomUUID(),
        conversationId: convId,
        senderId: currentUser.id,
        content: shareText,
        createdAt: new Date().toISOString()
      });

      await supabase.from('conversations').update({
        lastMessage: 'Shared post',
        lastMessageAt: new Date().toISOString()
      }).eq('id', convId);

      setSentIds(prev => [...prev, otherUserId]);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.id !== currentUser?.id && 
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.handle.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 10);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', scale: 1 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">Share post</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Copy Link Action */}
              <button 
                onClick={handleCopyLink}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </div>
                <div className="text-left font-bold text-gray-900">
                  {copied ? 'Copied!' : 'Copy link'}
                </div>
              </button>

              <div className="px-4 py-3">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2.5 mb-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search people..." 
                    className="bg-transparent text-sm outline-none flex-1"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="divide-y divide-gray-50 pb-6">
                {(search ? filteredUsers : conversations.map(c => users.find(u => u.id === c.participantIds.find(pid => pid !== currentUser?.id)))).map(user => {
                  if (!user) return null;
                  const isSent = sentIds.includes(user.id);
                  const isPending = sendingId === user.id;

                  return (
                    <div key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 rounded-full shrink-0">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary text-white font-bold">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 text-sm truncate">{user.name}</div>
                          <div className="text-gray-400 text-xs truncate">@{user.handle}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => sendToUser(user.id)}
                        disabled={isSent || isPending}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                          isSent 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-primary text-white hover:bg-blue-600 active:scale-95 disabled:opacity-50'
                        }`}
                      >
                        {isPending ? 'Sending...' : isSent ? 'Sent' : 'Send'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
