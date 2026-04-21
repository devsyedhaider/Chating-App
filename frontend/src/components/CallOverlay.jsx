import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff, Maximize2, Minimize2, User } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const CallOverlay = ({ callData, user, onEndCall }) => {
    const [callAccepted, setCallAccepted] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        const initMedia = async () => {
            try {
                const currentStream = await navigator.mediaDevices.getUserMedia({ 
                    video: callData.type === 'video', 
                    audio: true 
                });
                setStream(currentStream);
                if (myVideo.current) myVideo.current.srcObject = currentStream;

                if (callData.isReceiving) {
                    processCall(currentStream);
                } else {
                    initiateCall(currentStream);
                }
            } catch (err) {
                console.error("Failed to get media devices:", err);
                onEndCall();
            }
        };

        initMedia();

        socket.on('call_accepted', (signal) => {
            setCallAccepted(true);
            if (connectionRef.current) {
                connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
            }
        });

        socket.on('receive_ice_candidate', (candidate) => {
            if (connectionRef.current) {
                connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        socket.on('call_ended', () => {
            leaveCall();
        });

        return () => {
            socket.off('call_accepted');
            socket.off('receive_ice_candidate');
            socket.off('call_ended');
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, []);

    const initiateCall = async (currentStream) => {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        connectionRef.current = peer;

        currentStream.getTracks().forEach(track => peer.addTrack(track, currentStream));

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice_candidate', { to: callData.id, candidate: event.candidate });
            }
        };

        peer.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            if (userVideo.current) userVideo.current.srcObject = event.streams[0];
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit('call_user', {
            userToCall: callData.id,
            signalData: offer,
            from: user._id,
            name: user.name,
            image: user.profile_image,
            type: callData.type
        });
    };

    const processCall = async (currentStream) => {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        connectionRef.current = peer;

        currentStream.getTracks().forEach(track => peer.addTrack(track, currentStream));

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice_candidate', { to: callData.from, candidate: event.candidate });
            }
        };

        peer.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            if (userVideo.current) userVideo.current.srcObject = event.streams[0];
        };

        await peer.setRemoteDescription(new RTCSessionDescription(callData.signal));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit('answer_call', { to: callData.from, signal: answer });
        setCallAccepted(true);
    };

    const leaveCall = () => {
        if (connectionRef.current) connectionRef.current.close();
        if (stream) stream.getTracks().forEach(track => track.stop());
        socket.emit('end_call', { to: callData.isReceiving ? callData.from : callData.id });
        onEndCall();
    };

    const toggleMute = () => {
        stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
        setIsMuted(!isMuted);
    };

    const toggleVideo = () => {
        stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        setIsVideoOff(!isVideoOff);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/95 backdrop-blur-2xl"
        >
            <div className="relative w-full h-full max-w-4xl max-h-[600px] flex flex-col md:flex-row overflow-hidden md:rounded-[3rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                
                {/* Main View Area */}
                <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                    {/* Background Decor */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pulse-indigo/10 to-pulse-violet/10 z-0" />
                    
                    {/* User Info Header (Mobile Only) */}
                    <div className="absolute top-8 left-8 right-8 z-20 flex items-center justify-between md:hidden">
                         <div className="flex items-center gap-4">
                            <img src={callData.image} className="w-12 h-12 rounded-2xl object-cover border-2 border-white/10" alt="" />
                            <div>
                                <h3 className="text-white font-bold">{callData.name}</h3>
                                <p className="text-pulse-violet text-[10px] font-black uppercase tracking-widest">{callAccepted ? 'Active Call' : 'Connecting...'}</p>
                            </div>
                         </div>
                    </div>

                    {/* Remote Stream */}
                    {callData.type === 'video' ? (
                        callAccepted ? (
                            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-6">
                                <motion.div 
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-pulse-violet blur-[40px] opacity-40 rounded-full" />
                                    <img src={callData.image} className="w-44 h-44 rounded-[4rem] object-cover border-4 border-pulse-violet relative z-10" alt="" />
                                </motion.div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{callData.name}</h2>
                                <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-xs">Establishing Secure Connection</p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center gap-8">
                             <div className="relative w-64 h-64 flex items-center justify-center">
                                <motion.div 
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 bg-pulse-indigo rounded-full"
                                />
                                <div className="absolute inset-10 bg-pulse-violet blur-3xl opacity-20" />
                                <img src={callData.image} className="w-48 h-48 rounded-[5rem] object-cover border-8 border-[#020617] relative z-10 shadow-2xl" alt="" />
                             </div>
                             <div className="text-center">
                                <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-2">{callData.name}</h2>
                                <p className="text-pulse-violet font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Enrypted Voice Call</p>
                             </div>
                        </div>
                    )}

                    {/* Local Stream (PIP) */}
                    {callData.type === 'video' && (
                        <motion.div 
                            drag
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            className="absolute bottom-8 right-8 w-32 h-44 md:w-48 md:h-64 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-30 bg-[#0B1120]"
                        >
                            <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                            {isVideoOff && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#0B1120]">
                                    <VideoOff className="text-gray-700" size={32} />
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Controls Area (Right/Bottom) */}
                <div className="w-full md:w-32 bg-[#0B1120]/60 backdrop-blur-3xl border-l border-white/5 flex flex-row md:flex-col items-center justify-center gap-4 p-6 md:p-0">
                    <button 
                        onClick={toggleMute}
                        className={`p-4 rounded-3xl transition-all ${isMuted ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    {callData.type === 'video' && (
                        <button 
                            onClick={toggleVideo}
                            className={`p-4 rounded-3xl transition-all ${isVideoOff ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                        </button>
                    )}

                    <button 
                        onClick={leaveCall}
                        className="p-5 bg-red-500 text-white rounded-3xl shadow-[0_15px_30px_rgba(239,68,68,0.4)] hover:scale-110 active:scale-95 transition-all"
                    >
                        <PhoneOff size={28} />
                    </button>
                </div>

                {/* Incoming Call Layout Overlay */}
                {!callAccepted && callData.isReceiving && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020617]/80 backdrop-blur-3xl">
                        <div className="flex flex-col items-center gap-8">
                             <div className="relative">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-pulse-violet blur-3xl opacity-30" />
                                <img src={callData.image} className="w-40 h-40 rounded-[4rem] border-4 border-pulse-violet relative z-10" alt="" />
                             </div>
                             <div className="text-center">
                                <p className="text-pulse-violet font-black uppercase tracking-[0.4em] text-[10px] mb-2">Incoming {callData.type} Call</p>
                                <h1 className="text-4xl font-black text-white uppercase tracking-tight">{callData.name}</h1>
                             </div>
                             <div className="flex gap-8">
                                <button onClick={leaveCall} className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><PhoneOff size={32} /></button>
                                <button onClick={() => processCall(stream)} className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg animate-bounce hover:scale-110 transition-transform"><Phone size={32} /></button>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default CallOverlay;
