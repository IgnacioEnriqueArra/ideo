import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, GitFork, MessageSquare, Trash2, BellOff } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsProps {
  onUserClick?: (userId: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ onUserClick }) => {
  const { notifications, markNotificationsRead, clearAllNotifications, deleteNotification } = useAppContext();

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
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Notificaciones</h1>
        {notifications.length > 0 && (
          <button 
            onClick={() => { if(confirm('¿Borrar todas las notificaciones?')) clearAllNotifications(); }}
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors"
          >
            <BellOff className="w-3.5 h-3.5" />
            Borrar todo
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-[15px]">
            No notifications yet.
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className="relative overflow-hidden bg-red-500">
              {/* Accion de borrar (fondo) */}
              <div className="absolute inset-0 flex items-center justify-end px-6 text-white">
                <Trash2 className="w-6 h-6" />
              </div>

              <motion.div 
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                onDragEnd={(_, info) => {
                   if (info.offset.x < -60) {
                      deleteNotification(notification.id);
                   }
                }}
                className={`relative p-4 flex gap-3 bg-white border-b border-gray-100 transition-colors ${!notification.read ? 'bg-blue-50/20' : ''}`}
              >
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
                  <div className="text-[15px] text-gray-900 leading-tight">
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
                  <div className="text-[12px] text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }).replace('about ', '')}
                  </div>
                </div>
              </motion.div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
