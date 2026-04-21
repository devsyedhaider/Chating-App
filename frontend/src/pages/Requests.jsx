import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Bell, UserPlus } from 'lucide-react';

const Requests = ({ pendingRequests, onAccept, onDecline }) => {
  return (
    <div className="h-full bg-[#020617] flex flex-col p-6 md:p-10 relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pulse-violet/5 blur-[120px] rounded-full -z-10" />

        <div className="flex items-center justify-between gap-4 mb-8 md:mb-12">
            <div>
                <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">Signals</h1>
                <p className="text-gray-500 text-[9px] md:text-sm font-bold uppercase tracking-widest bg-white/5 inline-block px-3 md:px-4 py-1.5 rounded-full border border-white/5">
                    {pendingRequests.length} Pending
                </p>
            </div>
            <div className="p-3 md:p-4 bg-pulse-violet/10 rounded-2xl md:rounded-3xl border border-pulse-violet/20 shadow-[0_10px_40px_rgba(139,92,246,0.1)] shrink-0">
                <Bell size={24} className="text-pulse-violet md:size-[28px]" fill="currentColor" />
            </div>
        </div>

        {pendingRequests.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-48 h-48 bg-white/5 rounded-[3rem] border border-white/5 flex items-center justify-center mb-10">
                    <UserPlus size={48} className="text-gray-600" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-4">No Pending Signals</h3>
                <p className="text-gray-600 max-w-xs font-bold uppercase tracking-widest text-[10px]">Your sanctuary is currently up to date with all connections.</p>
            </div>
        ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingRequests.map((req, index) => (
                        <motion.div 
                            key={req._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 bg-white/5 border border-white/5 rounded-[2.5rem] relative overflow-hidden group hover:border-pulse-violet/30 transition-all shadow-xl"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-pulse-violet/5 blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="relative mb-6">
                                    <img src={req.sender_id.profile_image} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-[#020617] shadow-2xl" alt="" />
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-pulse-indigo rounded-2xl border-4 border-[#020617] flex items-center justify-center text-white">
                                        <Bell size={12} fill="currentColor" />
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold text-white mb-1">{req.sender_id.name}</h4>
                                <p className="text-[9px] text-pulse-violet font-black uppercase tracking-[0.2em] mb-8">@{req.sender_id.user_id}</p>
                                
                                <div className="w-full flex items-center gap-3">
                                    <button 
                                        onClick={() => onAccept(req._id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-pulse-violet hover:bg-pulse-indigo text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95"
                                    >
                                        <Check size={14} /> Accept
                                    </button>
                                    <button 
                                        className="p-3 bg-white/5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all active:scale-95 border border-white/5"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default Requests;
