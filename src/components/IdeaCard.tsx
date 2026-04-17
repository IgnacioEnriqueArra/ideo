import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { GitFork, Heart, Share, Bookmark, MoreHorizontal, BadgeCheck } from 'lucide-react';
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
    if (translatedText) { setTranslatedText(null); return; }
    setIsTranslating(true);
    try {
      const isLikelyEnglish = /\b(the|and|is|are|you|my|it|in|on|with)\b/i.test(idea.content);
      const langPair = isLikelyEnglish ? 'en|es' : 'es|en';
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(idea.content)}&langpair=${langPair}`);
      const data = await res.json();
      if (data.responseData.translatedText) setTranslatedText(data.responseData.translatedText);
    } catch (err) { console.error(err); }
    finally { setIsTranslating(false); }
  };

  return (
    <div
      className="p-4 transition-all"
      style={{
        borderBottom: '1px solid rgba(0,225,210,0.07)',
        cursor: onClick ? 'pointer' : 'default',
        background: onClick ? 'transparent' : undefined,
      }}
      onClick={onClick}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,225,210,0.025)'; }}
      onMouseLeave={e => { if (onClick) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      <div className="flex gap-3">
        <Avatar
          className="w-10 h-10 rounded-lg cursor-pointer hover:opacity-80 transition-opacity shrink-0"
          style={{ boxShadow: '0 0 6px rgba(0,225,210,0.2)' }}
          onClick={(e) => { e.stopPropagation(); if (onUserClick) onUserClick(idea.author.id); }}
        >
          <AvatarImage src={idea.author.avatar} />
          <AvatarFallback style={{ background: 'rgba(0,225,210,0.15)', color: 'hsl(177,100%,44%)' }}>{idea.author.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-[15px] flex-wrap">
                <span
                  className="font-bold cursor-pointer hover:underline truncate"
                  style={{ color: 'hsl(180,100%,90%)' }}
                  onClick={(e) => { e.stopPropagation(); if (onUserClick) onUserClick(idea.author.id); }}
                >
                  {idea.author.name}
                </span>
                {idea.author.verified && <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: 'hsl(177,100%,44%)' }} />}
                <span className="font-mono" style={{ color: 'rgba(0,225,210,0.5)' }}>@{idea.author.handle}</span>
              </div>
              <span className="text-[12px] font-mono" style={{ color: 'rgba(200,220,230,0.3)' }}>
                {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true }).replace('about ', '')}
              </span>
            </div>

            <div className="relative ml-2">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1 rounded-full hover:bg-white/5 transition-colors"
                style={{ color: 'rgba(200,220,230,0.3)' }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 mt-1 w-36 rounded-xl overflow-hidden z-10"
                  style={{ background: 'rgba(10,18,38,0.98)', border: '1px solid rgba(0,225,210,0.15)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
                >
                  {currentUser?.id === idea.author.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMenu(false); deleteIdea(idea.id); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-white/5 transition-colors"
                    style={{ color: 'rgba(200,220,230,0.6)' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className={`mt-1.5 leading-snug whitespace-pre-wrap ${isDetail ? 'text-lg' : 'text-[15px]'}`} style={{ color: 'hsl(180,100%,92%)' }}>
            {(translatedText || idea.content).split(' ').map((part, i) => {
              const urlRegex = /(https?:\/\/[^\s]+)/g;
              if (part.match(urlRegex)) {
                return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="hover:underline break-all" style={{ color: 'hsl(177,100%,44%)' }} onClick={e => e.stopPropagation()}>{part} </a>;
              }
              return part + ' ';
            })}
          </p>

          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="mt-1.5 text-xs font-bold hover:underline flex items-center gap-1 transition-all font-mono"
            style={{ color: 'rgba(0,225,210,0.5)' }}
          >
            {isTranslating ? <span className="animate-pulse">Translating...</span> : translatedText ? 'Show original' : 'Translate'}
          </button>

          {idea.mediaUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden max-h-[400px] flex items-center justify-center" style={{ border: '1px solid rgba(0,225,210,0.1)' }}>
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
                <span key={tag} className="text-xs font-mono px-2.5 py-1 rounded-lg" style={{ background: 'rgba(0,225,210,0.08)', color: 'hsl(177,100%,44%)', border: '1px solid rgba(0,225,210,0.15)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between mt-3 max-w-xs" style={{ color: 'rgba(200,220,230,0.35)' }}>
            <button
              className="flex items-center gap-1.5 hover:text-primary transition-colors group"
              style={{ color: 'rgba(0,225,210,0.5)' }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-primary/10">
                <GitFork className="w-[17px] h-[17px]" />
              </div>
              <span className="text-[13px]">{idea.branches.length}</span>
            </button>

            <button
              className="flex items-center gap-1.5 transition-colors group"
              style={{ color: isLiked ? 'rgb(239,68,68)' : 'rgba(200,220,230,0.35)' }}
              onClick={(e) => { e.stopPropagation(); if (!currentUser) { setAuthModalOpen(true); } else { likeIdea(idea.id); } }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-red-500/10">
                <Heart className={`w-[17px] h-[17px] ${isLiked ? 'fill-red-500' : ''}`} />
              </div>
              <span className="text-[13px]">{idea.likes}</span>
            </button>

            <button
              className="flex items-center gap-1.5 transition-colors group"
              style={{ color: isBookmarked ? 'hsl(177,100%,44%)' : 'rgba(200,220,230,0.35)' }}
              onClick={(e) => { e.stopPropagation(); if (!currentUser) { setAuthModalOpen(true); } else { toggleBookmark(idea.id); } }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-primary/10">
                <Bookmark className={`w-[17px] h-[17px] ${isBookmarked ? 'fill-current' : ''}`} />
              </div>
            </button>

            <button
              className="flex items-center gap-1.5 transition-colors group"
              style={{ color: 'rgba(200,220,230,0.35)' }}
              onClick={(e) => { e.stopPropagation(); setIsShareOpen(true); }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-primary/10">
                <Share className="w-[17px] h-[17px]" />
              </div>
            </button>
          </div>
        </div>
      </div>
      <ShareModal idea={idea} isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </div>
  );
};
