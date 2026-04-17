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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed z-50 w-full mx-auto px-4"
            style={{
              maxWidth: '560px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="w-full bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/50">
                <div className="flex items-center gap-2 text-primary">
                  <GitFork className="w-5 h-5" />
                  <span className="font-bold text-sm font-mono tracking-tight uppercase">Fork this post</span>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20"></div>
                  {quotedAuthor && (
                    <p className="text-xs font-mono mb-2 text-primary">@{quotedAuthor}</p>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{quotedText}</p>
                </div>
              </div>

              <div className="px-5 py-5">
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12 rounded-2xl shadow-sm border border-gray-100">
                    <AvatarImage src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`} />
                    <AvatarFallback className="bg-primary/5 text-primary text-lg font-bold">
                      {currentUser ? currentUser.name.charAt(0) : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <textarea
                    ref={inputRef}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(); }}
                    placeholder="Contribute to this idea..."
                    rows={3}
                    className="flex-1 bg-transparent border-none outline-none resize-none text-[16px] text-gray-900 placeholder:text-gray-400 placeholder:font-mono focus:ring-0 p-0"
                  />
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                  <span className="text-xs font-mono text-gray-400">
                    {content.length > 0 && `${content.length} chars · Ctrl+Enter to post`}
                  </span>
                  <div className="flex gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={!content.trim()}
                      className="px-6 py-2.5 rounded-2xl text-sm font-black transition-all disabled:opacity-50 disabled:scale-100 bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95"
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
