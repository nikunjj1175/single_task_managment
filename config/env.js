const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Set environment variables
for (const key in envConfig) {
  process.env[key] = envConfig[key];
}

module.exports = {
  PORT: process.env.PORT || 8000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/single-task',
  JWT_SECRET: process.env.JWT_SECRET || '5421fdg5421gf5421gf5421gf54544112121gf',
  // Add other environment variables here
};
