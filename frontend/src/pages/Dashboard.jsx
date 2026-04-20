import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import People from './People';
import Settings from './Settings';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MoreVertical, Archive, Check, X, FileText, UserPlus, Sparkles, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Unread', 'Favourites', 'Groups'];

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

  const renderRightColumn = () => {
    switch (activeTab) {
      case 'people':
        return <People friends={friends} onChat={(friend) => { setActiveTab('chats'); setSelectedFriend(friend); }} />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex h-full overflow-hidden bg-[#020617]">
             {/* Middle Column: Conversation List */}
             <div className="w-[400px] border-r border-white/5 flex flex-col bg-[#020617] overflow-hidden">
                {/* Pulse-WhatsApp Header */}
                <div className="h-20 flex items-center justify-between px-6 bg-[#0B1120]/20 border-b border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-pulse-violet/5 blur-[40px] -z-10" />
                   <h1 className="text-xl font-black text-white tracking-tight uppercase">Messages</h1>
                   <div className="flex items-center gap-4 text-gray-500">
                      <Plus size={20} className="cursor-pointer hover:text-pulse-violet transition-colors bg-white/5 p-1 rounded-lg" />
                      <MoreVertical size={20} className="cursor-pointer hover:text-pulse-violet transition-colors bg-white/5 p-1 rounded-lg" />
                   </div>
                </div>

                {/* Pulse Search & Filter Section */}
                <div className="p-4 space-y-5">
                   <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-pulse-violet transition-colors" size={16} />
                      <form onSubmit={handleSearch}>
                        <input 
                            type="text" 
                            placeholder="Find connections..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="pulse-input py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest"
                        />
                      </form>
                   </div>
                   <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar py-1">
                      {filters.map(f => (
                         <button 
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${activeFilter === f ? 'bg-pulse-violet border-pulse-violet text-white shadow-[0_5px_15px_rgba(139,92,246,0.3)]' : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10'}`}
                         >
                            {f}
                         </button>
                      ))}
                   </div>
                </div>

                {/* Search Results Overlay */}
                <AnimatePresence>
                    {searchResults && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-4">
                            <div className="p-4 glass rounded-2xl flex items-center justify-between border-pulse-violet/20 shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-pulse-indigo/5 animate-pulse" />
                                <div className="flex items-center gap-3 relative z-10 text-left">
                                    <img src={searchResults.profile_image} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="" />
                                    <div>
                                        <p className="text-sm font-bold text-white">{searchResults.name}</p>
                                        <p className="text-[9px] text-pulse-violet font-black uppercase tracking-widest">@{searchResults.user_id}</p>
                                    </div>
                                </div>
                                <button onClick={() => sendRequest(searchResults._id)} className="bg-pulse-indigo p-2 rounded-xl text-white hover:bg-pulse-violet transition-colors relative z-10 shadow-lg shadow-pulse-indigo/20">
                                    <Check size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pending Requests Mini-Feed */}
                {pendingRequests.length > 0 && (
                   <div className="px-4 mb-4">
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] mb-4">Sanctuary Alerts</p>
                      <div className="space-y-3">
                         {pendingRequests.map(req => (
                            <div key={req._id} className="p-4 bg-white/5 border border-white/5 rounded-2xl group relative overflow-hidden">
                               <div className="absolute inset-y-0 left-0 w-1 bg-pulse-indigo" />
                               <div className="flex items-center gap-3">
                                  <img src={req.sender_id.profile_image} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                  <div className="flex-1 text-left">
                                     <p className="text-xs font-bold text-white mb-0.5">{req.sender_id.name}</p>
                                     <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest">Incoming Request</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <button onClick={() => acceptRequest(req._id)} className="p-2 bg-pulse-indigo/10 text-pulse-indigo hover:bg-pulse-indigo hover:text-white rounded-lg transition-all"><Check size={14}/></button>
                                     <button className="p-2 bg-white/5 text-gray-600 hover:text-white rounded-lg transition-all"><X size={14}/></button>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
                   <div className="px-4 mb-4"><span className="text-[9px] text-gray-700 font-black uppercase tracking-[0.3em]">Direct Messages</span></div>
                   {friends.map(friend => (
                      <button
                         key={friend._id}
                         onClick={() => setSelectedFriend(friend)}
                         className={`w-full px-6 py-4 flex items-center gap-4 transition-all relative border-b border-white/5 ${selectedFriend?._id === friend._id ? 'bg-pulse-violet/5 group' : 'hover:bg-white/5'}`}
                      >
                         {selectedFriend?._id === friend._id && <div className="absolute inset-y-0 left-0 w-1 bg-pulse-violet" />}
                         <div className="relative">
                            <img src={friend.profile_image} className="w-12 h-12 rounded-[18px] object-cover border border-white/10" alt="" />
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-4 border-[#020617]" />
                         </div>
                         <div className="flex-1 text-left min-w-0">
                            <div className="flex justify-between items-center mb-1">
                               <h4 className={`text-sm font-bold tracking-tight truncate ${selectedFriend?._id === friend._id ? 'text-pulse-violet' : 'text-white'}`}>{friend.name}</h4>
                               <span className="text-[9px] text-gray-600 font-black tracking-widest">1:20 PM</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate leading-relaxed">Encrypted data stream active...</p>
                         </div>
                      </button>
                   ))}
                </div>
             </div>

             {/* Right Column: Chat Sanctuary or Landing Experience */}
             <main className="flex-1 overflow-hidden relative bg-[#0B1120]/10">
                <AnimatePresence mode="wait">
                  {selectedFriend ? (
                    <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                        <ChatWindow friend={selectedFriend} />
                    </motion.div>
                  ) : (
                    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center p-12 text-center relative">
                        {/* Landing Content */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pulse-indigo/5 blur-[120px] rounded-full" />
                        </div>

                        <div className="w-64 h-64 bg-[#0B1120] rounded-[4rem] border border-white/5 flex items-center justify-center mb-12 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <div className="absolute inset-0 bg-gradient-to-br from-pulse-indigo/10 to-pulse-violet/10 animate-glow" />
                            <Sparkles className="text-pulse-violet relative z-10" size={64} fill="currentColor" />
                        </div>
                        <h1 className="text-5xl font-black text-white mb-6 uppercase tracking-tight">Your sanctuary <br/> awaits.</h1>
                        <p className="text-gray-500 text-lg mb-12 max-w-sm font-medium leading-relaxed">
                           Connect to the pulse of your network. Securely, privately, flawlessly.
                        </p>
                        
                        <div className="flex items-center gap-3 text-[10px] text-gray-700 font-black uppercase tracking-[0.4em] bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                            <div className="w-2 h-2 bg-pulse-violet rounded-full animate-pulse shadow-[0_0_8px_#8B5CF6]" />
                            System Active & Encrypted
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
    <div className="flex h-screen bg-[#020617] overflow-hidden font-sans select-none antialiased">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-hidden">
        {renderRightColumn()}
      </div>
    </div>
  );
};

export default Dashboard;
