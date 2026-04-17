import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldAlert, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { CryptoOrder, Community } from '../types';

interface CommunitiesProps {
  onBack: () => void;
  onSelectCommunity?: (communityId: string) => void;
}

export const Communities: React.FC<CommunitiesProps> = ({ onBack, onSelectCommunity }) => {
  const { communities, createCommunityOrder, checkOrderStatus } = useAppContext();
  const [view, setView] = useState<'list' | 'create'>('list');
  
  // Tab states for Create View
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [activeOrder, setActiveOrder] = useState<CryptoOrder | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [paid, setPaid] = useState(false);

  // Address exactly as requested
  const TRC20_WALLET = 'TGvKKNPpoq9gTgUSF2MSDTTf5S9rKFLreP';

  const handleGenerateWallet = async () => {
    if (!newCommName.trim() || !newCommDesc.trim()) return alert('Name and Description required');
    setIsCreatingOrder(true);
    const order = await createCommunityOrder(newCommName.trim(), newCommDesc.trim());
    if (order) setActiveOrder(order);
    else alert('Failed to generate secure payment order.');
    setIsCreatingOrder(false);
  };

  useEffect(() => {
    let interval: any;
    if (activeOrder && !paid) {
      interval = setInterval(async () => {
        setIsChecking(true);
        const success = await checkOrderStatus(activeOrder.id);
        if (success) {
           setPaid(true);
           clearInterval(interval);
           setTimeout(() => {
              setView('list');
              setActiveOrder(null);
           }, 3000);
        }
        setIsChecking(false);
      }, 10000); // Check every 10 seconds
    }
    return () => clearInterval(interval);
  }, [activeOrder, paid]);

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100 flex items-center p-4">
        <button onClick={onBack} className="p-2 -ml-2 mr-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold font-mono tracking-tight text-gray-900 flex items-center gap-2">
          {view === 'create' ? 'Create Community' : 'Communities'} <Users className="w-5 h-5 text-primary" />
        </h1>
        {view === 'list' && (
          <button 
            onClick={() => setView('create')} 
            className="ml-auto flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === 'list' ? (
           <div className="p-6 space-y-4">
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
             {!activeOrder ? (
               <div className="space-y-6">
                 <div>
                   <h2 className="text-2xl font-bold mb-2">Build a private branch.</h2>
                   <p className="text-gray-500 text-sm">Communities are isolated from the main feed. To prevent spam and maintain privacy, creating a community requires a non-refundable one-time decentralized payment.</p>
                 </div>
                 
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-bold text-gray-900 mb-1">Community Name</label>
                     <input 
                       value={newCommName} onChange={e => setNewCommName(e.target.value)}
                       type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Cyberpunk Hackers" 
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-gray-900 mb-1">Description</label>
                     <textarea 
                       value={newCommDesc} onChange={e => setNewCommDesc(e.target.value)}
                       className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[100px] resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="A cozy place for shadow runners."
                     />
                   </div>
                 </div>

                 <button 
                    onClick={handleGenerateWallet}
                    disabled={isCreatingOrder}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                 >
                   {isCreatingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay 5 USDT & Create'}
                 </button>
               </div>
             ) : (
               paid ? (
                 <div className="text-center py-12 space-y-4">
                   <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
                   <h2 className="text-2xl font-bold text-gray-900">Payment Received!</h2>
                   <p className="text-gray-500">Your community has been securely recorded on the database. Redirecting...</p>
                 </div>
               ) : (
                 <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Awaiting Payment</div>
                   
                   <h3 className="text-2xl font-mono mb-6 text-center text-primary-foreground">Send Exact Amount</h3>
                   
                   <div className="bg-black/50 rounded-2xl p-6 mb-6 text-center border mt-4 border-white/10">
                      <div className="text-sm text-gray-400 mb-1 font-mono uppercase tracking-widest">Amount to send</div>
                      <div className="text-4xl font-bold font-mono tracking-tighter text-blue-400 mb-2">
                        {activeOrder.amount} <span className="text-lg text-gray-500">USDT</span>
                      </div>
                      <div className="text-xs text-red-400 font-bold max-w-[250px] mx-auto mt-4 px-2 py-1 bg-red-400/10 rounded">
                        ⚠️ Enviar EXACTAMENTE este monto en USDT (TRC20).
                      </div>
                   </div>

                   <div className="mb-6">
                      <div className="text-sm text-gray-400 mb-2 font-bold font-mono">Receiving Address (TRC20):</div>
                      <div className="bg-black/80 rounded-xl p-4 break-all font-mono text-sm border border-white/10 text-center select-all cursor-pointer hover:bg-black transition-colors"
                           onClick={() => {
                             navigator.clipboard.writeText(TRC20_WALLET);
                             alert("Address Copied!");
                           }}>
                        {TRC20_WALLET}
                      </div>
                   </div>

                   <div className="space-y-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                      <div className="flex gap-3">
                        <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                        <div className="text-sm text-gray-300">
                          <p className="font-bold text-white mb-1">🧨 MUY IMPORTANTE (no te saltees esto)</p>
                          <p>⚠️ Enviar EXACTAMENTE <span className="text-red-400 font-bold">{activeOrder.amount} USDT (TRC20)</span></p>
                          <p>No usar redes como Ethereum o BSC, usar wallet compatible con TRON.</p>
                          <p className="mt-2 text-xs text-gray-400">No usar exchanges (Binance, etc), usar wallet como TronLink, Cake Wallet o Trust Wallet.</p>
                          <p className="mt-2 text-xs text-red-400 font-bold">❌ Si mandas USDT ERC20 o BEP20, se pierde.</p>
                        </div>
                      </div>
                   </div>

                   <div className="mt-6 flex flex-col items-center gap-4">
                     <div className="flex justify-center items-center gap-2 text-sm text-gray-400">
                        {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                        {isChecking ? 'Verifying blockchain...' : 'Waiting for transaction...'}
                     </div>

                     <button 
                        onClick={async () => {
                          const { simulateSuccessOrder } = useAppContext() as any;
                          const ok = await simulateSuccessOrder(activeOrder.id);
                          if (ok) setPaid(true);
                        }}
                        className="text-[10px] text-gray-600 hover:text-primary transition-colors mt-2 uppercase tracking-widest font-bold"
                     >
                       [ Simular Pago Exitoso ]
                     </button>
                   </div>

                 </div>
               )
             )}
           </div>
        )}
      </div>
    </div>
  );
};
