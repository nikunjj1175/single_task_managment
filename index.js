// index.js

const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const logger = require('./utils/logger');

const { PORT } = require('./config/env'); 

// Initialize Express application
const app = express();

// Connect to the database
connectDB();

module.exports = app;

// Middleware to parse JSON requests
app.use(express.json());

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Task Management System API');
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`, { error: err });
    // console.log("hiiiiiiiiii");
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});