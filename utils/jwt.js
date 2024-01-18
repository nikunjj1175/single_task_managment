const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

// Function to generate JWT token
exports.generateToken = (userId) => {
    // console.log(userId);
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '10h' });
};

// Function to verify JWT token
exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
