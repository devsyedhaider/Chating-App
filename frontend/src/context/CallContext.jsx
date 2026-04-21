import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import CallOverlay from '../components/CallOverlay';
import { AnimatePresence } from 'framer-motion';

const CallContext = createContext();

const socket = io('http://localhost:5000');

export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
    const { user } = useAuth();
    const [callData, setCallData] = useState(null);

    useEffect(() => {
        if (!user) return;

        socket.emit('join_personal', user._id);

        socket.on('incoming_call', (data) => {
            setCallData({ ...data, isReceiving: true });
        });

        return () => {
            socket.off('incoming_call');
        };
    }, [user]);

    const initiateCall = (targetUser, type) => {
        setCallData({
            id: targetUser._id,
            name: targetUser.name,
            image: targetUser.profile_image,
            type,
            isReceiving: false
        });
    };

    const endCall = () => {
        setCallData(null);
    };

    return (
        <CallContext.Provider value={{ initiateCall, endCall }}>
            {children}
            <AnimatePresence>
                {callData && (
                    <CallOverlay 
                        callData={callData} 
                        user={user} 
                        onEndCall={endCall} 
                    />
                )}
            </AnimatePresence>
        </CallContext.Provider>
    );
};
