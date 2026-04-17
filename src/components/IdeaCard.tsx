import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, GitFork, Heart, Share, Bookmark, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { Idea } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAppContext } from '../AppContext';

import { ShareModal } from './ShareModal';

interface IdeaCardProps {
  idea: Idea;
  onClick?: () => void;
  isDetail?: boolean;
  onUserClick?: (userId: string) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onClick, isDetail = false, onUserClick }) => {
  const { likeIdea, toggleBookmark, bookmarks, userLikes, currentUser, deleteIdea, setAuthModalOpen } = useAppContext();
  const isBookmarked = bookmarks.includes(idea.id);
  const isLiked = userLikes.includes(idea.id);
  const [showMenu, setShowMenu] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (translatedText) {
      setTranslatedText(null);
      return;
    }
    
    setIsTranslating(true);
    try {
       const isLikelyEnglish = /\b(the|and|is|are|you|my|it|in|on|with)\b/i.test(idea.content);
       const langPair = isLikelyEnglish ? 'en|es' : 'es|en';
       
       const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(idea.content)}&langpair=${langPair}`);
       const data = await res.json();
       if (data.responseData.translatedText) {
         setTranslatedText(data.responseData.translatedText);
       }
    } catch (err) {
       console.error(err);
    } finally {
       setIsTranslating(false);
    }
  };

  return (
    <div 
      className={`p-4 sm:p-5 transition-colors group relative ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex gap-3 sm:gap-4">
        <Avatar 
          className="w-11 h-11 rounded-full cursor-pointer hover:opacity-80 transition-opacity border border-gray-100 shadow-sm shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            if (onUserClick) onUserClick(idea.author.id);
          }}
        >
          <AvatarImage src={idea.author.avatar} />
          <AvatarFallback className="bg-primary/5 text-primary font-bold">{idea.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 pb-1">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-[15px]">
                <span 
                  className="font-bold text-gray-900 truncate tracking-tight hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUserClick) onUserClick(idea.author.id);
                  }}
                >
                  {idea.author.name}
                </span>
                {idea.author.verified && <BadgeCheck className="w-[15px] h-[15px] text-blue-500 fill-blue-500/10 shrink-0" />}
                <span className="text-gray-500 font-mono text-[13px] tracking-tighter truncate">@{idea.author.handle}</span>
                <span className="text-gray-300 mx-0.5">&middot;</span>
                <span className="text-gray-400 font-mono text-[12px] whitespace-nowrap">
                  {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true }).replace('about ', '')}
                </span>
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="text-gray-400 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-primary/5 opacity-0 group-hover:opacity-100 sm:opacity-100 focus:opacity-100 -mr-1.5 -mt-1"
              >
                <MoreHorizontal className="w-[18px] h-[18px]" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-20 py-1 overflow-hidden">
                  {currentUser?.id === idea.author.id && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        deleteIdea(idea.id);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[14px] font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      Delete Idea
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className={`mt-1.5 text-gray-900 leading-relaxed whitespace-pre-wrap tracking-[-0.01em] ${isDetail ? 'text-[17px] font-semibold' : 'text-[15px] font-medium'}`}>
            {(translatedText || idea.content).split(' ').map((part, i) => {
              const urlRegex = /(https?:\/\/[^\s]+)/g;
              if (part.match(urlRegex)) {
                return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all" onClick={e => e.stopPropagation()}>{part} </a>;
              }
              return part + ' ';
            })}
          </p>

          <button 
            onClick={handleTranslate}
            disabled={isTranslating}
            className="mt-2 text-primary text-[12px] font-bold hover:underline flex items-center gap-1 transition-all focus:outline-none"
          >
            {isTranslating ? (
              <span className="flex items-center gap-1 animate-pulse">
                Translating...
              </span>
            ) : translatedText ? (
              'Show original'
            ) : (
              'Translate'
            )}
          </button>

          {idea.mediaUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100/50 max-h-[400px] flex items-center justify-center">
              {idea.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                 <video src={idea.mediaUrl} className="w-full max-h-[400px] object-cover hover:opacity-95 transition-opacity" controls onClick={e => e.stopPropagation()} />
              ) : (
                 <img src={idea.mediaUrl} className="w-full max-h-[400px] object-cover hover:opacity-95 transition-opacity" onClick={e => e.stopPropagation()} />
              )}
            </div>
          )}

          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3.5">
              {idea.tags.map(tag => (
                <span key={tag} className="text-[12px] font-mono font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 text-gray-500 max-w-[400px] pr-2">
            <button className="flex items-center gap-1.5 hover:text-primary transition-colors group outline-none">
              <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                <GitFork className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px] font-medium font-mono">{idea.branches.length > 0 ? idea.branches.length : 'Fork'}</span>
            </button>

            <button 
              className={`flex items-center gap-1.5 hover:text-red-500 transition-colors group outline-none ${isLiked ? 'text-red-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!currentUser) setAuthModalOpen(true);
                else likeIdea(idea.id);
              }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-red-500/10 transition-colors">
                <Heart className={`w-[18px] h-[18px] transition-transform group-active:scale-90 ${isLiked ? 'fill-red-500' : ''}`} />
              </div>
              <span className="text-[13px] font-medium font-mono">{idea.likes > 0 ? idea.likes : ''}</span>
            </button>

            <button 
              className={`flex items-center gap-1.5 hover:text-blue-500 transition-colors group outline-none ${isBookmarked ? 'text-blue-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!currentUser) setAuthModalOpen(true);
                else toggleBookmark(idea.id);
              }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <Bookmark className={`w-[18px] h-[18px] transition-transform group-active:scale-90 ${isBookmarked ? 'fill-blue-500' : ''}`} />
              </div>
            </button>

            <button 
              className="flex items-center gap-1.5 hover:text-primary transition-colors group outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(true);
              }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                <Share className="w-[18px] h-[18px]" />
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {isShareOpen && (
        <ShareModal
          ideaId={idea.id}
          url={`${window.location.origin}/idea/${idea.id}`}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
};
