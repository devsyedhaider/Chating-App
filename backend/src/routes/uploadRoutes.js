const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, upload.single('image'), (req, res) => {
    if (req.file) {
        res.json({
            url: `http://localhost:5000/uploads/${req.file.filename}`
        });
    } else {
        res.status(400).json({ message: 'No file uploaded' });
    }
});

module.exports = router;
