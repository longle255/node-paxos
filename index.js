#!/usr/bin/env node

require('babel/register');

var program = require('commander'),
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash'),
  Promise = require('bluebird');

program
  .version('0.0.1')
  .option('-r, --role <node role>', 'Role of the process')
  .parse(process.argv);

if (!program.role) {
  program.help();
}


var configDir = path.join(__dirname, './config');
var config = {};
fs.readdirSync(configDir).forEach(function(file) {
  if (/\.json$/.test(file)) {
    config[path.basename(file, '.json')] = require(configDir + '/' + file);
  }
});

global.NodePaxos = {
  rootDir: __dirname,
  srcDir: path.join(__dirname, './src'),
  configDir: configDir,
  config: config,
  getConfig: (type, module) => {
    if (_.isArray(config[type])) {
      return config[type][_.findIndex(config[type], 'module', module)];
    } else {
      return config[type][module];
    }
  }
};

// assign global variable
global.Promise = Promise;
global._ = _;

require('./src/config/log');
require('./src/Maestro.js')(program);
