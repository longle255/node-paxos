var path = require('path');

require('babel/register');
require('./src/config/log')(path.join(__dirname, 'config/logger.json'));


var winston = require('winston');

// Populate variable
global.NodePaxos = {
  rootDir: __dirname,
  srcDir: path.join(__dirname, 'src'),
  configDir: path.join(__dirname, 'config'),
  logger: winston
};

require('./src/index.js');
