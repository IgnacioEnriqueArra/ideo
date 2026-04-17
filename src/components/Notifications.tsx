import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, GitFork, MessageSquare, BellOff, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsProps {
  onUserClick?: (userId: string) => void;
}

const typeConfig: Record<string, { icon: any, color: string, textColor: string, badgeColor: string, label: string }> = {
  like:     { icon: Heart,          color: 'bg-red-500/10',    textColor: 'text-red-500',    badgeColor: 'bg-red-500',    label: 'liked your post.' },
  branch:   { icon: GitFork,        color: 'bg-blue-500/10',   textColor: 'text-blue-500',   badgeColor: 'bg-blue-500',   label: 'forked your post.' },
  feedback: { icon: MessageSquare,  color: 'bg-green-500/10',  textColor: 'text-green-500',  badgeColor: 'bg-green-500',  label: 'commented on your fork.' },
  follow:   { icon: UserPlus,       color: 'bg-violet-500/10', textColor: 'text-violet-500', badgeColor: 'bg-violet-500', label: 'started following you.' },
};

export const Notifications: React.FC<NotificationsProps> = ({ onUserClick }) => {
  const { notifications, markNotificationsRead, clearAllNotifications, deleteNotification } = useAppContext();

  useEffect(() => {
    markNotificationsRead();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full bg-white min-h-full"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider mt-0.5">{unreadCount} new interactions</p>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={() => { if (confirm('Clear all notifications?')) clearAllNotifications(); }}
              className="text-[11px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <BellOff className="w-6 h-6 text-gray-200" />
            </div>
            <p className="font-bold text-gray-900">Silence in the node</p>
            <p className="text-gray-400 text-sm mt-1 max-w-[200px]">New signals will appear here as they arrive.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((notification, index) => {
              const cfg = typeConfig[notification.type] || typeConfig.like;
              const Icon = cfg.icon;
              const isUnread = !notification.read;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative group"
                >
                  <div
                    className={`flex items-center gap-4 px-4 py-4 border-b border-gray-50 cursor-pointer transition-colors ${
                      isUnread ? 'bg-primary/5' : 'hover:bg-gray-50/50'
                    }`}
                    onClick={() => onUserClick && onUserClick(notification.actor.id)}
                  >
                    {/* Avatar with Badge */}
                    <div className="relative shrink-0">
                      <Avatar className="w-12 h-12 rounded-full border border-gray-100 shadow-sm">
                        <AvatarImage src={notification.actor.avatar} />
                        <AvatarFallback className="bg-gray-100 text-gray-400 font-bold">
                          {notification.actor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${cfg.badgeColor} flex items-center justify-center border-2 border-white shadow-sm`}>
                        <Icon className="w-2.5 h-2.5 text-white fill-current" />
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] leading-tight text-gray-900">
                        <span className="font-bold hover:underline">{notification.actor.name}</span>
                        {' '}
                        <span className="text-gray-600">{cfg.label}</span>
                      </p>
                      <p className="text-[12px] text-gray-400 font-mono mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Side Icon Pill */}
                    <div className={`shrink-0 w-8 h-8 rounded-full ${cfg.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <Icon className={`w-4 h-4 ${cfg.textColor} ${notification.type === 'like' ? 'fill-current' : ''}`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};
