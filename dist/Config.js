'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _Utils = require('./Utils');

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SystemConfig = (function () {
  function SystemConfig(configDir) {
    _classCallCheck(this, SystemConfig);

    var config = {};
    _fs2.default.readdirSync(configDir).forEach(function (file) {
      if (/\.yml$/.test(file)) {
        config[_path2.default.basename(file, '.yml')] = _jsYaml2.default.safeLoad(_fs2.default.readFileSync(configDir + '/' + file, 'utf8'));
      }
    });
    this.config = config;
    this.hosts = _lodash2.default.union(config.system.proposers, config.system.acceptors, config.system.learners, config.system.clients);
    if (process.env.PAXOS_MULTICAST) {
      var list = _Utils2.default.readFileToArraySync(process.env.PAXOS_MULTICAST);
      var multicast = [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].length) {
          var line = list[i].trim().replace(/\s\s+/g, ' ');
          line = line.split(' ');
          var conf = {
            group: line[0],
            address: line[1],
            port: line[2]
          };
          multicast.push(conf);
        }
      }
      this.config.multicast = multicast;
    }
  }

  _createClass(SystemConfig, [{
    key: 'getNode',
    value: function getNode(id) {
      return _lodash2.default.find(this.hosts, {
        id: id
      });
    }
  }, {
    key: 'getGroup',
    value: function getGroup(group) {
      return this.config.system[group];
    }
  }, {
    key: 'getGroupCount',
    value: function getGroupCount(group) {
      return this.config.system[group];
    }
  }, {
    key: 'getMulticastGroup',
    value: function getMulticastGroup(group) {
      return _lodash2.default.find(this.config.multicast, {
        group: group
      });
    }
  }, {
    key: 'getLogConfig',
    value: function getLogConfig(moduleName) {
      return _lodash2.default.result(_lodash2.default.find(this.config.logger, {
        module: moduleName
      }), 'options');
    }
  }, {
    key: 'getAcceptorQuorum',
    value: function getAcceptorQuorum() {
      return this.config.system.acceptorQuorum;
    }
  }, {
    key: 'getProposerQuorum',
    value: function getProposerQuorum() {
      return this.config.system.proposerQuorum;
    }
  }, {
    key: 'getNodeByGroup',
    value: function getNodeByGroup(group, id) {
      return this.config.system[group][id];
    }
  }, {
    key: 'getRootDir',
    value: function getRootDir() {
      return process.env.PAXOS_ROOT_DIR || _path2.default.join(__dirname, '../');
    }
  }, {
    key: 'getMinProposalId',
    value: function getMinProposalId() {
      return this.config.system.minProposalId;
    }
  }]);

  return SystemConfig;
})();

exports.default = new SystemConfig(_path2.default.join(__dirname, '../config'));