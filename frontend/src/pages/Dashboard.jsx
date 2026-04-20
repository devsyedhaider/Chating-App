import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import People from './People';
import Settings from './Settings';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Heart, Sparkles, Check, X, Bell, Info, Video, Phone, MoreHorizontal, Zap, Radio, Users } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/friends/list', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setFriends(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/friends/requests/pending', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPendingRequests(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/users/search/${searchId.toLowerCase()}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSearchResults(data);
    } catch (error) {
      setSearchResults(null);
      // alert('User not found');
    }
  };

  const sendRequest = async (receiver_id) => {
    try {
      await axios.post('http://localhost:5000/api/friends/request', { receiver_id }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSearchResults(null);
      setSearchId('');
    } catch (error) {
      console.error(error);
    }
  };

  const acceptRequest = async (request_id) => {
    try {
      await axios.post('http://localhost:5000/api/friends/accept', { request_id }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchFriends();
      fetchPendingRequests();
    } catch (error) {
       console.error(error);
    }
  };

  const renderRightColumn = () => {
    switch (activeTab) {
      case 'people':
        return <People friends={friends} onChat={(friend) => { setActiveTab('chats'); setSelectedFriend(friend); }} />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex h-full overflow-hidden relative">
             {/* Middle Column: Activity Hub */}
             <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-[420px] border-r border-white/5 flex flex-col p-8 overflow-hidden bg-[#020617]/40 backdrop-blur-3xl z-10"
             >
                {/* Search & Global Controls */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-10">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-pulse-violet transition-colors" size={18} />
                            <form onSubmit={handleSearch}>
                                <input 
                                    type="text" 
                                    placeholder="Enter @pulse_id..."
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    className="w-full bg-[#0B1120]/60 border border-white/5 rounded-3xl py-4 pl-12 pr-4 text-sm text-white focus:border-pulse-violet/30 outline-none transition-all placeholder:text-gray-700 font-mono tracking-tight"
                                />
                            </form>
                        </div>
                    </div>

                    <AnimatePresence>
                        {searchResults && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="p-5 glass rounded-[2.5rem] border-pulse-violet/20 flex items-center justify-between mb-10 shadow-[0_20px_50px_rgba(139,92,246,0.1)] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-pulse-violet/5 animate-pulse" />
                                <div className="flex items-center gap-4 relative">
                                    <div className="relative">
                                        <img src={searchResults.profile_image} className="w-12 h-12 rounded-[1.2rem] object-cover border border-white/10" alt="" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-pulse-violet rounded-full border-2 border-[#0B1120]" />
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-sm tracking-tight uppercase">{searchResults.name}</p>
                                        <p className="text-[10px] text-gray-500 font-mono">@{searchResults.user_id}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => sendRequest(searchResults._id)} 
                                    className="bg-pulse-indigo p-3 rounded-2xl text-white hover:bg-pulse-violet transition-all active:scale-90 relative shadow-lg shadow-pulse-indigo/20"
                                >
                                    <Zap size={18} fill="currentColor" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick Stats/Moods */}
                    <div className="flex gap-4 mb-10">
                        <div className="flex-1 p-4 rounded-3xl bg-[#0B1120]/40 border border-white/5 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-pulse-violet/30 transition-all">
                             <Radio size={16} className="text-pulse-violet" />
                             <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">Broadcast</span>
                        </div>
                        <div className="flex-1 p-4 rounded-3xl bg-[#0B1120]/40 border border-white/5 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-pulse-violet/30 transition-all">
                             <Users size={16} className="text-pulse-indigo" />
                             <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">Tribes</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-pulse-violet shadow-[0_0_8px_#8B5CF6]" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Global Requests</h2>
                    </div>
                    
                    <div className="space-y-5">
                       {pendingRequests.length === 0 ? (
                           <div className="py-10 text-center bg-[#0B1120]/20 rounded-[2.5rem] border border-dashed border-white/5">
                               <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.3em]">No incoming pulse signals</p>
                           </div>
                       ) : (
                        pendingRequests.map((req, idx) => (
                            <motion.div 
                                key={req._id} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-5 glass rounded-[2.2rem] bg-[#0B1120]/60 border-white/5 shadow-2xl relative group overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-1 bg-gradient-to-b from-pulse-indigo to-pulse-violet h-full opacity-30 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4">
                                    <img src={req.sender_id.profile_image} className="w-14 h-14 rounded-[1.5rem] border-2 border-white/5 object-cover" alt="" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-white mb-1 uppercase tracking-tight">{req.sender_id.name}</h4>
                                        <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Wants to Connect</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => acceptRequest(req._id)} className="w-10 h-10 bg-pulse-indigo/20 text-pulse-indigo hover:bg-pulse-indigo hover:text-white rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-90">
                                            <Check size={18} />
                                        </button>
                                        <button className="w-10 h-10 bg-white/5 text-gray-700 hover:bg-red-500/10 hover:text-red-500 rounded-xl flex items-center justify-center transition-all active:scale-90">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                       )}
                    </div>
                </div>

                {/* Recent Conversations */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-pulse-indigo shadow-[0_0_8px_#6366F1]" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Live Channels</h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-3 pb-10">
                        {friends.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                <Radio size={32} className="text-gray-500 mb-4 animate-pulse" />
                                <p className="text-[10px] text-center font-black uppercase tracking-[0.3em]">No Active <br/> Frequencies</p>
                            </div>
                        ) : (
                            friends.map((friend, idx) => (
                                <motion.button
                                    key={friend._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedFriend(friend)}
                                    className={`w-full p-5 rounded-[2.5rem] flex items-center gap-5 transition-all group relative overflow-hidden ${selectedFriend?._id === friend._id ? 'bg-[#1E293B]/40 shadow-[inset_0_2px_10px_rgba(255,255,255,0.02)]' : 'hover:bg-white/5'}`}
                                >
                                    {selectedFriend?._id === friend._id && (
                                        <motion.div layoutId="active-bg" className="absolute inset-0 bg-pulse-indigo/5" />
                                    )}
                                    <div className="relative z-10">
                                        <img src={friend.profile_image} className="w-14 h-14 rounded-[1.8rem] object-cover border border-white/5 group-hover:scale-105 transition-transform duration-500" alt="" />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-pulse-violet rounded-full border-4 border-[#020617] group-hover:animate-ping" />
                                    </div>
                                    <div className="flex-1 text-left relative z-10">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-sm font-black text-white group-hover:text-pulse-violet transition-colors uppercase tracking-tight">{friend.name}</h4>
                                            <span className="text-[9px] text-gray-700 font-black uppercase tracking-[0.2em] group-hover:text-pulse-indigo">12M</span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-1 opacity-60 font-medium">Secured channel established...</p>
                                    </div>
                                </motion.button>
                            ))
                        )}
                    </div>
                </div>
             </motion.div>

             {/* Right Column: Chat Window or Landing */}
             <main className="flex-1 overflow-hidden relative bg-[#020617] flex">
                <AnimatePresence mode="wait">
                  {selectedFriend ? (
                    <motion.div 
                        key="chat" 
                        initial={{ opacity: 0, scale: 1.05 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }} 
                        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                        className="flex-1"
                    >
                        <ChatWindow friend={selectedFriend} />
                    </motion.div>
                  ) : (
                    <motion.div 
                        key="landing" 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="flex-1 flex flex-col items-center justify-center p-12 relative overflow-hidden"
                    >
                        {/* Interactive Background Elements */}
                        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pulse-violet/5 blur-[180px] -z-0 animate-glow" />
                        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-pulse-indigo/5 blur-[180px] -z-0" />

                        <div className="relative z-10 flex flex-col items-center max-w-2xl text-center">
                            <motion.div 
                                animate={{ y: [0, -15, 0], rotate: [0, 2, -2, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="w-72 h-72 bg-[#0B1120] rounded-[4.5rem] border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.5)] mb-16 flex items-center justify-center relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-pulse-indigo/20 to-pulse-violet/20 blur-[60px] opacity-20 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="relative">
                                    <div className="w-28 h-28 bg-pulse-indigo/10 rounded-[3rem] flex items-center justify-center relative backdrop-blur-3xl border border-white/5">
                                        <MessageSquare className="text-pulse-indigo" size={56} strokeWidth={1} />
                                        <motion.div 
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute -top-10 -right-10 w-16 h-16 bg-pulse-violet/10 rounded-full flex items-center justify-center shadow-2xl border border-white/5"
                                        >
                                            <Heart className="text-pulse-violet" size={24} fill="currentColor" opacity={0.5} />
                                        </motion.div>
                                        <div className="absolute -bottom-8 -left-12 w-20 h-20 bg-[#0B1120]/80 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/5 backdrop-blur-md">
                                            <Sparkles className="text-pulse-indigo" size={32} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <h1 className="text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9] uppercase italic">The Sanctuary<br/>is Yours.</h1>
                            <p className="text-gray-500 text-xl mb-12 max-w-md mx-auto leading-relaxed font-medium opacity-80">
                                Enter the nocturnal pulse of your community. Your private sanctuary is encrypted and synchronized.
                            </p>

                            <div className="flex gap-6">
                                <button className="pulse-button flex items-center gap-4">
                                   <Radio size={20} /> Tune In
                                </button>
                                <button 
                                    onClick={() => setActiveTab('people')}
                                    className="px-10 py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-bold uppercase tracking-[0.3em] rounded-2xl border border-white/5 transition-all text-[10px] active:scale-95"
                                >
                                   Expand Network
                                </button>
                            </div>

                            <div className="mt-24 space-y-2 opacity-30">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-12 h-px bg-gray-700" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.8em] text-gray-700">AES-256 SECURED</span>
                                    <div className="w-12 h-px bg-gray-700" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </main>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden font-sans selection:bg-pulse-violet selection:text-white">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-hidden relative">
          {/* Subtle noise/grain effect for texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50 overflow-hidden" />
          {renderRightColumn()}
      </div>
    </div>
  );
};

export default Dashboard;
