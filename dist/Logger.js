'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Config = require('./Config');

var _Config2 = _interopRequireDefault(_Config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_winston2.default.setLevels({
  silly: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4
});

_winston2.default.addColors({
  silly: 'magenta',
  debug: 'green',
  info: 'cyan',
  warn: 'yellow',
  error: 'red'
});

_winston2.default.remove(_winston2.default.transports.Console);

_winston2.default.add(_winston2.default.transports.Console, {
  level: 'error',
  colorize: true
});

/**
 * get logger for specific module
 * @param  {string} module module tag will be appended to logging line
 * @return {logger} logger instance
 */

_winston2.default.getLogger = function (module, suffix) {

  if (!module) {
    module = 'generic';
  } else if (typeof module !== 'string') {
    module = _path2.default.basename(module.filename);
  }
  var sysConf = _Config2.default.getLogConfig(module);
  var rootDir = process.env.PAXOS_ROOT_DIR || _path2.default.join(__dirname, '../');
  if (suffix) {
    suffix = ' ' + suffix;
  } else {
    suffix = '';
  }

  var defaults = {
    'console': {
      level: 'error',
      colorize: true,
      label: module + suffix
    },
    'file': {
      'filename': _path2.default.join(rootDir, './logs/output.log')
    }
  };
  var tmp = _lodash2.default.cloneDeep(sysConf);
  if (tmp && tmp.console && tmp.console.label) {
    tmp.console.label = tmp.console.label + suffix;
  }
  if (suffix.length) {
    module = module + suffix;
  }
  var conf = _lodash2.default.assign(defaults, tmp);
  _winston2.default.loggers.add(module, conf);
  return _winston2.default.loggers.get(module);
};

// export
// module.exports = winston;
exports.default = _winston2.default;