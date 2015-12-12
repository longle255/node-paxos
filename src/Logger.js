import winston from 'winston';
import path from 'path';
import _ from 'lodash';
import SystemConfig from './Config';

winston.setLevels({
  silly: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4
});

winston.addColors({
  silly: 'magenta',
  debug: 'green',
  info: 'cyan',
  warn: 'yellow',
  error: 'red'
});

winston.remove(winston.transports.Console);

winston.add(winston.transports.Console, {
  level: 'error',
  colorize: true
});

/**
 * get logger for specific module
 * @param  {string} module module tag will be appended to logging line
 * @return {logger} logger instance
 */

winston.getLogger = (module, suffix) => {

  if (!module) {
    module = 'generic';
  } else if (typeof module !== 'string') {
    module = path.basename(module.filename);
  }
  let sysConf = SystemConfig.getLogConfig(module);
  let rootDir = process.env.PAXOS_ROOT_DIR || path.join(__dirname, '../');
  if (suffix) {
    suffix = ` ${suffix}`;
  } else {
    suffix = '';
  }

  let defaults = {
    'console': {
      level: 'error',
      colorize: true,
      label: module + suffix
    },
    'file': {
      'filename': path.join(rootDir, './logs/output.log')
    }
  };
  let tmp = _.cloneDeep(sysConf);
  if (tmp && tmp.console && tmp.console.label) {
    tmp.console.label = tmp.console.label + suffix;
  }
  if (suffix.length) {
    module = module + suffix;
  }
  let conf = _.assign(defaults, tmp);
  winston.loggers.add(module, conf);
  return winston.loggers.get(module);
};

// export
// module.exports = winston;
export default winston;
