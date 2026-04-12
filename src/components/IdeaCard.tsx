import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, GitFork, Heart, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { Idea } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAppContext } from '../AppContext';

interface IdeaCardProps {
  idea: Idea;
  onClick?: () => void;
  isDetail?: boolean;
  onUserClick?: (userId: string) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onClick, isDetail = false, onUserClick }) => {
  const { likeIdea, toggleBookmark, bookmarks, userLikes } = useAppContext();
  const isBookmarked = bookmarks.includes(idea.id);
  const isLiked = userLikes.includes(idea.id);

  return (
    <div 
      className={`p-4 border-b border-gray-100 transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex gap-3">
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
          <div className="flex items-center justify-between">
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
              <span className="text-gray-500 truncate">@{idea.author.handle}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 whitespace-nowrap">
                {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true }).replace('about ', '')}
              </span>
            </div>
            <button className="text-gray-400 hover:text-primary transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <p className={`mt-1 text-gray-900 leading-snug whitespace-pre-wrap ${isDetail ? 'text-lg' : 'text-[15px]'}`}>
            {idea.content}
          </p>

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
              <span className="text-[13px]">{idea.branches.length} branches</span>
            </button>

            <button 
              className={`flex items-center gap-1.5 hover:text-red-500 transition-colors group ${isLiked ? 'text-red-500' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                likeIdea(idea.id);
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
                toggleBookmark(idea.id);
              }}
            >
              <div className="p-1.5 rounded-full group-hover:bg-primary/10">
                <Bookmark className={`w-[18px] h-[18px] ${isBookmarked ? 'fill-primary' : ''}`} />
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

