'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Message = require('./Message');

var _Message2 = _interopRequireDefault(_Message);

var _Logger = require('../Logger');

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = _Logger2.default.getLogger(module);

var Learner = (function () {
  function Learner(options) {
    _classCallCheck(this, Learner);

    this.id = options.id;
    this.quorum = options.quorum;
    this.backlog = {};
    this.delivered = {};
    this.minProposalId = options.minProposalId;
    this.currentMaxProposalId = options.minProposalId;
  }

  _createClass(Learner, [{
    key: 'getMissingProposals',
    value: function getMissingProposals() {
      var missingProposals = [];
      for (var i = this.minProposalId; i <= this.currentMaxProposalId; i++) {
        if (!this.delivered[i]) {
          missingProposals.push(i);
        }
      }
      return missingProposals;
    }
  }, {
    key: 'getDecide',
    value: function getDecide(message) {
      var msg = this.backlog[message.proposeId] = this.backlog[message.proposeId] || {
        isDelivered: false,
        proposeId: message.proposeId,
        value: message.votedValue,
        round: message.votedRound
      };
      if (!msg.isDelivered) {
        if (msg.round < message.votedRound) {
          msg.round = message.votedRound;
          msg.value = message.votedValue;
        } else if (msg.round === message.votedRound) {
          // save acceptor id to the array of promised acceptors of that promiseid
          if (msg.acceptedAcceptors && msg.acceptedAcceptors.indexOf(message.acceptorId) < 0) {
            msg.acceptedAcceptors.push(message.acceptorId);
          } else {
            msg.acceptedAcceptors = [message.acceptorId];
          }
          if (msg.acceptedAcceptors.length >= this.quorum) {
            msg.isDelivered = true;
            return this.deliver(msg);
          }
        }
        // discard message have lower round number
      }
    }
  }, {
    key: 'deliver',
    value: function deliver(message) {
      this.delivered[message.proposeId] = message.value;
      if (this.currentMaxProposalId < message.proposeId) {
        this.currentMaxProposalId = message.proposeId;
      }
      return new _Message2.default.Response(message.proposeId, message.value);
    }
  }]);

  return Learner;
})();

exports.default = Learner;