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
            className="fixed inset-0 bg-black/60 z-40 p-4 flex items-center justify-center"
            onClick={onClose}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-h-[90vh] sm:max-w-[600px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-900" />
                </button>
                <div className="flex items-center gap-4">
                  <button className="text-primary font-bold text-sm px-3 py-1 hover:bg-primary/10 rounded-full transition-colors">Drafts</button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 flex gap-3">
                <Avatar className="w-10 h-10 rounded-full shrink-0">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex flex-col min-w-0">
                  <textarea
                    ref={textareaRef}
                    placeholder="¿Qué está pasando?"
                    className="w-full min-h-[120px] text-lg leading-snug resize-none border-none focus:ring-0 p-0 bg-transparent outline-none placeholder:text-gray-500 overflow-hidden"
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                  
                  {mediaFile && (
                    <div className="relative mt-3 rounded-2xl overflow-hidden bg-gray-100 max-h-72 border border-gray-100">
                      {mediaFile.type.startsWith('video/') ? (
                         <video src={URL.createObjectURL(mediaFile)} className="w-full max-h-72 object-cover" controls />
                      ) : (
                         <img src={URL.createObjectURL(mediaFile)} className="w-full max-h-72 object-cover" />
                      )}
                      <button 
                        onClick={() => setMediaFile(null)} 
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors backdrop-blur-md"
                      >
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 py-1.5 px-3 bg-gray-50 rounded-xl border border-gray-100 focus-within:border-primary/50 transition-colors">
                      <span className="text-[10px] font-bold text-primary uppercase">Link</span>
                      <input 
                        type="url" 
                        placeholder="Añade un enlace..." 
                        className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 py-1.5 px-3 bg-gray-50 rounded-xl border border-gray-100 focus-within:border-primary/50 transition-colors">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Tags</span>
                      <input 
                        type="text" 
                        placeholder="ej: diseño, tech..." 
                        className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center -ml-2">
                  <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleMediaChange} />
                  <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-primary hover:bg-primary/10 rounded-full transition-colors">
                    <ImageIcon className="w-[19px] h-[19px]" />
                  </button>
                  <button className="p-2.5 text-primary hover:bg-primary/10 rounded-full transition-colors">
                    <Sparkles className="w-[19px] h-[19px]" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center relative w-7 h-7">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r={radius} stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gray-100" />
                      <circle
                        cx="12" cy="12" r={radius} stroke="currentColor" strokeWidth="2" fill="transparent"
                        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                        className={`${isOverLimit ? 'text-red-500' : charsLeft <= 20 ? 'text-yellow-500' : 'text-primary'} transition-all duration-200`}
                      />
                    </svg>
                    {charsLeft <= 20 && (
                      <span className={`absolute text-[9px] font-bold ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                        {charsLeft}
                      </span>
                    )}
                  </div>
                  <div className="w-[1px] h-6 bg-gray-200" />
                  <button 
                    onClick={handleSubmit}
                    disabled={!content.trim() || isOverLimit}
                    className="bg-primary text-white px-5 py-2 rounded-full font-bold text-sm disabled:opacity-50 hover:bg-blue-600 transition-all active:scale-95 shadow-sm"
                  >
                    Postear
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
