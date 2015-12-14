'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Multicast = require('./Multicast');

var _Multicast2 = _interopRequireDefault(_Multicast);

var _Proposer2 = require('./core/Proposer');

var _Proposer3 = _interopRequireDefault(_Proposer2);

var _Message = require('./core/Message');

var _Message2 = _interopRequireDefault(_Message);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _Config = require('./Config');

var _Config2 = _interopRequireDefault(_Config);

var _Utils = require('./Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PROPOSER_STATE = {
  CANDIDATE: 0,
  FOLLOWER: 1,
  LEADER: 2
};
var HEARTBEAT_TIMEOUT = 500 * process.env.PAXOS_DELAY;
var HEARTBEAT_INTERVAL = 200 * process.env.PAXOS_DELAY;
var MIN_ELECTION_LATENCY = 50 * process.env.PAXOS_DELAY;
var MAX_ELECTION_LATENCY = 150 * process.env.PAXOS_DELAY;

var ProposerNode = (function (_Proposer) {
  _inherits(ProposerNode, _Proposer);

  function ProposerNode(options) {
    _classCallCheck(this, ProposerNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ProposerNode).call(this, options));

    _this.proposerQuorum = options.proposerQuorum;
    _this.address = options.address;
    _this.port = options.port;
    _this.id = options.multicast.id = options.id;
    _this.logger = _Logger2.default.getLogger(module, _this.id);
    _this.multicast = {
      // listen on channel of acceptors
      receiver: new _Multicast2.default.Receiver(options.multicast),
      // broad cast message to coordinator channel
      sender: new _Multicast2.default.Sender(options.multicast)
    };
    // this.socket = {
    //   receiver: new Multicast.Receiver({
    //     address: this.address,
    //     port: this.port,
    //     isDirectChannel: true
    //   })
    // };
    _this.multicast.receiver.addListener(_Message2.default.TYPE.CLIENT.REQUEST, _this.onRequest.bind(_this));
    _this.multicast.receiver.addListener(_Message2.default.TYPE.ACCEPTOR.PROMISE, _this.onPromise.bind(_this));
    _this.multicast.receiver.addListener(_Message2.default.TYPE.LEARNER.CATCH_UP, _this.onLearnerCatchUp.bind(_this));

    _this.multicast.receiver.addListener(_Message2.default.TYPE.PROPOSER.REQUEST_VOTE, _this.onRequestVote.bind(_this));
    _this.multicast.receiver.addListener(_Message2.default.TYPE.PROPOSER.REQUEST_VOTE_REPLY, _this.onRequestVoteReply.bind(_this));
    _this.multicast.receiver.addListener(_Message2.default.TYPE.PROPOSER.HEARTBEAT, _this.onHeartbeat.bind(_this));

    _this.electionTimeoutMs = _Utils2.default.getRandomInt(MIN_ELECTION_LATENCY, MAX_ELECTION_LATENCY);
    _this.electionInterval = null;
    _this.heartbeatInterval = null;
    _this.electionTerm = 0;
    _this.state = PROPOSER_STATE.FOLLOWER;
    _this.voteGranted = [];
    _this.votedFor = null;
    return _this;
  }

  _createClass(ProposerNode, [{
    key: 'isLeader',
    value: function isLeader() {
      return this.state === PROPOSER_STATE.LEADER;
    }
  }, {
    key: 'onHeartbeat',
    value: function onHeartbeat(message, source) {
      message = _Message2.default.Heartbeat.parse(message);
      this.logger.silly('my leader is ' + this.votedFor + ' receive heartbeat message ' + JSON.stringify(message) + ' from ' + source.address + ':' + source.port);

      if (!this.heartbeatTimeout) {
        this.logger.debug('update my data, leader now is ' + message.proposerId);
        this.votedFor = message.proposerId;
        this.electionTerm = message.electionTerm;
      }

      if (this.electionInterval) {
        clearInterval(this.electionInterval);
      }
      if (message.proposerId === this.votedFor) {
        this.runHeartbeatCheck();
      }
    }
  }, {
    key: 'onRequestVote',
    value: function onRequestVote(message, source) {
      message = _Message2.default.RequestVote.parse(message);

      this.logger.debug('receive request vote message ' + JSON.stringify(message) + ' from ' + source.address + ':' + source.port);
      if (this.electionTerm < message.electionTerm) {
        this.resetElection(message.electionTerm);
      }
      var granted = false;
      if (this.electionTerm === message.electionTerm) {
        if (!this.votedFor) {
          this.votedFor = message.proposerId;
          granted = true;
          this.logger.debug('voted for ' + message.proposerId + ' to be leader');
        }
      }
      this.runHeartbeatCheck();
      var reply = new _Message2.default.RequestVoteReply(this.electionTerm, message.proposerId, granted, this.id);
      var dest = _Config2.default.getMulticastGroup('proposers');
      this.logger.debug('sending request vote reply message ' + JSON.stringify(reply));
      this.multicast.sender.send(dest, reply);
    }
  }, {
    key: 'onRequestVoteReply',
    value: function onRequestVoteReply(message, source) {
      message = _Message2.default.RequestVoteReply.parse(message);
      if (message.proposerId === this.id) {
        this.logger.debug('receive request vote reply message ' + JSON.stringify(message) + ' from ' + source.address + ':' + source.port);
        if (this.electionTerm < message.electionTerm) {
          this.resetElection(message.electionTerm);
        }
        if (this.electionTerm === message.electionTerm && message.granted) {
          this.voteGranted.push(message.from);
        }
        this.logger.debug('voteGranted from ' + JSON.stringify(this.voteGranted));
        if (!this.isLeader() && this.voteGranted.length >= this.proposerQuorum) {
          this.becomeLeader();
        }
      }
    }
  }, {
    key: 'becomeLeader',
    value: function becomeLeader() {
      this.logger.debug('I\'m leader. Start serving now');
      this.state = PROPOSER_STATE.LEADER;
      if (this.electionInterval) {
        clearInterval(this.electionInterval);
      }
      this.runHeartbeat();
    }
  }, {
    key: 'resetElection',
    value: function resetElection(electionTerm) {
      this.electionTerm = electionTerm;
      this.state = PROPOSER_STATE.FOLLOWER;
      this.votedFor = null;
      this.voteGranted = [];
      if (this.electionInterval) {
        clearInterval(this.electionInterval);
      }
    }
  }, {
    key: 'runElectionTimeout',
    value: function runElectionTimeout() {
      var _this2 = this;

      this.electionInterval = setInterval(function () {
        _this2.requestVote();
      }, this.electionTimeoutMs);
    }
  }, {
    key: 'runHeartbeatCheck',
    value: function runHeartbeatCheck() {
      var _this3 = this;

      if (this.heartbeatTimeout) {
        clearTimeout(this.heartbeatTimeout);
      }
      this.heartbeatTimeout = setTimeout(function () {
        _this3.logger.debug('leader ' + _this3.votedFor + ' is down, running my election term');
        _this3.runElectionTimeout();
      }, HEARTBEAT_TIMEOUT);
    }
  }, {
    key: 'runHeartbeat',
    value: function runHeartbeat() {
      var _this4 = this;

      this.heartbeatInterval = setInterval(function () {
        var message = new _Message2.default.Heartbeat(_this4.electionTerm, _this4.id);
        var dest = _Config2.default.getMulticastGroup('proposers');
        _this4.logger.silly('sending heartbeat message ' + JSON.stringify(message));
        _this4.multicast.sender.send(dest, message);
      }, HEARTBEAT_INTERVAL);
    }
  }, {
    key: 'start',
    value: function start() {
      this.logger.debug('attemp to start Proposer ' + this.id);
      this.runElectionTimeout();
      return Promise.all([this.multicast.receiver.start(), this.multicast.sender.start()]);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.logger.debug('attemp to stop Proposer ' + this.id);
      return Promise.all([this.multicast.receiver.stop(), this.multicast.sender.stop()]);
    }
  }, {
    key: 'requestVote',
    value: function requestVote() {
      this.state = PROPOSER_STATE.CANDIDATE;
      var message = new _Message2.default.RequestVote(this.electionTerm + 1, this.id);
      var dest = _Config2.default.getMulticastGroup('proposers');
      this.logger.debug('sending request vote message ' + JSON.stringify(message));
      this.multicast.sender.send(dest, message);
    }
  }, {
    key: 'onRequest',
    value: function onRequest(message, source) {
      if (this.isLeader()) {
        message = _Message2.default.Request.parse(message);
        this.logger.debug('receive request message ' + JSON.stringify(message) + ' from ' + source.address + ':' + source.port);
        this.addRequest(message);
        this.processQueue();
      }
    }
  }, {
    key: 'processQueue',
    value: function processQueue() {
      var _this5 = this;

      if (this.requestQueue.length > 0) {
        process.nextTick(function () {
          var prepare = _this5.getNextPrepare();
          var dest = _Config2.default.getMulticastGroup('acceptors');
          _this5.logger.debug('sending prepare message ' + JSON.stringify(prepare) + ' to ' + JSON.stringify(dest));
          _this5.multicast.sender.send(dest, prepare);
        });
      }
    }
  }, {
    key: 'onPromise',
    value: function onPromise(message, source) {
      message = _Message2.default.Promise.parse(message);
      if (message.proposerId === this.id) {
        this.logger.debug('receive promise message ' + JSON.stringify(message) + ' from ' + source.address + ':' + source.port);
        var accept = this.getAccept(message);
        if (accept) {
          // got quorum of acceptors promise
          var dest = _Config2.default.getMulticastGroup('acceptors');
          this.logger.debug('sending accept message ' + JSON.stringify(accept) + ' to ' + JSON.stringify(dest));
          this.multicast.sender.send(dest, accept);
        }
      } else {
        this.logger.debug('not interest');
      }
    }
  }, {
    key: 'onLearnerCatchUp',
    value: function onLearnerCatchUp(message, source) {
      message = _Message2.default.CatchUp.parse(message);
      if (this.isLeader()) {
        this.logger.debug('receive catch up message ' + JSON.stringify(message) + ' from learner ' + source.address + ':' + source.port);
        this.catchUpQueue = _lodash2.default.union(this.catchUpQueue, message.missingProposals);
        while (this.catchUpQueue.length > 0) {
          var prepare = this.getNextPrepare(this.catchUpQueue.shift());
          var dest = _Config2.default.getMulticastGroup('acceptors');
          this.logger.debug('sending catchup prepare message ' + JSON.stringify(prepare) + ' to ' + JSON.stringify(dest));
          this.multicast.sender.send(dest, prepare);
        }
      }
    }
  }]);

  return ProposerNode;
})(_Proposer3.default);

exports.default = ProposerNode;