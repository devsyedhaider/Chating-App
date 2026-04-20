import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, CircleDot, Users, Bell, Phone, Video, Settings, LogOut, Plus, MoreVertical } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'chats', icon: MessageSquare, label: 'Chats' },
    { id: 'status', icon: CircleDot, label: 'Status' },
    { id: 'people', icon: Users, label: 'Communities' },
    { id: 'requests', icon: Bell, label: 'Notifications' },
  ];

  return (
    <div className="flex flex-col h-full w-[64px] bg-[#202c33] border-r border-white/5 py-4 items-center justify-between z-50">
      <div className="flex flex-col items-center gap-6 w-full">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`p-3 rounded-full transition-all relative group ${activeTab === item.id ? 'bg-white/10 text-[#00a884]' : 'text-[#aebac1] hover:bg-white/5'}`}
          >
            <item.icon size={24} />
            <span className="absolute left-16 bg-[#233138] text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/5">
                {item.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <button 
            onClick={() => onTabChange('settings')}
            className={`p-3 rounded-full transition-all text-[#aebac1] hover:bg-white/5 ${activeTab === 'settings' && 'text-[#00a884]'}`}
        >
            <Settings size={24} />
        </button>
        
        <div className="relative group cursor-pointer" onClick={logout}>
            <img src={user.profile_image} className="w-10 h-10 rounded-full border border-white/10 object-cover" alt="" />
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <LogOut size={16} className="text-white" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
