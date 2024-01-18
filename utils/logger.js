const winston = require('winston');
const path = require('path');

const logsFolder = 'logs'; // Create a 'logs' folder in your project

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(logsFolder, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logsFolder, 'combined.log') }),
    ],
});

module.exports = logger;
