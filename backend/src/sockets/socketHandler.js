const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('join_chat', (chatId) => {
            socket.join(chatId);
            console.log(`User joined chat: ${chatId}`);
        });

        socket.on('join_personal', (userId) => {
            socket.join(userId);
            console.log(`User joined personal room: ${userId}`);
        });

        socket.on('send_message', (data) => {
            // data should include chat_id, sender_id, message_text, image_url, timestamp
            io.to(data.chat_id).emit('receive_message', data);
        });

        socket.on('typing', (data) => {
            socket.to(data.chatId).emit('user_typing', { userId: data.userId });
        });

        socket.on('mark_read', (data) => {
            // data includes chat_id, user_id
            socket.to(data.chat_id).emit('messages_read', data);
        });
        
        socket.on('send_reaction', (data) => {
            // data should include chat_id, message_id, user_id, emoji
            io.to(data.chat_id).emit('receive_reaction', data);
        });

        // WebRTC Signaling
        socket.on('call_user', (data) => {
            // data includes userToCall, signalData, from, name, image, type (voice/video)
            socket.to(data.userToCall).emit('incoming_call', {
                signal: data.signalData,
                from: data.from,
                name: data.name,
                image: data.image,
                type: data.type
            });
        });

        socket.on('answer_call', (data) => {
            // data includes to, signal
            socket.to(data.to).emit('call_accepted', data.signal);
        });

        socket.on('ice_candidate', (data) => {
            // data includes to, candidate
            socket.to(data.to).emit('receive_ice_candidate', data.candidate);
        });

        socket.on('end_call', (data) => {
            // data includes to
            socket.to(data.to).emit('call_ended');
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = socketHandler;
