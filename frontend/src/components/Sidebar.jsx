import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Users, Bell, Settings, LogOut, Heart, Sparkles } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange, pendingCount = 0 }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'chats', icon: MessageSquare, label: 'Messages' },
    { id: 'people', icon: Users, label: 'People' },
    { id: 'requests', icon: Bell, label: 'Requests', badge: pendingCount > 0 },
  ];

  return (
    <div className="flex flex-col md:h-full w-full md:w-[72px] h-20 bg-[#020617] border-t md:border-t-0 md:border-r border-white/5 py-4 md:py-8 items-center justify-between z-50 fixed bottom-0 md:relative order-2 md:order-1">
      <div className="hidden md:block absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-pulse-violet/20 to-transparent shadow-[0_0_15px_rgba(139,92,246,0.3)]" />

      <div className="flex md:flex-col flex-row items-center justify-around md:justify-start gap-0 md:gap-8 w-full relative z-10">
        <div className="hidden md:flex w-10 h-10 bg-pulse-indigo/20 rounded-xl items-center justify-center text-pulse-violet mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Sparkles size={20} fill="currentColor" />
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`p-3.5 rounded-2xl transition-all relative group flex items-center justify-center ${activeTab === item.id ? 'bg-pulse-violet/10 text-pulse-violet shadow-[0_10px_25px_rgba(139,92,246,0.15)]' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <item.icon size={22} className="relative z-10" />
            {item.badge && pendingCount > 0 && (
                <div className="absolute top-2 right-2 flex items-center justify-center min-w-[14px] h-[14px] bg-pulse-violet rounded-full shadow-[0_0_10px_#8B5CF6] text-[8px] text-white font-black px-1 border border-[#020617] transform translate-x-1 -translate-y-1">
                    {pendingCount}
                </div>
            )}
            <span className="hidden md:block absolute left-20 bg-[#0B1120] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl border border-white/10 translate-x-2 group-hover:translate-x-0 z-50">
                {item.label}
            </span>
          </button>
        ))}
        
        <button 
            onClick={() => onTabChange('settings')}
            className={`md:hidden p-3.5 rounded-2xl transition-all relative group ${activeTab === 'settings' ? 'bg-pulse-violet/10 text-pulse-violet' : 'text-gray-600'}`}
        >
            <Settings size={22} />
        </button>
      </div>

      <div className="hidden md:flex flex-col items-center gap-6 w-full relative z-10">
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
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
