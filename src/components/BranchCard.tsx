import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, GitFork, Share, MoreHorizontal, BadgeCheck, CornerDownRight } from 'lucide-react';
import { Branch } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAppContext } from '../AppContext';

interface BranchCardProps {
  branch: Branch;
  onClick?: () => void;
  onUserClick?: (userId: string) => void;
  onReply?: () => void;
  depth?: number;
  parentAuthorHandle?: string;
}

export const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  onClick,
  onUserClick,
  onReply,
  depth = 0,
  parentAuthorHandle,
}) => {
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Depth-based subtle left accent color (stays inside the card, no layout shift)
  const depthAccentColors = [
    '',                    // depth 0 — no accent
    'border-l-2 border-blue-400/40',
    'border-l-2 border-purple-400/40',
    'border-l-2 border-emerald-400/40',
    'border-l-2 border-orange-400/40',
    'border-l-2 border-pink-400/40',
  ];
  const accentClass = depth > 0 ? (depthAccentColors[Math.min(depth, 5)] ?? depthAccentColors[5]) : '';

  return (
    <div
      className={`w-full p-4 sm:p-5 transition-colors group relative bg-white ${accentClass} ${onClick ? 'cursor-pointer hover:bg-gray-50/70' : ''}`}
      onClick={onClick}
    >
      {/* Depth indicator — shows reply context, never shifts layout */}
      {depth > 0 && parentAuthorHandle && (
        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono mb-2 ml-14">
          <CornerDownRight className="w-3 h-3 shrink-0" />
          <span>replying to</span>
          <span className="text-primary font-semibold">@{parentAuthorHandle}</span>
        </div>
      )}
      {depth > 0 && !parentAuthorHandle && (
        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono mb-2 ml-14">
          <CornerDownRight className="w-3 h-3 shrink-0" />
          <span>fork reply</span>
        </div>
      )}

      <div className="flex gap-3 sm:gap-4 w-full min-w-0">
        <div className="flex flex-col items-center shrink-0">
          <Avatar
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] z-10 bg-white cursor-pointer hover:opacity-80 transition-opacity border border-gray-100 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              if (onUserClick) onUserClick(branch.author.id);
            }}
          >
            <AvatarImage src={branch.author.avatar} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold">{branch.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {/* Vertical thread line — purely cosmetic, doesn't shift content */}
          <div className="w-px flex-1 bg-gray-100 mt-2 rounded-full min-h-[16px]" />
        </div>

        <div className="flex-1 min-w-0 pb-2 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="font-bold text-gray-900 truncate cursor-pointer hover:underline tracking-tight text-[15px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUserClick) onUserClick(branch.author.id);
                  }}
                >
                  {branch.author.name}
                </span>
                {branch.author.verified && <BadgeCheck className="w-[15px] h-[15px] text-blue-500 fill-blue-500/10 shrink-0" />}
                <span className="text-gray-500 font-mono text-[13px] tracking-tighter truncate">@{branch.author.handle}</span>
                <span className="text-gray-300">&middot;</span>
                <span className="text-gray-400 font-mono text-[12px] whitespace-nowrap">
                  {formatDistanceToNow(new Date(branch.createdAt), { addSuffix: true }).replace('about ', '')}
                </span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-primary/5 opacity-0 group-hover:opacity-100 sm:opacity-100 focus:opacity-100 shrink-0 outline-none -mt-1">
              <MoreHorizontal className="w-[18px] h-[18px]" />
            </button>
          </div>

          <p className="mt-1.5 text-gray-900 text-[15px] font-medium leading-relaxed tracking-[-0.01em] whitespace-pre-wrap break-words">
            {translatedText || branch.content}
          </p>

          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="mt-2 text-primary text-[12px] font-bold hover:underline flex items-center gap-1 transition-all focus:outline-none"
          >
            {isTranslating ? <span className="animate-pulse">Translating...</span> : translatedText ? 'Show original' : 'Translate'}
          </button>

          <div className="flex items-center gap-4 mt-4 text-gray-500">
            <button
              className="flex items-center gap-1.5 hover:text-primary transition-colors group outline-none"
              onClick={(e) => { e.stopPropagation(); if (onReply) onReply(); }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                <GitFork className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px] font-medium font-mono">{branch.forks?.length > 0 ? branch.forks.length : 'Fork'}</span>
            </button>

            <button
              className={`flex items-center gap-1.5 hover:text-red-500 transition-colors group outline-none ${isLiked ? 'text-red-500' : ''}`}
              onClick={(e) => { e.stopPropagation(); likeBranch(branch.ideaId, branch.id); }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-red-500/10 transition-colors">
                <Heart className={`w-[18px] h-[18px] transition-transform group-active:scale-90 ${isLiked ? 'fill-red-500' : ''}`} />
              </div>
              <span className="text-[13px] font-medium font-mono">{branch.likes > 0 ? branch.likes : ''}</span>
            </button>

            <button className="flex items-center gap-1.5 hover:text-primary transition-colors group outline-none ml-auto">
              <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                <Share className="w-[18px] h-[18px]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
