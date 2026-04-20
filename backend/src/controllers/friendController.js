const FriendRequest = require('../models/FriendRequest');
const Friend = require('../models/Friend');
const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

// @desc    Send Friend Request
// @route   POST /api/friends/request
// @access  Private
exports.sendFriendRequest = async (req, res) => {
    const { receiver_id } = req.body;
    const sender_id = req.user._id;

    if (sender_id.toString() === receiver_id) {
        return res.status(400).json({ message: 'You cannot send a request to yourself' });
    }

    try {
        const existingRequest = await FriendRequest.findOne({
            sender_id,
            receiver_id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Request already sent' });
        }

        const areFriends = await Friend.findOne({
            $or: [
                { user1_id: sender_id, user2_id: receiver_id },
                { user1_id: receiver_id, user2_id: sender_id }
            ]
        });

        if (areFriends) {
            return res.status(400).json({ message: 'You are already friends' });
        }

        const friendRequest = await FriendRequest.create({
            sender_id,
            receiver_id
        });

        res.status(201).json(friendRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept Friend Request
// @route   POST /api/friends/accept
// @access  Private
exports.acceptFriendRequest = async (req, res) => {
    const { request_id } = req.body;

    try {
        const request = await FriendRequest.findById(request_id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.receiver_id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        request.status = 'accepted';
        await request.save();

        const friend = await Friend.create({
            user1_id: request.sender_id,
            user2_id: request.receiver_id
        });

        res.json({ message: 'Friend request accepted', friend });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject Friend Request
// @route   POST /api/friends/reject
// @access  Private
exports.rejectFriendRequest = async (req, res) => {
    const { request_id } = req.body;

    try {
        const request = await FriendRequest.findById(request_id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.receiver_id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        request.status = 'rejected';
        await request.save();

        res.json({ message: 'Friend request rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Friends List
// @route   GET /api/friends/list
// @access  Private
exports.getFriendsList = async (req, res) => {
    try {
        const friends = await Friend.find({
            $or: [{ user1_id: req.user._id }, { user2_id: req.user._id }]
        }).populate('user1_id user2_id', 'name email profile_image user_id');

        const friendsList = friends.map(f => {
            return f.user1_id._id.toString() === req.user._id.toString() ? f.user2_id : f.user1_id;
        });

        // Add unread counts
        const friendsWithUnread = await Promise.all(friendsList.map(async (friend) => {
            const chat = await Chat.findOne({
                participants: { $all: [req.user._id, friend._id] }
            });

            let unreadCount = 0;
            let lastMessage = null;

            if (chat) {
                unreadCount = await Message.countDocuments({
                    chat_id: chat._id,
                    sender_id: friend._id,
                    isRead: false
                });

                lastMessage = await Message.findOne({ chat_id: chat._id })
                    .sort({ timestamp: -1 });
            }

            return {
                ...friend.toObject(),
                unreadCount,
                lastMessage: lastMessage ? {
                    text: lastMessage.message_text,
                    timestamp: lastMessage.timestamp,
                    isRead: lastMessage.isRead,
                    isMe: lastMessage.sender_id.toString() === req.user._id.toString()
                } : null
            };
        }));

        res.json(friendsWithUnread);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Pending Requests
// @route   GET /api/friends/requests/pending
// @access  Private
exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.find({
            receiver_id: req.user._id,
            status: 'pending'
        }).populate('sender_id', 'name email profile_image user_id');

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
