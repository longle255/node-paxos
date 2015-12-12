'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Logger = require('../Logger');

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = _Logger2.default.getLogger(module);

var TYPE = {
  CLIENT: { // 1->99
    REQUEST: 1
  },
  PROPOSER: { // 101-199
    PREPARE: 101,
    ACCEPT: 102,
    DECIDE: 103,
    REQUEST_VOTE: 104,
    REQUEST_VOTE_REPLY: 105,
    HEARTBEAT: 106
  },
  ACCEPTOR: { // 201-299
    PROMISE: 201,
    ACCEPTED: 202
  },
  LEARNER: { // 301-399
    RESPONSE: 301,
    CATCH_UP: 302
  }
};

function isValid(message, length, type) {
  if (message.length !== length) {
    log.debug('got invalid message length');
    return false;
  }
  if (message[0] !== type) {
    log.debug('got invalid message type');
    return false;
  }
  return true;
}

var Message = (function () {
  function Message() {
    _classCallCheck(this, Message);

    if (this.constructor === Message) {
      throw new TypeError('Cannot construct Message instances directly');
    }
  }

  _createClass(Message, [{
    key: 'serialize',
    value: function serialize() {
      throw new Error('Method is not implemented');
    }
  }], [{
    key: 'parse',
    value: function parse() {
      throw new Error('Method is not implemented');
    }
  }]);

  return Message;
})();

var RequestVote = (function (_Message) {
  _inherits(RequestVote, _Message);

  function RequestVote(electionTerm, proposerId) {
    _classCallCheck(this, RequestVote);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RequestVote).call(this));

    _this.type = TYPE.PROPOSER.REQUEST_VOTE;
    _this.proposerId = proposerId;
    _this.electionTerm = electionTerm;
    return _this;
  }

  _createClass(RequestVote, [{
    key: 'serialize',
    value: function serialize() {
      return [this.type, this.electionTerm, this.proposerId];
    }
  }], [{
    key: 'parse',
    value: function parse(message) {
      if (!isValid(message, 3, TYPE.PROPOSER.REQUEST_VOTE)) {
        return null;
      }
      return new RequestVote(message[1], message[2]);
    }
  }]);

  return RequestVote;
})(Message);

var RequestVoteReply = (function (_Message2) {
  _inherits(RequestVoteReply, _Message2);

  function RequestVoteReply(electionTerm, proposerId, granted, from) {
    _classCallCheck(this, RequestVoteReply);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(RequestVoteReply).call(this));

    _this2.type = TYPE.PROPOSER.REQUEST_VOTE_REPLY;
    _this2.proposerId = proposerId;
    _this2.granted = granted;
    _this2.electionTerm = electionTerm;
    _this2.from = from;
    return _this2;
  }

  _createClass(RequestVoteReply, [{
    key: 'serialize',
    value: function serialize() {
      return [this.type, this.electionTerm, this.proposerId, this.granted, this.from];
    }
  }], [{
    key: 'parse',
    value: function parse(message) {
      if (!isValid(message, 5, TYPE.PROPOSER.REQUEST_VOTE_REPLY)) {
        return null;
      }
      return new RequestVoteReply(message[1], message[2], message[3], message[4]);
    }
  }]);

  return RequestVoteReply;
})(Message);

var Heartbeat = (function (_Message3) {
  _inherits(Heartbeat, _Message3);

  function Heartbeat(electionTerm, proposerId) {
    _classCallCheck(this, Heartbeat);

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Heartbeat).call(this));

    _this3.type = TYPE.PROPOSER.HEARTBEAT;
    _this3.proposerId = proposerId;
    _this3.electionTerm = electionTerm;
    return _this3;
  }

  _createClass(Heartbeat, [{
    key: 'serialize',
    value: function serialize() {
      return [this.type, this.electionTerm, this.proposerId];
    }
  }], [{
    key: 'parse',
    value: function parse(message) {
      if (!isValid(message, 3, TYPE.PROPOSER.HEARTBEAT)) {
        return null;
      }
      return new RequestVoteReply(message[1], message[2]);
    }
  }]);

  return Heartbeat;
})(Message);

var Prepare = (function (_Message4) {
  _inherits(Prepare, _Message4);

  function Prepare(proposeId, round, proposerId) {
    _classCallCheck(this, Prepare);

    var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(Prepare).call(this));

    _this4.type = TYPE.PROPOSER.PREPARE;
    _this4.proposeId = proposeId;
    _this4.round = round;
    _this4.proposerId = proposerId;
    return _this4;
  }

  _createClass(Prepare, [{
    key: 'serialize',
    value: function serialize() {
      return [this.type, this.proposeId, this.round, this.proposerId];
    }
  }], [{
    key: 'parse',
    value: function parse(message) {
      if (!isValid(message, 4, TYPE.PROPOSER.PREPARE)) {
        return null;
      }
      return new Prepare(message[1], message[2], message[3]);
    }
  }]);

  return Prepare;
})(Message);

var Accept = (function (_Message5) {
  _inherits(Accept, _Message5);

  function Accept(proposeId, round, value, proposerId) {
    _classCallCheck(this, Accept);

    var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(Accept).call(this));

    _this5.type = TYPE.PROPOSER.ACCEPT;
    _this5.proposeId = proposeId;
    _this5.round = round;
    _this5.value = value;
    _this5.proposerId = proposerId;
    return _this5;
  }

  _createClass(Accept, [{
    key: 'serialize',
    value: function serialize() {
      return [this.type, this.proposeId, this.round, this.value, this.proposerId];
    }
  }], [{
    key: 'parse',
    value: function parse(message) {
      if (!isValid(message, 5, TYPE.PROPOSER.ACCEPT)) {
        return null;
      }
      return new Accept(message[1], message[2], message[3], message[4]);
    }
  }]);

  return Accept;
})(Message);

var Promise = (function (_Message6) {
  _inherits(Promise, _Message6);

  function Promise(proposeId, round, votedRound, votedValue, acceptorId, proposerId) {
    _classCallCheck(this, Promise);

    var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(Promise).call(this));

    _this6.type = TYPE.ACCEPTOR.PROMISE;
    _this6.proposeId = proposeId;
    _this6.round = round;
    _this6.votedRound = votedRound;
    _this6.votedValue = votedValue;
    _this6.acceptorId = acceptorId;
    _this6.proposerId = proposerId;
    return _this6;
  }

  _createClass(Promise, [{
    key: 'serialize',
    value: function serialize() {
      return [this.type, this.proposeId, this.round, this.votedRound, this.votedValue, this.acceptorId, this.proposerId];
    }
  }], [{
    key: 'parse',
    value: function parse(message) {
      if (!isValid(message, 7, TYPE.ACCEPTOR.PROMISE)) {
        return null;
      }
      return new Promise(message[1], message[2], message[3], message[4], message[5], message[6]);
    }
  }]);

  return Promise;
})(Message);

var Accepted = (function (_Message7) {
  _inherits(Accepted, _Message7);

  function Accepted(proposeId, votedRound, votedValue, acceptorId) {
    _classCallCheck(this, Accepted);

    var _this7 = _possibleConstructorReturn(this, Object.getPrototypeOf(Accepted).call(this));

    _this7.type = TYPE.ACCEPTOR.ACCEPTED;
    _this7.proposeId = proposeId;
    _this7.votedRound = votedRound;
    _this7.votedValue = votedValue;
    _this7.acceptorId = acceptorId;
    return _this7;
  }

  _createClass(Accepted, [{
    key: 'serialize',
    value: function serialize() {
      return [this.type, this.proposeId, this.votedRound, this.votedValue, this.acceptorId];
    }
  }], [{
    key: 'parse',
    value: function parse(message) {
      if (!isValid(message, 5, TYPE.ACCEPTOR.ACCEPTED)) {
        return null;
      }
      return new Accepted(message[1], message[2], message[3], message[4]);
    }
  }]);

  return Accepted;
})(Message);

var Request = (function (_Message8) {
  _inherits(Request, _Message8);

  function Request(data, clientId) {
    _classCallCheck(this, Request);

    var _this8 = _possibleConstructorReturn(this, Object.getPrototypeOf(Request).call(this));

    _this8.type = TYPE.CLIENT.REQUEST;
    _this8.data = data;
    _this8.clientId = clientId;
    return _this8;
  }

  _createClass(Request, [{
    key: 'serialize',
    value: function serialize() {
      return [this.type, this.data, this.clientId];
    }
  }], [{
    key: 'parse',
    value: function parse(message) {
      if (!isValid(message, 3, TYPE.CLIENT.REQUEST)) {
        return null;
      }
      return new Request(message[1], message[2]);
    }
  }]);

  return Request;
})(Message);

var Response = (function (_Message9) {
  _inherits(Response, _Message9);

  function Response(proposeId, value) {
    _classCallCheck(this, Response);

    var _this9 = _possibleConstructorReturn(this, Object.getPrototypeOf(Response).call(this));

    _this9.type = TYPE.LEARNER.RESPONSE;
    _this9.proposeId = proposeId;
    _this9.value = value;
    return _this9;
  }

  _createClass(Response, [{
    key: 'serialize',
    value: function serialize() {
      return [this.type, this.proposeId, this.value];
    }
  }], [{
    key: 'parse',
    value: function parse(message) {
      if (!isValid(message, 3, TYPE.LEARNER.RESPONSE)) {
        return null;
      }
      return new Response(message[1], message[2]);
    }
  }]);

  return Response;
})(Message);

var CatchUp = (function (_Message10) {
  _inherits(CatchUp, _Message10);

  function CatchUp(missingProposals) {
    _classCallCheck(this, CatchUp);

    var _this10 = _possibleConstructorReturn(this, Object.getPrototypeOf(CatchUp).call(this));

    _this10.type = TYPE.LEARNER.CATCH_UP;
    _this10.missingProposals = missingProposals;
    return _this10;
  }

  _createClass(CatchUp, [{
    key: 'serialize',
    value: function serialize() {
      return [this.type, this.missingProposals];
    }
  }], [{
    key: 'parse',
    value: function parse(message) {
      if (!isValid(message, 2, TYPE.LEARNER.CATCH_UP)) {
        return null;
      }
      return new CatchUp(message[1]);
    }
  }]);

  return CatchUp;
})(Message);

exports.default = {
  RequestVote: RequestVote, RequestVoteReply: RequestVoteReply, Heartbeat: Heartbeat, Prepare: Prepare, Accept: Accept, Promise: Promise, Accepted: Accepted, Request: Request, Response: Response, CatchUp: CatchUp, TYPE: TYPE
};