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

var Acceptor = (function () {
  function Acceptor(options) {
    _classCallCheck(this, Acceptor);

    this.logger = _Logger2.default.getLogger(module);
    this.id = options.id;
    this.backlog = {};
    this.promises = {};
    this.accepted = {};
  }

  _createClass(Acceptor, [{
    key: 'getAccepted',
    value: function getAccepted(message) {
      var msg = this.backlog[message.proposeId];
      if (!msg) {
        return null;
      }
      if (msg.round <= message.round) {
        msg.votedRound = message.round;
        msg.votedValue = message.value;
        msg.acceptorId = this.id;
        return new _Message2.default.Accepted(msg.proposeId, msg.votedRound, msg.votedValue, this.id);
      }
    }
  }, {
    key: 'getPromise',
    value: function getPromise(message) {
      var msg = this.backlog[message.proposeId] = this.backlog[message.proposeId] || {
        round: 0,
        votedRound: 0,
        votedValue: null,
        proposeId: message.proposeId,
        proposerId: message.proposerId
      };
      if (msg.round <= message.round) {
        msg.round = message.round;
        return new _Message2.default.Promise(msg.proposeId, msg.round, msg.votedRound, msg.votedValue, this.id, message.proposerId);
      }
      // TODO: return nack
      return null;
    }
  }]);

  return Acceptor;
})();

exports.default = Acceptor;