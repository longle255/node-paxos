'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Multicast = require('./Multicast');

var _Multicast2 = _interopRequireDefault(_Multicast);

var _Client2 = require('./core/Client');

var _Client3 = _interopRequireDefault(_Client2);

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

var logger = _Logger2.default.getLogger(module);

var ClientNode = (function (_Client) {
  _inherits(ClientNode, _Client);

  function ClientNode(options) {
    _classCallCheck(this, ClientNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ClientNode).call(this, options));

    _this.multicast = {
      // listen on channel of learners
      receiver: new _Multicast2.default.Receiver(options.multicast),
      // broad cast message to coordinator channel
      sender: new _Multicast2.default.Sender(options.multicast)
    };
    _this.multicast.receiver.addListener(_Message2.default.TYPE.LEARNER.RESPONSE, _this.onResponse.bind(_this));
    return _this;
  }

  _createClass(ClientNode, [{
    key: 'start',
    value: function start() {
      logger.debug('attempt to start Client' + this.id);
      return Promise.all([this.multicast.receiver.start(), this.multicast.sender.start()]);
    }
  }, {
    key: 'stop',
    value: function stop() {
      logger.debug('attempt to stop Client' + this.id);
      return Promise.all([this.multicast.receiver.stop(), this.multicast.sender.stop()]);
    }
  }, {
    key: 'request',
    value: function request(message) {
      var request = this.getRequest(message);
      var dest = _Config2.default.getMulticastGroup('proposers');
      logger.debug('sending request message ' + JSON.stringify(request) + ' to ' + JSON.stringify(dest));
      this.multicast.sender.send(dest, request);
    }
  }, {
    key: 'onResponse',
    value: function onResponse(message, source) {
      message = _Message2.default.Response.parse(message);
      logger.debug('receive response message ' + JSON.stringify(message) + ' from ' + source.address + ':' + source.port);
    }
  }]);

  return ClientNode;
})(_Client3.default);

exports.default = ClientNode;