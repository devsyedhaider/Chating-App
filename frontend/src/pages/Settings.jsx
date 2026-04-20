import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Moon, Sun, Camera, Copy, Lock, Eye, Trash2, ShieldAlert, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(user.user_id);
    setCopied(true);
    toast.success('User ID copied to sanctuary clipboard', {
        style: {
            background: '#0B1120',
            color: '#fff',
            border: '1px solid rgba(139,92,246,0.2)',
            fontSize: '10px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            letterSpacing: '0.1em'
        }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col p-10 overflow-hidden relative">
      {/* Bg Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pulse-indigo/5 blur-[120px] -z-10" />

      <div className="mb-12">
        <h1 className="text-5xl font-black text-white mb-3 tracking-tight">Account Settings</h1>
        <p className="text-gray-500 font-medium text-lg leading-relaxed">Manage your digital sanctuary and presence.</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Identity */}
          <div className="glass p-10 rounded-[3rem] bg-[#0B1120]/40 border-white/5 col-span-1">
             <h4 className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] mb-8">Profile Identity</h4>
             
             <div className="flex items-center gap-8 mb-10">
                <div className="relative group">
                    <img src={user.profile_image} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white/5" alt="" />
                    <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-pulse-violet rounded-2xl flex items-center justify-center border-4 border-[#020617] text-white">
                        <Camera size={18} />
                    </button>
                </div>
                <div className="flex-1 space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 text-left">Display Name</label>
                        <input 
                            type="text" 
                            defaultValue={user.name}
                            className="pulse-input bg-[#020617]/50"
                        />
                    </div>
                </div>
             </div>

             <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 text-left">Unique User ID</label>
                <div className="relative group">
                    <input 
                       type="text" 
                       readOnly
                       value={user.user_id}
                       className="pulse-input bg-[#020617]/80 pr-12 text-gray-400 font-mono tracking-widest border-white/5 group-hover:border-pulse-violet/20"
                    />
                    <button 
                        onClick={copyId}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pulse-violet transition-colors"
                    >
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                </div>
             </div>
          </div>

          {/* Appearance */}
          <div className="glass p-10 rounded-[3rem] bg-[#0B1120]/40 border-white/5">
             <h4 className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] mb-8">Appearance</h4>
             <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-6 bg-pulse-indigo/10 border-2 border-pulse-indigo/30 rounded-3xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-pulse-indigo/20 rounded-xl text-pulse-indigo"><Moon size={20} /></div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-white">Nocturnal</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Theme</p>
                        </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-4 border-pulse-violet shadow-[0_0_10px_#8B5CF6]" />
                </button>

                <button className="w-full flex items-center justify-between p-6 bg-[#020617]/30 border-2 border-transparent rounded-3xl opacity-40 group cursor-not-allowed">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl text-gray-600 group-hover:text-gray-400 transition-colors"><Sun size={20} /></div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-gray-500">Luminous</p>
                            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">Switch to Light</p>
                        </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-white/5" />
                </button>
             </div>
             <p className="mt-8 text-[10px] text-gray-600 leading-relaxed max-w-xs uppercase tracking-widest font-black">
                Theme adjustments synchronize across all your authenticated devices in real-time.
             </p>
          </div>

          {/* Security */}
          <div className="glass p-10 rounded-[3rem] bg-[#0B1120]/40 border-white/5">
             <h4 className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] mb-8">Security Controls</h4>
             <div className="space-y-6">
                <div className="flex items-center justify-between p-2">
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Two-Factor Auth</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Enhanced protection</p>
                    </div>
                    <div className="w-12 h-6 bg-pulse-violet rounded-full relative shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                    </div>
                </div>

                <div className="flex items-center justify-between p-2">
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Ghost Mode</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Hide online status</p>
                    </div>
                    <div className="w-12 h-6 bg-[#020617] rounded-full relative border border-white/10 cursor-pointer">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-gray-700 rounded-full" />
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                   <button className="flex items-center gap-3 text-red-500/50 hover:text-red-500 transition-colors group">
                      <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Delete Sanctuary Access</span>
                   </button>
                </div>
             </div>
          </div>

          {/* Privacy Sanctuary */}
          <div className="glass p-10 rounded-[3rem] bg-[#0B1120]/40 border-white/5 flex items-center gap-8 overflow-hidden relative group cursor-pointer border-pulse-violet/5 hover:border-pulse-violet/20 transition-all duration-700">
             <div className="absolute inset-0 bg-gradient-to-br from-pulse-indigo/5 to-pulse-violet/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="flex-1 relative z-10">
                <h2 className="text-3xl font-black text-white mb-6 leading-tight uppercase tracking-tight">Privacy <br/> Sanctuary</h2>
                <p className="text-xs text-gray-500 tracking-wide leading-relaxed mb-8 font-medium">
                    Your presence is guarded by end-to-end industry standards. Pulse never shares your communications with external entities.
                </p>
                <button className="px-6 py-3 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all hover:border-pulse-violet/30">
                    Review Privacy Audit
                </button>
             </div>
             <div className="relative w-44 h-44 flex-shrink-0">
                <div className="absolute inset-0 bg-pulse-indigo/20 blur-[40px] animate-pulse rounded-full" />
                <div className="w-full h-full bg-[#020617]/80 backdrop-blur-md rounded-[3rem] border border-pulse-violet/20 flex items-center justify-center relative overflow-hidden shadow-2xl">
                    <ShieldAlert className="text-pulse-violet drop-shadow-[0_0_15px_#8B5CF6]" size={64} strokeWidth={1} />
                    <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)] opacity-30" />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-10 right-10 flex items-center gap-8 bg-[#020617]/80 backdrop-blur-md p-2 pl-8 rounded-3xl border border-white/5">
        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors">Discard Changes</button>
        <button className="px-10 py-4 bg-pulse-indigo hover:bg-pulse-violet text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_35px_rgba(139,92,246,0.4)] transition-all active:scale-95 text-xs">
            Save Sanctuary Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;
