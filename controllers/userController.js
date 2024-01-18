// userContoller.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const logger = require('../utils/logger');
const { uploadOnCloudinary } = require('../utils/cloudinary');

// Controller function for user signup
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if a file is present in the request
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image.' });
        }

        // Upload image to Cloudinary
        const result = await uploadOnCloudinary(req.file.path);

        // Create a new user with the uploaded image URL
        const user = new User({ username, email, password, profileImage: result.secure_url });
        console.log("user----",user);

        await user.save();
        logger.info('User created successfully:', { user: user });
        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        if (error.message === 'File size exceeds 1MB limits.') {
            return res.status(400).json({ error: error.message });
        }

        // console.log("hiiiii");
        logger.error('Error during signup:', { error: error });
        res.status(400).json({ error: error.message });
    }
};

// Controller function for user login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !await user.comparePassword(password)) {
            logger.error('Invalid credentials during login');
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '10h' });
        res.json({ token });
    } catch (error) {
        logger.error('Error during login:', { error: error });
        res.status(400).json({ error: error.message });
    }
};

// Controller function for retrieving user profile (protected)
exports.profile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        logger.error('Error retrieving user profile:', { error: error });
        res.status(400).json({ error: error.message });
    }
};

// Update user controller
exports.updateUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userId = req.params.userId; 

        // Retrieve the user from the database
        const user = await User.findById(userId);
        console.log(user);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if the user has an existing profile image
        const oldImage = user.profileImage;
        // console.log("oldImage----",oldImage);

        // Update user information
        user.username = username;
        user.email = email;
        user.password = password;

        if (req.file) {
            // If a new profile image is provided, delete the old one locally
            if (oldImage) {
                // console.log("oldImage------------------",oldImage);
                // Remove the old image from the local storage
                const oldImagePath = `./uploads/${getFileNameFromURL(oldImage)}`;
                fs.unlinkSync(oldImagePath);
            }

            // Upload the new image locally
            const result = await uploadOnCloudinary(req.file.path);
            user.profileImage = result.secure_url;
        }

        // Save the updated user to the database
        await user.save();

        logger.info('User updated successfully:', { user: user });
        res.status(200).json({ message: 'User updated successfully!' });
    } catch (error) {
        if (error.message === 'File size exceeds 1MB limits.') {
            return res.status(400).json({ error: error.message });
        }

        logger.error('Error during user update:', { error: error });
        res.status(400).json({ error: error.message });
    }
};


function getFileNameFromURL(imageUrl) {
    // console.log("imageUrl------",imageUrl);
    const parts = imageUrl.split('/');
    return parts[parts.length - 1];
}
