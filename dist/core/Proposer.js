'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Message = require('./Message');

var _Message2 = _interopRequireDefault(_Message);

var _Logger = require('../Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Coordinator = (function () {
  function Coordinator(options) {
    _classCallCheck(this, Coordinator);

    this.id = options.id;
    this.logger = _Logger2.default.getLogger(module, this.id);
    this.requestQueue = [];
    this.catchUpQueue = [];
    // this.isLeader = false;
    // this.leader = null;
    // this.votedFor = null;
    // this.votedTerm = null;
    // this.electionTerm = 0;
    // this.voteCount = 0;

    this.proposeId = options.minProposalId - 1;
    this.backlog = {};
    this.acceptorQuorum = options.acceptorQuorum;
    // this.state = PROPOSER_STATE.FOLLOWER;
  }

  _createClass(Coordinator, [{
    key: 'addRequest',
    value: function addRequest(message) {
      this.requestQueue.push(message);
    }
  }, {
    key: 'getNextRequest',
    value: function getNextRequest() {
      return this.requestQueue.shift();
    }
  }, {
    key: 'getNextPrepare',
    value: function getNextPrepare(proposeId) {
      if (!proposeId) {
        this.proposeId++;
        return new _Message2.default.Prepare(this.proposeId, 0, this.id);
      } else {
        // propose a catch up id
        if (this.backlog[proposeId]) {
          this.backlog[proposeId].promisedAcceptors = [];
        }
        return new _Message2.default.Prepare(proposeId, 0, this.id);
      }
    }
  }, {
    key: 'getAccept',
    value: function getAccept(message) {
      // store promise of all acceptor
      var msg = this.backlog[message.proposeId] = this.backlog[message.proposeId] || {
        proposeId: message.proposeId,
        votedRound: message.votedRound,
        votedValue: message.votedValue,
        round: message.round
      };
      // save acceptor id to the array of promised acceptors of that promiseid
      if (msg.promisedAcceptors && msg.promisedAcceptors.indexOf(message.acceptorId) < 0) {
        msg.promisedAcceptors.push(message.acceptorId);
      } else {
        msg.promisedAcceptors = [message.acceptorId];
      }
      // update votedRound and votedValue regarding to new value in the promise message
      if (msg.round === message.round) {
        if (msg.votedRound < message.votedRound) {
          msg.votedRound = message.votedRound;
          msg.votedValue = message.votedValue;
        }
      } else {
        this.logger.warn('what is going on here? how can I get here?');
      }
      // check if acceptorQuorum of acceptor promise
      if (msg.promisedAcceptors.length >= this.acceptorQuorum) {
        // set votedValue for the first round
        if (!msg.votedValue) {
          var request = this.getNextRequest();
          msg.votedValue = request.data;
        }
        return new _Message2.default.Accept(msg.proposeId, msg.round, msg.votedValue, this.id);
      }
    }
  }]);

  return Coordinator;
})();

exports.default = Coordinator;