import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import People from './People';
import Settings from './Settings';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MoreVertical, Archive, Check, X, FileText, UserPlus } from 'lucide-react';

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
          <div className="flex h-full overflow-hidden bg-[#111b21]">
             {/* Middle Column: Conversation List */}
             <div className="w-[400px] border-r border-white/5 flex flex-col bg-[#111b21] overflow-hidden">
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 bg-[#202c33]">
                   <h1 className="text-xl font-bold text-[#e9edef]">WhatsApp</h1>
                   <div className="flex items-center gap-4 text-[#aebac1]">
                      <Plus size={22} className="cursor-pointer hover:bg-white/5 rounded-full p-0.5" />
                      <MoreVertical size={22} className="cursor-pointer hover:bg-white/5 rounded-full p-0.5" />
                   </div>
                </div>

                {/* Search & Filter Section */}
                <div className="p-3 space-y-3">
                   <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696a0] group-focus-within:text-[#00a884]" size={16} />
                      <form onSubmit={handleSearch}>
                        <input 
                            type="text" 
                            placeholder="Search or start a new chat"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="w-full bg-[#202c33] border-none rounded-lg py-2.5 pl-12 pr-4 text-sm text-[#e9edef] focus:outline-none placeholder-[#8696a0]"
                        />
                      </form>
                   </div>
                   <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar py-1">
                      {filters.map(f => (
                         <button 
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeFilter === f ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#202c33] text-[#8696a0] hover:bg-white/5'}`}
                         >
                            {f}
                         </button>
                      ))}
                      <button className="bg-[#202c33] p-1.5 rounded-full text-[#8696a0] hover:bg-white/5 flex-shrink-0">
                         <Plus size={14} />
                      </button>
                   </div>
                </div>

                {/* Search Results Overlay */}
                <AnimatePresence>
                    {searchResults && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-3 pb-4">
                            <div className="bg-[#202c33] rounded-lg p-3 flex items-center justify-between border border-white/5">
                                <div className="flex items-center gap-3">
                                    <img src={searchResults.profile_image} className="w-10 h-10 rounded-full object-cover" alt="" />
                                    <div>
                                        <p className="text-sm font-medium text-white">{searchResults.name}</p>
                                        <p className="text-[10px] text-[#8696a0]">@{searchResults.user_id}</p>
                                    </div>
                                </div>
                                <button onClick={() => sendRequest(searchResults._id)} className="text-[#00a884] hover:bg-white/5 p-2 rounded-full">
                                    <UserPlus size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Archived Row */}
                <div className="px-4 py-3 flex items-center gap-4 text-[#e9edef] hover:bg-[#202c33] cursor-pointer transition-colors mt-1">
                   <Archive size={18} className="text-[#00a884]" />
                   <span className="text-sm font-medium">Archived</span>
                </div>

                {/* Pending Requests Section */}
                {pendingRequests.length > 0 && (
                   <div className="px-4 pt-4">
                      <p className="text-[10px] text-[#8696a0] font-bold uppercase tracking-widest mb-3">Pending Requests</p>
                      <div className="space-y-1">
                         {pendingRequests.map(req => (
                            <div key={req._id} className="flex items-center gap-3 p-3 bg-[#202c33]/50 rounded-lg group">
                               <img src={req.sender_id.profile_image} className="w-10 h-10 rounded-full object-cover" alt="" />
                               <div className="flex-1">
                                  <p className="text-xs font-bold text-white mb-0.5">{req.sender_id.name}</p>
                                  <p className="text-[9px] text-[#8696a0]">New Connect Request</p>
                               </div>
                               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => acceptRequest(req._id)} className="p-1.5 text-[#00a884] hover:bg-white/5 rounded-full"><Check size={16}/></button>
                                  <button className="p-1.5 text-red-500 hover:bg-white/5 rounded-full"><X size={16}/></button>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {/* Conversation Scroll Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar mt-2">
                   {friends.map(friend => (
                      <button
                         key={friend._id}
                         onClick={() => setSelectedFriend(friend)}
                         className={`w-full px-4 py-3 flex items-center gap-4 transition-all border-b border-white/5 hover:bg-[#202c33] ${selectedFriend?._id === friend._id ? 'bg-[#202c33]' : ''}`}
                      >
                         <img src={friend.profile_image} className="w-12 h-12 rounded-full object-cover" alt="" />
                         <div className="flex-1 text-left">
                            <div className="flex justify-between items-center mb-0.5">
                               <h4 className="text-sm font-medium text-[#e9edef] truncate max-w-[180px]">{friend.name}</h4>
                               <span className="text-[10px] text-[#8696a0]">1:20 pm</span>
                            </div>
                            <div className="flex items-center justify-between">
                               <p className="text-xs text-[#8696a0] line-clamp-1">Last seen recently at sanctuary...</p>
                            </div>
                         </div>
                      </button>
                   ))}
                </div>
             </div>

             {/* Right Column: Chat Window or WhatsApp Landing */}
             <main className="flex-1 overflow-hidden relative bg-[#222e35]">
                <AnimatePresence mode="wait">
                  {selectedFriend ? (
                    <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                        <ChatWindow friend={selectedFriend} />
                    </motion.div>
                  ) : (
                    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center p-12 text-center">
                        <div className="flex gap-4 mb-8">
                           <div className="w-20 h-20 bg-[#2b3943] rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/5 cursor-pointer hover:bg-[#374751] transition-all">
                              <FileText size={24} className="#8696a0" />
                              <span className="text-[10px] text-[#8696a0] font-medium">Send document</span>
                           </div>
                           <div className="w-20 h-20 bg-[#2b3943] rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/5 cursor-pointer hover:bg-[#374751] transition-all">
                              <UserPlus size={24} className="#8696a0" />
                              <span className="text-[10px] text-[#8696a0] font-medium">Add contact</span>
                           </div>
                        </div>
                        <h1 className="text-2xl font-light text-[#e9edef] opacity-80">WhatsApp for Windows</h1>
                        <p className="text-xs text-[#8696a0] mt-3 max-w-sm leading-relaxed">
                           Send and receive messages without keeping your phone online.<br/>
                           Pulse end-to-end encrypted sanctuary protection.
                        </p>
                        <div className="absolute bottom-10 text-[10px] text-[#8696a0] flex items-center gap-2 opacity-60 font-medium">
                           <div className="w-3 h-3 border-2 border-[#8696a0] rounded-sm opacity-50" />
                           Your personal messages are end-to-end encrypted
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
    <div className="flex h-screen bg-[#111b21] overflow-hidden font-sans select-none">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-hidden">
        {renderRightColumn()}
      </div>
    </div>
  );
};

export default Dashboard;
