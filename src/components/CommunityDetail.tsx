import React, { useState } from 'react';
import { ArrowLeft, Settings, Users, Lock, Unlock, Check, X, Shield, Plus, MessageSquare } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { IdeaCard } from './IdeaCard';
import { ComposeModal } from './ComposeModal';

interface CommunityDetailProps {
  communityId: string;
  onBack: () => void;
  onUserClick: (userId: string) => void;
}

export const CommunityDetail: React.FC<CommunityDetailProps> = ({ communityId, onBack, onUserClick }) => {
  const { 
    currentUser, allIdeas, communities, communityMembers, joinRequests,
    requestToJoinCommunity, handleJoinRequest, updateCommunityPrivacy
  } = useAppContext();

  const community = communities.find(c => c.id === communityId);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  if (!community) return <div>Community not found</div>;

  const isOwner = currentUser?.id === community.ownerId;
  const members = communityMembers.filter(m => m.communityId === communityId);
  const isMember = members.some(m => m.userId === currentUser?.id);
  const communityPosts = allIdeas.filter(idea => idea.communityId === communityId);
  const requests = joinRequests.filter(r => r.communityId === communityId && r.status === 'pending');
  const myRequest = joinRequests.find(r => r.communityId === communityId && r.userId === currentUser?.id);

  if (isAdminView && isOwner) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center p-4 border-b border-gray-100 gap-4">
          <button onClick={() => setIsAdminView(false)} className="p-2 hover:bg-gray-50 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Admin: {community.name}</h2>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Privacy Settings</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                {community.isPrivate ? <Lock className="text-primary" /> : <Unlock className="text-green-500" />}
                <div>
                  <p className="font-bold text-gray-900">{community.isPrivate ? 'Private' : 'Public'}</p>
                  <p className="text-sm text-gray-500">{community.isPrivate ? 'Only members can see posts and members.' : 'Anyone can see and join.'}</p>
                </div>
              </div>
              <button 
                onClick={() => updateCommunityPrivacy(communityId, !community.isPrivate)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${community.isPrivate ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'}`}
              >
                {community.isPrivate ? 'Make Public' : 'Make Private'}
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Join Requests ({requests.length})</h3>
            <div className="space-y-3">
              {requests.length === 0 ? (
                <p className="text-gray-400 italic text-sm">No pending requests.</p>
              ) : (
                requests.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <span className="font-bold text-sm">User ID: {req.userId.slice(0, 8)}...</span>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleJoinRequest(req.id, 'accepted')} className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100">
                          <Check className="w-5 h-5" />
                       </button>
                       <button onClick={() => handleJoinRequest(req.id, 'rejected')} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100">
                          <X className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-50 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {community.name} {community.isPrivate && <Lock className="w-3 h-3 text-gray-400" />}
            </h2>
            <p className="text-xs text-gray-500">{members.length} members · {communityPosts.length} posts</p>
          </div>
        </div>
        {isOwner && (
          <button onClick={() => setIsAdminView(true)} className="p-2 hover:bg-gray-50 rounded-full">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
         <div className="p-6 border-b border-gray-50">
            <p className="text-gray-700">{community.description}</p>
            {!isMember && community.isPrivate && (
               <div className="mt-6 p-6 bg-gray-50 rounded-3xl text-center border border-gray-100">
                  <Lock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900">This community is private.</h3>
                  <p className="text-sm text-gray-500 mb-4">You need to be accepted by the owner to view posts and participate.</p>
                  {myRequest ? (
                     <div className="bg-blue-50 text-blue-600 py-2 rounded-full text-sm font-bold border border-blue-100 capitalize">
                        Request Status: {myRequest.status}
                     </div>
                  ) : (
                     <button 
                        onClick={() => requestToJoinCommunity(communityId)}
                        className="bg-primary text-white px-6 py-2 rounded-full font-bold shadow-sm active:scale-95 transition-transform"
                     >
                        Request to Join
                     </button>
                  )}
               </div>
            )}
         </div>

         {(!community.isPrivate || isMember) && (
            <div className="divide-y divide-gray-100">
               {communityPosts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 italic">No posts in this community yet.</div>
               ) : (
                  communityPosts.map(post => (
                    <IdeaCard 
                       key={post.id} 
                       idea={post} 
                       onUserClick={onUserClick}
                    />
                  ))
               )}
            </div>
         )}
      </div>

      {isMember && (
         <button 
            onClick={() => setIsComposeOpen(true)}
            className="fixed bottom-20 right-6 sm:bottom-8 sm:relative sm:right-auto sm:self-end sm:mr-6 bg-primary text-white p-4 rounded-full shadow-2xl z-40 hover:bg-blue-600 transition-colors"
         >
            <Plus className="w-6 h-6" />
         </button>
      )}

      {isComposeOpen && (
         <ComposeModal 
            isOpen={isComposeOpen} 
            onClose={() => setIsComposeOpen(false)} 
            communityId={communityId}
         />
      )}
    </div>
  );
};
