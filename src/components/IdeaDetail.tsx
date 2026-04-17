import React, { useState } from 'react';
import { ArrowLeft, GitFork, Heart, Bookmark, Share, MoreHorizontal, BadgeCheck, Shield } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { BranchCard } from './BranchCard';
import { ForkModal } from './ForkModal';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Branch } from '../types';

interface IdeaDetailProps {
  ideaId: string;
  onBack: () => void;
  onUserClick?: (userId: string) => void;
}

// Recursive thread component
const ForkThread = ({ fork, depth = 0, onUserClick, onForkClick }: {
  fork: Branch;
  depth?: number;
  onUserClick?: (id: string) => void;
  onForkClick: (branch: Branch | null) => void;
}) => {
  const MAX_DEPTH = 5;
  const indent = depth < MAX_DEPTH;

  return (
    <div className="relative">
      <BranchCard 
        branch={fork} 
        onUserClick={onUserClick}
        onReply={() => onForkClick(fork)}
      />
      {fork.forks && fork.forks.length > 0 && (
        <div
          className={indent ? 'ml-6 pl-4' : 'ml-0'}
          style={indent ? { borderLeft: '1px solid rgba(0,225,210,0.12)' } : {}}
        >
          {fork.forks.map(child => (
            <ForkThread
              key={child.id}
              fork={child}
              depth={depth + 1}
              onUserClick={onUserClick}
              onForkClick={onForkClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const IdeaDetail: React.FC<IdeaDetailProps> = ({ ideaId, onBack, onUserClick }) => {
  const { allIdeas, currentUser, addBranch, likeIdea, bookmarks, toggleBookmark, deleteIdea, setAuthModalOpen, userLikes } = useAppContext();
  const idea = allIdeas.find(i => i.id === ideaId);

  const [newFork, setNewFork] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [forkModalTarget, setForkModalTarget] = useState<Branch | null | 'root'>('root');
  const [isForkModalOpen, setForkModalOpen] = useState(false);

  if (!idea) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <Shield className="w-12 h-12" style={{ color: 'rgba(0,225,210,0.3)' }} />
      <p className="font-mono text-center" style={{ color: 'rgba(200,220,230,0.4)' }}>Idea not accessible or removed</p>
      <button onClick={onBack} className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(0,225,210,0.1)', color: 'hsl(177,100%,44%)' }}>Go back</button>
    </div>
  );

  const isLiked = userLikes.includes(idea.id);
  const isBookmarked = bookmarks.includes(idea.id);

  const openRootFork = () => {
    if (!currentUser) { setAuthModalOpen(true); return; }
    setForkModalTarget(null);
    setForkModalOpen(true);
  };

  const openReplyFork = (branch: Branch) => {
    if (!currentUser) { setAuthModalOpen(true); return; }
    setForkModalTarget(branch);
    setForkModalOpen(true);
  };

  const handleForkSubmit = (content: string) => {
    if (forkModalTarget === null) {
      // Reply to root post
      addBranch(idea.id, content);
    } else {
      // Reply to a specific fork
      addBranch(idea.id, content, (forkModalTarget as Branch).id);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col w-full min-h-full"
        style={{ background: 'rgba(8,14,28,0.8)' }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 z-20 px-4 py-3 flex items-center gap-4"
          style={{ 
            background: 'rgba(8,14,28,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0,225,210,0.1)'
          }}
        >
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors"
            style={{ color: 'rgba(200,220,230,0.7)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black" style={{ color: 'hsl(180,100%,90%)' }}>Thread</h1>
            <p className="text-xs font-mono" style={{ color: 'rgba(0,225,210,0.5)' }}>{idea.branches.length} forks</p>
          </div>
        </div>

        {/* Main Idea */}
        <div className="p-5" style={{ borderBottom: '1px solid rgba(0,225,210,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onUserClick && onUserClick(idea.author.id)}>
              <Avatar className="w-12 h-12 rounded-xl" style={{ boxShadow: '0 0 10px rgba(0,225,210,0.2)' }}>
                <AvatarImage src={idea.author.avatar} />
                <AvatarFallback style={{ background: 'rgba(0,225,210,0.15)', color: 'hsl(177,100%,44%)' }}>{idea.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black hover:underline" style={{ color: 'hsl(180,100%,90%)' }}>{idea.author.name}</span>
                  {idea.author.verified && <BadgeCheck className="w-4 h-4" style={{ color: 'hsl(177,100%,44%)' }} />}
                </div>
                <span className="text-sm font-mono" style={{ color: 'rgba(0,225,210,0.6)' }}>@{idea.author.handle}</span>
              </div>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
                style={{ color: 'rgba(200,220,230,0.4)' }}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-9 rounded-2xl overflow-hidden z-30 min-w-[140px]"
                  style={{ background: 'rgba(10,18,38,0.98)', border: '1px solid rgba(0,225,210,0.15)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
                >
                  {currentUser?.id === idea.author.id && (
                    <button
                      onClick={() => { deleteIdea(idea.id); onBack(); setShowMenu(false); }}
                      className="w-full text-left px-4 py-3 text-sm font-bold transition-colors hover:bg-red-500/10 text-red-400"
                    >
                      Delete
                    </button>
                  )}
                  <button onClick={() => setShowMenu(false)} className="w-full text-left px-4 py-3 text-sm font-bold transition-colors hover:bg-white/5" style={{ color: 'rgba(200,220,230,0.6)' }}>
                    Cancel
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          <p className="text-lg leading-relaxed mb-4" style={{ color: 'hsl(180,100%,90%)' }}>{idea.content}</p>

          {idea.mediaUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid rgba(0,225,210,0.1)' }}>
              {idea.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                <video src={idea.mediaUrl} className="w-full max-h-[400px] object-cover" controls />
              ) : (
                <img src={idea.mediaUrl} className="w-full max-h-[400px] object-cover" />
              )}
            </div>
          )}

          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {idea.tags.map(tag => (
                <span key={tag} className="text-xs font-mono px-2.5 py-1 rounded-lg" style={{ background: 'rgba(0,225,210,0.08)', color: 'hsl(177,100%,44%)', border: '1px solid rgba(0,225,210,0.15)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm mb-4" style={{ color: 'rgba(200,220,230,0.35)' }}>
            {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
          </p>

          {/* Action bar */}
          <div className="flex items-center gap-1 pt-3" style={{ borderTop: '1px solid rgba(0,225,210,0.07)' }}>
            <button 
              onClick={openRootFork}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/5 font-bold"
              style={{ color: 'rgba(0,225,210,0.7)' }}
            >
              <GitFork className="w-4 h-4" />
              <span className="text-sm">{idea.branches.length}</span>
            </button>
            <button 
              onClick={() => { if (!currentUser) { setAuthModalOpen(true); } else { likeIdea(idea.id); } }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-red-500/10"
              style={{ color: isLiked ? 'rgb(239,68,68)' : 'rgba(200,220,230,0.4)' }}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
              <span className="text-sm font-semibold">{idea.likes}</span>
            </button>
            <button 
              onClick={() => { if (!currentUser) { setAuthModalOpen(true); } else { toggleBookmark(idea.id); } }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
              style={{ color: isBookmarked ? 'hsl(177,100%,44%)' : 'rgba(200,220,230,0.4)' }}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick fork input (non-overlapping, simple) */}
        <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(0,225,210,0.08)', background: 'rgba(0,225,210,0.02)' }}>
          <Avatar className="w-8 h-8 rounded-lg shrink-0" style={{ boxShadow: '0 0 6px rgba(0,225,210,0.2)' }}>
            <AvatarImage src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=anon`} />
            <AvatarFallback style={{ background: 'rgba(0,225,210,0.1)', color: 'hsl(177,100%,44%)', fontSize: '10px' }}>A</AvatarFallback>
          </Avatar>
          <button
            onClick={openRootFork}
            className="flex-1 text-left text-sm font-mono px-4 py-2 rounded-full transition-all"
            style={{ background: 'rgba(0,225,210,0.04)', border: '1px solid rgba(0,225,210,0.1)', color: 'rgba(200,220,230,0.35)' }}
          >
            Fork this idea...
          </button>
          <button
            onClick={openRootFork}
            className="px-4 py-2 rounded-full text-sm font-black transition-all"
            style={{ background: 'linear-gradient(135deg, hsl(177,100%,44%), hsl(177,100%,35%))', color: 'hsl(222,47%,5%)', boxShadow: '0 0 12px rgba(0,225,210,0.25)' }}
          >
            Fork
          </button>
        </div>

        {/* Thread of forks */}
        <div className="pb-24">
          <AnimatePresence>
            {idea.branches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <GitFork className="w-8 h-8" style={{ color: 'rgba(0,225,210,0.2)' }} />
                <p className="text-sm font-mono" style={{ color: 'rgba(200,220,230,0.3)' }}>No forks yet. Be the first to fork.</p>
              </div>
            ) : (
              idea.branches.map(fork => (
                <motion.div
                  key={fork.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ForkThread
                    fork={fork}
                    onUserClick={onUserClick}
                    onForkClick={openReplyFork}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Fork Reply Modal */}
      <ForkModal
        isOpen={isForkModalOpen}
        onClose={() => setForkModalOpen(false)}
        targetFork={forkModalTarget as Branch | null}
        parentPostContent={idea.content}
        onSubmit={handleForkSubmit}
      />
    </>
  );
};
