import React, { useState } from 'react';
import { ArrowLeft, Search, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { IdeaCard } from './IdeaCard';
import { BranchCard } from './BranchCard';
import { motion } from 'motion/react';
import { EditProfile } from './EditProfile';

interface ProfileProps {
  userId?: string;
  onBack: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ userId, onBack }) => {
  const { currentUser, users, ideas, toggleFollow, userLikes } = useAppContext();
  const [activeTab, setActiveTab] = useState<'ideas' | 'branches' | 'likes'>('ideas');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const profileUser = userId ? users.find(u => u.id === userId) || currentUser : currentUser;
  if (!profileUser || !currentUser) return null;

  const isOwnProfile = profileUser.id === currentUser.id;
  const isFollowing = currentUser.following?.includes(profileUser.id) || false;

  const userIdeas = ideas.filter(i => i.author.id === profileUser.id);
  const userBranches = ideas.flatMap(i => i.branches).filter(b => b.author.id === profileUser.id);
  const likedIdeas = isOwnProfile ? ideas.filter(i => userLikes.includes(i.id)) : [];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col w-full bg-white min-h-full"
    >
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="text-xl font-bold text-gray-900 leading-tight truncate">{profileUser.name}</h1>
              {profileUser.verified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" />}
            </div>
            <div className="text-xs text-gray-500">{userIdeas.length} posts</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <Search className="w-5 h-5 text-gray-900" />
          </button>
          <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-900" />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Banner */}
        <div className="h-32 bg-slate-800 w-full" />
        
        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start">
            <Avatar className="w-20 h-20 rounded-xl border-4 border-white -mt-10 bg-white">
              <AvatarImage src={profileUser.avatar} />
              <AvatarFallback>{profileUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            {isOwnProfile ? (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="mt-3 px-4 py-1.5 rounded-full border border-gray-300 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Edit profile
              </button>
            ) : (
              <button 
                onClick={() => toggleFollow(profileUser.id)}
                className={`mt-3 px-4 py-1.5 rounded-full font-bold text-sm transition-colors ${
                  isFollowing 
                    ? 'border border-gray-300 text-gray-900 hover:bg-red-50 hover:text-red-500 hover:border-red-200' 
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-bold text-gray-900">{profileUser.name}</h2>
              {profileUser.verified && <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/10 shrink-0" />}
            </div>
            <div className="text-gray-500 text-[15px]">@{profileUser.handle}</div>
          </div>

          <p className="mt-3 text-[15px] text-gray-900">
            {profileUser.bio || "Add a bio to tell the world who you are."}
          </p>

          <div className="flex gap-4 mt-3 text-[15px]">
            <div className="flex gap-1"><span className="font-bold text-gray-900">{profileUser.following?.length || 0}</span> <span className="text-gray-500">Following</span></div>
            <div className="flex gap-1"><span className="font-bold text-gray-900">{profileUser.followers?.length || 0}</span> <span className="text-gray-500">Followers</span></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mt-2">
          <button 
            className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'ideas' ? 'text-gray-900 font-bold' : 'text-gray-500'}`}
            onClick={() => setActiveTab('ideas')}
          >
            Ideas
            {activeTab === 'ideas' && <motion.div layoutId="profile-tab" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />}
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'branches' ? 'text-gray-900 font-bold' : 'text-gray-500'}`}
            onClick={() => setActiveTab('branches')}
          >
            Branches
            {activeTab === 'branches' && <motion.div layoutId="profile-tab" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-t-full" />}
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'likes' ? 'text-gray-900 font-bold' : 'text-gray-500'}`}
            onClick={() => setActiveTab('likes')}
          >
            Likes
            {activeTab === 'likes' && <motion.div layoutId="profile-tab" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-t-full" />}
          </button>
        </div>

        {/* Content */}
        <div className="divide-y divide-gray-100">
          {activeTab === 'ideas' && userIdeas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
          {activeTab === 'branches' && userBranches.map(branch => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
          {activeTab === 'likes' && (
            likedIdeas.length > 0 ? (
              likedIdeas.map(idea => (
                <IdeaCard key={idea.id} idea={idea} />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-[15px]">
                {isOwnProfile ? "No has dado me gusta a nada aún." : "Los me gusta de este usuario son privados."}
              </div>
            )
          )}
        </div>
      </div>
      
      {isOwnProfile && (
        <EditProfile isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      )}
    </motion.div>
  );
};
