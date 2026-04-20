import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Users, UserPlus, Settings, LogOut, Bell } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'chats', icon: MessageSquare, label: 'Messages' },
    { id: 'people', icon: Users, label: 'People' },
    { id: 'requests', icon: Bell, label: 'Requests', badge: true },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-full w-[260px] bg-[#020617] border-r border-white/5 py-8 px-4">
      {/* Profile Section */}
      <div className="flex items-center gap-4 px-2 mb-12">
        <div className="relative">
            <img src={user.profile_image} className="w-12 h-12 rounded-2xl object-cover border border-white/10" alt="" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#020617]" />
        </div>
        <div>
          <h2 className="font-bold text-white text-sm tracking-tight">{user.name}</h2>
          <span className="text-[10px] text-gray-500 font-mono tracking-tighter block opacity-60 mt-0.5">#{user.user_id}</span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Active Now</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${activeTab === item.id ? 'sidebar-item-active text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
          >
            <item.icon size={20} />
            <span className="text-sm font-bold tracking-wide">{item.label}</span>
            {item.badge && (
                <span className="ml-auto bg-pulse-violet text-[10px] text-white font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                    2
                </span>
            )}
          </button>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="space-y-4 pt-8 border-t border-white/5">
        <button 
            className="w-full pulse-button flex items-center justify-center gap-2 bg-gradient-to-r from-pulse-indigo to-pulse-violet shadow-2xl"
        >
            <UserPlus size={18} />
            <span className="text-xs uppercase tracking-widest font-black">Add Friend</span>
        </button>

        <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-300 transition-colors"
        >
            <LogOut size={18} />
            <span className="text-sm font-bold">Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
