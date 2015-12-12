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

var Client = (function () {
  function Client(options) {
    _classCallCheck(this, Client);

    this.id = options.id;
  }

  _createClass(Client, [{
    key: 'getRequest',
    value: function getRequest(data) {
      return new _Message2.default.Request(data, this.id);
    }
  }]);

  return Client;
})();

exports.default = Client;