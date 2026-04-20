const express = require('express');
const { sendMessage, getMessages, getOrCreateChat, markAsRead } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/chat', protect, getOrCreateChat);
router.post('/send', protect, sendMessage);
router.post('/read', protect, markAsRead);
router.get('/:chat_id', protect, getMessages);

module.exports = router;
