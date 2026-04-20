const express = require('express');
const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendsList,
    getPendingRequests
} = require('../controllers/friendController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/request', protect, sendFriendRequest);
router.post('/accept', protect, acceptFriendRequest);
router.post('/reject', protect, rejectFriendRequest);
router.get('/list', protect, getFriendsList);
router.get('/requests/pending', protect, getPendingRequests);

module.exports = router;
