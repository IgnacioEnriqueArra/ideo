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
       // Simple heuristic to decide translation direction
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
      className={`p-4 border-b border-gray-100 transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* ... (Previous Avatar and Info Code) */}
        <Avatar 
          className="w-10 h-10 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            if (onUserClick) onUserClick(idea.author.id);
          }}
        >
          <AvatarImage src={idea.author.avatar} />
          <AvatarFallback>{idea.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-[15px]">
                <span 
                  className="font-bold text-gray-900 truncate cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUserClick) onUserClick(idea.author.id);
                  }}
                >
                  {idea.author.name}
                </span>
                {idea.author.verified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10" />}
                <span className="text-gray-500 truncate">@{idea.author.handle}</span>
              </div>
              <span className="text-gray-500 text-[13px] mt-0.5">
                {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true }).replace('about ', '')}
              </span>
            </div>
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="text-gray-400 hover:text-primary transition-colors p-1"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-100 z-10 py-1">
                  {currentUser?.id === idea.author.id && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        deleteIdea(idea.id);
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-gray-50 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className={`mt-1 text-gray-900 leading-snug whitespace-pre-wrap ${isDetail ? 'text-lg' : 'text-[15px]'}`}>
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
            className="mt-2 text-primary text-xs font-bold hover:underline flex items-center gap-1 transition-all"
          >
            {isTranslating ? (
              <span className="flex items-center gap-1 animate-pulse">
                Translating...
              </span>
            ) : translatedText ? (
              'Show original'
            ) : (
              'Translate post'
            )}
          </button>

          {idea.mediaUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 max-h-[400px] flex items-center justify-center">
              {idea.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                 <video src={idea.mediaUrl} className="w-full max-h-[400px] object-cover" controls onClick={e => e.stopPropagation()} />
              ) : (
                 <img src={idea.mediaUrl} className="w-full max-h-[400px] object-cover" onClick={e => e.stopPropagation()} />
              )}
            </div>
          )}

          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {idea.tags.map(tag => (
                <span key={tag} className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 text-gray-500 max-w-md pr-4">
            <button className="flex items-center gap-1.5 hover:text-primary transition-colors group">
              <div className="p-1.5 rounded-full group-hover:bg-primary/10">
                <GitFork className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px]">{idea.branches.length}</span>
            </button>

            <button 
              className={`flex items-center gap-1.5 hover:text-red-500 transition-colors group ${isLiked ? 'text-red-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!currentUser) {
                  setAuthModalOpen(true);
                } else {
                  likeIdea(idea.id);
                }
              }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-red-500/10">
                <Heart className={`w-[18px] h-[18px] ${isLiked ? 'fill-red-500' : ''}`} />
              </div>
              <span className="text-[13px]">{idea.likes}</span>
            </button>

            <button 
              className={`flex items-center gap-1.5 hover:text-primary transition-colors group ${isBookmarked ? 'text-primary' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!currentUser) {
                  setAuthModalOpen(true);
                } else {
                  toggleBookmark(idea.id);
                }
              }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-primary/10">
                <Bookmark className={`w-[18px] h-[18px] ${isBookmarked ? 'fill-primary' : ''}`} />
              </div>
            </button>

            <button 
              className="flex items-center gap-1.5 hover:text-primary transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(true);
              }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-primary/10">
                <Share className="w-[18px] h-[18px]" />
              </div>
            </button>
          </div>
        </div>
      </div>
      <ShareModal 
        idea={idea} 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
      />
    </div>
  );
};

