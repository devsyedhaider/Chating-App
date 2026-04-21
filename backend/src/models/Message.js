const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chat_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message_text: {
        type: String,
        trim: true
    },
    image_url: {
        type: String,
        default: null
    },
    location: {
        type: {
            lat: Number,
            lng: Number,
            address: String
        },
        default: null
    },
    reactions: [
        {
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            emoji: String
        }
    ],
    timestamp: {
        type: Date,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Message', messageSchema);
