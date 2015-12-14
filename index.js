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
  .option('-m, --mode <running mode>', 'running mode: demo, benchmark, test')
  .option('-d, --delay <milisecond>', 'delay between each message sent from clients. go together with mode=benchmark,demo')
  .option('-c, --conf <config file>', 'multicast config file')
  .option('-l, --log <level>', 'logging level: debug, info, error')
  .parse(process.argv);

if (!program.role) {
  program.help();
  process.exit(0);
}

if (program.mode === 'demo' && !program.delay) {
  program.help();
  process.exit(0);
}

if (program.conf) {
  process.env.PAXOS_MULTICAST = program.conf;
}

if (program.log) {
  process.env.PAXOS_LOGGING = program.log;
}

if (program.mode) {
  process.env.PAXOS_MODE = program.mode;
} else {
  process.env.PAXOS_MODE = 'test';
}

if (program.delay) {
  process.env.PAXOS_DELAY = program.delay;
} else {
  process.env.PAXOS_DELAY = 1;
}

var Paxos;
if (process.env.USER === 'longle') {
  Paxos = require('./src/Paxos.js');
} else {
  Paxos = require('./dist/Paxos.js');
}

Paxos.default(program);
