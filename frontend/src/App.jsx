import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { Toaster, toast } from 'react-hot-toast';
import io from 'socket.io-client';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const NotificationHandler = () => {
  const { user } = useAuth();

  React.useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:5000');
    
    socket.on('receive_message', (data) => {
      // Only notify if message is NOT from me
      if (data.sender_id !== user._id) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl pointer-events-auto flex`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <img
                    className="h-10 w-10 rounded-full object-cover border border-violet-500/50"
                    src={data.sender_image || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                    alt=""
                  />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-white">
                    New Message
                  </p>
                  <p className="mt-1 text-sm text-gray-400 line-clamp-1">
                    {data.message_text || "Sent an image"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-white/5">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-violet-400 hover:text-violet-300 focus:outline-none transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ), { duration: 4000, position: 'top-right' });
      }
    });

    return () => socket.disconnect();
  }, [user]);

  return null;
};

import { CallProvider } from './context/CallContext';

function App() {
  return (
    <AuthProvider>
      <CallProvider>
        <NotificationHandler />
        <Toaster />
      <Router>
        <div className="min-h-screen bg-[#020617] text-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
      </CallProvider>
    </AuthProvider>
  );
}

export default App;
