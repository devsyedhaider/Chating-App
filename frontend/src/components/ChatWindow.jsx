import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Smile, Phone, Video, MoreHorizontal, MessageSquare, Paperclip } from 'lucide-react';

const socket = io('http://localhost:5000');

const ChatWindow = ({ friend }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      // Get or create chat
      const { data: chat } = await axios.post('http://localhost:5000/api/messages/chat', 
        { receiver_id: friend._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setChatId(chat._id);

      // Fetch messages
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
      // Optimistic output for smooth UX
      // Actually Socket.IO will handle it, but saving to DB is important
      const { data } = await axios.post('http://localhost:5000/api/messages/send', 
        messageData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      socket.emit('send_message', data);
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
      
      // After upload, send the message with image URL
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
      
      socket.emit('send_message', sentMsg);
    } catch (error) {
      console.error(error);
      alert('Failed to upload image');
    }
    setUploading(false);
  };

  if (!friend) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
        <div className="p-10 rounded-full bg-indigo-600/5 mb-6">
          <MessageSquare size={100} className="text-indigo-600/20" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Select a Chat</h2>
        <p className="text-gray-500 max-w-xs">Connecting you with your friends in real-time. Select a friend from the sidebar to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0F172A] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/5 blur-[150px] -z-10" />

      {/* Header */}
      <div className="p-4 glass flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <img src={friend.profile_image} className="w-10 h-10 rounded-xl" alt="" />
          <div>
            <h3 className="font-bold text-white mb-0.5">{friend.name}</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Active Now</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 transition-all"><Phone size={20}/></button>
          <button className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 transition-all"><Video size={20}/></button>
          <button className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 transition-all"><MoreHorizontal size={20}/></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => {
              const isMe = msg.sender_id._id === user._id || msg.sender_id === user._id;
              return (
                <motion.div 
                  key={msg._id || index}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isMe ? 'chat-bubble-sender' : 'chat-bubble-receiver'}`}>
                    {msg.message_text && <p className="text-sm leading-relaxed">{msg.message_text}</p>}
                    {msg.image_url && <img src={msg.image_url} className="mt-2 rounded-lg max-w-full" alt="" />}
                    <span className="block text-[9px] opacity-50 mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-transparent z-10">
        <form onSubmit={handleSendMessage} className="glass rounded-2xl p-2 flex items-center gap-2">
           <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
           />
           <button 
            type="button" 
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="p-2.5 text-gray-400 hover:text-indigo-400 transition-all hover:bg-indigo-400/10 rounded-xl"
           >
             {uploading ? <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent" /> : <ImageIcon size={22} />}
           </button>
           <button type="button" className="p-2.5 text-gray-400 hover:text-indigo-400 transition-all hover:bg-indigo-400/10 rounded-xl">
             <Smile size={22} />
           </button>
           <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm px-2"
           />
           <button 
            type="submit"
            disabled={uploading}
            className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
           >
             <Send size={20} />
           </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
