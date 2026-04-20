import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, LogOut, MessageSquare, Bell } from 'lucide-react';

const Sidebar = ({ onSelectFriend, selectedFriend }) => {
  const { user, logout } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('chats'); // chats or friends or requests

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

  return (
    <div className="flex flex-col h-full bg-dark w-80 border-r border-white/5">
      {/* User Info Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={user.profile_image} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="" />
          <div>
            <h2 className="font-bold text-white text-sm">{user.name}</h2>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{user.user_id}</p>
          </div>
        </div>
        <button onClick={logout} className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-all">
          <LogOut size={18} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by User ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-surface/50 rounded-xl border border-white/5 text-sm focus:border-indigo-500 outline-none transition-all"
          />
        </form>
      </div>

      {/* Search Result Dropdown */}
      <AnimatePresence>
        {searchResults && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mx-4 mb-4 p-4 glass rounded-2xl flex items-center justify-between shadow-2xl"
          >
            <div className="flex items-center gap-3">
               <img src={searchResults.profile_image} className="w-10 h-10 rounded-lg" alt="" />
               <p className="text-sm font-medium">{searchResults.name}</p>
            </div>
            <button 
              onClick={() => sendRequest(searchResults._id)}
              className="p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-all"
            >
              <UserPlus size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex px-4 mb-2">
        <button 
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'chats' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500'}`}
        >
          Chats
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'requests' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500'}`}
        >
          Requests ({pendingRequests.length})
        </button>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {activeTab === 'chats' ? (
          <div className="space-y-1">
            {friends.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-10">No friends yet. <br/> Search by ID to add!</p>
            ) : (
              friends.map(friend => (
                <button
                  key={friend._id}
                  onClick={() => onSelectFriend(friend)}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${selectedFriend?._id === friend._id ? 'bg-indigo-600/20 border-l-4 border-indigo-600' : 'hover:bg-white/5'}`}
                >
                  <img src={friend.profile_image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{friend.name}</h3>
                    <p className="text-xs text-gray-500 truncate mt-0.5">Click to chat</p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3 px-2">
            {pendingRequests.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-10">No pending requests</p>
            ) : (
              pendingRequests.map(request => (
                <div key={request._id} className="p-4 glass rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={request.sender_id.profile_image} className="w-10 h-10 rounded-xl" alt="" />
                    <p className="text-sm font-bold truncate">{request.sender_id.name}</p>
                  </div>
                  <button 
                    onClick={() => acceptRequest(request._id)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20"
                  >
                    Accept
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
