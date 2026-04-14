import React, { useState } from 'react';
import { ArrowLeft, GitFork, MessageSquare, Heart, Bookmark, Share, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { BranchCard } from './BranchCard';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface IdeaDetailProps {
  ideaId: string;
  onBack: () => void;
  onUserClick?: (userId: string) => void;
}

export const IdeaDetail: React.FC<IdeaDetailProps> = ({ ideaId, onBack, onUserClick }) => {
  const { ideas, currentUser, addBranch, addFeedback, likeIdea, bookmarks, toggleBookmark, deleteIdea } = useAppContext();
  const idea = ideas.find(i => i.id === ideaId);
  
  const [newBranch, setNewBranch] = useState('');
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [newFeedback, setNewFeedback] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  if (!idea) return <div>Idea not found</div>;

  const handleAddBranch = () => {
    if (!newBranch.trim()) return;
    addBranch(idea.id, newBranch);
    setNewBranch('');
  };

  const handleAddFeedback = (branchId: string) => {
    if (!newFeedback.trim()) return;
    addFeedback(idea.id, branchId, newFeedback);
    setNewFeedback('');
    setActiveBranchId(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col w-full bg-white min-h-full"
    >
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-6">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Thread</h1>
      </div>

      {/* Main Idea Content (Thread style) */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar 
              className="w-12 h-12 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onUserClick && onUserClick(idea.author.id)}
            >
              <AvatarImage src={idea.author.avatar} />
              <AvatarFallback>{idea.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
              <div className="flex items-center gap-1.5">
                <div 
                  className="font-bold text-gray-900 cursor-pointer hover:underline"
                  onClick={() => onUserClick && onUserClick(idea.author.id)}
                >
                  {idea.author.name}
                </div>
                {idea.author.verified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" />}
              </div>
              <div className="text-gray-500 text-[15px]">@{idea.author.handle}</div>
          </div>
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="text-gray-400 hover:text-primary transition-colors p-1"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-100 z-10 py-1">
                {currentUser?.id === idea.author.id && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      deleteIdea(idea.id);
                      onBack();
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

        <p className="text-gray-900 text-[17px] leading-relaxed whitespace-pre-wrap mb-4">
          {idea.content}
        </p>

        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {idea.tags.map(tag => (
              <span key={tag} className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="text-gray-500 text-[15px] mb-4">
          {format(new Date(idea.createdAt), 'HH:mm · dd MMM yyyy')}
        </div>

        <div className="border-t border-b border-gray-100 py-3 flex items-center gap-6 text-[15px]">
          <div className="flex gap-1.5"><span className="font-bold text-gray-900">{idea.likes}</span> <span className="text-gray-500">likes</span></div>
          <div className="flex gap-1.5"><span className="font-bold text-gray-900">{idea.branches.length}</span> <span className="text-gray-500">branches</span></div>
          <div className="flex gap-1.5"><span className="font-bold text-gray-900">0</span> <span className="text-gray-500">saved</span></div>
        </div>

        <div className="py-3 flex items-center justify-around text-gray-500 border-b border-gray-100">
          <button className="p-2 hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button 
            className="p-2 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
            onClick={() => likeIdea(idea.id)}
          >
            <Heart className={`w-5 h-5 ${idea.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <button 
            className={`p-2 hover:text-primary hover:bg-primary/10 rounded-full transition-colors ${bookmarks.includes(idea.id) ? 'text-primary' : ''}`}
            onClick={() => toggleBookmark(idea.id)}
          >
            <Bookmark className={`w-5 h-5 ${bookmarks.includes(idea.id) ? 'fill-primary' : ''}`} />
          </button>
          <button className="p-2 hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
            <Share className="w-5 h-5" />
          </button>
        </div>

        {/* Fork Input */}
        <div className="py-4 flex gap-3 items-center">
          <Avatar className="w-10 h-10 rounded-lg">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <input
            type="text"
            placeholder="Fork this idea..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] placeholder:text-gray-400 outline-none"
            value={newBranch}
            onChange={(e) => setNewBranch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddBranch();
            }}
          />
          <button 
            onClick={handleAddBranch}
            disabled={!newBranch.trim()}
            className="bg-primary text-white px-4 py-1.5 rounded-full font-bold text-sm disabled:opacity-50"
          >
            Fork
          </button>
        </div>
      </div>

      {/* Branches List */}
      <div className="divide-y divide-gray-100">
        <AnimatePresence>
          {idea.branches.map(branch => (
            <motion.div 
              key={branch.id} 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              layout
            >
              <BranchCard branch={branch} onUserClick={onUserClick} />
              
              {/* Feedbacks for this branch */}
              {branch.feedbacks.length > 0 && (
                <div className="pl-14 pr-4 py-2 space-y-4 border-b border-gray-100 bg-gray-50/50">
                  {branch.feedbacks.map(feedback => (
                    <motion.div 
                      key={feedback.id} 
                      className="flex gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Avatar 
                        className="w-8 h-8 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onUserClick && onUserClick(feedback.author.id)}
                      >
                        <AvatarImage src={feedback.author.avatar} />
                        <AvatarFallback>{feedback.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-[15px]">
                            <span 
                              className="font-bold text-gray-900 cursor-pointer hover:underline"
                              onClick={() => onUserClick && onUserClick(feedback.author.id)}
                            >
                              {feedback.author.name}
                            </span>
                            <span className="text-gray-500">@{feedback.author.handle}</span>
                          </div>
                          <span className="text-gray-500 text-[13px] mt-0.5">
                            {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true }).replace('about ', '')}
                          </span>
                        </div>
                        <p className="text-[15px] text-gray-900 mt-1">{feedback.content}</p>
                        <div className="flex gap-4 mt-2 text-gray-400">
                          <button className="flex items-center gap-1 hover:text-red-500">
                            <Heart className="w-3.5 h-3.5" />
                            <span className="text-xs">0</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Add Feedback inline */}
              <div className="pl-14 pr-4 py-3 border-b border-gray-100">
                {activeBranchId === branch.id ? (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex gap-2 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Add feedback..."
                      className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm border-none focus:ring-0 outline-none"
                      value={newFeedback}
                      onChange={(e) => setNewFeedback(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddFeedback(branch.id);
                      }}
                    />
                    <button 
                      className="text-gray-500 hover:text-gray-900 text-sm font-medium px-2"
                      onClick={() => setActiveBranchId(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="text-primary font-bold text-sm px-2 disabled:opacity-50"
                      onClick={() => handleAddFeedback(branch.id)} 
                      disabled={!newFeedback.trim()}
                    >
                      Reply
                    </button>
                  </motion.div>
                ) : (
                  <button 
                    className="text-gray-400 hover:text-primary text-[13px] font-medium flex items-center gap-1.5"
                    onClick={() => setActiveBranchId(branch.id)}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Add feedback
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

