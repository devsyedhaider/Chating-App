import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Bell, UserPlus, Signal, ShieldAlert } from 'lucide-react';

const Requests = ({ pendingRequests, onAccept, onDecline }) => {
  return (
    <div className="h-full bg-[#020617] flex flex-col p-6 md:p-10 relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pulse-violet/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
            <div>
                <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-3">Signals</h1>
                <div className="flex items-center gap-3">
                    <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] bg-white/5 inline-block px-3 py-1 rounded-full border border-white/5">
                        {pendingRequests.length} Incoming Stream{pendingRequests.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center gap-1.5 text-pulse-violet/50 text-[9px] font-black uppercase tracking-widest">
                        <Signal size={12} className="animate-pulse" /> Live Monitoring
                    </div>
                </div>
            </div>
            <div className="hidden md:flex p-4 bg-pulse-violet/10 rounded-3xl border border-pulse-violet/20 shadow-[0_15px_45px_rgba(139,92,246,0.15)] items-center gap-4 group">
                <div className="text-right">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Encrypted Hub</p>
                    <p className="text-[8px] font-black text-pulse-violet uppercase tracking-widest opacity-50">Active & Secure</p>
                </div>
                <div className="w-12 h-12 bg-pulse-violet rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pulse-violet/20 group-hover:scale-110 transition-transform duration-500">
                    <Bell size={24} fill="currentColor" />
                </div>
            </div>
        </div>

        {pendingRequests.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
                <div className="relative mb-12">
                    <div className="absolute inset-0 bg-pulse-indigo/10 blur-[60px] rounded-full" />
                    <div className="w-48 h-48 md:w-64 md:h-64 bg-[#0B1120]/40 rounded-[4rem] border border-white/5 flex items-center justify-center relative overflow-hidden backdrop-blur-xl group">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <UserPlus size={64} className="text-gray-700 md:size-80" />
                    </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-[0.3em] mb-4">No Pending Signals</h3>
                <p className="text-gray-600 max-w-xs font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px] leading-relaxed">
                    Your sanctuary communication channels are clear. No unauthorized access clusters detected.
                </p>
            </div>
        ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-24 md:pb-10 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {pendingRequests.map((req, index) => (
                        <motion.div 
                            key={req._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-pulse-violet/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            
                            <div className="relative glass p-8 rounded-[3rem] bg-[#0B1120]/40 border border-white/5 flex flex-col items-center text-center hover:border-pulse-violet/20 hover:bg-[#0B1120]/60 transition-all duration-500 overflow-hidden shadow-2xl">
                                <div className="absolute top-0 left-0 p-4 opacity-5">
                                    <Signal size={60} />
                                </div>
                                
                                <div className="relative mb-8 pt-4">
                                    <div className="absolute inset-0 bg-pulse-violet/20 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <img src={req.sender_id.profile_image} className="w-28 h-28 rounded-[2.5rem] object-cover border-4 border-[#020617] shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-105" alt="" />
                                    <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-pulse-indigo to-pulse-violet rounded-2xl border-4 border-[#020617] flex items-center justify-center text-white z-20 shadow-xl">
                                        <Bell size={14} fill="currentColor" />
                                    </div>
                                </div>

                                <h4 className="text-xl font-black text-white mb-1 uppercase tracking-tight">{req.sender_id.name}</h4>
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] mb-10">Origin Node: {req.sender_id.user_id}</p>
                                
                                <div className="w-full flex flex-col gap-3">
                                    <button 
                                        onClick={() => onAccept(req._id)}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-pulse-violet hover:bg-pulse-indigo text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-pulse-violet/20 transition-all active:scale-95 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-300"
                                    >
                                        <Check size={16} strokeWidth={3} /> Accept Signal
                                    </button>
                                    <button 
                                        className="w-full py-3 bg-white/5 hover:bg-red-500/10 text-gray-600 hover:text-red-500 font-bold uppercase tracking-widest text-[8px] rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5"
                                    >
                                        <ShieldAlert size={14} /> Deny Access
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
