const Message = require('../models/Message');
const Chat = require('../models/Chat');

// @desc    Get or Create Chat between two users
// @route   POST /api/messages/chat
// @access  Private
exports.getOrCreateChat = async (req, res) => {
    const { receiver_id } = req.body;
    const sender_id = req.user._id;

    try {
        let chat = await Chat.findOne({
            participants: { $all: [sender_id, receiver_id] }
        });

        if (!chat) {
            chat = await Chat.create({
                participants: [sender_id, receiver_id]
            });
        }

        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send Message
// @route   POST /api/messages/send
// @access  Private
exports.sendMessage = async (req, res) => {
    const { chat_id, message_text, image_url } = req.body;
    const sender_id = req.user._id;

    try {
        const message = await Message.create({
            chat_id,
            sender_id,
            message_text,
            image_url
        });

        const populatedMessage = await Message.findById(message._id).populate('sender_id', 'name profile_image');

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Messages for a chat
// @route   GET /api/messages/:chat_id
// @access  Private
exports.getMessages = async (req, res) => {
    const { chat_id } = req.params;

    try {
        const messages = await Message.find({ chat_id })
            .populate('sender_id', 'name profile_image')
            .sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark messages in a chat as read
// @route   POST /api/messages/read
// @access  Private
exports.markAsRead = async (req, res) => {
    const { chat_id } = req.body;
    const user_id = req.user._id;

    try {
        await Message.updateMany(
            { chat_id, sender_id: { $ne: user_id }, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
