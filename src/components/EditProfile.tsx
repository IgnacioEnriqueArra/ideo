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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const compressImage = async (file: File, maxWidth = 800, quality = 0.6): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob); else reject(new Error('Error al comprimir'));
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vista previa inmediata
      const localUrl = URL.createObjectURL(file);
      setAvatar(localUrl);
      
      setIsUploading(true);
      try {
        const compressedBlob = await compressImage(file);
        const fileName = `avatar-${currentUser.id}-${Math.random()}.jpg`;
        const { supabase } = await import('../supabase');
        const { data, error } = await supabase.storage.from('media').upload(`public/${fileName}`, compressedBlob);
        if (!error && data) {
           const publicUrl = supabase.storage.from('media').getPublicUrl(data.path).data.publicUrl;
           setAvatar(publicUrl);
        }
      } catch(e) {
        console.error(e);
      }
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    updateProfile(name, handle, bio, avatar);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-[9999] overflow-hidden flex flex-col max-h-[85vh]"
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
            disabled={isUploading}
            className="bg-black text-white px-4 py-1.5 rounded-full font-bold text-sm disabled:opacity-50"
          >
            Save
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden bg-white">
                <AvatarImage src={avatar} className="object-cover" />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Generated Name</label>
              <input 
                type="text" 
                disabled
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                value={name}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Generated Handle</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">@</span>
                <input 
                  type="text" 
                  disabled
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-gray-400 cursor-not-allowed"
                  value={handle}
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
        </div>
      )}
    </AnimatePresence>
  );
};
