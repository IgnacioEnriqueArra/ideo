import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, FileText, GitFork, MessageSquare, ShieldCheck, Trash2,
  RefreshCw, Search, BadgeCheck, X, BarChart3, Bell, TrendingUp,
  Eye, ChevronRight, Shield, AlertTriangle, CheckCircle, LayoutDashboard,
  Mail, Calendar, ArrowUpRight, Filter
} from 'lucide-react';
import { supabase } from '../supabase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppContext } from '../AppContext';

// ─── Types ───────────────────────────────────────────────
interface AdminUser { id: string; name: string; handle: string; avatar: string; bio?: string; followers: string[]; following: string[]; verified?: boolean; createdAt?: string; }
interface AdminIdea { id: string; authorId: string; content: string; createdAt: string; likes: number; tags: string[]; mediaUrl?: string; }
interface AdminBranch { id: string; ideaId: string; authorId: string; content: string; createdAt: string; likes: number; }
interface AdminFeedback { id: string; branchId: string; authorId: string; content: string; createdAt: string; }
interface AdminMessage { id: string; conversationId: string; senderId: string; content: string; createdAt: string; read: boolean; }

interface Stats { users: number; ideas: number; branches: number; feedbacks: number; messages: number; }

// ─── Stat Card ───────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, delay }: { icon: any; label: string; value: number; color: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md group"
  >
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-lg shadow-current/10`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors" />
    </div>
    <div className="mt-5">
      <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-4xl font-black text-gray-900 mt-1">{value.toLocaleString()}</p>
    </div>
  </motion.div>
);

// ─── Sidebar Item ─────────────────────────────────────────
const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
      active 
        ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/10 scale-[1.02]' 
        : 'text-gray-500 hover:bg-gray-100'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
    <span className="font-bold text-[15px]">{label}</span>
  </button>
);

// ─── Main Component ──────────────────────────────────────
export const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { 
    users, ideas, rawBranches, rawFeedbacks, allMessages,
    deleteIdea, deleteBranch, deleteFeedback, deleteMessage, deleteUser, toggleVerified
  } = useAppContext();
  
  const [section, setSection] = useState<'overview' | 'users' | 'ideas' | 'branches' | 'feedbacks' | 'messages'>('overview');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string } | null>(null);

  const stats: Stats = {
    users: users.length,
    ideas: ideas.length,
    branches: rawBranches.length,
    feedbacks: rawFeedbacks.length,
    messages: allMessages.length
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    if (type === 'user') await deleteUser(id);
    if (type === 'idea') await deleteIdea(id);
    if (type === 'branch') await deleteBranch(id);
    if (type === 'feedback') await deleteFeedback(id);
    if (type === 'message') await deleteMessage(id);
    setConfirmDelete(null);
  };

  const getUser = (id: string) => users.find(u => u.id === id);
  const getUserName = (id: string | undefined) => {
    if (!id) return 'anonymous';
    const u = getUser(id);
    return u?.handle ?? id.slice(0, 8);
  };

  const filteredData = {
    users: users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.handle.toLowerCase().includes(search.toLowerCase())),
    ideas: ideas.filter(i => i.content.toLowerCase().includes(search.toLowerCase())),
    branches: rawBranches.filter(b => b.content.toLowerCase().includes(search.toLowerCase())),
    feedbacks: rawFeedbacks.filter(f => f.content.toLowerCase().includes(search.toLowerCase())),
    messages: allMessages.filter(m => m.content.toLowerCase().includes(search.toLowerCase()))
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex overflow-hidden">
      {/* ─── SIDEBAR ─── */}
      <div className="w-72 bg-white border-r border-gray-100 flex flex-col pt-10 px-4 shrink-0 shadow-2xl shadow-gray-200/50">
        <div className="px-4 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Agent Panel</h1>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">System Terminal</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={section === 'overview'} onClick={() => setSection('overview')} />
          <SidebarItem icon={Users} label="Users" active={section === 'users'} onClick={() => setSection('users')} />
          <SidebarItem icon={FileText} label="Root Ideas" active={section === 'ideas'} onClick={() => setSection('ideas')} />
          <SidebarItem icon={GitFork} label="Branches" active={section === 'branches'} onClick={() => setSection('branches')} />
          <SidebarItem icon={MessageSquare} label="Feedback" active={section === 'feedbacks'} onClick={() => setSection('feedbacks')} />
          <SidebarItem icon={Mail} label="DM Messages" active={section === 'messages'} onClick={() => setSection('messages')} />
        </div>

        <div className="mt-auto mb-8 space-y-2">
          <div className="px-4 py-4 rounded-3xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-600">System Online</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">Authorized access. All actions are logged.</p>
          </div>
          <button onClick={onBack} className="w-full py-4 text-xs font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest">
            Logout
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
             <h2 className="text-[20px] font-black text-gray-900 capitalize">{section === 'overview' ? 'Overview' : section}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
               <input 
                  type="text" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search database..." 
                  className="bg-gray-50 w-80 py-2.5 pl-11 pr-4 rounded-2xl border border-gray-100 outline-none focus:bg-white focus:border-gray-900 transition-all text-sm"
               />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#FAFAFB]">
          <AnimatePresence mode="wait">
              {section === 'overview' && (
                <div key="ov" className="max-w-7xl mx-auto space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <StatCard icon={Users} label="Users" value={stats.users} color="bg-blue-600" delay={0.1} />
                    <StatCard icon={FileText} label="Ideas" value={stats.ideas} color="bg-indigo-600" delay={0.2} />
                    <StatCard icon={GitFork} label="Branches" value={stats.branches} color="bg-emerald-600" delay={0.3} />
                    <StatCard icon={MessageSquare} label="Feedbacks" value={stats.feedbacks} color="bg-amber-600" delay={0.4} />
                    <StatCard icon={Bell} label="DM Messages" value={stats.messages} color="bg-pink-600" delay={0.5} />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Recent Ideas */}
                    <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                       <div className="flex items-center justify-between mb-8">
                          <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Global Activity</h3>
                          <button onClick={() => setSection('ideas')} className="text-sm font-bold text-blue-600 hover:underline px-4 py-2 bg-blue-50 rounded-full">View all</button>
                       </div>
                       <div className="space-y-4">
                          {ideas.slice(0, 6).map(idea => (
                            <div key={idea.id} className="group flex items-center gap-4 p-4 rounded-3xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                               <Avatar className="w-12 h-12 rounded-2xl shrink-0">
                                 <AvatarImage src={getUser(idea.authorId)?.avatar} />
                                 <AvatarFallback>U</AvatarFallback>
                               </Avatar>
                               <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                     <span className="font-bold text-gray-900 text-[15px]">@{getUserName(idea.authorId)}</span>
                                     <span className="text-[10px] text-gray-400 font-bold uppercase">{format(new Date(idea.createdAt), 'dd MMM, HH:mm')}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 truncate mt-0.5">{idea.content}</p>
                               </div>
                               <div className="shrink-0 flex items-center gap-4 px-6 transition-opacity">
                                  <span className="text-xs font-bold text-gray-400">❤️ {idea.likes}</span>
                                  <button onClick={() => setConfirmDelete({ type: 'idea', id: idea.id })} className="p-2 text-red-400 hover:text-red-500 bg-red-50 rounded-xl">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    {/* Verification Queue / Stats */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">User Updates</h3>
                        <div className="space-y-6">
                           {users.filter(u => !u.verified).slice(0, 6).map(user => (
                             <div key={user.id} className="flex items-center gap-4">
                                <Avatar className="w-10 h-10 rounded-full">
                                  <AvatarImage src={user.avatar} />
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                   <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                                   <p className="text-xs text-gray-400">@{user.handle}</p>
                                </div>
                                <button onClick={() => toggleVerified(user.id)} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full hover:bg-blue-600 hover:text-white transition-all uppercase tracking-wider">
                                  Verify
                                </button>
                             </div>
                           ))}
                           <button onClick={() => setSection('users')} className="w-full py-4 text-xs font-black text-gray-400 text-center hover:text-gray-900 transition-colors uppercase tracking-[0.2em] border-t border-gray-50 mt-4">
                             Manage all users
                           </button>
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {section === 'users' && (
                <div key="usr" className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredData.users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 rounded-2xl shrink-0 shadow-sm">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                                  {user.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />}
                                </div>
                                <p className="text-xs text-gray-400">@{user.handle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center justify-end gap-2 transition-opacity">
                              <button onClick={() => toggleVerified(user.id)} className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-xl transition-all" title="Toggle Verification">
                                <ShieldCheck className="w-5 h-5" />
                              </button>
                              <button onClick={() => setConfirmDelete({ type: 'user', id: user.id })} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all" title="Delete User">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {['ideas', 'branches', 'feedbacks', 'messages'].includes(section) && (
                <div key="grid" className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {(section === 'ideas' ? filteredData.ideas : section === 'branches' ? filteredData.branches : section === 'feedbacks' ? filteredData.feedbacks : filteredData.messages).map((item: any) => (
                    <div key={item.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col group transition-all hover:translate-y-[-4px] hover:shadow-xl hover:shadow-gray-200/40">
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                             <Avatar className="w-8 h-8 rounded-full">
                               <AvatarImage src={getUser(item.author?.id || item.authorId || item.senderId)?.avatar} />
                             </Avatar>
                             <div>
                               <p className="text-xs font-bold text-gray-900">@{getUserName(item.author?.id || item.authorId || item.senderId)}</p>
                               <p className="text-[10px] text-gray-400">{format(new Date(item.createdAt), 'dd MMMM yyyy')}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.likes !== undefined && <span className="text-[10px] font-black text-gray-400">❤️ {item.likes}</span>}
                            <button onClick={() => setConfirmDelete({ type: section.slice(0, -1), id: item.id })} className="p-2 text-gray-500 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-xl transition-all">
                               <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                       </div>
                       <div className="flex-1">
                          <p className="text-sm text-gray-700 leading-relaxed overflow-wrap-break-word">{item.content}</p>
                          {item.mediaUrl && (
                             <img src={item.mediaUrl} className="mt-4 rounded-2xl w-full h-40 object-cover border border-gray-50" />
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
        </div>
      </div>

      {/* ─── MODALS ─── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Confirm Deletion</h2>
              <p className="text-[15px] text-gray-500 mt-2 mb-8 leading-relaxed">Are you sure you want to delete this record from the database? This action is <span className="text-red-500 font-bold">irreversible</span>.</p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 bg-gray-100 text-gray-700 font-black rounded-3xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs">
                  Cancel
                </button>
                <button onClick={handleDelete} className="flex-1 py-4 bg-red-500 text-white font-black rounded-3xl hover:bg-red-600 transition-all shadow-xl shadow-red-500/30 uppercase tracking-widest text-xs">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
