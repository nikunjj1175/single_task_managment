// userRouter.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET } = require('../config/env');
const { body, validationResult } = require('express-validator');
const { cloudinary, uploadOnCloudinary } = require('../utils/cloudinary');
const { upload } = require('../middleware/multer');

// Signup route
router.post('/signup',
    upload.single('profileImage'),
    body('username').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { username, email, password } = req.body;
            const user = new User({ username, email, password });

            if (req.file) {
                // Upload image to Cloudinary
                const result = await uploadOnCloudinary(req.file.path);
                user.profileImage = result.secure_url;
            }

            // Save the user to the database
            await user.save();

            res.status(201).json({ message: 'User created successfully!' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

// Login route
router.post('/login',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user || !await user.comparePassword(password)) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '10h' });
            res.json({ token });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

// Profile route (protected)
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        // console.log("profile",user);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update user route
router.put('/update/:userId', authenticate,
    upload.single('profileImage'),
    body('username').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { username, email, password } = req.body;
            const userId = req.params.userId;

            // Retrieve the user from the database
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            // Check if the user has an existing profile image
            const oldImage = user.profileImage;
            // console.log(oldImage);

            // Update user information
            user.username = username;
            user.email = email;
            user.password = password;

            if (req.file) {
                // If a new profile image is provided, delete the old one and upload the new one to Cloudinary
                if (oldImage) {
                    // Delete the old image from Cloudinary
                    await cloudinary.uploader.destroy(getPublicId(oldImage));
                }
    
                // Upload the new image to Cloudinary
                const result = await uploadOnCloudinary(req.file.path);
                user.profileImage = result.secure_url;
            }

            // Save the updated user to the database
            await user.save();

            res.status(200).json({ message: 'User updated successfully!' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

function getPublicId(imageUrl) {
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
}


// Authentication middleware
function authenticate(req, res, next) {
    // console.log("Request Headers:", req.headers);
    const token = req.header('Authorization');
    // console.log("Token in authenticate middleware:", token);
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();

    } catch (ex) {
        res.status(400).json({ error: 'Invalid token.' });
    }
}

module.exports = router;
