import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, GitFork, Bookmark, Share, BadgeCheck } from 'lucide-react';
import { Branch } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAppContext } from '../AppContext';

interface BranchCardProps {
  branch: Branch;
  onClick?: () => void;
  onUserClick?: (userId: string) => void;
  onReply?: () => void;
}

export const BranchCard: React.FC<BranchCardProps> = ({ branch, onClick, onUserClick, onReply }) => {
  const { likeBranch, userLikes } = useAppContext();
  const isLiked = userLikes.includes(branch.id);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (translatedText) { setTranslatedText(null); return; }
    setIsTranslating(true);
    try {
      const isLikelyEnglish = /\b(the|and|is|are|you|my|it|in|on|with)\b/i.test(branch.content);
      const langPair = isLikelyEnglish ? 'en|es' : 'es|en';
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(branch.content)}&langpair=${langPair}`);
      const data = await res.json();
      if (data.responseData.translatedText) setTranslatedText(data.responseData.translatedText);
    } catch (err) { console.error(err); }
    finally { setIsTranslating(false); }
  };

  return (
    <div
      className="p-4 transition-all"
      style={{
        borderBottom: '1px solid rgba(0,225,210,0.06)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,225,210,0.02)'; }}
      onMouseLeave={e => { if (onClick) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      {/* "Forked this idea" label */}
      <div className="mb-2 pl-12 flex items-center gap-1.5">
        <GitFork className="w-3 h-3" style={{ color: 'rgba(0,225,210,0.3)' }} />
        <span className="text-xs font-mono" style={{ color: 'rgba(0,225,210,0.3)' }}>Forked this idea...</span>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <Avatar
            className="w-9 h-9 rounded-lg cursor-pointer hover:opacity-80 transition-opacity shrink-0"
            style={{ boxShadow: '0 0 6px rgba(0,225,210,0.15)' }}
            onClick={(e) => { e.stopPropagation(); if (onUserClick) onUserClick(branch.author.id); }}
          >
            <AvatarImage src={branch.author.avatar} />
            <AvatarFallback style={{ background: 'rgba(0,225,210,0.12)', color: 'hsl(177,100%,44%)' }}>{branch.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="font-bold text-sm cursor-pointer hover:underline"
              style={{ color: 'hsl(180,100%,90%)' }}
              onClick={(e) => { e.stopPropagation(); if (onUserClick) onUserClick(branch.author.id); }}
            >
              {branch.author.name}
            </span>
            {branch.author.verified && <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: 'hsl(177,100%,44%)' }} />}
            <span className="text-sm font-mono" style={{ color: 'rgba(0,225,210,0.45)' }}>@{branch.author.handle}</span>
            <span className="text-xs font-mono" style={{ color: 'rgba(200,220,230,0.25)' }}>
              · {formatDistanceToNow(new Date(branch.createdAt), { addSuffix: true }).replace('about ', '')}
            </span>
          </div>

          <p className="mt-1.5 text-[15px] leading-snug whitespace-pre-wrap" style={{ color: 'hsl(180,100%,92%)' }}>
            {(translatedText || branch.content).split(' ').map((part, i) => {
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
            className="mt-1.5 text-xs font-bold hover:underline font-mono"
            style={{ color: 'rgba(0,225,210,0.4)' }}
          >
            {isTranslating ? <span className="animate-pulse">Translating...</span> : translatedText ? 'Show original' : 'Translate'}
          </button>

          {/* Action bar */}
          <div className="flex items-center gap-1 mt-3 max-w-xs" style={{ color: 'rgba(200,220,230,0.3)' }}>
            <button
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all hover:bg-primary/10"
              style={{ color: onReply ? 'rgba(0,225,210,0.6)' : 'rgba(200,220,230,0.3)' }}
              onClick={(e) => { e.stopPropagation(); if (onReply) onReply(); }}
            >
              <GitFork className="w-[15px] h-[15px]" />
              <span className="text-[12px] font-mono">{branch.forks?.length || 0}</span>
            </button>

            <button
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all hover:bg-red-500/10"
              style={{ color: isLiked ? 'rgb(239,68,68)' : 'rgba(200,220,230,0.3)' }}
              onClick={(e) => { e.stopPropagation(); likeBranch(branch.ideaId, branch.id); }}
            >
              <Heart className={`w-[15px] h-[15px] ${isLiked ? 'fill-red-500' : ''}`} />
              <span className="text-[12px] font-mono">{branch.likes}</span>
            </button>

            <button
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all hover:bg-primary/10"
              style={{ color: 'rgba(200,220,230,0.3)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Bookmark className="w-[15px] h-[15px]" />
            </button>

            <button
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all hover:bg-primary/10"
              style={{ color: 'rgba(200,220,230,0.3)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Share className="w-[15px] h-[15px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
