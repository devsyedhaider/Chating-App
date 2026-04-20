import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, MessageSquare, Filter, Globe, Sparkles, Zap, Heart, Shield, Radio, Users } from 'lucide-react';

const People = ({ onChat, friends }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/users/all', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Filter out self
      setUsers(data.filter(u => u._id !== user._id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
    u.user_id.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-12 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pulse-violet/5 blur-[150px] -z-10 animate-glow" />
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16 relative z-10">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-6"
          >
             <div className="p-3 bg-pulse-indigo/10 rounded-2xl text-pulse-indigo border border-pulse-indigo/20 shadow-lg shadow-pulse-indigo/20">
                <Globe size={24} strokeWidth={1.5} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-500 italic">Universal Frequencies</span>
          </motion.div>
          <h1 className="text-7xl font-black text-white mb-6 tracking-tighter leading-none uppercase italic">Explore <br/> Frequencies</h1>
          <p className="text-gray-500 font-medium text-xl leading-relaxed opacity-80">Discover new nodes in the nocturnal sanctuary. Extend your network of encrypted connections.</p>
        </div>

        <div className="w-full lg:w-[420px] flex flex-col gap-6">
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-pulse-violet transition-all" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by Pulse ID or Name..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-[#0B1120]/60 border border-white/5 rounded-[2rem] py-5 pl-16 pr-6 text-sm text-white focus:border-pulse-violet/30 outline-none transition-all placeholder:text-gray-700 tracking-tight"
                />
            </div>
            
            {/* Quick Filters */}
            <div className="flex gap-3">
                <button className="flex-1 py-3 bg-pulse-violet/10 border border-pulse-violet/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-pulse-violet flex items-center justify-center gap-2">
                    <Sparkles size={14} /> Newest
                </button>
                <button className="flex-1 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <Filter size={14} /> Filters
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4 pb-20">
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-72 bg-[#0B1120]/40 rounded-[3rem] border border-white/5 animate-pulse" />
                ))}
            </div>
        ) : (
            <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
            >
                <AnimatePresence>
                    {filteredUsers.map((u, idx) => {
                        const isFriend = friends.some(f => f._id === u._id);
                        return (
                            <motion.div
                                key={u._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group h-80 glass rounded-[3.5rem] bg-[#0B1120]/30 border-white/5 p-8 flex flex-col items-center justify-between relative overflow-hidden transition-all duration-700 hover:bg-[#0B1120]/50 hover:border-pulse-violet/20"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-pulse-violet/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative">
                                    <div className="absolute inset-0 bg-pulse-indigo/20 blur-[25px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 scale-150" />
                                    <img 
                                      src={u.profile_image} 
                                      className="w-24 h-24 rounded-[2.5rem] object-cover border-4 border-white/5 relative z-10 transition-transform duration-700 group-hover:scale-105 shadow-2xl" 
                                      alt="" 
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#020617] rounded-xl border border-white/10 flex items-center justify-center z-20">
                                         <Zap size={10} className="text-pulse-violet" fill="currentColor" />
                                    </div>
                                </div>

                                <div className="text-center relative z-10 w-full">
                                    <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight group-hover:text-pulse-violet transition-colors">{u.name}</h3>
                                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mb-4 opacity-70 italic group-hover:opacity-100 transition-opacity">@{u.user_id}</p>
                                    
                                    <div className="flex gap-2 justify-center">
                                         <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-gray-700 uppercase tracking-widest border border-white/5">Product</span>
                                         <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-gray-700 uppercase tracking-widest border border-white/5">London</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 w-full relative z-10">
                                    {isFriend ? (
                                        <button 
                                            onClick={() => onChat(u)}
                                            className="grow flex-1 flex items-center justify-center gap-2 py-4 bg-pulse-indigo/10 border border-pulse-indigo/20 text-pulse-indigo text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-pulse-indigo hover:text-white transition-all shadow-xl active:scale-95"
                                        >
                                            <MessageSquare size={16} /> Open Pulse
                                        </button>
                                    ) : (
                                        <>
                                            <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-pulse-indigo hover:bg-pulse-violet text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-pulse-indigo/20 transition-all active:scale-95">
                                                <UserPlus size={16} /> Connect
                                            </button>
                                            <button className="w-14 items-center justify-center flex bg-white/5 border border-white/10 text-gray-700 hover:text-white hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                                                <Heart size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="absolute bottom-12 right-12 flex items-center gap-4 opacity-20 pointer-events-none">
          <Users size={16} className="text-gray-500" />
          <span className="text-[10px] font-black uppercase tracking-[1em] text-gray-700">Digital Network Sync V4.0</span>
      </div>
    </div>
  );
};

export default People;
