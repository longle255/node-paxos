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
  level: 'info',
  colorize: true
});

/**
 * get logger for specific module
 * @param  {string} module module tag will be appended to logging line
 * @return {logger} logger instance
 */

winston.getLogger = module => {
  if (!module) {
    module = 'generic';
  } else if (typeof module !== 'string') {
    module = path.basename(module.filename);
  }
  let sysConf = SystemConfig.getLogConfig(module);
  let rootDir = process.env.PAXOS_ROOT_DIR || path.join(__dirname, '../');
  let defaults = {
    'console': {
      level: 'debug',
      colorize: true,
      label: module
    },
    'file': {
      'filename': path.join(rootDir, './logs/output.log')
    }
  };
  let conf = _.assign(defaults, sysConf);
  winston.loggers.add(module, conf);
  return winston.loggers.get(module);
};

// export
module.exports = winston;
