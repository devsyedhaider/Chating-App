import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Users, Bell, Settings, LogOut, Heart, Sparkles } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'chats', icon: MessageSquare, label: 'Messages' },
    { id: 'people', icon: Users, label: 'People' },
    { id: 'requests', icon: Bell, label: 'Requests', badge: true },
  ];

  return (
    <div className="flex flex-col h-full w-[72px] bg-[#020617] border-r border-white/5 py-8 items-center justify-between z-50 relative">
      {/* Pulse Glow Behind Sidebar */}
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-pulse-violet/20 to-transparent shadow-[0_0_15px_rgba(139,92,246,0.3)]" />

      <div className="flex flex-col items-center gap-8 w-full relative z-10">
        <div className="w-10 h-10 bg-pulse-indigo/20 rounded-xl flex items-center justify-center text-pulse-violet mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Sparkles size={20} fill="currentColor" />
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`p-3.5 rounded-2xl transition-all relative group flex items-center justify-center ${activeTab === item.id ? 'bg-pulse-violet/10 text-pulse-violet shadow-[0_10px_25px_rgba(139,92,246,0.15)] overflow-hidden' : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'}`}
          >
            {activeTab === item.id && (
                <div className="absolute inset-0 bg-gradient-to-br from-pulse-indigo/5 to-pulse-violet/5 animate-pulse" />
            )}
            <item.icon size={22} className="relative z-10" />
            {item.badge && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-pulse-violet rounded-full shadow-[0_0_10px_#8B5CF6]" />
            )}
            <span className="absolute left-20 bg-[#0B1120] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl border border-white/10 translate-x-2 group-hover:translate-x-0">
                {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-6 w-full relative z-10">
        <button 
            onClick={() => onTabChange('settings')}
            className={`p-3.5 rounded-2xl transition-all relative group ${activeTab === 'settings' ? 'bg-pulse-violet/10 text-pulse-violet' : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'}`}
        >
            <Settings size={22} />
        </button>

        <div className="px-2 w-full">
            <div className="w-full h-[1px] bg-white/5 mb-6" />
        </div>
        
        <div className="relative group cursor-pointer mb-2" onClick={logout}>
            <div className="relative p-0.5 rounded-2xl bg-gradient-to-br from-pulse-indigo/20 to-pulse-violet/20 hover:from-pulse-indigo/50 hover:to-pulse-violet/50 transition-all shadow-xl">
                <img src={user.profile_image} className="w-11 h-11 rounded-[14px] object-cover border-2 border-[#020617]" alt="" />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#020617]" />
            </div>
            <div className="absolute left-20 bottom-0 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl border border-red-500/10 pointer-events-none">
                Terminate Session
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
