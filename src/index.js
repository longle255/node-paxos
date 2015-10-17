import path from 'path';
import fs from 'fs';
import logger from './config/log';
import _ from 'lodash';
import Promise from 'bluebird';

let configDir = path.join(__dirname, '../', 'config');
let config = {};
fs.readdirSync(configDir).forEach(function(file) {
  if (/\.json$/.test(file)) {
    config[path.basename(file, '.json')] = require(configDir + '/' + file);
  }
});

// Populate variable
global.NodePaxos = {
  rootDir: path.join(__dirname, '../'),
  srcDir: path.join(__dirname),
  configDir: configDir,
  logger: logger(config.logger),
  config: config,
  getConfig: (type, module) => {
    return config[type][_.findIndex(config[type], 'module', module)];
  }
};

// assign global variable
global.Promise = Promise;
global._ = _;


NodePaxos.logger.info('App start');
