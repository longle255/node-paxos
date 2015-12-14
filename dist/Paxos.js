'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _AcceptorNode = require('./AcceptorNode');

var _AcceptorNode2 = _interopRequireDefault(_AcceptorNode);

var _ProposerNode = require('./ProposerNode');

var _ProposerNode2 = _interopRequireDefault(_ProposerNode);

var _LearnerNode = require('./LearnerNode');

var _LearnerNode2 = _interopRequireDefault(_LearnerNode);

var _ClientNode = require('./ClientNode');

var _ClientNode2 = _interopRequireDefault(_ClientNode);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _Utils = require('./Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _Config = require('./Config');

var _Config2 = _interopRequireDefault(_Config);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (opt) {
  var logger = _Logger2.default.getLogger(module);
  var multiStart = true;
  var id = -1;
  var delay = parseInt(opt.delay, 10);
  var file = opt.file;
  if (opt.id) {
    id = opt.id;
    multiStart = false;
  }
  switch (opt.role) {
    case 'acceptors':
      var acceptors = [];
      var aMul = _Config2.default.getMulticastGroup('acceptors');
      var aIndex = 0;
      var nodeCount = 0;
      if (multiStart) {
        nodeCount = _Config2.default.getGroupCount('acceptors');
      } else {
        nodeCount = 1;
      }
      for (var i = 0; i < nodeCount; i++) {
        var options = {
          multicast: aMul,
          id: 'a-' + (multiStart ? aIndex++ : id)
        };
        var a = new _AcceptorNode2.default(options);
        acceptors.push(a.start());
      }
      Promise.all(acceptors).then(function () {
        logger.info('All acceptor started');
      });
      break;
    case 'learners':
      var learners = [];
      var lMul = _Config2.default.getMulticastGroup('learners');
      var lIndex = 0;
      if (multiStart) {
        nodeCount = _Config2.default.getGroupCount('learners');
      } else {
        nodeCount = 1;
      }
      for (var i = 0; i < nodeCount; i++) {
        var options = {
          multicast: lMul,
          quorum: _Config2.default.getAcceptorQuorum(),
          calRate: process.env.PAXOS_MODE === 'benchmark',
          minProposalId: _Config2.default.getMinProposalId(),
          id: 'l-' + (multiStart ? lIndex++ : id)
        };
        var l = new _LearnerNode2.default(options);
        learners.push(l.start());
      }
      Promise.all(learners).then(function () {
        logger.info('All learner started');
      });
      break;
    case 'proposers':
      var proposers = [];
      var pMul = _Config2.default.getMulticastGroup('proposers');
      var pIndex = 0;
      if (multiStart) {
        nodeCount = _Config2.default.getGroupCount('proposers');
      } else {
        nodeCount = 1;
      }
      for (var i = 0; i < nodeCount; i++) {
        var options = {
          multicast: pMul,
          acceptorQuorum: _Config2.default.getAcceptorQuorum(),
          proposerQuorum: _Config2.default.getProposerQuorum(),
          minProposalId: _Config2.default.getMinProposalId(),
          id: 'p-' + (multiStart ? pIndex++ : id)
        };
        var c = new _ProposerNode2.default(options);
        proposers.push(c.start());
      }

      Promise.all(proposers).then(function () {
        logger.info('All coordinator started');
      });
      break;
    case 'clients':
      var clientsStarting = [];
      var clients = [];
      var cMul = _Config2.default.getMulticastGroup('clients');
      var cIndex = 0;
      if (multiStart) {
        nodeCount = _Config2.default.getGroupCount('clients');
      } else {
        nodeCount = 1;
      }
      for (var i = 0; i < nodeCount; i++) {
        var options = {
          multicast: cMul,
          id: 'c-' + (multiStart ? cIndex++ : id)
        };
        var c = new _ClientNode2.default(options);
        clients.push(c);
        clientsStarting.push(c.start());
      }
      Promise.all(clientsStarting).then(function () {
        logger.info('All client started started');
        _lodash2.default.each(clients, function (client) {
          if (process.env.PAXOS_MODE === 'demo' || process.env.PAXOS_MODE === 'benchmark') {
            var x = 0;
            setInterval(function () {
              if (process.env.PAXOS_MODE === 'benchmark') {
                x = Date.now();
              } else {
                x += 1;
                console.log(x);
              }
              client.request(x);
            }, delay);
          } else {
            var readline;
            var rl;

            (function () {
              readline = require('readline');
              rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                terminal: false
              });

              var count = 0;
              rl.on('line', function (line) {
                if (line.length) {
                  setTimeout(function () {
                    client.request(line);
                  }, 2 * ++count);
                }
              });
            })();
          }
        });
      });
      break;
    default:
      break;
  }
};