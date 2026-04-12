import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, GitFork, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { Branch } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAppContext } from '../AppContext';

interface BranchCardProps {
  branch: Branch;
  onClick?: () => void;
  onUserClick?: (userId: string) => void;
}

export const BranchCard: React.FC<BranchCardProps> = ({ branch, onClick, onUserClick }) => {
  const { likeBranch, userLikes } = useAppContext();
  const isLiked = userLikes.includes(branch.id);

  return (
    <div 
      className={`p-4 border-b border-gray-100 transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <Avatar 
            className="w-10 h-10 rounded-lg z-10 bg-white cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              if (onUserClick) onUserClick(branch.author.id);
            }}
          >
            <AvatarImage src={branch.author.avatar} />
            <AvatarFallback>{branch.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="w-0.5 h-full bg-gray-200 -mt-2" />
        </div>
        
        <div className="flex-1 min-w-0 pb-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 font-mono bg-gray-100 w-fit px-2 py-1 rounded-md">
            <GitFork className="w-3 h-3" />
            <span>Forked this idea...</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[15px]">
              <span 
                className="font-bold text-gray-900 truncate cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onUserClick) onUserClick(branch.author.id);
                }}
              >
                {branch.author.name}
              </span>
              <span className="text-gray-500 truncate">@{branch.author.handle}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 whitespace-nowrap">
                {formatDistanceToNow(new Date(branch.createdAt), { addSuffix: true }).replace('about ', '')}
              </span>
            </div>
            <button className="text-gray-400 hover:text-primary transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-1 text-gray-900 text-[15px] leading-snug whitespace-pre-wrap">
            {branch.content}
          </p>

          <div className="flex items-center justify-between mt-3 text-gray-500 max-w-md pr-4">
            <button className="flex items-center gap-1.5 hover:text-primary transition-colors group">
              <div className="p-1.5 rounded-full group-hover:bg-primary/10">
                <MessageSquare className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px]">{branch.feedbacks.length}</span>
            </button>

            <button 
              className={`flex items-center gap-1.5 hover:text-red-500 transition-colors group ${isLiked ? 'text-red-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                likeBranch(branch.ideaId, branch.id);
              }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-red-500/10">
                <Heart className={`w-[18px] h-[18px] ${isLiked ? 'fill-red-500' : ''}`} />
              </div>
              <span className="text-[13px]">{branch.likes}</span>
            </button>

            <button className="flex items-center gap-1.5 hover:text-primary transition-colors group">
              <div className="p-1.5 rounded-full group-hover:bg-primary/10">
                <Bookmark className="w-[18px] h-[18px]" />
              </div>
            </button>

            <button className="flex items-center gap-1.5 hover:text-primary transition-colors group">
              <div className="p-1.5 rounded-full group-hover:bg-primary/10">
                <Share className="w-[18px] h-[18px]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

