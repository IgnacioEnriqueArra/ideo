import React, { useState, useRef, useEffect } from 'react';
import { X, GitFork } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Branch } from '../types';
import { useAppContext } from '../AppContext';

interface ForkModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetFork: Branch | null;
  parentPostContent: string;
  onSubmit: (content: string) => void;
}

export const ForkModal: React.FC<ForkModalProps> = ({ isOpen, onClose, targetFork, parentPostContent, onSubmit }) => {
  const { currentUser } = useAppContext();
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) setContent('');
  }, [isOpen]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent('');
    onClose();
  };

  const quotedText = targetFork?.content || parentPostContent;
  const quotedAuthor = targetFork?.author.handle || '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed z-50 w-full mx-auto"
            style={{
              maxWidth: '560px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '0 16px',
            }}
          >
            <div 
              className="w-full rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(10,16,32,0.98)',
                border: '1px solid rgba(0,225,210,0.2)',
                boxShadow: '0 0 60px rgba(0,225,210,0.12), 0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,225,210,0.1)' }}>
                <div className="flex items-center gap-2">
                  <GitFork className="w-4 h-4" style={{ color: 'hsl(177,100%,44%)' }} />
                  <span className="font-bold text-sm font-mono" style={{ color: 'hsl(177,100%,44%)' }}>Fork this</span>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
                  style={{ color: 'rgba(200,220,230,0.5)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quoted Post Preview */}
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(0,225,210,0.08)' }}>
                <div 
                  className="rounded-2xl p-3"
                  style={{ background: 'rgba(0,225,210,0.05)', border: '1px solid rgba(0,225,210,0.1)' }}
                >
                  {quotedAuthor && (
                    <p className="text-xs font-mono mb-1.5" style={{ color: 'hsl(177,100%,44%)' }}>@{quotedAuthor}</p>
                  )}
                  <p className="text-sm line-clamp-3" style={{ color: 'rgba(200,220,230,0.7)' }}>{quotedText}</p>
                </div>
              </div>

              {/* Input area */}
              <div className="px-5 py-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10 rounded-xl shrink-0" style={{ boxShadow: '0 0 8px rgba(0,225,210,0.25)' }}>
                    <AvatarImage src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`} />
                    <AvatarFallback style={{ background: 'rgba(0,225,210,0.15)', color: 'hsl(177,100%,44%)' }}>
                      {currentUser ? currentUser.name.charAt(0) : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <textarea
                    ref={inputRef}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(); }}
                    placeholder="Write your fork..."
                    rows={3}
                    className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] placeholder:font-mono"
                    style={{ 
                      color: 'hsl(180,100%,90%)',
                      caretColor: 'hsl(177,100%,44%)',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid rgba(0,225,210,0.08)' }}>
                  <span className="text-xs font-mono" style={{ color: 'rgba(200,220,230,0.3)' }}>
                    {content.length > 0 && `${content.length} chars · Ctrl+Enter to post`}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={onClose}
                      className="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:bg-white/5"
                      style={{ color: 'rgba(200,220,230,0.5)' }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={!content.trim()}
                      className="px-5 py-2 rounded-full text-sm font-black transition-all disabled:opacity-40"
                      style={{ 
                        background: content.trim() ? 'linear-gradient(135deg, hsl(177,100%,44%), hsl(177,100%,35%))' : 'rgba(0,225,210,0.15)',
                        color: 'hsl(222,47%,5%)',
                        boxShadow: content.trim() ? '0 0 16px rgba(0,225,210,0.3)' : 'none',
                      }}
                    >
                      Fork
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
