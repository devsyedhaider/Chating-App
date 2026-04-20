import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Users, UserPlus, Settings, LogOut, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'chats', icon: MessageSquare, label: 'Messages' },
    { id: 'people', icon: Users, label: 'People' },
    { id: 'requests', icon: Bell, label: 'Requests' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-full w-[160px] bg-[#020617] border-r border-white/5 py-12 relative overflow-hidden">
      {/* Profile Identity */}
      <div className="flex flex-col items-center mb-16 px-4">
        <div className="relative group cursor-pointer mb-4">
            <div className="absolute inset-0 bg-pulse-violet/20 blur-[15px] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <img src={user.profile_image} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 relative z-10" alt="" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#020617] z-20" />
        </div>
        <h2 className="font-black text-white text-[10px] tracking-[0.2em] uppercase truncate w-full text-center">{user.name}</h2>
        <span className="text-[8px] text-gray-700 font-black uppercase tracking-[0.3em] mt-1 italic">@{user.user_id}</span>
      </div>

      {/* Navigation Rails */}
      <nav className="flex-1 px-4 space-y-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full group relative flex flex-col items-center justify-center py-6 rounded-[2.5rem] transition-all duration-500 overflow-hidden ${
              activeTab === item.id 
                ? 'bg-pulse-violet/10 text-pulse-violet shadow-[inset_0_0_20px_rgba(139,92,246,0.1)] border border-pulse-violet/20' 
                : 'text-gray-700 hover:text-gray-400 hover:bg-white/5 border border-transparent'
            }`}
          >
            {activeTab === item.id && (
                <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-br from-pulse-violet/10 to-transparent"
                />
            )}
            <item.icon size={22} className={`relative z-10 transition-transform duration-500 ${activeTab === item.id ? 'scale-110 drop-shadow-[0_0_10px_#8B5CF6]' : 'group-hover:scale-110'}`} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] mt-3 relative z-10">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Broadcast Branding & Footer */}
      <div className="px-6 py-12 flex flex-col items-center gap-10">
          <div className="flex flex-col items-center opacity-20 group cursor-default">
              <div className="flex gap-1 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 group-hover:bg-pulse-violet animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 group-hover:bg-pulse-violet group-hover:animate-pulse" style={{animationDelay: '0.2s'}} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 group-hover:bg-pulse-violet group-hover:animate-pulse" style={{animationDelay: '0.4s'}} />
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.8em] text-gray-500 ml-2">Pulse OS</span>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-3 py-4 px-6 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 rounded-3xl group transition-all"
          >
            <LogOut size={14} className="text-gray-700 group-hover:text-red-500 transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-700 group-hover:text-red-500 transition-colors">Terminate</span>
          </button>
      </div>
    </div>
  );
};

export default Sidebar;
