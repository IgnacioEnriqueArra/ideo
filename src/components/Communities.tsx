import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldAlert, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { CryptoOrder, Community } from '../types';

interface CommunitiesProps {
  onBack: () => void;
  onSelectCommunity?: (communityId: string) => void;
}

export const Communities: React.FC<CommunitiesProps> = ({ onBack, onSelectCommunity }) => {
  const { communities, createCommunity, currentUser } = useAppContext();
  const [view, setView] = useState<'list' | 'create'>('list');
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newCommName.trim() || !newCommDesc.trim()) return alert('Name and Description required');
    if (!currentUser?.verified) return alert('Verification required');
    
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

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100 flex items-center p-4">
        <button onClick={onBack} className="p-2 -ml-2 mr-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold font-mono tracking-tight text-gray-900 flex items-center gap-2">
          {view === 'create' ? 'Create Community' : 'Communities'} <Users className="w-5 h-5 text-primary" />
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === 'list' ? (
           <div className="p-6 space-y-4">
             {currentUser?.verified && (
               <button 
                 onClick={() => setView('create')}
                 className="w-full p-6 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-primary hover:text-primary transition-all group mb-8"
               >
                 <div className="w-14 h-14 bg-gray-50 group-hover:bg-primary/5 rounded-full flex items-center justify-center transition-colors">
                   <Plus className="w-7 h-7" />
                 </div>
                 <span className="font-bold text-base">Create New Community</span>
               </button>
             )}
             {communities.length === 0 ? (
               <div className="text-center text-gray-400 py-12">No communities yet. Be the first to build a protected space.</div>
             ) : (
               communities.map(c => (
                 <div 
                   key={c.id} 
                   onClick={() => onSelectCommunity && onSelectCommunity(c.id)}
                   className="p-4 border border-gray-100 rounded-2xl hover:border-primary hover:shadow-sm transition-all cursor-pointer bg-gray-50/50"
                 >
                   <h3 className="font-bold text-gray-900 text-lg mb-1">{c.name}</h3>
                   <p className="text-gray-500 text-sm">{c.description}</p>
                 </div>
               ))
             )}
           </div>
        ) : (
           <div className="p-6 max-w-xl mx-auto">
             {!currentUser?.verified ? (
                <div className="text-center py-12 space-y-6">
                  <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Required</h2>
                    <p className="text-gray-500">Only verified accounts can host communities. This prevents spam and ensures high-quality network spaces.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-600">
                    Go to your **Profile** to obtain your decentralised proof-of-identity badge.
                  </div>
                  <button 
                    onClick={onBack}
                    className="w-full py-4 rounded-xl border border-gray-200 font-bold hover:bg-gray-50 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
             ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Build a new space.</h2>
                    <p className="text-gray-500 text-sm italic font-mono">Verified users can create unlimited autonomous communities.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Community Name</label>
                      <input 
                        value={newCommName} onChange={e => setNewCommName(e.target.value)}
                        type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold" placeholder="Cyberpunk Hackers" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Description</label>
                      <textarea 
                        value={newCommDesc} onChange={e => setNewCommDesc(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[100px] resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Describe the purpose of this community..."
                      />
                    </div>
                  </div>

                  <button 
                     onClick={handleCreate}
                     disabled={isCreating}
                     className="w-full bg-black text-white font-black py-4 rounded-xl flex items-center justify-center gap-2"
                  >
                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Community'}
                  </button>
                </div>
             )}
           </div>
        )}
      </div>
    </div>
  );
};
