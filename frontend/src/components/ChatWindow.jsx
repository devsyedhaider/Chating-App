import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, Phone, Video, Search, MoreVertical, Check, Info, Bell, Shield, Ban, ChevronRight, MessageSquare, ImageIcon, X, Trash2, CheckCheck, MapPin, Map, SmilePlus, ArrowLeft } from 'lucide-react';

const socket = io('http://localhost:5000');

const ChatWindow = ({ friend, onMessageRead, onBack }) => {
  const { user } = useAuth();
  const { initiateCall } = useCall();
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
        <div className="h-16 md:h-20 px-4 md:px-6 flex items-center justify-between bg-[#020617]/40 backdrop-blur-md z-30 border-b border-white/5">
            <AnimatePresence>
                {!showSearch ? (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 md:gap-4 overflow-hidden">
                        <button onClick={onBack} className="md:hidden p-2 -ml-1 text-gray-500 hover:text-white shrink-0">
                            <ArrowLeft size={18} />
                        </button>
                        <div className="relative shrink-0">
                            <img src={friend.profile_image} className="w-9 h-9 md:w-11 md:h-11 rounded-[14px] md:rounded-[16px] object-cover border-2 border-white/5" alt="" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-[3px] md:border-4 border-[#020617]" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-xs md:text-sm font-bold text-white tracking-tight truncate">{friend.name}</h3>
                            <p className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] italic truncate">Active Now</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: '100%' }} className="flex-1 flex items-center bg-white/5 rounded-2xl px-3 md:px-4 py-1.5 md:py-2 mr-4">
                        <Search size={14} className="text-pulse-violet mr-2 md:mr-3" />
                        <input 
                            type="text" autoFocus placeholder="Search..." value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-white text-[10px] md:text-xs font-bold uppercase tracking-widest w-full"
                        />
                        <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}><X size={14} className="text-gray-500 hover:text-white" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-2 md:gap-4 relative">
                <div className="flex items-center bg-white/5 rounded-2xl p-1 gap-1 border border-white/5 shrink-0">
                    <button 
                        onClick={() => initiateCall(friend, 'voice')}
                        className="p-2.5 md:p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all relative group"
                    >
                        <Phone className="w-4.5 h-4.5 md:w-5 md:h-5" />
                        <span className="hidden md:block absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#0B1120] text-[8px] font-black uppercase tracking-widest text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 z-50">Voice Call</span>
                    </button>
                    <button 
                        onClick={() => initiateCall(friend, 'video')}
                        className="p-2.5 md:p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all relative group"
                    >
                        <Video className="w-4.5 h-4.5 md:w-5 md:h-5" />
                        <span className="hidden md:block absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#0B1120] text-[8px] font-black uppercase tracking-widest text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 z-50">Video Call</span>
                    </button>
                </div>

                <button onClick={() => setShowSearch(!showSearch)} className={`hidden md:block p-2.5 md:p-3 rounded-2xl transition-all ${showSearch ? 'bg-pulse-violet/10 text-pulse-violet' : 'text-gray-600 hover:text-white'}`}><Search className="w-4.5 h-4.5 md:w-5 md:h-5" /></button>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setShowMenu(!showMenu)} className={`p-2.5 md:p-3 rounded-2xl transition-all ${showMenu ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-white'}`}><MoreVertical size={18} className="md:size-[20px]" /></button>
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="absolute right-0 mt-2 w-40 md:w-48 bg-[#0B1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1">
                                <button onClick={clearChat} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] md:text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all rounded-xl"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> Clear Chat</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6 custom-scrollbar relative">
            {loading ? (
                <div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-2 border-pulse-violet border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="flex flex-col space-y-4 md:space-y-6 relative z-10">
                    {(searchQuery ? filteredMessages : messages).map((msg, index) => {
                        const isMe = msg.sender_id._id === user._id || msg.sender_id === user._id;
                        return (
                            <motion.div key={msg._id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative mb-2 md:mb-4`}>
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%] relative`}>
                                    {/* Reaction Button */}
                                    <button 
                                        onClick={() => setSelectedMessageForReaction(selectedMessageForReaction === msg._id ? null : msg._id)}
                                        className={`absolute top-0 ${isMe ? '-left-8 md:-left-10' : '-right-8 md:-right-10'} p-1.5 md:p-2 rounded-full bg-[#0B1120] border border-white/10 text-gray-500 hover:text-pulse-violet opacity-0 group-hover:opacity-100 transition-opacity z-20`}
                                    >
                                        <SmilePlus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </button>

                                    {/* Emojis Picker */}
                                    <AnimatePresence>
                                        {selectedMessageForReaction === msg._id && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.9 }} 
                                                animate={{ opacity: 1, y: 0, scale: 1 }} 
                                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                className={`absolute -top-12 ${isMe ? 'right-0' : 'left-0'} flex gap-0.5 md:gap-1 p-1.5 md:p-2 bg-[#0B1120] border border-white/10 rounded-xl md:rounded-2xl shadow-2xl z-50 overflow-x-auto`}
                                            >
                                                {commonEmojis.map(emoji => (
                                                    <button key={emoji} onClick={() => handleReact(msg._id, emoji)} className="hover:scale-125 transition-transform text-base md:text-lg px-1">{emoji}</button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className={`${isMe ? 'chat-bubble-sender shadow-[0_10px_25px_rgba(139,92,246,0.2)]' : 'chat-bubble-receiver'} relative drop-shadow-2xl overflow-hidden`}>
                                        {msg.message_text && <p className="text-[12px] md:text-sm font-medium leading-relaxed tracking-wide">{msg.message_text}</p>}
                                        {msg.image_url && <img src={msg.image_url} className="w-full rounded-xl md:rounded-2xl border border-white/10 shadow-2xl mt-1 max-h-60 md:max-h-80 object-cover" alt="" />}
                                        {msg.location && (
                                            <div className="mt-2 space-y-2 md:space-y-3">
                                                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/5 rounded-xl border border-white/5">
                                                    <div className="p-1.5 md:p-2 bg-pulse-indigo/20 rounded-lg text-pulse-indigo"><MapPin className="w-4 h-4 md:w-5 md:h-5" /></div>
                                                    <div className="text-left min-w-0">
                                                        <p className="text-[8px] md:text-xs font-bold text-white uppercase tracking-widest truncate">Shared Location</p>
                                                        <p className="text-[8px] md:text-[10px] text-gray-500 truncate max-w-[120px] md:max-w-[150px]">{msg.location.address}</p>
                                                    </div>
                                                </div>
                                                <a 
                                                    href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="block w-full py-2 md:py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-center transition-all border border-white/5"
                                                >
                                                    Open in Maps
                                                </a>
                                            </div>
                                        )}

                                        {/* Reactions display */}
                                        {msg.reactions && msg.reactions.length > 0 && (
                                            <div className={`flex gap-1 mt-1.5 md:mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                {msg.reactions.map((r, i) => (
                                                    <div key={i} className="bg-white/10 backdrop-blur-md rounded-full px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-sm shadow-sm border border-white/5" title="User reacted">
                                                        {r.emoji}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5 md:mt-2 px-1">
                                        <span className="text-[8px] md:text-[9px] text-gray-700 font-black uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {isMe && (
                                           <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${msg.isRead ? 'text-pulse-violet' : 'text-gray-700'}`}>
                                              {msg.isRead ? <CheckCheck className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <Check className="w-2.5 h-2.5 md:w-3 md:h-3" />}
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
        <div className="p-4 md:p-8 md:pt-4">
            <form onSubmit={handleSendMessage} className="bg-[#0B1120]/60 p-1.5 md:p-2.5 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center gap-2 md:gap-3 backdrop-blur-xl transition-all">
                <div className="flex items-center gap-0.5 pl-2 md:pl-4">
                    <label className="p-2 md:p-3 text-gray-500 hover:text-white transition-colors cursor-pointer relative group">
                        {uploading ? <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-pulse-violet border-t-transparent rounded-full animate-spin" /> : <ImageIcon className="w-4.5 h-4.5 md:w-5 md:h-5" />}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                        <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0B1120] text-[8px] font-black uppercase tracking-widest text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">Send Image</span>
                    </label>
                    <button 
                        type="button" 
                        onClick={shareLocation}
                        className="p-2 md:p-3 text-gray-500 hover:text-white transition-colors relative group"
                    >
                        <MapPin className="w-4.5 h-4.5 md:w-5 md:h-5" />
                        <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0B1120] text-[8px] font-black uppercase tracking-widest text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">Share Location</span>
                    </button>
                    <button type="button" className="p-2 md:p-3 text-gray-500 hover:text-white transition-colors"><Smile className="w-4.5 h-4.5 md:w-5 md:h-5" /></button>
                </div>
                <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    placeholder="Message..." 
                    className="flex-1 bg-transparent border-none outline-none text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] px-1 md:px-2 py-3 md:py-4 placeholder:text-gray-700" 
                />
                <button type="submit" className="p-3.5 md:p-5 bg-gradient-to-br from-pulse-indigo to-pulse-violet text-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all shrink-0">
                    <Send className="w-4.5 h-4.5 md:w-5.5 md:h-5.5" />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
