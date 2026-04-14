import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Link2, Tag } from 'lucide-react';
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
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setContent(''); setTags(''); setUrl(''); setMediaFile(null);
    }
  }, [isOpen]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setMediaFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (!content.trim() || content.length > MAX_CHARS) return;
    const tagsList = tags.split(',').map(t => t.trim()).filter(t => t);
    const finalContent = url.trim() ? `${content} ${url}` : content;
    addIdea(finalContent, tagsList, mediaFile || undefined);
    onClose();
  };

  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const progress = Math.min((content.length / MAX_CHARS) * 100, 100);
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isOverLimit}
                className="bg-gray-900 text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-gray-700 transition-all active:scale-95 disabled:opacity-40 shadow-md"
              >
                Postear
              </button>
            </div>

            {/* Compose Area */}
            <div className="flex gap-3 px-4 pb-3">
              <Avatar className="w-10 h-10 rounded-full shrink-0 mt-0.5">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback className="bg-primary text-white font-bold">{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-gray-900 mb-1">{currentUser?.name}</div>
                <textarea
                  ref={textareaRef}
                  placeholder="¿Qué está pasando?"
                  className="w-full min-h-[96px] text-[17px] leading-relaxed resize-none border-none focus:ring-0 p-0 bg-transparent outline-none placeholder:text-gray-400"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                  }}
                />
              </div>
            </div>

            {/* Media Preview */}
            {mediaFile && (
              <div className="mx-4 mb-3 relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                {mediaFile.type.startsWith('video/') ? (
                  <video src={URL.createObjectURL(mediaFile)} className="w-full max-h-60 object-cover" controls />
                ) : (
                  <img src={URL.createObjectURL(mediaFile)} className="w-full max-h-60 object-cover" alt="preview" />
                )}
                <button
                  onClick={() => setMediaFile(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Link & Tags inputs centered below the text */}
            <div className="px-4 pb-3 space-y-2">
              <label className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-primary/60 focus-within:bg-white transition-all">
                <Link2 className="w-4 h-4 text-primary shrink-0" />
                <input
                  type="url"
                  placeholder="Añade un enlace (genera una preview automática)"
                  className="flex-1 bg-transparent text-[14px] text-gray-900 outline-none placeholder:text-gray-400 min-w-0"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                />
              </label>
              <label className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-primary/60 focus-within:bg-white transition-all">
                <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Tags (ej: diseño, tech, IA)"
                  className="flex-1 bg-transparent text-[14px] text-gray-900 outline-none placeholder:text-gray-400 min-w-0"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                />
              </label>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-0.5">
                <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleMediaChange} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                  title="Adjuntar imagen o video"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="relative w-7 h-7 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r={radius} stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-gray-200" />
                        <circle
                          cx="12" cy="12" r={radius} stroke="currentColor" strokeWidth="2.5" fill="transparent"
                          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                          className={`transition-all duration-300 ${isOverLimit ? 'text-red-500' : charsLeft <= 20 ? 'text-yellow-500' : 'text-primary'}`}
                        />
                      </svg>
                      {charsLeft <= 20 && (
                        <span className={`absolute text-[9px] font-bold tabular-nums ${isOverLimit ? 'text-red-500' : 'text-gray-600'}`}>
                          {charsLeft}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <span className="text-[12px] text-gray-400">{content.length}/{MAX_CHARS}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
