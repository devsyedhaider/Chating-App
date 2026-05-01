import React from 'react';
import { motion } from 'framer-motion';
import { User, MessageSquare, UserPlus, Search, ShieldCheck } from 'lucide-react';

const People = ({ friends, onChat }) => {
  return (
    <div className="h-full flex flex-col p-6 md:p-10 overflow-hidden relative bg-[#020617]">
      {/* Decorative Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pulse-indigo/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter uppercase italic">Registry</h1>
          <div className="flex items-center gap-3">
            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[9px] bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {friends.length} Active Node{friends.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1.5 text-green-500/50 text-[9px] font-black uppercase tracking-widest">
                <ShieldCheck size={12} /> Secure Network
            </div>
          </div>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 transition-colors group-focus-within:text-pulse-violet" size={16} />
          <input 
            type="text" 
            placeholder="FILTER COMPANIONS..."
            className="w-full bg-[#0B1120]/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white outline-none focus:border-pulse-violet/30 transition-all placeholder:text-gray-800 shadow-2xl"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-24 md:pb-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {friends.map((friend, index) => (
            <motion.div 
              key={friend._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pulse-indigo/10 to-pulse-violet/10 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative glass p-6 md:p-8 rounded-[2.5rem] bg-[#0B1120]/40 border border-white/5 flex flex-col items-center text-center hover:border-pulse-violet/20 hover:bg-[#0B1120]/60 transition-all duration-500 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <ShieldCheck size={40} className="text-pulse-violet" />
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-pulse-violet/20 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img src={friend.profile_image} className="w-24 h-24 rounded-[2rem] border-4 border-[#020617] object-cover relative z-10 shadow-2xl transition-transform duration-700 group-hover:scale-105" alt="" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#020617] rounded-full flex items-center justify-center z-20 border border-white/5">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    </div>
                </div>

                <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight group-hover:text-pulse-violet transition-colors">{friend.name}</h3>
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] mb-8">Node: {friend.user_id || 'ID_UNKNOWN'}</p>

                <div className="flex flex-col gap-2 w-full">
                  <button 
                    onClick={() => onChat(friend)}
                    className="w-full py-4 bg-pulse-indigo hover:bg-pulse-violet text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-pulse-indigo/20 transition-all active:scale-95 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-300"
                  >
                    <MessageSquare size={14} /> Establish Link
                  </button>
                  <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 font-bold uppercase tracking-widest text-[8px] rounded-xl flex items-center justify-center gap-2 transition-all">
                    <User size={12} /> View Core Profile
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Add Button */}
      <button className="fixed bottom-24 md:bottom-10 right-6 md:right-10 w-16 h-16 bg-gradient-to-br from-pulse-indigo to-pulse-violet text-white rounded-3xl shadow-[0_15px_45px_rgba(139,92,246,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-90 group z-50">
         <UserPlus size={28} className="group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};

export default People;
