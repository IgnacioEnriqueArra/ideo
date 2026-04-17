import React, { useState } from 'react';
import { ArrowLeft, Trash2, AlertTriangle, LogOut, Shield, Bell, EyeOff, UserX, ChevronRight, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../AppContext';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { deleteAccount, logout, currentUser } = useAppContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    setError(null);
    try {
      await deleteAccount();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError("For security reasons, you must have logged in recently to delete your account. Please log out, log back in, and try again.");
      } else {
        setError("There was an error deleting your account. Please try again later.");
      }
      setIsDeleting(false);
    }
  };

  const SettingsItem = ({ icon: Icon, label, description, onClick, color = "text-gray-900", danger = false }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left last:border-0"
    >
      <div className={`p-2 rounded-xl ${danger ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-[15px] ${danger ? 'text-red-600' : color}`}>{label}</p>
        {description && <p className="text-gray-500 text-[13px] tracking-tight">{description}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300" />
    </button>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col w-full bg-white min-h-full"
    >
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center gap-6">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">Settings</h1>
          <p className="text-[12px] text-gray-500 font-mono tracking-tighter mt-1">@{currentUser?.handle || 'guest'}</p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
           <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Account & Node</h3>
        </div>
        <SettingsItem 
          icon={Shield} 
          label="Account Security" 
          description="Manage your recovery phrase and keys"
        />
        <SettingsItem 
          icon={Bell} 
          label="Notifications" 
          description="Control your alert preferences"
        />
        <SettingsItem 
          icon={EyeOff} 
          label="Privacy" 
          description="Decide who can see your activity"
        />

        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 mt-2">
           <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">General</h3>
        </div>
        <SettingsItem 
          icon={Share2} 
          label="Share Profile" 
          description="Let others join your node"
        />
        <SettingsItem 
          icon={LogOut} 
          label="Log Out from Node" 
          description="Terminate current session"
          onClick={() => { if(window.confirm("Logout?")) logout(); }}
        />

        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 mt-2">
           <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Danger Zone</h3>
        </div>
        <SettingsItem 
          icon={UserX} 
          label="Delete Account" 
          description="Permanently remove your identity"
          danger
          onClick={handleDelete}
        />
        
        {error && (
          <div className="m-4 bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="p-10 text-center">
            <p className="text-[11px] text-gray-400 font-mono italic opacity-50">fork. network v.0.0.1</p>
        </div>
      </div>
    </motion.div>
  );
};
