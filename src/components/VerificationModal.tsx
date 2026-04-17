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
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[24px] border border-blue-100 dark:border-blue-800">
                <CheckCircle2 className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Proof of Human Identity</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Verified accounts represent authentic contributors in the network. Verification grants you:
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
                <div className="bg-gray-900 text-white rounded-[24px] p-6 shadow-xl relative overflow-hidden border border-white/10">
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Blockchain Pending</div>
                  
                  <div className="bg-white/5 rounded-2xl p-5 mb-6 text-center border border-white/10">
                    <div className="text-[10px] text-gray-400 mb-1 font-mono uppercase tracking-widest">Amount to send (TRC20)</div>
                    <div className="text-4xl font-black font-mono tracking-tighter text-primary">
                      {activeOrder.amount} <span className="text-lg text-gray-500">USDT</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-[11px] text-gray-400 mb-2 font-black font-mono uppercase tracking-widest">Receiving Address:</div>
                    <div 
                      className="bg-black/40 rounded-xl p-4 break-all font-mono text-sm border border-white/5 text-center select-all cursor-pointer hover:bg-black/60 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(TRC20_WALLET);
                        alert("Address Copied!");
                      }}
                    >
                      {TRC20_WALLET}
                    </div>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-[12px] text-gray-300 leading-tight">
                      <p className="font-bold text-white mb-1 uppercase tracking-tight">Important Network Notice:</p>
                      <p>Send precisely <span className="text-red-400 font-bold">{activeOrder.amount} USDT</span> via **TRON (TRC20)** network only. Any other token or network will result in permanent loss of funds.</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col items-center gap-4">
                    <div className="flex justify-center items-center gap-2 text-xs text-gray-400">
                      {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                      {isChecking ? 'Syncing with TronGrid...' : 'Listening for transaction...'}
                    </div>

                    <button 
                      onClick={async () => {
                        const ok = await simulateSuccessOrder(activeOrder.id);
                        if (ok) setPaid(true);
                      }}
                      className="text-[10px] text-white/20 hover:text-primary transition-colors uppercase tracking-widest font-black"
                    >
                      [ Debug: Simulate Payment ]
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
