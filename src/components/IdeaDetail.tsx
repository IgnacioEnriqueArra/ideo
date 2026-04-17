import React, { useState } from 'react';
import { ArrowLeft, GitFork, Heart, Bookmark, Share, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { BranchCard } from './BranchCard';
import { ForkModal } from './ForkModal';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Branch } from '../types';

interface IdeaDetailProps {
  ideaId: string;
  onBack: () => void;
  onUserClick?: (userId: string) => void;
}

// Flat list renderer — no indentation on mobile, subtle visual cue via border on desktop
const RecursiveForkThread = ({ fork, onUserClick, onReplyClick, depth = 0 }: any) => {
  const maxDepth = 5;
  // We cap indentation visually at 2 levels max to avoid overflow
  const visualDepth = Math.min(depth, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full overflow-hidden"
    >
      {/* Visual depth indicator: a left accent, not a margin */}
      <div
        style={{
          borderLeft: depth > 0 ? `2px solid rgba(var(--color-primary, 59 130 246) / ${0.15 + visualDepth * 0.05})` : 'none',
          paddingLeft: depth > 0 ? '12px' : '0',
        }}
        className="w-full overflow-hidden"
      >
        <BranchCard branch={fork} onUserClick={onUserClick} onReply={() => onReplyClick(fork)} />

        {fork.forks && fork.forks.length > 0 && depth < maxDepth && (
          <div className="w-full overflow-hidden">
            {fork.forks.map((child: any) => (
              <RecursiveForkThread
                key={child.id}
                fork={child}
                depth={depth + 1}
                onUserClick={onUserClick}
                onReplyClick={onReplyClick}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const IdeaDetail: React.FC<IdeaDetailProps> = ({ ideaId, onBack, onUserClick }) => {
  const { allIdeas, currentUser, addBranch, likeIdea, bookmarks, toggleBookmark, deleteIdea, setAuthModalOpen, userLikes } = useAppContext();
  const idea = allIdeas.find(i => i.id === ideaId);

  const [showMenu, setShowMenu] = useState(false);
  const [forkModalTarget, setForkModalTarget] = useState<Branch | null | 'root'>('root');
  const [isForkModalOpen, setForkModalOpen] = useState(false);

  if (!idea) return <div className="p-8 text-center font-mono text-primary bg-primary/5 m-4 rounded-xl">Post not found</div>;

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
      addBranch(idea.id, content);
    } else {
      addBranch(idea.id, content, (forkModalTarget as Branch).id);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col w-full bg-white min-h-full overflow-x-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-4 py-3 flex items-center gap-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Thread</h1>
            <span className="text-xs text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-md w-fit border border-primary/10">
              {idea.branches.length} forks attached
            </span>
          </div>
        </div>

        {/* Main Post Content */}
        <div className="p-5 border-b border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Avatar
                className="w-12 h-12 rounded-2xl cursor-pointer hover:opacity-80 transition-opacity border border-gray-100 shadow-sm"
                onClick={() => onUserClick && onUserClick(idea.author.id)}
              >
                <AvatarImage src={idea.author.avatar} />
                <AvatarFallback className="bg-primary/5 text-primary text-lg font-bold">{idea.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span
                    className="font-bold text-gray-900 cursor-pointer hover:underline text-[15px]"
                    onClick={() => onUserClick && onUserClick(idea.author.id)}
                  >
                    {idea.author.name}
                  </span>
                  {idea.author.verified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10" />}
                </div>
                <span className="text-gray-500 text-[13px] font-mono tracking-tight">@{idea.author.handle}</span>
              </div>
            </div>

            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 focus:outline-none">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.1)] border border-gray-100 z-10 p-1">
                  {currentUser?.id === idea.author.id && (
                    <button
                      onClick={() => { setShowMenu(false); deleteIdea(idea.id); onBack(); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-[17px] text-gray-900 leading-relaxed whitespace-pre-wrap mb-4 font-medium tracking-[-0.01em]">
            {idea.content}
          </p>

          {idea.mediaUrl && (
            <div className="mt-4 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 max-h-[400px] flex items-center justify-center mb-4 relative group shadow-sm">
              <div className="absolute inset-0 border border-black/5 rounded-2xl pointer-events-none z-10" />
              {idea.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                <video src={idea.mediaUrl} className="w-full max-h-[400px] object-cover" controls onClick={e => e.stopPropagation()} />
              ) : (
                <img src={idea.mediaUrl} className="w-full max-h-[400px] object-cover" onClick={e => e.stopPropagation()} />
              )}
            </div>
          )}

          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {idea.tags.map(tag => (
                <span key={tag} className="text-xs font-mono text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10 transition-colors hover:bg-primary/10">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mb-5">
            <span className="text-gray-500 text-[13px] font-mono tracking-tight bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100/80">
              {format(new Date(idea.createdAt), 'h:mm a · MMM d, yyyy')}
            </span>
          </div>

          <div className="border-t border-gray-100/80 pt-4 flex items-center gap-2 sm:gap-6 text-gray-500">
            <button
              className="flex flex-1 sm:flex-none items-center justify-center gap-2 hover:text-primary transition-colors group"
              onClick={openRootFork}
            >
              <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-primary/10 transition-colors border border-transparent group-hover:border-primary/10">
                <GitFork className="w-5 h-5 group-hover:text-primary transition-colors" />
              </div>
              <span className="font-bold">{idea.branches.length} <span className="font-normal text-sm hidden sm:inline">Forks</span></span>
            </button>

            <button
              className={`flex flex-1 sm:flex-none items-center justify-center gap-2 hover:text-red-500 transition-colors group ${isLiked ? 'text-red-500' : ''}`}
              onClick={() => {
                if (!currentUser) setAuthModalOpen(true);
                else likeIdea(idea.id);
              }}
            >
              <div className={`p-2 rounded-xl transition-colors border border-transparent ${isLiked ? 'bg-red-50 border-red-100' : 'bg-gray-50 group-hover:bg-red-50 group-hover:border-red-100'}`}>
                <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'group-hover:text-red-500'}`} />
              </div>
              <span className="font-bold">{idea.likes} <span className="font-normal text-sm hidden sm:inline">Likes</span></span>
            </button>

            <div className="hidden sm:block flex-1"></div>

            <button
              className="p-2 rounded-xl flex-1 sm:flex-none flex justify-center hover:bg-gray-50 border border-transparent hover:border-gray-200 hover:text-primary transition-all group"
              onClick={() => {
                if (!currentUser) setAuthModalOpen(true);
                else toggleBookmark(idea.id);
              }}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
            </button>
            <button className="p-2 rounded-xl flex-1 sm:flex-none flex justify-center hover:bg-gray-50 border border-transparent hover:border-gray-200 hover:text-primary transition-all">
              <Share className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Root Fork Input */}
        <div className="px-5 py-4 border-b border-gray-100 bg-white/70 sticky top-[68px] z-10 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 rounded-2xl shadow-sm border border-gray-100 shrink-0">
              <AvatarImage src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">{currentUser ? currentUser.name.charAt(0) : 'G'}</AvatarFallback>
            </Avatar>
            <button
              onClick={openRootFork}
              className="flex-1 min-w-0 bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-3 text-sm text-gray-400 text-left hover:border-primary/40 focus:outline-none transition-all font-mono"
            >
              Attach a fork to this...
            </button>
            <button
              onClick={openRootFork}
              className="shrink-0 bg-primary text-white font-black px-5 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all text-sm"
            >
              Fork
            </button>
          </div>
        </div>

        {/* Forks Thread List — overflow-x-hidden is critical */}
        <div className="w-full overflow-x-hidden pb-32">
          <AnimatePresence>
            {idea.branches.map(fork => (
              <div key={fork.id} className="w-full overflow-x-hidden border-b border-gray-100/50">
                <RecursiveForkThread
                  fork={fork}
                  depth={0}
                  onUserClick={onUserClick}
                  onReplyClick={openReplyFork}
                />
              </div>
            ))}
          </AnimatePresence>

          {idea.branches.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400">
              <div className="p-4 bg-gray-50 rounded-full mb-4 ring-8 ring-gray-50/50">
                <GitFork className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-bold text-gray-900 mb-1">No forks attached yet</p>
              <p className="text-sm font-mono tracking-tight text-gray-500">Be the first to fork this post.</p>
            </div>
          )}
        </div>
      </motion.div>

      <ForkModal
        isOpen={isForkModalOpen}
        onClose={() => setForkModalOpen(false)}
        targetFork={forkModalTarget === 'root' ? null : forkModalTarget}
        parentPostContent={idea.content}
        onSubmit={handleForkSubmit}
      />
    </>
  );
};
