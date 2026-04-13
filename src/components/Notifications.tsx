import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, GitFork, MessageSquare } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsProps {
  onUserClick?: (userId: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ onUserClick }) => {
  const { notifications, markNotificationsRead } = useAppContext();

  useEffect(() => {
    markNotificationsRead();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full bg-white min-h-full"
    >
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
      </div>

      <div className="divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-[15px]">
            No notifications yet.
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className={`p-4 flex gap-3 ${!notification.read ? 'bg-blue-50/30' : ''}`}>
              <div className="pt-1">
                {notification.type === 'like' && <Heart className="w-6 h-6 text-red-500 fill-red-500" />}
                {notification.type === 'branch' && <GitFork className="w-6 h-6 text-primary" />}
                {notification.type === 'feedback' && <MessageSquare className="w-6 h-6 text-green-500" />}
                {notification.type === 'follow' && <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" /></svg>}
              </div>
              <div className="flex-1">
                <Avatar 
                  className="w-8 h-8 rounded-lg mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onUserClick && onUserClick(notification.actor.id)}
                >
                  <AvatarImage src={notification.actor.avatar} />
                  <AvatarFallback>{notification.actor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-[15px] text-gray-900">
                  <span 
                    className="font-bold cursor-pointer hover:underline"
                    onClick={() => onUserClick && onUserClick(notification.actor.id)}
                  >
                    {notification.actor.name}
                  </span>
                  {notification.type === 'like' && ' le dio me gusta a tu post.'}
                  {notification.type === 'branch' && ' hizo un branch desde tu idea.'}
                  {notification.type === 'feedback' && ' comentó en tu branch.'}
                  {notification.type === 'follow' && ' comenzó a seguirte.'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }).replace('about ', '')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
