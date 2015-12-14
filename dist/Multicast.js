'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dgram = require('dgram');

var _dgram2 = _interopRequireDefault(_dgram);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = undefined;

var Receiver = (function () {
  function Receiver(options) {
    _classCallCheck(this, Receiver);

    logger = _Logger2.default.getLogger(module, options.id);
    logger.debug('starting RECEIVER component ', options);
    this.address = options.address;
    this.port = options.port;
    this.server = _dgram2.default.createSocket({
      type: 'udp4',
      reuseAddr: true
    });
    this.processId = options.id;
    this.isRunning = false;
    this.handlers = {};
    this.isDirectChannel = options.isDirectChannel || false;
  }

  _createClass(Receiver, [{
    key: 'addListener',
    value: function addListener(messageType, handler) {
      this.handlers[messageType] = handler;
    }
  }, {
    key: 'start',
    value: function start() {
      var _this = this;

      this.server.on('error', function (err) {
        logger.error('server error:\n' + err.stack);
        _this.server.close();
      });

      this.server.on('message', function (msg, rinfo) {
        logger.debug('got message ' + msg + ' from group ' + rinfo.address + ':' + rinfo.port);
        var message = msg.toString('utf8');
        try {
          message = JSON.parse(message);
        } catch (e) {
          logger.error('can\'t parse message ' + message);
          return;
        }
        if (!message.length || message.length <= 1) {
          logger.error('not paxos message type');
          return;
        }
        if (!_this.handlers[message[0]]) {
          logger.error('no handler for message type ' + message[0]);
          return;
        }
        _this.handlers[message[0]](message, rinfo);
      });

      return new Promise(function (resolve, reject) {
        try {
          _this.server.bind(_this.port, function () {
            logger.debug('RECEIVER bind success on ' + _this.address + ':' + _this.port);
            if (!_this.isDirectChannel) {
              _this.server.addMembership(_this.address);
            }
            _this.isRunning = true;
            resolve();
          });
        } catch (e) {
          reject(e);
        }
      });
    }
  }, {
    key: 'stop',
    value: function stop() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (!_this2.isRunning) {
          return resolve();
        }
        _this2.server.close(function (err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    }
  }]);

  return Receiver;
})();

var Sender = (function () {
  function Sender(options) {
    _classCallCheck(this, Sender);

    logger = _Logger2.default.getLogger(module, options.id);
    logger.debug('starting SENDER component ', options);
    this.address = options.address;
    this.port = options.port;
    this.processId = options.id;
    this.server = _dgram2.default.createSocket({
      type: 'udp4',
      reuseAddr: true
    });
    this.isRunning = false;
  }

  _createClass(Sender, [{
    key: 'start',
    value: function start() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        try {
          _this3.server.bind(_this3.port, function () {
            logger.debug('SENDER bind success on ' + _this3.address + ':' + _this3.port);
            _this3.server.setTTL(128);
            _this3.server.setBroadcast(true);
            _this3.server.setMulticastTTL(128);
            _this3.server.setMulticastLoopback(true);
            _this3.isRunning = true;
            resolve();
          });
        } catch (e) {
          reject(e);
        }
      });
    }
  }, {
    key: 'stop',
    value: function stop() {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        if (!_this4.isRunning) {
          return resolve();
        }
        _this4.server.close(function (err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    }
  }, {
    key: 'send',
    value: function send(dest, message) {
      if (!this.isRunning) {
        logger.error('service is not running');
        throw new Error('service is not running');
      }
      if (arguments.length < 2 || !dest || !message) {
        logger.error('requires 2 arguments');
        return;
        // throw new Error('requires 2 arguments');
      }
      if (typeof message.serialize === 'function') {
        message = message.serialize();
      }
      var serializedMessage = new Buffer(JSON.stringify(message));
      this.server.send(serializedMessage, 0, serializedMessage.length, dest.port, dest.address);
      logger.debug('send message ' + message + ' to the destination ' + dest.address + ':' + dest.port);
    }
  }]);

  return Sender;
})();

exports.default = {
  Sender: Sender, Receiver: Receiver
};