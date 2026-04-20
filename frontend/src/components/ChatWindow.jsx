import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, Phone, Video, Search, MoreVertical, Check, Info, Bell, Shield, Ban, ChevronRight, MessageSquare, ImageIcon, X, Trash2 } from 'lucide-react';

const socket = io('http://localhost:5000');

const ChatWindow = ({ friend }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  
  const fileInputRef = useRef();
  const scrollRef = useRef();
  const menuRef = useRef();

  useEffect(() => {
    if (friend) {
      setupChat();
    }
  }, [friend]);

  useEffect(() => {
    if (chatId) {
      socket.emit('join_chat', chatId);
      
      const messageHandler = (data) => {
        if (data.chat_id === chatId) {
          setMessages(prev => [...prev, data]);
        }
      };

      socket.on('receive_message', messageHandler);

      return () => {
        socket.off('receive_message', messageHandler);
      };
    }
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const setupChat = async () => {
    setLoading(true);
    try {
      const { data: chat } = await axios.post('http://localhost:5000/api/messages/chat', 
        { receiver_id: friend._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setChatId(chat._id);

      const { data: history } = await axios.get(`http://localhost:5000/api/messages/${chat._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(history);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    const messageData = {
      chat_id: chatId,
      message_text: newMessage,
      sender_id: user._id,
      timestamp: new Date()
    };

    try {
      const { data } = await axios.post('http://localhost:5000/api/messages/send', 
        messageData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      socket.emit('send_message', { 
        ...data, 
        sender_name: user.name, 
        sender_image: user.profile_image 
      });
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}` 
        }
      });
      
      const messageData = {
        chat_id: chatId,
        message_text: '',
        image_url: data.url,
        sender_id: user._id,
        timestamp: new Date()
      };

      const { data: sentMsg } = await axios.post('http://localhost:5000/api/messages/send', 
        messageData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      socket.emit('send_message', { 
        ...sentMsg, 
        sender_name: user.name, 
        sender_image: user.profile_image 
      });
    } catch (error) {
      console.error(error);
    }
    setUploading(false);
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear this chat?')) {
        setMessages([]);
        setShowMenu(false);
        // Note: Full backend implementation would delete messages from DB
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.message_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#020617] relative overflow-hidden">
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col h-full border-r border-white/5 relative">
        {/* Pulse Hybrid Header */}
        <div className="h-20 px-6 flex items-center justify-between bg-[#020617]/40 backdrop-blur-md z-30 border-b border-white/5">
            <AnimatePresence>
                {!showSearch ? (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-4 cursor-pointer"
                    >
                        <div className="relative">
                            <img src={friend.profile_image} className="w-11 h-11 rounded-[16px] object-cover border-2 border-white/5" alt="" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#020617]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white tracking-tight">{friend.name}</h3>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] italic">Active Now</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: '100%' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex-1 flex items-center bg-white/5 rounded-2xl px-4 py-2 mr-4"
                    >
                        <Search size={16} className="text-pulse-violet mr-3" />
                        <input 
                            type="text"
                            autoFocus
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-white text-xs font-bold uppercase tracking-widest w-full"
                        />
                        <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
                            <X size={16} className="text-gray-500 hover:text-white" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-4 relative">
                <button 
                    onClick={() => setShowSearch(!showSearch)}
                    className={`p-3 rounded-2xl transition-all ${showSearch ? 'bg-pulse-violet/10 text-pulse-violet' : 'text-gray-600 hover:text-white'}`}
                >
                    <Search size={20} />
                </button>
                
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className={`p-3 rounded-2xl transition-all ${showMenu ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-white'}`}
                    >
                        <MoreVertical size={20} />
                    </button>
                    
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute right-0 mt-2 w-48 bg-[#0B1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1"
                            >
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-xl">
                                    <Info size={16} /> Contact Info
                                </button>
                                <button 
                                    onClick={clearChat}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all rounded-xl"
                                >
                                    <Trash2 size={16} /> Clear Chat
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar relative">
            <div className="absolute inset-0 bg-gradient-to-b from-pulse-violet/5 to-transparent pointer-events-none opacity-20" />
            
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="w-10 h-10 border-2 border-pulse-violet border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex flex-col space-y-6 relative z-10">
                    {searchQuery && (
                        <div className="text-center mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-pulse-violet bg-pulse-violet/10 px-4 py-2 rounded-lg">
                                {filteredMessages.length} results found for "{searchQuery}"
                            </span>
                        </div>
                    )}

                    {(searchQuery ? filteredMessages : messages).map((msg, index) => {
                        const isMe = msg.sender_id._id === user._id || msg.sender_id === user._id;
                        return (
                            <motion.div 
                                key={msg._id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                    <div className={`${isMe ? 'chat-bubble-sender' : 'chat-bubble-receiver'} relative drop-shadow-2xl overflow-hidden`}>
                                        {msg.message_text && (
                                            <p className="text-sm font-medium leading-relaxed tracking-wide">
                                                {msg.message_text}
                                            </p>
                                        )}
                                        {msg.image_url && <img src={msg.image_url} className="w-full rounded-2xl border border-white/10 shadow-2xl mt-1" alt="" />}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 px-1">
                                        <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            )}
        </div>

        {/* Input Sanctuary */}
        <div className="p-8 pt-4">
            <div className="bg-[#0B1120]/60 p-2.5 rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center gap-3 backdrop-blur-xl transition-all">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current.click()} className="p-4 bg-[#020617] rounded-3xl text-gray-500 hover:text-white transition-all">
                    <Paperclip size={20} className="-rotate-45" />
                </button>
                <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-3">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none outline-none text-white text-[11px] font-bold uppercase tracking-widest px-2 py-4"
                    />
                    <button 
                        type="submit"
                        className="p-5 bg-gradient-to-br from-pulse-indigo to-pulse-violet text-white rounded-[2rem] shadow-2xl transition-all active:scale-90"
                    >
                        <Send size={22} />
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
