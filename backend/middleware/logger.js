const fs = require('fs');
const path = require('path');

// Create a write stream (in append mode) for logging
const logStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' });

const logger = (req, res, next) => {
  const { method, url, headers } = req;
  const log = `[${new Date().toISOString()}] ${method} ${url} - ${headers['user-agent']}\n`;
  console.log(log);
  logStream.write(log);
  next();
};

module.exports = logger;
