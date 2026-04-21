import React from 'react';
import { motion } from 'framer-motion';
import { User, MessageSquare, UserPlus, Search } from 'lucide-react';

const People = ({ friends, onChat }) => {
  return (
    <div className="h-full flex flex-col p-6 md:p-10 overflow-hidden relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">People</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">{friends.length} connections</p>
        </div>
        <div className="relative group w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-pulse-violet" size={18} />
          <input 
            type="text" 
            placeholder="Find a contact..."
            className="pulse-input pl-12 py-3 text-xs bg-[#0B1120]/60"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {friends.map((friend, index) => (
            <motion.div 
              key={friend._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass p-8 rounded-[2.5rem] bg-[#0B1120]/40 border-white/5 flex flex-col items-center text-center relative group hover:border-pulse-violet/20 hover:bg-[#0B1120]/60 transition-all duration-500"
            >
              <div className="relative mb-6">
                <img src={friend.profile_image} className="w-24 h-24 rounded-full border-4 border-white/5 object-cover" alt="" />
                <div className="absolute top-1 -right-1 w-5 h-5 bg-pulse-violet rounded-full border-4 border-[#0B1120]" />
              </div>

              <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">{friend.name}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-8">@{friend.name.split(' ')[0].toLowerCase()}_pulse_{index + 42}</p>

              <div className="flex gap-3 w-full">
                <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-2 transition-all">
                  <User size={14} /> Profile
                </button>
                <button 
                  onClick={() => onChat(friend)}
                  className="flex-1 py-3 bg-pulse-indigo hover:bg-pulse-violet text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pulse-indigo/20 transition-all active:scale-95"
                >
                  <MessageSquare size={14} /> Chat
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Add Button */}
      <button className="absolute bottom-24 md:bottom-10 right-6 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-pulse-indigo hover:bg-pulse-violet text-white rounded-2xl md:rounded-3xl shadow-[0_15px_35px_rgba(139,92,246,0.3)] flex items-center justify-center transition-all active:scale-90 group z-30">
         <UserPlus size={24} className="md:size-[28px] group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

export default People;
