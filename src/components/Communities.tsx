import React, { useState } from 'react';
import { Users, Plus, ArrowLeft, Loader2, CheckCircle2, ChevronRight, Globe, Lock, Shield, AlertCircle } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface CommunitiesProps {
  onBack: () => void;
  onSelectCommunity?: (communityId: string) => void;
}

export const Communities: React.FC<CommunitiesProps> = ({ onBack, onSelectCommunity }) => {
  const { communities, createCommunity, currentUser, communityMembers, requestToJoinCommunity, setAuthModalOpen } = useAppContext();
  const [view, setView] = useState<'list' | 'create'>('list');
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClick = () => {
    if (!currentUser) return setAuthModalOpen(true);
    if (!currentUser.verified) {
      setView('create'); // Show the "Verification Required" state inside create view
      return;
    }
    setView('create');
  };

  const handleJoinClick = async (e: React.MouseEvent, communityId: string) => {
    e.stopPropagation();
    if (!currentUser) return setAuthModalOpen(true);
    if (!currentUser.verified) {
      setShowVerificationAlert(true);
      return;
    }
    
    // Check if already a member
    const isMember = communityMembers.some(m => m.communityId === communityId && m.userId === currentUser.id);
    if (isMember) {
      onSelectCommunity?.(communityId);
      return;
    }

    try {
      await requestToJoinCommunity(communityId);
      alert("Join request sent!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    if (!newCommName.trim() || !newCommDesc.trim()) return alert('Name and Description required');
    if (!currentUser?.verified) return; // Should be blocked by UI but just in case
    
    setIsCreating(true);
    const success = await createCommunity(newCommName.trim(), newCommDesc.trim());
    if (success) {
      setView('list');
      setNewCommName('');
      setNewCommDesc('');
    } else {
      alert('Failed to create community.');
    }
    setIsCreating(false);
  };

  const getCommunityColor = (name: string) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-rose-600',
      'from-purple-500 to-fuchsia-600',
      'from-amber-500 to-orange-600'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getMemberCount = (communityId: string) => {
    return communityMembers.filter(m => m.communityId === communityId).length;
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-30 border-b border-gray-100 flex items-center px-4 py-4">
        <button onClick={onBack} className="p-2 -ml-2 mr-3 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">
            {view === 'create' ? 'Build Space' : 'Communities'}
          </h1>
          <p className="text-[11px] text-gray-500 font-mono tracking-widest uppercase mt-1">Autonomous Nodes</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 sm:p-6"
            >
              {showVerificationAlert && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-3xl flex items-start gap-4 shadow-sm"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <Shield className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-blue-900">Personal Node Required</p>
                    <p className="text-[13px] text-blue-700 mt-0.5">You must be verified to join any autonomous space.</p>
                  </div>
                  <button onClick={() => setShowVerificationAlert(false)} className="text-blue-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest">Close</button>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={handleCreateClick}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-100 rounded-[32px] hover:border-primary hover:bg-primary/5 transition-all group bg-gray-50/30"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-4">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <span className="font-bold text-gray-900">New Community</span>
                  <p className="text-[12px] text-gray-400 mt-1">Found a new circle</p>
                </button>

                {communities.map(c => {
                  const membersCount = getMemberCount(c.id);
                  const isMember = currentUser && communityMembers.some(m => m.communityId === c.id && m.userId === currentUser.id);

                  return (
                    <motion.div 
                      key={c.id} 
                      layout
                      onClick={() => onSelectCommunity && onSelectCommunity(c.id)}
                      className="group relative flex flex-col p-5 bg-white border border-gray-100 rounded-[32px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getCommunityColor(c.name)} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity -mr-16 -mt-16 rounded-full blur-2xl`} />
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${getCommunityColor(c.name)} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform font-bold text-2xl`}>
                          {c.name.charAt(0)}
                        </div>
                        <div className="flex gap-1.5 p-1 bg-gray-50 rounded-full border border-gray-100 px-2.5">
                           <Globe className="w-3.5 h-3.5 text-gray-400" />
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Public</span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-black text-gray-900 text-lg mb-1 tracking-tight group-hover:text-primary transition-colors">{c.name}</h3>
                        <p className="text-gray-500 text-[13px] line-clamp-2 leading-relaxed font-medium">{c.description}</p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                               {[1,2,3].slice(0, Math.min(membersCount, 3)).map(i => (
                                 <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.id + i}`} alt="" className="w-full h-full object-cover" />
                                 </div>
                               ))}
                               {membersCount === 0 && <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-50" />}
                            </div>
                            <span className="text-[11px] font-bold text-gray-400 font-mono tracking-tighter">
                               {membersCount} {membersCount === 1 ? 'peer' : 'peers'}
                            </span>
                         </div>
                         <button 
                            onClick={(e) => handleJoinClick(e, c.id)}
                            className={`px-4 py-1.5 rounded-xl text-[12px] font-black transition-all ${
                              isMember 
                                ? 'bg-gray-100 text-gray-500' 
                                : 'bg-black text-white hover:scale-105 active:scale-95 shadow-md shadow-black/10'
                            }`}
                         >
                            {isMember ? 'Joined' : 'Join Space'}
                         </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {communities.length === 0 && (
                <div className="text-center py-20 px-6">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-200" />
                  </div>
                  <p className="font-bold text-gray-900">No spaces found in node</p>
                  <p className="text-gray-400 text-sm mt-1">Be the first to found a collective.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="create"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 max-w-xl mx-auto"
            >
              {!currentUser?.verified ? (
                <div className="text-center py-12 space-y-6">
                  <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-[40px] flex items-center justify-center mx-auto shadow-inner">
                    <Shield className="w-12 h-12" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Personal Node</h2>
                    <p className="text-gray-500 leading-relaxed max-w-md mx-auto italic font-mono uppercase text-xs tracking-widest">Verification Required</p>
                    <p className="text-gray-500 leading-relaxed max-w-md mx-auto mt-4 px-6">Establishing an autonomous space requires a verified node identity to prevent network spam.</p>
                  </div>
                  
                  <div className="p-6 bg-blue-50 flex items-start gap-4 rounded-3xl border border-blue-100 text-left">
                     <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
                     <p className="text-sm text-blue-800 font-medium">Navigate to your **Profile** to obtain your decentralized proof-of-humanity badge. This is a one-time process.</p>
                  </div>

                  <button 
                    onClick={() => setView('list')}
                    className="w-full py-5 rounded-2xl bg-black text-white font-black hover:bg-gray-800 transition-colors shadow-lg"
                  >
                    Return to Node
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mx-auto mb-6">
                      <Plus className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Found a New Space</h2>
                    <p className="text-gray-500 font-medium">Define the boundaries of your autonomous collective.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Community Identity</label>
                      <input 
                        value={newCommName} onChange={e => setNewCommName(e.target.value)}
                        type="text" 
                        className="w-full bg-gray-50 border border-transparent rounded-[24px] px-6 py-5 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-bold text-gray-900 placeholder:text-gray-300" 
                        placeholder="e.g. Cyberpunk Manifesto" 
                      />
                    </div>
                    <div className="group">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Mission Statement</label>
                      <textarea 
                        value={newCommDesc} onChange={e => setNewCommDesc(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-[24px] px-6 py-5 min-h-[140px] resize-none focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 placeholder:text-gray-300" 
                        placeholder="What brings this collective together?"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button 
                       onClick={() => setView('list')}
                       disabled={isCreating}
                       className="flex-1 bg-gray-100 text-gray-600 font-black py-5 rounded-[24px] hover:bg-gray-200 transition-colors"
                     >
                       Cancel
                     </button>
                     <button 
                        onClick={handleCreate}
                        disabled={isCreating}
                        className="flex-[2] bg-primary text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                     >
                       {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Found Collective <CheckCircle2 className="w-6 h-6" /></>}
                     </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
