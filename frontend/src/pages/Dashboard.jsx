import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import People from './People';
import Settings from './Settings';
import Requests from './Requests'; // New Import
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
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  const filters = ['All', 'Unread'];

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
    const interval = setInterval(() => {
        fetchFriends();
        fetchPendingRequests();
    }, 10000);
    return () => clearInterval(interval);
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
      setIsAddingFriend(false);
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

  const filteredFriends = activeFilter === 'Unread' 
    ? friends.filter(f => f.unreadCount > 0)
    : friends;

  const renderRightColumn = () => {
    switch (activeTab) {
      case 'people':
        return <People friends={friends} onChat={(friend) => { setActiveTab('chats'); setSelectedFriend(friend); }} />;
      case 'requests':
        return <Requests pendingRequests={pendingRequests} onAccept={acceptRequest} onDecline={() => {}} />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex h-full overflow-hidden bg-[#020617]">
             <div className="w-[400px] border-r border-white/5 flex flex-col bg-[#020617] overflow-hidden">
                {/* Dynamic Header */}
                <div className="h-20 flex items-center justify-between px-6 bg-[#0B1120]/20 border-b border-white/5 relative overflow-hidden">
                   <AnimatePresence mode="wait">
                      {!isAddingFriend ? (
                        <motion.div 
                            key="title"
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="flex-1 flex justify-between items-center"
                        >
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Messages</h1>
                            <div className="flex items-center gap-4 text-gray-500">
                                <Plus 
                                    size={20} 
                                    onClick={() => setIsAddingFriend(true)}
                                    className="cursor-pointer hover:text-pulse-violet transition-colors bg-white/5 p-1 rounded-lg" 
                                />
                                <MoreVertical size={20} className="cursor-pointer hover:text-pulse-violet transition-colors bg-white/5 p-1 rounded-lg" />
                            </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                            key="search"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="flex-1 flex items-center gap-3"
                        >
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pulse-violet" />
                                <form onSubmit={handleSearch}>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        placeholder="Enter Pulse ID..."
                                        value={searchId}
                                        onChange={(e) => setSearchId(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-pulse-violet/50 transition-all"
                                    />
                                </form>
                            </div>
                            <X 
                                size={20} 
                                onClick={() => { setIsAddingFriend(false); setSearchResults(null); setSearchId(''); }}
                                className="cursor-pointer text-gray-600 hover:text-white transition-colors" 
                            />
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>

                <div className="p-4 space-y-5">
                   <AnimatePresence>
                        {searchResults && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pb-4">
                                <div className="p-4 glass rounded-2xl flex items-center justify-between border-pulse-violet/20 shadow-2xl relative overflow-hidden bg-pulse-violet/5">
                                    <div className="flex items-center gap-3 text-left">
                                        <img src={searchResults.profile_image} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="" />
                                        <div>
                                            <p className="text-sm font-bold text-white">{searchResults.name}</p>
                                            <p className="text-[9px] text-pulse-violet font-black uppercase tracking-widest">@{searchResults.user_id}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => sendRequest(searchResults._id)} className="bg-pulse-indigo p-2 rounded-xl text-white hover:bg-pulse-violet transition-colors relative z-10 shadow-lg shadow-pulse-indigo/20">
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                   <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                      {filters.map(f => (
                         <button 
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${activeFilter === f ? 'bg-pulse-violet border-pulse-violet text-white shadow-[0_5px_15px_rgba(139,92,246,0.3)]' : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10'}`}
                         >
                            {f}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
                   {filteredFriends.map(friend => (
                      <button
                         key={friend._id}
                         onClick={() => {
                            setSelectedFriend(friend);
                            setFriends(prev => prev.map(f => f._id === friend._id ? { ...f, unreadCount: 0 } : f));
                         }}
                         className={`w-full px-6 py-4 flex items-center gap-4 transition-all relative border-b border-white/5 ${selectedFriend?._id === friend._id ? 'bg-pulse-violet/5' : 'hover:bg-white/5'}`}
                      >
                         {selectedFriend?._id === friend._id && <div className="absolute inset-y-0 left-0 w-1 bg-pulse-violet" />}
                         <div className="relative">
                            <img src={friend.profile_image} className="w-12 h-12 rounded-[18px] object-cover border border-white/10" alt="" />
                            {friend.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 bg-pulse-violet text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_10px_#8B5CF6] border-2 border-[#020617]">
                                    {friend.unreadCount}
                                </div>
                            )}
                         </div>
                         <div className="flex-1 text-left min-w-0">
                            <div className="flex justify-between items-center mb-1">
                               <h4 className={`text-sm font-bold tracking-tight truncate ${friend.unreadCount > 0 ? 'text-white' : 'text-gray-400'}`}>{friend.name}</h4>
                               <span className="text-[9px] text-gray-600 font-black">
                                  {friend.lastMessage ? new Date(friend.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '1:20 PM'}
                               </span>
                            </div>
                            <p className={`text-xs truncate ${friend.unreadCount > 0 ? 'text-gray-300 font-bold' : 'text-gray-600'}`}>
                                {friend.lastMessage ? friend.lastMessage.text : 'Encrypted data stream active...'}
                            </p>
                         </div>
                      </button>
                   ))}
                </div>
             </div>

             <main className="flex-1 overflow-hidden relative bg-[#0B1120]/10">
                <AnimatePresence mode="wait">
                  {selectedFriend ? (
                    <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                        <ChatWindow friend={selectedFriend} onMessageRead={() => fetchFriends()} />
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center relative">
                        <div className="w-64 h-64 bg-[#0B1120] rounded-[4rem] border border-white/5 flex items-center justify-center mb-12 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <div className="absolute inset-0 bg-gradient-to-br from-pulse-indigo/10 to-pulse-violet/10 animate-glow" />
                            <Sparkles className="text-pulse-violet relative z-10" size={64} fill="currentColor" />
                        </div>
                        <h1 className="text-5xl font-black text-white mb-6 uppercase tracking-tight">Your sanctuary <br/> awaits.</h1>
                        <p className="text-gray-500 text-lg mb-12 max-w-sm font-medium leading-relaxed">
                           Connect to the pulse of your network. Securely, privately, flawlessly.
                        </p>
                    </div>
                  )}
                </AnimatePresence>
             </main>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden font-sans select-none antialiased">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} pendingCount={pendingRequests.length} />
      <div className="flex-1 overflow-hidden">
        {renderRightColumn()}
      </div>
    </div>
  );
};

export default Dashboard;
