import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAppContext } from '../AppContext';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_CHARS = 280;

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, addIdea } = useAppContext();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!content.trim() || content.length > MAX_CHARS) return;
    const tagsList = tags.split(',').map(t => t.trim()).filter(t => t);
    addIdea(content, tagsList, mediaFile || undefined);
    setContent('');
    setTags('');
    setMediaFile(null);
    onClose();
  };

  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const progress = Math.min((content.length / MAX_CHARS) * 100, 100);

  // Calculate circle properties
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 sm:p-4 flex items-start sm:items-center justify-center"
            onClick={onClose}
          >
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full h-full sm:h-auto sm:min-h-[300px] sm:max-h-[80vh] sm:max-w-[600px] bg-white sm:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <button 
                  onClick={onClose} 
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-900" />
                </button>
                <div className="flex items-center gap-4">
                  <button className="text-primary font-bold text-sm hover:underline">Drafts</button>
                  <button 
                    onClick={handleSubmit}
                    disabled={!content.trim() || isOverLimit}
                    className="bg-primary text-white px-5 py-1.5 rounded-full font-bold text-[15px] disabled:opacity-50 hover:bg-blue-600 transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 flex gap-3">
                <Avatar className="w-10 h-10 rounded-full shrink-0">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 pt-1 flex flex-col">
                  <textarea
                    ref={textareaRef}
                    placeholder="What is happening?!"
                    className="w-full min-h-[120px] text-xl resize-none border-none focus:ring-0 p-0 bg-transparent outline-none placeholder:text-gray-500"
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                  
                  {mediaFile && (
                    <div className="relative mt-2 rounded-xl overflow-hidden bg-gray-100 max-h-48 border border-gray-100 flex items-center justify-center">
                      {mediaFile.type.startsWith('video/') ? (
                         <video src={URL.createObjectURL(mediaFile)} className="w-full max-h-48 object-contain" controls />
                      ) : (
                         <img src={URL.createObjectURL(mediaFile)} className="w-full max-h-48 object-contain" />
                      )}
                      <button 
                        onClick={() => setMediaFile(null)} 
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                      >
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                  )}

                  {/* Tags input inline */}
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <input 
                      type="text" 
                      placeholder="Add tags (e.g. react, design)" 
                      className="w-full bg-transparent text-[15px] text-primary outline-none placeholder:text-primary/50 font-mono"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-primary">
                  <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleMediaChange} />
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  {content.length > 0 && (
                    <>
                      <div className="flex items-center justify-center relative w-8 h-8">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 24 24">
                          <circle
                            cx="12"
                            cy="12"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="transparent"
                            className="text-gray-200"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className={`${isOverLimit ? 'text-red-500' : charsLeft <= 20 ? 'text-yellow-500' : 'text-primary'} transition-all duration-200`}
                          />
                        </svg>
                        {charsLeft <= 20 && (
                          <span className={`absolute text-[10px] font-medium ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                            {charsLeft}
                          </span>
                        )}
                      </div>
                      <div className="w-[1px] h-6 bg-gray-200" />
                      <button 
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                        title="Add another post"
                      >
                        <span className="text-lg leading-none mb-0.5">+</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
