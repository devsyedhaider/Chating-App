const express = require('express');
const { registerUser, authUser } = require('../controllers/authController');
const router = express.Router();

const upload = require('../middlewares/uploadMiddleware');

router.post('/register', upload.single('profile_image'), registerUser);
router.post('/login', authUser);

module.exports = router;
