import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, GitFork, Share, Bookmark, MoreHorizontal, BadgeCheck } from 'lucide-react';
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
    if (translatedText) {
      setTranslatedText(null);
      return;
    }
    
    setIsTranslating(true);
    try {
       const isLikelyEnglish = /\b(the|and|is|are|you|my|it|in|on|with)\b/i.test(branch.content);
       const langPair = isLikelyEnglish ? 'en|es' : 'es|en';
       
       const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(branch.content)}&langpair=${langPair}`);
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
      className={`p-4 sm:p-5 transition-colors group relative border-b border-gray-100 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex gap-3 sm:gap-4">
        <div className="flex flex-col items-center">
          <Avatar 
            className="w-11 h-11 rounded-[14px] z-10 bg-white cursor-pointer hover:opacity-80 transition-opacity border border-gray-100 shadow-sm shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              if (onUserClick) onUserClick(branch.author.id);
            }}
          >
            <AvatarImage src={branch.author.avatar} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold">{branch.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="w-0.5 h-full bg-gray-100 mt-2 rounded-full" />
        </div>
        
        <div className="flex-1 min-w-0 pb-2">
          <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-2 font-mono bg-gray-50 border border-gray-100 w-fit px-2 py-0.5 rounded-[8px]">
            <GitFork className="w-3.5 h-3.5" />
            <span>Forked this idea...</span>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[15px]">
                  <span 
                    className="font-bold text-gray-900 truncate cursor-pointer hover:underline tracking-tight"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUserClick) onUserClick(branch.author.id);
                    }}
                  >
                    {branch.author.name}
                  </span>
                  {branch.author.verified && <BadgeCheck className="w-[15px] h-[15px] text-blue-500 fill-blue-500/10 shrink-0" />}
                  <span className="text-gray-500 font-mono text-[13px] tracking-tighter truncate">@{branch.author.handle}</span>
                  <span className="text-gray-300 mx-0.5">&middot;</span>
                  <span className="text-gray-400 font-mono text-[12px] whitespace-nowrap">
                    {formatDistanceToNow(new Date(branch.createdAt), { addSuffix: true }).replace('about ', '')}
                  </span>
                </div>
            </div>
            <button className="text-gray-400 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-primary/5 opacity-0 group-hover:opacity-100 sm:opacity-100 focus:opacity-100 -mr-1.5 -mt-1 outline-none">
              <MoreHorizontal className="w-[18px] h-[18px]" />
            </button>
          </div>

          <p className="mt-1.5 text-gray-900 text-[15px] leading-relaxed whitespace-pre-wrap">
            {translatedText || branch.content}
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

          <div className="flex items-center justify-between mt-4 text-gray-500 max-w-[400px] pr-2">
            <button 
              className="flex items-center gap-1.5 hover:text-primary transition-colors group outline-none"
              onClick={(e) => {
                e.stopPropagation();
                if (onReply) onReply();
              }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                <GitFork className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px] font-medium font-mono">{branch.forks?.length > 0 ? branch.forks.length : 'Fork'}</span>
            </button>

            <button 
              className={`flex items-center gap-1.5 hover:text-red-500 transition-colors group outline-none ${isLiked ? 'text-red-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                likeBranch(branch.ideaId, branch.id);
              }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-red-500/10 transition-colors">
                <Heart className={`w-[18px] h-[18px] transition-transform group-active:scale-90 ${isLiked ? 'fill-red-500' : ''}`} />
              </div>
              <span className="text-[13px] font-medium font-mono">{branch.likes > 0 ? branch.likes : ''}</span>
            </button>

            <button className="flex items-center gap-1.5 hover:text-primary transition-colors group outline-none">
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
