import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, Phone, Video, Search, MoreVertical, Check, CheckCheck, Plus } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-[#0b141a] relative overflow-hidden">
      {/* WhatsApp Chat Header */}
      <div className="h-16 px-4 flex items-center justify-between bg-[#202c33] z-20">
          <div className="flex items-center gap-3 cursor-pointer">
              <img src={friend.profile_image} className="w-10 h-10 rounded-full object-cover" alt="" />
              <div>
                  <h3 className="text-[15px] font-medium text-[#e9edef] leading-tight">{friend.name}</h3>
                  <p className="text-[12px] text-[#8696a0]">online</p>
              </div>
          </div>
          <div className="flex items-center gap-5 text-[#aebac1]">
              <Video size={20} className="cursor-pointer" />
              <Phone size={18} className="cursor-pointer" />
              <div className="w-[1px] h-6 bg-white/10 mx-1" />
              <Search size={20} className="cursor-pointer" />
              <MoreVertical size={20} className="cursor-pointer" />
          </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar bg-[#0b141a] relative">
          {/* Subtle Background Pattern Mockup */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" />
          
          {messages.map((msg, index) => {
              const isMe = msg.sender_id._id === user._id || msg.sender_id === user._id;
              return (
                  <motion.div 
                      key={msg._id || index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} relative z-10 mb-1`}
                  >
                      <div className={`max-w-[85%] px-2.5 py-1.5 rounded-lg shadow-sm relative ${isMe ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'}`}>
                          {msg.message_text && <p className="text-[14.2px] leading-relaxed pr-8">{msg.message_text}</p>}
                          {msg.image_url && <img src={msg.image_url} className="max-w-full rounded-md mt-1 mb-1 block" alt="" />}
                          
                          <div className="flex items-center justify-end gap-1 mt-0.5 h-3">
                              <span className="text-[10px] text-[#8696a0]">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </span>
                              {isMe && <CheckCheck size={14} className="text-[#53bdeb]" />}
                          </div>
                      </div>
                  </motion.div>
              );
          })}
          <div ref={scrollRef} />
      </div>

      {/* WhatsApp Chat Input */}
      <div className="px-4 py-2.5 bg-[#202c33] flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          <div className="flex items-center gap-3 text-[#aebac1]">
              <Smile size={24} className="cursor-pointer hover:text-[#e9edef] transition-colors" />
              <Paperclip 
                 onClick={() => fileInputRef.current.click()}
                 size={24} className="cursor-pointer hover:text-[#e9edef] transition-colors -rotate-45" 
              />
          </div>
          
          <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
              <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 bg-[#2a3942] border-none rounded-lg py-2.5 px-4 text-[#e9edef] text-[15px] focus:outline-none placeholder-[#8696a0]"
              />
              <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-2.5 rounded-full transition-all flex items-center justify-center ${newMessage.trim() ? 'bg-[#00a884] text-white shadow-lg' : 'bg-transparent text-[#8696a0]'}`}
              >
                  <Send size={24} fill={newMessage.trim() ? "currentColor" : "none"} />
              </button>
          </form>
      </div>
    </div>
  );
};

export default ChatWindow;
