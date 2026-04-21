const express = require('express');
const { searchUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/search/:user_id', protect, searchUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
