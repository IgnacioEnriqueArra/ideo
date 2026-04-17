import React, { useState } from 'react';
import { ArrowLeft, Trash2, AlertTriangle, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../AppContext';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { deleteAccount, logout } = useAppContext();
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

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col w-full bg-gray-50 min-h-full"
    >
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-6">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="p-4 flex-1">
        <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm mt-4">
          <div className="flex items-center gap-3 mb-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-lg font-bold">Danger Zone</h2>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Once you delete your account, there is no turning back. This will permanently remove your profile, settings, and all associated data.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3 px-4 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mt-4">
          <div className="flex items-center gap-3 mb-2 text-gray-900">
            <LogOut className="w-6 h-6" />
            <h2 className="text-lg font-bold">Account Session</h2>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            You can log out of your account anytime. You will need to sign in again to access your private content.
          </p>
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to log out?")) {
                logout();
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-black text-white font-bold py-3 px-4 rounded-xl"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </motion.div>
  );
};
