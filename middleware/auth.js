const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

// Middleware function to authenticate user
exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  // console.log("token :",token);
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Middleware function to authorize user (example: admin role)
exports.authorizeAdmin = (req, res, next) => {
  // Check if user role is admin
  // For demonstration, assuming user role is stored in req.user.role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }
  next();
};
