const express = require('express');
const { sendMessage, getMessages, getOrCreateChat } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/chat', protect, getOrCreateChat);
router.post('/send', protect, sendMessage);
router.get('/:chat_id', protect, getMessages);

module.exports = router;
