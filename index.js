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

require('./src/Paxos.js')(program);
