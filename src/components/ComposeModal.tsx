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
  const [url, setUrl] = useState('');
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
    // Prefer the manual URL input if provided, otherwise the addIdea logic handles discovery
    const finalContent = url.trim() ? `${content} ${url}` : content;
    addIdea(finalContent, tagsList, mediaFile || undefined);
    setContent('');
    setTags('');
    setUrl('');
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
            className="fixed inset-0 bg-black/40 z-40 sm:p-4 flex items-start sm:items-center justify-center p-0"
            onClick={onClose}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 250 }}
              className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-[500px] bg-white sm:rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100/50">
                <button 
                  onClick={onClose} 
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-900" />
                </button>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleSubmit}
                    disabled={!content.trim() || isOverLimit}
                    className="bg-primary text-white px-6 py-2 rounded-full font-bold text-[15px] shadow-lg shadow-primary/20 disabled:opacity-50 hover:bg-blue-600 transition-all active:scale-95"
                  >
                    Postear
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 flex gap-4">
                <Avatar className="w-10 h-10 rounded-2xl shrink-0 shadow-sm">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex flex-col pt-0.5">
                  <textarea
                    ref={textareaRef}
                    placeholder="¿Qué tienes en mente?"
                    className="w-full min-h-[100px] text-[19px] leading-relaxed resize-none border-none focus:ring-0 p-0 bg-transparent outline-none placeholder:text-gray-400 font-medium"
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                  
                  {mediaFile && (
                    <div className="relative mt-3 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center p-1">
                      {mediaFile.type.startsWith('video/') ? (
                         <video src={URL.createObjectURL(mediaFile)} className="w-full max-h-56 rounded-xl object-contain shadow-sm" controls />
                      ) : (
                         <img src={URL.createObjectURL(mediaFile)} className="w-full max-h-56 rounded-xl object-contain shadow-sm" />
                      )}
                      <button 
                        onClick={() => setMediaFile(null)} 
                        className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors backdrop-blur-md"
                      >
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-2 border border-slate-100 transition-all focus-within:border-primary/30 focus-within:bg-white shadow-sm">
                      <span className="text-primary font-bold text-xs">LINK</span>
                      <input 
                        type="url" 
                        placeholder="https://ejemplo.com" 
                        className="flex-1 bg-transparent text-[14px] text-gray-900 outline-none placeholder:text-gray-400"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-2 border border-slate-100 transition-all focus-within:border-primary/30 focus-within:bg-white shadow-sm">
                      <span className="text-gray-400 font-bold text-xs">TAGS</span>
                      <input 
                        type="text" 
                        placeholder="separados por comas" 
                        className="flex-1 bg-transparent text-[14px] text-gray-900 outline-none placeholder:text-gray-400"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>
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
