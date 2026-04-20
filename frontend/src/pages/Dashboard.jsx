import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import People from './People';
import Settings from './Settings';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Heart, Sparkles, Check, X, Bell, Info, Video, Phone, MoreHorizontal } from 'lucide-react';

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
      const { data } = await axios.get(`http://localhost:5000/api/users/search/${searchId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSearchResults(data);
    } catch (error) {
      setSearchResults(null);
      alert('User not found');
    }
  };

  const sendRequest = async (receiver_id) => {
    try {
      await axios.post('http://localhost:5000/api/friends/request', { receiver_id }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Friend request sent!');
      setSearchResults(null);
      setSearchId('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send request');
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

  const declineRequest = async (request_id) => {
    // Logic for decline if implemented on backend
  };

  const renderRightColumn = () => {
    switch (activeTab) {
      case 'people':
        return <People friends={friends} onChat={(friend) => { setActiveTab('chats'); setSelectedFriend(friend); }} />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex h-full overflow-hidden">
             {/* Middle Column: Activity Hub */}
             <div className="w-[400px] border-r border-white/5 flex flex-col p-6 overflow-hidden bg-[#020617]">
                {/* Search & Requests Section */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                            <form onSubmit={handleSearch}>
                                <input 
                                    type="text" 
                                    placeholder="Enter User ID..."
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    className="w-full bg-[#0B1120]/60 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-pulse-violet/50 outline-none transition-all"
                                />
                            </form>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                            <Bell size={20} className="text-gray-500" />
                            <Video size={20} className="text-gray-500" />
                            <Info size={20} className="text-gray-500" />
                        </div>
                    </div>

                    <AnimatePresence>
                        {searchResults && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 glass rounded-3xl border-pulse-violet/20 flex items-center justify-between mb-6 shadow-2xl"
                            >
                                <div className="flex items-center gap-3">
                                    <img src={searchResults.profile_image} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                    <p className="font-bold text-white text-sm">{searchResults.name}</p>
                                </div>
                                <button onClick={() => sendRequest(searchResults._id)} className="bg-pulse-indigo p-2 rounded-xl text-white hover:bg-pulse-violet transition-colors">
                                    <Check size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Pending Requests</h2>
                    <div className="space-y-4">
                        {pendingRequests.map(req => (
                            <div key={req._id} className="p-5 glass rounded-[2rem] bg-[#0B1120]/40 border-white/5 shadow-lg relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-1 bg-pulse-indigo h-full" />
                                <div className="flex items-center gap-4">
                                    <img src={req.sender_id.profile_image} className="w-12 h-12 rounded-full border-2 border-white/5" alt="" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-white mb-0.5">{req.sender_id.name}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">2mutual friends</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => acceptRequest(req._id)} className="w-8 h-8 bg-pulse-indigo/20 text-pulse-indigo hover:bg-pulse-indigo hover:text-white rounded-lg flex items-center justify-center transition-all">
                                            <Check size={16} />
                                        </button>
                                        <button className="w-8 h-8 bg-white/5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg flex items-center justify-center transition-all">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Conversations */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Recent Conversations</h2>
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 pb-10">
                        {friends.map(friend => (
                            <button
                                key={friend._id}
                                onClick={() => setSelectedFriend(friend)}
                                className={`w-full p-4 rounded-[1.8rem] flex items-center gap-4 transition-all group ${selectedFriend?._id === friend._id ? 'bg-[#1E293B]/40 shadow-inner' : 'hover:bg-white/5'}`}
                            >
                                <div className="relative">
                                    <img src={friend.profile_image} className="w-14 h-14 rounded-full object-cover border border-white/5" alt="" />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-pulse-violet rounded-full border-4 border-[#020617]" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-sm font-bold text-white group-hover:text-pulse-violet transition-colors">{friend.name}</h4>
                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">12M</span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-1">Last message snippet...</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
             </div>

             {/* Right Column: Chat Window or Landing */}
             <main className="flex-1 overflow-hidden relative bg-[#020617]">
                <AnimatePresence mode="wait">
                  {selectedFriend ? (
                    <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                        <ChatWindow friend={selectedFriend} />
                    </motion.div>
                  ) : (
                    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center p-12">
                        <div className="w-64 h-64 bg-[#0B1120] rounded-[4rem] border border-white/5 flex items-center justify-center mb-12 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-pulse-indigo/10 blur-[60px] animate-pulse" />
                            <MessageSquare className="text-pulse-indigo relative z-10" size={48} />
                        </div>
                        <h1 className="text-5xl font-black text-white mb-6 uppercase tracking-tight">Your sanctuary awaits.</h1>
                        <p className="text-gray-500 text-lg mb-10 max-w-sm text-center">Select a friend to begin your encrypted conversation.</p>
                        <button className="flex items-center gap-3 px-8 py-4 bg-pulse-indigo hover:bg-pulse-violet text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_35px_rgba(139,92,246,0.3)] transition-all active:scale-95 text-xs">
                           Explore Community
                        </button>
                    </motion.div>
                  )}
                </AnimatePresence>
             </main>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-hidden">
        {renderRightColumn()}
      </div>
    </div>
  );
};

export default Dashboard;
