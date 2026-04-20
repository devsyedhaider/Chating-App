import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen overflow-hidden"
    >
      <Sidebar 
        onSelectFriend={setSelectedFriend} 
        selectedFriend={selectedFriend}
      />
      
      <main className="flex-1 overflow-hidden">
        <ChatWindow friend={selectedFriend} />
      </main>
    </motion.div>
  );
};

export default Dashboard;
