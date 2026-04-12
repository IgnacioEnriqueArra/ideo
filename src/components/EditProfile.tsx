import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Camera } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAppContext();
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);

  if (!isOpen) return null;

  const handleSave = () => {
    updateProfile(name, handle, bio, avatar);
    onClose();
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-x-0 bottom-0 top-12 bg-white rounded-t-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-w-md mx-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-900" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">Edit profile</h2>
          </div>
          <button 
            onClick={handleSave}
            className="bg-gray-900 text-white px-4 py-1.5 rounded-full font-bold text-sm"
          >
            Save
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24 rounded-full border-4 border-white shadow-sm">
                <AvatarImage src={avatar} />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <button className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors">
                <Camera className="w-6 h-6" />
              </button>
            </div>
            <input 
              type="text" 
              placeholder="Avatar URL" 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
              <input 
                type="text" 
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Handle</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">@</span>
                <input 
                  type="text" 
                  className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
              <textarea 
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 min-h-[100px] resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the world about yourself"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
