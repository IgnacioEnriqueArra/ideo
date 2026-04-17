import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldAlert, Loader2, BadgeCheck } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { CryptoOrder } from '../types';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose }) => {
  const { createVerificationOrder, checkOrderStatus, simulateSuccessOrder } = useAppContext();
  const [activeOrder, setActiveOrder] = useState<CryptoOrder | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [paid, setPaid] = useState(false);

  const TRC20_WALLET = 'TGvKKNPpoq9gTgUSF2MSDTTf5S9rKFLreP';

  const handleStartVerification = async () => {
    setIsCreating(true);
    const order = await createVerificationOrder();
    if (order) setActiveOrder(order);
    else alert('Failed to generate verification order.');
    setIsCreating(false);
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
              onClose();
           }, 3000);
        }
        setIsChecking(false);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [activeOrder, paid, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              Identity Verification <BadgeCheck className="w-6 h-6 text-primary" />
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {!activeOrder ? (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[32px] border border-blue-100 dark:border-blue-800 flex flex-col items-center text-center">
                <CheckCircle2 className="w-16 h-16 text-primary mb-4 animate-pulse" />
                <h3 className="text-2xl font-black mb-2 tracking-tight">Proof of Human Identity</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-[280px]">
                  Verified accounts represent authentic contributors in the network.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">✅ Create unlimited autonomous communities</li>
                  <li className="flex items-center gap-2">✅ Higher visibility in global feed</li>
                  <li className="flex items-center gap-2">✅ Official blue badge next to your name</li>
                </ul>
              </div>

              <div className="text-center p-4">
                <div className="text-3xl font-black text-gray-900 dark:text-white">$5.00 <span className="text-sm font-medium text-gray-500">one-time payment</span></div>
              </div>

              <button 
                onClick={handleStartVerification}
                disabled={isCreating}
                className="w-full bg-black text-white font-black py-5 rounded-[20px] flex items-center justify-center gap-2"
              >
                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Verified Badge'}
              </button>
            </div>
          ) : (
            paid ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <BadgeCheck className="w-12 h-12" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">You are Verified!</h2>
                  <p className="text-gray-500">Identification completed successfully. Welcome to the elite roster.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col gap-8 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 block">Network Status</span>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                         <span className="text-xs font-bold text-gray-900">Waiting for Signal...</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 text-primary text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                      TRC20 Network
                    </div>
                  </div>

                  <div className="text-center py-4">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Required Amount</span>
                    <div className="text-5xl font-black text-gray-900 tracking-tighter flex items-baseline justify-center gap-2">
                       {activeOrder.amount} <span className="text-xl text-gray-400 font-medium">USDT</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block pl-1">Target Node Address</span>
                    <div 
                      onClick={() => {
                        navigator.clipboard.writeText(TRC20_WALLET);
                        alert("Address Copied!");
                      }}
                      className="group relative bg-gray-50 border border-gray-100 rounded-2xl p-5 break-all font-mono text-sm text-gray-600 cursor-pointer hover:bg-gray-100/50 hover:border-primary/20 transition-all text-center flex flex-col items-center gap-2"
                    >
                      {TRC20_WALLET}
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Click to Copy Node Address</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-100 flex gap-4">
                       <ShieldAlert className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                       <div className="text-[11px] text-orange-900/80 leading-relaxed font-semibold">
                          <p className="font-black uppercase mb-1">Critical Network Warning</p>
                          Send ONLY via <span className="font-extrabold text-orange-600 underline">TRC20 (TRON)</span>. Sending via ERC20, BEP20 or any other network will result in <span className="text-red-600 uppercase font-black">immediate and permanent loss</span> of funds.
                       </div>
                    </div>

                    <div className="p-4 bg-red-50/50 rounded-2xl border border-red-50 flex gap-4">
                       <div className="w-6 h-6 flex items-center justify-center bg-red-100 rounded-full text-red-500 shrink-0 font-bold text-[10px]">!</div>
                       <div className="text-[11px] text-red-900/60 leading-relaxed">
                          Do not send from exchanges (CEX) that deduct fees from the withdrawal amount. The node must receive exactly <span className="font-bold">{activeOrder.amount} USDT</span>.
                       </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col items-center gap-5">
                    <div className="flex justify-center items-center gap-3">
                       <Loader2 className="w-4 h-4 text-primary animate-spin" />
                       <span className="text-[11px] font-bold text-gray-400 font-mono tracking-tight uppercase">Scanning Nodes for Confirmation...</span>
                    </div>

                    <button 
                      onClick={async () => {
                        const ok = await simulateSuccessOrder(activeOrder.id);
                        if (ok) setPaid(true);
                      }}
                      className="text-[9px] text-gray-200 hover:text-primary transition-colors font-black uppercase tracking-widest hover:underline"
                    >
                      [ Dev Bypass: Simulate Node Sync ]
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
};
