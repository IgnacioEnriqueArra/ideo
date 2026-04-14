import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, GitFork, MessageSquare, BellOff, UserPlus } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationsProps {
  onUserClick?: (userId: string) => void;
}

const typeConfig = {
  like:     { icon: Heart,          color: 'bg-red-500',   iconStyle: 'text-white fill-white',  label: 'le dio me gusta a tu idea.' },
  branch:   { icon: GitFork,        color: 'bg-blue-500',  iconStyle: 'text-white',             label: 'hizo un branch desde tu idea.' },
  feedback: { icon: MessageSquare,  color: 'bg-green-500', iconStyle: 'text-white fill-white/20',label: 'comentó en tu branch.' },
  follow:   { icon: UserPlus,       color: 'bg-violet-500',iconStyle: 'text-white',             label: 'comenzó a seguirte.' },
} as const;

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
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-black text-gray-900 tracking-tight">Notificaciones</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-primary font-semibold mt-0.5">{unreadCount} nueva{unreadCount !== 1 ? 's' : ''}</p>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={() => { if (confirm('¿Borrar todas las notificaciones?')) clearAllNotifications(); }}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-full transition-colors border border-red-100"
            >
              <BellOff className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center h-64 gap-3 px-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <BellOff className="w-7 h-7 text-gray-300" />
            </div>
            <p className="font-bold text-gray-900 text-[17px]">Sin notificaciones</p>
            <p className="text-gray-400 text-sm leading-snug">Cuando alguien interactúe contigo, las verás aquí.</p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((notification, index) => {
              const cfg = typeConfig[notification.type as keyof typeof typeConfig];
              const Icon = cfg?.icon ?? Heart;
              const isUnread = !notification.read;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 80, height: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.03 }}
                  className="relative overflow-hidden"
                >
                  {/* Swipe-to-delete background */}
                  <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <BellOff className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] text-white font-bold uppercase tracking-wide">Borrar</span>
                    </div>
                  </div>

                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -110, right: 0 }}
                    dragElastic={{ left: 0.15, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -70) deleteNotification(notification.id);
                    }}
                    className={`relative flex items-center gap-3.5 px-4 py-3.5 bg-white border-b border-gray-50 cursor-pointer select-none ${
                      isUnread ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => onUserClick && onUserClick(notification.actor.id)}
                  >
                    {/* Unread indicator */}
                    {isUnread && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                    )}

                    {/* Avatar with type icon badge */}
                    <div className="relative shrink-0">
                      <Avatar className="w-12 h-12 rounded-full border-2 border-white shadow-sm">
                        <AvatarImage src={notification.actor.avatar} />
                        <AvatarFallback className="bg-gray-200 text-gray-600 font-bold text-base">
                          {notification.actor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {cfg && (
                        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${cfg.color} flex items-center justify-center border-2 border-white shadow-sm`}>
                          <Icon className={`w-2.5 h-2.5 ${cfg.iconStyle}`} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-gray-900 leading-snug">
                        <span className="font-bold">{notification.actor.name}</span>
                        {' '}
                        <span className="text-gray-600">{cfg?.label}</span>
                      </p>
                      <p className="text-[12px] text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                      </p>
                    </div>

                    {/* Type tag chip */}
                    <div className={`shrink-0 px-2 py-0.5 rounded-full ${cfg?.color ?? 'bg-gray-400'} bg-opacity-10`}>
                      {cfg && <Icon className={`w-3.5 h-3.5 ${cfg.color.replace('bg-', 'text-')}`} />}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};
