import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Smile, Phone, Video, MoreHorizontal, MessageSquare, Paperclip, Info, ChevronRight, Bell, Shield, Ban } from 'lucide-react';

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
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col h-full border-r border-white/5 relative">
        {/* Header */}
        <div className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#020617]/50 backdrop-blur-md z-20">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <img src={friend.profile_image} className="w-10 h-10 rounded-full border-2 border-white/5" alt="" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-pulse-violet rounded-full border-2 border-[#020617]" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{friend.name}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Now</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="p-3 text-gray-500 hover:text-white transition-colors"><Video size={20} /></button>
                <button className="p-3 text-gray-500 hover:text-white transition-colors"><Phone size={20} /></button>
                <button 
                  onClick={() => setShowInfo(!showInfo)}
                  className={`p-3 transition-colors ${showInfo ? 'text-pulse-violet bg-pulse-violet/10 rounded-xl' : 'text-gray-500 hover:text-white'}`}
                >
                    <Info size={20} />
                </button>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-10 py-6 space-y-6 custom-scrollbar">
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-pulse-violet border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex flex-col space-y-6">
                    <div className="flex justify-center mb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 bg-white/5 px-4 py-2 rounded-full">Today, Oct 24</span>
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
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[60%]`}>
                                    <div className={`${isMe ? 'chat-bubble-sender' : 'chat-bubble-receiver'} relative group`}>
                                        {msg.message_text && <p className="text-sm leading-relaxed tracking-wide font-medium">{msg.message_text}</p>}
                                        {msg.image_url && <img src={msg.image_url} className="w-full rounded-[1.5rem] mt-1 shadow-2xl" alt="" />}
                                    </div>
                                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-2 px-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            )}
        </div>

        {/* Input Bar */}
        <div className="p-8">
            <form onSubmit={handleSendMessage} className="bg-[#0B1120] border border-white/5 rounded-3xl p-3 flex items-center gap-3 shadow-2xl relative group focus-within:border-pulse-violet/30 transition-all">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                  className="p-3 text-gray-500 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-2xl"
                >
                    <ImageIcon size={20} />
                </button>
                <button type="button" className="p-3 text-gray-500 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-2xl">
                    <Smile size={20} />
                </button>
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none outline-none text-white text-sm font-medium px-2"
                />
                <button 
                    type="submit"
                    className="p-4 bg-pulse-indigo hover:bg-pulse-violet text-white rounded-2xl shadow-xl shadow-pulse-indigo/30 transition-all active:scale-95 flex items-center justify-center"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
      </div>

      {/* Right Column: Friend Info */}
      <AnimatePresence>
        {showInfo && (
            <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 340, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="h-full bg-[#020617] flex flex-col border-white/5 overflow-hidden"
            >
                <div className="p-10 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <img 
                          src={friend.profile_image} 
                          className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white/5 shadow-2xl" 
                          alt="" 
                        />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-pulse-violet rounded-2xl border-4 border-[#020617]" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">{friend.name}</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-8">Lead Product Designer</p>

                    <div className="w-full space-y-8 text-left">
                        <div>
                            <h4 className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] mb-4">Shared Media</h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="aspect-square rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                                     <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=100" className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity" alt="" />
                                </div>
                                <div className="aspect-square rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                                     <img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=100" className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity" alt="" />
                                </div>
                                <div className="aspect-square rounded-2xl bg-[#0B1120] border border-white/5 flex items-center justify-center text-pulse-violet font-bold text-xs uppercase">
                                    +12
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] mb-4">Settings</h4>
                            <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                                <div className="flex items-center gap-3">
                                    <Bell size={18} className="text-gray-500" />
                                    <span className="text-xs font-bold text-gray-400">Mute Notifications</span>
                                </div>
                                <div className="w-10 h-5 bg-pulse-violet rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-lg" />
                                </div>
                            </button>
                            <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                                <div className="flex items-center gap-3">
                                    <Shield size={18} className="text-gray-500" />
                                    <span className="text-xs font-bold text-gray-400">Encryption Key</span>
                                </div>
                                <Shield size={18} className="text-gray-700" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-all group">
                                <div className="flex items-center gap-3">
                                    <Ban size={18} className="text-red-900 group-hover:text-red-500 transition-colors" />
                                    <span className="text-xs font-bold text-red-900 group-hover:text-red-500 transition-colors">Block {friend.name.split(' ')[0]}</span>
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
