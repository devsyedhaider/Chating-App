import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, Phone, Video, Search, MoreVertical, Check, Info, Bell, Shield, Ban, ChevronRight, MessageSquare, ImageIcon } from 'lucide-react';

const socket = io('http://localhost:5000');

const ChatWindow = ({ friend }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
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
    }
    setUploading(false);
  };

  return (
    <div className="flex h-full bg-[#020617] relative overflow-hidden">
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col h-full border-r border-white/5 relative">
        {/* Pulse WhatsApp Header */}
        <div className="h-20 px-6 flex items-center justify-between bg-[#020617]/40 backdrop-blur-md z-30 border-b border-white/5">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setShowInfo(!showInfo)}>
                <div className="relative">
                    <img src={friend.profile_image} className="w-11 h-11 rounded-[16px] object-cover border-2 border-white/5 group-hover:border-pulse-violet/50 transition-all" alt="" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#020617]" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-pulse-violet transition-colors">{friend.name}</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] italic">Active Now</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Search size={20} className="text-gray-600 cursor-pointer hover:text-pulse-violet transition-colors" />
                <MoreVertical size={20} className="text-gray-600 cursor-pointer hover:text-pulse-violet transition-colors" />
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
                    <div className="flex justify-center mb-4">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-700 bg-white/5 px-6 py-2 rounded-full border border-white/5">Session Securely Established</span>
                    </div>

                    {messages.map((msg, index) => {
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
                                        {isMe && <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />}
                                        {msg.message_text && <p className="text-sm font-medium leading-relaxed tracking-wide">{msg.message_text}</p>}
                                        {msg.image_url && (
                                            <div className="relative group/img mt-1">
                                                <img src={msg.image_url} className="w-full rounded-2xl border border-white/10 shadow-2xl" alt="" />
                                                <div className="absolute inset-0 bg-pulse-indigo/10 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-2xl" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 px-1">
                                        <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                        {isMe && <Check size={12} className="text-pulse-violet opacity-60" />}
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
            <div className="bg-[#0B1120]/60 p-2.5 rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center gap-3 backdrop-blur-xl group focus-within:border-pulse-violet/30 transition-all">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <div className="flex items-center gap-2">
                    <button onClick={() => fileInputRef.current.click()} className="p-4 bg-[#020617] rounded-3xl text-gray-500 hover:text-white hover:bg-pulse-indigo/20 transition-all">
                        <Paperclip size={20} className="-rotate-45" />
                    </button>
                    <button className="p-4 bg-[#020617] rounded-3xl text-gray-500 hover:text-white hover:bg-pulse-indigo/20 transition-all">
                        <Smile size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-3">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Transmit Pulse Data..."
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm font-medium px-2 py-4 placeholder-[#1e293b] uppercase tracking-widest text-[11px]"
                    />
                    <button 
                        type="submit"
                        className="p-5 bg-gradient-to-br from-pulse-indigo to-pulse-violet text-white rounded-[2rem] shadow-2xl shadow-pulse-violet/20 transition-all active:scale-90 flex items-center justify-center group/send"
                    >
                        <Send size={22} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
      </div>

      {/* Right Column: Friend Insight (PULSE Info Sidebar) */}
      <AnimatePresence>
        {showInfo && (
            <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="h-full bg-[#020617] flex flex-col border-white/5 overflow-hidden border-l"
            >
                <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-10">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-pulse-violet/20 blur-[40px] animate-pulse" />
                            <img 
                              src={friend.profile_image} 
                              className="w-36 h-36 rounded-[3rem] object-cover border-4 border-white/5 shadow-2xl relative z-10" 
                              alt="" 
                            />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{friend.name}</h3>
                        <div className="px-4 py-1.5 bg-pulse-violet/10 rounded-full border border-pulse-violet/20">
                            <p className="text-[10px] text-pulse-violet font-black uppercase tracking-[0.2em]">Validated Resident</p>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <div>
                            <h4 className="text-[10px] text-gray-700 font-black uppercase tracking-[0.3em] mb-6">Shared Sanctuary Media</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {['https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=200', 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200'].map((img, i) => (
                                    <div key={i} className="aspect-square rounded-3xl bg-white/5 border border-white/10 overflow-hidden group cursor-pointer">
                                         <img src={img} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all group-hover:scale-110 duration-700" alt="" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-10 border-t border-white/5">
                            <h4 className="text-[10px] text-gray-700 font-black uppercase tracking-[0.3em] mb-4">Sanctuary Controls</h4>
                            
                            {[
                                { icon: Bell, label: 'Mute Notifications', toggle: true },
                                { icon: Shield, label: 'Encryption Details', sub: 'E2EE Active' },
                            ].map((item, i) => (
                                <button key={i} className="w-full flex items-center justify-between p-5 bg-white/5 rounded-[1.8rem] hover:bg-white/10 transition-all group border border-transparent hover:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <item.icon size={18} className="text-gray-600 group-hover:text-pulse-violet transition-colors" />
                                        <div className="text-left">
                                            <p className="text-[11px] font-bold text-white uppercase tracking-wider">{item.label}</p>
                                            {item.sub && <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">{item.sub}</p>}
                                        </div>
                                    </div>
                                    {item.toggle && (
                                        <div className="w-10 h-5 bg-pulse-violet/20 rounded-full relative border border-pulse-violet/30">
                                            <div className="absolute right-1 top-1 w-3 h-3 bg-pulse-violet rounded-full shadow-[0_0_10px_#8B5CF6]" />
                                        </div>
                                    )}
                                </button>
                            ))}

                            <button className="w-full flex items-center gap-4 p-5 bg-red-500/5 rounded-[1.8rem] hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/10 group mt-8">
                                <Ban size={18} className="text-red-900 group-hover:text-red-500 transition-colors" />
                                <span className="text-[11px] font-black text-red-900 group-hover:text-red-500 uppercase tracking-widest">Terminate Connection</span>
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
