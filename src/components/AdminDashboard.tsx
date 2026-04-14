import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, FileText, GitFork, MessageSquare, ShieldCheck, Trash2,
  RefreshCw, Search, BadgeCheck, X, BarChart3, Bell, TrendingUp,
  Eye, ChevronRight, Shield, AlertTriangle, CheckCircle
} from 'lucide-react';
import { supabase } from '../supabase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Types ───────────────────────────────────────────────
interface AdminUser { id: string; name: string; handle: string; avatar: string; bio?: string; followers: string[]; following: string[]; verified?: boolean; createdAt?: string; }
interface AdminIdea { id: string; authorId: string; content: string; createdAt: string; likes: number; tags: string[]; mediaUrl?: string; }
interface AdminBranch { id: string; ideaId: string; authorId: string; content: string; createdAt: string; likes: number; }
interface AdminFeedback { id: string; branchId: string; authorId: string; content: string; createdAt: string; }
interface AdminMessage { id: string; conversationId: string; senderId: string; content: string; createdAt: string; read: boolean; }

interface Stats { users: number; ideas: number; branches: number; feedbacks: number; messages: number; }

// ─── Stat Card ───────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value.toLocaleString()}</p>
    </div>
  </motion.div>
);

// ─── Section Header ───────────────────────────────────────────
const SectionTab = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
  >
    {label}
  </button>
);

// ─── Main Admin Component ────────────────────────────────
export const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [section, setSection] = useState<'overview' | 'users' | 'ideas' | 'branches' | 'feedbacks' | 'messages'>('overview');
  const [stats, setStats] = useState<Stats>({ users: 0, ideas: 0, branches: 0, feedbacks: 0, messages: 0 });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [ideas, setIdeas] = useState<AdminIdea[]>([]);
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string } | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [uRes, iRes, bRes, fRes, mRes] = await Promise.all([
      supabase.from('users').select('*').order('name'),
      supabase.from('ideas').select('*').order('createdAt', { ascending: false }),
      supabase.from('branches').select('*').order('createdAt', { ascending: false }),
      supabase.from('feedbacks').select('*').order('createdAt', { ascending: false }),
      supabase.from('messages').select('*').order('createdAt', { ascending: false }),
    ]);
    if (uRes.data) setUsers(uRes.data);
    if (iRes.data) setIdeas(iRes.data);
    if (bRes.data) setBranches(bRes.data);
    if (fRes.data) setFeedbacks(fRes.data);
    if (mRes.data) setMessages(mRes.data);
    setStats({
      users: uRes.data?.length ?? 0,
      ideas: iRes.data?.length ?? 0,
      branches: bRes.data?.length ?? 0,
      feedbacks: fRes.data?.length ?? 0,
      messages: mRes.data?.length ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const toggleVerified = async (user: AdminUser) => {
    const newVal = !user.verified;
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, verified: newVal } : u));
    await supabase.from('users').update({ verified: newVal }).eq('id', user.id);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    if (type === 'user') { setUsers(prev => prev.filter(u => u.id !== id)); await supabase.from('users').delete().eq('id', id); }
    if (type === 'idea') { setIdeas(prev => prev.filter(i => i.id !== id)); await supabase.from('ideas').delete().eq('id', id); }
    if (type === 'branch') { setBranches(prev => prev.filter(b => b.id !== id)); await supabase.from('branches').delete().eq('id', id); }
    if (type === 'feedback') { setFeedbacks(prev => prev.filter(f => f.id !== id)); await supabase.from('feedbacks').delete().eq('id', id); }
    if (type === 'message') { setMessages(prev => prev.filter(m => m.id !== id)); await supabase.from('messages').delete().eq('id', id); }
    setConfirmDelete(null);
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.handle ?? id.slice(0, 8);

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.handle.toLowerCase().includes(search.toLowerCase()));
  const filteredIdeas = ideas.filter(i => i.content.toLowerCase().includes(search.toLowerCase()));
  const filteredBranches = branches.filter(b => b.content.toLowerCase().includes(search.toLowerCase()));
  const filteredFeedbacks = feedbacks.filter(f => f.content.toLowerCase().includes(search.toLowerCase()));
  const filteredMessages = messages.filter(m => m.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-gray-50 flex flex-col max-w-md mx-auto"
    >
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Admin Panel</span>
          </div>
          <button onClick={fetchAll} className={`p-2 hover:bg-white/10 rounded-full transition-colors ${loading ? 'animate-spin' : ''}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <h1 className="text-2xl font-black tracking-tight mt-2">ideo. Dashboard</h1>
        <p className="text-gray-400 text-xs mt-0.5">Control total de la plataforma</p>
      </div>

      {/* Nav Tabs */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { key: 'overview', label: '📊 Resumen' },
          { key: 'users',    label: '👥 Usuarios' },
          { key: 'ideas',    label: '💡 Ideas' },
          { key: 'branches', label: '🌿 Branches' },
          { key: 'feedbacks',label: '💬 Feedback' },
          { key: 'messages', label: '✉️ Mensajes' },
        ].map(tab => (
          <SectionTab key={tab.key} label={tab.label} active={section === tab.key} onClick={() => { setSection(tab.key as any); setSearch(''); }} />
        ))}
      </div>

      {/* Search */}
      {section !== 'overview' && (
        <div className="bg-white border-b border-gray-100 px-4 py-2.5">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder:text-gray-400"
            />
            {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        )}

        {!loading && section === 'overview' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Users}        label="Usuarios"   value={stats.users}     color="bg-blue-500" />
              <StatCard icon={FileText}     label="Ideas"      value={stats.ideas}     color="bg-purple-500" />
              <StatCard icon={GitFork}      label="Branches"   value={stats.branches}  color="bg-green-500" />
              <StatCard icon={MessageSquare}label="Feedbacks"  value={stats.feedbacks} color="bg-orange-500" />
            </div>
            <StatCard icon={Bell} label="Mensajes DM" value={stats.messages} color="bg-pink-500" />

            {/* Verified users summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <BadgeCheck className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-gray-900">Usuarios Verificados</h3>
              </div>
              <div className="space-y-2">
                {users.filter(u => u.verified).length === 0 ? (
                  <p className="text-gray-400 text-sm">Ningún usuario verificado aún.</p>
                ) : (
                  users.filter(u => u.verified).map(u => (
                    <div key={u.id} className="flex items-center gap-2">
                      <Avatar className="w-7 h-7 rounded-full">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">@{u.handle}</span>
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-500 ml-auto" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-gray-700" />
                <h3 className="font-bold text-gray-900">Ideas Recientes</h3>
              </div>
              <div className="space-y-2">
                {ideas.slice(0, 5).map(idea => (
                  <div key={idea.id} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 truncate">{idea.content}</p>
                      <p className="text-[10px] text-gray-400">@{getUserName(idea.authorId)} · {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true, locale: es })}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">❤️ {idea.likes}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && section === 'users' && (
          <div className="divide-y divide-gray-100">
            {filteredUsers.map(user => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white px-4 py-3.5 flex items-center gap-3"
              >
                <Avatar className="w-11 h-11 rounded-full shrink-0">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                    {user.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  </div>
                  <p className="text-gray-400 text-xs">@{user.handle}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-gray-400">👥 {user.followers?.length ?? 0} seguidores</span>
                    <span className="text-[10px] text-gray-400">📝 {ideas.filter(i => i.authorId === user.id).length} ideas</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleVerified(user)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                      user.verified
                        ? 'bg-blue-100 text-blue-600 border border-blue-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                    }`}
                  >
                    <BadgeCheck className="w-3 h-3" />
                    {user.verified ? 'Verificado' : 'Verificar'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ type: 'user', id: user.id })}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-500 border border-red-100 rounded-full text-[11px] font-bold hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && section === 'ideas' && (
          <div className="divide-y divide-gray-100">
            {filteredIdeas.map(idea => (
              <div key={idea.id} className="bg-white px-4 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        @{getUserName(idea.authorId)}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 leading-snug line-clamp-3">{idea.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-gray-400">❤️ {idea.likes} • 🌿 {branches.filter(b => b.ideaId === idea.id).length} branches</span>
                      {idea.tags?.length > 0 && (
                        <div className="flex gap-1">
                          {idea.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {idea.mediaUrl && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <img src={idea.mediaUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setConfirmDelete({ type: 'idea', id: idea.id })}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-500 border border-red-100 rounded-full text-[11px] font-bold hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && section === 'branches' && (
          <div className="divide-y divide-gray-100">
            {filteredBranches.map(branch => (
              <div key={branch.id} className="bg-white px-4 py-3.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">@{getUserName(branch.authorId)}</span>
                  <span className="text-[11px] text-gray-400">{formatDistanceToNow(new Date(branch.createdAt), { addSuffix: true, locale: es })}</span>
                </div>
                <p className="text-sm text-gray-800 leading-snug line-clamp-2">{branch.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-gray-400">❤️ {branch.likes} • 💬 {feedbacks.filter(f => f.branchId === branch.id).length} comentarios</span>
                  <button
                    onClick={() => setConfirmDelete({ type: 'branch', id: branch.id })}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-500 border border-red-100 rounded-full text-[11px] font-bold hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && section === 'feedbacks' && (
          <div className="divide-y divide-gray-100">
            {filteredFeedbacks.map(fb => (
              <div key={fb.id} className="bg-white px-4 py-3.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">@{getUserName(fb.authorId)}</span>
                  <span className="text-[11px] text-gray-400">{formatDistanceToNow(new Date(fb.createdAt), { addSuffix: true, locale: es })}</span>
                </div>
                <p className="text-sm text-gray-800 leading-snug line-clamp-2">{fb.content}</p>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setConfirmDelete({ type: 'feedback', id: fb.id })}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-500 border border-red-100 rounded-full text-[11px] font-bold hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && section === 'messages' && (
          <div className="divide-y divide-gray-100">
            {filteredMessages.map(msg => (
              <div key={msg.id} className="bg-white px-4 py-3.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">@{getUserName(msg.senderId)}</span>
                  {msg.read ? (
                    <span className="flex items-center gap-0.5 text-[10px] text-green-500"><CheckCircle className="w-3 h-3" />Leído</span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><Eye className="w-3 h-3" />No leído</span>
                  )}
                  <span className="text-[11px] text-gray-400 ml-auto">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: es })}</span>
                </div>
                <p className="text-sm text-gray-800 leading-snug line-clamp-2">{msg.content}</p>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setConfirmDelete({ type: 'message', id: msg.id })}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-500 border border-red-100 rounded-full text-[11px] font-bold hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h2 className="text-lg font-black text-gray-900 text-center">¿Eliminar?</h2>
              <p className="text-sm text-gray-500 text-center mt-1 mb-5">Esta acción es permanente y no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors">
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
