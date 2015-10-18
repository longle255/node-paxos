import winston from 'winston';
import path from 'path';

winston.setLevels({
  debug: 0,
  info: 1,
  silly: 2,
  warn: 3,
  error: 4
});

winston.addColors({
  debug: 'green',
  info: 'cyan',
  silly: 'magenta',
  warn: 'yellow',
  error: 'red'
});

winston.remove(winston.transports.Console);

winston.add(winston.transports.Console, {
  level: 'debug',
  colorize: true
});

/**
 * get logger for specific module
 * @param  {string} module module tag will be appended to logging line
 * @return {logger} logger instance
 */
winston.getLogger = module => {
  if (typeof module === 'string') {
    if (winston.loggerConfigs[module]) {
      return winston.loggers.get(module);
    }
  } else {
    module = path.basename(module.filename);
  }
  winston.loggers.add(module, {
    'console': {
      level: process.env.PAXOS_LOG || 'info',
      colorize: true,
      label: module
    },
    'file': {
      'filename': './logs/output.log'
    }
  });
  return winston.loggers.get(module);
};

winston.loggerConfigs = {};
_.each(NodePaxos.config.logger, config => {
  winston.loggerConfigs[config.module] = config;
  winston.loggers.add(config.module, config.options);
});

NodePaxos.logger = winston;
