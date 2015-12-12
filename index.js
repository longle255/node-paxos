#!/usr/bin/env node

if (process.env.USER === 'longle') {
  require('babel-core/register');
}


var program = require('commander'),
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash'),
  Promise = require('bluebird');

program
  .version('0.0.1')
  .option('-r, --role <node role>', 'Role of the process')
  .option('-i, --id <node id>', 'id of the process')
  .option('-v, --value <number of value>', 'number of value that each client will subbmited')
  .option('-c, --conf <config file>', 'multicast config file')
  .parse(process.argv);

if (!program.role) {
  program.help();
  process.exit(0);
}

if (program.conf) {
  process.env.PAXOS_MULTICAST = program.conf;
}

var Paxos;
if (process.env.USER === 'longle') {
  Paxos = require('./src/Paxos.js');
} else {
  Paxos = require('./dist/Paxos.js');
}

Paxos.default(program);
