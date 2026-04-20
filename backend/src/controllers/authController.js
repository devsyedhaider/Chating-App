const User = require('../models/User');
const generateToken = require('../config/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { name, email, password, user_id } = req.body;
    const profile_image = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : req.body.profile_image;

    try {
        if (!user_id) {
            return res.status(400).json({ message: 'Unique ID is required' });
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const idExists = await User.findOne({ user_id });
        if (idExists) {
            return res.status(400).json({ message: 'Pulse ID is already taken. Try another!' });
        }

        const user = await User.create({
            name,
            email,
            password,
            profile_image,
            user_id
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profile_image: user.profile_image,
                user_id: user.user_id,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profile_image: user.profile_image,
                user_id: user.user_id,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
