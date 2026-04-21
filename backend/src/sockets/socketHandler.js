const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('join_chat', (chatId) => {
            socket.join(chatId);
            console.log(`User joined chat: ${chatId}`);
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

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = socketHandler;
