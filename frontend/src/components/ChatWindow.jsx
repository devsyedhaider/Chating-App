import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, Phone, Video, Search, MoreVertical, Check, Info, Bell, Shield, Ban, ChevronRight, MessageSquare, ImageIcon, X, Trash2, CheckCheck, MapPin, Map, SmilePlus } from 'lucide-react';

const socket = io('http://localhost:5000');

const ChatWindow = ({ friend, onMessageRead }) => {
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
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState(null);
  
  const commonEmojis = ['❤️', '😂', '😮', '😢', '😡', '👍', '🔥', '🙌'];
  
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
          // If receiving a message while in chat, mark it as read
          if (data.sender_id._id !== user._id) {
             markAsRead();
          }
        }
      };

      const readReceiptHandler = (data) => {
         if (data.chat_id === chatId) {
            setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
         }
      };

      const reactionHandler = (data) => {
          if (data.chat_id === chatId) {
              setMessages(prev => prev.map(msg => {
                  if (msg._id === data.message_id) {
                      const reactions = msg.reactions || [];
                      const filtered = reactions.filter(r => r.user_id.toString() !== data.user_id.toString());
                      return { ...msg, reactions: [...filtered, { user_id: data.user_id, emoji: data.emoji }] };
                  }
                  return msg;
              }));
          }
      };

      socket.on('receive_message', messageHandler);
      socket.on('messages_read', readReceiptHandler);
      socket.on('receive_reaction', reactionHandler);

      return () => {
        socket.off('receive_message', messageHandler);
        socket.off('messages_read', readReceiptHandler);
        socket.off('receive_reaction', reactionHandler);
      };
    }
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      
      // Mark as read when opening chat
      markAsRead(chat._id);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const markAsRead = async (id = chatId) => {
     if (!id) return;
     try {
        await axios.post('http://localhost:5000/api/messages/read', 
          { chat_id: id },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        socket.emit('mark_read', { chat_id: id, user_id: user._id });
        if (onMessageRead) onMessageRead();
     } catch (error) {
        console.error('Failed to mark as read');
     }
  };

  const handleSendMessage = async (e, customData = {}) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !customData.image_url && !customData.location) || !chatId) return;

    const messageData = {
      chat_id: chatId,
      message_text: newMessage,
      sender_id: user._id,
      timestamp: new Date(),
      isRead: false,
      ...customData
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
        handleSendMessage(null, { image_url: data.url });
    } catch (error) {
        console.error('Failed to upload image');
    } finally {
        setUploading(false);
    }
  };

  const shareLocation = () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            handleSendMessage(null, { 
                location: { 
                    lat: latitude, 
                    lng: longitude,
                    address: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
                } 
            });
        }, (error) => {
            console.error("Error getting location:", error);
            alert("Could not access location. Please ensure permissions are granted.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
  };

  const handleReact = async (messageId, emoji) => {
    try {
        await axios.post('http://localhost:5000/api/messages/react', 
            { message_id: messageId, emoji },
            { headers: { Authorization: `Bearer ${user.token}` } }
        );
        socket.emit('send_reaction', { chat_id: chatId, message_id: messageId, user_id: user._id, emoji });
        setSelectedMessageForReaction(null);
    } catch (error) {
        console.error('Failed to react');
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear this chat?')) {
        setMessages([]);
        setShowMenu(false);
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.message_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#020617] relative overflow-hidden">
      <div className="flex-1 flex flex-col h-full border-r border-white/5 relative">
        {/* Header */}
        <div className="h-20 px-6 flex items-center justify-between bg-[#020617]/40 backdrop-blur-md z-30 border-b border-white/5">
            <AnimatePresence>
                {!showSearch ? (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
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
                    <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: '100%' }} className="flex-1 flex items-center bg-white/5 rounded-2xl px-4 py-2 mr-4">
                        <Search size={16} className="text-pulse-violet mr-3" />
                        <input 
                            type="text" autoFocus placeholder="Search messages..." value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-white text-xs font-bold uppercase tracking-widest w-full"
                        />
                        <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}><X size={16} className="text-gray-500 hover:text-white" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-4 relative">
                <button onClick={() => setShowSearch(!showSearch)} className={`p-3 rounded-2xl transition-all ${showSearch ? 'bg-pulse-violet/10 text-pulse-violet' : 'text-gray-600 hover:text-white'}`}><Search size={20} /></button>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setShowMenu(!showMenu)} className={`p-3 rounded-2xl transition-all ${showMenu ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-white'}`}><MoreVertical size={20} /></button>
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="absolute right-0 mt-2 w-48 bg-[#0B1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1">
                                <button onClick={clearChat} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all rounded-xl"><Trash2 size={16} /> Clear Chat</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar relative">
            {loading ? (
                <div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-2 border-pulse-violet border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="flex flex-col space-y-6 relative z-10">
                    {(searchQuery ? filteredMessages : messages).map((msg, index) => {
                        const isMe = msg.sender_id._id === user._id || msg.sender_id === user._id;
                        return (
                            <motion.div key={msg._id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative mb-4`}>
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%] relative`}>
                                    {/* Reaction Button - Hidden by default, shows on hover */}
                                    <button 
                                        onClick={() => setSelectedMessageForReaction(selectedMessageForReaction === msg._id ? null : msg._id)}
                                        className={`absolute top-0 ${isMe ? '-left-10' : '-right-10'} p-2 rounded-full bg-[#0B1120] border border-white/10 text-gray-500 hover:text-pulse-violet opacity-0 group-hover:opacity-100 transition-opacity z-20`}
                                    >
                                        <SmilePlus size={16} />
                                    </button>

                                    {/* Emojis Picker */}
                                    <AnimatePresence>
                                        {selectedMessageForReaction === msg._id && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.9 }} 
                                                animate={{ opacity: 1, y: 0, scale: 1 }} 
                                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                className={`absolute -top-12 ${isMe ? 'right-0' : 'left-0'} flex gap-1 p-2 bg-[#0B1120] border border-white/10 rounded-2xl shadow-2xl z-50`}
                                            >
                                                {commonEmojis.map(emoji => (
                                                    <button key={emoji} onClick={() => handleReact(msg._id, emoji)} className="hover:scale-125 transition-transform text-lg px-1">{emoji}</button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className={`${isMe ? 'chat-bubble-sender shadow-[0_10px_25px_rgba(139,92,246,0.2)]' : 'chat-bubble-receiver'} relative drop-shadow-2xl overflow-hidden`}>
                                        {msg.message_text && <p className="text-sm font-medium leading-relaxed tracking-wide">{msg.message_text}</p>}
                                        {msg.image_url && <img src={msg.image_url} className="w-full rounded-2xl border border-white/10 shadow-2xl mt-1 max-h-80 object-cover" alt="" />}
                                        {msg.location && (
                                            <div className="mt-2 space-y-3">
                                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                                    <div className="p-2 bg-pulse-indigo/20 rounded-lg text-pulse-indigo"><MapPin size={20} /></div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold text-white uppercase tracking-widest">Shared Location</p>
                                                        <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{msg.location.address}</p>
                                                    </div>
                                                </div>
                                                <a 
                                                    href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="block w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-center transition-all border border-white/5"
                                                >
                                                    Open in Maps
                                                </a>
                                            </div>
                                        )}

                                        {/* Reactions display */}
                                        {msg.reactions && msg.reactions.length > 0 && (
                                            <div className={`flex gap-1 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                {msg.reactions.map((r, i) => (
                                                    <div key={i} className="bg-white/10 backdrop-blur-md rounded-full px-2 py-1 text-sm shadow-sm border border-white/5" title="User reacted">
                                                        {r.emoji}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 px-1">
                                        <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {isMe && (
                                           <span className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${msg.isRead ? 'text-pulse-violet' : 'text-gray-700'}`}>
                                              {msg.isRead ? <CheckCheck size={10} /> : <Check size={10} />}
                                              {msg.isRead ? 'Seen' : 'Not Seen'}
                                           </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            )}
        </div>

        {/* Input */}
        <div className="p-8 pt-4">
            <form onSubmit={handleSendMessage} className="bg-[#0B1120]/60 p-2.5 rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center gap-3 backdrop-blur-xl transition-all">
                <div className="flex items-center gap-1 pl-4">
                    <label className="p-3 text-gray-500 hover:text-white transition-colors cursor-pointer relative group">
                        {uploading ? <div className="w-5 h-5 border-2 border-pulse-violet border-t-transparent rounded-full animate-spin" /> : <ImageIcon size={20} />}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0B1120] text-[8px] font-black uppercase tracking-widest text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">Send Image</span>
                    </label>
                    <button 
                        type="button" 
                        onClick={shareLocation}
                        className="p-3 text-gray-500 hover:text-white transition-colors relative group"
                    >
                        <MapPin size={20} />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0B1120] text-[8px] font-black uppercase tracking-widest text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">Share Location</span>
                    </button>
                    <button type="button" className="p-3 text-gray-500 hover:text-white transition-colors"><Smile size={20} /></button>
                </div>
                <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    placeholder="Type encrypted message..." 
                    className="flex-1 bg-transparent border-none outline-none text-white text-[10px] font-black uppercase tracking-[0.2em] px-2 py-4 placeholder:text-gray-700" 
                />
                <button type="submit" className="p-5 bg-gradient-to-br from-pulse-indigo to-pulse-violet text-white rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all"><Send size={22} /></button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
