import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Smile, Phone, Video, MoreHorizontal, MessageSquare, Paperclip, Info, ChevronRight, Bell, Shield, Ban, Lock, Zap, Music, FileText, Share2 } from 'lucide-react';

const socket = io('http://localhost:5000');

const ChatWindow = ({ friend }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const fileInputRef = useRef();
  const scrollRef = useRef();

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
      alert('Failed to upload image');
    }
    setUploading(false);
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#020617] relative">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pulse-indigo/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col h-full border-r border-white/5 relative z-10">
        {/* Header: Atmospheric Control Bar */}
        <div className="h-24 px-10 flex items-center justify-between border-b border-white/5 bg-[#020617]/40 backdrop-blur-3xl">
            <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-pulse-violet/20 blur-[15px] opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                    <img src={friend.profile_image} className="w-14 h-14 rounded-[1.8rem] border-2 border-white/10 relative z-10 object-cover" alt="" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-pulse-violet rounded-full border-4 border-[#020617] z-20" />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none mb-1.5">{friend.name}</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-pulse-violet animate-pulse shadow-[0_0_8px_#8B5CF6]" />
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">Encrypted Session Active</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                    <button className="p-3 text-gray-500 hover:text-white transition-all hover:bg-white/5 rounded-xl"><Video size={18} /></button>
                    <button className="p-3 text-gray-500 hover:text-white transition-all hover:bg-white/5 rounded-xl"><Phone size={18} /></button>
                </div>
                <button 
                  onClick={() => setShowInfo(!showInfo)}
                  className={`p-4 transition-all duration-500 rounded-2xl border ${showInfo ? 'text-pulse-violet bg-pulse-violet/10 border-pulse-violet/20' : 'text-gray-500 hover:text-white bg-white/5 border-white/5 hover:border-white/10'}`}
                >
                    <Info size={20} />
                </button>
            </div>
        </div>

        {/* Messages: Cinematic List */}
        <div className="flex-1 overflow-y-auto px-12 py-10 space-y-8 custom-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30">
                    <div className="w-10 h-10 border-2 border-pulse-violet border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Pulse</p>
                </div>
            ) : (
                <div className="flex flex-col space-y-8">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-px w-12 bg-white/5" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-700">Digital Handshake Established</span>
                        <div className="h-px w-12 bg-white/5" />
                    </div>
                    
                    <AnimatePresence initial={false}>
                        {messages.map((msg, index) => {
                            const isMe = msg.sender_id._id === user._id || msg.sender_id === user._id;
                            return (
                                <motion.div 
                                    key={msg._id || index}
                                    initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[65%]`}>
                                        <div className={`${isMe ? 'chat-bubble-sender' : 'chat-bubble-receiver'} relative group cursor-pointer transition-transform active:scale-[0.98]`}>
                                            {isMe && (
                                                <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Lock size={12} className="text-pulse-violet/40" />
                                                </div>
                                            )}
                                            {msg.message_text && <p className="text-sm leading-relaxed tracking-wide font-medium">{msg.message_text}</p>}
                                            {msg.image_url && (
                                                <div className="relative overflow-hidden rounded-[1.5rem] mt-1 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
                                                    <img src={msg.image_url} className="w-full hover:scale-105 transition-transform duration-700" alt="" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            )}
                                            
                                            {/* Pulse Indicator overlay */}
                                            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Zap size={10} className="text-white fill-white animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 px-2">
                                            <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isMe && <Check size={10} className="text-pulse-violet opacity-40" />}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    <div ref={scrollRef} />
                </div>
            )}
        </div>

        {/* Input Bar: The Cockpit */}
        <div className="p-10 z-20 relative">
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" />
            <form onSubmit={handleSendMessage} className="bg-[#0B1120]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-3 pl-8 flex items-center gap-5 shadow-[0_30px_70px_rgba(0,0,0,0.4)] relative group focus-within:border-pulse-violet/30 transition-all">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <div className="flex items-center gap-2">
                    <button 
                    type="button" 
                    onClick={() => fileInputRef.current.click()}
                    className="p-3 text-gray-600 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5"
                    >
                        <Paperclip size={18} />
                    </button>
                    <button type="button" className="p-3 text-gray-600 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5">
                        <Smile size={18} />
                    </button>
                </div>
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Exchange Pulse signals..."
                    className="flex-1 bg-transparent border-none outline-none text-white text-sm font-medium px-4 placeholder:text-gray-700 tracking-wide"
                />
                <button 
                    type="submit"
                    className="p-5 bg-pulse-indigo hover:bg-pulse-violet text-white rounded-[1.8rem] shadow-2xl shadow-pulse-indigo/40 transition-all active:scale-90 flex items-center justify-center group"
                >
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </form>
        </div>
      </div>

      {/* Right Column: Intelligence Bar */}
      <AnimatePresence>
        {showInfo && (
            <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="h-full bg-[#020617]/40 backdrop-blur-3xl flex flex-col border-white/5 overflow-hidden z-20 shadow-2xl"
            >
                <div className="p-12 flex flex-col items-center text-center flex-1 overflow-y-auto custom-scrollbar">
                    <div className="relative mb-10 group">
                        <div className="absolute inset-0 bg-pulse-violet/10 blur-[30px] rounded-full scale-150 group-hover:scale-110 transition-transform duration-1000" />
                        <img 
                          src={friend.profile_image} 
                          className="w-36 h-36 rounded-[3.5rem] object-cover border-[6px] border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative z-10 transition-transform duration-700 group-hover:scale-105" 
                          alt="" 
                        />
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-pulse-violet rounded-2xl border-[6px] border-[#020617] z-20 flex items-center justify-center shadow-2xl">
                             <Zap size={14} fill="white" className="text-white" />
                        </div>
                    </div>
                    
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{friend.name}</h3>
                    <p className="text-[10px] text-pulse-violet font-black uppercase tracking-[0.5em] mb-12 italic opacity-60">Architect of Sanctuary</p>

                    <div className="w-full space-y-12 text-left">
                        {/* Media Vault */}
                        <div className="group">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Media Vault</h4>
                                <button className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors">Catalog <ChevronRight size={12} className="inline ml-1" /></button>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <motion.div whileHover={{ scale: 1.05 }} className="aspect-square rounded-2xl bg-white/5 border border-white/5 overflow-hidden group/media cursor-pointer">
                                     <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=200" className="w-full h-full object-cover grayscale group-hover/media:grayscale-0 transition-all duration-700" alt="" />
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} className="aspect-square rounded-2xl bg-white/5 border border-white/5 overflow-hidden group/media cursor-pointer">
                                     <img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200" className="w-full h-full object-cover grayscale group-hover/media:grayscale-0 transition-all duration-700" alt="" />
                                </motion.div>
                                <motion.button whileHover={{ scale: 1.05 }} className="aspect-square rounded-2xl bg-[#0B1120] border border-white/5 flex flex-col items-center justify-center text-pulse-violet group/more relative overflow-hidden">
                                    <div className="absolute inset-0 bg-pulse-violet/5 opacity-0 group-hover/more:opacity-100 transition-opacity" />
                                    <Share2 size={16} className="mb-1 relative z-10" />
                                    <span className="text-[10px] font-black relative z-10">+24</span>
                                </motion.button>
                            </div>
                        </div>

                        {/* Pulse Settings */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-6">Frequencies</h4>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all border border-white/5 group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-xl text-gray-400 group-hover:text-pulse-violet transition-colors"><Bell size={18} /></div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-gray-300">Pulse Alerts</p>
                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Active Notifications</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-5 bg-pulse-violet rounded-full relative">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-lg" />
                                    </div>
                                </button>
                                
                                <button className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all border border-white/5 group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-xl text-gray-400 group-hover:text-pulse-indigo transition-colors"><Music size={18} /></div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-gray-300">Shared Rhythm</p>
                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Joint Frequencies</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-700" />
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="pt-8 border-t border-white/5">
                            <button className="w-full flex items-center gap-4 p-5 rounded-3xl bg-red-500/5 hover:bg-red-500/10 transition-all border border-red-500/10 group">
                                <div className="p-3 bg-red-500/10 rounded-xl text-red-900 group-hover:text-red-500 transition-colors"><Ban size={18} /></div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-red-900 group-hover:text-red-500 transition-colors">Sever Connection</p>
                                    <p className="text-[9px] text-red-900/60 group-hover:text-red-500/60 font-bold uppercase tracking-widest">Permanent Lockdown</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWindow;
