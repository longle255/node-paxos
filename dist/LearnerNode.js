'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Multicast = require('./Multicast');

var _Multicast2 = _interopRequireDefault(_Multicast);

var _Learner2 = require('./core/Learner');

var _Learner3 = _interopRequireDefault(_Learner2);

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

var LearnerNode = (function (_Learner) {
  _inherits(LearnerNode, _Learner);

  function LearnerNode(options) {
    _classCallCheck(this, LearnerNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LearnerNode).call(this, options));

    _this.logger = _Logger2.default.getLogger(module, _this.id);
    _this.multicast = {
      // listen on channel of learners
      receiver: new _Multicast2.default.Receiver(options.multicast),
      // broad cast message to coordinator channel
      sender: new _Multicast2.default.Sender(options.multicast)
    };
    _this.multicast.receiver.addListener(_Message2.default.TYPE.ACCEPTOR.ACCEPTED, _this.onAccepted.bind(_this));
    _this.acceptedCount = 0;
    _this.calRate = options.calRate || false;
    _this.checkCatchUp = false;
    _this.runningCatchUp = false;
    _this.httpServer = null;

    _this.latencyAggregate = 0;
    // this.setupHttpServer();
    return _this;
  }

  _createClass(LearnerNode, [{
    key: 'start',
    value: function start() {
      var _this2 = this;

      this.logger.debug('attempt to start Learner' + this.id);
      var tmp = 0;
      if (this.calRate) {
        this.rateInterval = setInterval(function () {
          var rate = _this2.acceptedCount - tmp;
          var latency = _this2.latencyAggregate / rate;
          _this2.logger.info('rate ' + rate + ' proposed value, at latency ' + latency.toFixed(2));
          tmp = _this2.acceptedCount;
          _this2.latencyAggregate = 0;
        }, 1000);
      }
      return Promise.all([this.multicast.receiver.start(), this.multicast.sender.start()]);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.logger.debug('attempt to stop Learner' + this.id);
      if (this.rateInterval) {
        clearInterval(this.rateInterval);
      }
      return Promise.all([this.multicast.receiver.stop(), this.multicast.sender.stop()]);
    }
  }, {
    key: 'onAccepted',
    value: function onAccepted(message, source) {
      message = _Message2.default.Accepted.parse(message);
      this.logger.debug('receive accepted message ' + JSON.stringify(message) + ' from ' + source.address + ':' + source.port);
      var decision = this.getDecide(message);
      if (decision) {
        if (!this.checkCatchUp) {
          this.runCatchUp();
        }
        if (this.runningCatchUp && this.getMissingProposals().length === 0) {
          // finish catching up
          this.runningCatchUp = false;
          for (var i = this.minProposalId; i <= this.currentMaxProposalId; i++) {
            if (process.env.PAXOS_MODE === 'test') {
              console.log(this.delivered[i]);
            }
          }
        } else if (!this.runningCatchUp) {
          if (process.env.PAXOS_MODE === 'test') {
            console.log(decision.value);
          }
        }
        this.logger.debug('decision ' + JSON.stringify(decision));
        if (this.calRate) {
          this.acceptedCount += 1;
          this.latencyAggregate += Date.now() - parseInt(decision.value, 10);
        }
      }
    }
  }, {
    key: 'runCatchUp',
    value: function runCatchUp() {
      this.checkCatchUp = true;
      var missingProposals = this.getMissingProposals();
      if (missingProposals.length) {
        this.runningCatchUp = true;
        this.logger.debug('have to run catching up with those missing proposals ' + missingProposals);
        var dest = _Config2.default.getMulticastGroup('proposers');
        var message = new _Message2.default.CatchUp(missingProposals);
        this.multicast.sender.send(dest, message);
      }
    }
  }]);

  return LearnerNode;
})(_Learner3.default);

exports.default = LearnerNode;