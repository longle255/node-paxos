'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Multicast = require('./Multicast');

var _Multicast2 = _interopRequireDefault(_Multicast);

var _Acceptor2 = require('./core/Acceptor');

var _Acceptor3 = _interopRequireDefault(_Acceptor2);

var _Message = require('./core/Message');

var _Message2 = _interopRequireDefault(_Message);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _Config = require('./Config');

var _Config2 = _interopRequireDefault(_Config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AcceptorNode = (function (_Acceptor) {
  _inherits(AcceptorNode, _Acceptor);

  function AcceptorNode(options) {
    _classCallCheck(this, AcceptorNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AcceptorNode).call(this, options));

    _this.id = options.multicast.id = options.id;
    _this.multicast = {
      // listen on channel of acceptors
      receiver: new _Multicast2.default.Receiver(options.multicast),
      // broad cast message to coordinator channel
      sender: new _Multicast2.default.Sender(options.multicast)
    };
    _this.logger = _Logger2.default.getLogger(module, _this.id);
    _this.multicast.receiver.addListener(_Message2.default.TYPE.PROPOSER.ACCEPT, _this.onAccept.bind(_this));
    _this.multicast.receiver.addListener(_Message2.default.TYPE.PROPOSER.PREPARE, _this.onPrepare.bind(_this));
    return _this;
  }

  _createClass(AcceptorNode, [{
    key: 'start',
    value: function start() {
      this.logger.debug('attempt to start Acceptor ' + this.id);
      return Promise.all([this.multicast.receiver.start(), this.multicast.sender.start()]);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.logger.debug('attempt to stop Acceptor ' + this.id);
      return Promise.all([this.multicast.receiver.stop(), this.multicast.sender.stop()]);
    }
  }, {
    key: 'onAccept',
    value: function onAccept(message, source) {
      message = _Message2.default.Accept.parse(message);
      this.logger.debug('receive accept message ' + JSON.stringify(message) + ' from ' + source.address + ':' + source.port);
      var accepted = this.getAccepted(message);
      // var dest = SystemConfig.getNode(message.proposerId);
      var dest = _Config2.default.getMulticastGroup('learners');
      this.logger.debug('sending accepted message ' + JSON.stringify(accepted) + ' to ' + JSON.stringify(dest));
      this.multicast.sender.send(dest, accepted);
    }
  }, {
    key: 'onPrepare',
    value: function onPrepare(message, source) {
      // console.logger(`${Date.now()}-${JSON.stringify(source)}`);
      message = _Message2.default.Prepare.parse(message);
      this.logger.debug('receive prepare message ' + JSON.stringify(message) + ' from ' + source.address + ':' + source.port);
      var promise = this.getPromise(message);
      // var dest = SystemConfig.getNode(message.proposerId);
      var dest = _Config2.default.getMulticastGroup('proposers');
      this.logger.debug('sending promise message ' + JSON.stringify(promise) + ' to ' + JSON.stringify(dest));
      this.multicast.sender.send(dest, promise);
    }
  }]);

  return AcceptorNode;
})(_Acceptor3.default);

exports.default = AcceptorNode;